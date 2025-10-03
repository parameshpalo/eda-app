from pydantic import BaseModel
from datetime import date
from typing import Optional

class FMCGBase(BaseModel):
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
    year: Optional[int]
    month: Optional[int]
    week: Optional[int]
    date: Optional[date]
    br_cat_id: Optional[str]
    sales_value: Optional[float]
    volume: Optional[float]
    volume_units: Optional[float]

class FMCGOut(FMCGBase):
    id: int
    class Config:
        orm_mode = True
