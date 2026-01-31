from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.schemas.user import UserOut
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.post import Post
from app.models.follow import Follow  

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserOut)
def get_my_profile( db: Session = Depends(get_db), current_user = Depends(get_current_user) ):
    post_count = db.query(Post).filter(Post.user_id == current_user.id).count()
    
    follower_count = db.query(Follow).filter(Follow.following_id == current_user.id).count()

    current_user.post_count = post_count
    current_user.follower_count = follower_count
    
    return current_user