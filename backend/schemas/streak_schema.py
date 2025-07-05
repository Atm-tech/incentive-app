from pydantic import BaseModel
from datetime import date

class StreakBase(BaseModel):
    date: date
    continued: bool
    day_streak_count: int

class StreakOut(StreakBase):
    id: int
    salesman_id: int

    class Config:
        from_attributes = True
