#!/bin/bash
# CodoAI Platform Startup Script

set -e

echo "🚀 Starting CodoAI Platform..."

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "📋 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running again!"
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose pull

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

echo ""
echo "✅ CodoAI Platform Started Successfully!"
echo ""
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:8000"
echo "⚡ Judge API: http://localhost:8888"
echo "📊 MongoDB: mongodb://localhost:27017"
echo ""
echo "📋 View logs: docker-compose logs -f"
echo "🛑 Stop platform: docker-compose down"
echo ""