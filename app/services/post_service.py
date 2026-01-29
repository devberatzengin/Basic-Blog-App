from sqlalchemy.orm import Session
from app.models.post import Post
from app.schemas.post import PostCreate # Şemanı import et

def create_post(db: Session, post_data: PostCreate, owner_id: int):

    post = Post(
        header=post_data.header, 
        description=post_data.description, 
        user_id=owner_id
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

def get_posts(db: Session):
    return db.query(Post).all()

def delete_post(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return False # if post doens't exist
    
    if post.user_id != user_id:
        return None # retrun 403

    db.delete(post)
    db.commit()
    return True