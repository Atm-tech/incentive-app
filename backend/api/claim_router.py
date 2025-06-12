from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from schemas.claim_schema import ClaimRequest, ClaimOut, ClaimUpdateRequest
from crud.claim_crud import (
    submit_claim,
    get_all_claims,
    approve_claim_by_id,
    reject_claim_by_id,
    amend_claim,
    get_claim_by_id
)
from utils.security import get_current_user_role

router = APIRouter()

# ------------------ SALESMAN ROUTES ------------------ #

@router.post("/claim", response_model=ClaimOut)
def request_withdrawal(
    payload: ClaimRequest,
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    claim = submit_claim(db, salesman.id, amount=payload.amount, remarks=payload.remarks)
    if not claim:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance or invalid claim.")
    return claim


@router.get("/my-claims", response_model=list[ClaimOut])
def view_my_claims(
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    all_claims = get_all_claims(db)
    return [c for c in all_claims if c.salesman_id == salesman.id]


# ------------------ ADMIN ROUTES ------------------ #

@router.get("/claims", response_model=list[ClaimOut])
def view_all_claims(
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    return get_all_claims(db)


@router.post("/claims/{claim_id}/approve", response_model=ClaimOut)
def approve_claim(
    claim_id: int,
    payload: ClaimUpdateRequest,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    claim = approve_claim_by_id(db, claim_id, tx_hash=payload.tx_hash)
    if not claim:
        raise HTTPException(status_code=400, detail="Approval failed (invalid ID or insufficient balance).")
    return claim


@router.post("/claims/{claim_id}/reject")
def reject_claim(
    claim_id: int,
    payload: ClaimUpdateRequest,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    return reject_claim_by_id(db, claim_id, reason=payload.new_remarks)


@router.patch("/claims/{claim_id}")
def update_claim_remarks(
    claim_id: int,
    payload: ClaimUpdateRequest,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    return amend_claim(db, claim_id, new_remarks=payload.new_remarks)


@router.get("/claims/{claim_id}", response_model=ClaimOut)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    return get_claim_by_id(db, claim_id)
