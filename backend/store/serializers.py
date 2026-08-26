from rest_framework import serializers
from .models import Bag, Category
from django.conf import settings

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class BagSerializer(serializers.ModelSerializer):
    # We pull the category slug specifically because your React frontend
    # uses it to filter bags (e.g., "bucket" or "crystal")
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        """Generate full Supabase URL for images stored in S3"""
        if not obj.image:
            return None
        
        # Get the image path from the model
        image_path = str(obj.image)
        
        # Build the full Supabase storage URL
        supabase_url = settings.SUPABASE_URL
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        
        # Construct: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
        full_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{image_path}"
        return full_url

    class Meta:
        model = Bag
        # This defines exactly which fields React will receive
        fields = ['id', 'name', 'color','color_hex', 'description', 'price', 'stock', 'image', 'category_slug', 'category_name', 'is_active','is_featured']