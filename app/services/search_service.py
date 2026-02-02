from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment

def global_search_service(db: Session, query: str):
    q = f"%{query}%"
    
    # Users first_name or email
    users = db.query(User).filter(
        or_(User.first_name.ilike(q), User.email.ilike(q))
    ).limit(5).all()

    # post header or description
    posts = db.query(Post).filter(
        or_(Post.header.ilike(q), Post.description.ilike(q))
    ).limit(5).all()

    # comments description
    comments = db.query(Comment).filter(
        Comment.description.ilike(q)
    ).limit(5).all()

    return {
        "users": users,
        "posts": posts,
        "comments": comments
    }