"""
backend/app/harness/context.py
--------------------------------
Token budget enforcement and context-building utilities.

All LLM features must use these utilities to keep every prompt
under the 2000-token hard limit.

Key exports:
  Budget          — configurable token budget with check()
  BudgetExceeded  — raised when budget is exceeded
  get_cached_summary(problem_id, db) -> str
  slice_code(code, language) -> str
  trim_judge_output(stdout, stderr) -> str
  estimate_tokens(text) -> int
  enforce_budget(messages, budget) -> None
"""

from __future__ import annotations

import hashlib
import json
import logging
import math
import warnings
from dataclasses import dataclass, field
from typing import Any

from app.harness.contracts import BudgetExceeded, CompletionRequest, CompletionResponse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Token budget
# ---------------------------------------------------------------------------


@dataclass
class Budget:
    """
    Configurable token budget for a single LLM call.

    Hard default: 2000 prompt tokens, 400 completion tokens.
    Raise BudgetExceeded before calling the provider if exceeded.
    """

    max_prompt_tokens: int = 2000
    max_completion_tokens: int = 400

    def check(self, tokens: int) -> None:
        """Raise BudgetExceeded if estimated token count exceeds budget."""
        if tokens > self.max_prompt_tokens:
            raise BudgetExceeded(
                f"Estimated prompt tokens {tokens} exceeds budget {self.max_prompt_tokens}. "
                "Reduce context: use get_cached_summary, slice_code, or trim_judge_output."
            )


# ---------------------------------------------------------------------------
# Token estimation
# ---------------------------------------------------------------------------


def estimate_tokens(text: str) -> int:
    """
    Rough heuristic token estimate without a tokenizer dependency.

    English prose: ~4 characters per token.
    Code / symbols: ~3 characters per token (denser).
    We use len/3 for all text as a conservative (higher) estimate.
    """
    if not text:
        return 0
    return math.ceil(len(text) / 3)


def enforce_budget(messages: list[dict[str, str]], budget: Budget) -> None:
    """
    Sum estimated tokens across all messages and raise BudgetExceeded if over limit.

    Call this immediately before every provider call.
    messages: list of {"role": ..., "content": ...} dicts.
    """
    total = sum(estimate_tokens(m.get("content", "")) for m in messages)
    # Add ~4 tokens per message for role overhead
    total += len(messages) * 4
    budget.check(total)
    logger.debug("[harness:budget] estimated=%d max=%d", total, budget.max_prompt_tokens)


# ---------------------------------------------------------------------------
# Problem summary cache
# ---------------------------------------------------------------------------


async def get_cached_summary(problem_id: str, db: Any) -> str:
    """
    Return a cached problem summary from the problem_summaries collection.

    If no cached summary exists, raises KeyError — the caller is responsible
    for generating and caching the summary via the problem_generator service.

    Never pass the full problem statement to an LLM — always use this function.
    """
    collection = db["problem_summaries"]
    doc = await collection.find_one({"problem_id": problem_id})
    if doc is None:
        raise KeyError(
            f"No cached summary for problem_id={problem_id!r}. "
            "Generate and cache a summary before calling LLM features on this problem."
        )
    return str(doc["summary"])


# ---------------------------------------------------------------------------
# Code slicing
# ---------------------------------------------------------------------------


def slice_code(code: str, language: str) -> str:
    """
    Extract only the submitted function or class from code using tree-sitter.

    This keeps LLM code-review prompts small — we never send the full file.
    Falls back to returning the original code (with a warning) if tree-sitter
    is not available or parsing fails.

    Supported languages: python, javascript, ruby, java, cpp, c
    """
    try:
        from tree_sitter import Language, Parser  # type: ignore[import]
        from tree_sitter_languages import get_language  # type: ignore[import]

        lang_map = {
            "python": "python",
            "py": "python",
            "javascript": "javascript",
            "js": "javascript",
            "ruby": "ruby",
            "rb": "ruby",
            "java": "java",
            "cpp": "cpp",
            "c++": "cpp",
            "c": "c",
        }
        lang_key = lang_map.get(language.lower())
        if lang_key is None:
            return code

        ts_lang = get_language(lang_key)
        parser = Parser()
        parser.set_language(ts_lang)
        tree = parser.parse(code.encode())

        # Collect top-level function / class definitions
        node_types = {
            "python": {"function_definition", "class_definition"},
            "javascript": {"function_declaration", "class_declaration", "arrow_function"},
            "ruby": {"method", "class"},
            "java": {"method_declaration", "class_declaration"},
            "cpp": {"function_definition", "class_specifier"},
            "c": {"function_definition"},
        }
        target_types = node_types.get(lang_key, set())

        snippets: list[str] = []
        for node in tree.root_node.children:
            if node.type in target_types:
                snippets.append(code[node.start_byte: node.end_byte])

        if snippets:
            return "\n\n".join(snippets)

        # No top-level definitions found — return first 100 lines as fallback
        lines = code.splitlines()
        return "\n".join(lines[:100])

    except Exception as exc:  # noqa: BLE001
        warnings.warn(
            f"[harness:slice_code] tree-sitter parse failed ({exc!r}), "
            "returning full code. Install tree-sitter + tree-sitter-languages.",
            stacklevel=2,
        )
        return code


