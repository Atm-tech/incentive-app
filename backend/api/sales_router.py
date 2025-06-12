# incentive-app/backend/api/sales_router.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.sale_schema import SaleSubmit, SaleOut
from crud.sale_crud import submit_sale, get_sales_by_salesman
from db.database import SessionLocal
from utils.security import get_current_user_role

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/submit", response_model=list[SaleOut])
def create_sale(
    sale: SaleSubmit,
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    return submit_sale(db, sale, salesman.id)

@router.get("/my-sales", response_model=list[SaleOut])
def my_sales(
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    """
    Salesman: View my submitted sales.
    """
    return get_sales_by_salesman(db, salesman.id)
