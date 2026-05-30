@echo off
echo ========================================
echo   Problem Database Seeder
echo ========================================
echo.
echo This will add initial problems to your database
echo for competitive mode.
echo.

cd /d "%~dp0"
C:\Users\kitty\OneDrive\Documents\Codo-AI\.venv\Scripts\python.exe seed_problems.py

echo.
echo ========================================
pause
