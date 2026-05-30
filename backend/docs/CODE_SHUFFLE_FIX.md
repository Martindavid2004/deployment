# Code Shuffle - Bug Fix & Testing Guide

## 🐛 Issue Identified

**Problem**: No shuffled code lines showing in Code Shuffle mode UI

## ✅ Fixes Applied

### 1. Enhanced Frontend Debugging
**File**: [src/pages/CompetitiveMatch.jsx](src/pages/CompetitiveMatch.jsx)

Added comprehensive console logging to track shuffled lines loading:
```javascript
console.log("🔀 Code Shuffle Mode - Loading shuffled lines:");
console.log("  - Current User ID:", currentUserId);
console.log("  - Player Key:", playerKey);
console.log("  - Number of lines:", shuffled.length);
```

### 2. Added Empty State Handling
**File**: [src/pages/CompetitiveMatch.jsx](src/pages/CompetitiveMatch.jsx)

Added graceful error display when no lines are available:
```jsx
{arrangedLines.length === 0 ? (
  /* Show error message */
  <div className="text-center p-8 bg-red-500/10">
    <h3>No Code Lines Available</h3>
    <p>This problem doesn't have reference code for shuffling.</p>
  </div>
) : (
  /* Show drag & drop interface */
  <DragDropContext>...</DragDropContext>
)}
```

### 3. Enhanced Backend Logging
**File**: [app/routers/competitive.py](app/routers/competitive.py)

Added detailed logging for shuffle operations:
```python
def shuffle_code_lines(code: str) -> List[str]:
    # ...
    print(f"🔀 Shuffling code:")
    print(f"  - Original lines: {len(lines)}")
    print(f"  - Shuffled lines: {len(shuffled)}")
    return shuffled
```

## 🔍 Root Cause Analysis

The issue likely occurs when:

1. **No Reference Code**: Problem doesn't have `referenceCode` in database
2. **Empty Reference Code**: `referenceCode.python` is empty string
3. **Database Not Seeded**: Problems haven't been seeded with `seed_problems.py`

## 🧪 How to Test

### Step 1: Verify Problems Have Reference Code

```bash
cd PROEDUVATE-CODEING-MODULE
python test_code_shuffle.py
```

Expected output:
```
✅ Shuffling works correctly!
Total lines shuffled: 3
```

### Step 2: Seed Problems (If Needed)

```bash
python seed_problems.py
```

This adds 5 problems with reference code:
- Sum of Two Numbers
- Even or Odd
- Maximum of Three
- Count Digits
- Reverse String

### Step 3: Start Backend

```bash
# From PROEDUVATE-CODEING-MODULE directory
python -m uvicorn app.main:app --reload --port 8000

# OR from parent directory
cd ..
.\.venv\Scripts\python.exe -m uvicorn PROEDUVATE-CODEING-MODULE.app.main:app --reload --port 8000
```

Watch for console logs like:
```
🔀 Code Shuffle Mode:
  - Problem has referenceCode: True
  - Generated 3 shuffled lines
```

### Step 4: Start Frontend

```bash
cd PROEDUVATE-CODEING-MODULE
npm run dev
```

### Step 5: Test in Browser

1. Navigate to `http://localhost:5173`
2. Login/Register
3. Go to **Competitive** page
4. Click **"Code Shuffle"** mode
5. Look for shuffled code lines in UI

### Step 6: Check Browser Console

Open Developer Tools (F12) and check console for:
```
🔀 Code Shuffle Mode - Loading shuffled lines:
  - Current User ID: <user_id>
  - Player Key: player1
  - Number of lines: 3
✅ Loaded 3 shuffled lines
```

## 🎯 Expected Behavior

### When Working Correctly

