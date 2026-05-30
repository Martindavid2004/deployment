from fastapi import APIRouter, Depends
from app.security.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me")
async def get_me(current_user = Depends(get_current_user)):
    user = current_user.copy()
    user["id"] = str(user["_id"])
    user.pop("_id", None)  # Remove the ObjectId field
    user.pop("hashed_password", None)
    return user
