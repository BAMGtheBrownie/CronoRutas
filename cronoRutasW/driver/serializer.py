from rest_framework import serializers
from .models import BusDriver

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusDriver
        fields = '__all__'