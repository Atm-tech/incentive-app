from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from schemas.streak_schema import StreakOut
from crud.streak_crud import get_streaks_for_salesman
from utils.security import get_current_user_role

router = APIRouter(tags=["Streak"])

@router.get("/streaks/{salesman_id}", response_model=list[StreakOut])
def view_streaks(salesman_id: int, db: Session = Depends(get_db), admin=Depends(get_current_user_role("admin"))):
    """
    Admin: View all streak records for a specific salesman.
    """
    streaks = get_streaks_for_salesman(db, salesman_id)
    if not streaks:
        raise HTTPException(status_code=404, detail="No streak data found")
    return streaks
@router.get("/day")
def leaderboard_day(db: Session = Depends(get_db)):
    """
    Public: Star of the Day leaderboard
    """
    return calculate_leaderboard(db, period="day")