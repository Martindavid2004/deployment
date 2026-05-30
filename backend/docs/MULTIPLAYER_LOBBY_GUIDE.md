# 🎮 Multiplayer Lobby System - Documentation

## Overview

The multiplayer lobby system allows up to **15 players** to compete in the same coding challenge simultaneously. A host player creates a lobby with a unique Game ID that other players can use to join.

## Features

### 🎯 Core Capabilities
- **Up to 15 players** in a single match
- **Host-controlled lobbies** with unique 6-character Game IDs
- **All game modes supported**: Code Sprint, Bug Hunt, Code Shuffle, Test Master
- **Real-time player tracking** with live status updates
- **Ranking system** - Players ranked by score and completion time
- **Quick 1v1** mode still available for instant matchmaking

### 🚀 How It Works

#### Creating a Lobby
1. Navigate to **Competitive Mode**
2. Click **"Create Lobby"**
3. Configure your game:
   - Select a game mode
   - Choose a problem
   - Set max players (2-15)
   - Set time limit
   - Optional: Give your lobby a custom name
4. Share the generated **Game ID** with friends

#### Joining a Lobby
1. Navigate to **Competitive Mode**
2. Click **"Join Lobby"**
3. Enter the **6-character Game ID**
4. Wait in the lobby for the host to start

#### Starting the Game
- Only the **host** can start the game
- Requires at least **2 players** to start
- All players are immediately taken to the match screen

#### Playing
- All players solve the **same problem**
- Everyone sees the same shuffled lines (Code Shuffle mode)
- Everyone debugs the same buggy code (Bug Hunt mode)
- Compete for the **fastest time** and **highest score**

#### Winning
- **Multiplayer matches**: Ranked by score (accuracy) then time
- **Top 3 players** receive special recognition and XP rewards
- Results show your rank, score, and the top 3 winners

## API Endpoints

### Create Lobby
```http
POST /competitive/lobby/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "problem_id": "string",
  "game_mode": "standard|bug_hunt|code_shuffle|test_master",
  "time_limit_seconds": 1800,
  "max_players": 5,
  "lobby_name": "Optional Name"
}

Response:
{
  "game_id": "ABC123",
  "lobby_name": "My Game",
  "host_id": "user_id",
  "host_username": "username",
  "problem_id": "problem_id",
  "game_mode": "standard",
  "time_limit_seconds": 1800,
  "max_players": 5,
  "players": [...],
  "status": "waiting",
  "created_at": "2026-01-24T..."
}
```

### Join Lobby
```http
POST /competitive/lobby/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "game_id": "ABC123"
}

Response:
{
  "message": "Joined lobby: My Game",
  "lobby": { ... }
}
```

### List Lobbies
```http
GET /competitive/lobby/list?game_mode=standard&status=waiting
Authorization: Bearer <token>

Response: [
  {
    "game_id": "ABC123",
    "lobby_name": "My Game",
    "players": [...],
    "max_players": 5,
    ...
  }
]
```

### Get Lobby Details
```http
GET /competitive/lobby/{game_id}
Authorization: Bearer <token>

Response: { ... lobby details ... }
```

### Start Game (Host Only)
```http
POST /competitive/lobby/{game_id}/start
Authorization: Bearer <token>

Response:
{
  "message": "Game started!",
  "match_id": "match_id",
  "game_id": "ABC123"
}
```

### Leave Lobby
```http
POST /competitive/lobby/{game_id}/leave
Authorization: Bearer <token>

Response:
{
  "message": "Left lobby"
}
```

### Submit Solution (Multiplayer)
```http
POST /competitive/matches/{match_id}/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "match_id": "string",
  "code": "string",
  "language": "python",
  "arranged_lines": [...],  // For Code Shuffle
  "test_cases": [...]       // For Test Master
}

Response (during match):
{
  "message": "Solution submitted successfully. Waiting for other players.",
  "time_elapsed": 45.2,
  "score": 95
}

Response (match complete):
{
  "message": "Match completed!",
  "rank": 2,
  "winners": ["Player1", "Player2", "Player3"],
  "final_score": 95
}
```

