# Docker Troubleshooting Guide for CodoAI Platform

## 🐳 **Current Issue: Docker Desktop Connectivity**

**Error:** `request returned 500 Internal Server Error for API route`

This indicates Docker Desktop daemon is not running properly or there's a connectivity issue.

## 🔧 **Solutions to Try:**

### **1. Restart Docker Desktop**
```cmd
# Close Docker Desktop completely
taskkill /F /IM "Docker Desktop.exe"

# Restart Docker Desktop from Start Menu
# Wait 2-3 minutes for complete startup
```

### **2. Reset Docker Desktop**
```cmd
# In PowerShell as Administrator
Stop-Service -Name "com.docker.service" -Force
Start-Service -Name "com.docker.service"
```

### **3. Alternative: Manual Service Start**
Since Docker Desktop is having issues, let's start services individually:

#### **Option A: Start Individual Services**
```bash
# 1. Start MongoDB
docker run -d --name codoai-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=codoai123secure \
  mongo:7.0

# 2. Start CodoAI Judge (from previous working setup)
cd codeoai-judge/simple-server
docker-compose up -d

# 3. Start Backend manually (without Docker for now)
cd ../../backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 4. Start Frontend manually (without Docker for now)
cd ../frontend
npm run dev -- --host 0.0.0.0 --port 3000
```

#### **Option B: Use WSL2 Docker**
If Docker Desktop continues to have issues:
```bash
# Install Docker in WSL2
wsl --install Ubuntu
wsl
sudo apt update && sudo apt install docker.io docker-compose
sudo service docker start
```

## 🚀 **Quick Recovery Steps**

### **Immediate Solution: Hybrid Approach**
Since we know the individual components work, let's use this approach:

1. **CodoAI Judge** (Docker - this was working):
   ```cmd
   cd codeoai-judge\simple-server
   docker-compose up -d
   ```

2. **Backend** (Direct Python):
   ```cmd
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --port 8000
   ```

3. **Frontend** (Direct Node.js):
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```

4. **MongoDB** (Docker or local):
   ```cmd
   # If Docker works for MongoDB:
   docker run -d --name mongodb -p 27017:27017 mongo:7.0
   
   # Or install MongoDB locally
   ```

## 🔍 **Diagnostic Commands**

```cmd
# Check Docker Desktop status
docker version
docker info

# Check running containers
docker ps

# Check Docker Desktop services
Get-Service | Where-Object {$_.Name -like "*docker*"}

# Check Docker Desktop logs
# Go to Docker Desktop → Troubleshoot → Export logs
```

## ✅ **Verification Steps**

Once services are running, test:
```bash
# Test Judge
curl http://localhost:8888/health

# Test Backend
curl http://localhost:8000/

# Test Frontend
curl http://localhost:3000
```

## 🎯 **Next Steps**

1. **Try restarting Docker Desktop first**
2. **If Docker Desktop works, use the full docker-compose.yml**
3. **If Docker Desktop still has issues, use the hybrid approach above**
4. **We can revisit the full Docker setup once Docker Desktop is stable**

The platform will work perfectly in hybrid mode - you'll have all the same functionality!