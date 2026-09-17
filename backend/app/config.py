import os
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-apex-asset-mgmt-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

AUTHORIZED_ADMINS = [
    "support@apexingoodcompany.co.uk",
    "business@apexingoodcompany.co.uk",
    "adam@apexingoodcompany.co.uk",
    # Add more admin emails here:
    # "admin@apexingoodcompany.co.uk",
    # "manager@apexingoodcompany.co.uk",
]

SUPER_USER_EMAIL = "support@apexingoodcompany.co.uk"  # Only this user can view audit logs

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./assets.db")
