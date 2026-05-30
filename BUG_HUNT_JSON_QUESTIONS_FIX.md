# Bug Hunt JSON Questions Fix

## Problem
Bug Hunt mode was using complex MongoDB problems that had incomplete buggy code implementations. When players ran the code, it would execute successfully but produce no output, making it impossible to debug.

Example from logs:
```
DEBUG Piston: Parsed result: ExecutionResult(success=True, output='', compile_error='', runtime_error='', execution_time=0.0, timed_out=False)
```

The code compiled and ran (exit code 0) but produced no output because the MongoDB problems like "Sliding Window Maximum" were missing the necessary input/output code.

## Root Cause
The lobby creation code was selecting problems from MongoDB (`db.problems.find()`) instead of using the high-quality JSON questions from `data/bug_hunt_questions.json`.

## Solution
Modified Bug Hunt mode to use JSON questions exclusively:

### Backend Changes

1. **Modified `create_lobby` in `app/routers/competitive.py`**:
   - Added special handling for Bug Hunt mode
   - Uses `QuestionLoader` to load questions from JSON
   - Stores questions directly in lobby document as `bug_hunt_questions`
   - Selects 5 questions (mostly easy difficulty)

2. **Modified `start_lobby` in `app/routers/competitive.py`**:
   - Copies `bug_hunt_questions` from lobby to match document
   - Sets `total_problems` based on question count

3. **Added new endpoint `/matches/{match_id}/bug-hunt-question`**:
   - Returns current Bug Hunt question for a player
   - Includes buggy code for all languages (Python, Java, C++)
   - Tracks player progress through questions
   - Formats response to be compatible with existing frontend

4. **Updated `/matches/{match_id}/switch-language`**:
   - Checks for Bug Hunt questions first
   - Returns buggy code from JSON question instead of MongoDB
   - Preserves timer and progress state

### Frontend Changes

1. **Modified `fetchMatch` in `src/pages/CompetitiveMatch.jsx`**:
   - Detects Bug Hunt mode
   - Calls new `/bug-hunt-question` endpoint
   - Converts Bug Hunt question format to problem format for compatibility
   - Loads buggy code from question data

## Benefits

1. **Working Code**: All 3 JSON questions have complete, runnable code
2. **Clear Bugs**: Each question has a single, fixable bug
3. **Proper Output**: Code reads input and prints output correctly
4. **Multi-Language**: Python, Java, and C++ variants all work
5. **Easy to Extend**: Add more questions to JSON file without database changes

## Current Questions

1. **Sum Numbers - Off by One** (Easy)
   - Bug: Loop starts from 0 instead of 1
   - Fix: Change `range(n)` to `range(1, n + 1)`

2. **Count Even Numbers** (Easy)
   - Bug: Checks for odd instead of even
   - Fix: Change `i % 2 == 1` to `i % 2 == 0`

3. **Find Maximum** (Easy)
   - Bug: Uses < instead of >
   - Fix: Change `num < max_num` to `num > max_num`

## Testing

To test:
1. Create a Bug Hunt lobby
2. Start the match
3. Run the code - you should see actual output now
4. Fix the bug and submit
5. Switch languages to test Java/C++ variants

## Future Improvements

1. Add more questions to `data/bug_hunt_questions.json`
2. Add medium and hard difficulty questions
3. Consider adding hints that reveal the bug location
4. Add question categories (loops, conditionals, arrays, etc.)
