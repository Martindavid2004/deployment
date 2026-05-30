@echo off
echo ============================================================
echo Code Shuffle Quick Fix
echo ============================================================
echo.
echo This script will:
echo 1. Seed problems with reference code
echo 2. Verify problems are in database
echo 3. Provide next steps
echo.
pause

cd /d "%~dp0"

echo.
echo [1/2] Seeding problems...
echo.
python seed_problems.py

echo.
echo [2/2] Verifying problems...
echo.
python verify_code_shuffle_problems.py

echo.
echo ============================================================
echo DONE!
echo ============================================================
echo.
echo Next steps:
echo 1. Restart your backend server (Ctrl+C and restart)
echo 2. Refresh your browser
echo 3. Try Code Shuffle mode again
echo.
pause
