#!/bin/bash
# CodoAI Platform Monitoring Script

set -e

echo "🔍 CodoAI Platform Monitor"
echo "=========================="
echo ""

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service_name... "
    
    if response=$(curl -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            echo "✅ Healthy ($response)"
            return 0
        else
            echo "⚠️  Unexpected status ($response)"
            return 1
        fi
    else
        echo "❌ Unreachable"
        return 1
    fi
}

# Function to check container status
check_container() {
    local container_name=$1
    echo -n "Checking container $container_name... "
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        echo "✅ Running"
        return 0
    else
        echo "❌ Not running"
        return 1
    fi
}

# Function to show resource usage
show_resources() {
    echo ""
    echo "📊 Resource Usage:"
    echo "=================="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" | grep -E "(CONTAINER|codoai-|mongodb)"
}

# Function to test code execution
test_execution() {
    echo ""
    echo "🧪 Testing Code Execution:"
    echo "========================="
    
    # Test Python
    echo -n "Python execution... "
    if response=$(curl -s -X POST http://localhost:8000/execute/run \
        -H "Content-Type: application/json" \
        -d '{"code":"print(\"Test successful\")", "language":"python"}' 2>/dev/null); then
        
        if echo "$response" | grep -q "Test successful"; then
            echo "✅ Working"
        else
            echo "⚠️  Response received but output unexpected"
        fi
    else
        echo "❌ Failed"
    fi
    
    # Test JavaScript
    echo -n "JavaScript execution... "
    if response=$(curl -s -X POST http://localhost:8000/execute/run \
        -H "Content-Type: application/json" \
        -d '{"code":"console.log(\"JS Test successful\")", "language":"javascript"}' 2>/dev/null); then
        
        if echo "$response" | grep -q "JS Test successful"; then
            echo "✅ Working"
        else
            echo "⚠️  Response received but output unexpected"
        fi
    else
        echo "❌ Failed"
    fi
}

# Main monitoring
echo "🐳 Container Status:"
echo "==================="
check_container "codoai-frontend"
check_container "codoai-backend"
check_container "codoai-judge"
check_container "codoai-mongodb"

echo ""
echo "🌐 Service Health:"
echo "=================="
check_service "Frontend" "http://localhost/health"
check_service "Backend" "http://localhost:8000/"
check_service "Judge" "http://localhost:8888/health"

# Show resource usage
show_resources

# Test code execution
test_execution

echo ""
echo "📋 Full Status:"
echo "=============="
docker-compose ps

echo ""
echo "🏁 Monitoring complete!"
echo ""
echo "💡 Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Restart services: docker-compose restart"
echo "   Stop platform: docker-compose down"