from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from schemas.auth_schema import ApproveRequest, LoginPayload
from schemas.salesman_schema import (
    SalesmanCreate,
    SalesmanOut,
)
from crud.salesman_crud import (
    create_salesman,
    get_pending_salesmen,
    approve_salesman,
    get_salesman_by_mobile,
)
from crud.admin_crud import get_admin_by_phone
from utils.hash import verify_password
from utils.security import (
    create_access_token,
    get_current_user_role,
)
from db.database import SessionLocal

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------- Signup Route (Salesman Only) -----------
@router.post("/signup", response_model=SalesmanOut)
def signup(salesman: SalesmanCreate, db: Session = Depends(get_db)):
    try:
        new_user = create_salesman(db, salesman)
        return new_user
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print("🚨 Signup failed:", str(e))
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


# ----------- Admin Only: View Pending Signups -----------
@router.get("/pending", response_model=list[SalesmanOut])
def list_pending(
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    return get_pending_salesmen(db)


# ----------- Admin Only: Approve Salesman -----------
@router.post("/salesmen/{salesman_id}/approve", response_model=SalesmanOut)
def approve_or_deny_salesman(
    salesman_id: int,
    payload: ApproveRequest,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    salesman = approve_salesman(db, salesman_id, payload.approve)
    if not salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")

    return salesman


# ----------- Shared Login Endpoint (Admin / Salesman) -----------

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    id: int | None = None


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    # Try admin first
    admin = get_admin_by_phone(db, payload.mobile)
    if admin and verify_password(payload.password, admin.hashed_password):
        token = create_access_token({"sub": admin.mobile, "role": "admin"})
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "admin",
            "id": None
        }

    # Fallback to salesman
    user = get_salesman_by_mobile(db, payload.mobile)
    if not user or not user.password or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_approved:
        raise HTTPException(status_code=403, detail="Your account is pending admin approval.")

    token = create_access_token({"sub": user.mobile, "role": "salesman", "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "salesman",
        "id": user.id
    }
