from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Appointment
from .serializers import AppointmentSerializer

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    data = request.data.copy()
    data["user"] = request.user.id

    serializer = AppointmentSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_appointments(request):
    appointments = Appointment.objects.filter(user=request.user)
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)

