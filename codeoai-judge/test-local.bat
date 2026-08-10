@echo off
REM CodoAI Judge Local Testing Script
echo.
echo 🧪 CodoAI Judge Local Testing
echo ==============================
echo.

REM Check if Docker Desktop is running
echo 📋 Step 1: Checking Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop is not running!
    echo 💡 Please start Docker Desktop and wait for it to fully load, then run this script again.
    pause
    exit /b 1
)
echo ✅ Docker is running

REM Build the image
echo.
echo 📋 Step 2: Building CodoAI Judge image...
docker build -t codoai/codoai-judge:latest .
if %errorlevel% neq 0 (
    echo ❌ Failed to build Docker image
    pause
    exit /b 1
)
echo ✅ Image built successfully

REM Check image size
echo.
echo 📋 Step 3: Checking image size...
for /f "tokens=*" %%i in ('docker images codoai/codoai-judge:latest --format "{{.Size}}"') do set IMAGE_SIZE=%%i
echo 📊 CodoAI Judge image size: %IMAGE_SIZE%

REM Start services
echo.
echo 📋 Step 4: Starting services...
docker-compose down >nul 2>&1
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start services
    pause
    exit /b 1
)
echo ✅ Services started

REM Wait for services to be ready
echo.
echo 📋 Step 5: Waiting for services to initialize...
timeout /t 10 /nobreak >nul
echo ✅ Services should be ready

REM Check service status
echo.
echo 📋 Step 6: Checking service status...
docker-compose ps

REM Initialize database
echo.
echo 📋 Step 7: Initializing database...
docker-compose exec -T server rails db:create db:migrate db:seed
if %errorlevel% neq 0 (
    echo ⚠️  Database initialization may have failed, but continuing...
)
echo ✅ Database initialization attempted

REM Test API endpoints
echo.
echo 📋 Step 8: Testing API endpoints...

REM Test languages endpoint
echo 🔍 Testing /languages endpoint...
curl -s "http://localhost:2358/languages" > test_languages.json
if %errorlevel% equ 0 (
    echo ✅ Languages endpoint working
) else (
    echo ❌ Languages endpoint failed
)

REM Test health endpoint
echo 🔍 Testing /health endpoint...
curl -s "http://localhost:2358/health"
if %errorlevel% equ 0 (
    echo ✅ Health endpoint working
) else (
    echo ❌ Health endpoint failed
)

echo.
echo 📋 Step 9: Running test submissions...

REM Test C code
echo 🔍 Testing C submission...
curl -X POST "http://localhost:2358/submissions" ^
  -H "Content-Type: application/json" ^
  -d "{\"language_id\": 1, \"source_code\": \"#include<stdio.h>\nint main(){\n  printf(\\\"Hello C!\\\");\n  return 0;\n}\", \"wait\": true}" > test_c.json 2>nul

REM Test C++ code
echo 🔍 Testing C++ submission...
curl -X POST "http://localhost:2358/submissions" ^
  -H "Content-Type: application/json" ^
  -d "{\"language_id\": 2, \"source_code\": \"#include<iostream>\nint main(){\n  std::cout<<\\\"Hello C++!\\\";\n  return 0;\n}\", \"wait\": true}" > test_cpp.json 2>nul

REM Test Python code
echo 🔍 Testing Python submission...
curl -X POST "http://localhost:2358/submissions" ^
  -H "Content-Type: application/json" ^
  -d "{\"language_id\": 4, \"source_code\": \"print('Hello Python!')\", \"wait\": true}" > test_python.json 2>nul

REM Test JavaScript code
echo 🔍 Testing JavaScript submission...
curl -X POST "http://localhost:2358/submissions" ^
  -H "Content-Type: application/json" ^
  -d "{\"language_id\": 5, \"source_code\": \"console.log('Hello JavaScript!')\", \"wait\": true}" > test_js.json 2>nul

echo.
echo 🎉 Testing completed!
echo.
echo 📊 Test Results:
echo ================
echo 🌐 API available at: http://localhost:2358
echo 📁 Test result files created:
echo   - test_languages.json (supported languages)
echo   - test_c.json (C test result)
echo   - test_cpp.json (C++ test result) 
echo   - test_python.json (Python test result)
echo   - test_js.json (JavaScript test result)
echo.
echo 💡 Next steps:
echo 1. Check test result files for successful executions
echo 2. Test manual submissions via browser or Postman
echo 3. Monitor logs: docker-compose logs -f
echo 4. Stop services: docker-compose down
echo.
pause