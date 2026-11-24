"""Characterization tests for the pure competitive-mode helpers.

These lock in the behavior that existed inside app/routers/competitive.py
before the helpers were extracted into app/services/competitive/scoring.py.
"""

import pytest

from app.services.competitive.scoring import (
    calculate_code_shuffle_score,
    calculate_rating_change,
    calculate_xp_bonus,
    evaluate_test_cases,
    generate_buggy_code,
    normalize_code_indentation,
    shuffle_code_lines,
)


class TestShuffleCodeLines:
    def test_unescapes_literal_newlines(self):
        assert sorted(shuffle_code_lines("a\\nb\\nc")) == ["a", "b", "c"]

    def test_drops_blank_lines(self):
        assert sorted(shuffle_code_lines("a\n\n  \nb")) == ["a", "b"]

    def test_empty_input_returns_empty_list(self):
        assert shuffle_code_lines("") == []

    def test_preserves_multiset_of_lines(self):
        code = "line1\nline2\nline3\nline4"
        assert sorted(shuffle_code_lines(code)) == ["line1", "line2", "line3", "line4"]


class TestNormalizeCodeIndentation:
    def test_dedents_common_indentation(self):
        assert normalize_code_indentation(["    a = 1", "    b = 2"]) == "a = 1\nb = 2"

    def test_preserves_blank_lines(self):
        assert normalize_code_indentation(["    a", "", "    b"]) == "a\n\nb"

    def test_empty_list_returns_empty_string(self):
        assert normalize_code_indentation([]) == ""

    def test_already_normalized_is_unchanged(self):
        assert normalize_code_indentation(["a", "b"]) == "a\nb"


class TestCalculateCodeShuffleScore:
    def test_perfect_match_scores_100(self):
        assert calculate_code_shuffle_score("a\nb\nc", ["a", "b", "c"]) == 100

    def test_partial_match_is_percentage(self):
        assert calculate_code_shuffle_score("a\nb\nc", ["a", "x", "c"]) == 66

    def test_length_mismatch_scores_0(self):
        assert calculate_code_shuffle_score("a\nb\nc", ["a", "b"]) == 0

    def test_ignores_blank_lines(self):
        assert calculate_code_shuffle_score("a\n\nb", ["a", "b"]) == 100


class TestEvaluateTestCases:
    def test_empty_is_zero(self):
        assert evaluate_test_cases([], "ref", "python") == 0

    def test_single_case_gets_quantity_points_only(self):
        assert evaluate_test_cases([{"input": "1"}], "ref", "python") == 10

    def test_three_cases_get_variety_bonus(self):
        cases = [{"input": "1"}, {"input": "2"}, {"input": "3"}]
        assert evaluate_test_cases(cases, "ref", "python") == 50

    def test_five_cases_get_both_bonuses(self):
        cases = [{"input": letter} for letter in "abcde"]
        assert evaluate_test_cases(cases, "ref", "python") == 85

    def test_edge_case_adds_bonus(self):
        cases = [{"input": "0"}, {"input": "1"}, {"input": "2"}, {"input": "3"}, {"input": "4"}]
        assert evaluate_test_cases(cases, "ref", "python") == 90

    def test_score_is_capped_at_100(self):
        cases = [{"input": "0"}] * 20
        assert evaluate_test_cases(cases, "ref", "python") == 100


class TestCalculateRatingChange:
    @pytest.mark.parametrize(
        "winner,loser,used_hints,expected",
        [
            (1200, 1200, False, 26),
            (1200, 1200, True, 16),
            (1400, 1200, False, 17),
            (1400, 1200, True, 10),  # floor of 10 applies
            (1000, 1200, False, 34),
        ],
    )
    def test_rating_changes(self, winner, loser, used_hints, expected):
        assert calculate_rating_change(winner, loser, used_hints) == expected


class TestCalculateXpBonus:
    @pytest.mark.parametrize(
        "elapsed,limit,used_hints,expected",
        [
            (0, 900, False, 200),
            (0, 900, True, 150),
            (300, 900, False, 180),
            (600, 900, False, 160),
            (600, 900, True, 110),
        ],
    )
    def test_xp_bonuses(self, elapsed, limit, used_hints, expected):
        assert calculate_xp_bonus(elapsed, limit, used_hints) == expected


class TestGenerateBuggyCode:
    def test_empty_code_returns_empty(self):
        assert generate_buggy_code("") == ""

    def test_unknown_language_returns_original(self):
        code = "let x = 1;"
        assert generate_buggy_code(code, "rust") == code

    def test_python_output_is_syntactically_valid(self):
        code = "def add(a, b):\n    return a + b\n"
        result = generate_buggy_code(code, "python")
        assert result != ""
        compile(result, "<test>", "exec")
