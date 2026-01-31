from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.user import UserRegister, UserLogin
from app.services.auth_service import register_user, authenticate_user
from app.core.security import create_access_token 

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    return register_user(db, user_data)

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="E-posta veya şifre hatalı"
        )
    
    access_token = create_access_token(data={"user_id": user.id})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer"
    }