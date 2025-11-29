from django.db import models
from django.conf import settings

class Appointment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    doctor_id = models.IntegerField()
    doctor_name = models.CharField(max_length=255)
    date = models.DateField()
    time = models.CharField(max_length=20)
    status = models.CharField(max_length=20, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.doctor_name} ({self.date} {self.time})"
