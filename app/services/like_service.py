from sqlalchemy.orm import Session
from app.models.like import Like
from app.schemas.like import LikeCreate

def like_post(db: Session, like_data: LikeCreate, owner_id: int):
    like = Like(
        user_id = owner_id,
        post_id = like_data.post_id
    )
    db.add(like)
    db.commit()
    db.refresh(like)
    return like


def toggle_like(db: Session, post_id: int, user_id: int):

    existing_like = db.query(Like).filter(
        Like.post_id == post_id, 
        Like.user_id == user_id
    ).first()

    if existing_like:
        # Unlike
        db.delete(existing_like)
        db.commit()
        return "unliked"
    
    # Like
    new_like = Like(post_id=post_id, user_id=user_id)
    db.add(new_like)
    db.commit()
    return "liked"