from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from crud.salesman_crud import get_all_approved_salesmen, delete_salesman
from schemas.salesman_schema import SalesmanOut
from utils.security import get_current_user_role
from models.sale import Sale
from models.incentive import Incentive
from utils.security import get_current_salesman
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

@router.get("/salesman/stats")
def get_salesman_stats(db: Session = Depends(get_db), current_user=Depends(get_current_salesman)):
    # Get total sales by salesman
    sales = db.query(Sale).filter(Sale.salesman_id == current_user.id).all()
    total_sales = len(sales)
    total_amount = sum(s.amount for s in sales)

    # Get total incentives
    incentives = db.query(Incentive).filter(Incentive.salesman_id == current_user.id).all()
    total_incentives = sum(i.amount for i in incentives)

    return {
        "sales_count": total_sales,
        "total_amount": total_amount,
        "incentives_earned": total_incentives
    }