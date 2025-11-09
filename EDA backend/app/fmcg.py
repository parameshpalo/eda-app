from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Callable

from .models import FMCGData
from .schemas import FMCGOut
from .database import get_db

router = APIRouter(prefix="/fmcg")

# ---- Utility: Apply filters dynamically ----
def apply_filters(query, **filters):
    if filters.get("brand"):
        query = query.filter(FMCGData.brand.in_(filters["brand"]))
    if filters.get("year"):
        query = query.filter(FMCGData.year.in_(filters["year"]))
    if filters.get("pack_type"):
        query = query.filter(FMCGData.pack_type.in_(filters["pack_type"]))
    if filters.get("ppg"):
        query = query.filter(FMCGData.ppg.in_(filters["ppg"]))
    if filters.get("channel"):
        query = query.filter(FMCGData.channel.in_(filters["channel"]))
    return query


# ---- Mapping for grouping ----
GROUP_MAP = {
    "year": FMCGData.year,
    "month": FMCGData.month,
    "pack_type": FMCGData.pack_type,
    "ppg": FMCGData.ppg,
    "channel": FMCGData.channel,
    "brand": FMCGData.brand,
}


# ---- Helper: Run grouped query ----
def run_grouped_query(
    db: Session,
    metric_col,
    group_by: List[str],
    filters: Optional[Dict[str, Any]] = None,
    agg_func: Callable = func.sum,
    label: str = "value",
):
    if not group_by:
        raise HTTPException(status_code=400, detail="group_by cannot be empty")

    try:
        group_cols = [GROUP_MAP[g] for g in group_by]
    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid group_by: {e.args[0]}. Allowed: {list(GROUP_MAP.keys())}"
        )

    query = db.query(*group_cols, agg_func(metric_col).label(label))
    query = apply_filters(query, **(filters or {}))
    query = query.group_by(*group_cols).order_by(*group_cols)

    return [
        {**{col: getattr(r, col) for col in group_by}, label: round(getattr(r, label), 2)}
        for r in query.all()
    ]


# ---- RAW data ----
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
    query = apply_filters(query, brand=brand, year=year, pack_type=pack_type, ppg=ppg, channel=channel)
    return query.limit(500).all()