# ---------------------------------------------------------------------------
# Judge output trimming
# ---------------------------------------------------------------------------


def trim_judge_output(stdout: str, stderr: str) -> str:
    """
    Trim judge stdout/stderr to stay within token budget.

    stdout: first 40 lines
    stderr: first 20 lines + last 5 lines (most errors are at the top or bottom)
    """
    def _trim_lines(text: str, first: int, last: int = 0) -> str:
        if not text:
            return ""
        lines = text.splitlines()
        if last and len(lines) > first + last:
            kept = lines[:first] + ["... (truncated) ..."] + lines[-last:]
        else:
            kept = lines[:first]
        return "\n".join(kept)

    parts: list[str] = []
    if stdout:
        trimmed_stdout = _trim_lines(stdout, first=40)
        parts.append(f"STDOUT:\n{trimmed_stdout}")
    if stderr:
        trimmed_stderr = _trim_lines(stderr, first=20, last=5)
        parts.append(f"STDERR:\n{trimmed_stderr}")

    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# In-process response cache (per HarnessContext lifetime)
# ---------------------------------------------------------------------------


@dataclass
class CacheEntry:
    response: CompletionResponse
    hit_count: int = 0


@dataclass
class HarnessContext:
    """
    Carries per-request metadata through the harness pipeline.

    Attributes
    ----------
    feature:
        The feature identifier (must match CompletionRequest.feature).
    session_id:
        Optional user/session identifier for tracing.
    debug:
        When True, logs full prompt and response content.
    budget:
        Token budget for this context. Default: 2000 prompt / 400 completion.
    _cache:
        In-process cache keyed by request hash (cleared on GC).
    """

    feature: str
    session_id: str | None = None
    debug: bool = False
    budget: Budget = field(default_factory=Budget)
    _cache: dict[str, CacheEntry] = field(default_factory=dict, repr=False)

    @staticmethod
    def _hash_request(request: CompletionRequest) -> str:
        payload = {
            "messages": [{"role": m.role, "content": m.content} for m in request.messages],
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
        }
        serialised = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(serialised.encode()).hexdigest()

    def get_cached(self, request: CompletionRequest) -> CompletionResponse | None:
        key = self._hash_request(request)
        entry = self._cache.get(key)
        if entry:
            entry.hit_count += 1
            logger.debug("[harness:cache] HIT feature=%s hits=%d", self.feature, entry.hit_count)
            return entry.response
        return None

    def cache_response(self, request: CompletionRequest, response: CompletionResponse) -> None:
        key = self._hash_request(request)
        self._cache[key] = CacheEntry(response=response)
        logger.debug("[harness:cache] STORE feature=%s key=%s...", self.feature, key[:8])

    def cache_stats(self) -> dict[str, Any]:
        return {
            "entries": len(self._cache),
            "total_hits": sum(e.hit_count for e in self._cache.values()),
        }

    def log_request(self, request: CompletionRequest) -> None:
        if self.debug:
            logger.debug(
                "[harness:debug] REQUEST feature=%s messages=%d max_tokens=%d",
                self.feature,
                len(request.messages),
                request.max_tokens,
            )

    def log_response(self, response: CompletionResponse) -> None:
        if self.debug:
            logger.debug(
                "[harness:debug] RESPONSE feature=%s model=%s tokens=%d finish=%s",
                self.feature,
                response.model,
                response.usage.total_tokens,
                response.finish_reason,
            )
