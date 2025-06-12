from sqlalchemy import Column, Integer, Float, Boolean, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    salesman_id = Column(Integer, ForeignKey("salesmen.id"))
    total_amount = Column(Float, nullable=False)
    is_approved = Column(Boolean, default=False)
    remarks = Column(String, nullable=True)
    status = Column(String, default="pending")  # added for rejection tracking
    timestamp = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float)  # amount requested to withdraw
    tx_hash = Column(String, nullable=True)
    salesman = relationship("Salesman", back_populates="claims")

