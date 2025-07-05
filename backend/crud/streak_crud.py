from sqlalchemy.orm import Session
from models.streak import Streak
from datetime import date

def get_streaks_for_salesman(db: Session, salesman_id: int):
    return db.query(Streak).filter(Streak.salesman_id == salesman_id).order_by(Streak.date.desc()).all()

def add_or_update_streak(db: Session, salesman_id: int, streak_date: date, continued: bool, day_count: int):
    streak = Streak(
        salesman_id=salesman_id,
        date=streak_date,
        continued=continued,
        day_streak_count=day_count
    )
    db.add(streak)
    db.commit()
    db.refresh(streak)
    return streak
