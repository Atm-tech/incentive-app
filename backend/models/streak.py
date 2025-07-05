from sqlalchemy import Column, Integer, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db.database import Base

class Streak(Base):
    __tablename__ = "streaks"

    id = Column(Integer, primary_key=True, index=True)
    salesman_id = Column(Integer, ForeignKey("salesmen.id"))
    date = Column(Date, index=True)
    continued = Column(Boolean, default=True)  # True = maintained, False = broken
    day_streak_count = Column(Integer, default=1)

    salesman = relationship("Salesman", back_populates="streaks")
