from django.urls import path
from .views import (
    signup, login_user, vendor_profile, 
    cart_items, cart_item_detail,
    create_order, user_orders, vendor_orders, update_order_status
)

urlpatterns = [
    path("signup/", signup),
    path("login/", login_user),
    path("vendor-profile/", vendor_profile),
    path("cart/", cart_items, name="cart_items"),
    path("cart/<int:medicine_id>/", cart_item_detail, name="cart_item_detail"),
    path("orders/", create_order, name="create_order"),
    path("orders/my/", user_orders, name="user_orders"),
    path("orders/vendor/", vendor_orders, name="vendor_orders"),
    path("orders/<str:order_id>/status/", update_order_status, name="update_order_status"),
    # path("doctors/", list_doctors), 
   
]


 