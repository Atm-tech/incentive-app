from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta, timezone, datetime

from models.sale import Sale
from models.salesman import Salesman
from models.streak import Streak


def calculate_leaderboard(db: Session, period: str = "day"):
    """
    Reusable leaderboard function used by /day, /week, /month.
    Returns top 10 salesmen with total sales amount.
    """
    now = datetime.now(timezone.utc)

    if period == "day":
        # Start and end of current UTC day
        start_date = datetime.combine(now.date(), datetime.min.time(), tzinfo=timezone.utc)
        end_date = datetime.combine(now.date(), datetime.max.time(), tzinfo=timezone.utc)
        timestamp_filter = (Sale.timestamp >= start_date) & (Sale.timestamp <= end_date)
    elif period == "week":
        start_date = now - timedelta(days=7)
        timestamp_filter = Sale.timestamp >= start_date
    elif period == "month":
        start_date = now.replace(day=1)
        timestamp_filter = Sale.timestamp >= start_date
    else:
        raise ValueError("Invalid period")

    results = (
        db.query(Salesman.name, func.sum(Sale.amount).label("total_sales"))
        .join(Sale, Salesman.id == Sale.salesman_id)
        .filter(timestamp_filter)
        .group_by(Salesman.id)
        .order_by(func.sum(Sale.amount).desc())
        .limit(10)
        .all()
    )

    return [{"name": r.name, "sales": float(r.total_sales or 0)} for r in results]


def get_leaderboard(db: Session, scope: str):
    """
    Legacy function — can be used interchangeably with calculate_leaderboard
    """
    return calculate_leaderboard(db, period=scope)


def get_streak_leaderboard(db: Session):
    """
    Returns leaderboard based on continued streak count.
    """
    results = (
        db.query(
            Salesman.name,
            Salesman.mobile,
            Salesman.outlet,
            func.max(Streak.day_streak_count).label("total_streak")
        )
        .join(Streak, Salesman.id == Streak.salesman_id)
        .filter(Streak.continued == True)
        .group_by(Salesman.id)
        .order_by(func.max(Streak.day_streak_count).desc())
        .limit(10)
        .all()
    )

    return [
        {
            "name": r.name,
            "mobile": r.mobile,
            "outlet": r.outlet,
            "total_sales": r.total_streak  # used as 'total_sales' in frontend
        }
        for r in results
    ]


def update_user_streak(db: Session, salesman_id: int, date_str: str):
    """
    Placeholder for streak tracking
    """
    return {"message": f"✅ Streak updated for salesman {salesman_id} on {date_str}"}
