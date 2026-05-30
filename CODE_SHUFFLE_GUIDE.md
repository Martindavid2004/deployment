# 🔀 Code Shuffle Mode - Complete Guide

## Overview

**Code Shuffle** is an exciting competitive game mode where players must rearrange shuffled code lines into the correct logical order. This tests code comprehension, logical thinking, and the ability to understand program flow without writing code from scratch.

## Features

### 🎯 Core Functionality

1. **Shuffled Code Lines**: Code from the problem's reference solution is randomly shuffled
2. **Drag & Drop**: Intuitive drag-and-drop interface for reordering lines
3. **Arrow Buttons**: Alternative arrow buttons for keyboard-friendly navigation
4. **Live Preview**: Run and test your arranged code before submitting
5. **Real-time Feedback**: Immediate visual feedback during drag operations
6. **Accuracy Scoring**: 80% minimum accuracy required to pass

## How to Play

### 1. Start a Code Shuffle Match

```bash
# From the Competitive page, select "Code Shuffle" mode
# The system will:
# - Select a problem with reference code
# - Shuffle the code lines randomly
# - Create a match with you and an opponent (or bot)
```

### 2. Arrange the Code

**Option A: Drag & Drop (Recommended)**
- Click and hold the grip icon (⋮⋮) on the left of any line
- Drag the line up or down to the desired position
- Release to drop it in place
- Visual feedback shows where the line will be placed

**Option B: Arrow Buttons**
- Use the ↑ button to move a line up one position
- Use the ↓ button to move a line down one position
- Great for precise, single-step movements

### 3. Test Your Arrangement

- Click **"▶ Run & Preview"** to execute your arranged code
- See the output and compare with expected results
- Test with sample inputs before final submission
- No penalty for testing!

### 4. Submit Your Solution

- Click **"Submit Arrangement"** when you're confident
- System checks accuracy against the correct order
- Minimum 80% accuracy required to pass
- First to submit correctly wins the match!

## User Interface

### Code Line Display

Each line shows:
```
[Drag Handle] [↑/↓ Buttons] [Line #] [Code Content]
    ⋮⋮           ↑ ↓          1       def factorial(n):
```

- **Drag Handle**: Click and hold to drag the line
- **Arrow Buttons**: Move line up or down
- **Line Number**: Current position (updates as you move lines)
- **Code Content**: The actual code (with proper indentation)

### Visual Feedback

- **Dragging**: Line highlights with purple border and shadow
- **Drop Zone**: Background tints purple when hovering
- **Scale Effect**: Dragged line slightly enlarges
- **Smooth Transitions**: All movements are animated

## Scoring System

### Accuracy Calculation

```python
correct_positions = 0
for i in range(len(lines)):
    if your_line[i] == correct_line[i]:
        correct_positions += 1

accuracy = (correct_positions / total_lines) * 100
```

### Requirements

- **Minimum Accuracy**: 80%
- **Example**: For 10-line code, at least 8 lines must be in correct positions
- **Partial Credit**: You get points even if not 100% correct
- **Win Condition**: First player to submit with 80%+ accuracy wins

## Tips & Strategies

### 🧠 Understanding Code Flow

1. **Identify the Structure**
   - Look for function definitions (usually first)
   - Find the main logic blocks
   - Locate return statements (usually last)

2. **Follow Dependencies**
   - Variables must be defined before use
   - Function calls come after definitions
   - Input reading typically comes first

3. **Check Indentation**
   - Python: Indentation shows code blocks
   - Nested code must follow its parent
   - Same indentation level = same block

### ⚡ Quick Wins

1. **Start with Obvious Lines**
   - Function definitions at the top
   - Return statements at the end
   - Main logic in the middle

2. **Use the Test Feature**
   - Run code frequently as you arrange
   - Check for syntax errors
   - Verify logic flow

3. **Look for Patterns**
   - Variable initialization → computation → output
   - Input → process → output
   - Condition check → action

### 🎮 Speed Strategies

1. **Drag for Large Moves**: Use drag-and-drop to move lines across long distances
2. **Arrows for Fine-Tuning**: Use arrow buttons for adjacent swaps
3. **Work Top-Down**: Start organizing from the beginning
4. **Test Early**: Catch mistakes early by testing frequently

## Examples

### Example 1: Simple Factorial

**Shuffled:**
```python
    return result
result = 1
for i in range(1, n + 1):
def factorial(n):
    result *= i
```

**Correct Order:**
```python
def factorial(n):
result = 1
for i in range(1, n + 1):
    result *= i
    return result
```

