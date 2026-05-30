from fastapi import APIRouter, Depends
from bson import ObjectId

from app.db.mongo import get_database
from app.security.auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("/problem/{problem_id}")
async def problem_leaderboard(problem_id: str, current_user = Depends(get_current_user)):
    db = get_database()
    cursor = db.attempts.find({
        "problem_id": problem_id,
        "finalCompleted": True
    })
    entries = []
    async for doc in cursor:
        user = await db.users.find_one({ "_id": ObjectId(doc["user_id"]) })
        if not user:
            continue
        entries.append({
            "user_id": doc["user_id"],
            "username": user["username"],
            "language": doc["language"],
            "time": doc.get("totalTimeSeconds", 0.0)
        })
    entries.sort(key=lambda e: e["time"])
    return entries
