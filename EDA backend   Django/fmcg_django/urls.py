from django.urls import path, include
from django.http import JsonResponse

def root(request):
    return JsonResponse({"hello": "world"})

urlpatterns = [
    path("", root),
    path("api/", include("fmcg_api.urls")),
]
