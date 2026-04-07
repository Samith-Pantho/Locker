# Placeholder for TOTP auth logic
import pyotp
import qrcode

import io
import base64

def generate_totp_secret():
    return pyotp.random_base32()

def get_totp_uri(secret, user_email):
    return pyotp.totp.TOTP(secret).provisioning_uri(name=user_email, issuer_name="Locker")

def generate_qr_base64(uri):
    img = qrcode.make(uri)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def verify_totp(secret, code):
    totp = pyotp.totp.TOTP(secret)
    return totp.verify(code)

