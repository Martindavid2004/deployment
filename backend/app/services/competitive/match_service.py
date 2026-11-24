"""
Match lifecycle helpers: ELO/XP updates, expiry, and bot simulation.

Extracted verbatim from app/routers/competitive.py during the
behavior-preserving refactor. No business logic was changed; only
``print()`` calls were routed through ``logger.debug()``.
"""

import asyncio
import logging
import random
from datetime import datetime

from bson import ObjectId

from app.db.mongo import get_database
from app.services.competitive.scoring import (
    calculate_rating_change,
    calculate_xp_bonus,
)

logger = logging.getLogger(__name__)


async def update_user_competitive_stats(db, user_id: str, rating_change: int, xp_gain: int):
    """Helper to update competitive ELO rating, XP, and level details"""
    from bson import ObjectId
    try:
        user_oid = ObjectId(user_id)
    except Exception:
        logger.warning(f"Invalid user_id for stats update: {user_id}")
        return
    user = await db.users.find_one({"_id": user_oid})
    if not user:
        return
        
    new_rating = max(100, user.get("rating", 1200) + rating_change)
    new_comp_xp = user.get("competitive_xp", 0) + xp_gain
    new_global_xp = user.get("xp", 0) + xp_gain
    
    new_comp_level = (new_comp_xp // 500) + 1
    new_global_level = (new_global_xp // 500) + 1
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "rating": new_rating,
                "competitive_xp": new_comp_xp,
                "xp": new_global_xp,
                "competitive_level": new_comp_level,
                "level": new_global_level
            }
        }
    )

