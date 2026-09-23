from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    # Role-based access control
    is_buyer = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    # We will need this specifically for the M-Pesa STK Push later!
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    saved_lat = models.FloatField(null=True, blank=True)
    saved_lng = models.FloatField(null=True, blank=True)
    saved_address = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.username