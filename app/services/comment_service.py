from sqlalchemy.orm import Session, joinedload
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
    return db.query(Comment).options(joinedload(Comment.user)).filter(Comment.post_id == post_id).all()

def delete_comment(db: Session, comment_id: int, user_id: int):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        return False 
    
    if comment.user_id != user_id:
        return None # return 403

    db.delete(comment)
    db.commit()
    return True 