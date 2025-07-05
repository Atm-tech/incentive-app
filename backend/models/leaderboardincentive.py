from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey, DateTime
from datetime import datetime
from db.database import Base

class LeaderboardIncentive(Base):
    __tablename__ = "leaderboard_incentives"
    id = Column(Integer, primary_key=True, index=True)
    day_amount = Column(Float, default=0.0)
    week_amount = Column(Float, default=0.0)
    month_amount = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow)
