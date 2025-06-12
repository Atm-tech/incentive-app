from pydantic import BaseModel

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
