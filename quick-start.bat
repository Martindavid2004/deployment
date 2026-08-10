@echo off
echo 🚀 CodoAI Quick Start - Hybrid Mode
echo.

echo 🛑 Stopping any running containers...
docker-compose down 2>nul

echo 📊 Starting MongoDB...
docker run -d --name codoai-mongodb-standalone ^
  -p 27017:27017 ^
  -e MONGO_INITDB_ROOT_USERNAME=admin ^
  -e MONGO_INITDB_ROOT_PASSWORD=codoai123secure ^
  mongo:7.0

echo ⚡ Starting CodoAI Judge (Node.js)...
start "CodoAI Judge" cmd /k "cd codeoai-judge\simple-server && node server.js"

timeout /t 3 /nobreak > nul

echo 🔧 Starting Backend (Python)...
start "CodoAI Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak > nul

echo 🌐 Starting Frontend (React)...
start "CodoAI Frontend" cmd /k "cd frontend && npm run dev -- --port 3000"

echo.
echo ✅ CodoAI Platform Starting!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:8000  
echo ⚡ Judge:    http://localhost:8888
echo 📊 MongoDB:  mongodb://localhost:27017
echo.
echo Press any key to view status...
pause > nul

echo.
echo 🔍 Checking Services:
curl -s http://localhost:8888/health 2>nul || echo ❌ Judge not ready yet
curl -s http://localhost:8000/ 2>nul || echo ❌ Backend not ready yet  
curl -s http://localhost:3000/ 2>nul || echo ❌ Frontend not ready yet

echo.
echo 📋 All services should be starting in separate windows!
pause