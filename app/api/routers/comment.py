from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.api.deps import get_current_user
from app.schemas.comment import CommentCreate, CommentOut
from app.services import comment_service

router = APIRouter(prefix="/comments", tags=["Comments"])

@router.post("/", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_new_comment(
    comment_data: CommentCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    return comment_service.create_comment(db, comment_data, current_user.id)

@router.get("/post/{post_id}", response_model=list[CommentOut])
def get_post_comments(post_id: int, db: Session = Depends(get_db)):
    return comment_service.get_comments_by_post(db, post_id)


@router.delete("/{comment_id}")
def delete_user_comment(
    comment_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    success = comment_service.delete_comment(db, comment_id, current_user.id)
    if not success:
        raise HTTPException(status_code=403, detail="Yorum & yetkiniz yok.")
    return {"message": "Comment deleted."}