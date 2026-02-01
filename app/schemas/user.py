from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserRegister(BaseModel):
    first_name: str
    last_name: str | None = None
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    first_name: str
    email: EmailStr
    created_at: datetime
    post_count: int = 0
    follower_count: int = 0
    is_following: bool = False

    class Config:
        from_attributes = True