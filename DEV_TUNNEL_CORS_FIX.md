# 🔧 Dev Tunnels CORS Fix Guide

## Problem
When using VS Code dev tunnels (port forwarding), you get CORS errors like:
```
Access to fetch at 'https://xxx-8000.inc1.devtunnels.ms/...' from origin 'https://xxx-5173.inc1.devtunnels.ms' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Solution Applied ✅

The backend has been updated with enhanced CORS handling specifically for dev tunnels:

### 1. Custom CORS Middleware
- Explicitly handles OPTIONS preflight requests
- Adds CORS headers to all responses
- Works with dev tunnels authentication

### 2. Enhanced Error Handlers
- CORS headers added to error responses
- Ensures OPTIONS requests return correct headers

### 3. Catch-all OPTIONS Handler
- Routes all OPTIONS requests properly
- Prevents 404s on preflight checks

---

## How to Apply the Fix

### Step 1: Restart Backend
The changes are already in [app/main.py](app/main.py). Just restart the backend:

```powershell
# Stop the current backend (Ctrl+C)

# Start fresh
cd PROEDUVATE-CODEING-MODULE
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO: Uvicorn running on http://localhost:8000
INFO: Application startup complete
```

### Step 2: Verify Dev Tunnel Ports
Make sure BOTH ports are forwarded:

**In VS Code:**
1. Open "Ports" tab (View → Ports)
2. Forward port 8000 (Backend)
3. Forward port 5173 (Frontend)
4. Set both to "Public" visibility

Your tunnels should look like:
```
Port 5173: https://051llbnr-5173.inc1.devtunnels.ms (Public)
Port 8000: https://051llbnr-8000.inc1.devtunnels.ms (Public)
```

### Step 3: Test CORS
Open your tunnel frontend in browser and check console:

```javascript
// Should see in console:
🔗 API Base URL: https://051llbnr-8000.inc1.devtunnels.ms
```

OR test directly:
```bash
curl -X OPTIONS https://051llbnr-8000.inc1.devtunnels.ms/auth/register -v
```

Should return:
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
< Access-Control-Allow-Headers: *
```

---

## Testing the Fix

### Quick Browser Test
1. Open dev tools (F12)
2. Go to Console tab
3. Run:
```javascript
fetch('https://051llbnr-8000.inc1.devtunnels.ms/test')
  .then(r => r.json())
  .then(data => console.log('✅ CORS working:', data))
  .catch(err => console.error('❌ CORS failed:', err))
```

Should see: `✅ CORS working: {message: "CORS test successful"}`

### Test Registration
Try registering a new user through the frontend. The error should be gone!

---

## If Still Not Working

### Check 1: Port Visibility
Both ports must be **Public**, not Private:

```powershell
# In VS Code terminal
devtunnel show
```

Should show:
```
Port 5173: Public
Port 8000: Public
```

### Check 2: Backend Logs
Check the terminal running the backend for errors:
```
# Should see incoming requests:
INFO: 127.0.0.1:xxxxx - "OPTIONS /auth/register HTTP/1.1" 200 OK
INFO: 127.0.0.1:xxxxx - "POST /auth/register HTTP/1.1" 200 OK
```

### Check 3: Browser Console
Look for any other errors:
- ✅ "CORS test successful" → CORS is working
- ❌ "net::ERR_FAILED" → Tunnel connection issue
- ❌ "401 Unauthorized" → Different issue (auth, not CORS)

### Check 4: Clear Browser Cache
Sometimes browsers cache CORS failures:
```
1. Open dev tools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

---

## Dev Tunnel Authentication

If you see authentication prompts from dev tunnels:

### Option 1: Anonymous Access (Recommended for Testing)
```powershell
# When creating tunnel:
devtunnel create --allow-anonymous
```

### Option 2: GitHub Authentication
```powershell
# Login first:
devtunnel login

# Create tunnel with auth:
devtunnel create
```

Make sure frontend and backend use the same authentication method!

---

## Alternative: Use ngrok

If dev tunnels continue to have issues, try ngrok:

### Install ngrok
```powershell
# Download from https://ngrok.com/download
# Or with chocolatey:
choco install ngrok
```

### Start ngrok tunnels
```powershell
# Terminal 1: Backend tunnel
ngrok http 8000

# Terminal 2: Frontend tunnel  
ngrok http 5173
```

### Update Frontend
Edit `src/utils/api.js` if needed, or use the URL from ngrok directly.

---

## Production Deployment

For production, **DO NOT** use dev tunnels. Instead:

1. **Deploy Backend**: 
   - Render.com (already configured)
   - Railway.app
   - Heroku
   - Your own VPS

2. **Deploy Frontend**:
   - Vercel (already configured)
   - Netlify
   - Cloudflare Pages

3. **Update CORS**:
   In production, change `allow_origins` from `["*"]` to your actual domains:
   ```python
   allow_origins=[
       "https://your-frontend.vercel.app",
       "https://your-domain.com"
   ]
   ```

---

## What Changed in the Code

### Before (app/main.py)
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### After (app/main.py)
```python
# Custom middleware for dev tunnels
class DevTunnelCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return JSONResponse(
                content={},
                headers={"Access-Control-Allow-Origin": "*", ...}
            )
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

app.add_middleware(DevTunnelCORSMiddleware)
app.add_middleware(CORSMiddleware, ...)
```

This ensures ALL responses include CORS headers, including preflight OPTIONS requests.

---

## Success Indicators

✅ **Backend starts without errors**

✅ **Browser console shows API URL correctly**
```
🔗 API Base URL: https://xxx-8000.inc1.devtunnels.ms
```

✅ **No CORS errors in console**

✅ **Registration/login works through tunnel**

✅ **Backend logs show OPTIONS and POST requests**
```
INFO: "OPTIONS /auth/register HTTP/1.1" 200
INFO: "POST /auth/register HTTP/1.1" 200
```

---

## Quick Command Reference

```powershell
# Restart backend
cd PROEDUVATE-CODEING-MODULE
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000

# Check tunnel status
devtunnel show

# Make port public
devtunnel port set 8000 --visibility public
devtunnel port set 5173 --visibility public

# Test CORS from command line
curl -X OPTIONS https://your-tunnel-8000.devtunnels.ms/test -v

# Clear Python cache (if needed)
Remove-Item -Recurse -Force app/__pycache__
```

---

## Still Having Issues?

1. Check [LOBBY_JOIN_TROUBLESHOOTING.md](LOBBY_JOIN_TROUBLESHOOTING.md) for auth issues
2. Verify MongoDB connection in backend logs
3. Try localhost first (without tunnels) to isolate the issue
4. Check Windows Firewall isn't blocking ports 5173 or 8000
5. Restart VS Code if tunnels are misbehaving

---

## Need Help?

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| CORS preflight failed | OPTIONS not handled | Fixed by update ✅ |
| net::ERR_FAILED | Tunnel not public | Make port public |
| 404 on OPTIONS | Missing route | Fixed by update ✅ |
| Authentication prompt | Tunnel auth | Use `--allow-anonymous` |
| Connection refused | Backend not running | Start backend first |

---

**The CORS issue should now be resolved! 🎉**

Restart your backend and try again. If you still see issues, check the port visibility settings.
