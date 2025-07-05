from pydantic import BaseModel
from datetime import datetime


class IncentiveOut(BaseModel):
    id: int
    barcode: str
    trait: str
    amount: float
    timestamp: datetime
    is_visible: bool
    salesman_name: str

    class Config:
        orm_mode = True

class IncentiveSchema(BaseModel):
    day_amount: float
    week_amount: float
    month_amount: float