from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from app.database.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, nullable=False)
    first_name = Column(String(25), nullable=False)
    last_name = Column(String(25))
    email = Column(String(30), nullable=False, unique=True)
    phone_number = Column(String(20))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())