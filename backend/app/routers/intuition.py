from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional

from app.schemas.intuition import (
    IntuitionProblemResponse,
    ChaosBenchmarkRequest,
    ChaosBenchmarkResponse,
    SocraticHintRequest,
    SocraticHintResponse,
    ArenaEvaluateRequest,
    ArenaEvaluateResponse,
    CognitiveProfileResponse
)
from app.services.intuition_service import IntuitionService

router = APIRouter(prefix="/intuition", tags=["Intuition Learning Engine"])

@router.get("/problems", response_model=List[Dict[str, Any]])
async def get_intuition_problems():
    """Get all problems supporting the 4-D Intuition Loop."""
    return IntuitionService.get_all_intuition_problems()

@router.get("/problems/{problem_id}", response_model=IntuitionProblemResponse)
async def get_intuition_problem(problem_id: str):
    """Fetch the full intuition package (Sandbox, Chaos, Logic Cards, Reference Code) for a problem."""
    problem = IntuitionService.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Intuition problem '{problem_id}' not found")
    return problem

@router.post("/chaos-benchmark", response_model=ChaosBenchmarkResponse)
async def run_chaos_benchmark(request: ChaosBenchmarkRequest):
    """Simulate and benchmark algorithmic stress, operations, and CPU temperature scaling."""
    return IntuitionService.run_chaos_benchmark(request)

@router.post("/socratic-hint", response_model=SocraticHintResponse)
async def get_socratic_hint(request: SocraticHintRequest):
    """Generate a multi-tiered Socratic guiding hint targeting the student's cognitive mental model."""
    return await IntuitionService.generate_socratic_hint(request)

@router.post("/arena-evaluate", response_model=ArenaEvaluateResponse)
async def evaluate_arena_defense(request: ArenaEvaluateRequest):
    """Evaluate student's spoken/text defense of trade-offs in the post-solution AI Arena."""
    return await IntuitionService.evaluate_arena_defense(request)

@router.get("/profile", response_model=CognitiveProfileResponse)
async def get_cognitive_profile(user_id: Optional[str] = "demo_user", username: Optional[str] = "Coder"):
    """Fetch the user's cognitive radar vectors, blindspot analysis, and earned mastery badges."""
    return IntuitionService.get_user_cognitive_profile(user_id, username)
