# 🚀 CodoAI Platform - Complete Docker Setup

**CodoAI** is a complete competitive programming and code execution platform with support for 5 programming languages. This Docker setup provides a one-command deployment solution.

## 🏗️ **Architecture**

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│    Frontend     │     Backend     │   CodoAI Judge  │    Database     │
│   (React/Vite)  │   (FastAPI)     │   (Node.js)     │   (MongoDB)     │
│                 │                 │                 │                 │
│  Port: 80       │  Port: 8000     │  Port: 8888     │  Port: 27017    │
│  Nginx + SPA    │  Python API     │  5 Languages    │  Data Storage   │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## 🎯 **Services**

### **Frontend** - React SPA
- **Technology**: React 18 + Vite + Tailwind CSS
- **Features**: Monaco Editor, Real-time UI, Responsive Design
- **Port**: 80 (HTTP) / 443 (HTTPS)
- **Health Check**: `/health`

### **Backend** - FastAPI Application  
- **Technology**: Python 3.11 + FastAPI + MongoDB
- **Features**: User Auth, Problem Management, Execution API
- **Port**: 8000
- **Health Check**: `/`

### **CodoAI Judge** - Code Execution Engine
- **Technology**: Node.js + Express + Docker
- **Languages**: C, C++, Java, Python, JavaScript  
- **Port**: 8888
- **Health Check**: `/health`

### **Database** - MongoDB
- **Technology**: MongoDB 7.0
- **Features**: User data, Problems, Submissions, Analytics
- **Port**: 27017
- **Authentication**: Username/Password

## 🚀 **Quick Start**

### **1. Prerequisites**
```bash
# Ensure Docker and Docker Compose are installed
docker --version          # Should be 20.0+
docker-compose --version  # Should be 2.0+
```

### **2. Clone and Setup**
```bash
# Navigate to the deployment directory
cd path/to/CodoAi/deployment

# Copy environment configuration
cp .env.example .env

# Edit configuration (see Configuration section below)
nano .env  # or notepad .env on Windows
```

### **3. Start Platform**

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

**Manual:**
```bash
docker-compose up --build -d
```

### **4. Access Platform**
- **🌐 Frontend**: http://localhost
- **🔧 Backend API**: http://localhost:8000
- **⚡ Judge API**: http://localhost:8888  
- **📊 MongoDB**: mongodb://localhost:27017

## ⚙️ **Configuration**

Edit the `.env` file with your specific configuration:

```bash
# Database credentials
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password

# JWT secret (change this!)
JWT_SECRET=your_super_secret_jwt_key

# Google AI API (optional, for AI features)
GOOGLE_API_KEY=your_google_api_key

# AWS credentials (optional, for Lambda execution)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

## 🔧 **Management Commands**

### **Start Services**
```bash
docker-compose up -d                    # Start in background
docker-compose up --build -d            # Rebuild and start
```

### **Stop Services**
```bash
docker-compose down                     # Stop containers
docker-compose down -v                  # Stop and remove volumes
```

### **View Logs**
```bash
docker-compose logs -f                  # All services
docker-compose logs -f frontend         # Frontend only
docker-compose logs -f backend          # Backend only  
docker-compose logs -f codoai-judge     # Judge only
```

### **Service Management**
```bash
docker-compose ps                       # Service status
docker-compose restart backend          # Restart specific service
docker-compose exec backend bash        # Shell into backend
```

### **Development**
```bash
# Hot reload for development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production deployment  
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🧪 **Testing**

### **Health Checks**
```bash
# Test all endpoints
curl http://localhost/health              # Frontend health
curl http://localhost:8000/               # Backend health  
curl http://localhost:8888/health         # Judge health
```

### **Code Execution Test**
```bash
# Test Python execution
curl -X POST http://localhost:8000/execute/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello CodoAI!\")",
    "language": "python"
  }'
```

### **Language Support Test**
```bash
# Get supported languages
curl http://localhost:8888/languages
```

## 🔒 **Security**

### **Production Considerations**
- Change default MongoDB credentials
- Use strong JWT secrets
- Enable HTTPS with SSL certificates
- Set up firewall rules
- Regular security updates

### **Environment Variables**
Never commit `.env` files with real credentials to version control.

## 📊 **Monitoring**

### **Resource Usage**
```bash
docker stats                            # Real-time resource usage
docker-compose top                      # Process information
```

### **Service Health**
All services include health checks that report status:
- **Healthy**: Service is operational
- **Unhealthy**: Service has issues
- **Starting**: Service is initializing

### **Logs and Debugging**
```bash
# Debug specific issues
docker-compose logs --tail=50 backend   # Last 50 lines
docker-compose logs --since=10m         # Last 10 minutes
```

## 🚀 **Production Deployment**

### **1. Server Requirements**
- **CPU**: 4+ cores recommended  
- **RAM**: 8GB+ recommended
- **Storage**: 50GB+ for data persistence
- **Network**: Stable internet for dependencies

### **2. Production Configuration**
```bash
# Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Set up reverse proxy (nginx/traefik)
# Configure SSL certificates
# Set up monitoring (Prometheus/Grafana)
```

### **3. Data Persistence**
Production volumes are mapped to `/opt/codoai/` for persistence across container restarts.

## 🛠️ **Development**

### **Local Development**
For development without Docker:
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend  
cd frontend
npm install
npm run dev

# Judge (requires Docker for compilers)
cd codeoai-judge/simple-server
docker-compose up
```

### **Contributing**
1. Fork the repository
2. Create feature branch
3. Test with Docker setup
4. Submit pull request

## 📚 **API Documentation**

- **Backend API**: http://localhost:8000/docs (Swagger UI)
- **Judge API**: See `codeoai-judge/simple-server/API_DOCUMENTATION.md`

## 🔧 **Troubleshooting**

### **Common Issues**

**Port Conflicts**
```bash
# Check what's using ports
lsof -i :80,:8000,:8888,:27017
netstat -tulpn | grep -E '80|8000|8888|27017'
```

**Service Won't Start**
```bash
# Check logs for errors
docker-compose logs service-name
# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

**Database Connection Issues**
```bash
# Test MongoDB connectivity
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### **Reset Everything**
```bash
# Nuclear option - removes all containers, volumes, networks
docker-compose down -v --remove-orphans
docker system prune -a --volumes
```

## 📞 **Support**

- **Documentation**: Check service-specific README files
- **Issues**: Create GitHub issues for bugs
- **Logs**: Always include relevant log output with issues

---

## 🎉 **About CodoAI**

**CodoAI** provides a complete platform for:
- **🏆 Competitive Programming**: Live matches and tournaments
- **📚 Learning**: Interactive coding tutorials  
- **🔧 Practice**: Multi-language code playground
- **👥 Community**: User rankings and achievements

**Built for developers, by developers.** 🚀

---

*CodoAI Platform - Code at the speed of thought.*