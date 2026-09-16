from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
from datetime import timedelta, date, datetime
from .database import engine, SessionLocal, Base
from .models import (
    Asset, Category, Employee, AuditLog, AssetHandover, 
    MaintenanceRecord, ITEquipmentSpec, VehicleSpec, User, UserRole
)
from .schemas import (
    AssetCreate, AssetUpdate, AssetResponse, CategoryCreate, 
    EmployeeCreate, EmployeeResponse, EmployeeUpdate,
    AssetHandoverCreate, AssetHandoverReturn, AssetHandoverResponse,
    MaintenanceRecordCreate, MaintenanceRecordUpdate, MaintenanceRecordResponse,
    DashboardStats, AuditLogResponse, ITEquipmentSpecResponse,
    UserCreate, UserUpdate, UserResponse
)
from .auth import create_access_token, verify_token
from .config import AUTHORIZED_ADMINS, ACCESS_TOKEN_EXPIRE_MINUTES, SUPER_USER_EMAIL
from .audit import log_audit
from .utils import generate_asset_id, generate_qr_code, calculate_depreciation, get_asset_age_years
from pydantic import BaseModel

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="APEX Asset Management System",
    description="Enterprise-grade asset tracking and management platform",
    version="2.0.0"
)

@app.on_event("startup")
def startup():
    """Initialize default users on startup"""
    db = SessionLocal()
    try:
        # Create default users if they don't exist
        for email, role in [(SUPER_USER_EMAIL, "super_admin"), ("business@apexingoodcompany.co.uk", "admin")]:
            existing = db.query(User).filter(User.email == email).first()
            if not existing:
                perms = {
                    "super_admin": {"can_view_audit_logs": True, "can_manage_users": True},
                    "admin": {"can_view_audit_logs": False, "can_manage_users": False}
                }
                new_user = User(
                    email=email,
                    role=role,
                    can_view_dashboard=True,
                    can_manage_assets=True,
                    can_manage_employees=True,
                    can_manage_handovers=True,
                    can_manage_maintenance=True,
                    can_view_audit_logs=perms[role].get("can_view_audit_logs", False),
                    can_manage_users=perms[role].get("can_manage_users", False)
                )
                db.add(new_user)
        db.commit()
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class LoginRequest(BaseModel):
    email: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    email: str

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    if request.email not in AUTHORIZED_ADMINS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized email address"
        )
    
    log_audit(
        db=db,
        email=request.email,
        action="LOGIN",
        resource_type="SYSTEM",
        resource_name="Admin Login",
        details=f"User logged in successfully"
    )
    
    access_token = create_access_token(
        data={"sub": request.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "email": request.email
    }

# ============ DASHBOARD ============
@app.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    """Get comprehensive dashboard statistics"""
    total_assets = db.query(func.count(Asset.id)).scalar()
    
    assets = db.query(Asset).all()
    total_asset_value = sum(a.purchase_price for a in assets)
    book_value = sum(a.current_value for a in assets)
    
    today = date.today()
    warranty_expiring = db.query(func.count(Asset.id)).filter(
        and_(
            Asset.warranty_expiry.isnot(None),
            Asset.warranty_expiry <= today + timedelta(days=30),
            Asset.warranty_expiry >= today
        )
    ).scalar()
    
    assets_in_repair = db.query(func.count(Asset.id)).filter(
        Asset.status == "repair"
    ).scalar()
    
    assets_missing = db.query(func.count(Asset.id)).filter(
        Asset.status == "lost"
    ).scalar()
    
    # Assets due for replacement (over 4 years old)
    due_replacement = 0
    for asset in assets:
        age = get_asset_age_years(asset.purchase_date)
        if age > 4:
            due_replacement += 1
    
    # Recent activities
    recent_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(10).all()
    recent_activities = [
        {
            "time": log.created_at.strftime("%H:%M"),
            "description": log.details,
            "type": log.action
        }
        for log in recent_logs
    ]
    
    return {
        "total_assets": total_assets,
        "total_asset_value": total_asset_value,
        "book_value": book_value,
        "assets_due_replacement": due_replacement,
        "warranty_expiring_soon": warranty_expiring,
        "assets_in_repair": assets_in_repair,
        "assets_missing": assets_missing,
        "recent_activities": recent_activities
    }

# ============ EMPLOYEES ============
@app.post("/employees", response_model=EmployeeResponse)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    
    log_audit(
        db=db,
        email=current_user,
        action="CREATE",
        resource_type="EMPLOYEE",
        resource_id=db_employee.id,
        resource_name=db_employee.name,
        details=f"Created employee: {employee.name}"
    )
    
    return db_employee

@app.get("/employees", response_model=List[EmployeeResponse])
def list_employees(
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token),
    active_only: bool = Query(True)
):
    query = db.query(Employee)
    if active_only:
        query = query.filter(Employee.is_active == True)
    return query.all()

