from django.urls import path
from .views import MeDeliveryProfileView, MeDeliveryProfileImageView

urlpatterns = [
    path('profile/', MeDeliveryProfileView.as_view(), name='delivery_me_profile'),
    path('profile/image/', MeDeliveryProfileImageView.as_view(), name='delivery_me_profile_image'),
]
