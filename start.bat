@echo off
REM CodoAI Platform Startup Script for Windows

echo 🚀 Starting CodoAI Platform...

REM Check if .env exists, if not copy from example
if not exist .env (
    echo 📋 Creating .env file from example...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your configuration before running again!
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down --remove-orphans

REM Pull latest images
echo 📦 Pulling latest images...
docker-compose pull

REM Build and start services
echo 🏗️  Building and starting services...
docker-compose up --build -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak > nul

REM Check service health
echo 🔍 Checking service health...
docker-compose ps

echo.
echo ✅ CodoAI Platform Started Successfully!
echo.
echo 🌐 Frontend: http://localhost
echo 🔧 Backend API: http://localhost:8000
echo ⚡ Judge API: http://localhost:8888
echo 📊 MongoDB: mongodb://localhost:27017
echo.
echo 📋 View logs: docker-compose logs -f
echo 🛑 Stop platform: docker-compose down
echo.
pause