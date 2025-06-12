from sqlalchemy.orm import Session
from models.salesman import Salesman
from schemas.salesman_schema import SalesmanCreate, SalesmanApprove
from utils.hash import hash_password, verify_password
from typing import Optional



def create_salesman(db: Session, data: SalesmanCreate) -> Salesman:
    existing = db.query(Salesman).filter_by(mobile=data.mobile).first()
    if existing:
        raise ValueError("Salesman with this mobile already exists")

    new_salesman = Salesman(
        name        = data.name,
        mobile      = data.mobile,
        outlet      = data.outlet,
        verticle    = data.verticle,        # rename field later
        password    = hash_password(data.password),
        is_approved = False                  # or False if admin approval needed
    )

    try:
        db.add(new_salesman)
        db.commit()
        db.refresh(new_salesman)
        return new_salesman
    except Exception as e:
        db.rollback()
        raise


def get_pending_salesmen(db: Session) -> list[Salesman]:
    """
    Return all salesmen who have registered but are not yet approved.
    """
    return db.query(Salesman).filter_by(is_approved=False).all()


def approve_salesman(db: Session, salesman_id: int, approve: bool) -> Optional[Salesman]:
    salesman = db.query(Salesman).filter(Salesman.id == salesman_id).first()

    if not salesman:
        return None

    salesman.is_approved = approve

    try:
        db.commit()
        db.refresh(salesman)
    except Exception as e:
        db.rollback()
        raise e

    return salesman



def login_salesman_by_credentials(db: Session, mobile: str, password: str) -> Salesman | None:
    """
    Authenticate a salesman by mobile and password.
    Returns the salesman if valid, else None.
    """
    salesman = db.query(Salesman).filter_by(mobile=mobile).first()
    if not salesman or not salesman.is_approved:
        return None

    if not verify_password(password, salesman.password):
        return None

    return salesman


def get_salesman_by_mobile(db: Session, mobile: str):
    return db.query(Salesman).filter_by(mobile=mobile).first()



def get_all_approved_salesmen(db: Session) -> list[Salesman]:
    return db.query(Salesman).filter_by(is_approved=True).all()

def delete_salesman(db: Session, salesman_id: int) -> bool:
    salesman = db.query(Salesman).filter_by(id=salesman_id, is_approved=True).first()
    if not salesman:
        return False
    db.delete(salesman)
    db.commit()
    return True