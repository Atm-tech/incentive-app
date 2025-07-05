# backend/schemas/outlet_schema.py
from pydantic import BaseModel

class OutletOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
