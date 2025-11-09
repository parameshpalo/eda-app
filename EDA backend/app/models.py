from sqlalchemy import Column, Integer, String, Float, Date, Enum as SQLEnum
from .database import Base
import enum


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "userss"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)  # Nullable for Google OAuth users
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    provider = Column(String, nullable=True, default="email")  # 'email' or 'google'
    google_id = Column(String, nullable=True, unique=True, index=True)  # Google user ID

    def __repr__(self) -> str:
        return f"<User id={self.user_id} email={self.user_email} role={self.role} provider={self.provider}>"


class FMCGData(Base):
    __tablename__ = "fmcg_dataa"

    # --- Identifiers ---
    id = Column(Integer, primary_key=True, index=True)
    br_cat_id = Column(String, nullable=True)

    # --- Dimensions ---
    market = Column(String, nullable=True)
    channel = Column(String, nullable=True)
    region = Column(String, nullable=True)
    category = Column(String, nullable=True)
    sub_category = Column(String, nullable=True)
    brand = Column(String, index=True, nullable=True)
    variant = Column(String, nullable=True)
    pack_type = Column(String, index=True, nullable=True)
    ppg = Column(String, nullable=True)
    pack_size = Column(String, nullable=True)

    # --- Time ---
    year = Column(Integer, index=True)
    month = Column(Integer, index=True)
    week = Column(Integer, nullable=True)
    date = Column(Date, index=True)

    # --- Metrics ---
    sales_value = Column(Float, nullable=False, default=0.0)
    volume = Column(Float, nullable=False, default=0.0)
    volume_units = Column(Float, nullable=True)

    def __repr__(self) -> str:
        return f"<FMCGData id={self.id} brand={self.brand} year={self.year} month={self.month} sales={self.sales_value}>"
