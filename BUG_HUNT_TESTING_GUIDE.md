# Bug Hunt Submit Improvements - Testing Guide

## Quick Test Scenarios

### Test 1: Submit with Compilation Error
**Steps:**
1. Start a Bug Hunt match
2. Introduce a syntax error in the code (e.g., remove a closing bracket)
3. Click "Submit Solution"

**Expected Result:**
- Dialog appears with title "Code Validation Failed"
- Shows "Compilation Error:" section with the actual error message
- Shows partial score (likely 0%)
- Two buttons: "Try Again" and "Submit Anyway (0% score)"

**Verify:**
- [ ] Dialog displays correctly
- [ ] Compilation error is readable
- [ ] "Try Again" closes dialog and returns to editor
- [ ] "Submit Anyway" submits with 0% score

---

### Test 2: Submit with Runtime Error
**Steps:**
1. Start a Bug Hunt match
2. Fix syntax but leave a runtime bug (e.g., array index out of bounds)
3. Click "Submit Solution"

**Expected Result:**
- Dialog appears showing runtime error
- Shows which test case failed
- Shows partial score based on tests passed before error
- Two action buttons available

**Verify:**
- [ ] Runtime error message is clear
- [ ] Failed test case shows input and expected output
- [ ] Partial score calculated correctly
- [ ] Both buttons work as expected

---

### Test 3: Submit with Failed Test Case
**Steps:**
1. Start a Bug Hunt match
2. Fix most bugs but leave one that causes wrong output
3. Click "Submit Solution"

**Expected Result:**
- Dialog shows "Failed Test Case:" section
- Displays the input that failed
- Shows expected output
- Calculates partial score (e.g., 8/10 = 80%)

**Verify:**
- [ ] Failed test details are clear
- [ ] Input and expected output displayed
- [ ] Score calculation is correct
- [ ] Can submit with partial score

---

### Test 4: Timer Expiration Auto-Submit
**Steps:**
1. Start a Bug Hunt match
2. Make some progress but don't submit
3. Wait for timer to reach 0:00

**Expected Result:**
- Timer reaches 0:00
- Console shows "[TIMEOUT] Auto-submitting code..."
- Code is automatically submitted with force_submit=true
- Leaderboard appears with final standings
- Partial score recorded based on tests passed

**Verify:**
- [ ] Auto-submit triggers at 0:00
- [ ] No manual action required
- [ ] Leaderboard displays correctly
- [ ] Score reflects actual progress
- [ ] Timer stops after submission

---

### Test 5: All Tests Pass
**Steps:**
1. Start a Bug Hunt match
2. Fix all bugs correctly
3. Click "Submit Solution"

**Expected Result:**
- NO dialog appears
- Submission succeeds immediately
- Shows success message
- If all players done, leaderboard appears
- Otherwise, shows "Waiting for other players..."

**Verify:**
- [ ] No validation dialog shown
- [ ] Immediate submission
- [ ] 100% score recorded
- [ ] Leaderboard logic works correctly

---

### Test 6: Multiple Players - Leaderboard Display
**Steps:**
1. Create a multiplayer Bug Hunt match (3+ players)
2. Have players submit at different times with different scores
3. Last player submits or timer expires

**Expected Result:**
- Leaderboard appears showing all players
- Players ranked by score (higher is better)
- Shows completion times
- Top 3 highlighted
- Current player highlighted

**Verify:**
- [ ] All players listed
- [ ] Correct ranking order
- [ ] Scores displayed accurately
- [ ] Visual highlighting works
- [ ] "Return to Lobby" button works

---

## Console Logs to Watch For

### Successful Flow:
```
[INFO] Submission response received {validation_failed: false, ...}
[SUCCESS] Solution submitted!
```

### Validation Failed:
```
[INFO] Submission response received {validation_failed: true, passed_tests: 5, total_tests: 10, ...}
```

### Timeout:
```
[TIMEOUT] Game time expired - auto-submitting current code...
[TIMEOUT] Auto-submitting code...
```

### Leaderboard:
```
[INFO] MATCH COMPLETED! Showing scoreboard...
[INFO] Multiplayer scoreboard set
[SUCCESS] matchCompleted set to TRUE - scoreboard should display now!
```

---

## Edge Cases to Test

### Edge Case 1: Submit Anyway Twice
- Click "Submit Anyway" in dialog
- Should not show dialog again
- Should proceed with submission

### Edge Case 2: Timer Expires During Dialog
- Dialog is open
- Timer reaches 0:00
- Should auto-submit (dialog may close)

### Edge Case 3: Zero Tests Passed
- All test cases fail
- Should show 0% score
- Should still allow "Submit Anyway"

### Edge Case 4: Network Error During Submit
- Simulate network failure
- Should show error message
- Should not show validation dialog

---

## Backend Verification

Check server logs for:
```
DEBUG Piston: Calling API for language=python, stdin='...'
DEBUG Piston: Raw response data: {...}
DEBUG Piston: Parsed result: ExecutionResult(success=False, ...)
```

Verify database:
- Match status updates to "completed"
- Player scores recorded correctly
- Partial scores saved when force_submit=true
- Winner/rankings calculated properly

---

## Rollback Plan

If issues occur:
1. Revert `codo-ai/app/schemas/competitive.py` (remove force_submit)
2. Revert `codo-ai/app/routers/competitive.py` (restore old validation logic)
3. Revert `codo-ai/src/pages/CompetitiveMatch.jsx` (remove dialog and auto-submit changes)
4. Restart server: `python -m uvicorn app.main:app --reload`
