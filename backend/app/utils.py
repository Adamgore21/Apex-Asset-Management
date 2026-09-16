import qrcode
from io import BytesIO
import base64
from datetime import datetime

def generate_asset_id(asset_type: str, sequence: int) -> str:
    """Generate asset ID in format APX-TYPE-XXXX"""
    type_map = {
        "laptop": "LAP",
        "desktop": "DSK",
        "printer": "PRN",
        "phone": "PHN",
        "monitor": "MON",
        "keyboard_mouse": "KBD",
        "headset": "HDS",
        "dock_adapter": "DCK",
        "network": "NET",
        "security": "SEC",
        "vehicle": "VEH",
        "tool": "TLS",
        "camera": "CAM",
        "furniture": "FRN",
        "other": "OTH"
    }
    
    type_code = type_map.get(asset_type, "AST")
    return f"APX-{type_code}-{sequence:04d}"

def generate_qr_code(data: str) -> str:
    """Generate QR code and return as base64 encoded image"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def calculate_depreciation(purchase_price: float, age_years: float, lifespan_years: int = 5) -> float:
    """Calculate current value using straight-line depreciation"""
    if age_years >= lifespan_years:
        return purchase_price * 0.1  # 10% salvage value
    
    annual_depreciation = purchase_price / lifespan_years
    depreciation = annual_depreciation * age_years
    current_value = purchase_price - depreciation
    
    return max(current_value, purchase_price * 0.1)

def get_asset_age_years(purchase_date) -> float:
    """Get asset age in years"""
    from datetime import date
    today = date.today()
    age_days = (today - purchase_date).days
    return age_days / 365.25
