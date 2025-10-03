from sqlalchemy import Column, Integer, String, Float, Date
from .database import Base


class FMCGData(Base):
    __tablename__ = "fmcg_data"

    id = Column(Integer, primary_key=True, index=True)
    market = Column(String, nullable=True)
    channel = Column(String, nullable=True)
    region = Column(String, nullable=True)
    category = Column(String, nullable=True)
    sub_category = Column(String, nullable=True)
    brand = Column(String, nullable=True, index=True)
    variant = Column(String, nullable=True)
    pack_type = Column(String, nullable=True, index=True)
    ppg = Column(String, nullable=True)
    pack_size = Column(String, nullable=True)
    year = Column(Integer, index=True)
    month = Column(Integer, index=True)
    week = Column(Integer, nullable=True)
    date = Column(Date, index=True)
    br_cat_id = Column(String, nullable=True)

    sales_value = Column(Float, nullable=False, default=0.0)
    volume = Column(Float, nullable=False, default=0.0)
    volume_units = Column(Float, nullable=True)

    # Optional: extra fields (D1-D6, AV1-AV6, EV1-6)
    d1 = Column(Float, nullable=True)
    d2 = Column(Float, nullable=True)
    d3 = Column(Float, nullable=True)
    d4 = Column(Float, nullable=True)
    d5 = Column(Float, nullable=True)
    d6 = Column(Float, nullable=True)

    AV1 = Column(Float, nullable=True)
    AV2 = Column(Float, nullable=True)
    AV3 = Column(Float, nullable=True)
    AV4 = Column(Float, nullable=True)
    AV5 = Column(Float, nullable=True)
    AV6 = Column(Float, nullable=True)

    EV1 = Column(Float, nullable=True)
    EV2 = Column(Float, nullable=True)
    EV3 = Column(Float, nullable=True)
    EV4 = Column(Float, nullable=True)
    EV5 = Column(Float, nullable=True)
    EV6 = Column(Float, nullable=True)
    
