from sqlalchemy.orm import Session
from models.claim import Claim
from models.incentive import Incentive
from models.salesman import Salesman
from typing import Optional, List
from fastapi import HTTPException
from datetime import datetime


def submit_claim(db: Session, salesman_id: int, amount: float, remarks: Optional[str] = None) -> Optional[Claim]:
    """
    Create a claim (withdrawal request) for a specified amount.
    Deducts from wallet after approval — not here.
    """
    salesman = db.query(Salesman).filter_by(id=salesman_id).first()

    if not salesman or salesman.wallet_balance < amount:
        return None

    claim = Claim(
        salesman_id=salesman_id,
        amount=amount,
        status="pending",
        remarks=remarks
    )

    try:
        db.add(claim)
        db.commit()
        db.refresh(claim)
    except Exception as e:
        db.rollback()
        raise e

    return claim


def get_all_claims(db: Session) -> List[Claim]:
    """
    Admin: Return all submitted claims sorted by newest first.
    """
    return db.query(Claim).order_by(Claim.timestamp.desc()).all()


def get_claim_by_id(db: Session, claim_id: int) -> Claim:
    """
    Get a claim by its ID.
    """
    claim = db.query(Claim).filter_by(id=claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


def approve_claim_by_id(db: Session, claim_id: int, tx_hash: Optional[str] = None) -> Optional[Claim]:
    """
    Approve a pending claim and deduct amount from wallet.
    """
    claim = db.query(Claim).filter_by(id=claim_id, status="pending").first()
    if not claim:
        return None

    salesman = db.query(Salesman).filter_by(id=claim.salesman_id).first()
    if not salesman or salesman.wallet_balance < claim.amount:
        return None

    # Deduct from wallet
    salesman.wallet_balance -= claim.amount

    claim.status = "approved"
    claim.tx_hash = tx_hash
    claim.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(claim)
    except Exception as e:
        db.rollback()
        raise e

    return claim


def reject_claim_by_id(db: Session, claim_id: int, reason: Optional[str] = None) -> dict:
    """
    Reject a pending claim and optionally attach a rejection reason.
    """
    claim = db.query(Claim).filter_by(id=claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = "rejected"
    if reason:
        claim.remarks = reason
    claim.updated_at = datetime.utcnow()

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

    return {"message": "Claim rejected", "id": claim.id}


def amend_claim(db: Session, claim_id: int, new_remarks: str) -> dict:
    """
    Update remarks for a claim.
    """
    claim = db.query(Claim).filter_by(id=claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.remarks = new_remarks
    claim.updated_at = datetime.utcnow()

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

    return {"message": "Claim updated", "new_remarks": new_remarks}
