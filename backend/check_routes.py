import sys
sys.path.insert(0, '/app')
from app.main import app

for route in app.routes:
    if hasattr(route, 'path'):
        methods = route.methods if hasattr(route, 'methods') else 'N/A'
        print(f"{methods} {route.path}")
