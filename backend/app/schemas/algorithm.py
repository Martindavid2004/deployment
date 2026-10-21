from pydantic import BaseModel, ConfigDict, Field
from typing import List, Dict, Any, Optional, Literal


class RealWorldApplication(BaseModel):
    model_config = ConfigDict(strict=True)
    company_or_system: str = Field(..., description="e.g. 'Netflix', 'Google Maps', 'Redis', 'Git'")
    architecture_context: str = Field(..., description="Detailed technical explanation of how the algorithm is utilized in production")
    performance_gain: str = Field(..., description="Metrics or complexity benefits achieved (e.g., O(1) cache lookup, 99th percentile latency reduction)")


class GenerateAlgorithmRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    topic: str = Field(..., description="Algorithm or system design concept name (e.g. 'LRU Cache', 'Dijkstra', 'DP Grid')")
    category: Literal["arrays", "trees", "graphs", "dynamic_programming", "system_design"] = Field(..., description="Target category")
    difficulty: Literal["beginner", "intermediate", "advanced"] = Field(default="intermediate", description="Target complexity level")
    scenario_prompt: Optional[str] = Field(default=None, description="Optional custom scenario or incident context")


class AlgorithmTrackSummary(BaseModel):
    model_config = ConfigDict(strict=True)
    track_id: str
    title: str
    category: Literal["arrays", "trees", "graphs", "dynamic_programming", "system_design"]
    difficulty: Literal["beginner", "intermediate", "advanced"]
    icon: str
    time_complexity: str
    space_complexity: str
    clue: str
    intuition_summary: str
    real_world_applications: List[RealWorldApplication]
    scenario_title: Optional[str] = None
    scenario_description: Optional[str] = None
    naive_disaster: Optional[str] = None


class AlgorithmTrackResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    track_id: str
    title: str
    category: Literal["arrays", "trees", "graphs", "dynamic_programming", "system_design"]
    difficulty: Literal["beginner", "intermediate", "advanced"]
    icon: str
    time_complexity: str
    space_complexity: str
    clue: str
    intuition_summary: str
    real_world_applications: List[RealWorldApplication]
    sandbox_config: Dict[str, Any]
    reference_code: Dict[str, str]
    test_cases: List[Dict[str, str]]
    scenario_title: Optional[str] = None
    scenario_description: Optional[str] = None
    naive_disaster: Optional[str] = None

