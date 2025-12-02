from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer
from .models import CustomUser

@api_view(["POST"])
def signup(request):
    # Check if email already exists
    if CustomUser.objects.filter(email=request.data.get("email")).exists():
        return Response({"message": "Email already registered"}, status=400)

    # Check if phone already exists
    if CustomUser.objects.filter(phone=request.data.get("phone")).exists():
        return Response({"message": "Phone already registered"}, status=400)

    serializer = SignupSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Account created successfully"}, status=201)

    return Response(serializer.errors, status=400)





from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import time

from .models import CustomUser, VendorProfile, CartItem, Order
from .serializers import SignupSerializer, LoginSerializer, VendorProfileSerializer, CartItemSerializer, OrderSerializer



@api_view(["POST"])
def login_user(request):
    data = request.data
 
    email_or_phone = data.get("email")
    password = data.get("password")
    user_type = data.get("user_type") or data.get("userType")
 
    if not email_or_phone or not password or not user_type:
        return Response({"error": "Missing fields"}, status=400)
 
    # Find user
    try:
        if "@" in str(email_or_phone):
            user = CustomUser.objects.get(email=email_or_phone)
        else:
            user = CustomUser.objects.get(phone=email_or_phone)
    except CustomUser.DoesNotExist:
        return Response({"error": "Invalid login credentials"}, status=400)
 
    # Check user type
    if user.user_type != user_type:
        return Response({"error": "User type does not match"}, status=400)
 
    # Check password
    if not user.check_password(password):
        return Response({"error": "Invalid login credentials"}, status=400)
 
    # Generate Token
    refresh = RefreshToken.for_user(user)
 
    return Response({
        "token": str(refresh.access_token),
        "refresh": str(refresh),
       
        # 🔥 IMPORTANT → match frontend keys
        "fullName": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "userType": user.user_type,
    }, status=200)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def vendor_profile(request):
    """
    GET: Retrieve vendor profile
    PUT: Update vendor profile
    """
    # Ensure user is a vendor
    if request.user.user_type != 'vendor':
        return Response({"error": "User is not a vendor"}, status=status.HTTP_403_FORBIDDEN)
    
    # Debug: Print which user is requesting
    print(f"Vendor profile request from user: {request.user.email} (ID: {request.user.id})")
    
    try:
        vendor_profile_obj = VendorProfile.objects.get(user=request.user)
    except VendorProfile.DoesNotExist:
        # Create profile if it doesn't exist
        vendor_profile_obj = VendorProfile.objects.create(user=request.user)
        print(f"Created new vendor profile for user: {request.user.email}")
    
    if request.method == "GET":
        serializer = VendorProfileSerializer(vendor_profile_obj)
        # Debug: Print the data being returned
        print(f"Returning vendor profile data for {request.user.email}: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == "PUT":
        print(f"Received update request with data: {request.data}")
        serializer = VendorProfileSerializer(vendor_profile_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Refresh from database to ensure we have latest data
            vendor_profile_obj.refresh_from_db()
            print(f"Profile saved. Current data: pharmacy_name={vendor_profile_obj.pharmacy_name}, license={vendor_profile_obj.license_number}")
            # Return updated data in frontend format
            updated_serializer = VendorProfileSerializer(vendor_profile_obj)
            print(f"Returning updated data: {updated_serializer.data}")
            return Response(updated_serializer.data, status=status.HTTP_200_OK)
        print(f"Validation failed: {serializer.errors}")
        return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def cart_items(request):
    """GET: Fetch user's cart | POST: Add/update cart item"""
    if request.user.user_type != 'user':
        return Response({"error": "Only users can manage cart"}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == "GET":
        items = CartItem.objects.filter(user=request.user)
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == "POST":
        medicine_id = request.data.get('medicine_id') or request.data.get('id')
        if not medicine_id:
            return Response({"error": "medicine_id required"}, status=status.HTTP_400_BAD_REQUEST)
        
        item, created = CartItem.objects.get_or_create(
            user=request.user,
            medicine_id=medicine_id,
            defaults={
                'medicine_name': request.data.get('name', ''),
                'medicine_price': request.data.get('price', 0),
                'vendor': request.data.get('vendor', ''),
                'category': request.data.get('category', ''),
                'quantity': request.data.get('quantity', 1)
            }
        )
        
        if not created:
            item.quantity = request.data.get('quantity', item.quantity + 1)
            item.medicine_name = request.data.get('name', item.medicine_name)
            item.medicine_price = request.data.get('price', item.medicine_price)
            item.vendor = request.data.get('vendor', item.vendor)
            item.category = request.data.get('category', item.category)
            item.save()
        
        serializer = CartItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def cart_item_detail(request, medicine_id):
    """PUT: Update quantity | DELETE: Remove item"""
    if request.user.user_type != 'user':
        return Response({"error": "Only users can manage cart"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        item = CartItem.objects.get(user=request.user, medicine_id=medicine_id)
    except CartItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == "PUT":
        new_quantity = request.data.get('quantity')
        if new_quantity is None:
            return Response({"error": "quantity required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_quantity <= 0:
            item.delete()
            return Response({"message": "Item removed"}, status=status.HTTP_200_OK)
        
        item.quantity = new_quantity
        item.save()
        serializer = CartItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == "DELETE":
        item.delete()
        return Response({"message": "Item removed"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Create a new order (for users)"""
    if request.user.user_type != 'user':
        return Response({"error": "Only users can create orders"}, status=status.HTTP_403_FORBIDDEN)
    
    # Get vendor_id from request
    vendor_id = request.data.get('vendor_id')
    if not vendor_id:
        return Response({"error": "vendor_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        vendor = CustomUser.objects.get(id=vendor_id, user_type='vendor')
    except CustomUser.DoesNotExist:
        return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Generate order_id
    order_id = f"ORD{int(time.time() * 1000)}"
    
    # Create order
    order_data = {
        'user': request.user,
        'vendor': vendor,
        'order_id': order_id,
        'status': 'pending',  # Start as pending for vendor
        'delivery_type': request.data.get('delivery_type', 'home'),
        'customer_name': request.data.get('customer_name') or request.user.full_name,
        'customer_phone': request.data.get('customer_phone') or request.user.phone,
        'delivery_address': request.data.get('delivery_address', ''),
        'items': request.data.get('items', []),
        'total_amount': request.data.get('total_amount', 0),
        'payment_id': request.data.get('payment_id', ''),
        'prescription_required': request.data.get('prescription_required', False)
    }
    
    order = Order.objects.create(**order_data)
    print(f"Order created: {order.order_id} for vendor {vendor.email} (ID: {vendor.id})")
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_orders(request):
    """Get all orders for the logged-in user"""
    if request.user.user_type != 'user':
        return Response({"error": "Only users can view their orders"}, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def vendor_orders(request):
    """Get all orders for the logged-in vendor"""
    if request.user.user_type != 'vendor':
        return Response({"error": "Only vendors can view their orders"}, status=status.HTTP_403_FORBIDDEN)
    
    print(f"Fetching orders for vendor: {request.user.email} (ID: {request.user.id})")
    orders = Order.objects.filter(vendor=request.user).order_by('-created_at')
    print(f"Found {orders.count()} orders for this vendor")
    
    # Group by status
    orders_by_status = {
        'pending': [],
        'ready': [],
        'picked': [],
        'cancelled': []
    }
    
    serializer = OrderSerializer(orders, many=True)
    for order_data in serializer.data:
        status_val = order_data.get('status', 'pending')
        print(f"Order {order_data.get('orderId')} has status: {status_val}")
        if status_val in orders_by_status:
            orders_by_status[status_val].append(order_data)
        elif status_val == 'confirmed':
            # Map 'confirmed' to 'pending' for vendor view
            orders_by_status['pending'].append(order_data)
    
    print(f"Orders grouped: pending={len(orders_by_status['pending'])}, ready={len(orders_by_status['ready'])}, picked={len(orders_by_status['picked'])}, cancelled={len(orders_by_status['cancelled'])}")
    return Response(orders_by_status, status=status.HTTP_200_OK)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    """Update order status (for vendors)"""
    if request.user.user_type != 'vendor':
        return Response({"error": "Only vendors can update order status"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        order = Order.objects.get(order_id=order_id, vendor=request.user)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    
    new_status = request.data.get('status')
    if new_status not in ['pending', 'ready', 'picked', 'cancelled']:
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
    
    order.status = new_status
    order.save()
    
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)
  


 

# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status
# from .models import CustomUser,DoctorProfile

# @api_view(["GET"])
# def list_doctors(request):
#     doctors = CustomUser.objects.filter(user_type="doctor")
#     data = []

#     for doctor in doctors:
#         data.append({
#             "id": doctor.id,
#             "full_name": doctor.full_name,
#             "email": doctor.email,
#             "phone": doctor.phone,
#         })

#     return Response(data, status=status.HTTP_200_OK)



