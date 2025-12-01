from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import DeliveryProfile
from .serializers import DeliveryProfileSerializer, DeliveryProfileImageSerializer

class MeDeliveryProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get user's full_name and phone from CustomUser model
        user_full_name = getattr(request.user, 'full_name', '') or request.user.get_full_name() or request.user.username or ""
        user_email = request.user.email or ""
        user_phone = getattr(request.user, 'phone', '') or ""
        
        # Get or create profile with user's initial data
        profile, created = DeliveryProfile.objects.get_or_create(
            user=request.user,
            defaults={
                "email": user_email,
                "full_name": user_full_name,
                "phone": user_phone
            }
        )
        
        # If profile was just created or fields are empty, update with user data
        if created or not profile.full_name or not profile.email or not profile.phone:
            updated = False
            if not profile.full_name:
                profile.full_name = user_full_name
                updated = True
            if not profile.email:
                profile.email = user_email
                updated = True
            if not profile.phone:
                profile.phone = user_phone
                updated = True
            if updated:
                profile.save()
        
        return Response(DeliveryProfileSerializer(profile).data, status=200)

    # Full replace (not required by your UI, but nice to have)
    def put(self, request):
        profile, _ = DeliveryProfile.objects.get_or_create(user=request.user)
        s = DeliveryProfileSerializer(instance=profile, data=request.data)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(DeliveryProfileSerializer(profile).data, status=200)

    # Partial update (perfect for your single-field saves)
    def patch(self, request):
        try:
            # Get or create profile, ensuring it has user's basic info
            profile, created = DeliveryProfile.objects.get_or_create(user=request.user)
            
            # If profile was just created, initialize with user data
            if created:
                user_full_name = getattr(request.user, 'full_name', '') or request.user.get_full_name() or request.user.username or ""
                user_email = request.user.email or ""
                user_phone = getattr(request.user, 'phone', '') or ""
                profile.full_name = user_full_name
                profile.email = user_email
                profile.phone = user_phone
                profile.save()
            
            s = DeliveryProfileSerializer(instance=profile, data=request.data, partial=True)
            if s.is_valid():
                s.save()
                return Response(DeliveryProfileSerializer(profile).data, status=200)
            else:
                return Response(s.errors, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class MeDeliveryProfileImageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = DeliveryProfile.objects.get_or_create(user=request.user)
        s = DeliveryProfileImageSerializer(instance=profile, data=request.data)
        if s.is_valid():
            s.save()
            return Response({"profileImage": profile.profile_image.url}, status=200)
        return Response(s.errors, status=400)
