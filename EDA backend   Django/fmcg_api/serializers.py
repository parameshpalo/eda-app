from rest_framework import serializers
from .models import FMCGData

class FMCGOutSerializer(serializers.ModelSerializer):
    class Meta:
        model = FMCGData
        fields = "__all__"
