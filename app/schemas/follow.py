from pydantic import BaseModel

class FollowCreate(BaseModel):
    following_id: int

#optional
class FollowOut(BaseModel):
    follower_id: int
    following_id: int

    class Config:
        from_attributes = True