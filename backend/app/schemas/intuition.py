from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- Sandbox Data Schemas ---
class PointerConfig(BaseModel):
    name: str
    initial_index: int = 0
    color: str = "#3B82F6"
    label: Optional[str] = None

class SandboxConfig(BaseModel):
    type: str  # "two_pointers", "sliding_window", "binary_search", "stack", "tree"
    title: str
    description: str
    initial_data: List[Any]
    target: Optional[Any] = None
    pointers: List[PointerConfig] = []
    goal_rule: str  # "sum_equals_target", "max_window_sum", "find_element", etc.
    hints_on_drag: Dict[str, str] = {}

# --- Chaos Benchmark Schemas ---
class ChaosBenchmarkRequest(BaseModel):
    problem_id: str
    n_elements: int = Field(default=1000, ge=10, le=100000)
    distribution: str = Field(default="random")  # "random", "sorted", "reverse", "duplicates"
    algorithm_type: str = Field(default="naive")  # "naive" vs "optimal"

class ChaosBenchmarkResponse(BaseModel):
    n_elements: int
    distribution: str
    algorithm_type: str
    time_taken_ms: float
    simulated_operations: int
    status: str  # "SUCCESS", "OVERHEAT_TLE", "MEMORY_SPIKE"
    complexity_label: str  # "O(N^2)", "O(N)", "O(N log N)"
    insight_message: str

# --- Logic Cards Schemas ---
class LogicCard(BaseModel):
    id: str
    label: str
    category: str  # "init", "loop", "condition", "return"
    code_template: Dict[str, str] = {}  # e.g., {"python": "left, right = 0, len(nums) - 1"}

# --- Intuition Problem Full Package ---
class IntuitionProblemResponse(BaseModel):
    problem_id: str
    title: str
    difficulty: str
    category: str
    story_hook: str
    sandbox_config: SandboxConfig
    chaos_config: Dict[str, Any]
    logic_cards: List[LogicCard]
    reference_code: Dict[str, str]
    test_cases: List[Dict[str, Any]]

# --- Socratic Hint Schemas ---
class SocraticHintRequest(BaseModel):
    problem_id: str
    language: str = "python"
    student_code: str
    tier: int = Field(default=1, ge=1, le=4)
    failed_test_case: Optional[Dict[str, Any]] = None
    execution_error: Optional[str] = None

class SocraticHintResponse(BaseModel):
    tier: int
    tier_name: str  # "Gentle Nudge", "Boundary Question", "Counter-Example Drill", "Conceptual Paradigm"
    guided_question: str
    target_concept: str
    line_number_hint: Optional[int] = None
    suggested_counter_input: Optional[str] = None
    encouragement: str

# --- AI Arena Defense Schemas ---
class ArenaEvaluateRequest(BaseModel):
    problem_id: str
    language: str = "python"
    student_code: str
    student_defense_response: str
    question_context: str

class ArenaEvaluateResponse(BaseModel):
    passed_defense: bool
    score: int = Field(ge=0, le=100)
    critique: str
    time_complexity_accuracy: str
    space_complexity_accuracy: str
    earned_badge: Optional[str] = None
    xp_awarded: int
    senior_feedback: str

# --- Cognitive Radar Profile Schemas ---
class CognitiveVectorScores(BaseModel):
    edge_case_handling: int = 70
    time_optimization: int = 70
    space_optimization: int = 70
    syntax_translation: int = 75
    articulation_score: int = 65

class BlindspotItem(BaseModel):
    id: str
    title: str
    severity: str  # "low", "medium", "high"
    occurrences: int
    drill_recommendation: str

class CognitiveProfileResponse(BaseModel):
    user_id: str
    username: str
    level: int
    total_xp: int
    radar_scores: CognitiveVectorScores
    active_blindspots: List[BlindspotItem]
    mastery_badges: List[Dict[str, str]]
    intuition_streak_days: int