@app.get("/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@app.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    employee: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    for key, value in employee.dict(exclude_unset=True).items():
        setattr(db_employee, key, value)
    
    db.commit()
    db.refresh(db_employee)
    
    log_audit(
        db=db,
        email=current_user,
        action="UPDATE",
        resource_type="EMPLOYEE",
        resource_id=db_employee.id,
        resource_name=db_employee.name,
        details=f"Updated employee: {db_employee.name}"
    )
    
    return db_employee

# ============ CATEGORIES ============
@app.post("/categories", response_model=dict)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    db_category = Category(name=category.name, description=category.description)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    log_audit(
        db=db,
        email=current_user,
        action="CREATE",
        resource_type="CATEGORY",
        resource_id=db_category.id,
        resource_name=db_category.name,
        details=f"Created category: {category.name}"
    )
    
    return {"id": db_category.id, "name": db_category.name}

@app.get("/categories")
def list_categories(
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    return db.query(Category).all()

# ============ ASSETS ============
@app.post("/assets", response_model=AssetResponse)
def create_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    # Get next sequence number
    last_asset = db.query(Asset).filter(
        Asset.asset_type == asset.asset_type
    ).order_by(Asset.id.desc()).first()
    
    sequence = (last_asset.id + 1) if last_asset else 1
    asset_id = generate_asset_id(asset.asset_type, sequence)
    
    db_asset = Asset(
        asset_id=asset_id,
        **asset.dict(exclude={"it_specs"})
    )
    
    db.add(db_asset)
    db.flush()
    
    # Add IT specs if provided
    if asset.it_specs:
        db_it_specs = ITEquipmentSpec(
            asset_id=db_asset.id,
            **asset.it_specs.dict()
        )
        db.add(db_it_specs)
    
    db.commit()
    db.refresh(db_asset)
    
    log_audit(
        db=db,
        email=current_user,
        action="CREATE",
        resource_type="ASSET",
        resource_id=db_asset.id,
        resource_name=db_asset.name,
        details=f"Created asset: {asset.name} ({asset_id})"
    )
    
    return db_asset

@app.get("/assets", response_model=List[AssetResponse])
def list_assets(
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token),
    status: str = Query(None),
    employee_id: int = Query(None)
):
    query = db.query(Asset)
    if status:
        query = query.filter(Asset.status == status)
    if employee_id:
        query = query.filter(Asset.assigned_employee_id == employee_id)
    return query.all()

@app.get("/assets/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@app.put("/assets/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    asset: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    for key, value in asset.dict(exclude_unset=True).items():
        setattr(db_asset, key, value)
    
    db.commit()
    db.refresh(db_asset)
    
    log_audit(
        db=db,
        email=current_user,
        action="UPDATE",
        resource_type="ASSET",
        resource_id=db_asset.id,
        resource_name=db_asset.name,
        details=f"Updated asset: {db_asset.name}"
    )
    
    return db_asset

@app.delete("/assets/{asset_id}")
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset_name = db_asset.name
    db.delete(db_asset)
    db.commit()
    
    log_audit(
        db=db,
        email=current_user,
        action="DELETE",
        resource_type="ASSET",
        resource_id=asset_id,
        resource_name=asset_name,
        details=f"Deleted asset: {asset_name}"
    )
    
    return {"message": "Asset deleted successfully"}

# ============ ASSET HANDOVERS ============
@app.post("/handovers", response_model=AssetHandoverResponse)
def create_handover(
    handover: AssetHandoverCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    # Close any existing active handovers for this asset
    db.query(AssetHandover).filter(
        and_(
            AssetHandover.asset_id == handover.asset_id,
            AssetHandover.is_active == True
        )
    ).update({"is_active": False})
    
    db_handover = AssetHandover(**handover.dict())
    db.add(db_handover)
    db.commit()
    db.refresh(db_handover)
    
    # Update asset status
    asset = db.query(Asset).filter(Asset.id == handover.asset_id).first()
    asset.assigned_employee_id = handover.employee_id
    asset.status = "in_use"
    db.commit()
    
    employee = db.query(Employee).filter(Employee.id == handover.employee_id).first()
    asset = db.query(Asset).filter(Asset.id == handover.asset_id).first()
    
    log_audit(
        db=db,
        email=current_user,
        action="HANDOVER",
        resource_type="ASSET",
        resource_id=handover.asset_id,
        resource_name=asset.name,
        details=f"Handed over {asset.name} to {employee.name}"
    )
    
    return db_handover

@app.post("/handovers/{handover_id}/return", response_model=dict)
def return_asset(
    handover_id: int,
    return_info: AssetHandoverReturn,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    db_handover = db.query(AssetHandover).filter(AssetHandover.id == handover_id).first()
    if not db_handover:
        raise HTTPException(status_code=404, detail="Handover not found")
    
    db_handover.return_date = datetime.utcnow()
    db_handover.is_active = False
    db_handover.notes = return_info.notes
    
    # Update asset
    asset = db.query(Asset).filter(Asset.id == db_handover.asset_id).first()
    asset.assigned_employee_id = None
    asset.status = "available"
    asset.condition = return_info.condition_at_return
    
    db.commit()
    
    log_audit(
        db=db,
        email=current_user,
        action="RETURN",
        resource_type="ASSET",
        resource_id=asset.id,
        resource_name=asset.name,
        details=f"Returned {asset.name}"
    )
    
    return {"message": "Asset returned successfully"}

# ============ MAINTENANCE ============
@app.post("/maintenance", response_model=MaintenanceRecordResponse)
def create_maintenance(
    record: MaintenanceRecordCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    db_record = MaintenanceRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    asset = db.query(Asset).filter(Asset.id == record.asset_id).first()
    asset.status = "repair"
    db.commit()
    
    log_audit(
        db=db,
        email=current_user,
        action="CREATE",
        resource_type="MAINTENANCE",
        resource_id=db_record.id,
        resource_name=asset.name,
        details=f"Maintenance issue reported for {asset.name}"
    )
    
    return db_record

@app.get("/maintenance", response_model=List[MaintenanceRecordResponse])
def list_maintenance(
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token),
    status: str = Query("open")
):
    return db.query(MaintenanceRecord).filter(MaintenanceRecord.status == status).all()

@app.put("/maintenance/{maintenance_id}", response_model=MaintenanceRecordResponse)
def update_maintenance(
    maintenance_id: int,
    record: MaintenanceRecordUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    db_record = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == maintenance_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    for key, value in record.dict(exclude_unset=True).items():
        setattr(db_record, key, value)
    
    # If completed, update asset status back to available
    if record.status == "completed":
        asset = db.query(Asset).filter(Asset.id == db_record.asset_id).first()
        asset.status = "available"
    
    db.commit()
    db.refresh(db_record)
    
    return db_record

# ============ QR CODE ============
@app.get("/qr/{asset_id}")
def get_qr_code(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    qr_data = f"APX://{asset.asset_id}"
    qr_image = generate_qr_code(qr_data)
    
    return {
        "asset_id": asset.asset_id,
        "qr_code": qr_image,
        "data": qr_data
    }

# ============ USERS & PERMISSIONS ============
@app.post("/users", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    """Create a new admin user"""
    # Check if current user is super admin
    existing_user = db.query(User).filter(User.email == current_user).first()
    if not existing_user or not existing_user.can_manage_users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to manage users"
        )
    
    # Check if user already exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists"
        )
    
    # Set default permissions based on role
    permissions = {"super_admin": True, "admin": True, "manager": True, "viewer": False}
    new_user = User(
        email=user.email,
        role=user.role,
        can_view_dashboard=True,
        can_manage_assets=permissions.get(user.role, False),
        can_manage_employees=permissions.get(user.role, False),
        can_manage_handovers=permissions.get(user.role, False),
        can_manage_maintenance=permissions.get(user.role, False),
        can_view_audit_logs=(user.role == "super_admin"),
        can_manage_users=(user.role == "super_admin")
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    log_audit(db, current_user, "CREATE_USER", "USER", new_user.id, user.email, f"Created user with role {user.role}")
    return new_user

@app.get("/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    """Get all users"""
    existing_user = db.query(User).filter(User.email == current_user).first()
    if not existing_user or not existing_user.can_manage_users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    """Get specific user"""
    existing_user = db.query(User).filter(User.email == current_user).first()
    if not existing_user or not existing_user.can_manage_users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    """Update user permissions"""
    existing_user = db.query(User).filter(User.email == current_user).first()
    if not existing_user or not existing_user.can_manage_users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update only provided fields
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    log_audit(db, current_user, "UPDATE_USER", "USER", user.id, user.email, f"Updated user permissions: {update_dict}")
    return user

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    """Deactivate user (soft delete)"""
    existing_user = db.query(User).filter(User.email == current_user).first()
    if not existing_user or not existing_user.can_manage_users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    
    log_audit(db, current_user, "DELETE_USER", "USER", user.id, user.email, "User deactivated")
    return {"status": "User deactivated"}

# ============ AUDIT LOGS ============
@app.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    if current_user != SUPER_USER_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super user can view audit logs"
        )
    
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(500).all()
    return logs
