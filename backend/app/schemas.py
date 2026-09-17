from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List

# Categories
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Employees
class EmployeeCreate(BaseModel):
    name: str
    email: str
    department: str
    job_title: str
    phone: Optional[str] = None
    start_date: date

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None

class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: str
    department: str
    job_title: str
    phone: Optional[str]
    start_date: date
    end_date: Optional[date]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# IT Equipment Specs
class ITEquipmentSpecCreate(BaseModel):
    cpu: Optional[str] = None
    ram_gb: Optional[int] = None
    storage_gb: Optional[int] = None
    gpu: Optional[str] = None
    operating_system: Optional[str] = None
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    device_id: Optional[str] = None
    intune_status: Optional[str] = None

class ITEquipmentSpecResponse(BaseModel):
    id: int
    asset_id: int
    cpu: Optional[str]
    ram_gb: Optional[int]
    storage_gb: Optional[int]
    gpu: Optional[str]
    operating_system: Optional[str]
    hostname: Optional[str]
    ip_address: Optional[str]
    mac_address: Optional[str]
    device_id: Optional[str]
    intune_status: Optional[str]
    last_check_in: Optional[datetime]
    
    class Config:
        from_attributes = True

# Assets
class AssetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: int
    asset_type: str = "other"
    make_model: Optional[str] = None
    serial_number: str
    purchase_date: date
    purchase_price: float
    current_value: float
    warranty_expiry: Optional[date] = None
    condition: str = "good"
    location: str
    assigned_employee_id: Optional[int] = None
    status: str = "available"
    notes: Optional[str] = None
    it_specs: Optional[ITEquipmentSpecCreate] = None

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    assigned_employee_id: Optional[int] = None
    status: Optional[str] = None
    current_value: Optional[float] = None
    notes: Optional[str] = None

class AssetResponse(BaseModel):
    id: int
    asset_id: str
    name: str
    description: Optional[str]
    category_id: int
    asset_type: str
    make_model: Optional[str]
    serial_number: str
    purchase_date: date
    purchase_price: float
    current_value: float
    warranty_expiry: Optional[date]
    condition: str
    location: str
    assigned_employee_id: Optional[int]
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Handovers
class AssetHandoverCreate(BaseModel):
    asset_id: int
    employee_id: int
    condition_at_handover: str
    accessories: Optional[str] = None
    notes: Optional[str] = None

class AssetHandoverReturn(BaseModel):
    condition_at_return: str
    notes: Optional[str] = None

class AssetHandoverResponse(BaseModel):
    id: int
    asset_id: int
    employee_id: int
    handover_date: datetime
    return_date: Optional[datetime]
    condition_at_handover: str
    accessories: Optional[str]
    notes: Optional[str]
    signature_confirmed: bool
    is_active: bool
    
    class Config:
        from_attributes = True

# Maintenance
class MaintenanceRecordCreate(BaseModel):
    asset_id: int
    issue_description: str
    repair_company: Optional[str] = None
    estimated_cost: Optional[float] = None

class MaintenanceRecordUpdate(BaseModel):
    actual_cost: Optional[float] = None
    date_sent: Optional[datetime] = None
    date_returned: Optional[datetime] = None
    fault_description: Optional[str] = None
    resolution: Optional[str] = None
    warranty_repair: Optional[bool] = None
    downtime_days: Optional[int] = None
    status: Optional[str] = None

class MaintenanceRecordResponse(BaseModel):
    id: int
    asset_id: int
    issue_description: str
    reported_date: datetime
    repair_company: Optional[str]
    estimated_cost: Optional[float]
    actual_cost: Optional[float]
    date_sent: Optional[datetime]
    date_returned: Optional[datetime]
    fault_description: Optional[str]
    resolution: Optional[str]
    warranty_repair: bool
    downtime_days: Optional[int]
    status: str
    
    class Config:
        from_attributes = True

# Dashboard Stats
class DashboardStats(BaseModel):
    total_assets: int
    total_asset_value: float
    book_value: float
    assets_due_replacement: int
    warranty_expiring_soon: int
    assets_in_repair: int
    assets_missing: int
    recent_activities: List[dict]

# Invites
class InviteCreate(BaseModel):
    email: str
    role: str = "admin"

class InviteAccept(BaseModel):
    token: str
    password: str

class InviteValidate(BaseModel):
    valid: bool
    email: str
    role: str

class InviteAcceptResponse(BaseModel):
    status: str
    access_token: str
    token_type: str
    email: str

class InviteResponse(BaseModel):
    id: int
    email: str
    token: str
    role: str
    invited_by: str
    created_at: datetime
    expires_at: datetime
    is_used: bool
    
    class Config:
        from_attributes = True

# Users
class UserCreate(BaseModel):
    email: str
    role: str = "admin"

class UserUpdate(BaseModel):
    role: Optional[str] = None
    can_view_dashboard: Optional[bool] = None
    can_manage_assets: Optional[bool] = None
    can_manage_employees: Optional[bool] = None
    can_manage_handovers: Optional[bool] = None
    can_manage_maintenance: Optional[bool] = None
    can_view_audit_logs: Optional[bool] = None
    can_manage_users: Optional[bool] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    can_view_dashboard: bool
    can_manage_assets: bool
    can_manage_employees: bool
    can_manage_handovers: bool
    can_manage_maintenance: bool
    can_view_audit_logs: bool
    can_manage_users: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Audit Log
class AuditLogResponse(BaseModel):
    id: int
    email: str
    action: str
    resource_type: str
    resource_id: Optional[int]
    resource_name: str
    details: str
    created_at: datetime
    
    class Config:
        from_attributes = True
