"""Unit tests for IntuitionService.get_user_cognitive_profile."""

from app.services.intuition_service import IntuitionService


def test_cognitive_profile_falls_back_to_demo_when_no_user_doc():
    profile = IntuitionService.get_user_cognitive_profile("demo_user", "Coder")
    assert profile.user_id == "demo_user"
    assert profile.username == "Coder"
    assert profile.level == 3
    assert profile.total_xp == 1450


def test_cognitive_profile_uses_real_user_doc():
    user_doc = {
        "id": "6b0881ccbfa5cd40a210b7e8",
        "username": "alice",
        "level": 5,
        "xp": 420,
    }
    profile = IntuitionService.get_user_cognitive_profile(
        "demo_user",
        "Coder",
        user_doc=user_doc,
        completed_count=4,
    )
    assert profile.user_id == "6b0881ccbfa5cd40a210b7e8"
    assert profile.username == "alice"
    assert profile.level == 5
    assert profile.total_xp == 420
    assert profile.intuition_streak_days == 4
    assert len(profile.mastery_badges) == 3
