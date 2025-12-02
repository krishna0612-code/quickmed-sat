# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import status

# from .models import Appointment
# from .serializers import AppointmentSerializer

# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def book_appointment(request):
#     data = request.data.copy()
#     data["user"] = request.user.id

#     serializer = AppointmentSerializer(data=data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=201)
#     return Response(serializer.errors, status=400)


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def get_appointments(request):
#     appointments = Appointment.objects.filter(user=request.user)
#     serializer = AppointmentSerializer(appointments, many=True)
#     return Response(serializer.data)

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Appointment
from .serializers import AppointmentSerializer

class MyAppointmentsListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        # only the logged-in user's appointments
        return Appointment.objects.filter(user=self.request.user)

class BookAppointmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # expect: doctor_id, doctor_name, date (YYYY-MM-DD), time ("12:00 PM"), status (optional)
            data = request.data.copy()
            
            # Ensure doctor_id is an integer
            if 'doctor_id' in data:
                try:
                    data['doctor_id'] = int(data['doctor_id'])
                except (ValueError, TypeError):
                    return Response(
                        {"error": "doctor_id must be a valid integer", "detail": f"Received: {data.get('doctor_id')}"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Validate required fields
            required_fields = ['doctor_id', 'doctor_name', 'date', 'time']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return Response(
                    {"error": f"Missing required fields: {', '.join(missing_fields)}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = AppointmentSerializer(data=data)
            if not serializer.is_valid():
                # Return detailed validation errors
                return Response(
                    {
                        "error": "Validation failed",
                        "detail": "Please check the provided data",
                        "errors": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            appt = serializer.save(user=request.user, status=data.get("status", "scheduled"))
            return Response(AppointmentSerializer(appt).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print(f"Error in BookAppointmentView: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {
                    "error": "Internal server error",
                    "detail": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
