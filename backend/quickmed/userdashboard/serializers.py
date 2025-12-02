from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id", "user", "doctor_id", "doctor_name", "date", "time", "status", "created_at"]
        read_only_fields = ["id", "user", "created_at"]