You should see:
```
┌──────────────────────────────────────┐
│ 🔀 Arrange the code lines...         │
├──────────────────────────────────────┤
│                                      │
│  [⋮⋮] [↑↓] 1  │  b = int(input())   │
│  [⋮⋮] [↑↓] 2  │  print(a + b)       │
│  [⋮⋮] [↑↓] 3  │  a = int(input())   │
│                                      │
│  [▶ Run & Preview] [Submit]          │
└──────────────────────────────────────┘
```

### When No Reference Code

You should see:
```
┌──────────────────────────────────────┐
│ ⚠️  No Code Lines Available          │
│                                      │
│ This problem doesn't have reference  │
│ code for shuffling.                  │
│                                      │
│ Try a different problem.             │
└──────────────────────────────────────┘
```

## 🔧 Troubleshooting

### Issue: "No shuffled lines found!"

**Solution**: Seed the database
```bash
python seed_problems.py
```

### Issue: Backend not starting

**Solutions**:
1. Check virtual environment is activated
2. Verify MONGODB_URI in .env
3. Install dependencies: `pip install -r requirements.txt`

### Issue: Frontend shows error

**Solutions**:
1. Check backend is running on port 8000
2. Clear browser cache
3. Check browser console for errors
4. Verify npm packages: `npm install`

### Issue: Lines show but can't drag

**Solutions**:
1. Verify @hello-pangea/dnd is installed:
   ```bash
   npm install @hello-pangea/dnd
   ```
2. Clear npm cache: `npm cache clean --force`
3. Restart dev server

## 📊 Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors  
- [ ] Can navigate to Competitive page
- [ ] Can select "Code Shuffle" mode
- [ ] Shuffled lines appear in UI
- [ ] Can drag lines with mouse
- [ ] Can move lines with arrow buttons
- [ ] Line numbers update correctly
- [ ] "Run & Preview" executes code
- [ ] "Submit" works when 80%+ correct
- [ ] Browser console shows debug logs

## 📝 Debug Commands

### Check if problems exist
```bash
python -c "from motor.motor_asyncio import AsyncIOMotorClient; import asyncio; import os; from dotenv import load_dotenv; load_dotenv(); async def check(): client = AsyncIOMotorClient(os.getenv('MONGODB_URI')); db = client[os.getenv('MONGODB_DB_NAME', 'codo-ai')]; count = await db.problems.count_documents({}); print(f'Total problems: {count}'); problems = await db.problems.find({'referenceCode.python': {'$exists': True}}).to_list(None); print(f'Problems with Python reference code: {len(problems)}'); asyncio.run(check())"
```

### Test shuffle function
```bash
python test_code_shuffle.py
```

### Check backend logs
Look for these in terminal:
- `🔀 Shuffling code:`
- `🔀 Code Shuffle Mode:`
- `Generated X shuffled lines`

### Check frontend logs
Look for these in browser console:
- `🔀 Code Shuffle Mode - Loading shuffled lines:`
- `✅ Loaded X shuffled lines`
- Or: `❌ No shuffled lines found!`

## 🎯 Success Criteria

The fix is successful when:

1. ✅ Shuffled lines appear in UI
2. ✅ Lines can be dragged and rearranged
3. ✅ Arrow buttons work for fine-tuning
4. ✅ "Run & Preview" executes arranged code
5. ✅ Submission works with accuracy check
6. ✅ No console errors in browser or backend

## 📞 Support

If issues persist:

1. Check all logs (backend terminal + browser console)
2. Verify database connection
3. Ensure problems are seeded
4. Review [CODE_SHUFFLE_GUIDE.md](CODE_SHUFFLE_GUIDE.md)
5. Check [CODE_SHUFFLE_IMPLEMENTATION.md](CODE_SHUFFLE_IMPLEMENTATION.md)

## 🔄 Next Steps After Fix

Once working:
1. Remove excessive debug logging (optional)
2. Test with multiple problems
3. Test with multiple players
4. Verify bot opponents work
5. Test on mobile devices

---

**Status**: 🔧 Fixes applied, ready for testing

**Last Updated**: January 24, 2026
