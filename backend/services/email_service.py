import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "serviceclicknet@gmail.com"
SENDER_PASSWORD = "qmlwnhagjypwahtz"

def send_email(to_email, subject, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True, "Email sent successfully"
    except Exception as e:
        return False, str(e)

def send_recovery_email(email, pin):
    subject = "Your Locker Master PIN"
    body = f"Hello,\n\nYour Master PIN for Locker is: {pin}.\nPlease keep this code safe as it is the only way to recover your account if you lose your authenticator.\n\nRegards,\nLocker Team"
    return send_email(email, subject, body)

def send_verification_code(email, code):
    subject = "Locker Email Verification"
    body = f"Your verification code is: {code}.\n\nPlease enter this code in the app to verify your email address."
    return send_email(email, subject, body)
