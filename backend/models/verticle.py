# models/verticle.py
from sqlalchemy import Column, Integer, String
from db.database import Base

class Verticle(Base):
    __tablename__ = "verticles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # Ensure uniqueness
    description = Column(String, nullable=True)