## Frontend Components

### New Pages
1. **LobbyCreate.jsx** - Lobby creation form
2. **LobbyJoin.jsx** - Join lobby by Game ID
3. **LobbyRoom.jsx** - Waiting room showing all players

### Updated Pages
- **Competitive.jsx** - Added multiplayer buttons
- **CompetitiveMatch.jsx** - Supports multiplayer matches
- **App.jsx** - New routes added

### Routes
- `/lobby/create` - Create new lobby
- `/lobby/join` - Join existing lobby
- `/lobby/:gameId` - Lobby waiting room
- `/competitive/:matchId` - Match screen (supports both 1v1 and multiplayer)

## Database Schema

### Lobby Collection
```javascript
{
  _id: ObjectId,
  game_id: "ABC123",           // 6-character unique code
  lobby_name: "My Game",       // Optional custom name
  host_id: "user_id",
  host_username: "username",
  problem_id: "problem_id",
  game_mode: "standard",
  time_limit_seconds: 1800,
  max_players: 5,
  players: [                   // Array of player states
    {
      user_id: "user_id",
      username: "username",
      code: "",
      completed: false,
      time_elapsed: 0.0,
      score: 0,
      rank: null,
      ...
    }
  ],
  buggy_code: "...",           // For Bug Hunt mode
  shuffled_lines: [...],       // For Code Shuffle mode
  status: "waiting",           // waiting, active, completed
  created_at: ISODate,
  started_at: ISODate,
  completed_at: ISODate,
  match_id: "match_id"         // Set when game starts
}
```

### Match Collection (Updated)
```javascript
{
  _id: ObjectId,
  game_id: "ABC123",           // For multiplayer matches
  problem_id: "problem_id",
  game_mode: "standard",
  host_id: "user_id",          // Multiplayer host
  max_players: 5,              // Multiplayer support
  
  // Legacy 1v1 support
  player1: { ... },
  player2: { ... },
  
  // Multiplayer support
  players: [                   // Array of all players
    {
      user_id: "user_id",
      username: "username",
      code: "",
      completed: false,
      time_elapsed: 0.0,
      score: 95,
      rank: 1,
      ...
    }
  ],
  
  time_limit_seconds: 1800,
  status: "active",            // waiting, active, completed
  
  // Winners
  winner_id: "user_id",        // 1st place (for compatibility)
  winners: ["id1", "id2", "id3"], // Top 3 players
  
  created_at: ISODate,
  started_at: ISODate,
  completed_at: ISODate
}
```

## Scoring System

### Standard & Bug Hunt Modes
- **100 points** for passing all tests
- **Time bonus**: Up to 50 points based on speed
  - Complete in < 25% of time limit: +50 points
  - Complete in 25-50% of time limit: +30-50 points
  - Complete in > 50% of time limit: +10-30 points

### Code Shuffle Mode
- **Base score**: Percentage of correctly placed lines (0-100)
- **Time bonus**: Up to 50 points based on speed
- **Minimum 80% accuracy** required to pass

### Test Master Mode
- **Base score**: Quality of test cases (0-100)
  - Quantity: Up to 50 points
  - Variety: Up to 35 points
  - Edge cases: Up to 15 points
- **Minimum 60 points** required to pass

### Ranking
Players are ranked by:
1. **Score** (higher is better)
2. **Time** (faster is better, used as tiebreaker)

## Rewards

### Multiplayer Matches
- **1st place**: +100 XP, +30 Rating
- **2nd place**: +50 XP, +15 Rating
- **3rd place**: +25 XP, +5 Rating
- Other participants: Experience and practice

