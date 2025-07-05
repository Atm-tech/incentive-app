from sqlalchemy import Column, Boolean, DateTime, Integer
from sqlalchemy.sql import func
from db.database import Base  # ✅ Must be correct Base

class SystemState(Base):
    __tablename__ = "system_state"

    id = Column(Integer, primary_key=True, index=True)
    setup_complete = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
