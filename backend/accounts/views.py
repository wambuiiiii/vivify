from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "saved_phone": user.phone_number,
            "saved_lat": user.saved_lat,
            "saved_lng": user.saved_lng,
            "saved_address": user.saved_address,
        })