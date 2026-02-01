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

def unfollow_user(db: Session, follower_id: int, following_id: int):
    follow_record = db.query(Follow).filter(
        Follow.follower_id == follower_id,
        Follow.following_id == following_id
    ).first()

    if follow_record:
        db.delete(follow_record)
        db.commit()
        return True
    return False