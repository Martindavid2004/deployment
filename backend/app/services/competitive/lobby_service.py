"""
Code Quiz lobby creation helpers.

Extracted verbatim from app/routers/competitive.py during the
behavior-preserving refactor. Only ``print()`` calls were routed through
``logger.debug()``. The missing module-level import of
``generate_quiz_questions`` is restored here (it was referenced but never
imported in the router, so the endpoint always returned HTTP 500).
"""

import logging
import random
import string
from datetime import datetime

from fastapi import HTTPException

from app.schemas.competitive import LobbyCreate, LobbyPublic
from app.services.quiz_generator import generate_quiz_questions

logger = logging.getLogger(__name__)


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
    
    logger.debug(f"🎯 Creating Code Quiz lobby:")
    logger.debug(f"   Language: {lobby_in.quiz_language}")
    logger.debug(f"   Questions: {lobby_in.quiz_question_count}")
    logger.debug(f"   Time limit: {lobby_in.time_limit_seconds}s ({lobby_in.time_limit_seconds // 60} minutes)")
    
    # Generate quiz questions
    try:
        quiz_questions = await generate_quiz_questions(
            db,
            lobby_in.quiz_language,
            lobby_in.quiz_question_count
        )
        
        if len(quiz_questions) < lobby_in.quiz_question_count:
            logger.debug(f"⚠️ Warning: Only generated {len(quiz_questions)}/{lobby_in.quiz_question_count} questions")
        
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
        logger.debug(f"❌ Failed to generate quiz questions: {e}")
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
    
    logger.debug(f"✅ Created Code Quiz lobby: {game_id}")
    
    return LobbyPublic(**lobby_doc)
