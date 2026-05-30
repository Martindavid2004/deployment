# Competitive Mode - Quick Start Guide

## Setup

### 1. Backend Setup
Make sure your backend is running with the new competitive endpoints:

```bash
cd PROEDUVATE-CODEING-MODULE
# Start the backend
python -m uvicorn app.main:app --reload
```

### 2. Database Migration
The competitive mode adds a `rating` field to users. Existing users will default to 1200 rating.

You can manually update existing users in MongoDB:
```javascript
db.users.updateMany(
  { rating: { $exists: false } },
  { $set: { rating: 1200 } }
)
```

### 3. Frontend Setup
The frontend is already configured. Just make sure you're running it:

```bash
npm run dev
```

## Testing the Competitive Mode

### Step 1: Create Two User Accounts
1. Register two separate accounts (or use existing ones)
2. Log in as User 1 in one browser
3. Log in as User 2 in another browser (or incognito mode)

### Step 2: Start Matchmaking

**User 1:**
1. Navigate to "Competitive" page
2. Click "Start 1v1 Duel"
3. System creates a match and waits for opponent

**User 2:**
1. Navigate to "Competitive" page
2. Click "Start 1v1 Duel"
3. System finds User 1's waiting match
4. Both users are redirected to the match interface

### Step 3: Compete!

Both players will see:
- Same problem to solve
- Live countdown timer
- Opponent status (in progress/completed)
- Code editor
- Submit button

**Gameplay:**
1. Read the problem description
2. Write your solution
3. (Optional) Click "Use Hint" - reduces XP bonus
4. Click "Submit Solution"
5. First to submit correct solution wins!

### Step 4: View Results

After both players submit:
- Winner is announced
- Rating changes displayed
- XP bonus shown for winner
- Automatic redirect to competitive dashboard

### Step 5: Check Leaderboard

Navigate back to Competitive page to see:
- Updated rating
- Match in recent matches list
- Position on leaderboard

## API Testing with Postman

Import the collection: `postman/competitive-mode.postman_collection.json`

### Test Sequence:

1. **Login** (use existing auth endpoints)
   - Get JWT token
   - Set as environment variable

2. **Start Matchmaking**
   ```
   POST /competitive/matchmaking
   ```
   - Returns match_id
   - Save match_id for next requests

3. **Get Match Details**
   ```
   GET /competitive/matches/{match_id}
   ```
   - Check match status
   - View player states

4. **Submit Solution**
   ```
   POST /competitive/matches/{match_id}/submit
   Body: {
     "match_id": "...",
     "code": "def solution(n): return n * 2",
     "language": "python"
   }
   ```

5. **Check Leaderboard**
   ```
   GET /competitive/leaderboard
   ```

## Features to Test

### ✅ Core Functionality
- [ ] Matchmaking creates new match
- [ ] Matchmaking joins existing match
- [ ] Match redirects to game interface
- [ ] Timer counts down correctly
- [ ] Code editor works
- [ ] Submit validates solution
- [ ] Rating updates after match
- [ ] XP bonus calculated correctly

### ✅ Edge Cases
- [ ] Submit with wrong solution (should fail)
- [ ] Submit after time limit expires
- [ ] Use hint (reduces XP bonus)
- [ ] Only winner gets XP bonus
- [ ] Both players get rating change

### ✅ UI/UX
- [ ] Rating displays correctly
- [ ] Recent matches show up
- [ ] Leaderboard updates
- [ ] Active matches are clickable
- [ ] Timer turns red when < 1 min
- [ ] Opponent status updates

## Troubleshooting

### Issue: "Match not found"
- Check that match_id is correct
- Verify user is participant in match

### Issue: "Solution did not pass all test cases"
- Problem must have testCases defined
- Check problem structure in database

### Issue: Rating not updating
- Check MongoDB connection
- Verify users have rating field (default: 1200)

### Issue: Frontend not connecting
- Verify backend is running on port 8000
- Check CORS settings in backend
- Check browser console for errors

## Sample Problem for Testing

Create a simple problem for quick testing:

```json
{
  "title": "Double the Number",
  "description": "Write a function that takes an integer and returns it doubled.",
  "difficulty": "easy",
  "testCases": [
    {
      "input": "5",
      "expected": "10"
    },
    {
      "input": "0",
      "expected": "0"
    },
    {
      "input": "-3",
      "expected": "-6"
    }
  ],
  "starterCode": {
    "python": "def solution(n):\n    # Your code here\n    pass",
    "cpp": "int solution(int n) {\n    // Your code here\n    return 0;\n}",
    "java": "public int solution(int n) {\n    // Your code here\n    return 0;\n}"
  },
  "hint": "Simply multiply the input by 2"
}
```

## Next Steps

After testing:
1. ✅ Create more problems with various difficulties
2. ✅ Test with multiple concurrent matches
3. ✅ Verify leaderboard rankings
4. ✅ Check rating calculations with different scenarios
5. ✅ Test time limit expiration behavior

## Production Considerations

Before deploying to production:
1. Add WebSocket support for real-time updates
2. Implement match timeout/cleanup for abandoned matches
3. Add rate limiting to prevent matchmaking spam
4. Consider adding match replays
5. Implement anti-cheat measures
6. Add match history pagination
7. Create admin tools for managing matches

## Support

For issues or questions:
- Check [COMPETITIVE_MODE.md](./COMPETITIVE_MODE.md) for detailed documentation
- Review backend logs for API errors
- Check browser console for frontend errors
- Verify MongoDB connection and collections

Enjoy competing! 🎮🏆
