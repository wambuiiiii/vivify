from django.contrib import admin
from .models import Bag, Order, OrderItem, Category, StoreSettings


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price_at_time',)


@admin.register(Bag)
class BagAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'color','color_hex', 'price', 'stock','is_featured','is_active')
    list_filter = ('is_active','is_featured', 'category')
    search_fields = ('name', 'description', 'color')

@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    # This removes the "Add" button if the settings already exist
    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return True

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'mpesa_receipt')
    inlines = [OrderItemInline]


from django.contrib import admin

# Register your models here.