**Strategy:**
1. Function definition first
2. Initialize variable before loop
3. Loop iterates and modifies variable
4. Return statement last (watch indentation!)

### Example 2: Even/Odd Checker

**Shuffled:**
```python
    print('Odd')
n = int(input())
else:
if n % 2 == 0:
    print('Even')
```

**Correct Order:**
```python
n = int(input())
if n % 2 == 0:
    print('Even')
else:
    print('Odd')
```

**Strategy:**
1. Input reading first
2. If condition before its block
3. Else must follow if
4. Indentation shows block structure

## Technical Details

### Backend Implementation

**Shuffling Algorithm** ([competitive.py](app/routers/competitive.py#L31-L38))
```python
def shuffle_code_lines(code: str) -> List[str]:
    """Shuffle code lines while maintaining logical structure"""
    lines = code.strip().split('\n')
    non_empty_lines = [line for line in lines if line.strip()]
    shuffled = non_empty_lines.copy()
    random.shuffle(shuffled)
    return shuffled
```

**Scoring Algorithm** ([competitive.py](app/routers/competitive.py#L40-L50))
```python
def calculate_code_shuffle_score(original: str, arranged: List[str]) -> int:
    """Calculate score based on correctness"""
    original_lines = [line.strip() for line in original.strip().split('\n') if line.strip()]
    arranged_lines = [line.strip() for line in arranged if line.strip()]
    
    if len(original_lines) != len(arranged_lines):
        return 0
    
    correct = sum(1 for o, a in zip(original_lines, arranged_lines) if o == a)
    return int((correct / len(original_lines)) * 100)
```

### Frontend Implementation

**Drag & Drop Library**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- Modern fork of react-beautiful-dnd
- Smooth animations and touch support
- Accessible keyboard navigation

**Key Components**:
1. `DragDropContext`: Manages drag state
2. `Droppable`: Container for draggable items
3. `Draggable`: Individual code lines

## API Reference

### Create Code Shuffle Match

```http
POST /competitive/matchmaking
Authorization: Bearer <token>
Content-Type: application/json

{
  "game_mode": "code_shuffle",
  "problem_id": "optional_problem_id"
}
```

### Get Match Details

```http
GET /competitive/matches/{match_id}
Authorization: Bearer <token>

Response includes:
- shuffled_lines: Array of shuffled code lines
- problem details with reference code
```

### Submit Arrangement

```http
POST /competitive/matches/{match_id}/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "match_id": "string",
  "code": "string",
  "language": "python",
  "arranged_lines": ["line1", "line2", "line3", ...]
}
```

## Troubleshooting

### Common Issues

**1. Lines Won't Drag**
- Ensure you're clicking the drag handle (⋮⋮)
- Check browser console for errors
- Try arrow buttons as alternative

**2. Accuracy Too Low**
- Compare your arrangement with code logic
- Use Run & Preview to test
- Check indentation carefully

**3. Can't Submit**
- Ensure all lines are arranged
- Check that accuracy is 80%+
- Verify match is still active

**4. Code Doesn't Run**
- Check for syntax errors in arrangement
- Verify indentation is preserved
- Ensure variable dependencies are correct

## Setup Requirements

### Backend
```bash
# Already included in main backend
# No additional setup needed
```

### Frontend
```bash
# Install drag-and-drop library
npm install @hello-pangea/dnd

# Already configured in package.json
```

### Database
```bash
# Problems need reference code
# Run seed script to populate:
python seed_problems.py
```

## Future Enhancements

### Planned Features
- [ ] Hint system (reveal one correct position)
- [ ] Undo/Redo functionality
- [ ] Time bonus for quick solves
- [ ] Multi-language support
- [ ] Difficulty levels (more/fewer lines)
- [ ] Code snippet highlighting
- [ ] Team mode

### Potential Improvements
- [ ] Visual diff showing differences
- [ ] Progressive difficulty (start easy)
- [ ] Code explanation on completion
- [ ] Statistics tracking (avg time, accuracy)
- [ ] Achievement badges

## Related Documentation

- [Competitive Mode Overview](COMPETITIVE_MODE.md)
- [Competitive Mode Quick Start](COMPETITIVE_MODE_QUICKSTART.md)
- [Bug Hunt Mode](BUG_HUNT_MODE.md)
- [Main README](README.md)

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](BUG_HUNT_TROUBLESHOOTING.md)
2. Review match logs in browser console
3. Test with seed problems first
4. Verify backend is running (`http://localhost:8000/docs`)

---

**Happy Code Shuffling! 🔀✨**
