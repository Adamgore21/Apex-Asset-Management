import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os

load_dotenv()

# Email configuration
SMTP_SERVER = os.getenv("EMAIL_HOST", "smtp.mail.ovh.net")
SMTP_PORT = int(os.getenv("EMAIL_PORT", 587))
SMTP_USER = os.getenv("EMAIL_USER")
SMTP_PASSWORD = os.getenv("EMAIL_PASSWORD")
SENDER_EMAIL = os.getenv("EMAIL_USER", SMTP_USER)
SENDER_NAME = os.getenv("SENDER_NAME", "APEX Asset Management")

def send_invite_email(recipient_email: str, invite_link: str, invited_by: str) -> bool:
    """
    Send an invite email via SMTP
    Returns True if successful, False otherwise
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("Warning: SMTP credentials not configured. Email not sent.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "You're invited to APEX Asset Management"
        msg["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        msg["To"] = recipient_email
        
        # HTML template
        html_body = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #ff5500 0%, #ff7722 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }}
                    .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
                    .button {{ display: inline-block; background: linear-gradient(135deg, #ff5500 0%, #ff7722 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }}
                    .footer {{ color: #999; font-size: 12px; margin-top: 20px; text-align: center; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to APEX</h1>
                        <p>Asset Management System</p>
                    </div>
                    <div class="content">
                        <p>Hi {recipient_email},</p>
                        <p>{invited_by} has invited you to join the APEX Asset Management system.</p>
                        <p>Click the link below to set up your account and password:</p>
                        <a href="{invite_link}" class="button">Accept Invitation</a>
                        <p><strong>Link expires in 7 days.</strong></p>
                        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; font-size: 12px; color: #666;">{invite_link}</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 APEX Asset Management. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Plain text fallback
        text_body = f"""
Hello {recipient_email},

{invited_by} has invited you to join the APEX Asset Management system.

Click the link below to set up your account and password:
{invite_link}

Link expires in 7 days.

This is an automated message. Please do not reply to this email.
"""
        
        # Attach parts
        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))
        
        # Send via SMTP
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure connection
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"Email sent successfully to {recipient_email}")
        return True
        
    except Exception as e:
        print(f"Error sending email to {recipient_email}: {str(e)}")
        return False
