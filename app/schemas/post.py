from pydantic import BaseModel, Field
from datetime import datetime


class UserBasic(BaseModel):
    id: int
    first_name: str

    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    header: str
    description: str

class PostUpdate(BaseModel):
    header: str | None = None
    description: str | None = None

class PostOut(BaseModel):
    id: int
    title: str = Field(alias="header")
    content: str = Field(alias="description")
    like_count: int
    created_at: datetime
    author: UserBasic   # relationship buradan gelir

    class Config:
        from_attributes = True