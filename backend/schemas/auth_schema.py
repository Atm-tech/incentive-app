from pydantic import BaseModel

class SignupRequest(BaseModel):
    name: str
    mobile: str
    password: str
    role: str  # "admin" or "salesman"

class ApproveRequest(BaseModel):
    approve: bool
    
class LoginPayload(BaseModel):
    mobile: str
    password: str    