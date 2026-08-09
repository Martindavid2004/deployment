#!/usr/bin/env python3
"""
Quick Verification Script for Judge0 Compilation Flow

Tests all the places where code execution is used:
1. /execute/run endpoint
2. /execute/test endpoint  
3. Competitive match execution
4. Queue manager execution

Run this before pushing to verify everything works.
"""

import asyncio
import sys
from colorama import init, Fore, Style

# Initialize colorama for colored output
init(autoreset=True)

def print_header(text):
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}{text}")
    print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}")

def print_success(text):
    print(f"{Fore.GREEN}✅ {text}{Style.RESET_ALL}")

def print_error(text):
    print(f"{Fore.RED}❌ {text}{Style.RESET_ALL}")

def print_info(text):
    print(f"{Fore.YELLOW}ℹ️  {text}{Style.RESET_ALL}")

async def test_judge0_health():
    """Test if Judge0 is accessible"""
    print_header("1. Testing Judge0 Connection")
    
    try:
        from app.services.judge0_executor import judge0_executor
        
        print_info(f"Judge0 URL: {judge0_executor.base_url}")
        
        is_healthy = await judge0_executor.health_check()
        
        if is_healthy:
            print_success("Judge0 is accessible and healthy")
            return True
        else:
            print_error("Judge0 is not accessible")
            print_info("Make sure Judge0 is running on the configured URL")
            return False
            
    except Exception as e:
        print_error(f"Error checking Judge0 health: {e}")
        return False

