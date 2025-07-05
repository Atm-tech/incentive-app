from pydantic import BaseModel
from typing import Optional
from datetime import datetime
class SalesmanCreate(BaseModel):
    name: str
    mobile: str
    outlet: str
    verticle: str
    password: str
    
class SalesmanApprove(BaseModel):
    mobile: str
    verticle: str
    password: str

class SalesmanLogin(BaseModel):  # ⬅️ Add this
    mobile: str
    password: str

class SalesmanOut(BaseModel):
    id: int
    name: str
    mobile: str
    outlet: str
    verticle: str
    wallet_balance: int
    is_approved: bool

    class Config:
        orm_mode = True


class SalesmanSummaryOut(BaseModel):
    id: int
    name: str
    mobile: str
    outlet: Optional[str]
    total_sales: float
    total_incentive: float
    total_claimed: float
    wallet_balance: float

    class Config:
        orm_mode = True
        
        
class AdminSaleOut(BaseModel):
    timestamp: datetime
    customer_name: str
    customer_number: str
    barcode: str
    qty: int
    amount: float
    salesman_name: str
    outlet: str

    class Config:
        from_attributes = True        