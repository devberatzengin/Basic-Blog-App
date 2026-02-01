from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.schemas.user import UserOut
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.post import Post
from app.models.follow import Follow  
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserOut)
def get_my_profile( db: Session = Depends(get_db), current_user = Depends(get_current_user) ):
    post_count = db.query(Post).filter(Post.user_id == current_user.id).count()
    
    follower_count = db.query(Follow).filter(Follow.following_id == current_user.id).count()

    current_user.is_following = False
    current_user.post_count = post_count
    current_user.follower_count = follower_count
    
    return current_user


@router.get("/{user_id}", response_model=UserOut)
def get_user_profile(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    user.post_count = db.query(Post).filter(Post.user_id == user_id).count()
    user.follower_count = db.query(Follow).filter(Follow.following_id == user_id).count()
    
    is_following = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first() is not None
    
    user.is_following = is_following 
    return user