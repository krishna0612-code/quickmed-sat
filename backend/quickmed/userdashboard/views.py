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
from .serializers import AppointmentSerializer, UserProfileSerializer
from users.models import UserProfile

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

class MyUserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get user profile for the authenticated user.
        Creates profile if it doesn't exist.
        """
        try:
            # Only allow users to access this endpoint
            if request.user.user_type != 'user':
                return Response(
                    {'error': 'Only users can access this endpoint'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            
            # If newly created, sync with user data
            if created:
                profile.save()
            
            serializer = UserProfileSerializer(profile, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in MyUserProfileView GET: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while fetching profile', 'detail': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request):
        """
        Update user profile (partial update).
        """
        try:
            # Only allow users to access this endpoint
            if request.user.user_type != 'user':
                return Response(
                    {'error': 'Only users can access this endpoint'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            
            # Prepare data for serializer - handle dateOfBirth conversion
            serializer_data = request.data.copy()
            
            # Calculate age if date_of_birth is provided
            date_of_birth = serializer_data.get('dateOfBirth') or serializer_data.get('date_of_birth')
            if date_of_birth and date_of_birth != '':
                from datetime import datetime, date
                try:
                    if isinstance(date_of_birth, str):
                        dob = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
                    else:
                        dob = date_of_birth
                    
                    today = date.today()
                    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                    serializer_data['age'] = age
                except Exception as e:
                    print(f"Error calculating age: {e}")
                    # Don't fail if age calculation fails, just skip it
            
            # Handle empty strings - convert to None for optional fields
            for key in ['address', 'city', 'pincode', 'gender', 'dateOfBirth']:
                if key in serializer_data and serializer_data[key] == '':
                    serializer_data[key] = None
            
            # Handle age - convert empty string to None
            if 'age' in serializer_data:
                if serializer_data['age'] == '' or serializer_data['age'] is None:
                    serializer_data['age'] = None
                elif isinstance(serializer_data['age'], str):
                    try:
                        serializer_data['age'] = int(serializer_data['age'])
                    except (ValueError, TypeError):
                        serializer_data['age'] = None
            
            serializer = UserProfileSerializer(instance=profile, data=serializer_data, partial=True, context={'request': request})
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            # Log validation errors for debugging
            print(f"Serializer validation errors: {serializer.errors}")
            print(f"Data sent to serializer: {serializer_data}")
            
            return Response(
                {'error': 'Validation failed', 'errors': serializer.errors, 'detail': 'Please check the provided data'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in MyUserProfileView PATCH: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred while updating profile', 'detail': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
