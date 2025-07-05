from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ✅ Salesman: Submits a claim (withdrawal request)
class ClaimRequest(BaseModel):
    remarks: Optional[str] = None
    amount: float  # required amount to withdraw


# ✅ Admin/Salesman: View a claim
class ClaimOut(BaseModel):
    id: int
    salesman_id: int
    amount: float  # renamed from total_amount for clarity
    status: str  # pending, approved, rejected
    remarks: Optional[str]
    tx_hash: Optional[str] = None
    timestamp: datetime

    # Optional frontend extras
    salesman_name: Optional[str] = "Salesman"
    reason: Optional[str] = None  # rejection reason if needed

    class Config:
        orm_mode = True


# ✅ Admin: Update remarks or approve with tx_hash
class ClaimUpdateRequest(BaseModel):
    new_remarks: Optional[str] = None
    tx_hash: Optional[str] = None
    
class ClaimAmendApproveRequest(BaseModel):
    new_amount: float
    new_remarks: Optional[str]