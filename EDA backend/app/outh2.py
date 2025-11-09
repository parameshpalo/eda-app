from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from .schemas import TokenData
from . import models
from .database import get_db
from sqlalchemy.orm import Session
from .models import User, UserRole
from google.oauth2 import id_token
from google.auth.transport import requests

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id: str = payload.get("user_id")
        if id is None:
            raise credentials_exception
        token_data = TokenData(id=id)
    except JWTError:
        raise credentials_exception
    return token_data


def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = verify_access_token(token, credentials_exception)
    user = db.query(models.User).filter(models.User.user_id == token_data.id).first()

    if user is None:
        raise credentials_exception

    return user


async def verify_google_token(token: str, role: str, db: Session):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo['email']
        
        # Create or update user with specified role
        user = db.query(User).filter(User.user_email == email).first()
        if not user:
            user = User(
                user_email=email,
                name=idinfo.get('name', ''),
                role=UserRole(role),  # Use the role from frontend
                provider='google',
                google_id=idinfo['sub']
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
