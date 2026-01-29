from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token

def register_user(db: Session, email: str, password: str, first_name: str, last_name: str):
    user = User(
        email=email, 
        hashed_password=hash_password(password),
        first_name=first_name,
        last_name=last_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return create_access_token({"user_id": user.id})


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()