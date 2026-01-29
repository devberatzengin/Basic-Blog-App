from sqlalchemy.orm import Session
from app.models.follow import Follow
from app.schemas.follow import FollowCreate


def follow_user(db:Session, follow_data:FollowCreate, owner_id:int):
    
    if owner_id == follow_data.following_id:
        return None
    
    follow = Follow(
        follower_id = owner_id,
        following_id = follow_data.following_id
    )
    db.add(follow)
    db.commit()
    db.refresh(follow)
    return follow

