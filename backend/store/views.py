from rest_framework import generics
from .models import Bag, Category, Order, OrderItem, StoreSettings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from django.db import transaction
import math
import requests
from django.conf import settings
import os

from .mpesa import initiate_stk_push
from .serializers import BagSerializer, CategorySerializer


class CategoryListView(generics.ListAPIView):
    """ Returns a list of all categories to populate the filter buttons """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class BagListView(generics.ListAPIView):
    """ Returns a list of all active bags """
    serializer_class = BagSerializer

    def get_queryset(self):
        # We only want to send bags to React that are marked as active
        queryset = Bag.objects.filter(is_active=True)

        # This allows React to filter via URL, e.g., /api/bags/?category=bucket
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        return queryset


# CHECKOUT
# API - --
def calculate_shipping_fee(buyer_lat, buyer_lon):
    if not buyer_lat or not buyer_lon:
        return 0

    try:
        # Load dynamic coordinates and prices directly from the Admin Dashboard!
        store_settings = StoreSettings.load()
        store_lat = float(store_settings.store_latitude)
        store_lon = float(store_settings.store_longitude)

        # The API key remains a secret in .env
        api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        distance_km = 0

        # Try to get ACTUAL driving distance from Google Maps Distance Matrix
        if api_key:
            url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={store_lat},{store_lon}&destinations={buyer_lat},{buyer_lon}&key={api_key}"
            response = requests.get(url)
            data = response.json()

            if data['status'] == 'OK' and data['rows'][0]['elements'][0]['status'] == 'OK':
                distance_km = data['rows'][0]['elements'][0]['distance']['value'] / 1000.0

        # Fallback to straight-line math if the Google API fails
        if distance_km == 0:
            R = 6371.0
            lat1 = math.radians(store_lat)
            lon1 = math.radians(store_lon)
            lat2 = math.radians(float(buyer_lat))
            lon2 = math.radians(float(buyer_lon))

            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            distance_km = (R * c) * 1.4  # 1.4x road multiplier

        # Calculate fee using the Admin Dashboard numbers
        base_fee = float(store_settings.shipping_base_fee)
        rate_per_km = float(store_settings.shipping_rate_per_km)

        total_fee = base_fee + (distance_km * rate_per_km)
        return round(total_fee / 10) * 10

    except Exception as e:
        print(f"Shipping Calculation Error: {e}")
        return 0


class CalculateShippingView(APIView):
    def post(self, request):
        lat = request.data.get('latitude')
        lon = request.data.get('longitude')
        fee = calculate_shipping_fee(lat, lon)
        return Response({"fee": fee})


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        items_data = request.data.get('items', [])

        # Safely extract the delivery method (defaulting to delivery)
        delivery_method = request.data.get('delivery_method', 'delivery')
        phone_number = request.data.get('phone_number')
        if not items_data:
            return Response({"error": "Your cart is empty."}, status=400)
        if not phone_number:
            return Response({"error": "Please provide an M-Pesa phone number."}, status=400)

        # 1. Create the empty order shell attached to the Supabase User
        order = Order.objects.create(
            user=request.user,
            total_amount=0,
            status='pending'
        )
        shipping_fee = 0
        if delivery_method == 'delivery':
            shipping_fee = calculate_shipping_fee(
                request.data.get('shipping_latitude'),
                request.data.get('shipping_longitude')
            )
        # If pickup, shipping_fee remains 0!

        total_amount = shipping_fee

        for item in items_data:
            bag = get_object_or_404(Bag, id=item['bag_id'])
            quantity = item.get('quantity', 1)

            if bag.stock < quantity:
                order.delete()
                return Response({"error": f"Only {bag.stock} left of {bag.name}."}, status=400)

            total_amount += float(bag.price) * quantity
            bag.stock -= quantity
            bag.save()
            OrderItem.objects.create(order=order, bag=bag, quantity=quantity, price_at_time=bag.price)

        order.total_amount = total_amount
        order.save()

        try:
            mpesa_response = initiate_stk_push(phone_number, total_amount, order.id)
            if mpesa_response.get('ResponseCode') != '0':
                raise Exception(mpesa_response.get('errorMessage', 'M-Pesa error'))
        except Exception as e:
            print(f"M-Pesa Error: {e}")
            order.status = 'failed'
            order.save()
            return Response({"error": "Failed to send M-Pesa prompt. Please check your number."}, status=400)

        return Response({
            "message": "Check your phone! Enter your M-Pesa PIN to complete the order.",
            "order_id": order.id,
            "total": total_amount,
        })

class MpesaCallbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            callback_data = request.data.get('Body', {}).get('stkCallback', {})
            result_code = callback_data.get('ResultCode')

            if result_code == 0:
                print("✅ Payment Successful!")
                # Add logic here to mark order as 'paid' via MerchantRequestID
            else:
                print(f"❌ Payment Failed: {callback_data.get('ResultDesc')}")

            return Response({"ResultCode": 0, "ResultDesc": "Accepted"})
        except Exception as e:
            return Response({"ResultCode": 1, "ResultDesc": "Failed"})
