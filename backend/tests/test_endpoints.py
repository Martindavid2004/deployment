import requests
import json

# Test if competitive endpoints are registered
try:
    response = requests.get("http://localhost:8000/openapi.json")
    if response.status_code == 200:
        schema = response.json()
        paths = schema.get("paths", {})
        
        print("Looking for competitive endpoints...")
        competitive_paths = [path for path in paths.keys() if "competitive" in path]
        
        if competitive_paths:
            print(f"\n✅ Found {len(competitive_paths)} competitive endpoints:")
            for path in sorted(competitive_paths):
                methods = list(paths[path].keys())
                print(f"  {methods} {path}")
        else:
            print("\n❌ No competitive endpoints found!")
            print("\nAll available paths:")
            for path in sorted(paths.keys()):
                print(f"  {path}")
    else:
        print(f"Failed to get OpenAPI schema: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
