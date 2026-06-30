import jwt
from jwt import PyJWKClient
from django.conf import settings
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model

User = get_user_model()


class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    """
    Modern Supabase Authentication using JWKS (JSON Web Key Set).
    This automatically handles ECC (ES256) asymmetric tokens without needing manual secret keys!
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        # 1. Check for the Authorization header
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        try:
            # 2. Check if the Supabase URL and ANON KEY are in settings.py
            if not hasattr(settings, 'SUPABASE_URL') or not settings.SUPABASE_URL:
                print("🚨 ERROR: SUPABASE_URL is missing in settings.py!")
                raise AuthenticationFailed('Server misconfiguration.')

            if not hasattr(settings, 'SUPABASE_ANON_KEY') or not settings.SUPABASE_ANON_KEY:
                print("🚨 ERROR: SUPABASE_ANON_KEY is missing in settings.py!")
                raise AuthenticationFailed('Server misconfiguration.')

            # 3. Define the JWKS URL where Supabase publishes its public keys.
            # CRITICAL FIX: We must append the anon key, otherwise Supabase's API gateway blocks the request!
            jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json?apikey={settings.SUPABASE_ANON_KEY}"

            # 4. Initialize the JWK Client to automatically fetch the public ECC key
            jwks_client = PyJWKClient(jwks_url)

            # 5. Extract the specific signing key that matches this exact token
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            # 6. Decode the token using the fetched Public Key
            # We explicitly allow ES256 (ECC) and keep the verify_aud=False fix for Google Auth
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256", "HS256"],
                options={"verify_aud": False}
            )

        except jwt.ExpiredSignatureError:
            print("🚨 JWT Error: Token has expired.")
            raise AuthenticationFailed('Your session has expired. Please log out and log back in.')
        except Exception as e:
            # Print the EXACT reason it failed to your Django terminal
            print(f"🚨 JWT Authentication Failed: {e}")
            raise AuthenticationFailed(f'Invalid token.')

        # 7. Extract user identity details
        email = payload.get('email')
        if not email:
            raise AuthenticationFailed('Token contained no email address.')

        # Extract extra data like names
        user_metadata = payload.get('user_metadata', {})
        first_name = user_metadata.get('first_name', '')
        last_name = user_metadata.get('last_name', '')

        if not first_name and 'full_name' in user_metadata:
            parts = user_metadata['full_name'].split(' ', 1)
            first_name = parts[0]
            if len(parts) > 1:
                last_name = parts[1]

        # 8. Find or create the user in Django
        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            }
        )

        return (user, token)

    # 9. Force Django to return 401 Unauthorized instead of 403 Forbidden
    def authenticate_header(self, request):
        return 'Bearer'