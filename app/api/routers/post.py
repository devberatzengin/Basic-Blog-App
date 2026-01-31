from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.post import Post
from app.schemas.post import PostCreate, PostOut
from app.services.post_service import create_post, get_posts, delete_post as dp
from app.api.deps import get_current_user
from app.database.database import get_db

router = APIRouter(prefix="/posts", tags=["Posts"])

@router.post("/", response_model=PostOut)
def create_new_post(
                    post: PostCreate,
                    db: Session = Depends(get_db),
                    current_user = Depends(get_current_user)
                    ):
    return create_post(db, post.title, post.content, current_user.id)

@router.get("/", response_model=list[PostOut])
def list_posts(db: Session = Depends(get_db)):
    return get_posts(db)

@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    result = dp(db, post_id=post_id, user_id=current_user.id)
    
    if result is False:
        raise HTTPException(status_code=404, detail="Post unfinded.")
    
    if result is None:
        raise HTTPException(status_code=403, detail="Bu postu silme yetkiniz yok")
    
    return {"message": "Post succesfully deleted."}

@router.get("/{post_id}")
def get_single_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Kanka bu post uçmuş!")
    return post