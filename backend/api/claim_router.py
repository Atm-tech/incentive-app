from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from schemas.claim_schema import ClaimRequest, ClaimOut, ClaimUpdateRequest, ClaimAmendApproveRequest
from models.claim import Claim
from models.salesman import Salesman
from crud.claim_crud import (
    submit_claim,
    get_all_claims,
    approve_claim_by_id,
    reject_claim_by_id,
    amend_and_approve_claim,
    get_claim_by_id,
    
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
    claims = db.query(Claim).all()
    salesman_map = {
        s.id: s.name for s in db.query(Salesman.id, Salesman.name).all()
    }
    return [
        {
            **claim.__dict__,
            "salesman_name": salesman_map.get(claim.salesman_id, f"#ID {claim.salesman_id}")
        }
        for claim in claims
    ]

@router.get("/claims/pending", response_model=list[ClaimOut])
def view_pending_claims(
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    pending_claims = db.query(Claim).filter_by(status="pending").order_by(Claim.timestamp.desc()).all()
    salesman_map = {
        s.id: s.name for s in db.query(Salesman.id, Salesman.name).all()
    }
    return [
        {
            **claim.__dict__,
            "salesman_name": salesman_map.get(claim.salesman_id, f"#ID {claim.salesman_id}")
        }
        for claim in pending_claims
    ]
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



@router.get("/claims/{claim_id}", response_model=ClaimOut)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    return get_claim_by_id(db, claim_id)


@router.get("/claim/summary")
def get_claim_summary(
    db: Session = Depends(get_db),
    salesman=Depends(get_current_user_role("salesman"))
):
    from models.incentive import Incentive
    from models.claim import Claim

    # Total incentive earned
    total_incentive = db.query(Incentive).filter_by(salesman_id=salesman.id).with_entities(Incentive.amount).all()
    total_incentive_sum = sum([i.amount for i in total_incentive])

    # Total withdrawn (approved claims)
    total_withdrawn = db.query(Claim).filter_by(salesman_id=salesman.id, status="approved").with_entities(Claim.amount).all()
    total_withdrawn_sum = sum([c.amount for c in total_withdrawn])

    # Wallet balance
    wallet_balance = salesman.wallet_balance or 0.0

    # Pending claim
    pending_claim = db.query(Claim).filter_by(salesman_id=salesman.id, status="pending").order_by(Claim.timestamp.desc()).first()
    pending_data = {
        "id": pending_claim.id,
        "amount": pending_claim.amount,
        "timestamp": pending_claim.timestamp,
        "status": pending_claim.status
    } if pending_claim else None

    # Claim history (sorted newest to oldest)
    history = db.query(Claim).filter_by(salesman_id=salesman.id).order_by(Claim.timestamp.desc()).all()
    history_data = [
        {
            "amount": h.amount,
            "status": h.status,
            "timestamp": h.timestamp,
            "remarks": h.remarks
        }
        for h in history
    ]

    return {
        "total_incentive": total_incentive_sum,
        "total_withdrawn": total_withdrawn_sum,
        "wallet_balance": wallet_balance,
        "pending_claim": pending_data,
        "history": history_data
    }



@router.patch("/claims/{claim_id}/amend-approve")
def amend_and_approve(
    claim_id: int,
    payload: ClaimAmendApproveRequest,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    print("✅ amend_and_approve triggered:", payload)
    return amend_and_approve_claim(  # ✅ this should call the CRUD function
        db,
        claim_id,
        new_amount=payload.new_amount,
        new_remarks=payload.new_remarks
    )



