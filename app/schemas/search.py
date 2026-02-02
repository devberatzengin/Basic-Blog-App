from pydantic import BaseModel
from typing import List
from app.schemas.user import UserOut
from app.schemas.post import PostOut
from app.schemas.comment import CommentOut

class GlobalSearchResponse(BaseModel):
    users: List[UserOut] = []
    posts: List[PostOut] = []
    comments: List[CommentOut] = [] 