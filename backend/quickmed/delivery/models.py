from django.db import models
from django.conf import settings

class DeliveryProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="delivery_profile")

    # Personal
    full_name = models.CharField(max_length=120, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    current_location = models.CharField(max_length=150, blank=True, default='')
    vehicle_type = models.CharField(max_length=30, blank=True, default='')
    vehicle_number = models.CharField(max_length=30, blank=True, default='')

    # Emergency contacts
    emergency_contact1_name = models.CharField(max_length=120, blank=True, default='')
    emergency_contact1_phone = models.CharField(max_length=20, blank=True, default='')
    emergency_contact1_relation = models.CharField(max_length=60, blank=True, default='')
    emergency_contact2_name = models.CharField(max_length=120, blank=True, default='')
    emergency_contact2_phone = models.CharField(max_length=20, blank=True, default='')
    emergency_contact2_relation = models.CharField(max_length=60, blank=True, default='')

    # Bank
    bank_account_number = models.CharField(max_length=24, blank=True, default='')
    bank_account_holder = models.CharField(max_length=120, blank=True, default='')
    bank_name = models.CharField(max_length=120, blank=True, default='')
    ifsc_code = models.CharField(max_length=11, blank=True, default='')
    upi_id = models.CharField(max_length=60, blank=True, default='')

    # Media
    profile_image = models.ImageField(upload_to="delivery/profile_images/", blank=True, null=True)

    # Stats (display-only fields you showed; keep editable if you need)
    joined_date = models.CharField(max_length=40, blank=True, default='')
    total_deliveries = models.IntegerField(blank=True, null=True, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True, default=0)
    completion_rate = models.CharField(max_length=20, blank=True, default='')
    response_time = models.CharField(max_length=20, blank=True, default='')
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True, default=0)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"DeliveryProfile<{self.user.username}>"


# Create your models here.
