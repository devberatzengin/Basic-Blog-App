from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.user import UserRegister, UserLogin
from app.models.user import User
from app.services.auth_service import register_user as register_service, authenticate_user
from app.core.security import create_access_token 

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kullanımda kanka!")

    new_user = register_service(
        db=db, 
        email=user_data.email, 
        password=user_data.password, 
        first_name=user_data.first_name, 
        last_name=user_data.last_name
    )
    
    return {"message": "Dükkana hoş geldin kanka! Giriş yapabilirsin.", "user_id": new_user.id}

@router.post("/login")
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(status_code=403, detail="E-posta veya şifre hatalı kanka!")

    access_token = create_access_token(data={"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}