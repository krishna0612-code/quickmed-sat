

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserProfile, VendorProfile, DeliveryProfile


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("id", "full_name", "email", "phone", "user_type", "is_staff")
    list_filter = ("user_type", "is_staff")
    search_fields = ("email", "full_name", "phone")
    ordering = ("id",)

    fieldsets = (
        ("Credentials", {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name", "phone", "user_type")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "full_name", "phone", "user_type", "password1", "password2"),
        }),
    )


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserProfile)
admin.site.register(VendorProfile)
admin.site.register(DeliveryProfile)

