from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.database import SessionLocal
from models.outlet import Outlet

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class OutletCreate(BaseModel):
    name: str

from utils.security import get_current_user_role

@router.get("/outlets", response_model=list[dict])
def list_outlets(
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    return [{"id": o.id, "name": o.name} for o in db.query(Outlet).all()]

@router.post("/outlets", response_model=dict)
def create_outlet(
    data: OutletCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    if db.query(Outlet).filter_by(name=data.name).first():
        raise HTTPException(status_code=400, detail="Outlet already exists")
    outlet = Outlet(name=data.name)
    db.add(outlet)
    db.commit()
    db.refresh(outlet)
    return {"id": outlet.id, "name": outlet.name}
