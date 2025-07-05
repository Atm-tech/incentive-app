from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from db.database import Base
from datetime import datetime
class Salesman(Base):
    __tablename__ = "salesmen"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    mobile = Column(String, unique=True, index=True)
    outlet = Column(String, nullable=False)
    verticle = Column(String, nullable=True)  # set after approval
    password = Column(String, nullable=True)  # set after approval
    is_approved = Column(Boolean, default=False)
    wallet_balance = Column(Integer, default=0)
    claims = relationship("Claim", back_populates="salesman")
    sales = relationship("Sale", back_populates="salesman")
    created_at = Column(DateTime, default=datetime.utcnow)
    streaks = relationship("Streak", back_populates="salesman", cascade="all, delete")
    claims = relationship("Claim", back_populates="salesman")

