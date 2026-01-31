from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.api.deps import get_current_user
from app.schemas.follow import FollowCreate
from app.services import follow_service

router = APIRouter(prefix="/follow", tags=["Follow"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def follow(
    follow_data: FollowCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    result = follow_service.follow_user(db, follow_data, current_user.id)
    if result is None:
        raise HTTPException(status_code=400, detail="Kendinizi takip edemezsiniz veya zaten takip ediyorsunuz")
    return {"message": "Succesfully followed."}

@router.delete("/{following_id}")
def unfollow(
    following_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    success = follow_service.unfollow_user(db, current_user.id, following_id)
    if not success:
        raise HTTPException(status_code=404, detail="Follow detail not found.")
    return {"message": "Succesfully unfollowed."}