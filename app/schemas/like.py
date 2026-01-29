from pydantic import BaseModel

class LikeCreate(BaseModel):
    post_id: int

#optional we will retrun 201 accually
class LikeOut(BaseModel):
    user_id: int
    post_id: int

    class Config:
        from_attributes = True