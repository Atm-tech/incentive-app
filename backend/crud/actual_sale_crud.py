from sqlalchemy.orm import Session
from models.actual_sale import ActualSale
from schemas.actual_sale_schema import ActualSaleSubmit


def submit_actual_sale(db: Session, payload: ActualSaleSubmit, salesman_id: int) -> ActualSale:
    """
    Insert a new actual sale record for a given salesman.
    Handles errors with rollback to prevent partial commit.
    """
    sale = ActualSale(
        date=payload.date,
        customer=payload.customer,
        barcode=payload.barcode,
        qty=payload.qty,
        net_amount=payload.net_amount,
        salesman_id=salesman_id
    )

    try:
        db.add(sale)
        db.commit()
        db.refresh(sale)
    except Exception as e:
        db.rollback()
        raise e

    return sale


def get_all_actual_sales(db: Session) -> list[ActualSale]:
    """
    Return all actual sales, sorted by date descending (latest first).
    Admin view.
    """
    return db.query(ActualSale).order_by(ActualSale.date.desc()).all()


def get_sales_by_salesman_id(db: Session, salesman_id: int) -> list[ActualSale]:
    """
    Fetch all actual sales entered by a specific salesman.
    """
    return db.query(ActualSale).filter(ActualSale.salesman_id == salesman_id).all()
