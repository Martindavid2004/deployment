from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import asyncio
import random
import re
import string
import logging

from app.db.mongo import get_database
from app.schemas.competitive import (
    MatchCreate, MatchPublic, MatchJoin, MatchSubmit, 
    MatchResult, MatchPlayerState, LobbyCreate, LobbyPublic, LobbyJoin
)
from app.security.auth import get_current_user
from app.services.code_executor import code_executor
from app.services.problem_generator import generate_competitive_problem

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/competitive", tags=["competitive"])

# Store for active websocket connections
active_connections = {}

class MatchmakingRequest(BaseModel):
    """Request body for matchmaking"""
    game_mode: str = "standard"
    problem_id: Optional[str] = None
active_connections = {}

def shuffle_code_lines(code: str) -> List[str]:
    """Shuffle code lines while maintaining logical structure"""
    # Handle escaped newlines from seed data
    if "\\n" in code:
        code = code.replace("\\n", "\n")
        
    lines = code.strip().split('\n')
    # Filter out empty lines
    non_empty_lines = [line for line in lines if line.strip()]
    # Shuffle the lines
    shuffled = non_empty_lines.copy()
    random.shuffle(shuffled)
    
    print(f"🔀 Shuffling code:")
    print(f"  - Original lines: {len(lines)}")
    print(f"  - Non-empty lines: {len(non_empty_lines)}")
    print(f"  - Shuffled lines: {len(shuffled)}")
    
    return shuffled

def normalize_code_indentation(lines: List[str]) -> str:
    """
    Join and normalize code lines to fix indentation issues.
    This handles cases where arranged lines have inconsistent indentation.
    """
    if not lines:
        return ""
    
    # Join lines first
    code = '\n'.join(lines)
    
    # Try to detect the minimum indentation for non-empty lines
    non_empty_lines = [line for line in lines if line.strip()]
    if not non_empty_lines:
        return code
    
    # Find minimum indentation (except for blank lines)
    min_indent = float('inf')
    for line in non_empty_lines:
        if line.strip():
            indent = len(line) - len(line.lstrip())
            min_indent = min(min_indent, indent)
    
    min_indent = 0 if min_indent == float('inf') else min_indent
    
    # Dedent all lines by the minimum indentation to normalize
    if min_indent > 0:
        normalized_lines = []
        for line in lines:
            if line.strip():  # Non-empty line
                # Remove minimum indentation
                if len(line) >= min_indent and line[:min_indent].strip() == '':
                    normalized_lines.append(line[min_indent:])
                else:
                    normalized_lines.append(line)
            else:
                normalized_lines.append(line)  # Keep blank lines as-is
        code = '\n'.join(normalized_lines)
    
    return code

def calculate_code_shuffle_score(original: str, arranged: List[str]) -> int:
    """Calculate score for code shuffle game mode based on correctness"""
    original_lines = [line.strip() for line in original.strip().split('\n') if line.strip()]
    arranged_lines = [line.strip() for line in arranged if line.strip()]
    
    if len(original_lines) != len(arranged_lines):
        return 0
    
    # Calculate percentage of correctly placed lines
    correct = sum(1 for o, a in zip(original_lines, arranged_lines) if o == a)
    return int((correct / len(original_lines)) * 100)

def evaluate_test_cases(test_cases: List[dict], reference_code: str, language: str) -> int:
    """Evaluate quality of user-created test cases"""
    if not test_cases:
        return 0
    
    # Score based on:
    # 1. Number of test cases (more is better, up to a point)
    # 2. Variety of inputs (edge cases, normal cases)
    # 3. Correctness (do they actually test the function properly)
    
    score = 0
    
    # Basic score for having test cases
    score += min(len(test_cases) * 10, 50)  # Max 50 points for quantity
    
    # Bonus for variety (check if inputs vary significantly)
    if len(test_cases) >= 3:
        score += 20
    if len(test_cases) >= 5:
        score += 15
    
    # Bonus for edge cases (empty, negative, large numbers, etc.)
    edge_case_patterns = [r'0', r'-\d+', r'\[\]', r'""', r"''", r'None']
    for tc in test_cases:
        input_str = str(tc.get('input', ''))
        for pattern in edge_case_patterns:
            if re.search(pattern, input_str):
                score += 5
                break
    
    return min(score, 100)  # Cap at 100

