from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.db.mongo import get_database
from app.schemas.attempt import AttemptCreate, AttemptPublic
from app.security.auth import get_current_user

router = APIRouter(prefix="/attempts", tags=["attempts"])

@router.post("/", response_model=AttemptPublic)
async def upsert_attempt(
    attempt_in: AttemptCreate,
    current_user = Depends(get_current_user),
):
    db = get_database()
    if attempt_in.user_id != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Cannot submit for another user")

    key = {
        "user_id": attempt_in.user_id,
        "problem_id": attempt_in.problem_id,
        "language": attempt_in.language,
    }
    doc = attempt_in.model_dump()
    existing = await db.attempts.find_one(key)
    
    # Calculate delta XP
    delta_xp = 0
    rounds_new = attempt_in.roundCompleted or {}
    rounds_old = existing.get("roundCompleted") or {} if existing else {}
    
    # Each new round completed grants 25 XP
    for r in ["1", "2", "3", "4"]:
        if rounds_new.get(r) and not rounds_old.get(r):
            delta_xp += 25
            
    # Final completion grants a difficulty-based bonus
    if attempt_in.finalCompleted and (not existing or not existing.get("finalCompleted")):
        difficulty = "easy"
        try:
            # Look up problem to get difficulty
            # problem_id in attempts might be stored as string or int, try both
            prob = await db.problems.find_one({"id": int(attempt_in.problem_id)})
            if not prob:
                prob = await db.problems.find_one({"_id": ObjectId(attempt_in.problem_id)})
            if prob:
                difficulty = str(prob.get("difficulty", "easy")).lower()
        except Exception:
            pass
            
        if difficulty == "easy":
            delta_xp += 100
        elif difficulty == "medium":
            delta_xp += 200
        elif difficulty == "hard":
            delta_xp += 300
        else:
            delta_xp += 100
            
    if delta_xp > 0:
        user_record = await db.users.find_one({"_id": current_user["_id"]})
        if user_record:
            new_learning_xp = user_record.get("learning_xp", 0) + delta_xp
            new_global_xp = user_record.get("xp", 0) + delta_xp
            
            # 500 XP per level
            new_learning_level = (new_learning_xp // 500) + 1
            new_global_level = (new_global_xp // 500) + 1
            
            await db.users.update_one(
                {"_id": current_user["_id"]},
                {
                    "$set": {
                        "learning_xp": new_learning_xp,
                        "xp": new_global_xp,
                        "learning_level": new_learning_level,
                        "level": new_global_level
                    }
                }
            )

    if existing:
        await db.attempts.update_one(key, { "$set": doc })
        existing.update(doc)
        existing["id"] = str(existing["_id"])
        return AttemptPublic(**existing)
    else:
        res = await db.attempts.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        return AttemptPublic(**doc)

@router.get("/me", response_model=List[AttemptPublic])
async def list_my_attempts(current_user = Depends(get_current_user)):
    db = get_database()
    cursor = db.attempts.find({ "user_id": str(current_user["_id"]) })
    results = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        results.append(AttemptPublic(**doc))
    return results
