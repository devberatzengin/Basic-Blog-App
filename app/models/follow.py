from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, CheckConstraint
from sqlalchemy.sql import func
from app.database.database import Base

class Follow(Base):
    __tablename__ = "follows"
    follower_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    following_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint('follower_id <> following_id', name='check_not_self_follow'),
    )