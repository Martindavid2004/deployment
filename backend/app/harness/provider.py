"""
backend/app/harness/provider.py
---------------------------------
LLM provider abstraction with structured output, repair loop, and fallback.

All LLM calls in CodoAi MUST go through this module.
Direct use of OpenAI / Anthropic / Google SDK is FORBIDDEN outside here.

Provider selection:
  Set LLM_PROVIDER env var to "openai" | "anthropic" | "google".
  Defaults to "google" (project ships with google-generativeai).

Usage:
    from app.harness.provider import get_provider, call_with_repair
    from app.harness.contracts import Hint
    from app.harness.context import Budget

    provider = get_provider()
    result: Hint = await call_with_repair(
        contract=Hint,
        messages=[{"role": "user", "content": "Give a gentle hint for two-sum."}],
        budget=Budget(),
        feature="problem_hint",
    )
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any, TypeVar

from pydantic import BaseModel, ValidationError

from app.harness.contracts import (
    BudgetExceeded,
    CompletionRequest,
    CompletionResponse,
    ContentFilterError,
    FinishReason,
    HarnessError,
    Message,
    ProviderUnavailableError,
    Role,
    SchemaRepairFailed,
    TokenBudgetExceededError,
    TokenUsage,
)
from app.harness.context import Budget, HarnessContext, enforce_budget
from app.harness.telemetry import HarnessTelemetry

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


# ---------------------------------------------------------------------------
# Abstract adapter
# ---------------------------------------------------------------------------


class ProviderAdapter(ABC):
    """Minimal interface every provider adapter must implement."""

    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    async def complete(self, request: CompletionRequest) -> CompletionResponse: ...


# ---------------------------------------------------------------------------
# Concrete adapters
# ---------------------------------------------------------------------------


class GeminiProvider(ProviderAdapter):
    """Wraps Google Generative AI SDK with native JSON schema output."""

    name = "google"

    def __init__(self) -> None:
        try:
            import google.generativeai as genai  # type: ignore # lazy import
        except ImportError as exc:
            raise ProviderUnavailableError(
                "google-generativeai is not installed. Run: pip install google-generativeai"
            ) from exc

        api_key = os.getenv("GOOGLE_API_KEY", "")
        if api_key:
            genai.configure(api_key=api_key)
        self._model_name = os.getenv("GOOGLE_MODEL", "gemini-flash-latest")
        self._genai = genai

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        import google.generativeai as genai  # type: ignore

        # Build a flat prompt from messages
        prompt_parts = []
        for m in request.messages:
            role_label = m.role.upper() if hasattr(m.role, "upper") else str(m.role).upper()
            prompt_parts.append(f"[{role_label}]\n{m.content}")
        prompt = "\n\n".join(prompt_parts)

        model = genai.GenerativeModel(self._model_name)
        response = await asyncio.to_thread(
            model.generate_content,
            prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=request.max_tokens,
                temperature=request.temperature,
                response_mime_type="application/json",
            ),
        )
        text = response.text or ""
        usage = response.usage_metadata

        return CompletionResponse(
            content=text,
            finish_reason=FinishReason.STOP,
            model=self._model_name,
            usage=TokenUsage(
                prompt_tokens=getattr(usage, "prompt_token_count", 0),
                completion_tokens=getattr(usage, "candidates_token_count", 0),
                total_tokens=getattr(usage, "total_token_count", 0),
            ),
            provider=self.name,
            feature=request.feature,
        )


class OpenAIProvider(ProviderAdapter):
    """Wraps OpenAI SDK with JSON schema mode (structured output)."""

    name = "openai"

    def __init__(self) -> None:
        try:
            import openai  # type: ignore # lazy import
        except ImportError as exc:
            raise ProviderUnavailableError(
                "openai is not installed. Run: pip install openai"
            ) from exc

        api_key = os.getenv("OPENAI_API_KEY", "")
        self._client = openai.AsyncOpenAI(api_key=api_key or "sk-dummy")
        self._model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        messages = [{"role": m.role if isinstance(m.role, str) else m.role.value, "content": m.content} for m in request.messages]
        resp = await self._client.chat.completions.create(
            model=self._model,
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            response_format={"type": "json_object"},
        )
        choice = resp.choices[0]
        finish = choice.finish_reason or "unknown"

        return CompletionResponse(
            content=choice.message.content or "",
            finish_reason=FinishReason(finish) if finish in {e.value for e in FinishReason} else FinishReason.UNKNOWN,
            model=resp.model,
            usage=TokenUsage(
                prompt_tokens=resp.usage.prompt_tokens,
                completion_tokens=resp.usage.completion_tokens,
                total_tokens=resp.usage.total_tokens,
            ),
            provider=self.name,
            feature=request.feature,
        )


class AnthropicProvider(ProviderAdapter):
    """Wraps Anthropic SDK. Uses system prompt to enforce JSON output."""

    name = "anthropic"

    def __init__(self) -> None:
        try:
            import anthropic  # type: ignore # lazy import
        except ImportError as exc:
            raise ProviderUnavailableError(
                "anthropic is not installed. Run: pip install anthropic"
            ) from exc

        api_key = os.getenv("ANTHROPIC_API_KEY", "")
        self._client = anthropic.AsyncAnthropic(api_key=api_key or "sk-dummy")
        self._model = os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307")

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        system_parts = [m.content for m in request.messages if m.role == Role.SYSTEM or (hasattr(m.role, "value") and m.role.value == "system")]
        user_messages = [
            {"role": m.role if isinstance(m.role, str) else m.role.value, "content": m.content}
            for m in request.messages
            if not (m.role == Role.SYSTEM or (hasattr(m.role, "value") and m.role.value == "system"))
        ]
        system_prompt = "\n\n".join(system_parts) if system_parts else "Respond with valid JSON only."

        resp = await self._client.messages.create(
            model=self._model,
            max_tokens=request.max_tokens,
            messages=user_messages,
            system=system_prompt,
        )
        content_block = resp.content[0] if resp.content else None
        text = content_block.text if content_block else ""

        return CompletionResponse(
            content=text,
            finish_reason=FinishReason.STOP if resp.stop_reason == "end_turn" else FinishReason.LENGTH,
            model=resp.model,
            usage=TokenUsage(
                prompt_tokens=resp.usage.input_tokens,
                completion_tokens=resp.usage.output_tokens,
                total_tokens=resp.usage.input_tokens + resp.usage.output_tokens,
            ),
            provider=self.name,
            feature=request.feature,
        )


# ---------------------------------------------------------------------------
# Fallback provider (primary -> fallback -> deterministic)
# ---------------------------------------------------------------------------


class FallbackProvider(ProviderAdapter):
    """
    Chains: primary -> fallback -> deterministic_rule.
    Never raises — always returns a CompletionResponse.
    """

    name = "fallback"

    def __init__(self, primary: ProviderAdapter, fallback: ProviderAdapter | None = None) -> None:
        self._primary = primary
        self._fallback = fallback

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        try:
            return await self._primary.complete(request)
        except Exception as exc:
            logger.warning("[harness:fallback] primary=%s failed: %s", self._primary.name, exc)

        if self._fallback:
            try:
                return await self._fallback.complete(request)
            except Exception as exc:
                logger.warning("[harness:fallback] fallback=%s failed: %s", self._fallback.name, exc)

        # Deterministic fallback — return empty JSON
        logger.error("[harness:fallback] all providers failed, returning deterministic empty response")
        return CompletionResponse(
            content="{}",
            finish_reason=FinishReason.ERROR,
            model="deterministic-fallback",
            usage=TokenUsage(prompt_tokens=0, completion_tokens=0, total_tokens=0),
            provider="fallback",
            feature=request.feature,
        )


# ---------------------------------------------------------------------------
# Repair loop
# ---------------------------------------------------------------------------


async def call_with_repair(
    contract: type[T],
    messages: list[dict[str, str]],
    budget: Budget,
    feature: str,
    provider: ProviderAdapter | None = None,
    max_tokens: int = 400,
) -> T:
    """
    Call the LLM, validate against a Pydantic contract, repair once on failure.

    Steps:
    1. enforce_budget() — raises BudgetExceeded if over limit.
    2. Call provider.
    3. model_validate_json() — raises ValidationError if invalid.
    4. On ValidationError: build repair prompt (error + invalid output only,
       NOT the full original prompt), retry once.
    5. On second failure: raise SchemaRepairFailed.

    Never call provider.complete() directly — always use this function.
    """
    enforce_budget(messages, budget)

    _provider = provider or get_provider()
    request_messages = [
        Message(role=Role(m["role"]), content=m["content"])
        for m in messages
    ]
    request = CompletionRequest(
        messages=request_messages,
        max_tokens=max_tokens,
        feature=feature,
    )

    # First attempt
    response = await _provider.complete(request)
    raw = response.content

    saved_err = None
    try:
        return contract.model_validate_json(raw)
    except ValidationError as first_err:
        saved_err = str(first_err)
        logger.warning(
            "[harness:repair] schema validation failed for %s: %s",
            contract.__name__,
            first_err,
        )

    # Repair: send ONLY the error + invalid output (never the full original prompt)
    repair_messages = [
        Message(
            role=Role.USER,
            content=(
                f"The following JSON output failed validation for schema {contract.__name__}.\n\n"
                f"VALIDATION ERROR:\n{saved_err}\n\n"
                f"INVALID OUTPUT:\n{raw}\n\n"
                f"Please return corrected JSON that satisfies the schema. "
                f"Return ONLY the JSON object, no explanation."
            ),
        )
    ]
    repair_request = CompletionRequest(
        messages=repair_messages,
        max_tokens=max_tokens,
        feature=f"{feature}_repair",
    )
    repair_response = await _provider.complete(repair_request)
    repaired_raw = repair_response.content

    try:
        return contract.model_validate_json(repaired_raw)
    except ValidationError as second_err:
        raise SchemaRepairFailed(
            f"LLM output for {contract.__name__} failed validation after repair attempt. "
            f"Last error: {second_err}"
        ) from second_err


# ---------------------------------------------------------------------------
# Singleton provider
# ---------------------------------------------------------------------------


_PROVIDER_REGISTRY: dict[str, type[ProviderAdapter]] = {
    "google": GeminiProvider,
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
}

_singleton: ProviderAdapter | None = None


def get_provider() -> ProviderAdapter:
    """
    Return the module-level singleton ProviderAdapter.
    Reads LLM_PROVIDER env var. Defaults to "google".
    """
    global _singleton
    if _singleton is not None:
        return _singleton

    provider_name = os.getenv("LLM_PROVIDER", "google").lower()
    cls = _PROVIDER_REGISTRY.get(provider_name)
    if cls is None:
        raise ProviderUnavailableError(
            f"Unknown LLM_PROVIDER={provider_name!r}. Valid: {list(_PROVIDER_REGISTRY)}"
        )

    try:
        _singleton = cls()
        logger.info("[harness:provider] Initialised provider=%s", provider_name)
    except Exception as exc:
        raise ProviderUnavailableError(
            f"Failed to initialise {provider_name} provider: {exc}"
        ) from exc

    return _singleton
