# Competitive Mode - Problem Generation Setup

## What Was Fixed

The competitive mode was failing with "No problems available" error. Now it:

1. ✅ **Auto-generates problems** when database is empty
2. ✅ **Uses Gemini AI** to create unique problems (if API key configured)
3. ✅ **Falls back to predefined problems** if Gemini is unavailable
4. ✅ **Saves generated problems** to database for reuse

## Quick Setup (Choose One Method)

### Method 1: Seed Database with Initial Problems (Recommended)

Run the seed script to add 5 starter problems:

```bash
cd PROEDUVATE-CODEING-MODULE
python seed_problems.py
```

This adds:
- Sum of Two Numbers (Easy)
- Even or Odd (Easy)
- Maximum of Three (Easy)
- Count Digits (Easy)
- Factorial (Medium)

### Method 2: Let It Auto-Generate

Just start matchmaking! The system will automatically:
1. Check database for problems
2. If none found, generate one using Gemini AI or fallback problems
3. Save it to database for future use

### Method 3: Manually Generate (Admin Only)

Use the admin endpoint:
```bash
POST /competitive/generate-problem?difficulty=easy
Authorization: Bearer <admin-token>
```

## Gemini AI Configuration (Optional)

For AI-generated problems, add to your `.env`:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

Get a free API key: https://makersuite.google.com/app/apikey

**Without Gemini API:**
- Still works! Uses predefined fallback problems
- 3 easy problems + 1 medium problem available

**With Gemini API:**
- Generates unique problems on demand
- More variety and challenge
- Customizable difficulty levels

## Testing

### 1. Verify Problems Exist

Visit: http://localhost:8000/problems

You should see a list of problems.

### 2. Start Matchmaking

Click "Start 1v1 Duel" in the competitive page.

**Expected behavior:**
- ✅ If problems exist: Uses random problem from database
- ✅ If no problems: Auto-generates and saves one
- ✅ Creates match successfully

### 3. Check Logs

Server output shows:
```
⚠️ No problems in database, generating a random problem...
✅ Generated and saved problem: [Title] (ID: xxx)
```

## How It Works

### Matchmaking Flow

```
User clicks "Start 1v1 Duel"
    ↓
Check database for problems
    ↓
┌─────────────┬──────────────┐
│ Has problems│  No problems │
│             │              │
│ Use random  │  Generate new│
│ problem     │  problem     │
│             │              │
│             │  ↓           │
│             │  Try Gemini  │
│             │  ↓           │
│             │  Fallback if │
│             │  API fails   │
│             │  ↓           │
│             │  Save to DB  │
└─────────────┴──────────────┘
    ↓
Create match with selected problem
    ↓
Wait for opponent or play
```

### Problem Generator Features

**Fallback Problems:**
- Double the Number
- Sum of Array
- Reverse String
- Find Maximum

**Gemini-Generated Problems:**
- Unique every time
- Difficulty-based
- Includes test cases
- Starter code for Python, C++, Java
- Hints provided

## Admin Features

### Generate Multiple Problems

```python
# Generate 10 random problems
import requests

token = "your_admin_token"
for i in range(10):
    difficulty = "easy" if i < 5 else "medium"
    response = requests.post(
        f"http://localhost:8000/competitive/generate-problem?difficulty={difficulty}",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Generated: {response.json()['problem']['title']}")
```

### View All Problems

```bash
GET /problems
Authorization: Bearer <token>
```

## Troubleshooting

### Still getting "No problems available"?

1. **Check database connection:**
   ```
   Server logs should show: "✅ Successfully connected to MongoDB!"
   ```

2. **Run seed script:**
   ```bash
   python seed_problems.py
   ```

3. **Restart backend:**
   The auto-generation will work on next matchmaking attempt

### Gemini API not working?

Check server logs for errors. Common issues:
- Invalid API key
- API quota exceeded
- Network issues

**Solution:** System automatically falls back to predefined problems!

### Generated problems too easy/hard?

Modify difficulty in matchmaking:
```python
# In competitive.py, line ~432
difficulty = random.choice(["easy", "medium", "hard"])
```

## Files Modified

1. **app/services/problem_generator.py** (NEW)
   - Gemini AI integration
   - Fallback problem definitions
   - Problem generation logic

2. **app/routers/competitive.py** (UPDATED)
   - Auto-generate on empty database
   - Admin endpoint for manual generation
   - Import problem generator service

3. **seed_problems.py** (NEW)
   - Database seeder script
   - 5 initial problems
   - Interactive prompt

## Next Steps

1. ✅ Run seed script OR start matchmaking to auto-generate
2. ✅ Test competitive mode
3. ✅ (Optional) Add Gemini API key for unique problems
4. ✅ Generate more problems via admin endpoint

Enjoy competitive coding! 🏆
