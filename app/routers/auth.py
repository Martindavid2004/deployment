from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta

from app.db.mongo import get_database
from app.schemas.user import UserCreate, UserLogin, UserPublic
from app.schemas.auth import Token
from app.security.auth import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.core.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

@router.post("/register", response_model=UserPublic)
async def register(user_in: UserCreate):
    try:
        db = get_database()
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable",
        )

    existing = await db.users.find_one({ "username": user_in.username })
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    is_admin = user_in.username.lower() == "admin"
    doc = {
        "username": user_in.username,
        "hashed_password": hash_password(user_in.password),
        "preferred_language": user_in.preferred_language,
        "is_admin": is_admin,
        "xp": 0,
        "level": 1,
        "achievements": [],
    }
    result = await db.users.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return UserPublic(**doc)

@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    try:
        db = get_database()
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable",
        )

    user = await db.users.find_one({ "username": data.username })
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={ "sub": str(user["_id"]) }, expires_delta=access_token_expires
    )
    return Token(access_token=access_token)
