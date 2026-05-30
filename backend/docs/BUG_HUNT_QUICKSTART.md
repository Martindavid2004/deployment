# 🐛 Quick Start: Bug Hunt Mode

## What is Bug Hunt Mode?

Bug Hunt is a competitive coding game where you race against an opponent to find and fix bugs in code. The system automatically introduces 1-3 realistic bugs into working code, and you must identify and correct all errors to win!

## Quick Setup (5 minutes)

### 1. Seed Problems with Reference Code
```bash
cd PROEDUVATE-CODEING-MODULE
python seed_problems.py
```
✅ This adds problems with `referenceCode` needed for bug generation

### 2. Start Backend
```bash
cd PROEDUVATE-CODEING-MODULE
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
✅ Backend running at http://localhost:8000

### 3. Start Frontend
```bash
npm run devv
```
✅ Frontend running at http://localhost:5173

## How to Play

### Step 1: Create/Join Match
1. Navigate to **Competitive** page
2. Select **"Bug Hunt"** mode from dropdown
3. Click **"Find Match"** or create custom match
4. Wait for opponent (or bot)

### Step 2: Identify Bugs
When match starts, you'll see:
```
🐛 Bug Hunt Challenge
The code below contains bugs! Find and fix all errors...
```

The editor will be pre-filled with buggy code like:
```python
n = int(input())
result = 1
for i in range(n + 1)  # Missing colon!
    result *= i
# print(result)  # Commented out!
```

### Step 3: Fix All Bugs
- **Manually edit** the code (copy/paste disabled)
- Look for:
  - Missing colons (`:`)
  - Wrong operators (`+` vs `*`, `==` vs `=`)
  - Off-by-one errors in loops
  - Commented code that should run
  - Wrong indentation
  - Missing semicolons (JavaScript)

### Step 4: Test & Submit
- Click **▶ Run** to test with sample inputs
- Fix any errors you find
- Click **Submit Solution** when ready
- If bugs remain, you'll get an error message
- First to fix all bugs wins! ⚡

## Common Bug Types

### Python:
- `if x > 0` → Missing `:`
- `range(n)` → Should be `range(1, n)`
- `if x == 5` → Wrong: `if x = 5`
- `# return x` → Commented return
- `a + b` → Wrong operator: `a * b`

### JavaScript:
- `return x` → Missing `;`
- `x === 5` → Wrong: `x == 5`
- `arr.push(x)` → Wrong: `arr.pop(x)`
- `for (i = 0; i < n; i++)` → Wrong: `i <= n`

## Scoring
- ⚡ **Speed**: Faster fix = higher score
- 🎯 **Accuracy**: Must pass ALL test cases
- 💡 **No Hints**: +50 XP bonus
- 🏆 **Rating**: ELO-based competitive rating

## Test Bug Generation

Want to see how bugs are generated?
```bash
python test_bug_generation.py
```

This shows:
- Original correct code
- Buggy version with introduced errors
- List of changes made

Run it multiple times to see different random bugs!

## Tips for Winning

1. **Scan Systematically**: Read line-by-line, don't skip
2. **Syntax First**: Check colons, brackets, semicolons
3. **Logic Second**: Verify loop ranges, conditions, operators
4. **Test Often**: Use Run button to catch errors early
5. **Stay Calm**: Bugs are subtle - take your time

## API Testing (Optional)

Using Postman or cURL:

```bash
# Create Bug Hunt match
POST http://localhost:8000/competitive/matches
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "problem_id": "PROBLEM_ID",
  "player1_id": "USER_ID_1",
  "player2_id": "USER_ID_2",
  "game_mode": "bug_hunt",
  "time_limit_seconds": 1800
}

# Get match (includes buggy_code)
GET http://localhost:8000/competitive/matches/{match_id}
Authorization: Bearer YOUR_TOKEN

# Submit fixed code
POST http://localhost:8000/competitive/matches/{match_id}/submit
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "code": "YOUR_FIXED_CODE",
  "language": "python"
}
```

## Troubleshooting

### No buggy code showing?
✅ Make sure problem has `referenceCode` field
✅ Run `python seed_problems.py` again
✅ Check browser console for errors

### Bugs too easy/hard?
Edit `app/routers/competitive.py`:
```python
max_bugs = min(3, max(1, len([l for l in lines if l.strip()]) // 4))
# Change divisor: smaller = more bugs, larger = fewer bugs
```

### Can't find any bugs?
✅ Look for subtle syntax errors
✅ Check commented-out lines
✅ Verify loop conditions and ranges
✅ Test with Run button to see failures

## What's Next?

Once you're comfortable with Bug Hunt:
- Try **Code Shuffle** mode (rearrange lines)
- Try **Test Master** mode (create test cases)
- Check **Leaderboard** to see rankings
- Challenge friends to private matches!

---

**Ready to hunt bugs?** 🐛🔍 Good luck! 🎮