### 1v1 Matches (Legacy)
- Winner: Rating gain based on opponent's rating
- Winner: XP bonus based on time and hints used
- Loser: Rating loss (smaller than winner's gain)

## Usage Examples

### Example 1: Code Sprint with 5 Players
```javascript
// Host creates lobby
POST /competitive/lobby/create
{
  "problem_id": "two_sum",
  "game_mode": "standard",
  "max_players": 5,
  "time_limit_seconds": 900,
  "lobby_name": "Friday Night Code"
}

// Game ID: FNC123

// 4 friends join
POST /competitive/lobby/join
{ "game_id": "FNC123" }

// Host starts when all players ready
POST /competitive/lobby/FNC123/start

// All 5 players race to solve "Two Sum"
// Results:
// 1st: Alice - 150 points (100 + 50 time bonus) - 3:24
// 2nd: Bob - 135 points - 4:15
// 3rd: Carol - 128 points - 5:02
// 4th: Dave - 120 points - 5:45
// 5th: Eve - 115 points - 6:30
```

### Example 2: Bug Hunt with 10 Players
```javascript
// Host creates Bug Hunt lobby
POST /competitive/lobby/create
{
  "problem_id": "binary_search",
  "game_mode": "bug_hunt",
  "max_players": 10,
  "lobby_name": "Bug Bounty Challenge"
}

// Game ID: BBC789

// 9 players join
// Everyone gets the same buggy binary search code
// Race to find and fix all bugs
// First 3 to fix all bugs get bonus rewards
```

## Technical Implementation

### Game ID Generation
- 6-character alphanumeric code
- Uppercase letters (A-Z) and digits (0-9)
- Collision detection with retry mechanism
- Example: `ABC123`, `XYZ789`, `DEF456`

### Lobby Lifecycle
1. **Created**: Host creates, status = "waiting"
2. **Players Join**: Players join, shown in real-time
3. **Host Starts**: Converts lobby to match, status = "active"
4. **Players Compete**: All submit solutions independently
5. **Match Ends**: When all players complete or time expires
6. **Results**: Players ranked and rewards distributed

### Real-time Updates
- Lobby room polls every 2 seconds for player list updates
- Automatic navigation when host starts the game
- Live player status (waiting, in progress, completed)

## Best Practices

### For Hosts
- Wait for all invited players before starting
- Choose appropriate time limits (longer for harder problems)
- Use descriptive lobby names to help friends find you
- Consider max_players based on problem difficulty

### For Players
- Join promptly when invited
- Don't join if you can't complete the match
- Respect the host's start decision
- Have fun and learn from others!

### For Developers
- Always check `match.players` vs `match.player1/player2` for compatibility
- Handle both multiplayer and 1v1 match types
- Poll lobby status for real-time updates
- Validate game_id format and existence

## Troubleshooting

### "Lobby not found"
- Check Game ID is correct (case-sensitive)
- Lobby may have already started
- Lobby may have been deleted

### "Lobby is full"
- Host set max_players limit
- Try creating your own lobby

### "Cannot start game"
- Need at least 2 players
- Only host can start
- Check all players are ready

### "No shuffled lines"
- Problem needs reference code for Code Shuffle
- Run `python seed_problems.py` to fix
- Contact admin

## Future Enhancements

### Planned Features
- [ ] Private lobbies (password-protected)
- [ ] Tournament brackets (8/16 player elimination)
- [ ] Team mode (2v2, 3v3)
- [ ] Spectator mode
- [ ] Replay system
- [ ] Custom problem sets for lobbies
- [ ] Voice chat integration
- [ ] In-match chat

### Potential Improvements
- WebSocket support for true real-time updates
- Better matchmaking for skill-balanced lobbies
- Lobby browser with filters
- Achievements for multiplayer
- Season rankings and leaderboards
- Custom game modes and modifiers

## Migration Guide

### From 1v1 to Multiplayer
The system maintains **backwards compatibility** with existing 1v1 matches:

```python
# Old 1v1 match check
if match["player1"]["user_id"] == user_id:
    player = match["player1"]
    
# New unified approach
is_multiplayer = match.get("players") is not None
if is_multiplayer:
    players = match["players"]
    player = next(p for p in players if p["user_id"] == user_id)
else:
    # Legacy 1v1
    if match["player1"]["user_id"] == user_id:
        player = match["player1"]
```

### Database Migration
No migration needed! New fields are optional and backwards compatible.

## Support

For issues or questions:
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review [COMPETITIVE_MODE.md](COMPETITIVE_MODE.md)
- Contact: support@codoai.com

---

**Happy Coding! 🚀**
