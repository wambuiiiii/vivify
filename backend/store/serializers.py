from rest_framework import serializers
from .models import Bag, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class BagSerializer(serializers.ModelSerializer):
    # We pull the category slug specifically because your React frontend
    # uses it to filter bags (e.g., "bucket" or "crystal")
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Bag
        # This defines exactly which fields React will receive
        fields = ['id', 'name', 'color','color_hex', 'description', 'price', 'stock', 'image', 'category_slug', 'category_name', 'is_active','is_featured']