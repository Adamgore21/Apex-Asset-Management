from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum

class AssetCondition(str, enum.Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    FAULTY = "faulty"

class AssetStatus(str, enum.Enum):
    IN_USE = "in_use"
    AVAILABLE = "available"
    REPAIR = "repair"
    RETIRED = "retired"
    LOST = "lost"

class AssetType(str, enum.Enum):
    LAPTOP = "laptop"
    DESKTOP = "desktop"
    PRINTER = "printer"
    PHONE = "phone"
    MONITOR = "monitor"
    KEYBOARD_MOUSE = "keyboard_mouse"
    HEADSET = "headset"
    DOCK_ADAPTER = "dock_adapter"
    NETWORK = "network"
    SECURITY = "security"
    VEHICLE = "vehicle"
    TOOL = "tool"
    CAMERA = "camera"
    FURNITURE = "furniture"
    OTHER = "other"

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    assets = relationship("Asset", back_populates="category")

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    department = Column(String)
    job_title = Column(String)
    phone = Column(String)
    start_date = Column(Date)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    assets = relationship("Asset", back_populates="assigned_employee")
    handovers = relationship("AssetHandover", back_populates="employee")

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, unique=True, index=True)  # APX-IT-0001
    name = Column(String, index=True)
    description = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"))
    asset_type = Column(String, default="other")
    make_model = Column(String)
    serial_number = Column(String, unique=True, index=True)
    purchase_date = Column(Date)
    purchase_price = Column(Float)
    current_value = Column(Float)
    warranty_expiry = Column(Date, nullable=True)
    condition = Column(String, default="good")
    location = Column(String)
    assigned_employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    status = Column(String, default="available")
    notes = Column(Text)
    photos = Column(String)  # JSON array of photo URLs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    category = relationship("Category", back_populates="assets")
    assigned_employee = relationship("Employee", back_populates="assets")
    it_specs = relationship("ITEquipmentSpec", back_populates="asset", uselist=False)
    vehicle_specs = relationship("VehicleSpec", back_populates="asset", uselist=False)
    handovers = relationship("AssetHandover", back_populates="asset")
    maintenance_records = relationship("MaintenanceRecord", back_populates="asset")

class ITEquipmentSpec(Base):
    __tablename__ = "it_equipment_specs"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), unique=True)
    cpu = Column(String, nullable=True)
    ram_gb = Column(Integer, nullable=True)
    storage_gb = Column(Integer, nullable=True)
    gpu = Column(String, nullable=True)
    operating_system = Column(String, nullable=True)
    hostname = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    mac_address = Column(String, nullable=True)
    device_id = Column(String, nullable=True)  # Entra device ID
    intune_status = Column(String, nullable=True)
    last_check_in = Column(DateTime, nullable=True)
    
    asset = relationship("Asset", back_populates="it_specs")

class VehicleSpec(Base):
    __tablename__ = "vehicle_specs"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), unique=True)
    registration = Column(String, unique=True, index=True)
    mileage = Column(Integer)
    mot_expiry = Column(Date, nullable=True)
    insurance_expiry = Column(Date, nullable=True)
    tax_status = Column(String)
    fuel_type = Column(String)
    assigned_driver_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    lease_info = Column(Text, nullable=True)
    finance_info = Column(Text, nullable=True)
    
    asset = relationship("Asset", back_populates="vehicle_specs")

class AssetHandover(Base):
    __tablename__ = "asset_handovers"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    handover_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime, nullable=True)
    condition_at_handover = Column(String)
    accessories = Column(Text)
    notes = Column(Text)
    signature_confirmed = Column(Boolean, default=False)
    photos = Column(String)  # JSON array
    is_active = Column(Boolean, default=True)
    
    asset = relationship("Asset", back_populates="handovers")
    employee = relationship("Employee", back_populates="handovers")

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    issue_description = Column(Text)
    reported_date = Column(DateTime, default=datetime.utcnow)
    repair_company = Column(String)
    estimated_cost = Column(Float, nullable=True)
    actual_cost = Column(Float, nullable=True)
    date_sent = Column(DateTime, nullable=True)
    date_returned = Column(DateTime, nullable=True)
    fault_description = Column(Text)
    resolution = Column(Text)
    warranty_repair = Column(Boolean, default=False)
    downtime_days = Column(Integer, nullable=True)
    status = Column(String, default="open")  # open, in_progress, completed, cancelled
    
    asset = relationship("Asset", back_populates="maintenance_records")

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)
    role = Column(String, default="admin")  # super_admin, admin, manager, viewer
    can_view_dashboard = Column(Boolean, default=True)
    can_manage_assets = Column(Boolean, default=True)
    can_manage_employees = Column(Boolean, default=True)
    can_manage_handovers = Column(Boolean, default=True)
    can_manage_maintenance = Column(Boolean, default=True)
    can_view_audit_logs = Column(Boolean, default=False)
    can_manage_users = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Invite(Base):
    __tablename__ = "invites"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    token = Column(String, unique=True, index=True)  # Unique invite token
    role = Column(String, default="admin")  # Role they'll get when accepting
    invited_by = Column(String)  # Email of admin who invited
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)  # Invite expiration (7 days)
    accepted_at = Column(DateTime, nullable=True)  # When they accepted
    is_used = Column(Boolean, default=False)  # Whether they've accepted

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    action = Column(String, index=True)
    resource_type = Column(String)
    resource_id = Column(Integer, nullable=True)
    resource_name = Column(String)
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
