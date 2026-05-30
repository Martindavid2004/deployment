# Bug Hunt Mode - Competitive Coding Challenge

## Overview

Bug Hunt is one of the competitive game modes where players race to identify and fix bugs in code. The system automatically introduces common programming errors into correct code, and players must find and fix all bugs to pass the test cases.

## How It Works

### 1. Match Creation
When a Bug Hunt mode match is created:
- The system retrieves the problem's `referenceCode` (correct solution)
- Automatically generates buggy code using the `generate_buggy_code()` function
- The buggy code is stored at the match level for both players
- Players see the same buggy code to ensure fairness

### 2. Bug Generation
The bug generator introduces 1-3 realistic bugs based on code length:

#### Python Bugs:
- **Off-by-one errors**: `range(n)` → `range(1, n)`
- **Missing colons**: `if x > 0:` → `if x > 0`
- **Wrong comparison**: `if x == 5:` → `if x = 5`
- **Wrong indentation**: Removes spaces
- **Commented return**: `return result` → `# return result`
- **Wrong operator**: `x + y` → `x * y`
- **Wrong indexing**: `arr[0]` → `arr[1]`
- **Wrong loop variable**: Uses wrong variable in loop
- **Wrong boolean operator**: `and` ↔ `or`
- **Wrong increment**: `i += 1` → `i += 2`
- **Wrong method**: `.append()` → `.extend()`
- **Wrong condition**: `<` → `<=`

#### JavaScript Bugs:
- **Missing semicolon**: Removes `;` from statements
- **Wrong comparison**: `===` → `==`
- **Commented return**: `return x` → `// return x`
- **Wrong array method**: `.push()` → `.pop()`
- **Off-by-one in loop**: `< length` → `<= length`
- **Wrong operator**: `+` → `-`
- **Missing declaration**: Removes `let`/`const`/`var`
- **Wrong increment**: `++` → `--`

### 3. Player Experience

#### In the Match:
1. Players enter the competitive match
2. A prominent **Bug Hunt banner** appears explaining the challenge
3. The code editor is pre-filled with buggy code
4. **Copy/Paste is disabled** - players must manually edit
5. Players can Run code to test with sample inputs
6. Players must Submit when all bugs are fixed

#### UI Features:
```
🐛 Bug Hunt Challenge
The code below contains bugs! Find and fix all errors to make it pass 
the test cases. Copy/Paste is disabled - you must manually edit the code.
```

### 4. Validation
When a player submits:
- The code is tested against all test cases
- If any test case fails, submission is rejected with error message
- Players see which test case failed
- Players can fix and resubmit
- First player to fix all bugs and pass all tests wins!

### 5. Scoring
- **Winner**: Fastest to fix all bugs
- **Rating Change**: Based on ELO system
- **XP Bonus**: 
  - Base: 100 XP
  - Time bonus: Faster completion = more XP
  - No-hints bonus: +50 XP if no hints used

## Example Buggy Code

### Original (Correct):
```python
n = int(input())
result = 1
for i in range(1, n + 1):
    result *= i
print(result)
```

### After Bug Generation:
```python
n = int(input())
result = 1
for i in range(n + 1):  # BUG: Missing starting 1
    result *= i
# print(result)  # BUG: Commented out
```

Players must identify:
1. Off-by-one error in range
2. Commented print statement

## Testing Bug Hunt Mode

### Setup:
1. Make sure problems have `referenceCode` field:
   ```bash
   python seed_problems.py
   ```

2. Start the backend:
   ```bash
   cd PROEDUVATE-CODEING-MODULE
   ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
   ```

3. Start the frontend:
   ```bash
   npm run devv
   ```

### Create a Bug Hunt Match:

**Using API (Postman/Curl):**
```json
POST /competitive/matches
{
  "problem_id": "problem_id_here",
  "player1_id": "user_id_1",
  "player2_id": "user_id_2",
  "time_limit_seconds": 1800,
  "game_mode": "bug_hunt"
}
```

**Using Competitive Mode UI:**
1. Navigate to Competitive page
2. Select "Bug Hunt" mode
3. Click "Find Match"
4. System pairs you with opponent
5. Both players see buggy code
6. Race to fix bugs!

## Backend API Flow

### Match Creation (`POST /competitive/matches`):
```python
if match_in.game_mode == "bug_hunt":
    # Get reference code from problem
    reference_code = problem.get("referenceCode", {}).get("python", "")
    
    # Generate buggy code
    if reference_code:
        buggy_code_content = generate_buggy_code(reference_code, "python")
    
    # Store in match document
    match_doc["buggy_code"] = buggy_code_content
```

### Submission (`POST /competitive/matches/{match_id}/submit`):
```python
if game_mode == "bug_hunt":
    # Test against all test cases
    for test_case in test_cases:
        result = await code_executor.execute_code(
            submission.code,
            submission.language,
            test_case.get("input", "")
        )
        
        if not result["success"] or output != expected:
            raise HTTPException(400, "Code still has bugs!")
```

### Retrieve Match (`GET /competitive/matches/{match_id}`):
```javascript
// Frontend receives match data including buggy_code
{
  "game_mode": "bug_hunt",
  "buggy_code": "n = int(input())\n# print(n * 2)",
  "player1": {...},
  "player2": {...}
}
```

## Tips for Players

1. **Read Carefully**: Bugs are subtle - read each line
2. **Check Syntax**: Look for missing colons, brackets, semicolons
3. **Test Logic**: Verify loop ranges and conditions
4. **Run Tests**: Use the Run button to test with examples
5. **Common Patterns**: Watch for off-by-one, wrong operators, commented code
6. **Time Management**: Balance speed with accuracy

## Configuration

### Adjust Bug Difficulty:
In `app/routers/competitive.py`, modify:
```python
max_bugs = min(3, max(1, len([l for l in lines if l.strip()]) // 4))
# Adjust divisor to increase/decrease bug count
```

### Add Custom Bug Patterns:
```python
bug_types = [
    # Add your custom bug pattern
    lambda line: line.replace('your_pattern', 'buggy_pattern'),
    # ...
]
```

## Troubleshooting

### No Buggy Code Displayed:
- Check if problem has `referenceCode` field
- Verify `game_mode` is set to "bug_hunt"
- Check browser console for errors

### Bugs Too Easy/Hard:
- Adjust `max_bugs` calculation
- Modify bug_types list in `generate_buggy_code()`

### Frontend Issues:
- Clear browser cache
- Check if `match.buggy_code` is populated
- Verify CompetitiveMatch component receives data

## Future Enhancements

- [ ] Bug difficulty levels (easy/medium/hard)
- [ ] Category-specific bugs (syntax vs logic vs runtime)
- [ ] Bug hints that highlight problematic lines
- [ ] Statistics on most common bugs missed
- [ ] Multi-language support for more languages
- [ ] Custom bug patterns per problem
- [ ] Bug replay/explanation after match

---

**Ready to hunt some bugs?** 🐛🔍