async def complete_expired_match(db, match):
    """Gracefully complete an active match that has timed out"""
    match_id = match["_id"]
    is_multiplayer = match.get("players") is not None
    time_limit = match.get("time_limit_seconds", 900)
    
    logger.debug(f"⌛ Expiring match {match_id} (elapsed time exceeded time limit {time_limit}s)")
    
    # 1. Update players' completed status if they didn't complete
    if is_multiplayer:
        players = match.get("players", [])
        updated_players = []
        for p in players:
            p_completed = p.get("completed", False)
            if not p_completed:
                # Force complete
                p["completed"] = True
                p["time_elapsed"] = float(time_limit)
                p["score"] = p.get("score", 0) # Keep current score or 0
            updated_players.append(p)
            
        # Rank players by score (higher is better), then by time (faster is better)
        players_with_rank = sorted(
            updated_players,
            key=lambda p: (-p.get("score", 0), p.get("time_elapsed", float('inf')))
        )
        
        # Assign ranks
        for rank, p in enumerate(players_with_rank, 1):
            p["rank"] = rank
            
        # Get top 3 winners
        winners = [p["user_id"] for p in players_with_rank[:3]]
        winner_id = winners[0] if winners else None
        
        # Update match
        await db.matches.update_one(
            {"_id": match_id},
            {
                "$set": {
                    "status": "completed",
                    "completed_at": datetime.utcnow(),
                    "winner_id": winner_id,
                    "winners": winners,
                    "players": players_with_rank
                }
            }
        )
        
        # Update ratings/XP
        for rank, p in enumerate(players_with_rank[:3], 1):
            if p["user_id"] != "bot":
                xp_gain = 100 if rank == 1 else (50 if rank == 2 else 25)
                rating_gain = 30 if rank == 1 else (15 if rank == 2 else 5)
                await update_user_competitive_stats(db, p["user_id"], rating_gain, xp_gain)
                
    else:
        # Legacy 1v1 match
        p1 = match.get("player1", {})
        p2 = match.get("player2", {})
        
        if not p1.get("completed"):
            p1["completed"] = True
            p1["time_elapsed"] = float(time_limit)
        if not p2.get("completed"):
            p2["completed"] = True
            p2["time_elapsed"] = float(time_limit)
            
        # Determine winner
        p1_solved = p1.get("problems_solved", 0)
        p2_solved = p2.get("problems_solved", 0)
        p1_time = p1.get("time_elapsed", float('inf'))
        p2_time = p2.get("time_elapsed", float('inf'))
        
        if p1_solved > p2_solved:
            winner_key = "player1"
            loser_key = "player2"
        elif p2_solved > p1_solved:
            winner_key = "player2"
            loser_key = "player1"
        else:
            # Equal problems solved, compare time
            if p1_time < p2_time:
                winner_key = "player1"
                loser_key = "player2"
            elif p2_time < p1_time:
                winner_key = "player2"
                loser_key = "player1"
            else:
                # True tie!
                winner_key = None
                loser_key = None
            
        if winner_key:
            winner = p1 if winner_key == "player1" else p2
            loser = p2 if winner_key == "player1" else p1
            
            winner_id = winner.get("user_id")
            loser_id = loser.get("user_id")
            
            # Calculate rating change and XP bonus
            # Default skill ratings
            winner_rating = 1200
            loser_rating = 1200
            
            # Get ratings from DB if not bot
            if winner_id != "bot":
                winner_user = await db.users.find_one({"_id": ObjectId(winner_id)})
                if winner_user:
                    winner_rating = winner_user.get("rating", 1200)
                    
            if loser_id != "bot":
                loser_user = await db.users.find_one({"_id": ObjectId(loser_id)})
                if loser_user:
                    loser_rating = loser_user.get("rating", 1200)
            
            # Use bot skill if bot
            bot_skill = 1200
            w_rating = bot_skill if winner_id == "bot" else winner_rating
            l_rating = bot_skill if loser_id == "bot" else loser_rating
            
            rating_change = calculate_rating_change(w_rating, l_rating, winner.get("used_hints", False))
            xp_bonus = calculate_xp_bonus(winner.get("time_elapsed", 0), time_limit, winner.get("used_hints", False))
            
            if winner_id != "bot":
                await update_user_competitive_stats(db, winner_id, rating_change, xp_bonus)
            if loser_id != "bot":
                await update_user_competitive_stats(db, loser_id, -rating_change, 0)
                
            winner_id_to_save = winner_id
        else:
            winner_id_to_save = None
            
        await db.matches.update_one(
            {"_id": match_id},
            {
                "$set": {
                    "status": "completed",
                    "winner_id": winner_id_to_save,
                    "completed_at": datetime.utcnow(),
                    "player1": p1,
                    "player2": p2
                }
            }
        )
        
    # Also update lobby to completed
    game_id = match.get("game_id")
    if game_id:
        await db.lobbies.update_one(
            {"game_id": game_id.upper()},
            {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
        )

async def get_match_and_check_expiration(db, match_oid: ObjectId) -> dict:
    """Helper to fetch a match and complete it if active and expired"""
    match = await db.matches.find_one({"_id": match_oid})
    if not match:
        return None
        
    if match.get("status") == "active" and match.get("started_at"):
        time_limit = match.get("time_limit_seconds", 900)
        elapsed = (datetime.utcnow() - match["started_at"]).total_seconds()
        
        if elapsed >= time_limit:
            # Match has expired! Force complete it
            await complete_expired_match(db, match)
            # Refetch match state after expiration updates
            match = await db.matches.find_one({"_id": match_oid})
            
    return match

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
    try:
        match_oid = ObjectId(match_id)
    except Exception:
        logger.warning(f"Invalid match_id in bot completion: {match_id}")
        return
    match = await db.matches.find_one({"_id": match_oid})
    if not match or match.get("status") == "completed":
        return  # Match already finished
    
    # Get problem to generate working solution (skip if problem_id is None, e.g. bug-hunt mode)
    if problem_id is not None:
        try:
            problem_oid = ObjectId(problem_id)
        except Exception:
            logger.warning(f"Invalid problem_id in bot completion: {problem_id}")
            return
        problem = await db.problems.find_one({"_id": problem_oid})
        if not problem:
            return
    else:
        problem = None
    
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
                
                await update_user_competitive_stats(db, player1["user_id"], rating_change, xp_bonus)
        else:
            # Bot won - decrease player rating
            player1_user = await db.users.find_one({"_id": ObjectId(player1["user_id"])})
            if player1_user:
                current_rating = player1_user.get("rating", 1200)
                rating_change = calculate_rating_change(bot_skill, current_rating, False)
                
                await update_user_competitive_stats(db, player1["user_id"], -rating_change, 0)
