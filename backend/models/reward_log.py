from sqlalchemy import Column, Integer, String, Date, UniqueConstraint
from db.database import Base

class RewardLog(Base):
    __tablename__ = "reward_log"

    id = Column(Integer, primary_key=True, index=True)
    period = Column(String, index=True)  # "day", "week", "month"
    date = Column(Date, index=True)
    salesman_id = Column(Integer)

    __table_args__ = (UniqueConstraint('period', 'date', name='unique_reward'),)