async def test_judge0_executor():
    """Test Judge0 executor directly"""
    print_header("2. Testing Judge0 Executor Service")
    
    try:
        from app.services.judge0_executor import judge0_executor
        
        # Test Python
        print_info("Testing Python execution...")
        result = await judge0_executor.execute_code(
            code='print("Hello from Python")',
            language="python",
            stdin=""
        )
        
        if result.success and "Hello from Python" in result.output:
            print_success(f"Python: {result.output.strip()}")
        else:
            print_error(f"Python failed: {result.compile_error or result.runtime_error}")
            return False
        
        # Test Java
        print_info("Testing Java execution...")
        java_code = """
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java");
    }
}
"""
        result = await judge0_executor.execute_code(
            code=java_code,
            language="java",
            stdin=""
        )
        
        if result.success and "Hello from Java" in result.output:
            print_success(f"Java: {result.output.strip()}")
        else:
            print_error(f"Java failed: {result.compile_error or result.runtime_error}")
            return False
        
        # Test C++
        print_info("Testing C++ execution...")
        cpp_code = """
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++" << endl;
    return 0;
}
"""
        result = await judge0_executor.execute_code(
            code=cpp_code,
            language="cpp",
            stdin=""
        )
        
        if result.success and "Hello from C++" in result.output:
            print_success(f"C++: {result.output.strip()}")
        else:
            print_error(f"C++ failed: {result.compile_error or result.runtime_error}")
            return False
        
        print_success("All language tests passed!")
        return True
        
    except Exception as e:
        print_error(f"Error testing Judge0 executor: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_code_executor():
    """Test CodeExecutor service (wraps Judge0)"""
    print_header("3. Testing Code Executor Service")
    
    try:
        from app.services.code_executor import code_executor
        
        print_info("Testing code executor with Python...")
        result = await code_executor.execute_code(
            code='print("Test from code_executor")',
            language="python",
            test_input=""
        )
        
        if result.get("success") and "Test from code_executor" in result.get("output", ""):
            print_success(f"Code Executor works: {result['output'].strip()}")
            return True
        else:
            print_error(f"Code Executor failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print_error(f"Error testing code executor: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_competitive_integration():
    """Check if competitive router is properly configured"""
    print_header("4. Testing Competitive Router Integration")
    
    try:
        # Just verify the import and that it uses judge0_executor
        import app.routers.competitive as comp_router
        
        # Check if the file has been updated to use judge0_executor
        import inspect
        source = inspect.getsource(comp_router)
        
        if "judge0_executor" in source:
            print_success("Competitive router uses judge0_executor")
        elif "piston" in source.lower():
            print_error("Competitive router still uses Piston!")
            return False
        else:
            print_info("Cannot determine executor in competitive router")
        
        return True
        
    except Exception as e:
        print_error(f"Error checking competitive router: {e}")
        return False

async def test_queue_manager():
    """Check if queue manager is properly configured"""
    print_header("5. Testing Queue Manager Integration")
    
    try:
        from app.services.queue_manager import queue_manager
        
        # Check if it has the executor attribute
        if hasattr(queue_manager, 'executor'):
            print_success("Queue manager has executor configured")
            return True
        else:
            print_error("Queue manager missing executor attribute")
            return False
            
    except Exception as e:
        print_error(f"Error checking queue manager: {e}")
        return False

async def test_language_mapping():
    """Verify language mapping is correct"""
    print_header("6. Testing Language Mapping")
    
    try:
        from app.services.judge0_executor import judge0_executor
        
        expected_languages = {
            'python': 71,
            'java': 62,
            'cpp': 54,
            'c': 50
        }
        
        all_correct = True
        for lang, expected_id in expected_languages.items():
            actual_id = judge0_executor.language_map.get(lang)
            
            if actual_id == expected_id:
                print_success(f"{lang.upper()}: {actual_id} (correct)")
            else:
                print_error(f"{lang.upper()}: {actual_id} (expected {expected_id})")
                all_correct = False
        
        return all_correct
        
    except Exception as e:
        print_error(f"Error checking language mapping: {e}")
        return False

async def test_api_endpoints():
    """Check if API endpoints exist and are properly configured"""
    print_header("7. Testing API Endpoints Configuration")
    
    try:
        from app.routers import execute
        import inspect
        
        # Check for required endpoints
        source = inspect.getsource(execute)
        
        endpoints = {
            'execute_code': '/run',
            'run_test_cases': '/test',
            'health_check': '/health',
            'get_supported_languages': '/languages'
        }
        
        all_exist = True
        for func_name, route in endpoints.items():
            if func_name in source:
                print_success(f"Endpoint {route} exists")
            else:
                print_error(f"Endpoint {route} missing!")
                all_exist = False
        
        return all_exist
        
    except Exception as e:
        print_error(f"Error checking API endpoints: {e}")
        return False

async def run_all_tests():
    """Run all verification tests"""
    print(f"\n{Fore.MAGENTA}{'='*60}")
    print(f"{Fore.MAGENTA}🧪 Judge0 Compilation Flow Verification")
    print(f"{Fore.MAGENTA}{'='*60}{Style.RESET_ALL}\n")
    
    results = []
    
    # Test 1: Judge0 Health
    results.append(("Judge0 Health", await test_judge0_health()))
    
    # Only continue if Judge0 is healthy
    if results[0][1]:
        results.append(("Judge0 Executor", await test_judge0_executor()))
        results.append(("Code Executor", await test_code_executor()))
        results.append(("Competitive Router", await test_competitive_integration()))
        results.append(("Queue Manager", await test_queue_manager()))
        results.append(("Language Mapping", await test_language_mapping()))
        results.append(("API Endpoints", await test_api_endpoints()))
    else:
        print_error("Skipping remaining tests because Judge0 is not accessible")
        print_info("Please ensure Judge0 is running:")
        print_info("  1. Check if Judge0 Docker container is running")
        print_info("  2. Verify JUDGE0_BASE_URL in .env")
        print_info("  3. Try: curl http://localhost:2358/about")
    
    # Summary
    print_header("Test Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        if result:
            print_success(f"{name}: PASSED")
        else:
            print_error(f"{name}: FAILED")
    
    print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
    
    if passed == total:
        print(f"{Fore.GREEN}✅ All tests passed! ({passed}/{total})")
        print(f"{Fore.GREEN}🚀 Safe to push to Git!{Style.RESET_ALL}\n")
        return True
    else:
        print(f"{Fore.RED}❌ Some tests failed ({passed}/{total})")
        print(f"{Fore.RED}⚠️  Fix issues before pushing!{Style.RESET_ALL}\n")
        return False

if __name__ == "__main__":
    try:
        success = asyncio.run(run_all_tests())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}⚠️  Tests interrupted by user{Style.RESET_ALL}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Fore.RED}❌ Unexpected error: {e}{Style.RESET_ALL}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
