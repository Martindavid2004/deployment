"""
Quick test to verify CORS is working with dev tunnels
Run this to test if the backend CORS configuration is correct
"""

import requests
import sys

def test_cors(backend_url):
    """Test CORS preflight and actual request"""
    print("="*60)
    print("🧪 Testing CORS Configuration")
    print("="*60)
    print(f"Backend URL: {backend_url}\n")
    
    # Test 1: OPTIONS preflight request
    print("Test 1: OPTIONS Preflight Request")
    print("-" * 60)
    try:
        response = requests.options(
            f"{backend_url}/test",
            headers={
                "Origin": "https://test-5173.devtunnels.ms",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            }
        )
        
        print(f"Status Code: {response.status_code}")
        print("\nCORS Headers:")
        cors_headers = {
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Credentials"
        }
        
        found_headers = {}
        for header in cors_headers:
            value = response.headers.get(header, "❌ MISSING")
            found_headers[header] = value
            symbol = "✅" if value != "❌ MISSING" else "❌"
            print(f"  {symbol} {header}: {value}")
        
        if response.status_code == 200 and all(v != "❌ MISSING" for v in found_headers.values()):
            print("\n✅ Test 1 PASSED: OPTIONS request handled correctly")
        else:
            print("\n❌ Test 1 FAILED: Missing CORS headers or wrong status")
            return False
            
    except Exception as e:
        print(f"❌ Test 1 FAILED: {e}")
        return False
    
    # Test 2: GET request with Origin header
    print("\n\nTest 2: GET Request with CORS")
    print("-" * 60)
    try:
        response = requests.get(
            f"{backend_url}/test",
            headers={
                "Origin": "https://test-5173.devtunnels.ms"
            }
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        allow_origin = response.headers.get("Access-Control-Allow-Origin", "❌ MISSING")
        print(f"\nCORS Header:")
        print(f"  Access-Control-Allow-Origin: {allow_origin}")
        
        if response.status_code == 200 and allow_origin != "❌ MISSING":
            print("\n✅ Test 2 PASSED: GET request includes CORS headers")
        else:
            print("\n❌ Test 2 FAILED: Missing CORS headers")
            return False
            
    except Exception as e:
        print(f"❌ Test 2 FAILED: {e}")
        return False
    
    # Test 3: POST request simulation
    print("\n\nTest 3: POST Request (Auth Endpoint)")
    print("-" * 60)
    try:
        response = requests.options(
            f"{backend_url}/auth/register",
            headers={
                "Origin": "https://test-5173.devtunnels.ms",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type,authorization"
            }
        )
        
        print(f"Status Code: {response.status_code}")
        allow_origin = response.headers.get("Access-Control-Allow-Origin", "❌ MISSING")
        allow_methods = response.headers.get("Access-Control-Allow-Methods", "❌ MISSING")
        
        print(f"\nCORS Headers:")
        print(f"  Access-Control-Allow-Origin: {allow_origin}")
        print(f"  Access-Control-Allow-Methods: {allow_methods}")
        
        if (response.status_code == 200 and 
            allow_origin != "❌ MISSING" and 
            "POST" in allow_methods):
            print("\n✅ Test 3 PASSED: Auth endpoint supports CORS")
        else:
            print("\n❌ Test 3 FAILED: Auth endpoint CORS issue")
            return False
            
    except Exception as e:
        print(f"❌ Test 3 FAILED: {e}")
        return False
    
    return True

if __name__ == "__main__":
    # Get backend URL from command line or use default
    if len(sys.argv) > 1:
        backend_url = sys.argv[1].rstrip('/')
    else:
        backend_url = "http://localhost:8000"
    
    print("\n💡 Usage: python test_cors.py [backend_url]")
    print(f"   Example: python test_cors.py https://xxx-8000.inc1.devtunnels.ms")
    print(f"\n   Using: {backend_url}\n")
    
    input("Press Enter to start tests...")
    
    try:
        success = test_cors(backend_url)
        
        print("\n" + "="*60)
        if success:
            print("🎉 ALL TESTS PASSED!")
            print("="*60)
            print("\n✅ CORS is configured correctly")
            print("✅ Dev tunnels should work")
            print("✅ Frontend can communicate with backend")
            print("\n💡 If you still see CORS errors:")
            print("   1. Clear browser cache (Ctrl+Shift+Delete)")
            print("   2. Check port visibility (must be Public)")
            print("   3. Restart both frontend and backend")
        else:
            print("❌ SOME TESTS FAILED")
            print("="*60)
            print("\n⚠️  CORS is not configured correctly")
            print("\n🔧 Solutions:")
            print("   1. Make sure backend is running")
            print("   2. Restart backend to apply changes")
            print("   3. Check app/main.py has DevTunnelCORSMiddleware")
            print("   4. Verify port 8000 is accessible")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ CONNECTION ERROR")
        print("="*60)
        print(f"\n⚠️  Cannot connect to: {backend_url}")
        print("\n🔧 Solutions:")
        print("   1. Make sure backend is running")
        print("      cd PROEDUVATE-CODEING-MODULE")
        print("      ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000")
        print("\n   2. If using dev tunnels, verify the URL")
        print("      - Check VS Code Ports tab")
        print("      - Copy the correct forwarded URL")
        print("\n   3. Check firewall isn't blocking the port")
