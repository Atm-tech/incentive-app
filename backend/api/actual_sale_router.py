from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import SessionLocal
from schemas.actual_sale_schema import ActualSaleSubmit, ActualSaleOut
from crud.actual_sale_crud import submit_actual_sale, get_sales_by_salesman_id
from utils.security import get_current_user_role

router = APIRouter()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload-actual", response_model=ActualSaleOut)
def upload_actual_sale(
    payload: ActualSaleSubmit,
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    """
    Salesman: Upload individual actual sale.
    """
    return submit_actual_sale(db, payload, salesman_id=salesman.id)

@router.get("/actual-sales", response_model=list[ActualSaleOut])
def list_actual_sales(
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    """
    Salesman: View only their own submitted actual sales.
    """
    return get_sales_by_salesman_id(db, salesman_id=salesman.id)
