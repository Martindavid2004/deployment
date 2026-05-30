# Bug Hunt Mode - Troubleshooting & Fix Guide

## Issue: No Buggy Code Appearing in Editor

### Root Cause
The bug generation system was working, but had some edge cases where bugs weren't being introduced in very short code samples.

### Fixes Applied

#### 1. **Enhanced Bug Generation Algorithm**
**File:** `app/routers/competitive.py`

**Changes:**
- Added retry logic (up to 10 attempts) to ensure bugs are introduced
- Better calculation of target bug count based on non-empty lines
- Added comprehensive logging to track bug generation
- Improved bug detection to avoid no-op transformations

```python
# Before: Single pass, could fail on short code
max_bugs = min(3, max(1, len([l for l in lines if l.strip()]) // 4))

# After: Multiple passes with retry logic
while bugs_introduced < max_bugs and attempt < max_attempts:
    # Try multiple times to introduce bugs
```

**Logging Added:**
```python
print(f"🐛 Generating buggy code: {non_empty_lines} lines, target {max_bugs} bugs")
print(f"  🐛 Bug {bugs_introduced + 1}: Line {idx + 1}: '{line.strip()}' → '{modified_line.strip()}'")
print(f"  ✅ Successfully introduced {bugs_introduced} bug(s)")
```

#### 2. **Backend Match Creation Logging**
**File:** `app/routers/competitive.py`

**Changes:**
- Added logging when buggy code is generated
- Shows source (referenceCode vs starterCode)
- Displays code lengths before/after

```python
print(f"🐛 Generating buggy code from {'referenceCode' if reference_code else 'starterCode'}")
print(f"   Original code length: {len(code_to_bug)}")
print(f"   Generated buggy code length: {len(buggy_code_content)}")
```

#### 3. **Frontend Debugging & Error Handling**
**File:** `src/pages/CompetitiveMatch.jsx`

**Changes:**
- Enhanced console logging to show all buggy code sources
- Better fallback handling
- Clear error messages when no code available

```javascript
console.log("🐛 Bug Hunt Mode - Loading buggy code:");
console.log("  - From match.buggy_code:", buggyFromMatch ? `${buggyFromMatch.length} chars` : "EMPTY");
console.log("  - From problem.buggyCode:", buggyFromProblem ? `${buggyFromProblem.length} chars` : "EMPTY");
console.log("  - Fallback starter:", starterFallback ? `${starterFallback.length} chars` : "EMPTY");
```

## How to Verify the Fix

### 1. Check Backend Logs
When creating a bug hunt match, you should see:
```
🐛 Generating buggy code from referenceCode
   Original code length: 87
🐛 Generating buggy code: 5 lines, target 1 bugs
  🐛 Bug 1: Line 3: 'for i in range(1, n + 1):' → 'for i in range(1, n + 1)'
  ✅ Successfully introduced 1 bug(s)
   Generated buggy code length: 86
```

### 2. Check Browser Console
When entering a bug hunt match, you should see:
```
🎮 Game Mode: bug_hunt
🐛 Bug Hunt Mode - Loading buggy code:
  - From match.buggy_code: 86 chars
  - From problem.buggyCode: EMPTY
  - Fallback starter: 87 chars
✅ Loaded buggy code: n = int(input())
result = 1
for i in range(1, n + 1)
    result *= i
print(result)...
```

### 3. Verify in Editor
The Monaco editor should show buggy code like:
```python
n = int(input())
result = 1
for i in range(1, n + 1)    # ← Missing colon!
    result *= i
print(result)
```

## Testing Steps

### Step 1: Seed Problems
```bash
cd PROEDUVATE-CODEING-MODULE
python seed_problems.py
```
✅ Ensures all problems have `referenceCode`

### Step 2: Test Bug Generation
```bash
python test_bug_generation.py
```
✅ Verifies bugs are being introduced

### Step 3: Start Backend with Logging
```bash
cd PROEDUVATE-CODEING-MODULE
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
✅ Watch console for bug generation logs

### Step 4: Start Frontend
```bash
npm run devv
```
✅ Frontend at http://localhost:5173

### Step 5: Create Bug Hunt Match

**Via API (Postman):**
```http
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
```

**Via UI:**
1. Go to Competitive page
2. Select "Bug Hunt" mode
3. Click "Find Match"
4. Enter the match

### Step 6: Verify Buggy Code
- Open browser DevTools (F12)
- Check Console tab
- Look for "🐛 Bug Hunt Mode - Loading buggy code" messages
- Verify editor shows buggy code

## Common Issues & Solutions

### Issue 1: "No bugs were introduced"
**Symptom:** Warning in logs: `⚠️ Warning: No bugs introduced after 10 attempts!`

**Causes:**
- Code is too simple (e.g., only 1-2 lines)
- Code doesn't match any bug patterns

**Solutions:**
1. Use problems with more complex code (5+ lines)
2. Ensure code has statements that can be bugged (loops, conditions, operators)
3. Add more bug patterns to `generate_buggy_code()`

**Example Good Code for Bug Generation:**
```python
n = int(input())
result = 1
for i in range(1, n + 1):
    result *= i
