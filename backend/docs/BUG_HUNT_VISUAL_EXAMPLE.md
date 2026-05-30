# 🐛 Bug Hunt Mode - Visual Example

## Example Match Flow

### 1️⃣ Match Creation
```
Player selects: Bug Hunt Mode
Problem: "Factorial"
↓
System loads referenceCode:
```
```python
n = int(input())
result = 1
for i in range(1, n + 1):
    result *= i
print(result)
```

### 2️⃣ Bug Generation
```
generate_buggy_code() introduces bugs:
↓
Randomly selects 2-3 bugs to introduce
```

### 3️⃣ Player Sees Buggy Code
```
┌─────────────────────────────────────────────────────────┐
│  🐛 Bug Hunt Challenge                                  │
│  The code below contains bugs! Find and fix all errors  │
│  to make it pass the test cases.                        │
│  ⚠️ Copy/Paste is disabled - you must manually edit    │
└─────────────────────────────────────────────────────────┘

📝 Editor:
┌─────────────────────────────────────────────────────────┐
│ n = int(input())                                        │
│ result = 1                                              │
│ for i in range(n + 1)         ← 🐛 Missing colon!      │
│     result *= i                                         │
│ # print(result)                 ← 🐛 Commented out!    │
└─────────────────────────────────────────────────────────┘
```

### 4️⃣ Player Fixes Bugs
```
Before Fix:                    After Fix:
for i in range(n + 1)    →     for i in range(n + 1):
# print(result)          →     print(result)
```

### 5️⃣ Player Tests
```
┌─────────────────────────────────────────────────────────┐
│ [▶ Run]  [Submit Solution]                              │
└─────────────────────────────────────────────────────────┘

Output:
🧪 Sample Test Result:

Input:
5

Expected Output:
120

Your Output:
SyntaxError: invalid syntax (line 3)

Status: ❌ FAILED

💡 This is just a sample test. Fix errors and try again!
```

### 6️⃣ After Fixing First Bug
```
for i in range(n + 1):  ✓ (colon added)
# print(result)          ✗ (still commented)

Output:
🧪 Sample Test Result:

Input:
5

Expected Output:
120

Your Output:
(no output)

Status: ❌ FAILED

💡 This is just a sample test. Fix errors and try again!
```

### 7️⃣ After Fixing All Bugs
```
for i in range(n + 1):  ✓
print(result)           ✓

Output:
🧪 Sample Test Result:

Input:
5

Expected Output:
120

Your Output:
120

Status: ✅ PASSED

💡 This is just a sample test. Submit to run all test cases!
```

### 8️⃣ Final Submission
```
Player clicks [Submit Solution]
↓
Backend tests against ALL test cases:
  Test 1: n=5  → Expected: 120   → ✅ PASSED
  Test 2: n=0  → Expected: 1     → ✅ PASSED
  Test 3: n=1  → Expected: 1     → ✅ PASSED
  Test 4: n=7  → Expected: 5040  → ✅ PASSED
↓
✅ All tests passed!
Player marked as completed
Time: 3m 42s
```

### 9️⃣ Match Result
```
┌─────────────────────────────────────────────────────────┐
│  🏆 Match Complete!                                      │
│                                                          │
│  Winner: Player1 (You)                                   │
│  Time: 3m 42s                                            │
│                                                          │
│  Opponent: Player2                                       │
│  Status: Still debugging...                              │
│                                                          │
│  Rewards:                                                │
│  +100 XP (Base)                                          │
│  +30 XP (Speed Bonus)                                    │
│  +50 XP (No Hints Used)                                  │
│  ═════════════                                           │
│  Total: +180 XP                                          │
│                                                          │
│  Rating: +24 points                                      │
└─────────────────────────────────────────────────────────┘
```

## Real Bug Examples

### Example 1: Easy Bugs
```python
# ORIGINAL (Correct)
a = int(input())
b = int(input())
print(a + b)

# BUGGY VERSION
a = int(input())
b = int(input())
print(a * b)              # 🐛 Wrong operator

# PLAYER MUST FIX: Change * back to +
```

