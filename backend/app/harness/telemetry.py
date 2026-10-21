"""
backend/app/harness/telemetry.py
----------------------------------
Records LLM call metrics to MongoDB (llm_calls collection).

Every LLM call must log via log_llm_call() for the token-audit skill
and cost monitoring.

Exports:
  log_llm_call(db, ...)  -> None         (async, inserts to llm_calls)
  get_feature_stats(db, feature) -> dict  (async, aggregates for token-audit)
  HarnessTelemetry                        (sync recorder used by provider.py)
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from typing import Any

from app.harness.contracts import CompletionResponse

logger = logging.getLogger("harness.telemetry")

# ---------------------------------------------------------------------------
# Cost table (approximate USD per 1 000 tokens)
# ---------------------------------------------------------------------------

_COST_PER_1K: dict[str, dict[str, float]] = {
    "gpt-4o": {"input": 0.005, "output": 0.015},
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "claude-3-haiku-20240307": {"input": 0.00025, "output": 0.00125},
    "claude-3-sonnet-20240229": {"input": 0.003, "output": 0.015},
    "gemini-1.5-flash": {"input": 0.000075, "output": 0.0003},
    "gemini-1.5-pro": {"input": 0.00125, "output": 0.005},
}
_DEFAULT_COST = {"input": 0.001, "output": 0.002}


def _estimate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    rates = _COST_PER_1K.get(model, _DEFAULT_COST)
    return (prompt_tokens * rates["input"] + completion_tokens * rates["output"]) / 1000


# ---------------------------------------------------------------------------
# Async MongoDB logger (used by routers/services via dependency injection)
# ---------------------------------------------------------------------------


async def log_llm_call(
    db: Any,
    *,
    request_id: str,
    purpose: str,
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
    cached: bool,
    schema_valid: bool,
    repair_attempts: int,
    fallback_used: bool,
    latency_ms: int,
    budget_used_pct: float,
) -> None:
    """
    Insert one record into the llm_calls MongoDB collection.

    Parameters
    ----------
    db:              AsyncIOMotorDatabase instance
    request_id:      Unique ID for this HTTP request (from request.state.request_id)
    purpose:         Feature/purpose label (e.g. "quiz_generation", "problem_hint")
    model:           Model ID actually used (e.g. "gemini-1.5-flash")
    prompt_tokens:   Tokens in the prompt
    completion_tokens: Tokens in the response
    cached:          True if the response was served from in-process cache
    schema_valid:    True if model_validate_json() passed on first attempt
    repair_attempts: How many repair prompts were sent (0 = no repair needed)
    fallback_used:   True if FallbackProvider's secondary/deterministic was used
    latency_ms:      Wall-clock time for the LLM call in milliseconds
    budget_used_pct: prompt_tokens / max_prompt_tokens * 100
    """
    cost = _estimate_cost(model, prompt_tokens, completion_tokens)
    doc = {
        "request_id": request_id,
        "purpose": purpose,
        "model": model,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": prompt_tokens + completion_tokens,
        "cached": cached,
        "schema_valid": schema_valid,
        "repair_attempts": repair_attempts,
        "fallback_used": fallback_used,
        "latency_ms": latency_ms,
        "budget_used_pct": round(budget_used_pct, 2),
        "estimated_cost_usd": round(cost, 8),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "timestamp": datetime.now(timezone.utc),
    }
    try:
        await db["llm_calls"].insert_one(doc)
    except Exception as exc:
        # Telemetry must never crash the application
        logger.error("[harness:telemetry] Failed to log llm_call: %s", exc)


# ---------------------------------------------------------------------------
# Feature stats (used by token-audit skill)
# ---------------------------------------------------------------------------


async def get_feature_stats(db: Any, feature: str, hours: int = 24) -> dict[str, Any]:
    """
    Aggregate llm_calls for a specific feature over the last N hours.

    Returns a dict suitable for the token-audit skill report:
      {
        "avg_prompt_tokens": float,
        "max_prompt_tokens": int,
        "schema_fail_rate": float,   # 0.0 - 1.0
        "cache_hit_rate": float,     # 0.0 - 1.0
        "avg_repairs": float,
        "total_calls": int,
        "period_hours": int,
      }
    """
    from datetime import timedelta

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    pipeline = [
        {"$match": {"purpose": feature, "timestamp": {"$gte": cutoff}}},
        {
            "$group": {
                "_id": None,
                "avg_prompt_tokens": {"$avg": "$prompt_tokens"},
                "max_prompt_tokens": {"$max": "$prompt_tokens"},
                "schema_fail_count": {
                    "$sum": {"$cond": [{"$eq": ["$schema_valid", False]}, 1, 0]}
                },
                "cache_hit_count": {
                    "$sum": {"$cond": [{"$eq": ["$cached", True]}, 1, 0]}
                },
                "total_repairs": {"$sum": "$repair_attempts"},
                "total_calls": {"$sum": 1},
            }
        },
    ]
    cursor = db["llm_calls"].aggregate(pipeline)
    results = await cursor.to_list(length=1)

    if not results:
        return {
            "avg_prompt_tokens": 0.0,
            "max_prompt_tokens": 0,
            "schema_fail_rate": 0.0,
            "cache_hit_rate": 0.0,
            "avg_repairs": 0.0,
            "total_calls": 0,
            "period_hours": hours,
        }

    row = results[0]
    total = max(row["total_calls"], 1)  # avoid division by zero

    return {
        "avg_prompt_tokens": round(row.get("avg_prompt_tokens") or 0.0, 1),
        "max_prompt_tokens": row.get("max_prompt_tokens") or 0,
        "schema_fail_rate": round(row.get("schema_fail_count", 0) / total, 4),
        "cache_hit_rate": round(row.get("cache_hit_count", 0) / total, 4),
        "avg_repairs": round(row.get("total_repairs", 0) / total, 4),
        "total_calls": row["total_calls"],
        "period_hours": hours,
    }


# ---------------------------------------------------------------------------
# Sync telemetry recorder (used by provider.py LLMProvider internally)
# ---------------------------------------------------------------------------


class HarnessTelemetry:
    """
    Emits structured telemetry log lines for every LLM call.
    Used internally by provider.py for immediate structured logging.
    For persistent storage, also call log_llm_call() with db access.
    """

    def __init__(self, extra_labels: dict[str, Any] | None = None) -> None:
        self._env = os.getenv("ENVIRONMENT", "development")
        self._extra = extra_labels or {}

    def record(self, response: CompletionResponse, latency_ms: int) -> None:
        """Emit a structured log line for a completed LLM call."""
        cost = _estimate_cost(
            response.model,
            response.usage.prompt_tokens,
            response.usage.completion_tokens,
        )
        event: dict[str, Any] = {
            "event": "llm_call",
            "environment": self._env,
            "feature": response.feature,
            "provider": response.provider,
            "model": response.model,
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
            "latency_ms": latency_ms,
            "estimated_cost_usd": round(cost, 8),
            "cached": response.cached,
            "finish_reason": response.finish_reason if isinstance(response.finish_reason, str) else response.finish_reason.value,
            "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            **self._extra,
        }
        logger.info(json.dumps(event))

    def record_error(self, feature: str, provider: str, error: str, latency_ms: int) -> None:
        """Emit a structured log line for a failed LLM call."""
        event: dict[str, Any] = {
            "event": "llm_error",
            "environment": self._env,
            "feature": feature,
            "provider": provider,
            "error": error,
            "latency_ms": latency_ms,
            "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            **self._extra,
        }
        logger.error(json.dumps(event))

    @staticmethod
    def cost_estimate(model: str, prompt_tokens: int, completion_tokens: int) -> float:
        return _estimate_cost(model, prompt_tokens, completion_tokens)

    @staticmethod
    def daily_budget_warning(
        model: str,
        avg_prompt_tokens: int,
        avg_completion_tokens: int,
        requests_per_day: int,
        budget_usd: float = 1.0,
    ) -> str:
        per_request = _estimate_cost(model, avg_prompt_tokens, avg_completion_tokens)
        daily = per_request * requests_per_day
        if daily > budget_usd:
            return (
                f"WARNING: Projected daily cost for model={model!r}: "
                f"${daily:.4f} (budget: ${budget_usd:.2f}). "
                "Consider reducing tokens or caching."
            )
        return f"OK: Projected daily cost: ${daily:.4f} within ${budget_usd:.2f} budget."
