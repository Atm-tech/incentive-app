from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from utils.security import get_current_user_role
from models.incentive import Incentive
from schemas.incentive_schema import IncentiveOut

router = APIRouter()



@router.get("/wallet")
def get_wallet_balance(
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    return {"wallet_balance": salesman.wallet_balance}
@router.get("/wallet/history", response_model=list[IncentiveOut])
def get_wallet_history(
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    return db.query(Incentive).filter_by(
        salesman_id=salesman.id,
        is_visible=True
    ).order_by(Incentive.timestamp.desc()).all()
