from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class MatchPlayerState(BaseModel):
    """State of a player in a competitive match"""
    user_id: str
    username: str
    code: str = ""
    completed: bool = False
    time_elapsed: float = 0.0
    used_hints: bool = False
    submission_time: Optional[datetime] = None
    score: int = 0  # For multiplayer ranking
    rank: Optional[int] = None  # Final rank in multiplayer match
    # For Code Shuffle mode
    shuffled_lines: Optional[List[str]] = None
    arranged_code: Optional[str] = None
    # For Test Master mode
    test_cases_created: Optional[List[Dict[str, str]]] = None
    test_cases_score: Optional[int] = None
    # For Code Quiz mode
    quiz_answers: Optional[Dict[int, int]] = None  # question_index: selected_option
    quiz_score: Optional[int] = None
    quiz_correct_count: Optional[int] = None
    quiz_time_taken: Optional[int] = None
    quiz_time_bonus: Optional[int] = None
    quiz_current_question: Optional[int] = None  # For auto-save progress
    last_saved_at: Optional[datetime] = None  # Last auto-save timestamp

class LobbyCreate(BaseModel):
    """Create a new multiplayer lobby"""
    problem_id: Optional[str] = None  # Optional - will be auto-generated if not provided
    game_mode: str = "standard"  # standard, bug_hunt, code_shuffle, test_master, code_quiz
    time_limit_seconds: int = 900  # 15 minutes default
    max_players: int = 15  # Maximum 15 players
    lobby_name: Optional[str] = None  # Optional lobby name
    # Code Quiz specific fields
    quiz_language: Optional[str] = None  # python, java, cpp
    quiz_question_count: Optional[int] = None  # 5, 10, 15, 20, 30, 40, 50, 60

class LobbyJoin(BaseModel):
    """Join an existing lobby"""
    game_id: str  # The lobby code/ID

class LobbyPublic(BaseModel):
    """Public lobby information"""
    game_id: str  # Short, shareable game code
    lobby_name: Optional[str] = None
    host_id: str
    host_username: str
    problem_id: Optional[str] = None  # Optional for quiz mode
    game_mode: str
    time_limit_seconds: int
    max_players: int
    players: List[MatchPlayerState]
    status: str  # waiting, starting, active, completed
    match_id: Optional[str] = None  # Match ID when game starts
    created_at: datetime
    started_at: Optional[datetime] = None
    # Quiz-specific fields
    quiz_language: Optional[str] = None
    quiz_question_count: Optional[int] = None
    quiz_questions: Optional[List[Dict]] = None

class MatchCreate(BaseModel):
    """Create a new competitive match (legacy 1v1)"""
    problem_id: str
    player1_id: str
    player2_id: str
    time_limit_seconds: int = 900  # 15 minutes default
    game_mode: str = "standard"  # standard, bug_hunt, code_shuffle, test_master
    
class MatchBase(BaseModel):
    """Base match information"""
    problem_id: Optional[str] = None  # Optional for quiz mode
    # Legacy 1v1 support
    player1: Optional[MatchPlayerState] = None
    player2: Optional[MatchPlayerState] = None
    # Multiplayer support
    players: Optional[List[MatchPlayerState]] = None
    game_id: Optional[str] = None  # Lobby game code
    host_id: Optional[str] = None
    max_players: int = 2  # Default to 1v1, can be up to 15
    time_limit_seconds: int
    game_mode: str = "standard"  # standard, bug_hunt, code_shuffle, test_master, code_quiz
    buggy_code: Optional[str] = None  # For bug_hunt mode - the buggy code to fix
    status: str = "waiting"  # waiting, active, completed, cancelled
    winner_id: Optional[str] = None
    winners: Optional[List[str]] = None  # For multiplayer - top 3 players
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    # Quiz-specific fields
    quiz_language: Optional[str] = None
    quiz_question_count: Optional[int] = None
    quiz_questions: Optional[List[Dict]] = None

class MatchInDB(MatchBase):
    id: str

class MatchPublic(MatchBase):
    id: str

class MatchJoin(BaseModel):
    """Join an existing match"""
    match_id: str

class MatchSubmit(BaseModel):
    """Submit code for a match"""
    match_id: str
    code: str
    language: str
    # For Bug Hunt mode
    bug_report: Optional[str] = None
    force_submit: Optional[bool] = False  # Force submit even if validation fails
    # For Code Shuffle mode
    arranged_lines: Optional[List[str]] = None
    # For Test Master mode
    test_cases: Optional[List[Dict[str, str]]] = None
    # For Code Quiz mode
    quiz_answers: Optional[Dict[int, int]] = None  # question_index: selected_option
    quiz_time_taken: Optional[int] = None  # seconds
    quiz_current_question: Optional[int] = None  # For auto-save progress

class MatchResult(BaseModel):
    """Result of a competitive match"""
    match_id: str
    winner_id: str
    winner_username: str
    loser_id: str
    loser_username: str
    winner_time: float
    loser_time: Optional[float]
    rating_change: int  # How much rating changed (positive for winner, negative for loser)
    xp_bonus: int  # Bonus XP awarded


class QuizSubmitResponse(BaseModel):
    """Response after submitting quiz"""
    score: int
    correct: int
    total: int
    time_bonus: int
    rank: Optional[int] = None
    show_leaderboard: bool
    players_finished: int
    total_players: int
    leaderboard: Optional[List[Dict]] = None

class QuizQuestion(BaseModel):
    """Quiz question structure"""
    id: str
    question: str
    code: Optional[str] = None
    options: List[str]
    question_type: str
    difficulty: str
    points: int

class QuizResultDetail(BaseModel):
    """Detailed quiz result for review"""
    id: str
    question: str
    code: Optional[str] = None
    options: List[str]
    correct_answer: int
    player_answer: Optional[int]
    is_correct: bool
    explanation: str
    question_type: str
    difficulty: str


# Bug Hunt Piston Upgrade Schemas

class CodeExecutionRequest(BaseModel):
    """Request to execute code through Piston API"""
    code: str
    language: str  # 'python', 'java', 'cpp'
    stdin: Optional[str] = ""  # Standard input for the program
    test_case_index: Optional[int] = None  # Optional: run specific test case

class CodeExecutionResponse(BaseModel):
    """Response after submitting code for execution"""
    execution_id: str
    status: str  # 'queued', 'processing'
    queue_position: int

class ExecutionResultResponse(BaseModel):
    """Result of code execution"""
    execution_id: str
    status: str  # 'pending', 'completed', 'failed'
    success: Optional[bool] = None
    output: Optional[str] = None
    compile_error: Optional[str] = None
    runtime_error: Optional[str] = None
    execution_time: Optional[float] = None
    timed_out: Optional[bool] = None
    test_results: Optional[Dict] = None  # Test case results if applicable

class LanguageSwitchRequest(BaseModel):
    """Request to switch programming language"""
    new_language: str  # 'python', 'java', 'cpp'

class LanguageSwitchResponse(BaseModel):
    """Response after switching language"""
    buggy_code: str
    language: str
    test_cases: List[Dict]
