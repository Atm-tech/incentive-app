from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SaleItem(BaseModel):
    barcode: str
    qty: int

class SaleSubmit(BaseModel):
    items: List[SaleItem]
    customer_name: str
    customer_number: str
    salesman_id: Optional[int] = None

class SaleOut(BaseModel):
    id: int
    barcode: str
    qty: int
    amount: float
    customer_name: str
    customer_number: str

    class Config:
        from_attributes = True

