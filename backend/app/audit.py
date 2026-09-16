from .models import AuditLog
from sqlalchemy.orm import Session
from datetime import datetime

def log_audit(
    db: Session,
    email: str,
    action: str,
    resource_type: str,
    resource_name: str,
    resource_id: int = None,
    details: str = ""
):
    """
    Log an action to the audit log.
    
    Args:
        db: Database session
        email: Email of the user performing the action
        action: Type of action (CREATE, UPDATE, DELETE, LOGIN)
        resource_type: Type of resource (ASSET, CATEGORY)
        resource_name: Name of the resource
        resource_id: ID of the resource
        details: Additional details about the action
    """
    audit_entry = AuditLog(
        email=email,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        resource_name=resource_name,
        details=details,
        created_at=datetime.utcnow()
    )
    db.add(audit_entry)
    db.commit()
