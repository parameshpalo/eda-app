from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from .models import FMCGData
from .schemas import FMCGOut
from .database import get_db

router = APIRouter(prefix="/fmcg")


# ---- Utility: Apply filters dynamically ----
def apply_filters(query, brand=None, year=None, pack_type=None, ppg=None, channel=None):
    if brand:
        query = query.filter(FMCGData.brand == brand)
    if year:
        query = query.filter(FMCGData.year == year)
    if pack_type:
        query = query.filter(FMCGData.pack_type == pack_type)
    if ppg:
        query = query.filter(FMCGData.ppg == ppg)
    if channel:
        query = query.filter(FMCGData.channel == channel)
    return query


@router.get("/", response_model=List[FMCGOut])
def get_fmcg_data(
    brand: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    pack_type: Optional[str] = Query(None),
    ppg: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(FMCGData)

    query = apply_filters(query, brand, year, pack_type, ppg, channel)

    return query.limit(500).all()  # pagination later



# ---- 1. Sales Value by Year (Stacked Horizontal Bar) ----
@router.get("/sales-value")
def get_sales_value(
    brand: Optional[str] = None,
    year: Optional[int] = None,
    pack_type: Optional[str] = None,
    ppg: Optional[str] = None,
    channel: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(
        FMCGData.year,
        FMCGData.brand,
        func.sum(FMCGData.sales_value).label("total_sales")
    ).group_by(FMCGData.year, FMCGData.brand)

    query = apply_filters(query, brand, year, pack_type, ppg, channel)
    results = query.order_by(FMCGData.year,FMCGData.brand).all()

    return [
        {"year": r.year, "brand": r.brand, "total_sales": round(r.total_sales, 2)}
        for r in results
    ]


# ---- 2. Volume Contribution by Year (Stacked Horizontal Bar) ----
@router.get("/volume-contribution")
def get_volume_contribution(
    brand: Optional[str] = None,
    year: Optional[int] = None,
    pack_type: Optional[str] = None,
    ppg: Optional[str] = None,
    channel: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(
        FMCGData.year,
        FMCGData.brand,
        func.sum(FMCGData.volume).label("total_volume")
    ).group_by(FMCGData.year, FMCGData.brand)

    query = apply_filters(query, brand, year, pack_type, ppg, channel)
    results = query.order_by(FMCGData.year,FMCGData.brand).all()

    return [
        {"year": r.year, "brand": r.brand, "total_volume": round(r.total_volume, 2)}
        for r in results
    ]


# ---- 3. Year-wise Sales Value by Brand (Vertical Bar) ----
@router.get("/yearly-sales")
def get_yearly_sales(
    brand: Optional[str] = None,
    year: Optional[int] = None,
    pack_type: Optional[str] = None,
    ppg: Optional[str] = None,
    channel: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(
        FMCGData.brand,
        FMCGData.year,
        func.sum(FMCGData.sales_value).label("total_sales")
    ).group_by(FMCGData.brand, FMCGData.year)

    query = apply_filters(query, brand, year, pack_type, ppg, channel)
    results = query.all()

    return [
        {"brand": r.brand, "year": r.year, "total_sales": round(r.total_sales, 2)}
        for r in results
    ]


# ---- 4. Monthly Sales Trend (Line Chart) ----
@router.get("/trend")
def get_sales_trend(
    brand: Optional[str] = None,
    year: Optional[int] = None,
    pack_type: Optional[str] = None,
    ppg: Optional[str] = None,
    channel: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(
        FMCGData.year,
        FMCGData.month,
        func.sum(FMCGData.sales_value).label("total_sales")
    ).group_by(FMCGData.year, FMCGData.month).order_by(FMCGData.year, FMCGData.month)

    query = apply_filters(query, brand, year, pack_type, ppg, channel)
    results = query.all()

    return [
        {"year": r.year, "month": r.month, "total_sales": round(r.total_sales, 2)}
        for r in results
    ]


# ---- 5. Market Share (Pie/Donut) ----
@router.get("/market-share")
def get_market_share(
    metric: str = Query("sales", enum=["sales", "volume"]),
    brand: Optional[str] = None,
    year: Optional[int] = None,
    pack_type: Optional[str] = None,
    ppg: Optional[str] = None,
    channel: Optional[str] = None,
    db: Session = Depends(get_db),
):
    if metric == "sales":
        query = db.query(
            FMCGData.brand,
            func.sum(FMCGData.sales_value).label("value")
        ).group_by(FMCGData.brand)
    else:
        query = db.query(
            FMCGData.brand,
            func.sum(FMCGData.volume).label("value")
        ).group_by(FMCGData.brand)

    query = apply_filters(query, brand, year, pack_type, ppg, channel)
    results = query.all()

    total = sum([r.value for r in results]) or 1  # avoid div by zero
    return [
        {
            "brand": r.brand,
            "value": round(r.value, 2),
            "percentage": round((r.value / total) * 100, 2)
        }
        for r in results
    ]
