from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import DeliveryProfile

@receiver(post_save, sender=User)
def ensure_delivery_profile(sender, instance, created, **kwargs):
    DeliveryProfile.objects.get_or_create(user=instance)
