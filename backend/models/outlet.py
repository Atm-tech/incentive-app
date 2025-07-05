# backend/models/outlet.py
from sqlalchemy import Column, Integer, String
from db.database import Base

class Outlet(Base):
    __tablename__ = "outlets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
