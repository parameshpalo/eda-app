from django.urls import path
from . import views

app_name = "fmcg_api"

urlpatterns = [
    path("fmcg/", views.get_fmcg_data, name="get_fmcg_data"),
    path("fmcg/sales-value", views.get_sales_value, name="sales_value"),
    path("fmcg/volume-contribution", views.get_volume_contribution, name="volume_contribution"),
    path("fmcg/yearly-sales", views.get_yearly_sales, name="yearly_sales"),
    path("fmcg/trend", views.get_sales_trend, name="trend"),
    path("fmcg/market-share", views.get_market_share, name="market_share"),
    path("fmcg/health", views.health_check, name="health"),
]
