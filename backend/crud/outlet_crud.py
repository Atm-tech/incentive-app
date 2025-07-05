# backend/crud/outlet_crud.py
from sqlalchemy.orm import Session
from models.outlet import Outlet

def get_all_outlets(db: Session):
    return db.query(Outlet).all()
