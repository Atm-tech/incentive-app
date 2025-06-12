# incentive-app/backend/utils/security.py

from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from utils.hash import verify_password, hash_password  # ✅ use only from hash.py
from crud.salesman_crud import get_salesman_by_mobile
from db.database import SessionLocal

load_dotenv()
MASTER_ADMIN_SECRET = os.getenv("MASTER_ADMIN_SECRET")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("❌ SECRET_KEY not found in environment")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ✅ Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Token creation
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ✅ Token decoding
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# ✅ Role-based user fetching
def get_current_user_role(required_role: str):
    def role_checker(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
        payload = decode_access_token(token)
        if not payload or payload.get("sub") is None or payload.get("role") != required_role:
            raise HTTPException(status_code=403, detail="Not authorized")

        mobile = payload["sub"]

        if required_role == "admin":
            # ⛔ avoid importing at top to break circular import
            from crud.admin_crud import get_admin_by_phone
            user = get_admin_by_phone(db, mobile)
        else:
            user = get_salesman_by_mobile(db, mobile)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user
    return role_checker
