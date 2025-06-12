from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from db.database import get_db
from crud.salesman_crud import get_salesman_by_mobile
from config import settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_salesman(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        mobile = payload.get("sub")
        role = payload.get("role")
        if mobile is None or role != "salesman":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    salesman = get_salesman_by_mobile(db, mobile)
    if salesman is None:
        raise credentials_exception
    return salesman
