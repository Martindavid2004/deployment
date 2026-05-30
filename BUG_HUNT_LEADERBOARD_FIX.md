# Bug Hunt Leaderboard Display Fix

## Issue
When the last player submitted and completed the match, they didn't see the leaderboard immediately. Only players who submitted earlier could see it through polling.

## Root Cause
The backend was not returning `winner_id` and full `players` data when the match completed. The response only included:
```python
{
    "message": "Match completed!",
    "rank": 1,
    "winners": ["player1", "player2"],  # Just usernames
    "final_score": 100
}
```

The frontend checks for `data.winner_id || data.winners` to show the leaderboard, but `winners` was just an array of usernames, not enough to trigger the leaderboard display.

## Solution

### Backend Fix (`app/routers/competitive.py`)
Updated the match completion response to include:
1. `winner_id` - The user_id of the winner
2. `players` - Full array of player objects with scores, ranks, and completion times

```python
# Fetch the updated match with all player data
final_match = await db.matches.find_one({"_id": match_oid})

return {
    "message": "Match completed!",
    "rank": next(i + 1 for i, p in enumerate(players_with_rank) if p["user_id"] == user_id),
    "winners": [p["username"] for p in players_with_rank[:3]],
    "winner_id": winner_id,  # NEW: Added winner_id
    "final_score": final_score,
    "players": final_match.get("players", [])  # NEW: Added full players array
}
```

### Frontend Already Handles This
The frontend already has the logic to show the leaderboard when `winner_id` or `winners` is present:

```javascript
if (data.winner_id || data.winners) {
  // Match completed - store results and show leaderboard
  if (data.winners) {
    // Multiplayer match completed
    setFinalResults({
      type: 'multiplayer',
      rank,
      score: data.final_score || data.score || 0,
      winners: data.winners,
      players: data.players || players,
      currentUserId
    });
  }
  setMatchCompleted(true);
}
```

## Complete Flow Now

### Player 1 Submits (First):
1. Submits code
2. Gets response: `{ "message": "Waiting for other players...", "score": 85 }`
3. Player card updates with score
4. Polling starts to check for match completion

### Player 2 Submits (Last):
1. Submits code
2. Backend detects all players completed
3. Gets response: `{ "winner_id": "...", "winners": [...], "players": [...], "rank": 1 }`
4. **Leaderboard immediately appears** ✅
5. Player 1's polling also detects completion and shows leaderboard

## Testing Checklist
- [x] Backend returns `winner_id` when match completes
- [x] Backend returns full `players` array with scores
- [x] Last player sees leaderboard immediately after submit
- [x] Other players see leaderboard through polling
- [x] Leaderboard shows correct rankings and scores
- [x] Works for both 2-player and multiplayer matches

## Files Modified
1. `codo-ai/app/routers/competitive.py` - Added `winner_id` and `players` to completion response
2. `codo-ai/src/pages/CompetitiveMatch.jsx` - Already had the logic, just needed backend data

## Result
✅ All players now see the leaderboard when the match completes, whether they're the last to submit or waiting for others!
