# incentive-app/backend/api/incentive_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from datetime import date
from sqlalchemy import func
from models.incentive import Incentive
from models.leaderboardincentive import LeaderboardIncentive
from schemas.incentive_schema import IncentiveOut, IncentiveSchema
from schemas.claim_schema import ClaimRequest, ClaimOut
from schemas.incentive_schema import IncentiveSchema
from services.reward_distributor import reward_top_salesman
from crud.incentive_crud import (
    toggle_incentive_visibility,
    get_incentives_for_salesman,
    generate_incentives,
    get_all_incentives
)
from crud.claim_crud import (
    get_all_claims,
    submit_claim,
    approve_claim_by_id
)
from utils.security import get_current_user_role

router = APIRouter()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ Salesman: View visible incentives
@router.get("/my-incentives", response_model=list[IncentiveOut])
def get_my_incentives(
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    return get_incentives_for_salesman(db, salesman.id)


# ✅ Salesman: Submit claim
@router.post("/claim", response_model=ClaimOut)
def claim_incentive(
    payload: ClaimRequest,
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    claim = submit_claim(db, salesman.id, remarks=payload.remarks)
    if not claim:
        raise HTTPException(status_code=404, detail="No unclaimed incentives found.")
    return claim


# ✅ Admin: View all claims
@router.get("/claims", response_model=list[ClaimOut])
def all_claims(
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    return get_all_claims(db)


# ✅ Admin: Approve claim
@router.post("/approve-claim", response_model=ClaimOut)
def approve_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    claim = approve_claim_by_id(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


# ✅ Admin: Trigger generation of incentives
@router.post("/generate")
def generate(
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    return generate_incentives(db)


# ✅ Admin: View all incentives
@router.get("/", response_model=list[IncentiveOut])
def get_all(
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    return get_all_incentives(db)


# ✅ Admin: Toggle visibility of an incentive
@router.patch("/incentives/{incentive_id}/visibility")
def update_visibility(
    incentive_id: int,
    data: dict,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    is_visible = data.get("is_visible")
    if is_visible is None:
        raise HTTPException(status_code=400, detail="Missing visibility flag.")
    try:
        updated = toggle_incentive_visibility(db, incentive_id, is_visible)
        return {"message": "Visibility updated", "incentive_id": updated.id}
    except ValueError:
        raise HTTPException(status_code=404, detail="Incentive not found")

@router.get("/incentive-summary")
def incentive_summary(
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    today = date.today()

    total = db.query(func.sum(Incentive.amount)).filter(
        Incentive.salesman_id == salesman.id,
        Incentive.is_visible == True
    ).scalar() or 0

    today_total = db.query(func.sum(Incentive.amount)).filter(
        Incentive.salesman_id == salesman.id,
        Incentive.is_visible == True,
        func.date(Incentive.timestamp) == today
    ).scalar() or 0

    return {"total": total, "today": today_total}

@router.get("/rank")
def get_rank(
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    # Subquery: total incentive per salesman
    subq = (
        db.query(
            Incentive.salesman_id,
            func.sum(Incentive.amount).label("total_incentive")
        )
        .filter(Incentive.is_visible == True)
        .group_by(Incentive.salesman_id)
        .subquery()
    )

    # Fetch ranked list
    ranked = db.query(subq).order_by(subq.c.total_incentive.desc()).all()

    for i, row in enumerate(ranked):
        if row.salesman_id == salesman.id:
            return {"rank": i + 1}

    return {"rank": None}

@router.post("/admin/set-leaderboard-incentives")
def set_incentives(payload: IncentiveSchema, db: Session = Depends(get_db)):
    existing = db.query(LeaderboardIncentive).first()
    if existing:
        existing.day_amount = payload.day_amount
        existing.week_amount = payload.week_amount
        existing.month_amount = payload.month_amount
    else:
        new_entry = LeaderboardIncentive(**payload.model_dump())
        db.add(new_entry)
    db.commit()
    return {"message": "Incentives updated"}

@router.get("/public/leaderboard-incentives")
def get_incentives(db: Session = Depends(get_db)):
    data = db.query(LeaderboardIncentive).first()
    return {
        "day": data.day_amount if data else 0,
        "week": data.week_amount if data else 0,
        "month": data.month_amount if data else 0
    }

@router.post("/admin/reward/daily")
def reward_day(db: Session = Depends(get_db)):
    return {"message": reward_top_salesman(db, "day")}

@router.post("/admin/reward/weekly")
def reward_week(db: Session = Depends(get_db)):
    return {"message": reward_top_salesman(db, "week")}

@router.post("/admin/reward/monthly")
def reward_month(db: Session = Depends(get_db)):
    return {"message": reward_top_salesman(db, "month")}