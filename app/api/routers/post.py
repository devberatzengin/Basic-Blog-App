from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session, joinedload
from app.models.post import Post
from app.models.like import Like
from app.schemas.post import PostCreate, PostOut
from typing import Optional
from app.services.post_service import create_post, get_posts, delete_post as dp
from app.api.deps import get_current_user
from app.database.database import get_db

router = APIRouter(prefix="/posts", tags=["Posts"])

@router.post("/", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_new_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return create_post(db, post_data=post, owner_id=current_user.id)

@router.get("/", response_model=list[PostOut])
def list_posts(db: Session = Depends(get_db)):
    return get_posts(db)

@router.get("/liked-posts", response_model=list[PostOut])
@router.get("/liked-posts/{user_id}", response_model=list[PostOut])
def get_user_liked_posts(
    user_id: Optional[int] = None, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):

    target_id = user_id if user_id is not None else current_user.id
    
    liked_posts = db.query(Post).join(Like).filter(Like.user_id == target_id).all()
    
    for post in liked_posts:
        like_exists = db.query(Like).filter(
            Like.post_id == post.id, 
            Like.user_id == current_user.id
        ).first()
        post.is_liked = True if like_exists else False
        
    return liked_posts

@router.get("/{post_id}", response_model=PostOut)
def get_single_post( post_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user) ):
    post = db.query(Post).options(joinedload(Post.author)).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post bulunamadı.")
    
    is_liked = db.query(Like).filter(
        Like.post_id == post_id, 
        Like.user_id == current_user.id
    ).first() is not None
    
    post.is_liked = is_liked
    return post

@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    result = dp(db, post_id=post_id, user_id=current_user.id)
    
    if result is False:
        raise HTTPException(status_code=404, detail="Post bulunamadı.")
    
    if result is None:
        raise HTTPException(status_code=403, detail="Bu postu silme yetkiniz yok")
    
    return {"message": "Post başarıyla silindi."}
