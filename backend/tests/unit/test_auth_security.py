"""Characterization tests for password hashing and JWT handling."""

from datetime import timedelta

import pytest
from fastapi import HTTPException
from jose import jwt

from app.core.config import get_settings
from app.security.auth import (
    create_access_token,
    get_current_admin,
    hash_password,
    verify_password,
)

settings = get_settings()


class TestPasswordHashing:
    def test_hash_is_not_the_plain_password(self):
        assert hash_password("s3cret") != "s3cret"

    def test_round_trip_verifies(self):
        assert verify_password("s3cret", hash_password("s3cret")) is True

    def test_wrong_password_is_rejected(self):
        assert verify_password("nope", hash_password("s3cret")) is False

    def test_hashes_are_salted(self):
        assert hash_password("same") != hash_password("same")


class TestAccessTokens:
    def test_token_contains_subject_and_expiry(self):
        token = create_access_token({"sub": "user-1"})
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        assert payload["sub"] == "user-1"
        assert "exp" in payload

    def test_custom_expiry_is_honoured(self):
        token = create_access_token({"sub": "user-1"}, expires_delta=timedelta(seconds=-1))
        with pytest.raises(Exception):
            jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


class TestAdminGuard:
    @pytest.mark.asyncio
    async def test_admin_flag_is_required(self):
        with pytest.raises(HTTPException) as exc:
            await get_current_admin(current_user={"id": "1", "is_admin": False})
        assert exc.value.status_code == 403

    @pytest.mark.asyncio
    async def test_admin_passes_through(self):
        user = {"id": "1", "is_admin": True}
        assert await get_current_admin(current_user=user) is user
