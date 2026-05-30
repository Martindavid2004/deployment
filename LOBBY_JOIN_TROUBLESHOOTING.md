# 🔧 Lobby Join Troubleshooting Guide

## Problem: Players Cannot Join Lobby Using Game ID

### Quick Diagnosis

Check the browser console (F12) and backend terminal for error messages. Common error patterns:

```
❌ 404: Lobby not found
❌ 401: Unauthorized / Authentication failed
❌ 400: Lobby is full / Already started / Already in lobby
```

---

## Common Issues & Solutions

### 1. **Authentication Problem** ⭐ MOST COMMON
**Symptoms:**
- Error: "Unauthorized" or "401"
- Players redirected to login page
- "Your session has expired" message

**Root Cause:**
Players trying to join are not logged in or their JWT token has expired.

**Solution:**
```bash
# Ensure players:
1. Are registered and logged in
2. Have a valid token in localStorage
3. Haven't been logged out

# To check in browser console (F12):
console.log(localStorage.getItem("token"));
# Should show a JWT token string, not null
```

**Fix:**
- Players must login/register before joining
- If token expired, logout and login again
- Check backend is running and accessible

---

### 2. **Wrong API URL**
**Symptoms:**
- Network error / Failed to fetch
- CORS errors in console
- Cannot connect to server

**Root Cause:**
Frontend cannot reach the backend API.

**Solution:**
```bash
# Check src/utils/api.js is detecting correct API URL
# In browser console, you should see:
# "🔗 API Base URL: http://localhost:8000" (or your backend URL)

# Verify backend is running:
curl http://localhost:8000/test

# If using port forwarding, ensure both ports are forwarded:
# - Frontend: 5173
# - Backend: 8000
```

---

### 3. **Lobby Already Started**
**Symptoms:**
- Error: "Game has already started. Cannot join."
- Lobby status is "active" not "waiting"

**Root Cause:**
Host started the game before player could join.

**Solution:**
- Host should wait for all players before clicking "Start Game"
- Players must join while lobby status is "waiting"
- Once started, no new players can join (by design)

**Workaround:**
Host can create a new lobby if needed.

---

### 4. **Lobby Full**
**Symptoms:**
- Error: "Lobby is full"
- Players = max_players (e.g., 15/15)

**Solution:**
- Host can create lobby with higher max_players (up to 15)
- Or create additional lobbies
- Some players need to leave first

---

### 5. **Player Already in Lobby**
**Symptoms:**
- Error: "You are already in this lobby"

**Root Cause:**
Same user trying to join twice (e.g., multiple browser tabs).

**Solution:**
- Refresh the lobby page instead of joining again
- If stuck, have host remove you or restart lobby

---

### 6. **Wrong Game ID**
**Symptoms:**
- Error: "Lobby not found. Please check the Game ID."
- No lobby found with that code

**Solution:**
- Double-check the 6-character code
- Game IDs are case-insensitive (ABC123 = abc123)
- Make sure lobby hasn't been deleted/completed
- Ask host to share the code again

---

### 7. **Database Connection Issue**
**Symptoms:**
- Backend errors about MongoDB
- "Database not connected" messages
- 500 Internal Server Error

**Solution:**
```bash
# Check MongoDB Atlas connection:
# 1. Verify MONGODB_URI in .env file
# 2. Check MongoDB Atlas dashboard for connectivity
# 3. Ensure IP whitelist includes your IP (or 0.0.0.0/0 for dev)
# 4. Restart backend after fixing .env

# Check backend logs for:
# "✅ Connected to MongoDB" (good)
# "❌ MongoDB connection failed" (problem)
```

---

## Testing the Fix

### Step-by-Step Test

1. **Start Backend**
   ```bash
   cd PROEDUVATE-CODEING-MODULE
   ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
   ```
   
   Look for:
   ```
   ✅ Connected to MongoDB
   INFO: Uvicorn running on http://localhost:8000
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   ```
   
   Look for:
   ```
   Local: http://localhost:5173
   ```

3. **Test Authentication**
   - Open http://localhost:5173
   - Login with valid credentials
   - Check browser console for token

4. **Create Lobby (Player 1)**
   - Go to Competitive Mode
   - Click "Create Lobby"
   - Choose game mode and settings
   - Note the 6-character Game ID (e.g., ABC123)

5. **Join Lobby (Player 2)**
   - Open http://localhost:5173 in **incognito/private window**
   - Login with different account
   - Go to Competitive Mode
   - Click "Join Lobby"
   - Enter the Game ID
   - Click "Join Lobby"

6. **Verify**
   - Player 2 should see lobby room
   - Player 1 should see Player 2 added to players list
   - Both should see the same game mode and problem

---

## Debug Logging

### Backend Logs (Terminal)
You should now see enhanced logging:
```
🎮 Join lobby request: game_id=ABC123, user=player2
   Found lobby with status: waiting
✅ Lobby data received: ABC123 Players: 2
```

### Frontend Logs (Browser Console F12)
```
🎮 Attempting to join lobby: ABC123
✅ Successfully joined lobby: ABC123
🔄 Fetching lobby: ABC123
✅ Lobby data received: ABC123 Players: 2
```

---

## Still Not Working?

### Collect Debug Info
1. **Backend Terminal Output**
   - Copy all error messages
   - Look for MongoDB connection status

2. **Browser Console (F12)**
   - Copy all error messages
   - Check Network tab for failed requests
   - Verify API_BASE URL

3. **Check These**
   ```bash
   # Backend running?
   curl http://localhost:8000/test
   
   # MongoDB connected?
   # Check backend terminal for "Connected to MongoDB"
   
   # Frontend can reach backend?
   # Open browser console and check API_BASE
   ```

### Common Solutions
```bash
# Restart both servers
Ctrl+C (backend)
Ctrl+C (frontend)

# Start backend
cd PROEDUVATE-CODEING-MODULE
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000

# Start frontend (new terminal)
cd PROEDUVATE-CODEING-MODULE
npm run dev

# Clear browser cache and localStorage
# In browser console (F12):
localStorage.clear()
# Then refresh page and login again
```

---

## Port Forwarding Issues

If using VS Code port forwarding, ngrok, or similar:

1. **Both ports must be forwarded**
   - 5173 (frontend)
   - 8000 (backend)

2. **Backend URL Detection**
   The frontend automatically detects forwarded URLs. Check console:
   ```
   🌐 Detected forwarded port, using: https://abc-8000.example.com
   ```

3. **CORS is enabled**
   Backend accepts all origins in development (already configured)

---

## Prevention Tips

1. **Always login before joining**
2. **Don't share expired Game IDs**
3. **Host should wait for all players before starting**
4. **Use same network/environment** (both localhost or both forwarded)
5. **Keep backend running** while players join

---

## Success Indicators

✅ Backend shows: `🎮 Join lobby request: game_id=ABC123, user=player2`

✅ Frontend shows: `✅ Successfully joined lobby: ABC123`

✅ Lobby room displays all players

✅ Host can click "Start Game" and everyone enters the match

---

For more help, check:
- [MULTIPLAYER_QUICKSTART.md](MULTIPLAYER_QUICKSTART.md)
- [MULTIPLAYER_LOBBY_GUIDE.md](MULTIPLAYER_LOBBY_GUIDE.md)
