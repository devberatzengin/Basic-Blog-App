from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, nullable=False)
    first_name = Column(String(25), nullable=False)
    last_name = Column(String(25))
    email = Column(String(30), nullable=False, unique=True)
    phone_number = Column(String(20))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="author", cascade="all, delete")
    comments = relationship("Comment", back_populates="user", cascade="all, delete")
    likes = relationship("Like", back_populates="user", cascade="all, delete")

    following = relationship(
        "Follow",
        foreign_keys="Follow.follower_id",
        back_populates="follower",
        cascade="all, delete"
    )

    followers = relationship(
        "Follow",
        foreign_keys="Follow.following_id",
        back_populates="following",
        cascade="all, delete"
    )