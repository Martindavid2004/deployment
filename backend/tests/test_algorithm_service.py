import pytest
import httpx

from app.main import app
from app.services.algorithm_service import AlgorithmService, ALGORITHM_CATALOG
from app.schemas.algorithm import GenerateAlgorithmRequest


def test_algorithm_catalog_categories():
    """Verify that catalog contains tracks for all required categories."""
    categories = {track["category"] for track in ALGORITHM_CATALOG.values()}
    assert "arrays" in categories
    assert "trees" in categories
    assert "graphs" in categories
    assert "dynamic_programming" in categories
    assert "system_design" in categories


def test_real_world_applications_present():
    """Verify that every track has real-world applications defined with architecture context."""
    for track_id, track in ALGORITHM_CATALOG.items():
        apps = track.get("real_world_applications", [])
        assert len(apps) >= 1, f"Track {track_id} missing real-world application."
        for app in apps:
            assert app.get("company_or_system"), f"Missing company in {track_id}"
            assert app.get("architecture_context"), f"Missing architecture context in {track_id}"
            assert app.get("performance_gain"), f"Missing performance gain in {track_id}"


@pytest.mark.asyncio
async def test_algorithm_service_get_all_tracks():
    tracks = await AlgorithmService.get_all_tracks()
    assert len(tracks) >= 8
    categories = {t.category for t in tracks}
    assert "arrays" in categories
    assert "system_design" in categories


@pytest.mark.asyncio
async def test_algorithm_service_get_track_valid():
    track = await AlgorithmService.get_track("consistent_hashing")
    assert track is not None
    assert track.track_id == "consistent_hashing"
    assert track.category == "system_design"
    assert len(track.real_world_applications) >= 1


@pytest.mark.asyncio
async def test_algorithm_service_get_track_invalid():
    track = await AlgorithmService.get_track("non_existent_algorithm_xyz")
    assert track is None


@pytest.mark.asyncio
async def test_algorithm_service_generate_fallback():
    req = GenerateAlgorithmRequest(
        topic="Custom Graph Flow",
        category="graphs",
        difficulty="intermediate"
    )
    result = await AlgorithmService.generate_custom_algorithm(req)
    assert result is not None
    assert result.category == "graphs"


@pytest.mark.asyncio
async def test_router_get_tracks():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/algorithms/tracks")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 8
    sample = data[0]
    assert "track_id" in sample
    assert "real_world_applications" in sample


@pytest.mark.asyncio
async def test_router_get_single_track():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/algorithms/tracks/two_pointers")
    assert response.status_code == 200
    data = response.json()
    assert data["track_id"] == "two_pointers"
    assert data["category"] == "arrays"


@pytest.mark.asyncio
async def test_router_get_single_track_not_found():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/algorithms/tracks/unknown_track_123")
    assert response.status_code == 404
