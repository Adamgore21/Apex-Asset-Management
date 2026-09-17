import os
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-apex-asset-mgmt-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

SUPER_USER_EMAIL = "support@apexingoodcompany.co.uk"
INACTIVITY_AUTO_DISABLE_ENABLED = os.getenv("INACTIVITY_AUTO_DISABLE_ENABLED", "true").lower() == "true"
INACTIVITY_DISABLE_DAYS = int(os.getenv("INACTIVITY_DISABLE_DAYS", "30"))
DEFAULT_ASSET_LOCATION = os.getenv("DEFAULT_ASSET_LOCATION", "APEX HUB")


class AuthorizedAdminList(list):
    """Enforce active-user and inactivity rules through the existing login check."""

    def __contains__(self, email):
        normalized = (email or "").strip().lower()
        configured = {str(item).strip().lower() for item in self}

        try:
            from .database import SessionLocal
            from .models import User

            db = SessionLocal()
            try:
                user = db.query(User).filter(User.email == normalized).first()

                if user:
                    if not user.is_active:
                        return False

                    if (
                        INACTIVITY_AUTO_DISABLE_ENABLED
                        and normalized != SUPER_USER_EMAIL.lower()
                        and user.last_login is not None
                        and datetime.utcnow() - user.last_login >= timedelta(days=INACTIVITY_DISABLE_DAYS)
                    ):
                        user.is_active = False
                        user.disabled_at = datetime.utcnow()
                        user.disabled_reason = f"Automatically disabled after {INACTIVITY_DISABLE_DAYS} days of inactivity"
                        db.commit()
                        return False

                    user.last_login = datetime.utcnow()
                    user.disabled_at = None
                    user.disabled_reason = None
                    db.commit()
                    return normalized in configured or user.is_active

                if normalized in configured:
                    role = "super_admin" if normalized == SUPER_USER_EMAIL.lower() else "admin"
                    new_user = User(
                        email=normalized,
                        role=role,
                        can_view_dashboard=True,
                        can_manage_assets=True,
                        can_manage_employees=True,
                        can_manage_handovers=True,
                        can_manage_maintenance=True,
                        can_view_audit_logs=(role == "super_admin"),
                        can_manage_users=(role == "super_admin"),
                        last_login=datetime.utcnow(),
                    )
                    db.add(new_user)
                    db.commit()
                    return True

                return False
            finally:
                db.close()
        except Exception:
            return normalized in configured


AUTHORIZED_ADMINS = AuthorizedAdminList([
    "support@apexingoodcompany.co.uk",
    "business@apexingoodcompany.co.uk",
    "adam@apexingoodcompany.co.uk",
])

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./assets.db")
