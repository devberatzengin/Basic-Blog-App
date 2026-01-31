from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.api.deps import get_current_user
from app.schemas.like import LikeCreate
from app.services import like_service

router = APIRouter(prefix="/likes", tags=["Likes"])

@router.post("/toggle", status_code=status.HTTP_200_OK)
def toggle_post_like(
    like_data: LikeCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    status_msg = like_service.toggle_like(db, like_data.post_id, current_user.id)
    return {"message": f"Post {status_msg}"}