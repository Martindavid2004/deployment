# Bug Hunt Submit UX Improvements

## Overview
Enhanced the Bug Hunt mode submission flow with validation dialogs, auto-submit on timeout, and improved leaderboard display.

## Features Implemented

### 1. Validation Error Dialog
When a player submits code that doesn't pass all test cases:
- **Dialog appears** showing:
  - Number of tests passed vs total
  - Partial score percentage
  - Compilation errors (if any)
  - Failed test case details (input/expected output)
- **Two options**:
  - **"Try Again"** - Close dialog and continue fixing bugs
  - **"Submit Anyway"** - Force submit with partial score

### 2. Auto-Submit on Timeout
When the timer expires:
- Automatically submits the current code with `force_submit=true`
- Calculates partial score based on passed tests
- Shows leaderboard with final standings

### 3. Leaderboard Display
Shows when:
- All players complete their submissions
- Timer expires and auto-submit completes
- Displays rankings, scores, and completion times

## Technical Changes

### Backend (`app/schemas/competitive.py`)
```python
class MatchSubmit(BaseModel):
    # ... existing fields ...
    force_submit: Optional[bool] = False  # NEW: Force submit even if validation fails
```

### Backend (`app/routers/competitive.py`)
Updated `submit_solution` endpoint for Bug Hunt mode:
- Returns validation result instead of raising HTTPException
- Response includes:
  - `validation_failed: True` if tests didn't pass
  - `passed_tests`, `total_tests`, `score`
  - `compilation_error` or `failed_test` details
- Only proceeds with submission if `force_submit=True` or all tests passed

### Frontend (`src/pages/CompetitiveMatch.jsx`)

#### New State Variables
```javascript
const [showValidationDialog, setShowValidationDialog] = useState(false);
const [validationError, setValidationError] = useState(null);
```

#### Updated `handleSubmit` Function
- Accepts `forceSubmit` parameter (default: false)
- Checks for `validation_failed` in response
- Shows dialog if validation fails and not force submitting
- Passes `force_submit` field to backend

#### Updated `handleTimeExpired` Function
- Simplified to call `handleSubmit(true)` for auto-submit
- Removed manual leaderboard fetching (handled by submit endpoint)

#### New Validation Dialog Component
- Modal overlay with error details
- Shows test results, compilation errors, failed test cases
- "Try Again" and "Submit Anyway" buttons
- Displays partial score percentage

## User Flow

### Scenario 1: Submit with Bugs
1. Player clicks "Submit Solution"
2. Backend validates code against all test cases
3. If not all passed:
   - Dialog appears with error details
   - Player can fix bugs ("Try Again") or accept partial score ("Submit Anyway")
4. If "Submit Anyway" clicked:
   - Resubmits with `force_submit=true`
   - Records partial score
   - Shows leaderboard if match complete

### Scenario 2: Timer Expires
1. Timer reaches 0:00
2. Auto-submit triggered with `force_submit=true`
3. Backend calculates partial score
4. Leaderboard displays with final standings

### Scenario 3: All Tests Pass
1. Player clicks "Submit Solution"
2. All tests pass
3. Score recorded immediately
4. If all players done, leaderboard shows
5. Otherwise, waits for other players

## Score Calculation
```python
score = int((passed_tests / total_tests) * 100)
```
- 0 tests passed = 0% score
- 5/10 tests passed = 50% score
- 10/10 tests passed = 100% score

## Benefits
1. **Better UX**: Players see exactly what's wrong before submitting
2. **Fair scoring**: Partial credit for partially correct solutions
3. **No lost work**: Timer expiration auto-submits instead of discarding progress
4. **Clear feedback**: Compilation errors and failed test cases shown in dialog
5. **Player choice**: Option to fix bugs or accept partial score

## Testing Checklist
- [ ] Submit with compilation error → Dialog shows error
- [ ] Submit with runtime error → Dialog shows error
- [ ] Submit with failed test → Dialog shows failed test details
- [ ] Click "Try Again" → Dialog closes, can continue editing
- [ ] Click "Submit Anyway" → Partial score recorded
- [ ] Timer expires → Auto-submit works, leaderboard shows
- [ ] All players finish → Leaderboard displays correctly
- [ ] Partial scores calculated correctly (passed_tests/total_tests * 100)
