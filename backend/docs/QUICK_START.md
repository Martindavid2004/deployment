# 🚀 Quick Start Guide

## Prerequisites
- Python 3.10+ installed
- Node.js 16+ installed
- AWS Lambda function deployed (for code execution)
- MongoDB Atlas account (credentials already configured)

## Step 1: Install Dependencies

### Windows
```cmd
setup.bat
```

### Linux/Mac
```bash
bash setup.sh
```

### Or manually:
```bash
# Python dependencies
python -m pip install -r requirements.txt

# Node dependencies
npm install
```

## Step 2: Environment Configuration

Your `.env` file is already configured with:
- ✅ MongoDB connection (lms_portal database)
- ✅ AWS Lambda credentials
- ✅ Google API key
- ✅ JWT settings

## Step 3: Start the Application

### Terminal 1 - Start Backend
```bash
cd C:\Users\kitty\OneDrive\Documents\Codo-AI\PROEDUVATE-CODEING-MODULE
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000

### Terminal 2 - Start Frontend
```bash
cd C:\Users\kitty\OneDrive\Documents\Codo-AI\PROEDUVATE-CODEING-MODULE
npm run dev
```

Frontend will be available at: http://localhost:5173

## Step 4: Test the 4-Round System

1. **Login/Register** at http://localhost:5173
2. **Navigate to Problems** page
3. **Click on a problem** (e.g., "Sum of Two Numbers")
4. **Test Each Round:**

### Round 1: Reference & Exercise
- See reference code on the right
- Type solution in the editor
- Toggle reference visibility
- Click "Complete Round"

### Round 2: Debug the Code
- Editor starts with buggy code
- Click "Test Run" to see the error
- Fix the bug (change `-` to `+`)
- Click "Test Run" again to verify
- Click "Complete Round" when working

### Round 3: Blind Typing
- No reference visible
- Type solution from memory
- Click "Complete Round"

### Round 4: Test Cases & Submission
- See all test cases
- Click "Run All Tests"
- View pass/fail results
- Click "Submit Final Answer" (enabled only when all tests pass)

## API Endpoints

### Authentication
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login and get JWT token

### Problems
- GET `/problems` - List all problems
- GET `/problems/{id}` - Get specific problem

### Code Execution (🆕)
- POST `/execute/run` - Execute code with input
- POST `/execute/test` - Run all test cases
- POST `/execute/validate` - Validate syntax

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID> /F
```

### Frontend won't start
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### AWS Lambda Issues
- Verify AWS credentials in `.env`
- Check Lambda function name: `python-code-executor`
- Test Lambda directly in AWS console
- Review CloudWatch logs for errors

### MongoDB Connection Issues
- Verify MongoDB URI in `.env`
- Check network connectivity
- Ensure IP is whitelisted in MongoDB Atlas

## Features Implemented

✅ **4-Round Coding Practice**
- R1: Reference & Exercise
- R2: Debug the Code (with live execution)
- R3: Blind Typing
- R4: Test Cases & Final Submission

✅ **Code Execution**
- AWS Lambda integration
- Support for Python, C++, Java
- Real-time output
- Error handling

✅ **Test Validation**
- Automated test running
- Pass/fail feedback
- Expected vs actual comparison

✅ **Progress Tracking**
- Per-round timing
- Overall progress
- Completion status

## Documentation

- `IMPLEMENTATION_SUMMARY.md` - Complete implementation overview
- `CODING_PRACTICE_IMPLEMENTATION.md` - Detailed technical documentation
- `README.md` - Original project documentation

## Support

If you encounter issues:
1. Check browser console for frontend errors
2. Check terminal for backend errors
3. Verify all environment variables are set
4. Ensure AWS Lambda function is deployed
5. Test MongoDB connection

## Next Steps

1. Deploy AWS Lambda function if not already done
2. Test all 4 rounds with different problems
3. Add more problems with buggy code variants
4. Customize UI themes and styles
5. Add analytics and reporting

---

**Happy Coding! 🎉**
