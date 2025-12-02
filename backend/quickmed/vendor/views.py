from django.shortcuts import render

# Cfrom rest_framework import generics, permissions

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Medicine
from .serializers import MedicineSerializer

class MyMedicinesView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MedicineSerializer

    def get_queryset(self):
        return Medicine.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MyMedicineDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MedicineSerializer

    def get_queryset(self):
        return Medicine.objects.filter(user=self.request.user)

# Public endpoint for users to view all available medicines
class AllMedicinesView(APIView):
    permission_classes = []  # Public endpoint, no authentication required
    
    def get(self, request):
        # Get all medicines with quantity > 0 (available stock)
        medicines = Medicine.objects.filter(quantity__gt=0).select_related('user')
        
        # Serialize medicines
        serializer = MedicineSerializer(medicines, many=True)
        
        # Add vendor information to each medicine
        medicines_data = []
        for medicine_data in serializer.data:
            medicine_obj = Medicine.objects.get(id=medicine_data['id'])
            
            # Try to get vendor profile with pharmacy name
            vendor_name = 'Unknown Vendor'
            try:
                # Check if user has a vendor profile
                from users.models import VendorProfile
                try:
                    vendor_profile = VendorProfile.objects.get(user=medicine_obj.user)
                    vendor_name = vendor_profile.pharmacy_name or medicine_obj.user.full_name or vendor_name
                except VendorProfile.DoesNotExist:
                    # Fallback to user's full name or email
                    vendor_name = medicine_obj.user.full_name or medicine_obj.user.email.split('@')[0].title()
            except Exception as e:
                # If any error, use user's full name or email
                vendor_name = medicine_obj.user.full_name or medicine_obj.user.email.split('@')[0].title()
            
            medicines_data.append({
                **medicine_data,
                'vendor': vendor_name,
                'vendorId': medicine_obj.user.id,  # Add vendor ID for order creation
                'description': f"{medicine_data['name']} - {medicine_data['category']}"
            })
        
        return Response(medicines_data)
