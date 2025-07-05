# backend/api/verticle_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.verticle import Verticle
from schemas.verticle_schema import VerticleCreate, VerticleOut
from utils.security import get_current_user_role

router = APIRouter()

@router.post("/verticles", response_model=VerticleOut)
def create_verticle(payload: VerticleCreate, db: Session = Depends(get_db), admin=Depends(get_current_user_role("admin"))):
    name = payload.name.lower().strip()

    existing = db.query(Verticle).filter(Verticle.name.ilike(name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Verticle already exists")

    new_verticle = Verticle(name=name, description=payload.description)
    db.add(new_verticle)
    db.commit()
    db.refresh(new_verticle)
    return new_verticle

@router.get("/verticles", response_model=list[VerticleOut])
def get_all_verticles(db: Session = Depends(get_db), admin=Depends(get_current_user_role("admin"))):
    return db.query(Verticle).order_by(Verticle.name).all()
