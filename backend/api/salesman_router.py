from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from db.database import get_db
from crud.salesman_crud import get_all_approved_salesmen, delete_salesman
from schemas.salesman_schema import SalesmanOut, SalesmanSummaryOut
from utils.security import get_current_user_role
from models.sale import Sale
from models.incentive import Incentive
from utils.security import get_current_salesman
from models.claim import Claim
from models.salesman import Salesman
from sqlalchemy import func, and_

router = APIRouter()

@router.get("/salesmen", response_model=list[SalesmanOut])
def list_approved_salesmen(
    db: Session = Depends(get_db),
    role: str = Depends(get_current_user_role)
):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return get_all_approved_salesmen(db)

@router.delete("/salesmen/{salesman_id}")
def remove_salesman(
    salesman_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_current_user_role)
):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    success = delete_salesman(db, salesman_id)
    if not success:
        raise HTTPException(status_code=404, detail="Salesman not found or not approved")
    return {"message": "Salesman removed"}

@router.get("/me", response_model=SalesmanOut)
def get_me(
    salesman=Depends(get_current_user_role("salesman"))
):
    return salesman

@router.get("/stats")
def get_salesman_stats(db: Session = Depends(get_db), current_user=Depends(get_current_salesman)):
    today = date.today()
    month_start = today.replace(day=1)

    # Monthly sales
    month_sales = db.query(Sale).filter(
        Sale.salesman_id == current_user.id,
        Sale.timestamp >= month_start
    ).all()
    month_sales_count = len(month_sales)
    month_sales_amount = sum(s.amount for s in month_sales)

    # Today's sales
    today_sales = db.query(Sale).filter(
        Sale.salesman_id == current_user.id,
        Sale.timestamp >= today
    ).all()
    today_sales_count = len(today_sales)
    today_sales_amount = sum(s.amount for s in today_sales)

    # Today's incentive
    today_incentives = db.query(Incentive).filter(
        Incentive.salesman_id == current_user.id,
        Incentive.timestamp >= today
    ).all()
    today_incentive_sum = sum(i.amount for i in today_incentives)

    # Wallet balance
    wallet_balance = current_user.wallet_balance or 0.0

    return {
        "month_sales_count": month_sales_count,
        "month_sales_amount": month_sales_amount,
        "today_sales_count": today_sales_count,
        "today_sales_amount": today_sales_amount,
        "today_incentive": today_incentive_sum,
        "wallet_balance": wallet_balance
    }

@router.get("/summary", response_model=list[SalesmanSummaryOut])
def get_salesman_summaries(
    period: str = Query("total", enum=["today", "month", "total"]),
    db: Session = Depends(get_db)
):
    salesmen = db.query(Salesman).filter(Salesman.is_approved == True).all()
    summaries = []

    # Calculate date filters
    now = datetime.now()
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    elif period == "month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_month = start_date.replace(day=28) + timedelta(days=4)
        end_date = next_month.replace(day=1) - timedelta(seconds=1)
    else:
        start_date = None
        end_date = None

    for s in salesmen:
        # --- Sales Total (amount)
        sale_query = db.query(func.sum(Sale.amount)).filter(Sale.salesman_id == s.id)
        if start_date:
            sale_query = sale_query.filter(Sale.timestamp >= start_date)
        if end_date:
            sale_query = sale_query.filter(Sale.timestamp <= end_date)
        total_sales = sale_query.scalar() or 0

        # --- Incentive
        incentive_query = db.query(func.sum(Incentive.amount)).filter(Incentive.salesman_id == s.id)
        if start_date:
            incentive_query = incentive_query.filter(Incentive.timestamp >= start_date)
        if end_date:
            incentive_query = incentive_query.filter(Incentive.timestamp <= end_date)
        total_incentive = incentive_query.scalar() or 0.0

        # --- Claimed stays all-time
        total_claimed = db.query(func.sum(Claim.amount)).filter(
            Claim.salesman_id == s.id,
            Claim.status.in_(["approved", "paid"])
        ).scalar() or 0.0

        summaries.append(SalesmanSummaryOut(
            id=s.id,
            name=s.name,
            mobile=s.mobile,
            outlet=s.outlet,
            total_sales=total_sales,
            total_incentive=total_incentive,
            total_claimed=total_claimed,
            wallet_balance=s.wallet_balance or 0.0
        ))

    return summaries