from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from django.core.exceptions import FieldError

from .models import FMCGData
from .serializers import FMCGOutSerializer

# Allowed group_by -> model field name mapping
GROUP_MAP = {
    "year": "year",
    "month": "month",
    "pack_type": "pack_type",
    "ppg": "ppg",
    "channel": "channel",
    "brand": "brand",
}

def apply_filters(qs, params):
    filter_kwargs = {}
    # for list params we expect they may come as repeated query args
    if params.getlist:
        brands = params.getlist("brand")
        if brands:
            filter_kwargs["brand__in"] = brands

        years = params.getlist("year")
        if years:
            # convert to ints where possible
            try:
                years_int = [int(y) for y in years]
                filter_kwargs["year__in"] = years_int
            except ValueError:
                pass

        pack_types = params.getlist("pack_type")
        if pack_types:
            filter_kwargs["pack_type__in"] = pack_types

        ppgs = params.getlist("ppg")
        if ppgs:
            filter_kwargs["ppg__in"] = ppgs

        channels = params.getlist("channel")
        if channels:
            filter_kwargs["channel__in"] = channels

    return qs.filter(**filter_kwargs)

def run_grouped_query(request, metric_field, group_by, params, label="value"):
    if not group_by:
        return Response({"detail": "group_by cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate group_by
    try:
        group_fields = [GROUP_MAP[g] for g in group_by]
    except KeyError as e:
        return Response({"detail": f"Invalid group_by: {e.args[0]}. Allowed: {list(GROUP_MAP.keys())}"}, status=status.HTTP_400_BAD_REQUEST)

    qs = FMCGData.objects.all()
    qs = apply_filters(qs, params)

    try:
        agg = {label: Sum(metric_field)}
        annotated = qs.values(*group_fields).annotate(**agg).order_by(*group_fields)
    except FieldError:
        return Response({"detail": "Invalid metric or grouping fields"}, status=status.HTTP_400_BAD_REQUEST)

    results = []
    for row in annotated:
        entry = {k: row.get(k) for k in group_fields}
        entry[label] = round(row.get(label) or 0.0, 2)
        results.append(entry)
    return results

# ---- RAW data ----
@api_view(["GET"])
def get_fmcg_data(request):
    qs = FMCGData.objects.all()
    qs = apply_filters(qs, request.GET)
    qs = qs[:500]
    serializer = FMCGOutSerializer(qs, many=True)
    return Response(serializer.data)

# ---- 1. Sales Value ----
@api_view(["GET"])
def get_sales_value(request):
    group_by = request.GET.getlist("group_by")
    res = run_grouped_query(request, "sales_value", group_by, request.GET)
    if isinstance(res, Response):
        return res
    return Response(res)

# ---- 2. Volume Contribution ----
@api_view(["GET"])
def get_volume_contribution(request):
    group_by = request.GET.getlist("group_by")
    res = run_grouped_query(request, "volume", group_by, request.GET)
    if isinstance(res, Response):
        return res
    return Response(res)

# ---- 3. Yearly Sales ----
@api_view(["GET"])
def get_yearly_sales(request):
    metric = request.GET.get("metric", "sales")
    metric_field = "sales_value" if metric == "sales" else "volume"
    group_by = request.GET.getlist("group_by")
    res = run_grouped_query(request, metric_field, group_by, request.GET, label="value")
    if isinstance(res, Response):
        return res
    return Response(res)

# ---- 4. Sales Trend ----
@api_view(["GET"])
def get_sales_trend(request):
    metric = request.GET.get("metric", "sales")
    metric_field = "sales_value" if metric == "sales" else "volume"

    qs = FMCGData.objects.all()
    qs = apply_filters(qs, request.GET)
    annotated = qs.values("year", "month").annotate(value=Sum(metric_field)).order_by("year", "month")
    results = [{"year": r["year"], "month": r["month"], "value": round(r["value"] or 0.0, 2)} for r in annotated]
    return Response(results)

# ---- 5. Market Share ----
@api_view(["GET"])
def get_market_share(request):
    group_by = request.GET.getlist("group_by")
    metric = request.GET.get("metric", "sales")
    metric_field = "sales_value" if metric == "sales" else "volume"

    res = run_grouped_query(request, metric_field, group_by, request.GET, label="value")
    if isinstance(res, Response):
        return res

    total = sum(r["value"] for r in res) or 1
    for r in res:
        r["percentage"] = round((r["value"] / total) * 100, 2)
    return Response(res)

# ---- Health ----
@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"})
