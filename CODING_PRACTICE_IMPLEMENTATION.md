# Coding Practice Session - 4 Rounds Implementation

## Overview
Complete implementation of a 4-round coding practice system with AWS Lambda code execution, debugging challenges, and automated test case validation.

## Round Structure

### 🎯 Round 1: Reference & Exercise
- **Purpose**: Learn the pattern by studying and typing reference code
- **Features**:
  - Display reference code with toggle show/hide
  - Line-by-line explanations
  - Progress tracking based on code length
- **Student Action**: Study the reference and type the solution

### 🐛 Round 2: Debug the Code
- **Purpose**: Develop debugging skills by fixing intentional bugs
- **Features**:
  - Pre-filled buggy code
  - "Test Run" button for live code execution
  - Sample test case display
  - Execution output showing errors/success
  - Debugging hints
- **Student Action**: Find and fix bugs, verify with test runs

### ⌨️ Round 3: Blind Typing
- **Purpose**: Test understanding and muscle memory
- **Features**:
  - No reference code visible
  - Only problem requirements shown
  - Clean slate for typing from memory
- **Student Action**: Write complete solution from memory

### ✅ Round 4: Test Cases & Final Submission
- **Purpose**: Validate correctness with comprehensive testing
- **Features**:
  - Display all test cases
  - "Run All Tests" button
  - Detailed test results with pass/fail status
  - Comparison of expected vs actual output
  - Final submission only allowed when all tests pass
- **Student Action**: Run tests, fix any issues, submit final answer

## Backend Implementation

### Code Execution Service (`app/services/code_executor.py`)
- AWS Lambda integration for secure code execution
- Support for Python, C++, and Java
- Individual code execution with input/output
- Batch test case execution
- Timeout handling and error management

### API Endpoints (`app/routers/execute.py`)

#### POST `/execute/run`
Execute code with single input
```json
{
  "code": "string",
  "language": "python|cpp|java",
  "test_input": "string",
  "timeout": 10
}
```

#### POST `/execute/test`
Run multiple test cases
```json
{
  "code": "string",
  "language": "python|cpp|java",
  "test_cases": [
    {"id": 1, "input": "2 3", "expected": "5"}
  ]
}
```

#### POST `/execute/validate`
Validate syntax without full execution

### Problem Schema Updates (`app/schemas/problem.py`)
- Added `buggyCode` field for Round 2
- Support for multiple languages (python, cpp, java)
- Sample test cases with input/expected output

## Frontend Implementation

### Workspace Component (`src/pages/Workspace.jsx`)
- Dynamic UI based on current round
- Round-specific instructions and tools
- Live code execution integration
- Test result visualization
- Progress tracking across all rounds

### Key Features:
1. **Round Navigation**: Click R1-R4 buttons to switch rounds
2. **Language Selection**: Switch between Python, C++, Java
3. **Real-time Execution**: Test code during debugging (R2)
4. **Test Validation**: Run all tests before submission (R4)
5. **Progress Tracking**: Visual indicators for completion
6. **Time Tracking**: Per-round and overall time measurement

## Configuration

### Environment Variables (`.env`)
```env
# MongoDB
MONGODB_URI=mongodb+srv://proeduvate:martin123@cluster0.rtl8a.mongodb.net/lms_portal?retryWrites=true&w=majority
MONGODB_DB_NAME=lms_portal

# Google API
GOOGLE_API_KEY=YOUR_API_KEY_HERE

# AWS Configuration
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_LAMBDA_FUNCTION_NAME=python-code-executor

# JWT
JWT_SECRET=supersecretchangeit
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Installation

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Start Backend
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Start Frontend
```bash
npm run dev
```

## Problem Structure Example

```javascript
{
  id: 1,
  title: "Sum of Two Numbers",
  difficulty: "Easy",
  topics: ["basics", "I/O"],
  videoUrl: "https://example.com/tutorial",
  referenceCode: {
    python: "def sum_two_numbers(a, b):\n    return a + b\n...",
    cpp: "int sum_two_numbers(int a, int b) { return a + b; }",
    java: "public static int sumTwoNumbers(int a, int b) { return a + b; }"
  },
  buggyCode: {
    python: "def sum_two_numbers(a, b):\n    return a - b  # Bug!",
    cpp: "int sum_two_numbers(int a, int b) { return a - b; }",
    java: "public static int sumTwoNumbers(int a, int b) { return a - b; }"
  },
  explanations: {
    python: [
      "Define a function that returns the sum",
      "Read two integers from input",
      "Print the result"
    ],
    cpp: [...],
    java: [...]
  },
  sampleTests: [
    { id: 1, input: "2 3", expected: "5" },
    { id: 2, input: "10 -4", expected: "6" }
  ]
}
```

## AWS Lambda Setup

Your AWS Lambda function should:
1. Accept payload: `{code, language, input, timeout}`
2. Execute code in secure sandbox
3. Return: `{success, output, error, execution_time}`

Example Lambda handler structure:
```python
def lambda_handler(event, context):
    code = event['code']
    language = event['language']
    test_input = event['input']
    
    # Execute code securely
    # Capture output/errors
    
    return {
        'success': True,
        'output': 'result',
        'error': '',
        'execution_time': 0.5
    }
```

## Features Summary

✅ **Complete 4-Round System**
- R1: Reference learning with explanations
- R2: Interactive debugging with live execution
- R3: Memory-based blind typing
- R4: Comprehensive test validation

✅ **Code Execution**
- AWS Lambda integration
- Multi-language support (Python, C++, Java)
- Secure sandboxed execution
- Error handling and timeouts

✅ **Test Validation**
- Automated test case running
- Detailed pass/fail feedback
- Expected vs actual comparison
- Submission gating (R4 requires passing tests)

✅ **Progress Tracking**
- Per-round completion status
- Time tracking for each round
- Overall progress visualization
- Leaderboard integration

✅ **User Experience**
- Intuitive round navigation
- Context-appropriate UI per round
- Real-time feedback
- Mobile-responsive design

## Next Steps

1. **Deploy AWS Lambda**: Set up the code execution function
2. **Test All Rounds**: Verify each round's functionality
3. **Add More Problems**: Expand the problem set with buggy code variants
4. **Enhanced Analytics**: Track student performance across rounds
5. **Hints System**: Add progressive hints for R2 debugging
6. **Code Diff**: Show differences between student and reference code
7. **Video Integration**: Link to explanation videos per round

## Support

For issues or questions about the implementation, check:
- Backend logs: `uvicorn` output
- Frontend console: Browser DevTools
- AWS CloudWatch: Lambda execution logs
- MongoDB: Database connection status
