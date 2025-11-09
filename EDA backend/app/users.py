from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .database import get_db
from . import schemas
from . import models
from . import outh2
import requests
import os


from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Google OAuth Configuration
GOOGLE_CLIENT_ID = "128759038802-odee7hpc0uc7e00k9nuso93qsqtqg0so.apps.googleusercontent.com"

router = APIRouter(
    tags=['Users']
)


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user: models.User = Depends(outh2.get_current_user)):
    """Get current authenticated user information"""
    return {
        "id": current_user.user_id,
        "name": current_user.name,
        "email": current_user.user_email,
        "role": current_user.role.value
    }


@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.CreateUser, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.user_email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate role
    try:
        user_role = models.UserRole(user.role.lower() if user.role else "user")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be 'user' or 'admin'"
        )

    hashed_password = user.password
    new_user = models.User(
        name=user.name,
        user_email=user.email,
        password=hashed_password,
        role=user_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.user_id,
        "name": new_user.name,
        "email": new_user.user_email,
        "role": new_user.role.value
    }


@router.post('/login', response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_email == user_credentials.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Credentials"
        )

    if user_credentials.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Credentials"
        )

    access_token = outh2.create_access_token(data={"user_id": user.user_id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.user_id,
            "name": user.name,
            "email": user.user_email,
            "role": user.role.value
        }
    }


@router.post("/auth/google", response_model=schemas.Token)
def google_auth(google_request: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate user with Google OAuth token.
    Creates a new user if they don't exist, otherwise returns existing user.
    """
    try:
        # Verify the Google ID token
        response = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={google_request.token}",
            timeout=10
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google token"
            )
        
        user_info = response.json()
        
        # Verify the token is for our app (if CLIENT_ID is set)
        if GOOGLE_CLIENT_ID and user_info.get("aud") != GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token audience mismatch"
            )
        
        email = user_info.get("email")
        name = user_info.get("name", "Google User")
        google_id = user_info.get("sub")  # Google user ID
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )
        
        # Validate role
        try:
            user_role = models.UserRole(google_request.role.lower() if google_request.role else "user")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be 'user' or 'admin'"
            )
        
        # Check if user exists by email
        user = db.query(models.User).filter(models.User.user_email == email).first()
        
        # If not found by email, check by google_id
        if not user:
            user = db.query(models.User).filter(models.User.google_id == google_id).first()
        
        if user:
            # User exists - update Google info if needed
            # Get current values (these are actual values from DB, not Column objects)
            current_provider_value = getattr(user, 'provider', None)
            current_google_id_value = getattr(user, 'google_id', None)
            
            # Update provider if needed (only if not already set to google)
            if current_provider_value != "google":
                setattr(user, 'provider', "google")
                if not current_google_id_value:
                    setattr(user, 'google_id', google_id)
            
            # Update google_id if it doesn't match or is missing
            if current_google_id_value != google_id:
                setattr(user, 'google_id', google_id)
            
            # Update name if it changed
            if getattr(user, 'name', '') != name:
                setattr(user, 'name', name)
            
            db.commit()
            db.refresh(user)
        else:
            # Create new user with the specified role
            user = models.User(
                name=name,
                user_email=email,
                password=None,  # No password for Google OAuth users
                role=user_role,
                provider="google",
                google_id=google_id
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Generate JWT token
        access_token = outh2.create_access_token(data={"user_id": user.user_id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.user_id,
                "name": user.name,
                "email": user.user_email,
                "role": user.role.value
            }
        }
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to verify Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )
