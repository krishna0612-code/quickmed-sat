



from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import CustomUser, UserProfile, VendorProfile, DeliveryProfile, CartItem, Order

# Import DoctorProfile from doctor app
try:
    from doctor.models import DoctorProfile
except (ImportError, ModuleNotFoundError):
    # If doctor app is not available, DoctorProfile will be None
    DoctorProfile = None


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["full_name", "email", "phone", "password", "user_type"]

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        user = CustomUser.objects.create(**validated_data)

        if user.user_type == "user":
            UserProfile.objects.create(user=user)
        elif user.user_type == "vendor":
            VendorProfile.objects.create(user=user)
        elif user.user_type == "delivery":
            DeliveryProfile.objects.create(user=user)
        elif user.user_type == "doctor":
            # Create DoctorProfile if available
            if DoctorProfile:
                try:
                    DoctorProfile.objects.create(user=user)
                except Exception as e:
                    # Log error but don't fail signup
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error creating DoctorProfile: {e}")
            else:
                # DoctorProfile not available, log warning
                import logging
                logger = logging.getLogger(__name__)
                logger.warning("DoctorProfile model not found, skipping profile creation")

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()
    user_type = serializers.CharField()


class VendorProfileSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='user.full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    
    class Meta:
        model = VendorProfile
        fields = [
            'fullName', 'email', 'phone',
            'pharmacy_name', 'license_number', 'gst_number',
            'address', 'city', 'state', 'pincode',
            'opening_time', 'closing_time'
        ]
        
    def to_representation(self, instance):
        # Convert snake_case to camelCase for frontend
        data = super().to_representation(instance)
        # Handle None/null values - convert to empty string for frontend
        def safe_get(key, default=''):
            value = data.get(key, default)
            return value if value is not None else default
        
        return {
            'fullName': safe_get('fullName', ''),
            'email': safe_get('email', ''),
            'phone': safe_get('phone', ''),
            'pharmacyName': safe_get('pharmacy_name', ''),
            'licenseNumber': safe_get('license_number', ''),
            'gstNumber': safe_get('gst_number', ''),
            'address': safe_get('address', ''),
            'city': safe_get('city', ''),
            'state': safe_get('state', ''),
            'pincode': safe_get('pincode', ''),
            'openingTime': safe_get('opening_time', ''),
            'closingTime': safe_get('closing_time', '')
        }
    
    def to_internal_value(self, data):
        # Convert camelCase to snake_case for backend
        if not isinstance(data, dict):
            return super().to_internal_value(data)
        
        # Map camelCase keys to snake_case
        field_mapping = {
            'pharmacyName': 'pharmacy_name',
            'licenseNumber': 'license_number',
            'gstNumber': 'gst_number',
            'openingTime': 'opening_time',
            'closingTime': 'closing_time'
        }
        
        # Convert keys - keep address, city, state, pincode as is
        converted_data = {}
        for key, value in data.items():
            if key in field_mapping:
                converted_data[field_mapping[key]] = value
            elif key in ['address', 'city', 'state', 'pincode']:
                converted_data[key] = value
            # Ignore other keys like fullName, email, phone (read-only)
        
        # Call parent to_internal_value for validation
        return super().to_internal_value(converted_data)


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['id', 'medicine_id', 'medicine_name', 'medicine_price', 'vendor', 'category', 'quantity']
        read_only_fields = ['id']
    
    def to_representation(self, instance):
        return {
            'id': instance.medicine_id,
            'name': instance.medicine_name,
            'price': float(instance.medicine_price),
            'vendor': instance.vendor,
            'category': instance.category,
            'quantity': instance.quantity
        }


class OrderSerializer(serializers.ModelSerializer):
    vendor_id = serializers.IntegerField(source='vendor.id', read_only=True)
    vendor_name = serializers.CharField(source='vendor.full_name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'status', 'delivery_type', 'customer_name', 
            'customer_phone', 'delivery_address', 'items', 'total_amount', 
            'payment_id', 'prescription_required', 'created_at', 'updated_at', 
            'order_date', 'vendor_id', 'vendor_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'order_date']
    
    def to_representation(self, instance):
        # Convert to frontend format
        data = super().to_representation(instance)
        return {
            'id': data['order_id'],
            'orderId': data['order_id'],
            'status': data['status'],
            'deliveryType': data['delivery_type'],
            'customerName': data['customer_name'],
            'customerPhone': data['customer_phone'],
            'address': data['delivery_address'],
            'items': data['items'],
            'total': float(data['total_amount']),
            'paymentId': data['payment_id'],
            'prescriptionRequired': data['prescription_required'],
            'orderTime': instance.created_at.strftime('%Y-%m-%d %H:%M'),
            'date': data['order_date'],
            'vendorId': data['vendor_id'],
            'vendorName': data['vendor_name']
        }

