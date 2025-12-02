from django.conf import settings
from django.db import models

class Appointment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments"
    )
    doctor_id = models.IntegerField()
    doctor_name = models.CharField(max_length=255)
    date = models.DateField()
    # keep CharField to match your current table and frontend strings (e.g. "12:00 PM")
    time = models.CharField(max_length=20)
    status = models.CharField(max_length=20, default="scheduled")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.user} → {self.doctor_name} {self.date} {self.time} ({self.status})"
