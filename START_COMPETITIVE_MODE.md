# Start Competitive Mode - Quick Guide

## ✅ What's New: Bot Matchmaking!

If no real player is available, you'll be automatically matched with a bot opponent that:
- Has a similar rating to you (±100 points)
- Completes the problem in 3-10 minutes based on skill level
- Affects your rating just like a real match
- Has fun names like "CodeBot", "AlgoMaster", "PyThonBot", etc.

## 🚀 How to Start

### Step 1: Start the Backend

**Option A - Using Batch File (Easiest):**
1. Navigate to `PROEDUVATE-CODEING-MODULE` folder in File Explorer
2. Double-click `start-backend-forwarding.bat`
3. Wait for "✅ Successfully connected to MongoDB!" message
4. **Keep this window open!**

**Option B - Using VS Code Terminal:**
1. Open a new terminal in VS Code (Terminal → New Terminal)
2. Run these commands:
   ```powershell
   cd PROEDUVATE-CODEING-MODULE
   ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
3. Wait for "✅ Successfully connected to MongoDB!" and "Application startup complete"
4. **Leave this terminal running!**

### Step 2: Start the Frontend

1. Open **another** terminal (Terminal → New Terminal)
2. Run:
   ```powershell
   cd PROEDUVATE-CODEING-MODULE
   npm run dev
   ```
3. Open the URL shown (usually http://localhost:5173)

### Step 3: Try Competitive Mode

1. Login to your account
2. Click **"Competitive"** in the navigation
3. Click **"Start 1v1 Duel"** button
4. Wait 2 seconds - you'll be matched with a bot if no player is available
5. Start coding! The bot will complete the problem in 3-10 minutes

## 🤖 Bot Behavior

- **Matchmaking**: After 2 seconds of no real player joining, a bot is assigned
- **Completion Time**: 3-10 minutes (higher rating bots = faster)
- **Skill Level**: Bot rating is within ±100 of your rating
- **Rating Impact**: 
  - Beat the bot → Gain rating points
  - Lose to bot → Lose rating points
- **XP Bonus**: Same rules apply (no hints = bonus XP)

## 🎯 Competitive Features

### Rating System
- Start at 1200 rating
- Win = +10 to +50 points (based on opponent strength)
- Lose = -10 to -50 points
- No hints bonus = +10 additional points

### XP Bonuses
- Base: 100 XP
- Complete in <25% of time limit: +50 XP
- Complete in <50% of time limit: +30 XP
- No hints used: +50 XP
- Total possible: 200 XP per match!

### Match Flow
1. Click "Start 1v1 Duel"
2. Get matched (real player or bot after 2 seconds)
3. Solve the problem against the clock
4. First to pass all tests wins
5. Both must finish to determine winner by time
6. Rating and XP updated automatically

## 🔧 Troubleshooting

### "Failed to fetch" Error
- **Cause**: Backend is not running
- **Fix**: Start the backend using Step 1 above

### "No problems available"
- **Cause**: Database has no problems yet
- **Fix**: Run `python seed_problems.py` to add 5 starter problems
- **Alternative**: The system will auto-generate a problem using Gemini AI

### Backend Keeps Stopping
- Don't close the terminal window where backend is running
- Don't press Ctrl+C in that terminal
- Keep it running in a dedicated terminal/window

### Port Already in Use
- Check if backend is already running: `netstat -ano | findstr :8000`
- Kill existing process: `taskkill /F /PID <process_id>`
- Or just use the existing running server!

## 📊 Monitoring Your Match

While in a match, you can see:
- ⏱️ **Time Remaining**: Countdown timer (30 min limit)
- 👤 **Opponent Status**: "In Progress" or "✓ Finished"
- 💡 **Hint System**: Click for hints (reduces XP bonus)
- 🧪 **Test Results**: Live feedback on your code

## 🏆 Leaderboard

- Top 10 players shown on dashboard
- Sorted by rating (highest first)
- Shows username, rating, XP, and level
- Updates automatically after each match

## 🎮 Tips for Success

1. **Read the Problem**: Understand all requirements first
2. **Start Simple**: Get a basic solution working first
3. **Test Edge Cases**: Consider empty inputs, large numbers, etc.
4. **Avoid Hints**: Save them for when you're really stuck (costs XP)
5. **Watch the Clock**: Faster completion = more XP
6. **Practice Often**: Rating improves with consistent play

## 🌐 Remote Access (Port Forwarding)

If using VS Code port forwarding:
1. Backend is already configured for 0.0.0.0 binding
2. Forward port 8000 (set visibility to Public)
3. Forward port 5173 (set visibility to Public)
4. Access via the forwarded URLs
5. API URL auto-detects the forwarding

Enjoy your competitive coding experience! 🚀
