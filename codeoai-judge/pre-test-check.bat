@echo off
REM Pre-test verification script for CodoAI Judge

echo.
echo 🔍 CodoAI Judge Pre-Test Verification
echo =====================================
echo.

REM Check if all required files exist
echo 📋 Checking required files...

set FILES_OK=1

if not exist "Dockerfile" (
    echo ❌ Dockerfile missing
    set FILES_OK=0
) else (
    echo ✅ Dockerfile found
)

if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml missing
    set FILES_OK=0
) else (
    echo ✅ docker-compose.yml found
)

if not exist "codoai-judge.conf" (
    echo ❌ codoai-judge.conf missing
    set FILES_OK=0
) else (
    echo ✅ codoai-judge.conf found
)

if not exist "db\languages\codoai_active.rb" (
    echo ❌ Language definitions missing
    set FILES_OK=0
) else (
    echo ✅ Language definitions found
)

if not exist "db\seeds.rb" (
    echo ❌ Database seeder missing
    set FILES_OK=0
) else (
    echo ✅ Database seeder found
)

REM Check Docker installation
echo.
echo 📋 Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not installed
    echo 💡 Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    set FILES_OK=0
) else (
    echo ✅ Docker installed
)

REM Check if Docker is running
echo.
echo 📋 Checking if Docker is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker Desktop is not running
    echo 💡 Please start Docker Desktop and wait for it to fully load
) else (
    echo ✅ Docker is running
)

REM Check available space
echo.
echo 📋 Checking available disk space...
for /f "tokens=3" %%a in ('dir /-c ^| find /i "bytes free"') do set FREE_SPACE=%%a
echo 💾 Available disk space: %FREE_SPACE% bytes

REM Check if curl is available for testing
echo.
echo 📋 Checking curl availability...
curl --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  curl not found - API testing will be limited
    echo 💡 Consider installing curl or use Postman for API testing
) else (
    echo ✅ curl available for API testing
)

echo.
echo 📊 Verification Summary:
echo =======================

if %FILES_OK% equ 1 (
    echo ✅ All required files present
    echo ✅ System ready for testing
    echo.
    echo 🚀 Next step: Run test-local.bat to start testing
) else (
    echo ❌ Some files are missing
    echo 💡 Please ensure all CodoAI Judge files are present
)

echo.
echo 📁 Current directory contents:
dir /b
echo.
pause