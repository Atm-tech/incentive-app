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
    Deducts immediately from wallet_balance to prevent duplicate claims.
    """
    salesman = db.query(Salesman).filter_by(id=salesman_id).first()

    if not salesman or salesman.wallet_balance < amount:
        return None

    # ✅ Deduct wallet now
    salesman.wallet_balance -= amount

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
    return db.query(Claim).order_by(Claim.timestamp.desc()).all()


def get_claim_by_id(db: Session, claim_id: int) -> Claim:
    claim = db.query(Claim).filter_by(id=claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


def approve_claim_by_id(db: Session, claim_id: int, tx_hash: Optional[str] = None) -> Claim:
    claim = db.query(Claim).filter_by(id=claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if claim.status != "pending":
        raise HTTPException(status_code=400, detail="Claim is not pending")

    salesman = db.query(Salesman).filter_by(id=claim.salesman_id).first()
    if not salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")

    if claim.amount is None:
        raise HTTPException(status_code=400, detail="Claim amount is missing")

    # ✅ No wallet logic here

    claim.status = "approved"
    claim.tx_hash = tx_hash
    claim.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(claim)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error during approval: {str(e)}")

    return claim


def reject_claim_by_id(db: Session, claim_id: int, reason: Optional[str] = None) -> dict:
    claim = db.query(Claim).filter_by(id=claim_id, status="pending").first()
    if not claim:
        raise HTTPException(status_code=404, detail="Pending claim not found")

    salesman = db.query(Salesman).filter_by(id=claim.salesman_id).first()
    if not salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")

    # ✅ Refund to wallet
    salesman.wallet_balance += claim.amount

    claim.status = "rejected"
    if reason:
        claim.remarks = reason
    claim.updated_at = datetime.utcnow()

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

    return {"message": "Claim rejected and amount refunded", "id": claim.id}


def amend_and_approve_claim(db: Session, claim_id: int, new_amount: float, new_remarks: str):
    claim = db.query(Claim).filter_by(id=claim_id, status="pending").first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    salesman = db.query(Salesman).filter_by(id=claim.salesman_id).first()
    if not salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")

    # ✅ Reclaim extra incentives if amount is reduced
    diff = claim.amount - new_amount
    if diff > 0:
        incentives = (
            db.query(Incentive)
            .filter_by(salesman_id=salesman.id, claimed=False)
            .order_by(Incentive.amount.desc())
            .all()
        )
        for incentive in incentives:
            if diff <= 0:
                break
            if incentive.amount <= diff:
                diff -= incentive.amount
                incentive.amount = 0
            else:
                incentive.amount -= diff
                diff = 0

    claim.amount = new_amount
    claim.status = "approved"
    claim.remarks = new_remarks
    claim.updated_at = datetime.utcnow()

    # ✅ Do NOT recompute wallet

    try:
        db.commit()
        db.refresh(claim)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error during amend+approve")

    return claim
