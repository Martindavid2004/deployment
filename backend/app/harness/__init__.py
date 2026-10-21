"""
backend/app/harness/__init__.py
--------------------------------
LLM Harness — public surface.

Import from here, not from submodules directly:

    from app.harness import provider, contracts, telemetry
    from app.harness.provider import LLMProvider
    from app.harness.contracts import CompletionRequest, CompletionResponse
"""

from app.harness import contracts, context, provider, telemetry

__all__ = ["contracts", "context", "provider", "telemetry"]
