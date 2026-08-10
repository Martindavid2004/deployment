#!/bin/bash
# CodoAI Platform Comprehensive Test Suite

set -e

echo "🧪 CodoAI Platform Test Suite"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing $test_name... "
    
    if result=$(eval "$test_command" 2>/dev/null); then
        if echo "$result" | grep -q "$expected"; then
            echo -e "${GREEN}✅ PASS${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            echo -e "${YELLOW}⚠️  PARTIAL (unexpected response)${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Wait for services to be ready
wait_for_services() {
    echo "⏳ Waiting for services to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8000/ > /dev/null 2>&1; then
            echo "✅ Services are ready!"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    echo -e "${RED}❌ Services failed to start within timeout${NC}"
    exit 1
}

# Test 1: Service Health Checks
echo -e "${BLUE}🔍 Health Check Tests${NC}"
echo "===================="

run_test "Frontend Health" \
    "curl -s http://localhost/health" \
    "healthy"

run_test "Backend Health" \
    "curl -s http://localhost:8000/" \
    "codoAI Backend API"

run_test "Judge Health" \
    "curl -s http://localhost:8888/health" \
    "CodoAI"

echo ""

# Test 2: API Endpoint Tests
echo -e "${BLUE}🔗 API Endpoint Tests${NC}"
echo "===================="

run_test "Backend Root Endpoint" \
    "curl -s http://localhost:8000/" \
    "running"

run_test "Judge Languages Endpoint" \
    "curl -s http://localhost:8888/languages" \
    "Python"

run_test "Backend Languages Endpoint" \
    "curl -s http://localhost:8000/execute/languages" \
    "supported_by_platform"

echo ""

# Test 3: Code Execution Tests
echo -e "${BLUE}⚡ Code Execution Tests${NC}"
echo "======================="

# Python Test
run_test "Python Execution" \
    'curl -s -X POST http://localhost:8000/execute/run -H "Content-Type: application/json" -d "{\"code\":\"print(\\\"Hello Python\\\")\", \"language\":\"python\"}"' \
    "Hello Python"

# JavaScript Test  
run_test "JavaScript Execution" \
    'curl -s -X POST http://localhost:8000/execute/run -H "Content-Type: application/json" -d "{\"code\":\"console.log(\\\"Hello JavaScript\\\")\", \"language\":\"javascript\"}"' \
    "Hello JavaScript"

# C++ Test
run_test "C++ Execution" \
    'curl -s -X POST http://localhost:8000/execute/run -H "Content-Type: application/json" -d "{\"code\":\"#include<iostream>\\nint main(){std::cout<<\\\"Hello C++\\\";return 0;}\", \"language\":\"cpp\"}"' \
    "Hello C++"

# Java Test
run_test "Java Execution" \
    'curl -s -X POST http://localhost:8000/execute/run -H "Content-Type: application/json" -d "{\"code\":\"public class Main{public static void main(String[] args){System.out.println(\\\"Hello Java\\\");}}\", \"language\":\"java\"}"' \
    "Hello Java"

# C Test
run_test "C Execution" \
    'curl -s -X POST http://localhost:8000/execute/run -H "Content-Type: application/json" -d "{\"code\":\"#include<stdio.h>\\nint main(){printf(\\\"Hello C\\\");return 0;}\", \"language\":\"c\"}"' \
    "Hello C"

echo ""

# Test 4: Error Handling Tests
echo -e "${BLUE}🚨 Error Handling Tests${NC}"
echo "======================="

run_test "Syntax Error Handling" \
    'curl -s -X POST http://localhost:8000/execute/run -H "Content-Type: application/json" -d "{\"code\":\"print(\\\"missing quote)\", \"language\":\"python\"}"' \
    "error"

run_test "Runtime Error Handling" \
    'curl -s -X POST http://localhost:8000/execute/run -H "Content-Type: application/json" -d "{\"code\":\"print(1/0)\", \"language\":\"python\"}"' \
    "error"

echo ""

# Test 5: Performance Tests
echo -e "${BLUE}🚀 Performance Tests${NC}"
echo "===================="

echo -n "Testing execution speed... "
start_time=$(date +%s.%N)
curl -s -X POST http://localhost:8000/execute/run \
    -H "Content-Type: application/json" \
    -d '{"code":"for i in range(1000): print(i)", "language":"python"}' > /dev/null
end_time=$(date +%s.%N)
execution_time=$(echo "$end_time - $start_time" | bc -l)

if (( $(echo "$execution_time < 5.0" | bc -l) )); then
    echo -e "${GREEN}✅ PASS (${execution_time}s)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  SLOW (${execution_time}s)${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Test Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "==============="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All tests passed! CodoAI Platform is working perfectly.${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}$FAILED_TESTS test(s) failed. Please check the logs.${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   - Check logs: docker-compose logs"
    echo "   - Restart services: docker-compose restart"  
    echo "   - Check status: docker-compose ps"
    exit 1
fi