def generate_buggy_code(correct_code: str, language: str = "python") -> str:
    """Generate buggy code by introducing common programming errors"""
    if not correct_code:
        return ""
    
    lines = correct_code.split('\n')
    buggy_lines = lines.copy()
    bugs_introduced = 0
    non_empty_lines = len([l for l in lines if l.strip() and not l.strip().startswith('#')])
    max_bugs = min(3, max(1, non_empty_lines // 3))  # Ensure at least 1 bug for short code
    
    print(f"🐛 Generating buggy code: {non_empty_lines} lines, target {max_bugs} bugs")
    
    # Common bug patterns for different languages
    bug_types = []
    
    if language == "python":
        bug_types = [
            # Off-by-one error in range
            lambda line: line.replace('range(len(', 'range(len(') if 'range(len(' in line else (
                line.replace('range(', 'range(1, ', 1) if 'range(' in line and 'range(1,' not in line and 'range(0' not in line else line
            ),
            # Missing colon after control structures
            lambda line: line.rstrip(':') if line.strip().endswith(':') and any(kw in line for kw in ['if ', 'for ', 'while ', 'def ', 'class ', 'elif ', 'else:', 'try:', 'except']) else line,
            # Wrong comparison operator (== vs =)
            lambda line: line.replace('==', '=', 1) if '==' in line and 'def ' not in line and '#' not in line else line,
            # Wrong indentation - remove 4 spaces (1 indentation level) for indented lines
            lambda line: line[4:] if line.startswith('    ') and line.strip() and not line.strip().startswith('#') and len(line.lstrip()) < len(line) - 4 else line,
            # Missing return statement (comment it out)
            lambda line: '# ' + line if 'return ' in line and not line.strip().startswith('#') else line,
            # Wrong operator precedence (+ vs *)
            lambda line: line.replace(' + ', ' * ', 1) if ' + ' in line and 'def ' not in line and '#' not in line else line,
            # Wrong list indexing
            lambda line: line.replace('[0]', '[1]', 1) if '[0]' in line else (
                line.replace('[-1]', '[-2]', 1) if '[-1]' in line else line
            ),
            # Incorrect loop variable
            lambda line: line.replace('for i in', 'for j in', 1) if 'for i in' in line and 'i]' in line else line,
            # Wrong boolean operator
            lambda line: line.replace(' and ', ' or ', 1) if ' and ' in line else (
                line.replace(' or ', ' and ', 1) if ' or ' in line else line
            ),
            # Missing increment
            lambda line: line.replace('i += 1', 'i += 2', 1) if 'i += 1' in line else (
                line.replace('count += 1', 'count += 2', 1) if 'count += 1' in line else line
            ),
            # Wrong string method
            lambda line: line.replace('.append(', '.extend(', 1) if '.append(' in line else line,
            # Incorrect condition
            lambda line: line.replace(' < ', ' <= ', 1) if ' < ' in line else (
                line.replace(' > ', ' >= ', 1) if ' > ' in line else line
            ),
        ]
    
    elif language == "javascript":
        bug_types = [
            # Missing semicolon
            lambda line: line.rstrip(';') if line.strip().endswith(';') and not line.strip().startswith('for') else line,
            # Wrong comparison (== vs ===)
            lambda line: line.replace('===', '==', 1) if '===' in line else line,
            # Missing return
            lambda line: '// ' + line if 'return ' in line and not line.strip().startswith('//') else line,
            # Wrong array method
            lambda line: line.replace('.push(', '.pop(', 1) if '.push(' in line else line,
            # Off-by-one in loop
            lambda line: line.replace('< length', '<= length', 1) if '< length' in line else line,
            # Wrong operator
            lambda line: line.replace(' + ', ' - ', 1) if ' + ' in line and '//' not in line else line,
            # Missing var/let/const
            lambda line: line.replace('let ', '', 1) if line.strip().startswith('let ') else (
                line.replace('const ', '', 1) if line.strip().startswith('const ') else line
            ),
            # Wrong increment
            lambda line: line.replace('++', '--', 1) if '++' in line else line,
        ]
    
    elif language == "java":
        bug_types = [
            # Missing semicolon
            lambda line: line.rstrip(';') if line.strip().endswith(';') and not line.strip().startswith('for') and not line.strip().startswith('if') else line,
            # Wrong comparison operator
            lambda line: line.replace('==', '=', 1) if '==' in line and 'if' in line else line,
            # Off-by-one in loop
            lambda line: line.replace('< ', '<= ', 1) if '< ' in line and 'for' in line else line,
            # Wrong operator
            lambda line: line.replace(' + ', ' * ', 1) if ' + ' in line and '//' not in line else line,
            # Missing return
            lambda line: '// ' + line if 'return ' in line and not line.strip().startswith('//') else line,
            # Wrong array indexing
            lambda line: line.replace('[0]', '[1]', 1) if '[0]' in line else line,
            # Wrong increment
            lambda line: line.replace('++', '--', 1) if '++' in line else line,
            # Wrong condition
            lambda line: line.replace(' < ', ' <= ', 1) if ' < ' in line else line,
        ]
    
    elif language == "cpp" or language == "c++":
        bug_types = [
            # Missing semicolon
            lambda line: line.rstrip(';') if line.strip().endswith(';') and not line.strip().startswith('for') and not line.strip().startswith('if') else line,
            # Wrong comparison operator
            lambda line: line.replace('==', '=', 1) if '==' in line and 'if' in line else line,
            # Off-by-one in loop
            lambda line: line.replace('< ', '<= ', 1) if '< ' in line and 'for' in line else line,
            # Wrong operator
            lambda line: line.replace(' + ', ' * ', 1) if ' + ' in line and '//' not in line else line,
            # Missing return
            lambda line: '// ' + line if 'return ' in line and not line.strip().startswith('//') else line,
            # Wrong array indexing
            lambda line: line.replace('[0]', '[1]', 1) if '[0]' in line else line,
            # Wrong increment
            lambda line: line.replace('++', '--', 1) if '++' in line else line,
            # Wrong condition
            lambda line: line.replace(' < ', ' <= ', 1) if ' < ' in line else line,
        ]
    
    # If no bug types defined for language, return original code
    if not bug_types:
        print(f"  ⚠️ Warning: No bug patterns defined for language '{language}', returning original code")
        return correct_code
    
    # Try multiple passes to ensure we introduce bugs
    max_attempts = 10
    attempt = 0
    
    while bugs_introduced < max_bugs and attempt < max_attempts:
        attempt += 1
        available_indices = list(range(len(buggy_lines)))
        random.shuffle(available_indices)
        
        for idx in available_indices:
            if bugs_introduced >= max_bugs:
                break
            
            line = buggy_lines[idx]
            # Skip empty lines, comments
            if not line.strip() or line.strip().startswith('#') or line.strip().startswith('//'):
                continue
            
            # Try to apply a random bug
            bug_func = random.choice(bug_types)
            modified_line = bug_func(line)
            
            # Only apply if the line actually changed
            if modified_line != line:
                print(f"  🐛 Bug {bugs_introduced + 1}: Line {idx + 1}: '{line.strip()}' → '{modified_line.strip()}'")
                buggy_lines[idx] = modified_line
                bugs_introduced += 1
    
    if bugs_introduced == 0:
        print(f"  ⚠️ Warning: No bugs introduced after {attempt} attempts!")
    else:
        print(f"  ✅ Successfully introduced {bugs_introduced} bug(s)")
    
    # Validate that the buggy code is syntactically valid (even if logically wrong)
    buggy_code = '\n'.join(buggy_lines)
    
    if language == "python":
        try:
            compile(buggy_code, '<string>', 'exec')
            print(f"  ✅ Buggy code syntax is valid")
        except SyntaxError as e:
            # If syntax is invalid, return the original correct code with bugs commented out
            # This ensures the code at least compiles, even if it doesn't run correctly
            print(f"  ⚠️ ERROR: Generated buggy code has syntax error: {str(e)}")
            print(f"  ⚠️ Returning original code to avoid IndentationError in Bug Hunt")
            # Apply only safe, non-structural bugs to the original code
            safe_buggy = correct_code.split('\n')
            for i, line in enumerate(safe_buggy):
                if '==' in line and 'def ' not in line and '#' not in line:
                    safe_buggy[i] = line.replace('==', '=', 1)
                    break
            return '\n'.join(safe_buggy)
    
    return buggy_code

def calculate_rating_change(winner_rating: int, loser_rating: int, used_hints: bool = False) -> int:
    """Calculate ELO-style rating change"""
    k_factor = 32
    expected_winner = 1 / (1 + 10 ** ((loser_rating - winner_rating) / 400))
    rating_change = int(k_factor * (1 - expected_winner))
    
    # Bonus for not using hints
    if not used_hints:
        rating_change += 10
    
    return max(10, rating_change)  # Minimum 10 points

def calculate_xp_bonus(time_elapsed: float, time_limit: int, used_hints: bool) -> int:
    """Calculate bonus XP based on performance"""
    base_xp = 100
    
    # Time bonus (faster = more XP)
    time_ratio = time_elapsed / time_limit
    if time_ratio < 0.25:
        time_bonus = 50
    elif time_ratio < 0.5:
        time_bonus = 30
    else:
        time_bonus = 10
    
    # No hints bonus
    no_hints_bonus = 50 if not used_hints else 0
    
    return base_xp + time_bonus + no_hints_bonus

async def simulate_bot_completion(match_id: str, problem_id: str, bot_skill: int = 1200):
    """Simulate bot completing the problem after a delay"""
    db = get_database()
    
    # Bot completes in 3-10 minutes based on skill
    # Higher skill = faster completion
    base_time = 600  # 10 minutes
    skill_factor = max(0.3, 1 - (bot_skill - 1000) / 1000)  # 0.3 to 1.0
    completion_time = base_time * skill_factor * random.uniform(0.5, 1.0)
    
    await asyncio.sleep(completion_time)
    
    # Check if match still exists and is active
    match = await db.matches.find_one({"_id": ObjectId(match_id)})
    if not match or match.get("status") == "completed":
        return  # Match already finished
    
    # Get problem to generate working solution
    problem = await db.problems.find_one({"_id": ObjectId(problem_id)})
    if not problem:
        return
    
    # Bot submits a correct solution (we'll mark it as completed)
    test_cases = problem.get("testCases", [])
    
    # Update bot as completed
    await db.matches.update_one(
        {"_id": ObjectId(match_id)},
        {
            "$set": {
                "player2.completed": True,
                "player2.time_elapsed": completion_time,
                "player2.submission_time": datetime.utcnow(),
                "player2.test_results": {
                    "passed": len(test_cases),
                    "total": len(test_cases),
                    "all_passed": True
                }
            }
        }
    )
    
    # Check if player1 has also completed to determine winner
    updated_match = await db.matches.find_one({"_id": ObjectId(match_id)})
    player1 = updated_match.get("player1", {})
    player2 = updated_match.get("player2", {})
    
    if player1.get("completed") and player2.get("completed"):
        # Both completed - determine winner by time
        p1_time = player1.get("time_elapsed", float('inf'))
        p2_time = player2.get("time_elapsed", float('inf'))
        
        winner_id = "bot" if p2_time < p1_time else player1.get("user_id")
        
        # Update match as completed
        await db.matches.update_one(
            {"_id": ObjectId(match_id)},
            {
                "$set": {
                    "status": "completed",
                    "winner_id": winner_id,
                    "completed_at": datetime.utcnow()
                }
            }
        )
        
        # Update player1 rating (don't update bot)
        if winner_id != "bot":
            # Player won against bot
            player1_user = await db.users.find_one({"_id": ObjectId(player1["user_id"])})
            if player1_user:
                current_rating = player1_user.get("rating", 1200)
                rating_change = calculate_rating_change(current_rating, bot_skill, player1.get("used_hints", False))
                xp_bonus = calculate_xp_bonus(p1_time, updated_match.get("time_limit_seconds", 1800), player1.get("used_hints", False))
                
                await db.users.update_one(
                    {"_id": ObjectId(player1["user_id"])},
                    {
                        "$inc": {
                            "rating": rating_change,
                            "xp": xp_bonus
                        }
                    }
                )
        else:
            # Bot won - decrease player rating
            player1_user = await db.users.find_one({"_id": ObjectId(player1["user_id"])})
            if player1_user:
                current_rating = player1_user.get("rating", 1200)
                rating_change = calculate_rating_change(bot_skill, current_rating, False)
                
                await db.users.update_one(
                    {"_id": ObjectId(player1["user_id"])},
                    {
                        "$inc": {
                            "rating": -rating_change
                        }
                    }
                )

def generate_game_id() -> str:
    """Generate a unique 6-character game ID for lobby"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

async def create_quiz_lobby(db, lobby_in: LobbyCreate, current_user):
    """Create a Code Quiz lobby with AI-generated questions"""
    
    # Validate quiz-specific fields
    if not lobby_in.quiz_language:
        raise HTTPException(status_code=400, detail="quiz_language is required for Code Quiz mode")
    
    if not lobby_in.quiz_question_count:
        raise HTTPException(status_code=400, detail="quiz_question_count is required for Code Quiz mode")
    
    if lobby_in.quiz_language not in ["python", "java", "cpp"]:
        raise HTTPException(status_code=400, detail="quiz_language must be python, java, or cpp")
    
    if lobby_in.quiz_question_count not in [5, 10, 15, 20, 30, 40, 50, 60]:
        raise HTTPException(status_code=400, detail="quiz_question_count must be 5, 10, 15, 20, 30, 40, 50, or 60")
    
    # Auto-calculate time limit (30 seconds per question)
    lobby_in.time_limit_seconds = lobby_in.quiz_question_count * 30
    
    # Validate max_players (2-15)
    if lobby_in.max_players < 2 or lobby_in.max_players > 15:
        raise HTTPException(status_code=400, detail="Max players must be between 2 and 15")
    
    print(f"🎯 Creating Code Quiz lobby:")
    print(f"   Language: {lobby_in.quiz_language}")
    print(f"   Questions: {lobby_in.quiz_question_count}")
    print(f"   Time limit: {lobby_in.time_limit_seconds}s ({lobby_in.time_limit_seconds // 60} minutes)")
    
    # Generate quiz questions
    try:
        quiz_questions = await generate_quiz_questions(
            db,
            lobby_in.quiz_language,
            lobby_in.quiz_question_count
        )
        
        if len(quiz_questions) < lobby_in.quiz_question_count:
            print(f"⚠️ Warning: Only generated {len(quiz_questions)}/{lobby_in.quiz_question_count} questions")
        
        # Clean questions for JSON serialization (remove MongoDB ObjectIds)
        cleaned_questions = []
        for q in quiz_questions:
            cleaned_q = {k: v for k, v in q.items() if k != '_id'}
            # Convert datetime to ISO string
            if 'created_at' in cleaned_q and cleaned_q['created_at']:
                cleaned_q['created_at'] = cleaned_q['created_at'].isoformat() if hasattr(cleaned_q['created_at'], 'isoformat') else str(cleaned_q['created_at'])
            if 'last_used' in cleaned_q and cleaned_q['last_used']:
                cleaned_q['last_used'] = cleaned_q['last_used'].isoformat() if hasattr(cleaned_q['last_used'], 'isoformat') else str(cleaned_q['last_used'])
            cleaned_questions.append(cleaned_q)
        
    except Exception as e:
        print(f"❌ Failed to generate quiz questions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate quiz questions: {str(e)}"
        )
    
    # Generate unique game ID
    game_id = generate_game_id()
    
    # Ensure game_id is unique
    max_attempts = 10
    attempt = 0
    while await db.lobbies.find_one({"game_id": game_id, "status": {"$ne": "completed"}}) and attempt < max_attempts:
        game_id = generate_game_id()
        attempt += 1
    
    if attempt >= max_attempts:
        raise HTTPException(status_code=500, detail="Failed to generate unique game ID")
    
    # Create host player state
    host_player = {
        "user_id": current_user["id"],
        "username": current_user["username"],
        "code": "",
        "completed": False,
        "time_elapsed": 0.0,
        "used_hints": False,
        "submission_time": None,
        "score": 0,
        "rank": None,
        # Quiz-specific fields
        "quiz_answers": {},
        "quiz_score": None,
        "quiz_correct_count": None,
        "quiz_time_taken": None,
        "quiz_time_bonus": None
    }
    
    # Create lobby document
    lobby_doc = {
        "game_id": game_id,
        "lobby_name": lobby_in.lobby_name or f"{current_user['username']}'s Quiz",
        "host_id": current_user["id"],
        "host_username": current_user["username"],
        "game_mode": "code_quiz",
        "problem_id": None,  # Not used for quiz mode
        "time_limit_seconds": lobby_in.time_limit_seconds,
        "max_players": lobby_in.max_players,
        "players": [host_player],
        # Quiz-specific fields
        "quiz_language": lobby_in.quiz_language,
        "quiz_question_count": lobby_in.quiz_question_count,
        "quiz_questions": cleaned_questions,
        "status": "waiting",
        "created_at": datetime.utcnow(),
        "started_at": None,
        "completed_at": None,
        "winner_id": None,
        "winners": []
    }
    
    result = await db.lobbies.insert_one(lobby_doc)
    lobby_doc["id"] = str(result.inserted_id)
    
    print(f"✅ Created Code Quiz lobby: {game_id}")
    
    return LobbyPublic(**lobby_doc)

@router.post("/lobby/create", response_model=LobbyPublic)
async def create_lobby(
    lobby_in: LobbyCreate,
    current_user = Depends(get_current_user)
):
    """Create a new multiplayer lobby that others can join - selects random problem from pool"""
    db = get_database()
    
    # Handle Code Quiz mode separately
    if lobby_in.game_mode == "code_quiz":
        return await create_quiz_lobby(db, lobby_in, current_user)
    
    # Bug Hunt mode uses JSON questions instead of MongoDB problems
    if lobby_in.game_mode == "bug_hunt":
        from app.services.question_loader import QuestionLoader
        
        print(f"🐛 Loading Bug Hunt questions from JSON...")
        
        try:
            question_loader = QuestionLoader(db=db)
            
            # Ensure questions are preloaded
            if not question_loader._preloaded:
                await question_loader.preload_questions()
            
            # Get all available questions
            all_questions = []
            for difficulty in ['easy', 'medium', 'hard']:
                questions = question_loader.questions_cache.get(difficulty, [])
                all_questions.extend(questions)
            
            if not all_questions:
                raise HTTPException(
                    status_code=500,
                    detail="No Bug Hunt questions available. Please check data/bug_hunt_questions.json"
                )
            
            # Select up to 5 random questions (or all if less than 5)
            num_questions = min(5, len(all_questions))
            selected_questions = random.sample(all_questions, num_questions)
            
            print(f"✅ Selected {len(selected_questions)} Bug Hunt questions:")
            for i, q in enumerate(selected_questions, 1):
                print(f"   {i}. {q.title} ({q.difficulty})")
            
            # Store questions in a format compatible with the rest of the system
            # We'll store them as "bug_hunt_questions" in the lobby
            lobby_in.problem_id = None  # No MongoDB problem ID
            selected_problem_ids = []  # No MongoDB problem IDs
            bug_hunt_questions = selected_questions
            
        except Exception as e:
            print(f"❌ Error loading Bug Hunt questions: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to load Bug Hunt questions: {str(e)}"
            )
    else:
        # Other modes use MongoDB problems
        # Map game modes to their competitive_mode values
        mode_mapping = {
            "standard": "standard",
            "bug_hunt": "bug_hunt",
            "code_shuffle": "code_shuffle",
            "test_master": "standard"  # Use standard problems for test_master
        }
        
        competitive_mode = mode_mapping.get(lobby_in.game_mode, "standard")
        
        # Select a random problem from the pool for this game mode
        print(f"🎲 Selecting 5 random problems for {lobby_in.game_mode} mode...")
        bug_hunt_questions = None
        
        try:
            # Find all problems for this game mode
            cursor = db.problems.find({
                "created_for_competitive": True,
                "competitive_mode": competitive_mode
            })
            
            problems = await cursor.to_list(length=None)
            
            if not problems:
                # Fallback to AI generation if no problems in pool
                print(f"⚠️ No problems found in pool, generating 5 problems with AI...")
                
                selected_problem_ids = []
                difficulties = ["easy", "easy", "medium", "medium", "hard"]  # Mix of difficulties
                
                for i, difficulty in enumerate(difficulties, 1):
                    print(f"   Generating problem {i}/5 ({difficulty})...")
                    problem_data = generate_competitive_problem(difficulty)
                    
                    difficulty_capitalized = difficulty.capitalize()
                    problem_doc = {
                        "title": problem_data["title"],
                        "description": problem_data["description"],
                        "difficulty": difficulty_capitalized,
                        "testCases": problem_data["testCases"],
                        "examples": problem_data.get("examples", []),
                        "hint": problem_data.get("hint", ""),
                        "starterCode": problem_data.get("starterCode", {}),
                        "topics": ["competitive", "ai-generated"],
                        "created_for_competitive": True,
                        "competitive_mode": competitive_mode,
                        "videoUrl": "",
                        "referenceCode": problem_data.get("referenceCode", {"python": "", "cpp": "", "java": ""}),
                        "buggyCode": {},
                        "explanations": {"approach": [], "complexity": []},
                        "sampleTests": []
                    }
                    
                    result = await db.problems.insert_one(problem_doc)
                    selected_problem_ids.append(str(result.inserted_id))
                    print(f"   ✅ Generated: {problem_data['title']} (ID: {selected_problem_ids[-1]})")
            else:
                # Randomly select 5 problems from pool (or all available if <5)
                num_problems = min(5, len(problems))
                selected_problems = random.sample(problems, num_problems)
                selected_problem_ids = [str(p["_id"]) for p in selected_problems]
                print(f"✅ Selected {num_problems} problems:")
                for i, p in enumerate(selected_problems, 1):
                    print(f"   {i}. {p['title']} ({p.get('difficulty', 'Unknown')})")
                
        except Exception as gen_error:
            print(f"❌ Error selecting problems: {str(gen_error)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to select problems: {str(gen_error)}"
            )
    
    # For Bug Hunt mode, we don't need to fetch MongoDB problems
    if lobby_in.game_mode == "bug_hunt":
        problem = None  # No MongoDB problem needed
        buggy_code_content = None  # Will be set per-question
    else:
        # Store the first problem ID for compatibility (legacy field)
        lobby_in.problem_id = selected_problem_ids[0]
        
        # Fetch the newly created problem
        problem = await db.problems.find_one({"_id": ObjectId(lobby_in.problem_id)})
        if not problem:
            raise HTTPException(status_code=500, detail="Failed to create problem")
        
        buggy_code_content = None
    
    # Validate max_players (2-15)
    if lobby_in.max_players < 2 or lobby_in.max_players > 15:
        raise HTTPException(status_code=400, detail="Max players must be between 2 and 15")
    
    # Generate unique game ID
    game_id = generate_game_id()
    
    # Ensure game_id is unique
    max_attempts = 10
    attempt = 0
    while await db.lobbies.find_one({"game_id": game_id, "status": {"$ne": "completed"}}) and attempt < max_attempts:
        game_id = generate_game_id()
        attempt += 1
    
    if attempt >= max_attempts:
        raise HTTPException(status_code=500, detail="Failed to generate unique game ID")
    
    # Prepare game mode specific data for host
    shuffled_lines = None
    
    if lobby_in.game_mode == "code_shuffle" and problem:
        reference_code = problem.get("referenceCode", {}).get("python", "")
        if reference_code:
            shuffled_lines = shuffle_code_lines(reference_code)
        else:
            raise HTTPException(status_code=400, detail="Problem doesn't have reference code for Code Shuffle mode")
    # Bug Hunt mode: buggy_code_content is handled per-question, not here
    
    # Create host player state
    host_player = {
        "user_id": current_user["id"],
        "username": current_user["username"],
        "code": "",
        "completed": False,
        "time_elapsed": 0.0,
        "used_hints": False,
        "submission_time": None,
        "score": 0,
        "rank": None,
        "shuffled_lines": shuffled_lines,
        "arranged_code": None,
        "test_cases_created": None,
        "test_cases_score": None,
        # Multi-problem race fields
        "current_problem_index": 0,  # Start at first problem
        "problems_solved": 0,
        "submissions": []  # Track each problem submission
    }
    
    # Create lobby document
    lobby_doc = {
        "game_id": game_id,
        "lobby_name": lobby_in.lobby_name or f"{current_user['username']}'s Game",
        "host_id": current_user["id"],
        "host_username": current_user["username"],
        "game_mode": lobby_in.game_mode,
        "time_limit_seconds": lobby_in.time_limit_seconds,
        "max_players": lobby_in.max_players,
        "players": [host_player],
        "shuffled_lines": shuffled_lines,  # Store at lobby level for consistency
        "status": "waiting",  # waiting, starting, active, completed
        "created_at": datetime.utcnow(),
        "started_at": None,
        "completed_at": None,
        "winner_id": None,
        "winners": []
    }
    
    # Add mode-specific fields
    if lobby_in.game_mode == "bug_hunt":
        # Store Bug Hunt questions from JSON
        lobby_doc["bug_hunt_questions"] = [
            {
                "id": q.id,
                "title": q.title,
                "description": q.description,
                "difficulty": q.difficulty,
                "time_limit": q.time_limit,
                "hints": q.hints,
                "languages": {
                    lang: {
                        "buggy_code": variant.buggy_code,
                        "fixed_code": variant.fixed_code,
                        "test_cases": [
                            {
                                "input": tc.input,
                                "expected": tc.expected,
                                "description": tc.description
                            }
                            for tc in variant.test_cases
                        ]
                    }
                    for lang, variant in q.languages.items()
                }
            }
            for q in bug_hunt_questions
        ]
        lobby_doc["problem_id"] = None
        lobby_doc["problem_ids"] = []
        lobby_doc["total_problems"] = len(bug_hunt_questions)
        lobby_doc["buggy_code"] = None  # Set per-question
    else:
        # MongoDB problems for other modes
        lobby_doc["problem_id"] = lobby_in.problem_id  # Legacy field (first problem)
        lobby_doc["problem_ids"] = selected_problem_ids  # Array of all problems
        lobby_doc["total_problems"] = len(selected_problem_ids)
        lobby_doc["buggy_code"] = buggy_code_content
        lobby_doc["bug_hunt_questions"] = None
    
    result = await db.lobbies.insert_one(lobby_doc)
    lobby_doc["id"] = str(result.inserted_id)
    
    return LobbyPublic(**lobby_doc)

@router.post("/lobby/join")
async def join_lobby(
    join_req: LobbyJoin,
    current_user = Depends(get_current_user)
):
    """Join an existing lobby using game ID"""
    db = get_database()
    
    print(f"🎮 Join lobby request: game_id={join_req.game_id}, user={current_user['username']}")
    
    # Find lobby by game_id (check all statuses first for debugging)
    all_lobbies = await db.lobbies.find_one({"game_id": join_req.game_id.upper()})
    if all_lobbies:
        print(f"   Found lobby with status: {all_lobbies.get('status')}")
    else:
        print(f"   ❌ No lobby found with game_id: {join_req.game_id.upper()}")
    
    # Find lobby by game_id
    lobby = await db.lobbies.find_one({
        "game_id": join_req.game_id.upper(),
        "status": "waiting"
    })
    
    if not lobby:
        # Provide more specific error messages
        if all_lobbies:
            status = all_lobbies.get('status')
            if status == "active":
                raise HTTPException(status_code=400, detail="Game has already started. Cannot join.")
            elif status == "completed":
                raise HTTPException(status_code=400, detail="Game has already ended. Cannot join.")
            else:
                raise HTTPException(status_code=400, detail=f"Lobby is not accepting players (status: {status})")
        else:
            raise HTTPException(status_code=404, detail="Lobby not found. Please check the Game ID.")
    
    # Check if lobby is full
    current_players = len(lobby.get("players", []))
    max_players = lobby.get("max_players", 15)
    
    if current_players >= max_players:
        raise HTTPException(status_code=400, detail="Lobby is full")
    
    # Check if user already in lobby
    user_id = current_user["id"]
    for player in lobby.get("players", []):
        if player.get("user_id") == user_id:
            raise HTTPException(status_code=400, detail="You are already in this lobby")
    
    # Add player to lobby
    new_player = {
        "user_id": user_id,
        "username": current_user["username"],
        "code": "",
        "completed": False,
        "time_elapsed": 0.0,
        "used_hints": False,
        "submission_time": None,
        "score": 0,
        "rank": None,
        "shuffled_lines": lobby.get("shuffled_lines"),  # Same shuffled lines for all players
        "arranged_code": None,
        "test_cases_created": None,
        "test_cases_score": None,
        # Multi-problem race fields
        "current_problem_index": 0,
        "problems_solved": 0,
        "submissions": []
    }
    
    await db.lobbies.update_one(
        {"_id": lobby["_id"]},
        {"$push": {"players": new_player}}
    )
    
    # Fetch updated lobby
    updated_lobby = await db.lobbies.find_one({"_id": lobby["_id"]})
    updated_lobby["id"] = str(updated_lobby["_id"])
    
    return {
        "message": f"Joined lobby: {updated_lobby['lobby_name']}",
        "lobby": LobbyPublic(**updated_lobby)
    }

@router.get("/lobby/list", response_model=List[LobbyPublic])
async def list_lobbies(
    game_mode: Optional[str] = None,
    status: Optional[str] = "waiting",
    current_user = Depends(get_current_user)
):
    """List available lobbies"""
    db = get_database()
    
    query = {}
    if status:
        query["status"] = status
    if game_mode:
        query["game_mode"] = game_mode
    
    print(f"📋 Listing lobbies with query: {query}")
    
    cursor = db.lobbies.find(query).sort("created_at", -1).limit(50)
    results = []
    
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        results.append(LobbyPublic(**doc))
    
    print(f"   Found {len(results)} lobbies")
    
    return results

@router.get("/lobby/{game_id}", response_model=LobbyPublic)
async def get_lobby(
    game_id: str,
    current_user = Depends(get_current_user)
):
    """Get details of a specific lobby by game ID"""
    db = get_database()
    
    print(f"🔍 Fetching lobby: game_id={game_id}, user={current_user['username']}")
    
    lobby = await db.lobbies.find_one({"game_id": game_id.upper()})
    if not lobby:
        print(f"   ❌ Lobby not found: {game_id}")
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    print(f"   ✅ Lobby found: {lobby.get('lobby_name')}, status={lobby.get('status')}, players={len(lobby.get('players', []))}")
    
    lobby["id"] = str(lobby["_id"])
    return LobbyPublic(**lobby)

@router.post("/lobby/{game_id}/start")
async def start_lobby(
    game_id: str,
    current_user = Depends(get_current_user)
):
    """Start a lobby game (only host can start)"""
    db = get_database()
    
    lobby = await db.lobbies.find_one({"game_id": game_id.upper()})
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    # Check if current user is host
    if lobby["host_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the host can start the game")
    
    # Check if lobby is in waiting status
    if lobby["status"] != "waiting":
        raise HTTPException(status_code=400, detail="Game already started or completed")
    
    # Check if there are at least 2 players
    if len(lobby.get("players", [])) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 players to start")
    
    # Create a match from the lobby
    match_doc = {
        "game_id": game_id.upper(),
        "problem_id": lobby.get("problem_id"),
        "game_mode": lobby["game_mode"],
        "buggy_code": lobby.get("buggy_code"),
        "host_id": lobby["host_id"],
        "max_players": lobby["max_players"],
        "players": lobby["players"],
        "time_limit_seconds": lobby["time_limit_seconds"],
        "status": "active",
        "winner_id": None,
        "winners": [],
        "created_at": lobby["created_at"],
        "started_at": datetime.utcnow(),
        "completed_at": None
    }
    
    # Add quiz-specific fields if Code Quiz mode
    if lobby["game_mode"] == "code_quiz":
        match_doc["quiz_language"] = lobby.get("quiz_language")
        match_doc["quiz_question_count"] = lobby.get("quiz_question_count")
        match_doc["quiz_questions"] = lobby.get("quiz_questions", [])
    
    # Add Bug Hunt questions if Bug Hunt mode
    if lobby["game_mode"] == "bug_hunt":
        match_doc["bug_hunt_questions"] = lobby.get("bug_hunt_questions", [])
        match_doc["problem_ids"] = []  # No MongoDB problems
        match_doc["total_problems"] = len(lobby.get("bug_hunt_questions", []))
    
    result = await db.matches.insert_one(match_doc)
    match_id = str(result.inserted_id)
    
    # Update lobby status
    await db.lobbies.update_one(
        {"_id": lobby["_id"]},
        {
            "$set": {
                "status": "active",
                "started_at": datetime.utcnow(),
                "match_id": match_id
            }
        }
    )
    
    return {
        "message": "Game started!",
        "match_id": match_id,
        "game_id": game_id.upper()
    }

@router.post("/lobby/{game_id}/leave")
async def leave_lobby(
    game_id: str,
    current_user = Depends(get_current_user)
):
    """Leave a lobby"""
    db = get_database()
    
    lobby = await db.lobbies.find_one({"game_id": game_id.upper()})
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    # Can't leave if game already started
    if lobby["status"] != "waiting":
        raise HTTPException(status_code=400, detail="Cannot leave after game started")
    
    user_id = current_user["id"]
    
    # Remove player from lobby
    players = lobby.get("players", [])
    updated_players = [p for p in players if p.get("user_id") != user_id]
    
    if len(updated_players) == len(players):
        raise HTTPException(status_code=400, detail="You are not in this lobby")
    
    # If host leaves, transfer host to next player or delete lobby if empty
    if lobby["host_id"] == user_id:
        if len(updated_players) > 0:
            new_host = updated_players[0]
            await db.lobbies.update_one(
                {"_id": lobby["_id"]},
                {
                    "$set": {
                        "host_id": new_host["user_id"],
                        "host_username": new_host["username"],
                        "players": updated_players
                    }
                }
            )
            return {"message": f"Left lobby. New host: {new_host['username']}"}
        else:
            # No players left, delete lobby
            await db.lobbies.delete_one({"_id": lobby["_id"]})
            return {"message": "Lobby closed (no players remaining)"}
    else:
        # Regular player leaving
        await db.lobbies.update_one(
            {"_id": lobby["_id"]},
            {"$set": {"players": updated_players}}
        )
        return {"message": "Left lobby"}

@router.post("/matches", response_model=MatchPublic)
async def create_match(
    match_in: MatchCreate,
    current_user = Depends(get_current_user)
):
    """Create a new competitive match"""
    db = get_database()
    
    # Verify problem exists
    try:
        problem_oid = ObjectId(match_in.problem_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid problem id")
    
    problem = await db.problems.find_one({"_id": problem_oid})
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Get player usernames
    player1 = await db.users.find_one({"_id": ObjectId(match_in.player1_id)})
    player2 = await db.users.find_one({"_id": ObjectId(match_in.player2_id)})
    
    if not player1 or not player2:
        raise HTTPException(status_code=404, detail="One or both players not found")
    
    # Prepare game mode specific data
    shuffled_lines = None
    buggy_code_content = None
    
    if match_in.game_mode == "code_shuffle":
        # Use reference code for shuffling
        reference_code = problem.get("referenceCode", {}).get("python", "")
        if reference_code:
            shuffled_lines = shuffle_code_lines(reference_code)
    elif match_in.game_mode == "bug_hunt":
        # Generate buggy code if not already in problem, or use existing buggyCode
        existing_buggy = problem.get("buggyCode", {}).get("python", "")
        if existing_buggy:
            buggy_code_content = existing_buggy
            print(f"🐛 Using existing buggy code from problem (length: {len(existing_buggy)})")
        else:
            # Generate buggy code from reference code, or fall back to starter code
            reference_code = problem.get("referenceCode", {}).get("python", "")
            starter_code = problem.get("starterCode", {}).get("python", "")
            
            code_to_bug = reference_code if reference_code else starter_code
            print(f"🐛 Generating buggy code from {'referenceCode' if reference_code else 'starterCode'}")
            print(f"   Original code length: {len(code_to_bug)}")
            if code_to_bug:
                buggy_code_content = generate_buggy_code(code_to_bug, "python")
                print(f"   Generated buggy code length: {len(buggy_code_content)}")
            else:
                print(f"   ⚠️ No code available to generate bugs from!")
    
    # Create match document
    match_doc = {
        "problem_id": match_in.problem_id,
        "game_mode": match_in.game_mode,
        "buggy_code": buggy_code_content,  # Store buggy code at match level
        "player1": {
            "user_id": match_in.player1_id,
            "username": player1["username"],
            "code": "",
            "completed": False,
            "time_elapsed": 0.0,
            "used_hints": False,
            "submission_time": None,
            "shuffled_lines": shuffled_lines,
            "arranged_code": None,
            "test_cases_created": None,
            "test_cases_score": None
        },
        "player2": {
            "user_id": match_in.player2_id,
            "username": player2["username"],
            "code": "",
            "completed": False,
            "time_elapsed": 0.0,
            "used_hints": False,
            "submission_time": None,
            "shuffled_lines": shuffled_lines,
            "arranged_code": None,
            "test_cases_created": None,
            "test_cases_score": None
        },
        "time_limit_seconds": match_in.time_limit_seconds,
        "status": "waiting",
        "winner_id": None,
        "created_at": datetime.utcnow(),
        "started_at": None,
        "completed_at": None
    }
    
    result = await db.matches.insert_one(match_doc)
    match_doc["id"] = str(result.inserted_id)
    
    return MatchPublic(**match_doc)

@router.get("/matches", response_model=List[MatchPublic])
async def list_matches(
    status: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """List competitive matches (optionally filter by status)"""
    db = get_database()
    
    query = {}
    if status:
        query["status"] = status
    
    # Get user's matches
    user_id = current_user["id"]
    query["$or"] = [
        {"player1.user_id": user_id},
        {"player2.user_id": user_id}
    ]
    
    cursor = db.matches.find(query).sort("created_at", -1).limit(50)
    results = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        results.append(MatchPublic(**doc))
    
    return results

@router.get("/matches/{match_id}", response_model=MatchPublic)
async def get_match(
    match_id: str,
    current_user = Depends(get_current_user)
):
    """Get details of a specific match (supports both 1v1 and multiplayer)"""
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match["id"] = str(match["_id"])
    
    # Ensure backwards compatibility with legacy 1v1 matches
    # If it's a multiplayer match, set player1 and player2 to None for schema compatibility
    if match.get("players"):
        if not match.get("player1"):
            match["player1"] = None
        if not match.get("player2"):
            match["player2"] = None
    
    return MatchPublic(**match)

@router.post("/matches/{match_id}/start")
async def start_match(
    match_id: str,
    current_user = Depends(get_current_user)
):
    """Start a competitive match"""
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match["status"] != "waiting":
        raise HTTPException(status_code=400, detail="Match already started or completed")
    
    # Update match status
    await db.matches.update_one(
        {"_id": match_oid},
        {
            "$set": {
                "status": "active",
                "started_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Match started", "match_id": match_id}

@router.post("/matches/{match_id}/submit")
async def submit_solution(
    match_id: str,
    submission: MatchSubmit,
    current_user = Depends(get_current_user)
):
    """Submit a solution for a competitive match (supports both 1v1 and multiplayer)"""
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match["status"] != "active":
        raise HTTPException(status_code=400, detail="Match is not active")
    
    user_id = current_user["id"]
    
    # Check if this is multiplayer match or 1v1
    is_multiplayer = match.get("players") is not None
    
    if is_multiplayer:
        # Multiplayer match
        players = match.get("players", [])
        player_index = None
        
        for idx, player in enumerate(players):
            if player.get("user_id") == user_id:
                player_index = idx
                break
        
        if player_index is None:
            raise HTTPException(status_code=403, detail="You are not a participant in this match")
        
        # Check if already submitted
        if players[player_index].get("completed"):
            raise HTTPException(status_code=400, detail="You have already submitted a solution")
    else:
        # Legacy 1v1 match - determine which player is submitting
        if match["player1"]["user_id"] == user_id:
            player_key = "player1"
            opponent_key = "player2"
        elif match["player2"]["user_id"] == user_id:
            player_key = "player2"
            opponent_key = "player1"
        else:
            raise HTTPException(status_code=403, detail="You are not a participant in this match")
        
        # Check if already submitted
        if match[player_key]["completed"]:
            raise HTTPException(status_code=400, detail="You have already submitted a solution")
    
    # Multi-problem race: Get current problem based on player's progress
    if is_multiplayer:
        current_problem_index = players[player_index].get("current_problem_index", 0)
    else:
        current_problem_index = match[player_key].get("current_problem_index", 0)
    
    # Check if this is Bug Hunt mode with JSON questions
    bug_hunt_questions = match.get("bug_hunt_questions", [])
    
    if bug_hunt_questions:
        # Bug Hunt mode: Use JSON questions
        total_problems = len(bug_hunt_questions)
        
        # Validate current problem index
        if current_problem_index >= total_problems:
            raise HTTPException(status_code=400, detail="All problems already completed")
        
        # Get current question
        current_question = bug_hunt_questions[current_problem_index]
        problem = None  # No MongoDB problem
    else:
        # Other modes: Use MongoDB problems
        # Get problem IDs array (fallback to single problem_id for backward compatibility)
        problem_ids = match.get("problem_ids", [match.get("problem_id")])
        total_problems = match.get("total_problems", len(problem_ids))
        
        # Validate current problem index
        if current_problem_index >= len(problem_ids):
            raise HTTPException(status_code=400, detail="All problems already completed")
        
        # Get current problem
        current_problem_id = problem_ids[current_problem_index]
        problem = await db.problems.find_one({"_id": ObjectId(current_problem_id)})
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")
        current_question = None
    
    game_mode = match.get("game_mode", "standard")
    
    # Handle different game modes
    all_passed = False
    score = 0
    
    if game_mode == "bug_hunt":
        # Bug Hunt: Player must fix the buggy code and make it pass all test cases
        # Use Piston API for real compilation
        from app.services.piston_executor import PistonExecutor
        piston = PistonExecutor()
        
        # Get test cases from JSON question or MongoDB problem
        if current_question:
            # JSON question - get test cases for the current language
            lang_key = submission.language if submission.language != "cpp" else "cpp"
            test_cases = current_question.get("languages", {}).get(lang_key, {}).get("test_cases", [])
        else:
            # MongoDB problem
            test_cases = problem.get("testCases", [])
        
        passed_tests = 0
        total_tests = len(test_cases)
        failed_test = None
        compilation_error = None
        
        for test_case in test_cases:
            result = await piston.execute_code(
                submission.code,
                submission.language,
                test_case.get("input", "")
            )
            
            # Check for compilation/runtime errors
            if not result.success:
                compilation_error = result.compile_error or result.runtime_error
                failed_test = test_case
                break
            
            expected_output = test_case["expected"].strip()
            actual_output = result.output.strip()
            
            if actual_output == expected_output:
                passed_tests += 1
            else:
                failed_test = test_case
                break
        
        # Calculate score based on passed tests
        all_passed = passed_tests == total_tests
        score = int((passed_tests / total_tests) * 100) if total_tests > 0 else 0
        
        # If not all passed and not force_submit, return validation result
        if not all_passed and not submission.force_submit:
            validation_response = {
                "validation_failed": True,
                "all_passed": False,
                "passed_tests": passed_tests,
                "total_tests": total_tests,
                "score": score,
                "compilation_error": compilation_error,
                "failed_test": {
                    "input": failed_test.get("input", "") if failed_test else "",
                    "expected": failed_test.get("expected", "") if failed_test else "",
                } if failed_test else None
            }
            print(f"🚫 Bug Hunt validation failed - returning validation response:")
            print(f"   Passed: {passed_tests}/{total_tests}, Score: {score}%")
            print(f"   force_submit: {submission.force_submit}")
            return validation_response
        
        # If force_submit or all_passed, continue with submission
        # Variables are already set: all_passed, score, passed_tests, total_tests
    
    elif game_mode == "code_shuffle":
        # Code Shuffle: Rearrange shuffled lines in correct order
        if not submission.arranged_lines:
            raise HTTPException(status_code=400, detail="No arranged lines provided")
        
        reference_code = problem.get("referenceCode", {}).get(submission.language, "")
        if not reference_code:
            raise HTTPException(status_code=400, detail="No reference code available")
        
        # Join arranged lines with indentation normalization
        arranged_code = normalize_code_indentation(submission.arranged_lines)
        
        # Execute the arranged code against test cases
        test_cases = problem.get("testCases", [])
        
        # Validate that problem has test cases with inputs
        if not test_cases:
            raise HTTPException(status_code=400, detail="Problem has no test cases defined")
        
        # Check if test cases have empty inputs (malformed test data)
        valid_test_cases = [tc for tc in test_cases if tc.get("input", "").strip()]
        if not valid_test_cases:
            print(f"  ⚠️ WARNING: All test cases have empty inputs! Using arrangement anyway.")
            # If all test cases are empty, consider the arrangement valid (test data issue, not code issue)
            score = 100
            all_passed = True
        else:
            all_passed = True
            passed_count = 0
            failed_test = None
            
            print(f"🔀 Executing Code Shuffle arrangement:")
            print(f"  - Arranged code:\n{arranged_code}")
            print(f"  - Testing against {len(valid_test_cases)} valid test cases")
            
            for test_case in valid_test_cases:
                test_input = test_case.get("input", "").strip()
                
                result = await code_executor.execute_code(
                    arranged_code,
                    submission.language,
                    test_input
                )
                
                expected_output = test_case.get("expected", "").strip()
                actual_output = result.get("output", "").strip()
                
                print(f"  - Test: input={test_input[:50]}{'...' if len(test_input) > 50 else ''}, expected={expected_output}, actual={actual_output}, success={result.get('success')}")
                
                if result["success"] and actual_output == expected_output:
                    passed_count += 1
                else:
                    all_passed = False
                    if not failed_test:
                        failed_test = {
                            "input": test_input,
                            "expected": expected_output,
                            "actual": actual_output,
                            "error": result.get("error", "")
                        }
        
        if not all_passed:
            error_msg = f"Arranged code doesn't pass all tests! ({passed_count}/{len(valid_test_cases)} passed)"
            if failed_test:
                error_msg += f"\nFailed test:\n  Input: {failed_test['input']}\n  Expected: {failed_test['expected']}\n  Got: {failed_test['actual']}"
                # Check if it's an indentation error
                if failed_test.get('error') and ('IndentationError' in failed_test['error'] or 'indent' in failed_test['error'].lower()):
                    error_msg += f"\n\n[HINT] Indentation Error Detected!\nThe code lines might be in the wrong order or have mismatched indentation levels."
                    error_msg += f"\nMake sure control structures (if/for/while/def) come before their bodies."
                elif failed_test.get('error'):
                    error_msg += f"\n  Error: {failed_test['error']}"
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Calculate bonus score based on arrangement accuracy
        accuracy_score = calculate_code_shuffle_score(reference_code, submission.arranged_lines)
        score = 100  # Base score for passing all tests
        
        print(f"  - ✅ All tests passed! Arrangement accuracy: {accuracy_score}%")
    
    elif game_mode == "test_master":
        # Test Master: Create comprehensive test cases for a problem
        if not submission.test_cases:
            raise HTTPException(status_code=400, detail="No test cases provided")
        
        reference_code = problem.get("referenceCode", {}).get(submission.language, "")
        score = evaluate_test_cases(submission.test_cases, reference_code, submission.language)
        
        # Require at least 60 points to pass
        if score < 60:
            raise HTTPException(status_code=400, detail=f"Test cases quality too low: {score}/100. Need at least 60")
        
        all_passed = True
    
    else:
        # Standard mode: Execute code against test cases
        test_cases = problem.get("testCases", [])
        
        # Filter out test cases with empty inputs to avoid EOF errors
        valid_test_cases = [tc for tc in test_cases if tc.get("input", "").strip()]
        
        if not valid_test_cases:
            # If all test cases have empty inputs, we can't validate
            print(f"  ⚠️ WARNING: All test cases in problem have empty inputs! Accepting solution.")
            all_passed = True
            score = 100
        else:
            all_passed = True
            passed_count = 0
            
            print(f"[INFO] Standard mode: Testing against {len(valid_test_cases)} valid test cases")
            
            for test_case in valid_test_cases:
                test_input = test_case.get("input", "").strip()
                result = await code_executor.execute_code(
                    submission.code,
                    submission.language,
                    test_input
                )
                
                if result["success"] and result["output"].strip() == test_case.get("expected", "").strip():
                    passed_count += 1
                else:
                    all_passed = False
            
            if not all_passed:
                raise HTTPException(status_code=400, detail=f"Solution did not pass all test cases ({passed_count}/{len(valid_test_cases)} passed)")
            
            score = 100  # Full score for passing all tests
    
    # Calculate time elapsed
    time_elapsed = (datetime.utcnow() - match["started_at"]).total_seconds()
    
    # Calculate final score with time bonus
    # Time bonus only applies if at least some tests passed
    time_limit = match.get("time_limit_seconds", 1800)
    time_ratio = min(time_elapsed / time_limit, 1.0)
    
    if score > 0:
        # Only give time bonus if player passed at least one test
        time_bonus = int((1 - time_ratio) * 50)  # Up to 50 bonus points for speed
        final_score = score + time_bonus
    else:
        # No time bonus for 0% score
        time_bonus = 0
        final_score = 0
    
    # Update player submission
    if is_multiplayer:
        # Multi-problem race: Increment progress
        new_problem_index = current_problem_index + 1
        new_problems_solved = players[player_index].get("problems_solved", 0) + 1
        
        # Create submission record
        # For Bug Hunt, use question ID; for others, use problem ID
        record_id = current_question["id"] if current_question else current_problem_id
        submission_record = {
            "problem_id": record_id,
            "time": time_elapsed,
            "score": final_score,
            "passed": True
        }
        
        # Update specific player in players array
        update_data = {
            f"players.{player_index}.code": submission.code,
            f"players.{player_index}.time_elapsed": time_elapsed,
            f"players.{player_index}.submission_time": datetime.utcnow(),
            f"players.{player_index}.score": final_score,
            f"players.{player_index}.current_problem_index": new_problem_index,
            f"players.{player_index}.problems_solved": new_problems_solved
        }
        
        # Only mark as completed if all problems solved
        if new_problem_index >= total_problems:
            update_data[f"players.{player_index}.completed"] = True
        
        if game_mode == "code_shuffle":
            update_data[f"players.{player_index}.arranged_code"] = arranged_code
        elif game_mode == "test_master":
            update_data[f"players.{player_index}.test_cases_created"] = submission.test_cases
            update_data[f"players.{player_index}.test_cases_score"] = score
        
        # Add submission record to array
        await db.matches.update_one(
            {"_id": match_oid},
            {
                "$set": update_data,
                "$push": {f"players.{player_index}.submissions": submission_record}
            }
        )
        
        # Check if all players completed
        updated_match = await db.matches.find_one({"_id": match_oid})
        all_completed = all(p.get("completed", False) for p in updated_match.get("players", []))
        
        if all_completed:
            # Rank players by score (higher is better), then by time (faster is better)
            players_with_rank = sorted(
                updated_match["players"],
                key=lambda p: (-p.get("score", 0), p.get("time_elapsed", float('inf')))
            )
            
            # Assign ranks and update
            for rank, player in enumerate(players_with_rank, 1):
                await db.matches.update_one(
                    {
                        "_id": match_oid,
                        "players.user_id": player["user_id"]
                    },
                    {"$set": {"players.$.rank": rank}}
                )
            
            # Get top 3 winners
            winners = [p["user_id"] for p in players_with_rank[:3]]
            winner_id = winners[0] if winners else None
            
            # Mark match as completed
            await db.matches.update_one(
                {"_id": match_oid},
                {
                    "$set": {
                        "status": "completed",
                        "completed_at": datetime.utcnow(),
                        "winner_id": winner_id,
                        "winners": winners
                    }
                }
            )
            
            # Update player stats (XP, rating for top 3)
            for rank, player in enumerate(players_with_rank[:3], 1):
                if player["user_id"] != "bot":  # Don't update bots
                    xp_gain = 100 if rank == 1 else (50 if rank == 2 else 25)
                    rating_gain = 30 if rank == 1 else (15 if rank == 2 else 5)
                    
                    await db.users.update_one(
                        {"_id": ObjectId(player["user_id"])},
                        {
                            "$inc": {
                                "xp": xp_gain,
                                "rating": rating_gain
                            }
                        }
                    )
            
            # Fetch the updated match with all player data
            final_match = await db.matches.find_one({"_id": match_oid})
            
            return {
                "message": "Match completed!",
                "rank": next(i + 1 for i, p in enumerate(players_with_rank) if p["user_id"] == user_id),
                "winners": [p["username"] for p in players_with_rank[:3]],
                "winner_id": winner_id,
                "final_score": final_score,
                "players": final_match.get("players", [])
            }
        else:
            # Not all players completed yet
            # Check if current player has more problems to solve
            if new_problem_index < total_problems:
                # Get next problem/question for this player
                if bug_hunt_questions:
                    # Bug Hunt mode: Get next question from JSON
                    next_question = bug_hunt_questions[new_problem_index]
                    
                    # Format as problem-like response
                    next_problem_data = {
                        "id": next_question["id"],
                        "title": next_question["title"],
                        "description": next_question["description"],
                        "difficulty": next_question["difficulty"],
                        "buggyCode": {
                            lang: variant["buggy_code"]
                            for lang, variant in next_question["languages"].items()
                        },
                        "testCases": next_question["languages"].get("python", {}).get("test_cases", [])
                    }
                    
                    return {
                        "message": f"Problem {new_problems_solved}/{total_problems} solved! Loading next problem...",
                        "correct": True,
                        "problems_solved": new_problems_solved,
                        "total_problems": total_problems,
                        "next_problem": next_problem_data,
                        "match_complete": False,
                        "score": final_score,
                        "time_elapsed": time_elapsed,
                        "progress": {
                            "current": new_problem_index + 1,
                            "total": total_problems,
                            "problems_solved": new_problems_solved
                        }
                    }
                else:
                    # Other modes: Get next problem from MongoDB
                    next_problem_id = problem_ids[new_problem_index]
                    next_problem = await db.problems.find_one({"_id": ObjectId(next_problem_id)})
                    
                    if next_problem:
                        # Convert ObjectId to string for JSON serialization
                        next_problem["_id"] = str(next_problem["_id"])
                        
                        return {
                            "message": f"Problem {new_problems_solved}/{total_problems} solved! Loading next problem...",
                            "correct": True,
                            "problems_solved": new_problems_solved,
                            "total_problems": total_problems,
                            "next_problem": next_problem,
                            "match_complete": False,
                            "score": final_score,
                            "time_elapsed": time_elapsed,
                            "progress": {
                                "current": new_problem_index + 1,
                                "total": total_problems,
                                "problems_solved": new_problems_solved
                            }
                        }
            
            # Player finished all problems, waiting for others
            return {
                "message": "All problems solved! Waiting for other players to finish.",
                "correct": True,
                "problems_solved": new_problems_solved,
                "total_problems": total_problems,
                "all_problems_complete": True,
                "time_elapsed": time_elapsed,
                "score": final_score
            }
    else:
        # Legacy 1v1 match handling - Multi-problem support
        new_problem_index = current_problem_index + 1
        new_problems_solved = match[player_key].get("problems_solved", 0) + 1
        
        # Create submission record
        # For Bug Hunt, use question ID; for others, use problem ID
        record_id = current_question["id"] if current_question else current_problem_id
        submission_record = {
            "problem_id": record_id,
            "time": time_elapsed,
            "score": final_score,
            "passed": True
        }
        
        update_data = {
            f"{player_key}.code": submission.code,
            f"{player_key}.time_elapsed": time_elapsed,
            f"{player_key}.submission_time": datetime.utcnow(),
            f"{player_key}.current_problem_index": new_problem_index,
            f"{player_key}.problems_solved": new_problems_solved
        }
        
        # Only mark as completed if all problems solved
        if new_problem_index >= total_problems:
            update_data[f"{player_key}.completed"] = True
        
        if game_mode == "code_shuffle":
            update_data[f"{player_key}.arranged_code"] = arranged_code
        elif game_mode == "test_master":
            update_data[f"{player_key}.test_cases_created"] = submission.test_cases
            update_data[f"{player_key}.test_cases_score"] = score
        
        # Update with submission record
        await db.matches.update_one(
            {"_id": match_oid},
            {
                "$set": update_data,
                "$push": {f"{player_key}.submissions": submission_record}
            }
        )
        
        # Check if match is complete (both players submitted or time limit exceeded)
        match = await db.matches.find_one({"_id": match_oid})
        
        if match["player1"]["completed"] and match["player2"]["completed"]:
            # Determine winner (fastest time wins)
            if match["player1"]["time_elapsed"] < match["player2"]["time_elapsed"]:
                winner_key = "player1"
                loser_key = "player2"
            else:
                winner_key = "player2"
                loser_key = "player1"
            
            winner = match[winner_key]
            loser = match[loser_key]
            
            # Get current ratings
            winner_user = await db.users.find_one({"_id": ObjectId(winner["user_id"])})
            loser_user = await db.users.find_one({"_id": ObjectId(loser["user_id"])})
            
            winner_rating = winner_user.get("rating", 1200) if winner_user else 1200
            loser_rating = loser_user.get("rating", 1200) if loser_user else 1200
            
            # Calculate rating changes
            rating_change = calculate_rating_change(
                winner_rating, loser_rating, winner["used_hints"]
            )
            
            # Calculate XP bonus
            xp_bonus = calculate_xp_bonus(
                winner["time_elapsed"],
                match["time_limit_seconds"],
                winner["used_hints"]
            )
            
            # Update ratings and XP
            if winner_user:
                await db.users.update_one(
                    {"_id": ObjectId(winner["user_id"])},
                    {
                        "$inc": {
                            "rating": rating_change,
                            "xp": xp_bonus
                        }
                    }
                )
            
            if loser_user:
                await db.users.update_one(
                    {"_id": ObjectId(loser["user_id"])},
                    {
                        "$inc": {
                            "rating": -rating_change
                        }
                    }
                )
            
            # Update match as completed
            await db.matches.update_one(
                {"_id": match_oid},
                {
                    "$set": {
                        "status": "completed",
                        "winner_id": winner["user_id"],
                        "completed_at": datetime.utcnow()
                    }
                }
            )
            
            return MatchResult(
                match_id=match_id,
                winner_id=winner["user_id"],
                winner_username=winner["username"],
                loser_id=loser["user_id"],
                loser_username=loser["username"],
                winner_time=winner["time_elapsed"],
                loser_time=loser["time_elapsed"],
                rating_change=rating_change,
                xp_bonus=xp_bonus
            )
        
        
        elif match[player_key]["completed"]:
            # Current player finished ALL problems, waiting for opponent
            return {
                "message": "All problems solved! Waiting for opponent to finish.",
                "correct": True,
                "problems_solved": new_problems_solved,
                "total_problems": total_problems,
                "all_problems_complete": True,
                "time_elapsed": time_elapsed
            }
        else:
            # Player hasn't finished all problems yet - return next problem
            if new_problem_index < total_problems:
                # Get next problem/question
                if bug_hunt_questions:
                    # Bug Hunt mode: Get next question from JSON
                    next_question = bug_hunt_questions[new_problem_index]
                    
                    # Format as problem-like response
                    next_problem_data = {
                        "id": next_question["id"],
                        "title": next_question["title"],
                        "description": next_question["description"],
                        "difficulty": next_question["difficulty"],
                        "buggyCode": {
                            lang: variant["buggy_code"]
                            for lang, variant in next_question["languages"].items()
                        },
                        "testCases": next_question["languages"].get("python", {}).get("test_cases", [])
                    }
                    
                    return {
                        "message": f"Problem {new_problems_solved}/{total_problems} solved! Loading next problem...",
                        "correct": True,
                        "problems_solved": new_problems_solved,
                        "total_problems": total_problems,
                        "next_problem": next_problem_data,
                        "match_complete": False,
                        "time_elapsed": time_elapsed,
                        "progress": {
                            "current": new_problem_index + 1,
                            "total": total_problems,
                            "problems_solved": new_problems_solved
                        }
                    }
                else:
                    # Other modes: Get next problem from MongoDB
                    next_problem_id = problem_ids[new_problem_index]
                    next_problem = await db.problems.find_one({"_id": ObjectId(next_problem_id)})
                    
                    if next_problem:
                        # Convert ObjectId to string for JSON serialization
                        next_problem["_id"] = str(next_problem["_id"])
                        
                        return {
                            "message": f"Problem {new_problems_solved}/{total_problems} solved! Loading next problem...",
                            "correct": True,
                            "problems_solved": new_problems_solved,
                            "total_problems": total_problems,
                            "next_problem": next_problem,
                            "match_complete": False,
                            "time_elapsed": time_elapsed,
                            "progress": {
                                "current": new_problem_index + 1,
                                "total": total_problems,
                                "problems_solved": new_problems_solved
                            }
                        }
            
            # Fallback (shouldn't reach here)
            return {
                "message": "Solution submitted successfully.",
                "time_elapsed": time_elapsed
            }

@router.post("/matches/{match_id}/hint")
async def use_hint(
    match_id: str,
    current_user = Depends(get_current_user)
):
    """Mark that a player used a hint (reduces potential XP bonus)"""
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    user_id = current_user["id"]
    
    # Handle both match formats: player1/player2 (old) and players array (new Bug Hunt)
    player_key = None
    if match.get("players"):
        # New format with players array
        for idx, player in enumerate(match["players"]):
            if player.get("user_id") == user_id:
                player_key = f"players.{idx}"
                break
    elif match.get("player1") and match.get("player2"):
        # Old format with player1/player2
        if match["player1"]["user_id"] == user_id:
            player_key = "player1"
        elif match["player2"]["user_id"] == user_id:
            player_key = "player2"
    
    if not player_key:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")
    
    await db.matches.update_one(
        {"_id": match_oid},
        {"$set": {f"{player_key}.used_hints": True}}
    )
    
    return {"message": "Hint used (XP bonus reduced)"}

@router.post("/matches/{match_id}/leave")
async def leave_match(match_id: str, current_user: dict = Depends(get_current_user)):
    """Leave/forfeit from a competitive match"""
    db = get_database()
    try:
        match_oid = ObjectId(match_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Match is already completed")
    
    user_id = current_user["id"]
    is_multiplayer = match.get("players") is not None
    
    if is_multiplayer:
        players = match.get("players", [])
        player_index = None
        for idx, player in enumerate(players):
            if player["user_id"] == user_id:
                player_index = idx
                break
        
        if player_index is None:
            raise HTTPException(status_code=403, detail="Not a participant")
        
        await db.matches.update_one({"_id": match_oid}, {"$set": {f"players.{player_index}.completed": True}})
    else:
        player1_id = match.get("player1", {}).get("user_id")
        player2_id = match.get("player2", {}).get("user_id")
        
        if user_id == player1_id:
            winner_id = player2_id
        elif user_id == player2_id:
            winner_id = player1_id
        else:
            raise HTTPException(status_code=403, detail="Not a participant")
        
        await db.matches.update_one(
            {"_id": match_oid},
            {"$set": {
                "status": "completed",
                "winner_id": winner_id,
                "completed_at": datetime.utcnow()
            }}
        )
    
    return {"message": "Left match successfully"}

@router.post("/matchmaking")
async def find_match(
    request: MatchmakingRequest,
    current_user = Depends(get_current_user)
):
    """Find or create a competitive match (matchmaking) with specified game mode"""
    try:
        db = get_database()
        user_id = current_user["id"]
        user_rating = current_user.get("rating", 1200)
        
        game_mode = request.game_mode
        problem_id = request.problem_id
        
        print(f"🎮 Matchmaking request: game_mode={game_mode}, user={current_user['username']}")
        
        # Find waiting matches within rating range (+/- 200)
        query = {
            "status": "waiting",
            "game_mode": game_mode,
            "$or": [
                {"player1.user_id": {"$ne": user_id}},
                {"player2.user_id": {"$ne": user_id}}
            ]
        }
        
        if problem_id:
            query["problem_id"] = problem_id
        
        waiting_match = await db.matches.find_one(query)
    except Exception as e:
        print(f"❌ Error in matchmaking (query): {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    if waiting_match:
        # Join existing match
        match_id = str(waiting_match["_id"])
        
        # Update player2 and auto-start the match
        if not waiting_match.get("player2"):
            await db.matches.update_one(
                {"_id": waiting_match["_id"]},
                {
                    "$set": {
                        "player2": {
                            "user_id": user_id,
                            "username": current_user["username"],
                            "code": "",
                            "completed": False,
                            "time_elapsed": 0.0,
                            "used_hints": False,
                            "submission_time": None,
                            # Multi-problem race fields
                            "current_problem_index": 0,
                            "problems_solved": 0,
                            "submissions": []
                        },
                        "status": "active",
                        "started_at": datetime.utcnow()
                    }
                }
            )
        
        return {"message": "Match found", "match_id": match_id, "action": "joined"}
    else:
        # Create new match and wait for opponent
        # Select problem from pool instead of AI generation
        try:
            # Map game modes to competitive_mode
            mode_mapping = {
                "standard": "standard",
                "bug_hunt": "bug_hunt",
                "code_shuffle": "code_shuffle",
                "test_master": "standard"
            }
            
            competitive_mode = mode_mapping.get(game_mode, "standard")
            print(f"🎲 Selecting random problem for {game_mode} mode (matchmaking)...")
            
            try:
                # Find all problems for this game mode
                cursor = db.problems.find({
                    "created_for_competitive": True,
                    "competitive_mode": competitive_mode
                })
                
                problems = await cursor.to_list(length=None)
                
                if not problems:
                    # Fallback to AI generation
                    print(f"⚠️ No problems in pool, falling back to AI generation...")
                    difficulty = random.choice(["easy", "medium", "hard"])
                    problem_data = generate_competitive_problem(difficulty)
                    
                    difficulty_capitalized = difficulty.capitalize()
                    problem_doc = {
                        "title": problem_data["title"],
                        "description": problem_data["description"],
                        "difficulty": difficulty_capitalized,
                        "testCases": problem_data["testCases"],
                        "examples": problem_data.get("examples", []),
                        "hint": problem_data.get("hint", ""),
                        "starterCode": problem_data.get("starterCode", {}),
                        "topics": ["competitive", "ai-generated"],
                        "created_for_competitive": True,
                        "videoUrl": "",
                        "referenceCode": problem_data.get("referenceCode", {"python": "", "cpp": "", "java": ""}),
                        "buggyCode": {},
                        "explanations": {"approach": [], "complexity": []},
                        "sampleTests": []
                    }
                    
                    result = await db.problems.insert_one(problem_doc)
                    selected_problem_ids = [str(result.inserted_id)]
                    print(f"✅ Generated 1 problem: {problem_data['title']} (ID: {selected_problem_ids[0]})")
                else:
                    # Randomly select 5 problems from pool (or all available if <5)
                    num_problems = min(5, len(problems))
                    selected_problems = random.sample(problems, num_problems)
                    selected_problem_ids = [str(p["_id"]) for p in selected_problems]
                    print(f"✅ Selected {num_problems} problems for matchmaking:")
                    for i, p in enumerate(selected_problems, 1):
                        print(f"   {i}. {p['title']} ({p.get('difficulty', 'Unknown')})")
                    
                problem_id = selected_problem_ids[0]  # First problem ID for legacy compatibility
            except Exception as gen_error:
                print(f"❌ Error selecting problem: {str(gen_error)}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to select problem: {str(gen_error)}"
                )
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Error in problem selection: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Problem selection error: {str(e)}")
        
        try:
            # Prepare game mode specific data
            problem = await db.problems.find_one({"_id": ObjectId(problem_id)})
            shuffled_lines = None
            buggy_code_content = None
            
            if game_mode == "code_shuffle" and problem:
                reference_code = problem.get("referenceCode", {}).get("python", "")
                print(f"🔀 Code Shuffle Mode:")
                print(f"  - Problem ID: {problem_id}")
                print(f"  - Problem title: {problem.get('title', 'N/A')}")
                print(f"  - Problem has referenceCode: {bool(reference_code)}")
                if reference_code:
                    print(f"  - Reference code length: {len(reference_code)} chars")
                    shuffled_lines = shuffle_code_lines(reference_code)
                    print(f"  - Generated {len(shuffled_lines) if shuffled_lines else 0} shuffled lines")
                else:
                    print(f"  - ❌ No reference code found for problem!")
                    # This shouldn't happen if our query is correct, but handle it gracefully
                    raise HTTPException(
                        status_code=400, 
                        detail="Selected problem doesn't have reference code for Code Shuffle mode. Please try again or contact administrator."
                    )
            elif game_mode == "bug_hunt" and problem:
                # Generate buggy code if not already in problem
                existing_buggy = problem.get("buggyCode", {}).get("python", "")
                if existing_buggy:
                    buggy_code_content = existing_buggy
                else:
                    reference_code = problem.get("referenceCode", {}).get("python", "")
                    if reference_code:
                        buggy_code_content = generate_buggy_code(reference_code, "python")
            
            match_doc = {
                "problem_id": problem_id,  # Legacy field (first problem)
                "problem_ids": selected_problem_ids,  # Array of all problems
                "total_problems": len(selected_problem_ids),
                "game_mode": game_mode,
                "buggy_code": buggy_code_content,
                "player1": {
                    "user_id": user_id,
                    "username": current_user["username"],
                    "code": "",
                    "completed": False,
                    "time_elapsed": 0.0,
                    "used_hints": False,
                    "submission_time": None,
                    "shuffled_lines": shuffled_lines,
                    "arranged_code": None,
                    "test_cases_created": None,
                    "test_cases_score": None,
                    # Multi-problem race fields
                    "current_problem_index": 0,
                    "problems_solved": 0,
                    "submissions": []
                },
                "player2": None,  # Will be filled when opponent joins
                "time_limit_seconds": 900,
                "status": "waiting",
                "winner_id": None,
                "created_at": datetime.utcnow(),
                "started_at": None,
                "completed_at": None
            }
            
            result = await db.matches.insert_one(match_doc)
            match_id = str(result.inserted_id)
            
            # Check for waiting opponent with a short timeout (2 seconds)
            # If no opponent found, create a bot opponent
            await asyncio.sleep(2)
            
            # Refresh match to check if someone joined
            updated_match = await db.matches.find_one({"_id": result.inserted_id})
            
            if not updated_match.get("player2"):
                # No opponent found - create a bot opponent
                bot_rating = user_rating + random.randint(-100, 100)
                bot_names = ["CodeBot", "AlgoMaster", "PyThonBot", "JavaJedi", "CppNinja", "RustRacer", "GoGopher"]
                bot_name = random.choice(bot_names)
                
                await db.matches.update_one(
                    {"_id": result.inserted_id},
                    {
                        "$set": {
                            "player2": {
                                "user_id": "bot",
                                "username": bot_name,
                                "code": "",
                                "completed": False,
                                "time_elapsed": 0.0,
                                "used_hints": False,
                                "submission_time": None,
                                "is_bot": True,
                                "bot_rating": bot_rating,
                                "shuffled_lines": shuffled_lines,
                                "arranged_code": None,
                                "test_cases_created": None,
                                "test_cases_score": None
                            },
                            "status": "active",
                            "started_at": datetime.utcnow()
                        }
                    }
                )
                
                # Start bot simulation in background
                asyncio.create_task(simulate_bot_completion(match_id, problem_id, bot_rating))
                
                return {"message": f"Matched with bot opponent: {bot_name}", "match_id": match_id, "action": "bot_matched"}
        except Exception as e:
            print(f"❌ Error creating match: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Match creation error: {str(e)}")
        
        return {"message": "Match created, waiting for opponent", "match_id": match_id, "action": "created"}

@router.get("/leaderboard")
async def get_competitive_leaderboard(
    limit: int = 50,
    current_user = Depends(get_current_user)
):
    """Get competitive mode leaderboard based on rating"""
    db = get_database()
    
    cursor = db.users.find({}).sort("rating", -1).limit(limit)
    leaderboard = []
    
    rank = 1
    async for user in cursor:
        leaderboard.append({
            "rank": rank,
            "username": user["username"],
            "rating": user.get("rating", 1200),
            "xp": user.get("xp", 0),
            "level": user.get("level", 1)
        })
        rank += 1
    
    return leaderboard

@router.post("/generate-problem")
async def generate_random_problem(
    difficulty: str = "easy",
    current_user = Depends(get_current_user)
):
    """Generate a random problem for competitive mode (requires admin)"""
    
    # Only admins can manually generate problems
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_database()
    
    # Generate problem
    problem_data = generate_competitive_problem(difficulty)
    
    # Capitalize difficulty for schema validation
    difficulty_capitalized = difficulty.capitalize() if difficulty in ["easy", "medium", "hard"] else "Easy"
    
    # Insert into database
    problem_doc = {
        "title": problem_data["title"],
        "description": problem_data["description"],
        "difficulty": difficulty_capitalized,
        "testCases": problem_data["testCases"],
        "examples": problem_data.get("examples", []),
        "hint": problem_data.get("hint", ""),
        "starterCode": problem_data.get("starterCode", {}),
        "topics": ["competitive"],
        "created_for_competitive": True,
        # Required fields for ProblemPublic schema
        "videoUrl": "",
        "referenceCode": {"python": "", "cpp": "", "java": ""},
        "buggyCode": {},
        "explanations": {"approach": [], "complexity": []},
        "sampleTests": []
    }
    
    result = await db.problems.insert_one(problem_doc)
    problem_doc["id"] = str(result.inserted_id)
    
    return {
        "message": "Problem generated successfully",
        "problem": problem_doc
    }


# ============================================================================
# CODE QUIZ MODE ENDPOINTS
# ============================================================================

from app.services.quiz_generator import generate_quiz_questions, calculate_quiz_score
from app.schemas.competitive import QuizSubmitResponse, QuizQuestion, QuizResultDetail

@router.post("/matches/{match_id}/submit-quiz", response_model=QuizSubmitResponse)
async def submit_quiz(
    match_id: str,
    submission: MatchSubmit,
    current_user = Depends(get_current_user)
):
    """Submit quiz answers for Code Quiz mode"""
    db = get_database()
    
    print(f"🎯 Quiz submission received:")
    print(f"   Match ID: {match_id}")
    print(f"   User: {current_user['username']}")
    print(f"   Answers: {submission.quiz_answers}")
    print(f"   Time taken: {submission.quiz_time_taken}")
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.get("game_mode") != "code_quiz":
        raise HTTPException(status_code=400, detail="This endpoint is only for Code Quiz mode")
    
    if match["status"] != "active":
        raise HTTPException(status_code=400, detail="Match is not active")
    
    user_id = current_user["id"]
    
    # Find player in multiplayer match
    players = match.get("players", [])
    player_index = None
    
    for idx, player in enumerate(players):
        if player.get("user_id") == user_id:
            player_index = idx
            break
    
    if player_index is None:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")
    
    # Check if already submitted
    if players[player_index].get("completed"):
        raise HTTPException(status_code=400, detail="You have already submitted your quiz")
    
    # Get quiz questions from match
    quiz_questions = match.get("quiz_questions", [])
    if not quiz_questions:
        raise HTTPException(status_code=500, detail="Quiz questions not found")
    
    # Validate submission
    if not submission.quiz_answers:
        raise HTTPException(status_code=400, detail="No answers provided")
    
    if not submission.quiz_time_taken:
        raise HTTPException(status_code=400, detail="Time taken not provided")
    
    # Convert quiz_answers keys to strings (MongoDB requires string keys)
    quiz_answers_str_keys = {str(k): v for k, v in submission.quiz_answers.items()}
    
    # Calculate score
    time_limit = match.get("time_limit_seconds", 300)
    score_data = calculate_quiz_score(
        submission.quiz_answers,  # Use original for calculation
        quiz_questions,
        submission.quiz_time_taken,
        time_limit
    )
    
    # Update player data (use string keys for MongoDB)
    update_data = {
        f"players.{player_index}.quiz_answers": quiz_answers_str_keys,
        f"players.{player_index}.quiz_score": score_data["score"],
        f"players.{player_index}.quiz_correct_count": score_data["correct"],
        f"players.{player_index}.quiz_time_taken": submission.quiz_time_taken,
        f"players.{player_index}.quiz_time_bonus": score_data["time_bonus"],
        f"players.{player_index}.completed": True,
        f"players.{player_index}.submission_time": datetime.utcnow(),
        f"players.{player_index}.score": score_data["score"]
    }
    
    await db.matches.update_one(
        {"_id": match_oid},
        {"$set": update_data}
    )
    
    # Check if all players completed or time expired
    updated_match = await db.matches.find_one({"_id": match_oid})
    all_players = updated_match.get("players", [])
    completed_players = [p for p in all_players if p.get("completed")]
    
    show_leaderboard = len(completed_players) == len(all_players)
    
    # If all completed, calculate final rankings
    leaderboard = None
    if show_leaderboard:
        # Sort by score (descending), then by time (ascending)
        ranked_players = sorted(
            all_players,
            key=lambda p: (-p.get("quiz_score", 0), p.get("quiz_time_taken", float('inf')))
        )
        
        # Assign ranks
        for rank, player in enumerate(ranked_players, 1):
            await db.matches.update_one(
                {
                    "_id": match_oid,
                    "players.user_id": player["user_id"]
                },
                {"$set": {"players.$.rank": rank}}
            )
        
        # Get top 3 winners
        winners = [p["user_id"] for p in ranked_players[:3]]
        winner_id = winners[0] if winners else None
        
        # Mark match as completed
        await db.matches.update_one(
            {"_id": match_oid},
            {
                "$set": {
                    "status": "completed",
                    "completed_at": datetime.utcnow(),
                    "winner_id": winner_id,
                    "winners": winners
                }
            }
        )
        
        # Build leaderboard
        leaderboard = [
            {
                "user_id": p["user_id"],
                "username": p["username"],
                "score": p.get("quiz_score", 0),
                "correct": p.get("quiz_correct_count", 0),
                "time_taken": p.get("quiz_time_taken", 0),
                "rank": rank
            }
            for rank, p in enumerate(ranked_players, 1)
        ]
        
        # Update player stats (XP, rating for top 3)
        for rank, player in enumerate(ranked_players[:3], 1):
            if player["user_id"] != "bot":
                xp_gain = 100 if rank == 1 else (50 if rank == 2 else 25)
                rating_gain = 30 if rank == 1 else (15 if rank == 2 else 5)
                
                await db.users.update_one(
                    {"_id": ObjectId(player["user_id"])},
                    {
                        "$inc": {
                            "xp": xp_gain,
                            "rating": rating_gain
                        }
                    }
                )
    
    return QuizSubmitResponse(
        score=score_data["score"],
        correct=score_data["correct"],
        total=score_data["total"],
        time_bonus=score_data["time_bonus"],
        rank=None if not show_leaderboard else next(
            (i + 1 for i, p in enumerate(sorted(all_players, key=lambda x: (-x.get("quiz_score", 0), x.get("quiz_time_taken", float('inf'))))) 
             if p["user_id"] == user_id),
            None
        ),
        show_leaderboard=show_leaderboard,
        players_finished=len(completed_players),
        total_players=len(all_players),
        leaderboard=leaderboard
    )


@router.get("/matches/{match_id}/quiz-results")
async def get_quiz_results(
    match_id: str,
    current_user = Depends(get_current_user)
):
    """Get detailed quiz results with correct answers and explanations"""
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.get("game_mode") != "code_quiz":
        raise HTTPException(status_code=400, detail="This endpoint is only for Code Quiz mode")
    
    user_id = current_user["id"]
    
    # Find player
    players = match.get("players", [])
    player_data = None
    
    for player in players:
        if player.get("user_id") == user_id:
            player_data = player
            break
    
    if not player_data:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")
    
    if not player_data.get("completed"):
        raise HTTPException(status_code=400, detail="You haven't submitted the quiz yet")
    
    # Get quiz questions and player answers
    quiz_questions = match.get("quiz_questions", [])
    player_answers = player_data.get("quiz_answers", {})
    
    # Build detailed results
    results = []
    for idx, question in enumerate(quiz_questions):
        player_answer = player_answers.get(str(idx))
        correct_answer = question.get("correct_answer")
        is_correct = player_answer == correct_answer if player_answer is not None else False
        
        results.append(QuizResultDetail(
            id=str(question.get("_id", idx)),
            question=question.get("question", ""),
            code=question.get("code"),
            options=question.get("options", []),
            correct_answer=correct_answer,
            player_answer=player_answer,
            is_correct=is_correct,
            explanation=question.get("explanation", ""),
            question_type=question.get("question_type", ""),
            difficulty=question.get("difficulty", "")
        ))
    
    # Calculate performance by difficulty and type
    score_breakdown = {
        "by_difficulty": {},
        "by_type": {}
    }
    
    for idx, question in enumerate(quiz_questions):
        difficulty = question.get("difficulty", "unknown")
        question_type = question.get("question_type", "unknown")
        player_answer = player_answers.get(str(idx))
        is_correct = player_answer == question.get("correct_answer") if player_answer is not None else False
        
        # By difficulty
        if difficulty not in score_breakdown["by_difficulty"]:
            score_breakdown["by_difficulty"][difficulty] = {"correct": 0, "total": 0}
        score_breakdown["by_difficulty"][difficulty]["total"] += 1
        if is_correct:
            score_breakdown["by_difficulty"][difficulty]["correct"] += 1
        
        # By type
        if question_type not in score_breakdown["by_type"]:
            score_breakdown["by_type"][question_type] = {"correct": 0, "total": 0}
        score_breakdown["by_type"][question_type]["total"] += 1
        if is_correct:
            score_breakdown["by_type"][question_type]["correct"] += 1
    
    return {
        "questions": results,
        "score_breakdown": score_breakdown
    }


@router.post("/matches/{match_id}/save-progress")
async def save_quiz_progress(
    match_id: str,
    submission: MatchSubmit,
    current_user = Depends(get_current_user)
):
    """Auto-save quiz progress (for 30+ question quizzes)"""
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.get("game_mode") != "code_quiz":
        raise HTTPException(status_code=400, detail="This endpoint is only for Code Quiz mode")
    
    if match["status"] != "active":
        raise HTTPException(status_code=400, detail="Match is not active")
    
    user_id = current_user["id"]
    
    # Find player
    players = match.get("players", [])
    player_index = None
    
    for idx, player in enumerate(players):
        if player.get("user_id") == user_id:
            player_index = idx
            break
    
    if player_index is None:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")
    
    # Check if already completed
    if players[player_index].get("completed"):
        return {"message": "Quiz already submitted", "saved": False}
    
    # Save progress (answers and current question)
    update_data = {
        f"players.{player_index}.quiz_answers": submission.quiz_answers or {},
        f"players.{player_index}.quiz_current_question": submission.quiz_current_question or 0,
        f"players.{player_index}.last_saved_at": datetime.utcnow()
    }
    
    await db.matches.update_one(
        {"_id": match_oid},
        {"$set": update_data}
    )
    
    return {
        "message": "Progress saved",
        "saved": True,
        "answers_count": len(submission.quiz_answers or {}),
        "current_question": submission.quiz_current_question or 0
    }


@router.get("/matches/{match_id}/questions")
async def get_quiz_questions_chunk(
    match_id: str,
    start: int = Query(0, ge=0),
    end: int = Query(10, ge=1),
    current_user = Depends(get_current_user)
):
    """Get a chunk of quiz questions for lazy loading (50-60 question quizzes)"""
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.get("game_mode") != "code_quiz":
        raise HTTPException(status_code=400, detail="This endpoint is only for Code Quiz mode")
    
    user_id = current_user["id"]
    
    # Verify player is in match
    players = match.get("players", [])
    is_participant = any(p.get("user_id") == user_id for p in players)
    
    if not is_participant:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")
    
    # Get quiz questions
    quiz_questions = match.get("quiz_questions", [])
    total_questions = len(quiz_questions)
    
    # Validate range
    if start >= total_questions:
        return {
            "questions": [],
            "start": start,
            "end": start,
            "total": total_questions,
            "has_more": False
        }
    
    # Clamp end to total questions
    end = min(end, total_questions)
    
    # Get chunk
    chunk = quiz_questions[start:end]
    
    # Remove correct answers from response (don't reveal during quiz)
    safe_chunk = []
    for idx, q in enumerate(chunk, start=start):
        safe_q = {
            "index": idx,
            "question": q.get("question", ""),
            "code": q.get("code"),
            "options": q.get("options", []),
            "question_type": q.get("question_type", ""),
            # Don't include: correct_answer, explanation, difficulty
        }
        safe_chunk.append(safe_q)
    
    return {
        "questions": safe_chunk,
        "start": start,
        "end": end,
        "total": total_questions,
        "has_more": end < total_questions
    }


# ============================================================================
# BUG HUNT PISTON UPGRADE ENDPOINTS
# ============================================================================

from app.schemas.competitive import (
    CodeExecutionRequest, CodeExecutionResponse,
    ExecutionResultResponse, LanguageSwitchRequest, LanguageSwitchResponse
)
from app.services.queue_manager import QueueManager, QueueFullException
from app.services.circuit_breaker import CircuitBreakerOpenException

# Initialize queue manager singleton (will be started on server startup)
queue_manager = None

def get_queue_manager():
    """Get or create queue manager singleton"""
    global queue_manager
    if queue_manager is None:
        queue_manager = QueueManager(
            max_concurrent=5,
            max_queue_size=50,
            max_retries=2
        )
    return queue_manager

@router.post("/matches/{match_id}/execute", response_model=CodeExecutionResponse)
async def execute_code(
    match_id: str,
    request: CodeExecutionRequest,
    current_user = Depends(get_current_user)
):
    """
    Submit code for execution through Piston API (returns immediately with execution_id)
    
    This endpoint queues the code execution and returns immediately with an execution_id
    that can be used to poll for results.
    """
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match["status"] != "active":
        raise HTTPException(status_code=400, detail="Match is not active")
    
    user_id = current_user["id"]
    
    # Verify user is participant
    is_participant = False
    if match.get("players"):
        is_participant = any(p.get("user_id") == user_id for p in match.get("players", []))
    elif match.get("player1") and match.get("player2"):
        is_participant = (match["player1"]["user_id"] == user_id or 
                         match["player2"]["user_id"] == user_id)
    
    if not is_participant:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")
    
    # Validate language
    if request.language not in ['python', 'java', 'cpp']:
        raise HTTPException(status_code=400, detail="Unsupported language. Use 'python', 'java', or 'cpp'")
    
    # Get queue manager
    qm = get_queue_manager()
    
    try:
        # Generate unique execution ID
        import uuid
        execution_id = f"exec_{uuid.uuid4().hex[:12]}"
        
        # Submit to queue
        execution_id = await qm.submit_execution(
            code=request.code,
            language=request.language,
            stdin=request.stdin or "",  # Use stdin from request
            execution_id=execution_id
        )
        
        # Get queue status
        status = qm.get_queue_status()
        
        return CodeExecutionResponse(
            execution_id=execution_id,
            status="queued",
            queue_position=status.pending_count
        )
    
    except QueueFullException as e:
        logger.error(f"Queue full for match {match_id}")
        raise HTTPException(status_code=503, detail=str(e))
    
    except Exception as e:
        logger.error(f"Error submitting execution: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit code for execution")

@router.get("/matches/{match_id}/execution/{execution_id}", response_model=ExecutionResultResponse)
async def get_execution_result(
    match_id: str,
    execution_id: str,
    current_user = Depends(get_current_user)
):
    """
    Poll for execution result
    
    Returns the execution result if complete, or status if still pending.
    """
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    user_id = current_user["id"]
    
    # Verify user is participant
    is_participant = False
    if match.get("players"):
        is_participant = any(p.get("user_id") == user_id for p in match.get("players", []))
    elif match.get("player1") and match.get("player2"):
        is_participant = (match["player1"]["user_id"] == user_id or 
                         match["player2"]["user_id"] == user_id)
    
    if not is_participant:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")
    
    # Get queue manager
    qm = get_queue_manager()
    
    # Get result
    result = await qm.get_result(execution_id)
    
    if result is None:
        # Still pending or not found
        return ExecutionResultResponse(
            execution_id=execution_id,
            status="pending"
        )
    
    # Debug with print
    print(f"DEBUG: Result object type: {type(result)}")
    print(f"DEBUG: Result object: {result}")
    print(f"DEBUG: Result.success type: {type(result.success)}, value: '{result.success}'")
    
    # Result available
    return ExecutionResultResponse(
        execution_id=execution_id,
        status="completed" if result.success else "failed",
        success=result.success,
        output=result.output,
        compile_error=result.compile_error,
        runtime_error=result.runtime_error,
        execution_time=result.execution_time,
        timed_out=result.timed_out
    )

@router.get("/matches/{match_id}/bug-hunt-question")
async def get_bug_hunt_question(
    match_id: str,
    current_user = Depends(get_current_user)
):
    """
    Get the current Bug Hunt question for a match
    
    Returns the question data with buggy code for all languages.
    """
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Verify user is in match
    user_id = current_user["id"]
    is_participant = False
    
    if match.get("players"):
        is_participant = any(p.get("user_id") == user_id for p in match["players"])
    elif match.get("player1") or match.get("player2"):
        is_participant = (
            match.get("player1", {}).get("user_id") == user_id or
            match.get("player2", {}).get("user_id") == user_id
        )
    
    if not is_participant:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")
    
    # Get Bug Hunt questions
    bug_hunt_questions = match.get("bug_hunt_questions", [])
    if not bug_hunt_questions:
        raise HTTPException(status_code=404, detail="No Bug Hunt questions found for this match")
    
    # Find current player's progress
    current_problem_index = 0
    if match.get("players"):
        player = next((p for p in match["players"] if p.get("user_id") == user_id), None)
        if player:
            current_problem_index = player.get("current_problem_index", 0)
    elif match.get("player1", {}).get("user_id") == user_id:
        current_problem_index = match["player1"].get("current_problem_index", 0)
    elif match.get("player2", {}).get("user_id") == user_id:
        current_problem_index = match["player2"].get("current_problem_index", 0)
    
    # Safety check
    if current_problem_index >= len(bug_hunt_questions):
        current_problem_index = len(bug_hunt_questions) - 1
    
    # Get current question
    question = bug_hunt_questions[current_problem_index]
    
    # Format as problem-like response for frontend compatibility
    return {
        "id": question["id"],
        "title": question["title"],
        "description": question["description"],
        "difficulty": question["difficulty"],
        "time_limit": question["time_limit"],
        "hints": question["hints"],
        "buggyCode": {
            lang: variant["buggy_code"]
            for lang, variant in question["languages"].items()
        },
        "testCases": question["languages"].get("python", {}).get("test_cases", []),
        "current_index": current_problem_index,
        "total_questions": len(bug_hunt_questions)
    }

@router.post("/matches/{match_id}/switch-language", response_model=LanguageSwitchResponse)
async def switch_language(
    match_id: str,
    request: LanguageSwitchRequest,
    current_user = Depends(get_current_user)
):
    """
    Switch to different language variant
    
    Returns buggy code in the new language while preserving timer/hints state.
    """
    db = get_database()
    
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid match id")
    
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match["status"] != "active":
        raise HTTPException(status_code=400, detail="Match is not active")
    
    # Validate language
    if request.new_language not in ['python', 'java', 'cpp']:
        raise HTTPException(status_code=400, detail="Unsupported language. Use 'python', 'java', or 'cpp'")
    
    user_id = current_user["id"]
    
    # Verify user is participant
    is_participant = False
    if match.get("players"):
        is_participant = any(p.get("user_id") == user_id for p in match.get("players", []))
    elif match.get("player1") and match.get("player2"):
        is_participant = (match["player1"]["user_id"] == user_id or 
                         match["player2"]["user_id"] == user_id)
    
    if not is_participant:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")
    
    # Get problem or Bug Hunt question to retrieve language variant
    
    # Check if this is a Bug Hunt match with JSON questions
    bug_hunt_questions = match.get("bug_hunt_questions", [])
    if bug_hunt_questions:
        # Get current question index for this player
        current_problem_index = 0
        if match.get("players"):
            player = next((p for p in match["players"] if p.get("user_id") == user_id), None)
            if player:
                current_problem_index = player.get("current_problem_index", 0)
        elif match.get("player1", {}).get("user_id") == user_id:
            current_problem_index = match["player1"].get("current_problem_index", 0)
        elif match.get("player2", {}).get("user_id") == user_id:
            current_problem_index = match["player2"].get("current_problem_index", 0)
        
        # Safety check
        if current_problem_index >= len(bug_hunt_questions):
            current_problem_index = len(bug_hunt_questions) - 1
        
        # Get current question
        question = bug_hunt_questions[current_problem_index]
        
        # Get buggy code for requested language
        if request.new_language not in question.get("languages", {}):
            raise HTTPException(
                status_code=404,
                detail=f"This question is not available in {request.new_language}"
            )
        
        buggy_code = question["languages"][request.new_language]["buggy_code"]
        test_cases = question["languages"][request.new_language]["test_cases"]
        
        return LanguageSwitchResponse(
            buggy_code=buggy_code,
            language=request.new_language,
            test_cases=test_cases
        )
    
    # Otherwise, use MongoDB problem (legacy)
    problem_id = match.get("problem_id")
    if not problem_id:
        raise HTTPException(status_code=400, detail="No problem associated with this match")
    
    try:
        problem = await db.problems.find_one({"_id": ObjectId(problem_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid problem id")
    
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Get buggy code for the requested language
    # First check if problem has buggyCode field with language variants
    buggy_code_variants = problem.get("buggyCode", {})
    
    if request.new_language in buggy_code_variants:
        buggy_code = buggy_code_variants[request.new_language]
    else:
        # Fallback: generate buggy code from reference code
        reference_code = problem.get("referenceCode", {}).get(request.new_language, "")
        if reference_code:
            buggy_code = generate_buggy_code(reference_code, request.new_language)
        else:
            # Last resort: use starter code
            starter_code = problem.get("starterCode", {}).get(request.new_language, "")
            if starter_code:
                buggy_code = generate_buggy_code(starter_code, request.new_language)
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"This question is not available in {request.new_language}"
                )
    
    # Get test cases
    test_cases = problem.get("testCases", [])
    
    # Update match to track language switch (optional - for analytics)
    # Note: We preserve timer and hints state - no changes to those fields
    
    return LanguageSwitchResponse(
        buggy_code=buggy_code,
        language=request.new_language,
        test_cases=test_cases
    )

@router.get("/bug-hunt/questions/{difficulty}")
async def get_bug_hunt_question(
    difficulty: str,
    current_user = Depends(get_current_user)
):
    """
    Get random bug hunt question by difficulty
    
    Returns a question with all language variants (Python, Java, C++).
    """
    from app.services.question_loader import QuestionLoader
    
    db = get_database()
    
    # Validate difficulty
    if difficulty not in ['easy', 'medium', 'hard']:
        raise HTTPException(status_code=400, detail="Difficulty must be 'easy', 'medium', or 'hard'")
    
    # Initialize question loader
    question_loader = QuestionLoader(db=db)
    
    # Ensure questions are preloaded
    if not question_loader._preloaded:
        await question_loader.preload_questions()
    
    # Get random question
    question = await question_loader.get_question(difficulty)
    
    if not question:
        raise HTTPException(
            status_code=404,
            detail=f"No {difficulty} questions available"
        )
    
    # Convert to dict for JSON response
    return {
        "id": question.id,
        "title": question.title,
        "description": question.description,
        "difficulty": question.difficulty,
        "time_limit": question.time_limit,
        "languages": {
            lang: {
                "buggy_code": variant.buggy_code,
                "test_cases": [
                    {
                        "input": tc.input,
                        "expected": tc.expected,
                        "description": tc.description
                    }
                    for tc in variant.test_cases
                ]
            }
            for lang, variant in question.languages.items()
        },
        "hints": question.hints
    }
