from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import CustomUser
from .models import Appointments
from .serializers import AppointmentSerializer


# BOOK APPOINTMENT
@api_view(["POST"])
def book_appointment(request):
    try:
        patient = CustomUser.objects.get(id=request.data.get("patientId"))
        doctor = CustomUser.objects.get(id=request.data.get("doctorId"))
    except CustomUser.DoesNotExist:
        return Response({"error": "Invalid IDs"}, status=400)

    appointment = Appointment.objects.create(
        patient=patient,
        doctor=doctor,
        date=request.data.get("date"),
        time=request.data.get("time"),
        age=request.data.get("age"),
        issue=request.data.get("issue"),
        duration=request.data.get("duration", "30 min"),
        priority=request.data.get("priority", "normal"),
        requested_date=request.data.get("date"),
    )
    return Response(AppointmentSerializer(appointment).data, status=201)

@api_view(["GET"])
def appointments_list(request):
    doctor_id = request.GET.get("doctorId")
    patient_id = request.GET.get("patientId")
    status_filter = request.GET.get("filter")

    qs = Appointment.objects.all()

    if doctor_id:
        qs = qs.filter(doctor_id=doctor_id)

    if patient_id:
        qs = qs.filter(patient_id=patient_id)  # 🔥 NEW LINE

    if status_filter:
        qs = qs.filter(status=status_filter)

    qs = qs.order_by("date", "time")
    serializer = AppointmentSerializer(qs, many=True)
    return Response(serializer.data)



# APPROVE APPOINTMENT
@api_view(["POST"])
def approve_appointment(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    appointment.status = "upcoming"
    appointment.save()
    return Response({"message": "Appointment approved"})


# CANCEL or REJECT APPOINTMENT
@api_view(["POST"])
def cancel_appointment(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    appointment.status = "cancelled"
    appointment.cancelled_reason = request.data.get("reason", "")
    appointment.cancelled_date = request.data.get("date")
    appointment.save()
    return Response({"message": "Appointment cancelled"})


# COMPLETE CONSULTATION
@api_view(["POST"])
def start_consultation(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    appointment.status = "completed"
    appointment.save()
    return Response({"message": "Consultation completed"})


# DASHBOARD STATS
@api_view(["GET"])
def doctor_dashboard_stats(request):
    doctor_id = request.GET.get("doctorId")

    if not doctor_id or doctor_id == "undefined":
        return Response({
            "total": 0,
            "completed": 0,
            "pending": 0,
            "cancelled": 0,
        })

    total = Appointment.objects.filter(doctor_id=doctor_id).count()
    completed = Appointment.objects.filter(doctor_id=doctor_id, status="completed").count()
    pending = Appointment.objects.filter(doctor_id=doctor_id, status="pending").count()
    cancelled = Appointment.objects.filter(doctor_id=doctor_id, status="cancelled").count()

    return Response({
        "total": total,
        "completed": completed,
        "pending": pending,
        "cancelled": cancelled,
    })



@api_view(["GET"])
def user_appointments(request):
    patient_id = request.GET.get("patientId")

    if patient_id in [None, "null", "", "undefined"]:
        return Response([], status=200)

    qs = Appointment.objects.filter(patient_id=patient_id).order_by("date", "time")
    serializer = AppointmentSerializer(qs, many=True)
    return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import DoctorProfile
from .serializers import DoctorProfileSerializer


class MeDoctorProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get doctor profile for the authenticated user.
        Creates profile if it doesn't exist.
        """
        # Only allow doctors to access this endpoint
        if request.user.user_type != 'doctor':
            return Response(
                {'error': 'Only doctors can access this endpoint'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        profile, created = DoctorProfile.objects.get_or_create(user=request.user)
        
        # If newly created, sync with user data
        if created:
            profile.email = request.user.email
            profile.phone = request.user.phone
            profile.full_name = request.user.full_name
            profile.save()
        
        serializer = DoctorProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """
        Update doctor profile (full update).
        """
        # Only allow doctors to access this endpoint
        if request.user.user_type != 'doctor':
            return Response(
                {'error': 'Only doctors can access this endpoint'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        profile, created = DoctorProfile.objects.get_or_create(user=request.user)
        
        serializer = DoctorProfileSerializer(instance=profile, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """
        Update doctor profile (partial update).
        """
        # Only allow doctors to access this endpoint
        if request.user.user_type != 'doctor':
            return Response(
                {'error': 'Only doctors can access this endpoint'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        profile, created = DoctorProfile.objects.get_or_create(user=request.user)
        
        # If newly created, sync with user data first
        if created:
            profile.email = request.user.email
            profile.phone = request.user.phone
            profile.full_name = request.user.full_name
            profile.save()
        
        serializer = DoctorProfileSerializer(instance=profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_200_OK)

from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from .models import DoctorProfile
from .serializers import DoctorProfileSerializer

class DoctorListView(ListAPIView):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [AllowAny]
