import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import models
from datetime import date
from dotenv import load_dotenv

load_dotenv()

def send_order_confirmation(db, order, user):
    """
    Triggers rich email and SMS notifications for a newly placed order.
    """
    if not user:
        print(f"⚠️ [NOTIFIER] Warning: No user object provided for Order {order.id}. Skipping notifications.")
        return False
        
    order_id = order.id
    user_email = user.email
    user_phone = user.phone_number or "Not Registered"
    user_name = getattr(user, 'name', 'Customer')
    total_amount = order.total
    dispatch_date = order.dispatch_date.strftime("%B %d, %Y")

    # 1. Generate Rich HTML Email (Invoice Concept)
    email_subject = f"Order Confirmed - {order_id} | Attire By Sush"
    email_html = f"""
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <h1 style="color: #9333ea; text-align: center; font-size: 28px; font-weight: 900; letter-spacing: -1px;">ATTIRE BY SUSH</h1>
        <p style="text-align: center; color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Boutique Order Confirmation</p>
        <hr style="border: none; border-top: 1px dashed #eee; margin: 30px 0;">
        <h2 style="font-size: 18px; margin-bottom: 5px;">Thank you for your order, {user_name}!</h2>
        <p style="color: #666; font-size: 14px; margin-top: 0;">Your boutique pieces are being prepared and will be dispatched by <strong>{dispatch_date}</strong>.</p>
        
        <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #db2777;">ORDER DETAILS</p>
            <p style="margin: 5px 0; font-size: 16px; font-weight: 900; color: #111;">REF: {order_id}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #444;">Status: Tailoring Started</p>
            <p style="margin: 5px 0; font-size: 20px; font-weight: 900; color: #9333ea; margin-top: 15px;">Total: ₹{total_amount:,.2f}</p>
        </div>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 40px;">
            Questions? Reply to this email or visit our <a href="http://localhost:5173" style="color: #9333ea; text-decoration: none; font-weight: bold;">Boutique Store</a>.
        </p>
    </div>
    """

    # 2. Send the Actual Email via SMTP
    # Grab credentials from environment
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT", 587)
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    sender_email = os.getenv("SENDER_EMAIL", smtp_user)
    
    email_status = "Skipped (No SMTP Configuration)"
    if smtp_server and smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("alternative")
            msg['Subject'] = email_subject
            msg['From'] = sender_email
            msg['To'] = user_email
            
            part = MIMEText(email_html, "html")
            msg.attach(part)
            
            server = smtplib.SMTP(smtp_server, int(smtp_port))
            server.set_debuglevel(0)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(sender_email, user_email, msg.as_string())
            server.quit()
            
            email_status = "SENT SUCCESSFULLY via SMTP"
        except Exception as e:
            print(f"❌ [NOTIFIER] Failed to send real email: {e}")
            email_status = f"FAILED: {str(e)}"
    else:
        print("⚠️ [NOTIFIER] SMTP config missing. Skipping real email dispatch.")

    # 3. Generate Professional SMS (Mock)
    sms_content = f"Attire By Sush: Hi {user.name}, your order {order_id} (₹{total_amount:,.0f}) is confirmed! Dispatch expected by {order.dispatch_date.strftime('%d %b')}. Shop more: sush.boutique/track"

    # 4. Persist Logs in Database
    email_notif = models.NotificationLog(
        order_id=order_id,
        type="EMAIL",
        recipient=user_email,
        content=f"STATUS: {email_status}\nSUBJECT: {email_subject}\nINVOICE HTML: {email_html[:100]}..."
    )
    sms_notif = models.NotificationLog(
        order_id=order_id,
        type="SMS",
        recipient=user_phone,
        content=sms_content
    )
    db.add_all([email_notif, sms_notif])
    db.commit()

    print(f"\n[BOOTIQUE NOTIFIER] Triggering for Order {order_id}")
    print(f"--- EMAIL: {email_status} -> {user_email}")
    print(f"--- SMS (Mock) Sent to {user_phone}")
    print(f"--- Logged to database for Admin panel tracking.\n")

    return True
