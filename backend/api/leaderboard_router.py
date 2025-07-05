# backend/api/leaderboard_router.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.database import get_db, SessionLocal
from models.sale import Sale  # ✅ Add this import
from models.salesman import Salesman
from datetime import date
from utils.date_range import get_week_range_and_label, get_month_range
from pydantic import BaseModel


from crud.leaderboard_crud import (
    get_leaderboard,
    calculate_leaderboard,
    get_streak_leaderboard,
    update_user_streak,
)

router = APIRouter()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Leaderboard Endpoints ---------------- #

@router.get("/")
def leaderboard_view(
    scope: str = Query(..., pattern="^(day|week|month)₹"),
    db: Session = Depends(get_db)
):
    """
    Generic leaderboard for day/week/month
    """
    return get_leaderboard(db, scope)


@router.get("/day")
def leaderboard_day(db: Session = Depends(get_db)):
    return calculate_leaderboard(db, period="day")

@router.get("/week")
def get_week_leaderboard(db: Session = Depends(get_db)):
    today = date.today()
    start, end, label = get_week_range_and_label(today)

    results = (
        db.query(Salesman.name, func.sum(Sale.amount).label("sales"))
        .join(Salesman, Salesman.id == Sale.salesman_id)
        .filter(func.date(Sale.timestamp) >= start)
        .filter(func.date(Sale.timestamp) <= end)
        .group_by(Salesman.name)
        .order_by(func.sum(Sale.amount).desc())
        .all()
    )

    return {"label": label, "data": [{"name": r.name, "sales": r.sales} for r in results]}




@router.get("/month")
def get_month_leaderboard(db: Session = Depends(get_db)):
    today = date.today()
    start, end, label = get_month_range(today)

    results = (
        db.query(Salesman.name, func.sum(Sale.amount).label("sales"))
        .join(Salesman, Salesman.id == Sale.salesman_id)
        .filter(func.date(Sale.timestamp) >= start)
        .filter(func.date(Sale.timestamp) <= end)
        .group_by(Salesman.name)
        .order_by(func.sum(Sale.amount).desc())
        .all()
    )

    return {"label": label, "data": [{"name": r.name, "sales": r.sales} for r in results]}




@router.get("/streak")
def leaderboard_streak(db: Session = Depends(get_db)):
    return get_streak_leaderboard(db)


# ---------------- Streak Update Endpoint ---------------- #

class StreakUpdate(BaseModel):
    user_id: int
    date: str  # Example: "2025-06-07"

@router.post("/streaks/update")
def update_streak(data: StreakUpdate, db: Session = Depends(get_db)):
    return update_user_streak(db, data.user_id, data.date)
