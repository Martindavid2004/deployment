from pydantic import BaseModel, Field
from typing import List, Optional

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: Optional[str] = Field(None, min_length=3, max_length=100)
    preferred_language: str = "python"

class UserCreate(UserBase):
    email: str = Field(..., min_length=3, max_length=100, pattern=r"^\S+@\S+\.\S+$")
    password: str = Field(..., min_length=4)

class UserLogin(BaseModel):
    username: str
    password: str

class UserInDB(UserBase):
    id: str
    is_admin: bool = False
    xp: int = 0
    level: int = 1
    achievements: List[str] = []
    rating: int = 1200  # Competitive rating (ELO-style)
    friends: List[str] = []
    friend_requests: List[str] = []
    match_invites: List[dict] = []
    learning_xp: int = 0
    competitive_xp: int = 0
    learning_level: int = 1
    competitive_level: int = 1

class UserPublic(UserBase):
    id: str
    is_admin: bool = False
    xp: int = 0
    level: int = 1
    achievements: List[str] = []
    rating: int = 1200  # Competitive rating (ELO-style)
    friends: List[str] = []
    friend_requests: List[str] = []
    match_invites: List[dict] = []
    learning_xp: int = 0
    competitive_xp: int = 0
    learning_level: int = 1
    competitive_level: int = 1
