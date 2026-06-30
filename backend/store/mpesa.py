import requests
import base64
from datetime import datetime
import os


def get_mpesa_access_token():
    """Generates a temporary access token from Safaricom"""
    consumer_key = os.getenv('MPESA_CONSUMER_KEY')
    consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
    env = os.getenv('MPESA_ENVIRONMENT', 'sandbox')

    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    if env == 'production':
        url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    response = requests.get(url, auth=(consumer_key, consumer_secret))

    if response.status_code == 200:
        return response.json().get('access_token')
    raise Exception(f"Failed to get M-Pesa token: {response.text}")


def format_phone_number(phone):
    """Safaricom requires phones in the format 2547XXXXXXXX"""
    phone = str(phone).strip().replace('+', '').replace(' ', '')
    if phone.startswith('0'):
        return '254' + phone[1:]
    if phone.startswith('7') or phone.startswith('1'):
        return '254' + phone
    return phone


def initiate_stk_push(phone_number, amount, order_id):
    """Triggers the STK Push to the buyer's phone"""
    access_token = get_mpesa_access_token()
    env = os.getenv('MPESA_ENVIRONMENT', 'sandbox')
    shortcode = os.getenv('MPESA_SHORTCODE')
    passkey = os.getenv('MPESA_PASSKEY')
    callback_url = os.getenv('MPESA_CALLBACK_URL')

    # Generate the Base64 encoded password required by Safaricom
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password_str = shortcode + passkey + timestamp
    password = base64.b64encode(password_str.encode('utf-8')).decode('utf-8')

    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    if env == 'production':
        url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

    headers = {"Authorization": f"Bearer {access_token}"}

    formatted_phone = format_phone_number(phone_number)

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),  # Safaricom doesn't accept decimals
        "PartyA": formatted_phone,
        "PartyB": shortcode,
        "PhoneNumber": formatted_phone,
        "CallBackURL": callback_url,
        "AccountReference": f"Vivify Order {order_id}",
        "TransactionDesc": "Payment for Vivify Bags"
    }

    response = requests.post(url, json=payload, headers=headers)
    return response.json()