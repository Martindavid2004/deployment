"""Verify AGENTS.md LLM harness compliance and new Pydantic contracts."""

from pathlib import Path
import pytest
from pydantic import ValidationError

from app.harness.contracts import (
    ArenaEvaluateLLMContract,
    GeneratedCompetitiveProblem,
    GeneratedQuizQuestion,
    SocraticHintLLMContract,
)


def test_no_direct_llm_sdk_imports_outside_harness():
    app_dir = Path(__file__).resolve().parents[2] / "app"
    forbidden = ("google.generativeai", "import openai", "import anthropic")
    violations = []
    for py_file in app_dir.rglob("*.py"):
        if "harness" in py_file.parts:
            continue
        text = py_file.read_text(encoding="utf-8", errors="ignore")
        for needle in forbidden:
            if needle in text:
                violations.append(f"{py_file.relative_to(app_dir)}: {needle}")
    assert violations == []


def test_socratic_hint_contract_validates_and_forbids_extra():
    ok = SocraticHintLLMContract.model_validate_json(
        '{"guided_question":"Why?","target_concept":"Two Pointers","line_number_hint":10}'
    )
    assert ok.target_concept == "Two Pointers"
    with pytest.raises(ValidationError):
        SocraticHintLLMContract.model_validate_json(
            '{"guided_question":"Why?","target_concept":"Two Pointers","unexpected":1}'
        )


def test_arena_evaluate_contract_validates_bounds():
    ok = ArenaEvaluateLLMContract.model_validate_json(
        '{"passed_defense":true,"score":90,"critique":"Good","time_complexity_accuracy":"O(N)","space_complexity_accuracy":"O(1)","senior_feedback":"Nice"}'
    )
    assert ok.score == 90
    with pytest.raises(ValidationError):
        ArenaEvaluateLLMContract.model_validate_json(
            '{"passed_defense":true,"score":150,"critique":"Good","time_complexity_accuracy":"O(N)","space_complexity_accuracy":"O(1)","senior_feedback":"Nice"}'
        )


def test_generated_quiz_and_problem_contracts():
    q = GeneratedQuizQuestion.model_validate_json(
        '{"question":"Q?","options":["A","B","C","D"],"correct_answer":1,"explanation":"Because"}'
    )
    assert q.correct_answer == 1

    p = GeneratedCompetitiveProblem.model_validate_json(
        '{"title":"Sum","description":"Add","difficulty":"easy","testCases":[{"input":"1 2","expected":"3"}],"referenceCode":{"python":"print(3)"}}'
    )
    assert p.difficulty == "easy"
