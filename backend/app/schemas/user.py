from pydantic import BaseModel, Field
from typing import List

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    preferred_language: str = "python"

class UserCreate(UserBase):
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

class UserPublic(UserBase):
    id: str
    is_admin: bool = False
    xp: int = 0
    level: int = 1
    achievements: List[str] = []
    rating: int = 1200  # Competitive rating (ELO-style)
