import sys
sys.path.insert(0, '/app')
from app.main import app
found = [r for r in app.routes if hasattr(r, 'path') and 'invite' in r.path.lower()]
print(f"Invite routes found: {len(found)}")
for route in found:
    print(f"  {route.methods} {route.path}")
