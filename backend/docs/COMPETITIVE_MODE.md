# Competitive Mode Implementation

## Overview
The competitive mode allows students to compete against each other in timed 1v1 coding challenges. Players earn/lose rating based on their performance and receive bonus XP for exceptional solutions.

## Features

### 1. **Matchmaking System**
- Automatic matchmaking to find opponents
- Rating-based matching (within ±200 rating points)
- Queue system for waiting players
- Random problem selection if not specified

### 2. **Rating System (ELO-style)**
- Starting rating: 1200
- Rating changes based on opponent strength
- Bonus for not using hints (+10 rating)
- Minimum rating change: 10 points per match

### 3. **XP Bonus System**
Players earn bonus XP based on:
- **Time Performance:**
  - < 25% of time limit: +50 XP
  - < 50% of time limit: +30 XP
  - Otherwise: +10 XP
- **No Hints Used:** +50 XP
- **Base XP:** +100 XP (for winning)

### 4. **Match Types**
- **1v1 Duels:** Head-to-head competition on the same problem
- **Timed Challenges:** Default 30-minute time limit
- **Same Test Cases:** Both players solve identical problem

## API Endpoints

### Match Management

#### `POST /competitive/matchmaking`
Start matchmaking to find or create a match.
- **Returns:** Match ID and action (created/joined)
- **Auto-matches** with waiting players or creates new match

#### `GET /competitive/matches`
List user's competitive matches.
- **Query params:** `status` (optional) - filter by match status
- **Returns:** Array of match objects

#### `GET /competitive/matches/{match_id}`
Get details of a specific match.

#### `POST /competitive/matches/{match_id}/start`
Start a match (changes status from "waiting" to "active").

#### `POST /competitive/matches/{match_id}/submit`
Submit solution for evaluation.
- **Body:** `{ code, language }`
- **Returns:** Match result if both players finished, or waiting message

#### `POST /competitive/matches/{match_id}/hint`
Mark that a player used a hint (reduces XP bonus).

#### `GET /competitive/leaderboard`
Get competitive leaderboard sorted by rating.
- **Query params:** `limit` (default: 50)

## Database Schema

### Matches Collection
```json
{
  "_id": ObjectId,
  "problem_id": "string",
  "player1": {
    "user_id": "string",
    "username": "string",
    "code": "string",
    "completed": false,
    "time_elapsed": 0.0,
    "used_hints": false,
    "submission_time": null
  },
  "player2": {
    // Same structure as player1
  },
  "time_limit_seconds": 1800,
  "status": "waiting|active|completed|cancelled",
  "winner_id": "string|null",
  "created_at": "datetime",
  "started_at": "datetime|null",
  "completed_at": "datetime|null"
}
```

### Users Collection (Updated)
```json
{
  "_id": ObjectId,
  "username": "string",
  "rating": 1200,  // NEW: Competitive rating
  "xp": 0,
  "level": 1,
  "achievements": []
}
```

## Frontend Components

### 1. **Competitive.jsx** (Dashboard)
- Display user rating and stats
- "Start 1v1 Duel" button for matchmaking
- Recent matches list
- Top players leaderboard

### 2. **CompetitiveMatch.jsx** (Match Interface)
Full-screen competitive coding interface:
- **Problem description** (left panel)
- **Code editor** (right panel)
- **Live timer** with progress bar
- **Opponent status** indicator
- **Hint system** with XP penalty warning
- **Submit solution** button

### Key Features:
- Real-time countdown timer
- Color-coded time warnings (red < 1 min)
- Opponent completion status
- Automatic match result display
- Auto-redirect after completion

## Usage Flow

### Player Journey:

1. **Navigate to Competitive Mode**
   - View current rating and stats
   - See recent matches and leaderboard

2. **Start Matchmaking**
   - Click "Start 1v1 Duel"
   - System finds opponent or creates waiting room
   - Redirected to match interface

3. **Compete**
   - Read problem description
   - Write solution in chosen language
   - Optional: Use hint (reduces bonus XP)
   - Submit solution when ready

4. **Match Resolution**
   - System evaluates both solutions
   - Fastest correct solution wins
   - Rating updated immediately
   - XP bonus awarded to winner
   - Results displayed automatically

5. **Return to Dashboard**
   - View updated rating
   - See match in history
   - Check leaderboard position

## Rating Calculation

```python
def calculate_rating_change(winner_rating, loser_rating, used_hints):
    k_factor = 32
    expected_winner = 1 / (1 + 10 ** ((loser_rating - winner_rating) / 400))
    rating_change = int(k_factor * (1 - expected_winner))
    
    # Bonus for not using hints
    if not used_hints:
        rating_change += 10
    
    return max(10, rating_change)  # Minimum 10 points
```

## XP Bonus Calculation

```python
def calculate_xp_bonus(time_elapsed, time_limit, used_hints):
    base_xp = 100
    
    # Time bonus
    time_ratio = time_elapsed / time_limit
    if time_ratio < 0.25:
        time_bonus = 50
    elif time_ratio < 0.5:
        time_bonus = 30
    else:
        time_bonus = 10
    
    # No hints bonus
    no_hints_bonus = 50 if not used_hints else 0
    
    return base_xp + time_bonus + no_hints_bonus
```

## Future Enhancements

1. **Real-time Updates**
   - WebSocket integration for live opponent status
   - Live code streaming (optional spectator mode)

2. **Tournament Mode**
   - Multi-round tournaments
   - Bracket system
   - Prize pools

3. **Advanced Matchmaking**
   - Skill-based matchmaking refinement
   - Preferred language matching
   - Problem difficulty preferences

4. **Team Competitions**
   - 2v2 matches
   - Team ratings
   - Collaborative coding

5. **Replay System**
   - Watch completed matches
   - Review opponent solutions
   - Learn from top players

## Configuration

### Default Settings:
- **Time Limit:** 30 minutes (1800 seconds)
- **Starting Rating:** 1200
- **K-Factor:** 32 (rating volatility)
- **Minimum Rating Change:** 10 points
- **Base XP:** 100 points

### Adjustable Parameters:
- Time limits per problem difficulty
- K-factor for rating stability
- XP bonuses and penalties
- Matchmaking rating range

## Testing Checklist

- [ ] Create match via matchmaking
- [ ] Join existing waiting match
- [ ] Submit correct solution
- [ ] Submit incorrect solution
- [ ] Use hint system
- [ ] Time limit expiration
- [ ] Rating update after win/loss
- [ ] XP bonus calculation
- [ ] Leaderboard accuracy
- [ ] Match history display

## Notes

- Matches auto-start when both players join
- Solutions must pass all test cases to be valid
- Fastest valid solution wins
- No ties - if both submit at exactly same time, first submission wins
- Hints reduce XP bonus but don't affect rating change (except for the +10 no-hint bonus)
- Players can't compete against themselves
- Inactive matches (no submission within time limit) are marked as cancelled

## Conclusion

The competitive mode adds an exciting PvP dimension to the coding platform, encouraging students to practice under time pressure while earning rewards. The ELO-style rating system ensures fair matches, and the XP bonuses incentivize quick, clean solutions without relying on hints.
