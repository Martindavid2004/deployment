#!/bin/bash
# CodoAI Platform Setup Script

set -e

echo "🚀 CodoAI Platform Setup"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking Prerequisites...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        echo "Please install Docker from: https://docker.com"
        exit 1
    fi
    echo "✅ Docker found: $(docker --version)"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        echo "Please install Docker Compose"
        exit 1
    fi
    echo "✅ Docker Compose found: $(docker-compose --version)"
    
    # Check if Docker is running
    if ! docker ps &> /dev/null; then
        echo -e "${RED}❌ Docker daemon is not running${NC}"
        echo "Please start Docker daemon"
        exit 1
    fi
    echo "✅ Docker daemon is running"
    
    echo ""
}

# Function to setup environment
setup_environment() {
    echo -e "${BLUE}⚙️  Setting up Environment...${NC}"
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo "📋 Creating .env file from example..."
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file with your configuration!${NC}"
        echo "   - Change MONGO_PASSWORD to a secure password"
        echo "   - Change JWT_SECRET to a random string"
        echo "   - Add your GOOGLE_API_KEY if you want AI features"
        echo ""
        read -p "Press Enter to continue after editing .env file..."
    else
        echo "✅ .env file already exists"
    fi
    
    # Make scripts executable
    chmod +x start.sh stop.sh monitor.sh test.sh setup.sh 2>/dev/null || true
    echo "✅ Made scripts executable"
    
    echo ""
}

# Function to setup Docker network
setup_network() {
    echo -e "${BLUE}🌐 Setting up Docker Network...${NC}"
    
    # Create network if it doesn't exist
    if ! docker network ls | grep -q codoai-network; then
        docker network create codoai-network
        echo "✅ Created codoai-network"
    else
        echo "✅ Network already exists"
    fi
    
    echo ""
}

# Function to build images
build_images() {
    echo -e "${BLUE}🏗️  Building Docker Images...${NC}"
    echo "This may take a few minutes on first run..."
    echo ""
    
    # Build all images
    docker-compose build --parallel
    
    echo ""
    echo "✅ All images built successfully"
    echo ""
}

# Function to start services
start_services() {
    echo -e "${BLUE}🚀 Starting Services...${NC}"
    
    # Start all services
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    
    # Wait for services
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep -q "Up.*healthy" && \
           curl -s http://localhost:8000/ > /dev/null 2>&1; then
            echo -e "${GREEN}✅ All services are ready!${NC}"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
        
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${RED}❌ Services failed to start within timeout${NC}"
            echo "Check logs with: docker-compose logs"
            exit 1
        fi
    done
    
    echo ""
}

# Function to run tests
run_tests() {
    echo -e "${BLUE}🧪 Running Initial Tests...${NC}"
    
    if [ -f test.sh ]; then
        chmod +x test.sh
        ./test.sh
    else
        echo "⚠️  Test script not found, running basic health checks..."
        
        # Basic health checks
        echo -n "Testing Frontend... "
        curl -f http://localhost/health > /dev/null 2>&1 && echo "✅" || echo "❌"
        
        echo -n "Testing Backend... "
        curl -f http://localhost:8000/ > /dev/null 2>&1 && echo "✅" || echo "❌"
        
        echo -n "Testing Judge... "
        curl -f http://localhost:8888/health > /dev/null 2>&1 && echo "✅" || echo "❌"
        
        echo -n "Testing Code Execution... "
        response=$(curl -s -X POST http://localhost:8000/execute/run \
            -H "Content-Type: application/json" \
            -d '{"code":"print(\"Setup test\")", "language":"python"}' 2>/dev/null)
        
        if echo "$response" | grep -q "Setup test"; then
            echo "✅"
        else
            echo "❌"
        fi
    fi
    
    echo ""
}

# Function to show final information
show_final_info() {
    echo -e "${GREEN}🎉 CodoAI Platform Setup Complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 Access Information:${NC}"
    echo "   🌐 Frontend:     http://localhost"
    echo "   🔧 Backend API:  http://localhost:8000"
    echo "   ⚡ Judge API:    http://localhost:8888"
    echo "   📊 MongoDB:      mongodb://localhost:27017"
    echo ""
    echo -e "${BLUE}📚 Useful Commands:${NC}"
    echo "   View logs:       docker-compose logs -f"
    echo "   Stop platform:   docker-compose down"
    echo "   Restart:         docker-compose restart"
    echo "   Monitor:         ./monitor.sh"
    echo "   Run tests:       ./test.sh"
    echo ""
    echo -e "${BLUE}📖 Documentation:${NC}"
    echo "   Main README:     ./README.md"
    echo "   API Docs:        http://localhost:8000/docs"
    echo ""
    echo -e "${GREEN}✨ Happy Coding with CodoAI!${NC}"
}

# Main setup flow
main() {
    echo "This script will set up the complete CodoAI Platform using Docker."
    echo ""
    read -p "Do you want to continue? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    echo ""
    
    check_prerequisites
    setup_environment
    setup_network
    build_images
    start_services
    run_tests
    show_final_info
}

# Run main function
main "$@"