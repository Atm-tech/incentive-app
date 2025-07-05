from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from schemas.sale_schema import SaleSubmit, SaleOut
from crud.sale_crud import submit_sale, get_sales_by_salesman
from db.database import SessionLocal
from utils.security import get_current_user_role
from models.sale import Sale
from typing import List
from models.salesman import Salesman
from schemas.salesman_schema import AdminSaleOut
from fastapi.responses import StreamingResponse
import io
import pandas as pd

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


@router.get("/admin/sales", response_model=List[AdminSaleOut])
def get_admin_sales(
    db: Session = Depends(get_db),
    from_date: str = Query(None),
    to_date: str = Query(None),
    outlet: str = Query(None),
    search: str = Query(None)
):
    """
    Admin: View all sales with optional filters.
    """
    query = db.query(Sale)

    if from_date and to_date:
        query = query.filter(Sale.timestamp.between(from_date, to_date))

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Sale.customer_name.ilike(search_term)) |
            (Sale.customer_number.ilike(search_term)) |
            (Sale.barcode.ilike(search_term))
        )

    sales = query.order_by(Sale.timestamp.desc()).limit(4000).all()
    result = []

    for s in sales:
        salesman = db.query(Salesman).filter_by(id=s.salesman_id).first()
        if outlet and (not salesman or salesman.outlet != outlet):
            continue
        result.append({
            "timestamp": s.timestamp,
            "customer_name": s.customer_name,
            "customer_number": s.customer_number,
            "barcode": s.barcode,
            "qty": s.qty,
            "amount": s.amount,
            "salesman_name": salesman.name if salesman else "Unknown",
            "outlet": salesman.outlet if salesman else "Unknown"
        })

    return result


@router.get("/admin/sales/xlsx")
def export_admin_sales_xlsx(
    db: Session = Depends(get_db),
    from_date: str = Query(None),
    to_date: str = Query(None),
    outlet: str = Query(None),
    search: str = Query(None)
):
    """
    Admin: Export filtered sales to Excel (.xlsx)
    """
    query = db.query(Sale)

    if from_date and to_date:
        query = query.filter(Sale.timestamp.between(from_date, to_date))

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Sale.customer_name.ilike(search_term)) |
            (Sale.customer_number.ilike(search_term)) |
            (Sale.barcode.ilike(search_term))
        )

    sales = query.all()

    rows = []
    for s in sales:
        salesman = db.query(Salesman).filter_by(id=s.salesman_id).first()
        if outlet and (not salesman or salesman.outlet != outlet):
            continue
        rows.append({
            "Date": s.timestamp.strftime("%Y-%m-%d"),
            "Customer": s.customer_name,
            "Phone": s.customer_number,
            "Barcode": s.barcode,
            "Qty": s.qty,
            "Amount": s.amount,
            "Salesman": salesman.name if salesman else "Unknown",
            "Outlet": salesman.outlet if salesman else "Unknown"
        })

    if not rows:
        rows.append({
            "Date": "", "Customer": "", "Phone": "", "Barcode": "",
            "Qty": "", "Amount": "", "Salesman": "", "Outlet": ""
        })

    df = pd.DataFrame(rows)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Sales')
    output.seek(0)

    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={"Content-Disposition": "attachment; filename=sales_report.xlsx"}
    )
