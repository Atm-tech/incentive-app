from sqlalchemy.orm import Session
from models.sale import Sale
from schemas.sale_schema import SaleSubmit
from models.product import Product
from models.trait_config import TraitConfig

from sqlalchemy.orm import Session
from models.sale import Sale
from models.product import Product
from models.trait_config import TraitConfig
from models.incentive import Incentive
from models.salesman import Salesman
from schemas.sale_schema import SaleSubmit


def submit_sale(db: Session, sale: SaleSubmit, salesman_id: int):
    sales_to_commit = []
    incentives_to_commit = []

    for item in sale.items:
        product = db.query(Product).filter_by(barcode=item.barcode).first()
        if not product:
            continue

        trait = db.query(TraitConfig).filter_by(trait=product.trait).first()
        if not trait:
            continue

        # 💰 Sale amount: barcode × qty × rsp
        sale_amount = product.rsp * item.qty

        # 🎯 Incentive amount: sale_amount × trait%
        incentive_amount = sale_amount * (trait.percentage / 100)

        # 👉 Record the sale
        new_sale = Sale(
            barcode=item.barcode,
            qty=item.qty,
            amount=sale_amount,
            customer_name=sale.customer_name,
            customer_number=sale.customer_number,
            salesman_id=salesman_id
        )
        db.add(new_sale)
        sales_to_commit.append(new_sale)

        # 👉 Record incentive
        incentive = Incentive(
            salesman_id=salesman_id,
            barcode=item.barcode,
            amount=incentive_amount,
            trait=product.trait,
            is_visible=trait.is_visible
        )
        db.add(incentive)
        incentives_to_commit.append(incentive)

        # 💸 Add to wallet balance
        salesman = db.query(Salesman).filter_by(id=salesman_id).first()
        if salesman:
            salesman.wallet_balance += incentive_amount

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
