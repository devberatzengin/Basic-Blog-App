from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.api.deps import get_current_user
from app.schemas.follow import FollowCreate
from app.schemas.user import UserOut # Listeleme için UserOut lazım
from app.models.follow import Follow # Sorgular için model lazım
from app.services import follow_service

router = APIRouter(prefix="/follow", tags=["Follow"])

# --- TAKİP ETME ---
@router.post("/", status_code=status.HTTP_201_CREATED)
def follow(
    follow_data: FollowCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    result = follow_service.follow_user(db, follow_data, current_user.id)
    if result is None:
        raise HTTPException(status_code=400, detail="Kendinizi takip edemezsiniz veya zaten takip ediyorsunuz")
    return {"message": "Succesfully followed.", "is_following": True}

# --- TAKİBİ BIRAKMA ---
@router.delete("/{following_id}")
def unfollow(
    following_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    success = follow_service.unfollow_user(db, current_user.id, following_id)
    if not success:
        raise HTTPException(status_code=404, detail="Follow detail not found.")
    return {"message": "Succesfully unfollowed.", "is_following": False}

# --- TAKİPÇİ LİSTESİ ---
@router.get("/{user_id}/followers", response_model=List[UserOut])
def get_followers(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # 1. Kontrol: Bu profil benim mi? Veya ben bu kişiyi takip ediyor muyum?
    is_following = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first() is not None

    # Eğer kendi profilim değilse VE takip etmiyorsam veriyi gizle
    if user_id != current_user.id and not is_following:
        return [] # Boş liste dönerek kapıları kapatıyoruz

    follows = db.query(Follow).filter(Follow.following_id == user_id).all()
    return [f.follower for f in follows]

@router.get("/{user_id}/following", response_model=List[UserOut])
def get_following(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Aynı kontrolü burası için de yapıyoruz
    is_following = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first() is not None

    if user_id != current_user.id and not is_following:
        return []

    follows = db.query(Follow).filter(Follow.follower_id == user_id).all()
    return [f.following for f in follows]