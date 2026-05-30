# 🚨 QUICK FIX for "Failed to fetch" Error

## The Problem
Getting "Connection error: Failed to fetch" when using port forwarding? 

## The Solution (2 Steps)

### 1️⃣ Stop Your Current Backend

Press `Ctrl+C` in the terminal running the backend.

### 2️⃣ Start Backend with Correct Binding

**Windows:**
```bash
cd PROEDUVATE-CODEING-MODULE
start-backend-forwarding.bat
```

**Mac/Linux:**
```bash
cd PROEDUVATE-CODEING-MODULE
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### ✅ Verify It Worked

Look for this in the output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**NOT** this:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 3️⃣ Forward Port 8000 in VS Code

1. Open Ports panel
2. Forward port 8000
3. Make it **Public**

### 4️⃣ Test

Refresh your frontend and try logging in!

---

## Why This Fixes It

- `127.0.0.1` = localhost only (can't be accessed remotely)
- `0.0.0.0` = all network interfaces (works with port forwarding)

**That's it!** The frontend will automatically detect your forwarded URL.

For detailed docs, see [PORT_FORWARDING_SETUP.md](./PORT_FORWARDING_SETUP.md)
