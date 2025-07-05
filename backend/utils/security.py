from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from config import settings
from utils.hash import verify_password, hash_password
from crud.salesman_crud import get_salesman_by_mobile
from db.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# ✅ Create access token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ✅ Decode token safely
def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

# ✅ Admin/Salesman flexible validator
def get_current_user_role(required_role: str):
    def role_checker(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
        payload = decode_access_token(token)
        if not payload or payload.get("sub") is None or payload.get("role") != required_role:
            raise HTTPException(status_code=403, detail="Not authorized")

        mobile = payload["sub"]

        if required_role == "admin":
            from crud.admin_crud import get_admin_by_phone  # lazy import
            user = get_admin_by_phone(db, mobile)
        else:
            user = get_salesman_by_mobile(db, mobile)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    return role_checker

# ✅ Explicit function for salesman-only protection
def get_current_salesman(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload or payload.get("sub") is None or payload.get("role") != "salesman":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    mobile = payload["sub"]
    salesman = get_salesman_by_mobile(db, mobile)
    if not salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")
    return salesman
