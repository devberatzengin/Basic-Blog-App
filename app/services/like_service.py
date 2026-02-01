from sqlalchemy.orm import Session
from app.models.like import Like
from app.schemas.like import LikeCreate
from app.models.post import Post

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
    # Önce postu bulalım
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return "post_not_found"

    existing_like = db.query(Like).filter(
        Like.post_id == post_id, 
        Like.user_id == user_id
    ).first()

    if existing_like:
        # Beğeniyi kaldır
        db.delete(existing_like)
        # Post tablosundaki sayacı düşür
        if post.like_count > 0:
            post.like_count -= 1
        db.commit()
        return "unliked"
    
    # Beğeni ekle
    new_like = Like(post_id=post_id, user_id=user_id)
    db.add(new_like)
    # Post tablosundaki sayacı artır
    post.like_count += 1
    db.commit()
    return "liked"