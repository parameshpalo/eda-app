from pydantic import BaseModel,Field
from datetime import date
from typing import Optional


class FMCGBase(BaseModel):
    # --- Dimensions ---
    market: Optional[str]
    channel: Optional[str]
    region: Optional[str]
    category: Optional[str]
    sub_category: Optional[str]
    brand: Optional[str]
    variant: Optional[str]
    pack_type: Optional[str]
    ppg: Optional[str]
    pack_size: Optional[str]

    # --- Time ---
    year: Optional[int]
    month: Optional[int]
    week: Optional[int]
    date: Optional[date]

    # --- Identifiers ---
    br_cat_id: Optional[str]

    # --- Metrics ---
    sales_value: Optional[float]
    volume: Optional[float]
    volume_units: Optional[float]


class FMCGCreate(FMCGBase):
    sales_value: Optional[float] = Field(default=0.0)
    volume: Optional[float] = Field(default=0.0)


class FMCGOut(FMCGBase):
    """Schema for responses"""
    id: int

    class Config:
        orm_mode = True


# ---------------- Schemas ----------------
class CreateUser(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "user"  # Default to "user" if not provided

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UserResponse] = None  # Include user info in token response


class TokenData(BaseModel):
    id: Optional[int] = None


class GoogleAuthRequest(BaseModel):
    token: str
    role: Optional[str] = "user"  # Default to "user" if not provided