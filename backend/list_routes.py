from app import main
app = main.app

print("Total routes:", len(app.routes))
print("\nAll routes:")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"  {route.methods} {route.path}")
