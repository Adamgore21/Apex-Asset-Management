import os
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-apex-asset-mgmt-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# User inactivity policy
INACTIVITY_AUTO_DISABLE_ENABLED = os.getenv("INACTIVITY_AUTO_DISABLE_ENABLED", "true").lower() == "true"
INACTIVITY_DISABLE_DAYS = int(os.getenv("INACTIVITY_DISABLE_DAYS", "30"))

AUTHORIZED_ADMINS = [
    "support@apexingoodcompany.co.uk",
    "business@apexingoodcompany.co.uk",
    "adam@apexingoodcompany.co.uk",
]

SUPER_USER_EMAIL = "support@apexingoodcompany.co.uk"

# Asset defaults
DEFAULT_ASSET_LOCATION = os.getenv("DEFAULT_ASSET_LOCATION", "APEX HUB")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./assets.db")
