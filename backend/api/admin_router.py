# incentive-app/backend/api/admin_router.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from schemas.outlet_schema import OutletOut
from crud.outlet_crud import get_all_outlets
from db.database import SessionLocal
from models.admin import Admin
from crud.system_crud import get_status, mark_setup_complete
from schemas.system_schema import SetupStatusOut
from config import settings

from utils.security import (
    get_current_user_role,
    hash_password,
    )
from crud.admin_crud import get_admin_by_phone

router = APIRouter(tags=["Admin"])


# -------------------------------
# DB Dependency
# -------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------
# 🔐 Secure Test Ping (Admin Only)
# -------------------------------
@router.get("/ping")
def ping_admin(admin=Depends(get_current_user_role("admin"))):
    """
    Admin: Test route to confirm admin access.
    """
    return {"status": "admin router active", "admin": admin.mobile}

# -------------------------------
# 🔐 Admin Creation via Master Key  
# -------------------------------
class AdminCreateRequest(BaseModel):
    name: str
    mobile: str
    password: str
    master_key: str

@router.post("/create", status_code=201)
def create_admin(payload: AdminCreateRequest, db: Session = Depends(get_db)):
    """
    One-time Admin creation endpoint protected by MASTER_ADMIN_SECRET.
    """
    if payload.master_key != settings.master_admin_secret:
        raise HTTPException(status_code=403, detail="Invalid master key")

    if get_admin_by_phone(db, payload.mobile):
        raise HTTPException(status_code=409, detail="Admin already exists")

    new_admin = Admin(
        name=payload.name,
        mobile=payload.mobile,
        hashed_password=hash_password(payload.password),
        is_active=True
    )

    try:
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Admin creation failed: {str(e)}")

    return {"message": "✅ Admin created", "mobile": new_admin.mobile}
@router.get("/outlets", response_model=list[OutletOut])
def list_outlets(db: Session = Depends(get_db), admin=Depends(get_current_user_role("admin"))):
    """
    Admin: Get list of all outlets.
    """
    return get_all_outlets(db)

@router.get("/setup/status", response_model=SetupStatusOut)
def check_setup_status(db: Session = Depends(get_db)):
    status = get_status(db)
    return {"setup_complete": status.setup_complete if status else False}

@router.post("/setup/complete")
def complete_setup(db: Session = Depends(get_db)):
    state = mark_setup_complete(db)
    return {"message": "Setup marked complete", "setup_complete": state.setup_complete}