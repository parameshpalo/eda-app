from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Callable

from .models import FMCGData
from .schemas import FMCGOut
from .database import get_db

router = APIRouter(prefix="/fmcg")


# ---- Utility: Apply filters dynamically (multi-value support) ----
def apply_filters(
    query,
    brand: Optional[List[str]] = None,
    year: Optional[List[int]] = None,
    pack_type: Optional[List[str]] = None,
    ppg: Optional[List[str]] = None,
    channel: Optional[List[str]] = None,
):
    if brand:
        query = query.filter(FMCGData.brand.in_(brand))
    if year:
        query = query.filter(FMCGData.year.in_(year))
    if pack_type:
        query = query.filter(FMCGData.pack_type.in_(pack_type))
    if ppg:
        query = query.filter(FMCGData.ppg.in_(ppg))
    if channel:
        query = query.filter(FMCGData.channel.in_(channel))
    return query


# ---- Utility: Dynamic grouping and aggregation ----
GROUP_MAP = {
    "year": FMCGData.year,
    "month": FMCGData.month,
    "pack_type": FMCGData.pack_type,
    "ppg": FMCGData.ppg,
    "channel": FMCGData.channel,
    "brand": FMCGData.brand,
}


def run_grouped_query(
    db: Session,
    metric_col,                    # e.g. FMCGData.sales_value or FMCGData.volume
    agg_func: Callable = func.sum, # aggregation function (default = sum)
    group_by: List[str] = ["year"], # fields to group by
    filters: Dict[str, Any] = None, # filters dict
    label: str = "value",          # name of aggregated field
):
    # validate group_by
    try:
        group_cols = [GROUP_MAP[g] for g in group_by]
    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid group_by: {e.args[0]}. Allowed: {list(GROUP_MAP.keys())}"
        )

    query = db.query(*group_cols, agg_func(metric_col).label(label)).group_by(*group_cols)

    if filters:
        query = apply_filters(query, **filters)

    results = query.all()

    output = []
    for r in results:
        row = {col: getattr(r, col) for col in group_by}
        row[label] = round(getattr(r, label), 2)
        output.append(row)

    return output


# ---- Raw data endpoint ----
@router.get("/", response_model=List[FMCGOut])
def get_fmcg_data(
    brand: Optional[List[str]] = Query(None),
    year: Optional[List[int]] = Query(None),
    pack_type: Optional[List[str]] = Query(None),
    ppg: Optional[List[str]] = Query(None),
    channel: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(FMCGData)
    query = apply_filters(query, brand, year, pack_type, ppg, channel)
    return query.limit(500).all()  # pagination later


# ---- 1. Sales Value ----
# ---- 1. Sales Value ----
@router.get("/sales-value")
def get_sales_value(
    group_by: List[str] = Query(["year","brand"]),
    brand: Optional[List[str]] = Query(None),
    year: Optional[List[int]] = Query(None),
    pack_type: Optional[List[str]] = Query(None),
    ppg: Optional[List[str]] = Query(None),
    channel: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
):
    filters = dict(brand=brand, year=year, pack_type=pack_type, ppg=ppg, channel=channel)
    return run_grouped_query(
        db, 
        metric_col=FMCGData.sales_value,
        group_by=group_by,
        filters=filters,
        label="value"   # 👈 changed
    )


# ---- 2. Volume Contribution ----
@router.get("/volume-contribution")
def get_volume_contribution(
    group_by: List[str] = Query(["year","brand"]),
    brand: Optional[List[str]] = Query(None),
    year: Optional[List[int]] = Query(None),
    pack_type: Optional[List[str]] = Query(None),
    ppg: Optional[List[str]] = Query(None),
    channel: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
):
    filters = dict(brand=brand, year=year, pack_type=pack_type, ppg=ppg, channel=channel)
    return run_grouped_query(
        db,
        metric_col=FMCGData.volume,
        group_by=group_by,
        filters=filters,
        label="value"   # 👈 changed
    )


# ---- 3. Yearly Sales (vertical bar) ----
@router.get("/yearly-sales")
def get_yearly_sales(
    group_by: List[str] = Query(["brand", "year"]),
    brand: Optional[List[str]] = Query(None),
    year: Optional[List[int]] = Query(None),
    pack_type: Optional[List[str]] = Query(None),
    ppg: Optional[List[str]] = Query(None),
    channel: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
):
    filters = dict(brand=brand, year=year, pack_type=pack_type, ppg=ppg, channel=channel)
    return run_grouped_query(
        db,
        metric_col=FMCGData.sales_value,
        group_by=group_by,
        filters=filters,
        label="total_sales"
    )


# ---- 4. Monthly Sales Trend (Line Chart) ----
@router.get("/trend")
def get_sales_trend(
    brand: Optional[List[str]] = Query(None),
    year: Optional[List[int]] = Query(None),
    pack_type: Optional[List[str]] = Query(None),
    ppg: Optional[List[str]] = Query(None),
    channel: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
):
    filters = dict(brand=brand, year=year, pack_type=pack_type, ppg=ppg, channel=channel)

    query = db.query(
        FMCGData.year,
        FMCGData.month,
        func.sum(FMCGData.sales_value).label("total_sales")
    ).group_by(FMCGData.year, FMCGData.month).order_by(FMCGData.year, FMCGData.month)

    query = apply_filters(query, **filters)
    results = query.all()

    return [
        {"year": r.year, "month": r.month, "total_sales": round(r.total_sales, 2)}
        for r in results
    ]


# ---- 5. Market Share (Pie/Donut) ----
@router.get("/market-share")
def get_market_share(
    metric: str = Query("sales", enum=["sales", "volume"]),
    group_by: List[str] = Query(["brand"]),
    brand: Optional[List[str]] = Query(None),
    year: Optional[List[int]] = Query(None),
    pack_type: Optional[List[str]] = Query(None),
    ppg: Optional[List[str]] = Query(None),
    channel: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
):
    filters = dict(brand=brand, year=year, pack_type=pack_type, ppg=ppg, channel=channel)
    metric_col = FMCGData.sales_value if metric == "sales" else FMCGData.volume

    results = run_grouped_query(db, metric_col, group_by=group_by, filters=filters, label="value")

    total = sum(r["value"] for r in results) or 1
    for r in results:
        r["percentage"] = round((r["value"] / total) * 100, 2)

    return results