# ---- 1. Unified Aggregation Endpoint ----
@router.get("/aggregate")
def get_aggregated_data(
    metric: str = Query("sales", enum=["sales", "volume"]),
    group_by: List[str] = Query(..., description="Fields to group by, e.g. year,brand"),
    brand: Optional[List[str]] = Query(None),
    year: Optional[List[int]] = Query(None),
    pack_type: Optional[List[str]] = Query(None),
    ppg: Optional[List[str]] = Query(None),
    channel: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Generic aggregation endpoint to replace:
    - /sales-value
    - /volume-contribution
    - /yearly-sales
    """

    metric_col = FMCGData.sales_value if metric == "sales" else FMCGData.volume

    # Apply filters + group and sum
    return run_grouped_query(
        db=db,
        metric_col=metric_col,
        group_by=group_by,
        filters=locals(),
        agg_func=func.sum,
        label="value"
    )


# ---- Aggregate stats without grouping ----
@router.get("/aggregate-stats")
def get_aggregate_stats(
    metric: str = Query("sales", enum=["sales", "volume"]),
    brand: Optional[List[str]] = Query(None),
    year: Optional[List[int]] = Query(None),
    pack_type: Optional[List[str]] = Query(None),
    ppg: Optional[List[str]] = Query(None),
    channel: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
):
    """Return min, max, sum, avg (and count) for the selected metric with filters applied.

    No grouping is applied; this summarizes all matching rows.
    """
    metric_col = FMCGData.sales_value if metric == "sales" else FMCGData.volume

    # Build aggregate query
    query = db.query(
        func.min(metric_col).label("min"),
        func.max(metric_col).label("max"),
        func.sum(metric_col).label("sum"),
        func.avg(metric_col).label("avg"),
        func.count(metric_col).label("count"),
    )

    query = apply_filters(query, brand=brand, year=year, pack_type=pack_type, ppg=ppg, channel=channel)

    row = query.one()
    # Normalize None to 0.0 for numeric aggregates
    result = {
        "metric": metric,
        "min": float(row.min or 0.0),
        "max": float(row.max or 0.0),
        "sum": float(row.sum or 0.0),
        "avg": float(row.avg or 0.0),
        "count": int(row.count or 0),
    }
    return result


# ---- 3. Market Share ----
@router.get("/market-share")
def get_market_share(
    metric: str = Query("sales", enum=["sales", "volume"]),
    group_by: List[str] = Query(...),
    brand: Optional[List[str]] = Query(None),
    year: Optional[List[int]] = Query(None),
    pack_type: Optional[List[str]] = Query(None),
    ppg: Optional[List[str]] = Query(None),
    channel: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
):
    metric_col = FMCGData.sales_value if metric == "sales" else FMCGData.volume
    results = run_grouped_query(db, metric_col, group_by, locals(), label="value")

    total = sum(r["value"] for r in results) or 1
    for r in results:
        r["percentage"] = round((r["value"] / total) * 100, 2)
    return results


# ---- Health ----
@router.get("/health")
def health_check():
    return {"status": "ok"}







# # ---- 1. Sales Value ----
# @router.get("/sales-value")
# def get_sales_value(
#     group_by: List[str] = Query(...),
#     brand: Optional[List[str]] = Query(None),
#     year: Optional[List[int]] = Query(None),
#     pack_type: Optional[List[str]] = Query(None),
#     ppg: Optional[List[str]] = Query(None),
#     channel: Optional[List[str]] = Query(None),
#     db: Session = Depends(get_db),
# ):
#     return run_grouped_query(db, FMCGData.sales_value, group_by, locals())


# # ---- 2. Volume Contribution ----
# @router.get("/volume-contribution")
# def get_volume_contribution(
#     group_by: List[str] = Query(...),
#     brand: Optional[List[str]] = Query(None),
#     year: Optional[List[int]] = Query(None),
#     pack_type: Optional[List[str]] = Query(None),
#     ppg: Optional[List[str]] = Query(None),
#     channel: Optional[List[str]] = Query(None),
#     db: Session = Depends(get_db),
# ):
#     return run_grouped_query(db, FMCGData.volume, group_by, locals())


# # ---- 3. Yearly Sales ----
# @router.get("/yearly-sales")
# def get_yearly_sales(
#     metric: str = Query("sales", enum=["sales", "volume"]),
#     group_by: List[str] = Query(...),
#     brand: Optional[List[str]] = Query(None),
#     year: Optional[List[int]] = Query(None),
#     pack_type: Optional[List[str]] = Query(None),
#     ppg: Optional[List[str]] = Query(None),
#     channel: Optional[List[str]] = Query(None),
#     db: Session = Depends(get_db),
# ):
#     metric_col = FMCGData.sales_value if metric == "sales" else FMCGData.volume
#     return run_grouped_query(db, metric_col, group_by, locals(), label="value")


# # ---- 2. Sales Trend ----
# @router.get("/trend")
# def get_sales_trend(
#     metric: str = Query("sales", enum=["sales", "volume"]),
#     brand: Optional[List[str]] = Query(None),
#     year: Optional[List[int]] = Query(None),
#     pack_type: Optional[List[str]] = Query(None),
#     ppg: Optional[List[str]] = Query(None),
#     channel: Optional[List[str]] = Query(None),
#     db: Session = Depends(get_db),
# ):
#     metric_col = FMCGData.sales_value if metric == "sales" else FMCGData.volume
#     query = db.query(FMCGData.year, FMCGData.month, func.sum(metric_col).label("value"))
#     query = apply_filters(query, brand=brand, year=year, pack_type=pack_type, ppg=ppg, channel=channel)
#     query = query.group_by(FMCGData.year, FMCGData.month).order_by(FMCGData.year, FMCGData.month)

#     return [{"year": r.year, "month": r.month, "value": round(r.value, 2)} for r in query.all()]
