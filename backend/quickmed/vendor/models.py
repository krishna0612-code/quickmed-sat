
# Create your models here.
from django.conf import settings
from django.db import models

class Medicine(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="medicines")
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=80)
    quantity = models.IntegerField()
    min_stock = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateField()
    supplier = models.CharField(max_length=120, blank=True, default="")
    batch_no = models.CharField(max_length=60, blank=True, default="")
    prescription_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.batch_no})"
