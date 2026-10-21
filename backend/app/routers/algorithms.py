from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas.algorithm import (
    AlgorithmTrackResponse,
    AlgorithmTrackSummary,
    GenerateAlgorithmRequest,
)
from app.services.algorithm_service import AlgorithmService

router = APIRouter(prefix="/algorithms", tags=["Algorithm Mastery & System Design"])


@router.get("/tracks", response_model=List[AlgorithmTrackSummary])
async def get_all_tracks():
    """Get all categorized algorithm and system design tracks with real-world applications."""
    return await AlgorithmService.get_all_tracks()


@router.get("/tracks/{track_id}", response_model=AlgorithmTrackResponse)
async def get_track(track_id: str):
    """Fetch complete interactive visual sandbox config, code templates, and production case studies."""
    track = await AlgorithmService.get_track(track_id)
    if not track:
        raise HTTPException(status_code=404, detail=f"Algorithm track '{track_id}' not found")
    return track


@router.post("/generate", response_model=AlgorithmTrackResponse)
async def generate_custom_algorithm(request: GenerateAlgorithmRequest):
    """Generate a custom algorithm track and interactive sandbox using the AI harness."""
    return await AlgorithmService.generate_custom_algorithm(request)
