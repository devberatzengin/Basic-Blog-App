from pydantic import BaseModel, Field
from datetime import datetime


class UserBasic(BaseModel):
    id: int
    first_name: str

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    user_id: int
    post_id: int
    description: str

class CommentOut(BaseModel):
    id: int
    content: str = Field(alias="description")
    created_at: datetime
    user: UserBasic 

    class Config:
        from_attributes = True