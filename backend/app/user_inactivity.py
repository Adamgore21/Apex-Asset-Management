from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session

from .models import User
from .config import INACTIVITY_AUTO_DISABLE_ENABLED, INACTIVITY_DISABLE_DAYS, SUPER_USER_EMAIL


def ensure_user_columns(db: Session):
    """Add inactivity columns to existing SQLite databases without destroying data."""
    bind = db.get_bind()
    if bind.dialect.name != "sqlite":
        return

    columns = {
        row[1] for row in db.execute(text("PRAGMA table_info(users)")).fetchall()
    }
    if "last_login" not in columns:
        db.execute(text("ALTER TABLE users ADD COLUMN last_login DATETIME"))
    if "disabled_at" not in columns:
        db.execute(text("ALTER TABLE users ADD COLUMN disabled_at DATETIME"))
    if "disabled_reason" not in columns:
        db.execute(text("ALTER TABLE users ADD COLUMN disabled_reason VARCHAR"))
    db.commit()


def disable_inactive_users(db: Session):
    """Disable non-super-admin users who have exceeded the inactivity period."""
    if not INACTIVITY_AUTO_DISABLE_ENABLED:
        return 0

    cutoff = datetime.utcnow() - timedelta(days=INACTIVITY_DISABLE_DAYS)
    users = (
        db.query(User)
        .filter(
            User.is_active == True,
            User.email != SUPER_USER_EMAIL,
        )
        .all()
    )

    disabled = 0
    for user in users:
        # Never disable an account that has never logged in solely because it has no last_login.
        # New/invited users should be handled by the invite expiry process instead.
        if user.last_login and user.last_login < cutoff:
            user.is_active = False
            user.disabled_at = datetime.utcnow()
            user.disabled_reason = f"Automatically disabled after {INACTIVITY_DISABLE_DAYS} days of inactivity"
            disabled += 1

    if disabled:
        db.commit()
    return disabled
