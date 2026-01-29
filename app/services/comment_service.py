from sqlalchemy.orm import Session
from app.models.comment import Comment 
from app.schemas.comment import CommentCreate 

def create_comment(db: Session, comment_data: CommentCreate, current_user_id: int):
    new_comment = Comment(
        post_id=comment_data.post_id,
        description=comment_data.description,
        user_id=current_user_id # Bunu genellikle login olan kullanıcıdan alırız
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return new_comment

def get_comments_by_post(db: Session, post_id: int):
    return db.query(Comment).filter(Comment.post_id == post_id).all()