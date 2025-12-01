from rest_framework import serializers
from .models import DeliveryProfile

class DeliveryProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryProfile
        fields = [
            # snake_case (internal)
            "full_name","email","phone","current_location","vehicle_type","vehicle_number",
            "emergency_contact1_name","emergency_contact1_phone","emergency_contact1_relation",
            "emergency_contact2_name","emergency_contact2_phone","emergency_contact2_relation",
            "bank_account_number","bank_account_holder","bank_name","ifsc_code","upi_id",
            "joined_date","total_deliveries","rating","completion_rate","response_time","average_rating",
            "profile_image",
        ]

    # map to frontend keys
    def to_representation(self, instance):
        d = super().to_representation(instance)
        import hashlib
        # Generate consistent agentId from user ID
        user_id_str = str(instance.user.id)
        agent_hash = hashlib.md5(user_id_str.encode()).hexdigest()[:8].upper()
        agent_id = f"DA-{agent_hash}"
        
        return {
            "agentId": agent_id,
            "fullName": d["full_name"],
            "email": d["email"],
            "phone": d["phone"],
            "currentLocation": d["current_location"],
            "vehicleType": d["vehicle_type"],
            "vehicleNumber": d["vehicle_number"],

            "emergencyContact1Name": d["emergency_contact1_name"],
            "emergencyContact1Phone": d["emergency_contact1_phone"],
            "emergencyContact1Relation": d["emergency_contact1_relation"],
            "emergencyContact2Name": d["emergency_contact2_name"],
            "emergencyContact2Phone": d["emergency_contact2_phone"],
            "emergencyContact2Relation": d["emergency_contact2_relation"],

            "bankAccountNumber": d["bank_account_number"],
            "bankAccountHolder": d["bank_account_holder"],
            "bankName": d["bank_name"],
            "ifscCode": d["ifsc_code"],
            "upiId": d["upi_id"],

            "joinedDate": d["joined_date"],
            "totalDeliveries": d["total_deliveries"],
            "rating": d["rating"],
            "completionRate": d["completion_rate"],
            "responseTime": d["response_time"],
            "averageRating": d["average_rating"],

            "profileImage": instance.profile_image.url if instance.profile_image else "",
        }

    def to_internal_value(self, data):
        # Map camelCase frontend keys to snake_case backend keys
        field_mapping = {
            "fullName": "full_name",
            "email": "email",
            "phone": "phone",
            "currentLocation": "current_location",
            "vehicleType": "vehicle_type",
            "vehicleNumber": "vehicle_number",
            "emergencyContact1Name": "emergency_contact1_name",
            "emergencyContact1Phone": "emergency_contact1_phone",
            "emergencyContact1Relation": "emergency_contact1_relation",
            "emergencyContact2Name": "emergency_contact2_name",
            "emergencyContact2Phone": "emergency_contact2_phone",
            "emergencyContact2Relation": "emergency_contact2_relation",
            "bankAccountNumber": "bank_account_number",
            "bankAccountHolder": "bank_account_holder",
            "bankName": "bank_name",
            "ifscCode": "ifsc_code",
            "upiId": "upi_id",
            "joinedDate": "joined_date",
            "totalDeliveries": "total_deliveries",
            "rating": "rating",
            "completionRate": "completion_rate",
            "responseTime": "response_time",
            "averageRating": "average_rating",
        }
        
        # Convert frontend keys to backend keys
        backend_data = {}
        for frontend_key, backend_key in field_mapping.items():
            if frontend_key in data:
                backend_data[backend_key] = data[frontend_key]
        
        # Also handle direct snake_case keys (for backward compatibility)
        for key in data:
            if key not in field_mapping and key in self.Meta.fields:
                backend_data[key] = data[key]
        
        return super().to_internal_value(backend_data)

class DeliveryProfileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryProfile
        fields = ["profile_image"]
