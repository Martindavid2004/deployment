#!/bin/bash
# CodoAI Platform Test Script

echo "🧪 Testing CodoAI Platform..."

# Wait for services to be ready
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Test MongoDB
echo "📊 Testing MongoDB..."
docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" || echo "❌ MongoDB failed"

# Test Judge API
echo "⚡ Testing CodoAI Judge..."
curl -f http://localhost:8888/health || echo "❌ Judge API failed"

# Test Backend API  
echo "🔧 Testing Backend API..."
curl -f http://localhost:8000/ || echo "❌ Backend API failed"

# Test Frontend
echo "🌐 Testing Frontend..."
curl -f http://localhost/health || echo "❌ Frontend failed"

# Test code execution
echo "🐍 Testing Python execution..."
curl -X POST http://localhost:8000/execute/run \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello Docker CodoAI!\")", "language":"python"}' \
  | jq '.success' || echo "❌ Code execution failed"

# Test C++ execution
echo "⚙️ Testing C++ execution..."
curl -X POST http://localhost:8000/execute/run \
  -H "Content-Type: application/json" \
  -d '{"code":"#include<iostream>\nint main(){std::cout<<\"C++ Works!\";return 0;}", "language":"cpp"}' \
  | jq '.success' || echo "❌ C++ execution failed"

echo ""
echo "✅ Platform testing complete!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend: http://localhost:8000"
echo "⚡ Judge: http://localhost:8888"