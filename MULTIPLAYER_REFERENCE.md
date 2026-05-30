# 🎮 Multiplayer Lobby - Quick Reference Card

## For Players

### Create a Game
```
1. Competitive → Create Lobby
2. Select: Mode + Problem + Max Players
3. Get Game ID (e.g., ABC123)
4. Share with friends
5. Start when ready
```

### Join a Game
```
1. Competitive → Join Lobby
2. Enter Game ID
3. Wait for host to start
4. Compete!
```

### Quick 1v1
```
1. Competitive → Quick 1v1
2. Instant match
3. Play now!
```

## Game Modes

| Mode | Icon | Description | Win Condition |
|------|------|-------------|---------------|
| Code Sprint | ⚡ | Solve from scratch | Fastest correct solution |
| Bug Hunt | 🐛 | Fix broken code | Find all bugs, fastest |
| Code Shuffle | 🔀 | Rearrange lines | 80%+ accuracy, fastest |
| Test Master | 🎯 | Create test cases | 60+ quality score |

## Rewards

| Rank | XP | Rating |
|------|-----|--------|
| 🥇 1st | +100 | +30 |
| 🥈 2nd | +50 | +15 |
| 🥉 3rd | +25 | +5 |

## Scoring

```
Total Score = Base Score + Time Bonus

Base Score:
- Standard/Bug Hunt: 100 points (all tests pass)
- Code Shuffle: 0-100 (accuracy %)
- Test Master: 0-100 (quality)

Time Bonus: 0-50 points
- < 25% time: +50
- 25-50% time: +30
- > 50% time: +10
```

## API Endpoints

```
POST   /competitive/lobby/create       Create lobby
POST   /competitive/lobby/join         Join by Game ID
GET    /competitive/lobby/list         List lobbies
GET    /competitive/lobby/{game_id}    Lobby details
POST   /competitive/lobby/{game_id}/start   Start game
POST   /competitive/lobby/{game_id}/leave   Leave lobby
```

## Routes

```
/competitive              Main page
/lobby/create            Create lobby
/lobby/join              Join lobby
/lobby/{gameId}          Waiting room
/competitive/{matchId}   Match screen
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+Enter | Run code |
| Ctrl+S | Submit solution |
| Ctrl+/ | Toggle comment |

## Pro Tips

✅ **Speed matters** - Time bonus up to 50 points  
✅ **Accuracy first** - Wrong answer = no points  
✅ **Test locally** - Use Run before Submit  
✅ **Watch timer** - Don't run out of time  
✅ **Read carefully** - Understand requirements  

## Common Issues

| Problem | Solution |
|---------|----------|
| Lobby not found | Check Game ID (case-sensitive) |
| Can't start | Need 2+ players, must be host |
| No code visible | Bug Hunt/Code Shuffle loads code automatically |
| Time expired | Match ends, partial credit given |

## Example Game IDs

```
ABC123    HELLO1    GAME42
XYZ789    CODE99    WIN101
```

## Player Limits

```
Minimum: 2 players
Maximum: 15 players
Recommended: 4-8 players for best experience
```

## Time Limits

```
15 min  - Quick games
30 min  - Standard (default)
45 min  - Complex problems
60 min  - Very hard problems
```

## Status Icons

```
⏳ Waiting     - Lobby not started
🎮 Active      - Match in progress
✓ Completed   - Player finished
👑 Host        - Lobby creator
```

## Game Flow

```
Create → Share → Join → Wait → Start → Play → Rank → Reward
```

## Backend Commands

```bash
# Start server
cd PROEDUVATE-CODEING-MODULE
python -m uvicorn app.main:app --reload --port 8000

# Seed problems
python seed_problems.py

# Test endpoints
python test_endpoints.py
```

## Frontend Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production
npm run preview
```

## Database Collections

```
lobbies  - Active lobbies with Game IDs
matches  - In-progress and completed matches
users    - Player stats, ratings, XP
problems - Coding challenges
```

## Need Help?

📖 Full docs: [MULTIPLAYER_LOBBY_GUIDE.md](MULTIPLAYER_LOBBY_GUIDE.md)  
🚀 Quick start: [MULTIPLAYER_QUICKSTART.md](MULTIPLAYER_QUICKSTART.md)  
📝 Summary: [MULTIPLAYER_IMPLEMENTATION_SUMMARY.md](MULTIPLAYER_IMPLEMENTATION_SUMMARY.md)  

---

**Happy Coding! 🚀**
