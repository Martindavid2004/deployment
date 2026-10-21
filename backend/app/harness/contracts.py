"""
backend/app/harness/contracts.py
---------------------------------
Pydantic v2 models that define the strict interface between CodoAi code
and any LLM provider. Every LLM response must validate against one of
these models — never use json.loads() on raw model output.

Changing these models is a breaking change — update all callers.

Adding a new LLM purpose:
  1. Add a new model here FIRST (inheriting LLMContract).
  2. Then implement the context builder and wire through provider.py.
"""

from __future__ import annotations

from enum import Enum
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Base contract — all LLM output models MUST inherit this
# ---------------------------------------------------------------------------


class LLMContract(BaseModel):
    """
    Base class for all LLM output contracts.
    strict=True: no silent type coercions.
    extra="forbid": unexpected fields raise ValidationError.
    """

    model_config = ConfigDict(strict=True, extra="forbid")


# ---------------------------------------------------------------------------
# Domain LLM output contracts
# ---------------------------------------------------------------------------


class CodeReview(LLMContract):
    """
    Result of an automated code review / judge pass.
    Produced by: intuition_service.py, code review features.
    """

    verdict: Literal[
        "correct",
        "wrong_answer",
        "tle",
        "runtime_error",
        "compile_error",
    ]
    confidence: Annotated[float, Field(ge=0.0, le=1.0)]
    issues: Annotated[list[str], Field(max_length=5)] = []
    hint: Annotated[str, Field(max_length=280)]


class Hint(LLMContract):
    """
    A contextual hint for a coding problem.
    Produced by: intuition_service.py, hint endpoints.
    """

    level: Literal["gentle", "medium", "direct"]
    text: Annotated[str, Field(max_length=280)]
    related_concept: str


class ProblemExplanation(LLMContract):
    """
    A full explanation of a coding problem.
    Produced by: problem_generator.py.
    """

    summary: Annotated[str, Field(max_length=500)]
    approach: Annotated[str, Field(max_length=500)]
    complexity: str
    pitfalls: Annotated[list[str], Field(max_length=5)] = []


class QuizQuestion(LLMContract):
    """
    A multiple-choice quiz question.
    Produced by: quiz_generator.py.
    """

    question: str
    options: Annotated[list[str], Field(min_length=2, max_length=4)]
    correct_index: Annotated[int, Field(ge=0, le=3)]
    explanation: Annotated[str, Field(max_length=280)]


class AlgorithmExplanationResult(LLMContract):
    """
    Structured breakdown and interactive sandbox definition for an algorithm.
    Produced by: intuition_service.py / algorithm generator.
    """

    topic: str
    scenario_title: str
    scenario_description: Annotated[str, Field(max_length=900)]
    naive_disaster: Annotated[str, Field(max_length=450)]
    category: Literal["arrays", "trees", "graphs", "dynamic_programming", "system_design"]
    intuition_breakdown: Annotated[str, Field(max_length=600)]
    time_complexity: str
    space_complexity: str
    real_world_production_use_cases: Annotated[list[str], Field(min_length=2, max_length=5)]
    interactive_initial_state: list[int | str]
    step_by_step_rules: Annotated[list[str], Field(min_length=3, max_length=8)]
    reference_solution_python: str


# ---------------------------------------------------------------------------
# Request / Response envelope (provider-agnostic)
# ---------------------------------------------------------------------------


class Role(str, Enum):
    """Chat message roles."""

    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


class FinishReason(str, Enum):
    """Why the model stopped generating."""

    STOP = "stop"
    LENGTH = "length"
    CONTENT_FILTER = "content_filter"
    ERROR = "error"
    UNKNOWN = "unknown"


class Message(BaseModel):
    """A single turn in a conversation."""

    model_config = ConfigDict(use_enum_values=True)
    role: Role
    content: str


class CompletionRequest(BaseModel):
    """
    Provider-agnostic LLM completion request.
    All callers MUST use this model — never pass raw dicts to the provider.
    """

    messages: list[Message] = Field(
        ...,
        description="Conversation history.",
        min_length=1,
    )
    max_tokens: int = Field(
        ...,
        description="Hard token budget for response. REQUIRED.",
        ge=1,
        le=32_768,
    )
    temperature: float = Field(
        default=0.2,
        description="Sampling temperature. 0 = deterministic.",
        ge=0.0,
        le=2.0,
    )
    feature: str = Field(
        ...,
        description="Caller feature name for telemetry (e.g. 'quiz_generation').",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Optional extra metadata for telemetry.",
    )


class TokenUsage(BaseModel):
    """Token counts returned by the provider."""

    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class CompletionResponse(BaseModel):
    """Provider-agnostic LLM completion response."""

    model_config = ConfigDict(use_enum_values=True)
    content: str = Field(..., description="The model reply text.")
    finish_reason: FinishReason
    model: str = Field(..., description="Actual model ID used.")
    usage: TokenUsage
    provider: str = Field(..., description="Provider name used.")
    cached: bool = Field(default=False)
    feature: str = Field(..., description="Echoed from request for telemetry.")


# ---------------------------------------------------------------------------
# Harness error hierarchy
# ---------------------------------------------------------------------------


class HarnessError(Exception):
    """Base error for all harness failures."""


class BudgetExceeded(HarnessError):
    """Raised when estimated prompt tokens exceed the configured budget."""


class TokenBudgetExceededError(HarnessError):
    """Raised when the provider signals the token limit was hit (finish_reason=length)."""


class ProviderUnavailableError(HarnessError):
    """Raised when no configured provider can serve the request."""


class ContentFilterError(HarnessError):
    """Raised when the provider rejects content due to safety filters."""


class SchemaRepairFailed(HarnessError):
    """Raised when LLM output fails validation after one repair attempt."""
