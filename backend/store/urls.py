from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('bags/', views.BagListView.as_view(), name='bag-list'),
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('shipping/calculate/', views.CalculateShippingView.as_view(), name='calculate-shipping'),

    # NEW: Safaricom callback URL
    path('mpesa/callback/', views.MpesaCallbackView.as_view(), name='mpesa-callback'),
]