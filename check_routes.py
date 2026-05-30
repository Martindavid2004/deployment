from app.main import app

routes = [route.path for route in app.routes]
leave_routes = [r for r in routes if 'leave' in r.lower()]
match_routes = [r for r in routes if 'matches' in r.lower()]

print("[INFO] Leave routes found:", leave_routes)
print("[INFO] Match routes sample:", match_routes[:5] if len(match_routes) > 5 else match_routes)
print("[INFO] Total routes:", len(routes))

# Check for the specific route
specific_route = "/competitive/matches/{match_id}/leave"
print(f"[INFO] Checking for exact route: {specific_route}")
print(f"[INFO] Found: {specific_route in routes}")
