import os

from django.core.files.base import ContentFile
from django.db import models
from django.conf import settings
from io import BytesIO
from PIL import Image

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
        # --- Pinks & Reds ---
        ('#ff3da5', 'Hot Pink (Vibrant Solid Pink)'),
        ('#e8259a', 'Fuchsia (Deep Purplish-Pink)'),
        ('#ff8ab8', 'Rose Quartz (Soft Blush Pink)'),
        ('#fde8ef', 'Pearl & Blush (Very Light Pink/White)'),
        ('#d8211a', 'Crimson / Ruby (Classic Deep Red)'),
        ('#d9381a', 'Ember (Orange-Toned Red)'),

        # --- Oranges & Yellows ---
        ('#ff7a1a', 'Tangerine (Bright Orange)'),
        ('#ff7a4a', 'Coral Glow (Soft Orange-Pink)'),
        ('#ff3d8a', 'Sunset (Vibrant Pink-Orange)'),
        ('#f5e58a', 'Butter (Soft Pastel Yellow)'),

        # --- Purples ---
        ('#8a52d4', 'Amethyst (Bright Jewel Purple)'),
        ('#a64ad9', 'Orchid (Soft Muted Purple)'),

        # --- Greens ---
        ('#8ccf2f', 'Lime (Bright Yellow-Green)'),
        ('#7fb84a', 'Citrus Grove (Earthy Amber-Green)'),

        # --- Neutrals, Browns & Clears ---
        ('#ecf3f8', 'Clear / Ice (Translucent White)'),
        ('#4a2418', 'Cocoa (Rich Dark Brown)'),

        # --- Blacks & Darks ---
        ('#0f0f10', 'Onyx & Gold (Deepest Black)'),
        ('#1a1a1a', 'Jet Multi (Charcoal/Sparkle Black)'),
        ('#141414', 'Noir & Rose (Soft Matte Black)'),
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

    def save(self, *args, **kwargs):
        # We wrap the ENTIRE process, including the size check, in the try block
        try:
            if self.image:
                # If this is an existing image on Supabase, checking .size might trigger a 403.
                # If it does, the except block below catches it and prevents a crash!
                if self.image.size > 512000:
                    from io import BytesIO
                    from PIL import Image
                    from django.core.files.base import ContentFile
                    import os

                    img = Image.open(self.image)

                    if img.mode != 'RGB':
                        img = img.convert('RGB')

                    max_size = (1000, 1000)
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)

                    output = BytesIO()
                    img.save(output, format='JPEG', quality=75)
                    output.seek(0)

                    file_name = os.path.basename(self.image.name)
                    if not file_name.lower().endswith('.jpg'):
                        file_name = f"{os.path.splitext(file_name)[0]}.jpg"

                    self.image.save(file_name, ContentFile(output.getvalue()), save=False)

        except Exception as e:
            # Supabase blocked the read request, or the file is missing.
            # We silently ignore the error so the Admin panel doesn't crash!
            print(f"Skipping compression: {e}")

        # Proceed with normal saving no matter what
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.name} ({self.color})"


# --- NEW: DYNAMIC STORE SETTINGS FOR THE ADMIN ---
class StoreSettings(models.Model):
    name = models.CharField(max_length=255, default="My Home Studio", help_text="A label for your reference")
    store_latitude = models.DecimalField(max_digits=9, decimal_places=6, default=-1.283338,
                                         help_text="Your exact Google Maps Latitude")
    store_longitude = models.DecimalField(max_digits=9, decimal_places=6, default=36.825122,
                                          help_text="Your exact Google Maps Longitude")

    # Dynamic Pricing Controls
    shipping_base_fee = models.DecimalField(max_digits=10, decimal_places=2, default=60.00,
                                            help_text="Base drop-off fee for the boda (KES)")
    shipping_rate_per_km = models.DecimalField(max_digits=10, decimal_places=2, default=20.50,
                                               help_text="Amount to charge per driving KM (KES)")
    minimum_shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=100.00,
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