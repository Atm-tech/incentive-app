from pydantic import BaseModel
from datetime import datetime

class ActualSaleSubmit(BaseModel):
    date: datetime
    customer: str
    barcode: str
    qty: int
    net_amount: float

class ActualSaleOut(BaseModel):
    id: int
    date: datetime
    customer: str
    barcode: str
    qty: int
    net_amount: float

    class Config:
        from_attributes = True  # Pydantic v2 equivalent of orm_mode = True
