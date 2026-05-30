# 🚀 Multiplayer Quick Start Guide

## Playing in 5 Minutes

### Option 1: Host a Game

1. **Go to Competitive Mode**
   ```
   Navigate to: /competitive
   ```

2. **Click "Create Lobby"**
   - Choose your game mode (⚡ Code Sprint, 🐛 Bug Hunt, 🔀 Code Shuffle, 🎯 Test Master)
   - Select a problem
   - Set max players (2-15)
   - Click "Create Lobby"

3. **Share Your Game ID**
   ```
   You'll get a 6-character code like: ABC123
   ```
   Share this with your friends!

4. **Wait for Players**
   - Watch as players join your lobby
   - See everyone's username in real-time

5. **Start the Game**
   - Once you have at least 2 players
   - Click "Start Game" (only you can do this)
   - Everyone races to solve the problem!

### Option 2: Join a Game

1. **Get the Game ID**
   ```
   Ask your friend for their 6-character code
   Example: ABC123
   ```

2. **Click "Join Lobby"**
   ```
   Navigate to: /lobby/join
   ```

3. **Enter the Game ID**
   - Type in the code
   - Click "Join Lobby"

4. **Wait for Host to Start**
   - You'll see all other players
   - Host will start when ready

5. **Play and Win!**
   - Solve the problem as fast as you can
   - Compete for top 3!

### Option 3: Quick 1v1

1. **Select Game Mode**
   - Choose from 4 modes in Competitive page

2. **Click "Quick 1v1"**
   - Instant matchmaking
   - Play against another player or bot

## Game Modes Explained

### ⚡ Code Sprint (Standard)
- Solve a coding problem from scratch
- Fastest correct solution wins
- Classic competitive programming

### 🐛 Bug Hunt
- Fix broken code with intentional bugs
- Make all tests pass
- Speed and accuracy matter

### 🔀 Code Shuffle
- Code lines are shuffled randomly
- Drag and drop to rearrange
- 80%+ accuracy required to pass

### 🎯 Test Master
- Create test cases for a problem
- Quality and edge case coverage scored
- 60+ points required to pass

## Scoring & Ranking

### How You're Ranked
1. **Score** - Accuracy and completion (0-150 points)
2. **Time** - Used as tiebreaker

### Rewards
- 🥇 **1st Place**: +100 XP, +30 Rating
- 🥈 **2nd Place**: +50 XP, +15 Rating
- 🥉 **3rd Place**: +25 XP, +5 Rating

## Pro Tips

### For Hosts
✅ Use descriptive lobby names  
✅ Wait for all friends before starting  
✅ Choose longer time limits for harder problems  
✅ Max 15 players for best experience  

### For Players
✅ Join promptly when invited  
✅ Test your code before submitting  
✅ Watch the timer!  
✅ Use hints wisely (they reduce XP bonus)  

### For Winners
✅ Speed matters - finish fast for time bonus  
✅ Don't use hints if you can avoid it  
✅ Code Shuffle: Aim for 100% accuracy  
✅ Bug Hunt: Find ALL bugs before submitting  

## Common Questions

**Q: Can I play alone?**  
A: No, you need at least 2 players. Use "Quick 1v1" for instant matches.

**Q: What if the host leaves?**  
A: Host role transfers to the next player. If all leave, lobby closes.

**Q: Can I see other players' code?**  
A: No, you only see your own code during the match.

**Q: What happens if time runs out?**  
A: Match ends. Players are ranked by completion status and score.

**Q: Can I create private lobbies?**  
A: Currently, anyone with the Game ID can join. Keep your code private!

**Q: How long do lobbies last?**  
A: Lobbies stay open until the host starts or all players leave.

## Example Session

```
1. Alice creates a lobby for Code Sprint
   Game ID: ALICE1
   Max Players: 5
   Problem: Two Sum

2. Bob, Carol, Dave join using "ALICE1"
   4/5 players in lobby

3. Eve joins
   5/5 players - Lobby full!

4. Alice clicks "Start Game"
   30-minute timer begins

5. Race begins!
   - Eve solves in 3:24 (Score: 150)
   - Alice solves in 4:15 (Score: 142)
   - Bob solves in 5:02 (Score: 135)
   - Carol solves in 7:30 (Score: 120)
   - Dave doesn't complete

6. Results:
   🥇 Eve: +100 XP, +30 Rating
   🥈 Alice: +50 XP, +15 Rating
   🥉 Bob: +25 XP, +5 Rating
```

## Need Help?

- **Game not working?** → Check [MULTIPLAYER_LOBBY_GUIDE.md](MULTIPLAYER_LOBBY_GUIDE.md)
- **Backend issues?** → See [START_BACKEND.md](START_BACKEND.md)
- **Mode questions?** → Read [COMPETITIVE_MODE.md](COMPETITIVE_MODE.md)

## Quick Commands

### Start Backend
```bash
cd PROEDUVATE-CODEING-MODULE
python -m uvicorn app.main:app --reload --port 8000
```

### Start Frontend
```bash
npm run dev
```

### Test Multiplayer
```bash
# Create some test problems with reference code
python seed_problems.py

# Verify everything works
python test_endpoints.py
```

---

**Now go create your first lobby and invite your friends! 🎮**
