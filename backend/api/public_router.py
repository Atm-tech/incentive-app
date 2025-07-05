from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.outlet import Outlet
from models.verticle import Verticle

router = APIRouter(prefix="/public", tags=["Public"])

# --- DB Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Public: List outlets for signup ---
@router.get("/outlets", response_model=list[dict])
def list_public_outlets(db: Session = Depends(get_db)):
    return [{"id": o.id, "name": o.name} for o in db.query(Outlet).all()]

@router.get("/verticles", response_model=list[str])
def list_unique_verticles(db: Session = Depends(get_db)):
    """
    Return a list of verticle names from Verticle table.
    """
    results = db.query(Verticle.name).all()
    return [v[0] for v in results if v[0]]