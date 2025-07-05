from sqlalchemy.orm import Session
from models.admin import Admin
from utils.hash import hash_password


def get_admin_by_phone(db: Session, mobile: str) -> Admin | None:
    """
    Fetch admin by registered mobile number.
    """
    return db.query(Admin).filter(Admin.mobile == mobile).first()


def is_admin_active(admin: Admin) -> bool:
    """
    Check if admin account is active.
    """
    return bool(admin and admin.is_active)


def create_admin(db: Session, name: str, mobile: str, password: str) -> Admin:
    """
    Create a new admin with hashed password.
    Raises if mobile is already registered.
    """
    existing = get_admin_by_mobile(db, mobile)
    if existing:
        raise ValueError("Admin with this mobile number already exists.")

    new_admin = Admin(
        name=name,
        mobile=mobile,
        hashed_password=hash_password(password),
        is_active=True
    )

    try:
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
    except Exception as e:
        db.rollback()
        raise e

    return new_admin
