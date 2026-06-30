from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, help_text="Used for the frontend filter (e.g., 'bucket', 'crystal')")

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


# store/models.py
class Bag(models.Model):
    # The complete list of premium Lovable gradient swatches
    SWATCH_CHOICES = [
        # Neutrals & Classics
        ('linear-gradient(135deg, #fdfbfb, #ebedee)', 'Pearl / White'),
        ('linear-gradient(135deg, #f8f9fa, #ced4da)', 'Crystal / Clear'),
        ('linear-gradient(135deg, #434343, #000000)', 'Midnight / Onyx Black'),
        ('linear-gradient(135deg, #fdfbfb, #e3d5ca)', 'Champagne'),
        ('linear-gradient(135deg, #cfd9df, #e2ebf0)', 'Silver'),
        ('linear-gradient(135deg, #f6d365, #fda085)', 'Gold'),

        # Pinks & Reds
        ('linear-gradient(135deg, #fbc2eb, #a6c1ee)', 'Blush Rose'),
        ('linear-gradient(135deg, #f093fb, #f5576c)', 'Fuchsia Pink'),
        ('linear-gradient(135deg, #ff0844, #ffb199)', 'Ruby Red'),
        ('linear-gradient(135deg, #ffecd2, #fcb69f)', 'Peach / Coral'),

        # Purples & Blues
        ('linear-gradient(135deg, #9b23ea, #5f72bd)', 'Amethyst Purple'),
        ('linear-gradient(135deg, #2af598, #009efd)', 'Sapphire Blue'),
        ('linear-gradient(135deg, #667eea, #764ba2)', 'Deep Plum'),

        # Greens
        ('linear-gradient(135deg, #0ba360, #3cba92)', 'Emerald Green'),
        ('linear-gradient(135deg, #d9f99d, #84cc16)', 'Rich Lime'),
        ('linear-gradient(135deg, #96fbc4, #f9f586)', 'Mint / Pistachio'),
    ]

    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='bags')
    name = models.CharField(max_length=200)
    color = models.CharField(max_length=50, help_text="e.g., 'Lime Green', 'Pearl'")

    color_hex = models.CharField(
        max_length=100,
        choices=SWATCH_CHOICES,
        default='linear-gradient(135deg, #f8f9fa, #ced4da)',
        help_text="Select the visual swatch color for the website"
    )

    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='bags/images/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False, help_text="Show this bag on the landing page")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.color})"


# --- NEW: DYNAMIC STORE SETTINGS FOR THE ADMIN ---
class StoreSettings(models.Model):
    name = models.CharField(max_length=255, default="My Home Studio", help_text="A label for your reference")
    store_latitude = models.DecimalField(max_digits=9, decimal_places=6, default=-1.2655,
                                         help_text="Your exact Google Maps Latitude")
    store_longitude = models.DecimalField(max_digits=9, decimal_places=6, default=36.8023,
                                          help_text="Your exact Google Maps Longitude")

    # Dynamic Pricing Controls
    shipping_base_fee = models.DecimalField(max_digits=10, decimal_places=2, default=150.00,
                                            help_text="Base drop-off fee for the boda (KES)")
    shipping_rate_per_km = models.DecimalField(max_digits=10, decimal_places=2, default=35.00,
                                               help_text="Amount to charge per driving KM (KES)")
    pickup_mtaani_fee = models.DecimalField(max_digits=10, decimal_places=2, default=150.00,
                                            help_text="Flat fee for Pickup Mtaani agent drops (KES)")

    class Meta:
        verbose_name = "Store Setting"
        verbose_name_plural = "Store Settings"

    def save(self, *args, **kwargs):
        # This ensures we only ever have ONE settings row (ID=1)
        self.pk = 1
        super(StoreSettings, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Prevent the admin from accidentally deleting their settings
        pass

    @classmethod
    def load(cls):
        # Easily fetch the settings anywhere in Django
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Payment'),
        ('paid', 'Paid - Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    mpesa_receipt = models.CharField(max_length=50, blank=True, null=True)
    # --- NEW SHIPPING FIELDS ---
    shipping_address = models.CharField(max_length=255, blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True, null=True)
    shipping_postal_code = models.CharField(max_length=20, blank=True, null=True)
    shipping_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    shipping_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.email}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    bag = models.ForeignKey(Bag, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.bag.name} (Order #{self.order.id})"