### Example 2: Medium Bugs
```python
# ORIGINAL (Correct)
n = int(input())
if n % 2 == 0:
    print('Even')
else:
    print('Odd')

# BUGGY VERSION
n = int(input())
if n % 2 == 0
    print('Even')         # 🐛 Missing colon above
else:
    print('Odd')

# PLAYER MUST FIX: Add : after if condition
```

### Example 3: Hard Bugs
```python
# ORIGINAL (Correct)
arr = [1, 2, 3, 4, 5]
for i in range(len(arr)):
    if arr[i] > 2 and arr[i] < 5:
        print(arr[i])

# BUGGY VERSION
arr = [1, 2, 3, 4, 5]
for i in range(1, len(arr)):    # 🐛 Off-by-one (should start at 0)
    if arr[i] > 2 or arr[i] < 5:  # 🐛 Wrong operator (should be 'and')
        print(arr[i])

# PLAYER MUST FIX:
# 1. Change range(1, len(arr)) to range(len(arr))
# 2. Change 'or' to 'and'
```

### Example 4: Tricky Bugs
```python
# ORIGINAL (Correct)
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

n = int(input())
print(factorial(n))

# BUGGY VERSION
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    # return result          # 🐛 Commented return!

n = int(input())
print(factorial(n))

# PLAYER MUST FIX: Uncomment the return statement
# This is tricky because the code runs but returns None!
```

## JavaScript Example

```javascript
// ORIGINAL (Correct)
function sum(a, b) {
    return a + b;
}

const x = parseInt(input());
const y = parseInt(input());
console.log(sum(x, y));

// BUGGY VERSION
function sum(a, b) {
    return a + b           // 🐛 Missing semicolon
}

x = parseInt(input());     // 🐛 Missing 'const'
const y = parseInt(input());
console.log(sum(x, y));

// PLAYER MUST FIX:
// 1. Add semicolon after return
// 2. Add 'const' before x
```

## UI States

### State 1: Match Lobby
```
┌─────────────────────────────────────┐
│  Select Game Mode:                  │
│  ○ Code Sprint (Standard)           │
│  ● Bug Hunt 🐛                      │
│  ○ Code Shuffle                     │
│  ○ Test Master                      │
│                                     │
│  [Find Match]                       │
└─────────────────────────────────────┘
```

### State 2: In Match
```
┌──────────────────────────────────────────────────────┐
│ 🐛 Bug Hunt | Player1 vs Player2 | Factorial         │
│ ─────────────────────────────────────────────────── │
│ Time Remaining: 26:18     Opponent: In Progress      │
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░ 30%                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌────────────┐ ┌────────────────────────────────┐  │
│ │ Problem    │ │ 🐛 Bug Hunt Challenge          │  │
│ │ Description│ │ The code below contains bugs!  │  │
│ │            │ │                                │  │
│ │ Factorial  │ │ [Editor with buggy code...]    │  │
│ │ Calculate  │ │                                │  │
│ │ n!...      │ │ [▶ Run] [Submit Solution]     │  │
│ └────────────┘ └────────────────────────────────┘  │
│                                                      │
│ Output:                                              │
│ ❌ SyntaxError: Fix the bugs and try again!         │
└──────────────────────────────────────────────────────┘
```

### State 3: Victory
```
┌──────────────────────────────────────────────────────┐
│              🏆 Victory! You Win! 🏆                 │
│                                                      │
│ You fixed all bugs in 3m 42s                         │
│ Opponent is still debugging...                       │
│                                                      │
│ Bugs Found:                                          │
│ ✓ Missing colon after for statement                 │
│ ✓ Commented return statement                        │
│ ✓ Off-by-one error in range                         │
│                                                      │
│ Rewards: +180 XP | +24 Rating                        │
│                                                      │
│ [Return to Lobby] [View Match Replay]                │
└──────────────────────────────────────────────────────┘
```

## Tips Displayed During Match

```
💡 Tip: Check for missing colons (:) after if/for/while statements
💡 Tip: Look for commented code that should be active  
💡 Tip: Verify loop ranges - watch for off-by-one errors
💡 Tip: Check operators - is it + or *? == or =?
💡 Tip: Test your code with Run before submitting!
```

---

**This visual guide shows exactly what players experience in Bug Hunt mode!** 🎮
