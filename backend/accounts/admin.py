from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    fieldsets = UserAdmin.fieldsets + (
        ('Vivify Custom Fields', {'fields': ('is_buyer', 'is_admin', 'phone_number')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)