




from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


USER_TYPES = (
    ("user", "User"),
    ("vendor", "Vendor"),
    ("delivery", "Delivery"),
    ("doctor", "Doctor"),
)


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPES)

    username = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    groups = models.ManyToManyField("auth.Group", related_name="customuser_groups", blank=True)
    user_permissions = models.ManyToManyField("auth.Permission", related_name="customuser_permissions", blank=True)

    def __str__(self):
        return f"{self.full_name} - {self.email} ({self.user_type})"


class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='user_profile')
    address = models.TextField(blank=True, null=True, default='')
    city = models.CharField(max_length=100, blank=True, null=True, default='')
    pincode = models.CharField(max_length=10, blank=True, null=True, default='')
    date_of_birth = models.DateField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True, default='', choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer-not-to-say', 'Prefer not to say')
    ])
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.full_name} - {self.user.email}"


class VendorProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    pharmacy_name = models.CharField(max_length=200, blank=True, null=True)
    license_number = models.CharField(max_length=100, blank=True, null=True)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    opening_time = models.CharField(max_length=20, blank=True, null=True)
    closing_time = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.full_name} - {self.pharmacy_name or 'No Pharmacy Name'}"


class DeliveryProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)


class CartItem(models.Model):
    """Cart items for users - persists cart data"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='cart_items')
    medicine_id = models.IntegerField()
    medicine_name = models.CharField(max_length=200)
    medicine_price = models.DecimalField(max_digits=10, decimal_places=2)
    vendor = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, default='')
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'medicine_id']
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} - {self.medicine_name} (x{self.quantity})"


class Order(models.Model):
    """Orders placed by users"""
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('ready', 'Ready'),
        ('picked', 'Picked'),
        ('cancelled', 'Cancelled'),
        ('confirmed', 'Confirmed'),
        ('delivered', 'Delivered'),
    ]
    
    DELIVERY_TYPE_CHOICES = [
        ('home', 'Home Delivery'),
        ('pickup', 'Store Pickup'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='user_orders')
    vendor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='vendor_orders', limit_choices_to={'user_type': 'vendor'})
    order_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPE_CHOICES, default='home')
    
    # Customer information
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    delivery_address = models.TextField()
    
    # Order items (stored as JSON)
    items = models.JSONField(default=list)  # List of {name, quantity, price, medicine_id}
    
    # Financial
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_id = models.CharField(max_length=200, blank=True, null=True)
    
    # Flags
    prescription_required = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    order_date = models.DateField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order_id} - {self.customer_name} - {self.status}"


# class DoctorProfile(models.Model):
#     user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)

