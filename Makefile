# CodoAI Platform Makefile
# Provides convenient commands for Docker management

.PHONY: help build start stop restart logs clean test prod dev

# Default target
help:
	@echo "🚀 CodoAI Platform Management"
	@echo ""
	@echo "Available commands:"
	@echo "  make build      - Build all Docker images"
	@echo "  make start      - Start all services"
	@echo "  make stop       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - View logs from all services"
	@echo "  make clean      - Clean up containers and volumes"
	@echo "  make test       - Run health checks"
	@echo "  make prod       - Start in production mode"
	@echo "  make dev        - Start in development mode"
	@echo ""
	@echo "Service-specific commands:"
	@echo "  make logs-frontend   - Frontend logs only"
	@echo "  make logs-backend    - Backend logs only"
	@echo "  make logs-judge      - Judge logs only"
	@echo "  make logs-mongodb    - MongoDB logs only"
	@echo ""

# Build all images
build:
	@echo "🏗️ Building CodoAI Platform..."
	docker-compose build

# Start services
start:
	@echo "🚀 Starting CodoAI Platform..."
	@if [ ! -f .env ]; then \
		echo "📋 Creating .env from example..."; \
		cp .env.example .env; \
		echo "⚠️  Please edit .env file with your configuration!"; \
		exit 1; \
	fi
	docker-compose up -d
	@echo "✅ Platform started! Check status with: make status"

# Stop services  
stop:
	@echo "🛑 Stopping CodoAI Platform..."
	docker-compose down

# Restart services
restart: stop start

# View all logs
logs:
	docker-compose logs -f

# Service-specific logs
logs-frontend:
	docker-compose logs -f frontend

logs-backend:
	docker-compose logs -f backend

logs-judge:
	docker-compose logs -f codoai-judge

logs-mongodb:
	docker-compose logs -f mongodb

# Clean up everything
clean:
	@echo "🧹 Cleaning up CodoAI Platform..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	docker volume prune -f

# Complete cleanup (removes images too)
clean-all: clean
	@echo "🗑️ Removing all CodoAI images..."
	docker images | grep codoai | awk '{print $$3}' | xargs docker rmi -f || true

# Health checks
test:
	@echo "🔍 Running health checks..."
	@echo "Testing Frontend..."
	@curl -f http://localhost/health > /dev/null 2>&1 && echo "✅ Frontend: Healthy" || echo "❌ Frontend: Unhealthy"
	@echo "Testing Backend..."
	@curl -f http://localhost:8000/ > /dev/null 2>&1 && echo "✅ Backend: Healthy" || echo "❌ Backend: Unhealthy"  
	@echo "Testing Judge..."
	@curl -f http://localhost:8888/health > /dev/null 2>&1 && echo "✅ Judge: Healthy" || echo "❌ Judge: Unhealthy"

# Production mode
prod:
	@echo "🏭 Starting CodoAI in Production mode..."
	@if [ ! -f .env ]; then \
		echo "📋 Creating .env from example..."; \
		cp .env.example .env; \
		echo "⚠️  Please edit .env file with your configuration!"; \
		exit 1; \
	fi
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
	@echo "✅ Production mode started!"

# Development mode
dev:
	@echo "🛠️ Starting CodoAI in Development mode..."
	@if [ ! -f .env ]; then \
		echo "📋 Creating .env from example..."; \
		cp .env.example .env; \
		echo "⚠️  Please edit .env file with your configuration!"; \
	fi
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Check service status
status:
	@echo "📊 CodoAI Platform Status:"
	docker-compose ps

# Update images
update:
	@echo "📦 Updating CodoAI Platform..."
	docker-compose pull
	docker-compose up -d --build

# Show resource usage
stats:
	@echo "📈 Resource Usage:"
	docker stats --no-stream

# Execute shell in services
shell-backend:
	docker-compose exec backend bash

shell-judge:
	docker-compose exec codoai-judge sh

shell-mongodb:
	docker-compose exec mongodb mongosh

# Database operations
db-backup:
	@echo "💾 Creating database backup..."
	mkdir -p backups
	docker-compose exec -T mongodb mongodump --archive > backups/mongodb-backup-$(shell date +%Y%m%d-%H%M%S).archive
	@echo "✅ Backup created in backups/ directory"

db-restore:
	@echo "📥 Restoring database..."
	@read -p "Enter backup file path: " backup_file; \
	docker-compose exec -T mongodb mongorestore --archive < $$backup_file
	@echo "✅ Database restored"

# Code execution test
test-execution:
	@echo "🧪 Testing code execution..."
	@curl -X POST http://localhost:8000/execute/run \
		-H "Content-Type: application/json" \
		-d '{"code":"print(\"Hello CodoAI!\")", "language":"python"}' \
		| grep -q "Hello CodoAI!" && echo "✅ Code execution: Working" || echo "❌ Code execution: Failed"