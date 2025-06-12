from sqlalchemy.orm import Session
from models.sale import Sale
from schemas.sale_schema import SaleSubmit


def submit_sale(db: Session, sale: SaleSubmit, salesman_id: int):
    sales_to_commit = []

    for item in sale.items:
        product = db.query(Product).filter_by(barcode=item.barcode).first()
        if not product:
            continue

        trait = db.query(Trait).filter_by(barcode=item.barcode).first()
        if not trait:
            continue

        amount = product.amount * item.qty * (trait.percentage / 100)

        new_sale = Sale(
            barcode=item.barcode,
            qty=item.qty,
            amount=amount,
            customer_name=sale.customer_name,
            customer_number=sale.customer_number,
            salesman_id=salesman_id
        )
        db.add(new_sale)
        sales_to_commit.append(new_sale)

    try:
        db.commit()
        return sales_to_commit
    except Exception as e:
        db.rollback()
        raise e


def get_sales_by_salesman(db: Session, salesman_id: int) -> list[Sale]:
    """
    Return all sales entered by a specific salesman.
    """
    return db.query(Sale).filter_by(salesman_id=salesman_id).all()