print(result)
```

**Example Bad Code (too simple):**
```python
print(input())
```

### Issue 2: Empty Editor in Bug Hunt Mode
**Symptom:** Editor is blank when entering bug hunt match

**Diagnosis:**
1. Check browser console for error messages
2. Check if `match.buggy_code` is null/empty
3. Check if problem has `referenceCode` or `starterCode`

**Solutions:**
1. Re-seed problems: `python seed_problems.py`
2. Check match document in MongoDB:
   ```javascript
   db.matches.findOne({_id: ObjectId("match_id")})
   // Should have: buggy_code: "..."
   ```
3. Verify problem document:
   ```javascript
   db.problems.findOne({_id: ObjectId("problem_id")})
   // Should have: referenceCode: { python: "..." }
   ```

### Issue 3: Same Code as Original
**Symptom:** Buggy code looks identical to starter code

**Causes:**
- Bugs weren't actually introduced
- Bug transformations were no-ops

**Solutions:**
1. Check backend logs for bug generation messages
2. Run `test_bug_generation.py` multiple times
3. Increase `max_bugs` in `generate_buggy_code()`:
   ```python
   max_bugs = min(3, max(2, non_empty_lines // 2))  # More aggressive
   ```

### Issue 4: Frontend Not Receiving Buggy Code
**Symptom:** Backend logs show bugs generated, but frontend doesn't show them

**Diagnosis:**
1. Check API response:
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
        http://localhost:8000/competitive/matches/MATCH_ID
   ```
2. Should include: `"buggy_code": "n = int(input())\n..."`

**Solutions:**
1. Clear browser cache
2. Check CORS settings in backend
3. Verify `MatchPublic` schema includes `buggy_code` field

## Performance Considerations

### Bug Generation Time
- **Target:** < 100ms per match
- **Current:** ~10-50ms (depends on code size)
- **Monitor:** Check backend logs for timing

### Optimization Tips
1. Limit retry attempts (currently 10)
2. Cache buggy code in problem document if needed
3. Pre-generate buggy code during problem seeding

## Monitoring & Metrics

### What to Track
- **Bug Generation Success Rate:** Should be > 95%
- **Average Bugs per Code:** Should be 1-3
- **Bug Variety:** Track which bug types are most common
- **Player Feedback:** Are bugs too easy/hard?

### Logging Points
1. **Match Creation:** When buggy code is generated
2. **Match Start:** When player loads buggy code
3. **Match Submit:** When player submits fixed code
4. **Match Complete:** Win/loss outcome

### Example Log Analysis
```bash
# Count bug generation successes
grep "Successfully introduced" app.log | wc -l

# Find failures
grep "No bugs introduced" app.log

# Average bugs per match
grep "Successfully introduced" app.log | awk '{print $4}' | awk '{s+=$1; n++} END {print s/n}'
```

## Future Improvements

### Short-term (Next Sprint)
- [ ] Ensure at least 1 bug for all code lengths
- [ ] Add more bug patterns for edge cases
- [ ] Improve bug variety distribution

### Medium-term
- [ ] Bug difficulty levels (easy/medium/hard)
- [ ] Language-specific optimizations
- [ ] Pre-generate buggy code during seeding

### Long-term
- [ ] Machine learning for bug generation
- [ ] Custom bug patterns per problem
- [ ] Player bug difficulty preferences

---

## Quick Fix Checklist

When bug hunt mode isn't working:

- [ ] Backend logs show bug generation?
- [ ] Browser console shows buggy code loading?
- [ ] Problem has `referenceCode` field?
- [ ] Match document has `buggy_code` field?
- [ ] Editor shows code (even if not buggy)?
- [ ] Try different problem (more complex code)?
- [ ] Re-seed problems database?
- [ ] Clear browser cache & reload?
- [ ] Check MongoDB connection?
- [ ] Verify API responses include buggy_code?

**Still not working?** Check the detailed logs and error messages above!

---

**Last Updated:** January 24, 2026
**Version:** 1.1 (Enhanced with retry logic & logging)
