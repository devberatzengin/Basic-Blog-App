from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserRegister(BaseModel):
    firs_name: str
    last_name: str | None = None
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True