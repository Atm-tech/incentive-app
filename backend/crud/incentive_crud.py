from sqlalchemy.orm import Session
from models.sale import Sale
from models.actual_sale import ActualSale
from models.product import Product
from models.incentive import Incentive
from models.trait_config import TraitConfig
from models.salesman import Salesman

def generate_incentives(db: Session) -> dict:
    """
    Match sales with actual sales and calculate incentives based on product traits.
    Avoids duplicates using (salesman_id, barcode, trait) as unique key.
    Also adds the incentive amount to salesman's wallet_balance.
    """
    sales = db.query(Sale).all()
    created = 0
    skipped = 0

    try:
        for sale in sales:
            match = db.query(ActualSale).filter_by(
                customer=sale.customer_number,
                barcode=sale.barcode,
                qty=sale.qty,
                net_amount=sale.net_amount
            ).first()
            if not match:
                continue

            product = db.query(Product).filter_by(barcode=sale.barcode).first()
            if not product:
                continue

            trait_config = db.query(TraitConfig).filter_by(trait=product.trait).first()
            if not trait_config or not trait_config.percentage or trait_config.percentage <= 0:
                continue

            existing = db.query(Incentive).filter_by(
                salesman_id=sale.salesman_id,
                barcode=sale.barcode,
                trait=product.trait
            ).first()
            if existing:
                skipped += 1
                continue

            earned = match.net_amount * trait_config.percentage

            # Create new incentive
            incentive = Incentive(
                salesman_id=sale.salesman_id,
                barcode=sale.barcode,
                amount=earned,
                trait=product.trait,
                is_visible=trait_config.is_visible
            )

            db.add(incentive)

            # ✅ Update wallet balance
            salesman = db.query(Salesman).filter_by(id=sale.salesman_id).first()
            if salesman:
                salesman.wallet_balance += earned

            created += 1

        if created > 0:
            db.commit()

    except Exception as e:
        db.rollback()
        raise e

    return {
        "created": created,
        "skipped_duplicates": skipped
    }


def get_incentives_for_salesman(db: Session, salesman_id: int) -> list[Incentive]:
    """
    Fetch all visible incentives for a given salesman.
    """
    return db.query(Incentive).filter_by(salesman_id=salesman_id, is_visible=True).all()


def get_all_incentives(db: Session) -> list[Incentive]:
    """
    Admin: Fetch all incentives in the system.
    """
    return db.query(Incentive).order_by(Incentive.timestamp.desc()).all()



def toggle_incentive_visibility(db: Session, incentive_id: int, is_visible: bool) -> Incentive:
    """
    Admin: Update the visibility status of a specific incentive.
    """
    incentive = db.query(Incentive).filter_by(id=incentive_id).first()
    if not incentive:
        raise ValueError("Incentive not found")
    incentive.is_visible = is_visible
    db.commit()
    db.refresh(incentive)
    return incentive
