"""Unit tests for UserProfileUpdate schema and PATCH /users/me validation."""

import pytest
from pydantic import ValidationError

from app.schemas.user import UserProfileUpdate


def test_user_profile_update_valid():
    payload = UserProfileUpdate(username="alice_dev", preferred_language="python", faction="legend")
    assert payload.username == "alice_dev"
    assert payload.preferred_language == "python"
    assert payload.faction == "legend"


def test_user_profile_update_rejects_invalid_faction_or_language():
    with pytest.raises(ValidationError):
        UserProfileUpdate(faction="unknown_faction")

    with pytest.raises(ValidationError):
        UserProfileUpdate(preferred_language="ruby")
