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
