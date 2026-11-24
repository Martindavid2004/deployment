"""Characterization tests for Code Quiz lobby helpers."""

import string

import pytest
from fastapi import HTTPException

from app.schemas.competitive import LobbyCreate
from app.services.competitive.lobby_service import create_quiz_lobby, generate_game_id


class TestGenerateGameId:
    def test_returns_six_characters(self):
        assert len(generate_game_id()) == 6

    def test_uses_uppercase_alphanumerics_only(self):
        allowed = set(string.ascii_uppercase + string.digits)
        assert set(generate_game_id()) <= allowed


class TestCreateQuizLobbyValidation:
    """Validation happens before any database access, so db can be None."""

    @pytest.mark.asyncio
    async def test_missing_language_is_rejected(self):
        with pytest.raises(HTTPException) as exc:
            await create_quiz_lobby(None, LobbyCreate(quiz_language=None), {"id": "1", "username": "u"})
        assert exc.value.status_code == 400
        assert "quiz_language" in exc.value.detail

    @pytest.mark.asyncio
    async def test_unsupported_language_is_rejected(self):
        lobby = LobbyCreate(quiz_language="ruby", quiz_question_count=5)
        with pytest.raises(HTTPException) as exc:
            await create_quiz_lobby(None, lobby, {"id": "1", "username": "u"})
        assert exc.value.status_code == 400
        assert "python, java, or cpp" in exc.value.detail

    @pytest.mark.asyncio
    async def test_missing_question_count_is_rejected(self):
        with pytest.raises(HTTPException) as exc:
            await create_quiz_lobby(None, LobbyCreate(quiz_language="python"), {"id": "1", "username": "u"})
        assert exc.value.status_code == 400
        assert "quiz_question_count" in exc.value.detail

    @pytest.mark.asyncio
    async def test_unsupported_question_count_is_rejected(self):
        with pytest.raises(HTTPException) as exc:
            await create_quiz_lobby(
                None,
                LobbyCreate(quiz_language="python", quiz_question_count=7),
                {"id": "1", "username": "u"},
            )
        assert exc.value.status_code == 400
        assert "quiz_question_count must be" in exc.value.detail

    @pytest.mark.asyncio
    async def test_player_count_bounds_are_enforced(self):
        with pytest.raises(HTTPException) as exc:
            await create_quiz_lobby(
                None,
                LobbyCreate(quiz_language="python", quiz_question_count=5, max_players=1),
                {"id": "1", "username": "u"},
            )
        assert exc.value.status_code == 400
        assert "between 2 and 15" in exc.value.detail

    @pytest.mark.asyncio
    async def test_time_limit_is_thirty_seconds_per_question(self):
        lobby = LobbyCreate(quiz_language="python", quiz_question_count=10)

        # Validation passes, then question generation runs. The stub DB has no
        # question cache, so the generator raises and the endpoint returns 500.
        class _StubDb:
            pass

        with pytest.raises(HTTPException) as exc:
            await create_quiz_lobby(_StubDb(), lobby, {"id": "1", "username": "u"})
        assert exc.value.status_code == 500
        assert lobby.time_limit_seconds == 300
