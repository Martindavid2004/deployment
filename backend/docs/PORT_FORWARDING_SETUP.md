# Port Forwarding Setup Guide

## Problem
When using VS Code port forwarding or accessing the app from a different machine, login fails with "Connection error: Failed to fetch" or "make sure the server is running" error.

## Root Cause
1. Backend server binding to `127.0.0.1` (localhost only) instead of `0.0.0.0` (all interfaces)
2. CORS not configured for forwarded URLs
3. Frontend using hardcoded localhost URLs

## Solution (2 Steps)

### Step 1: Start Backend with Correct Binding

**Option A - Use the provided script (Easiest):**
```bash
# Windows
start-backend-forwarding.bat

# Mac/Linux
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Option B - Manual command:**
```bash
cd PROEDUVATE-CODEING-MODULE
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**⚠️ Important:** The key difference is `--host 0.0.0.0` instead of `--host 127.0.0.1`
- `127.0.0.1` = localhost only (won't work with port forwarding)
- `0.0.0.0` = all network interfaces (works with port forwarding)

### Step 2: Forward Ports in VS Code

1. **Forward Backend Port (8000)**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Forward a Port"
   - Enter: `8000`
   - Right-click the forwarded port → Change Port Visibility → **Public**
   - Note the URL (e.g., `https://abc123-8000.app.github.dev`)

2. **Forward Frontend Port (5173)**
   - Forward port: `5173`
   - Make it **Public**
   - Note the URL (e.g., `https://abc123-5173.app.github.dev`)

3. **Access Your App**
   - Open the frontend URL in your browser
   - Check console (F12) for: `🔗 API Base URL: ...`
   - Try logging in!

## How It Works

### Automatic API URL Detection
The app uses `src/utils/api.js` which automatically:
1. Checks for `VITE_API_URL` environment variable (for manual override)
2. Detects VS Code port forwarding pattern (e.g., `abc-5173.domain.com` → `abc-8000.domain.com`)
3. Falls back to `hostname:8000` for other forwarding services
4. Defaults to `http://localhost:8000` for local development

### CORS Handling
The backend automatically allows **all origins in development mode**. No CORS configuration needed!

In production, you must set `ENVIRONMENT=production` and configure `CORS_ORIGINS`.

## Verification Steps

### 1. Check Backend is Accessible
Open in browser (replace with your forwarded URL):
```
https://your-backend-8000.app.github.dev/docs
```

You should see the FastAPI documentation page.

### 2. Check Frontend API Detection
1. Open frontend in browser
2. Press F12 to open console
3. Look for these messages:
   ```
   🌐 Detected forwarded port, using: https://abc-8000.domain.com
   🔗 API Base URL: https://abc-8000.domain.com
   ```

### 3. Test Login
Try logging in. If it works, you're done! 🎉

### Manual Configuration (Optional)

If automatic detection doesn't work, create a `.env` file in the frontend:

```env
VITE_API_URL=https://your-backend-forwarded-url.com
```

Then restart the frontend dev server.

## Testing

1. Open browser console (F12)
2. Look for: `🔗 API Base URL: [url]`
3. Verify it shows your forwarded URL, not localhost
4. Try logging in

## Troubleshooting

### Error: "Failed to fetch" - Most Common Issue! ⚠️

**The backend MUST bind to 0.0.0.0, not 127.0.0.1**

Check your server output:
```bash
# ✅ CORRECT (works with port forwarding):
INFO:     Uvicorn running on http://0.0.0.0:8000

# ❌ WRONG (only works locally):
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Fix:** Stop the server and restart with:
```bash
cd PROEDUVATE-CODEING-MODULE
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the provided script:
```bash
start-backend-forwarding.bat
```

### Still getting 404 errors?
- Check that backend port 8000 is forwarded
- Verify CORS_ORIGINS includes your frontend URL
- Restart backend after changing CORS

### CORS errors in console?
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```
- Add your frontend forwarded URL to `CORS_ORIGINS` in backend `.env`
- Restart backend

### "Failed to fetch" errors?
- Verify backend is running: `curl https://your-backend-url/docs`
- Check port forwarding is active
- Ensure ports are public (not private)

## Backend CORS Configuration

The backend checks `CORS_ORIGINS` environment variable. Update it to include all URLs that should access your API:

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://your-forwarded-frontend.com
```

Separate multiple origins with commas.

## How to Check API URL

In your browser console, you should see:
```
🔗 API Base URL: https://your-actual-api-url
```

If it shows `http://localhost:8000` when using port forwarding, clear browser cache and refresh.
