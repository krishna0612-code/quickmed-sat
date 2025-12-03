from rest_framework import serializers
from .models import Appointment
from users.models import UserProfile

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id", "user", "doctor_id", "doctor_name", "date", "time", "status", "created_at"]
        read_only_fields = ["id", "user", "created_at"]

class UserProfileSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='user.full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    dateOfBirth = serializers.DateField(source='date_of_birth', required=False, allow_null=True)
    profilePhoto = serializers.ImageField(source='profile_photo', required=False, allow_null=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'fullName', 'email', 'phone',
            'address', 'city', 'pincode',
            'dateOfBirth', 'age', 'gender', 'profilePhoto',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def to_representation(self, instance):
        # Convert snake_case to camelCase for frontend
        data = super().to_representation(instance)
        
        # Convert date_of_birth to dateOfBirth
        date_of_birth = ''
        if instance.date_of_birth:
            date_of_birth = instance.date_of_birth.strftime('%Y-%m-%d')
        
        # Convert profile_photo to profilePhoto URL
        profile_photo = ''
        if instance.profile_photo:
            request = self.context.get('request')
            if request:
                profile_photo = request.build_absolute_uri(instance.profile_photo.url)
            else:
                profile_photo = instance.profile_photo.url
        
        # Format updated_at
        last_updated = ''
        if instance.updated_at:
            last_updated = instance.updated_at.isoformat()
        
        return {
            'fullName': data.get('fullName', '') or '',
            'email': data.get('email', '') or '',
            'phone': data.get('phone', '') or '',
            'address': data.get('address', '') or '',
            'city': data.get('city', '') or '',
            'pincode': data.get('pincode', '') or '',
            'dateOfBirth': date_of_birth,
            'age': str(data.get('age', '')) if data.get('age') else '',
            'gender': data.get('gender', '') or '',
            'profilePhoto': profile_photo,
            'lastUpdated': last_updated
        }
    
    def to_internal_value(self, data):
        # Handle empty strings - convert to None for optional fields
        if not isinstance(data, dict):
            return super().to_internal_value(data)
        
        # Clean the data - convert empty strings to None for optional fields
        cleaned_data = {}
        for key, value in data.items():
            # Convert empty strings to None for optional fields
            if value == '':
                if key in ['dateOfBirth', 'address', 'city', 'pincode', 'gender', 'profilePhoto']:
                    cleaned_data[key] = None
                elif key == 'age':
                    cleaned_data[key] = None
                else:
                    cleaned_data[key] = value
            else:
                cleaned_data[key] = value
        
        # Let DRF handle the field mapping via source parameter
        try:
            return super().to_internal_value(cleaned_data)
        except Exception as e:
            print(f"Error in serializer to_internal_value: {e}")
            print(f"Data received: {data}")
            print(f"Cleaned data: {cleaned_data}")
            raise
