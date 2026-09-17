import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-apex-asset-mgmt-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

SUPER_USER_EMAIL = "support@apexingoodcompany.co.uk"
INACTIVITY_AUTO_DISABLE_ENABLED = os.getenv("INACTIVITY_AUTO_DISABLE_ENABLED", "true").lower() == "true"
INACTIVITY_DISABLE_DAYS = max(1, int(os.getenv("INACTIVITY_DISABLE_DAYS", "30")))
DEFAULT_ASSET_LOCATION = os.getenv("DEFAULT_ASSET_LOCATION", "APEX HUB")

# These addresses are the backend-authorised administrator accounts.
# Keep this list independent of the database so login cannot fail because
# of a database migration/startup issue.
AUTHORIZED_ADMINS = [
    "support@apexingoodcompany.co.uk",
    "business@apexingoodcompany.co.uk",
    "adam@apexingoodcompany.co.uk",
]

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./assets.db")
