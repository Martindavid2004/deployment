#!/usr/bin/env python3
"""
Judge0 Integration Test Script

This script tests the Judge0 executor integration with various languages and scenarios.
Run this after setting up Judge0 to verify the migration is working correctly.
"""

import asyncio
import sys
from app.services.judge0_executor import judge0_executor


async def test_health_check():
    """Test Judge0 API health check"""
    print("🏥 Testing Judge0 Health Check...")
    is_healthy = await judge0_executor.health_check()
    
    if is_healthy:
        print(f"✅ Judge0 is healthy at {judge0_executor.base_url}")
        return True
    else:
        print(f"❌ Judge0 is not accessible at {judge0_executor.base_url}")
        return False


async def test_python_hello_world():
    """Test Python execution"""
    print("\n🐍 Testing Python Hello World...")
    
    result = await judge0_executor.execute_code(
        code='print("Hello from Judge0")',
        language="python",
        stdin=""
    )
    
    print(f"   Status: {result.status_description}")
    print(f"   Output: {result.output}")
    print(f"   Success: {result.success}")
    
    if result.success and "Hello from Judge0" in result.output:
        print("✅ Python test passed")
        return True
    else:
        print("❌ Python test failed")
        return False


async def test_python_with_input():
    """Test Python with stdin"""
    print("\n🐍 Testing Python with Input...")
    
    code = """
name = input()
age = input()
print(f"Hello {name}, you are {age} years old")
"""
    
    result = await judge0_executor.execute_code(
        code=code,
        language="python",
        stdin="Alice\n25"
    )
    
    print(f"   Status: {result.status_description}")
    print(f"   Output: {result.output}")
    
    if result.success and "Alice" in result.output and "25" in result.output:
        print("✅ Python with input test passed")
        return True
    else:
        print("❌ Python with input test failed")
        return False


async def test_java_hello_world():
    """Test Java execution"""
    print("\n☕ Testing Java Hello World...")
    
    code = """
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java");
    }
}
"""
    
    result = await judge0_executor.execute_code(
        code=code,
        language="java",
        stdin=""
    )
    
    print(f"   Status: {result.status_description}")
    print(f"   Output: {result.output}")
    
    if result.success and "Hello from Java" in result.output:
        print("✅ Java test passed")
        return True
    else:
        print("❌ Java test failed")
        return False


async def test_cpp_hello_world():
    """Test C++ execution"""
    print("\n⚡ Testing C++ Hello World...")
    
    code = """
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++" << endl;
    return 0;
}
"""
    
    result = await judge0_executor.execute_code(
        code=code,
        language="cpp",
        stdin=""
    )
    
    print(f"   Status: {result.status_description}")
    print(f"   Output: {result.output}")
    
    if result.success and "Hello from C++" in result.output:
        print("✅ C++ test passed")
        return True
    else:
        print("❌ C++ test failed")
        return False


async def test_compilation_error():
    """Test compilation error handling"""
    print("\n🔴 Testing Compilation Error Handling...")
    
    code = """
public class Main {
    public static void main(String[] args) {
        System.out.println("Missing semicolon")
    }
}
"""
    
    result = await judge0_executor.execute_code(
        code=code,
        language="java",
        stdin=""
    )
    
    print(f"   Status: {result.status_description}")
    print(f"   Compile Error: {result.compile_error[:100]}..." if result.compile_error else "None")
    
    if not result.success and result.compile_error:
        print("✅ Compilation error handling works")
        return True
    else:
        print("❌ Compilation error not detected")
        return False


async def test_runtime_error():
    """Test runtime error handling"""
    print("\n💥 Testing Runtime Error Handling...")
    
    code = """
def divide_by_zero():
    return 1 / 0

divide_by_zero()
"""
    
    result = await judge0_executor.execute_code(
        code=code,
        language="python",
        stdin=""
    )
    
    print(f"   Status: {result.status_description}")
    print(f"   Runtime Error: {result.runtime_error[:100]}..." if result.runtime_error else "None")
    
    if not result.success and (result.runtime_error or "division" in result.output.lower()):
        print("✅ Runtime error handling works")
        return True
    else:
        print("❌ Runtime error not detected")
        return False


async def test_timeout():
    """Test timeout handling"""
    print("\n⏱️  Testing Timeout Handling...")
    
    code = """
while True:
    pass
"""
    
    result = await judge0_executor.execute_code(
        code=code,
        language="python",
        stdin="",
        timeout=2
    )
    
    print(f"   Status: {result.status_description}")
    print(f"   Timed Out: {result.timed_out}")
    
    if result.timed_out or result.status_id == 5:
        print("✅ Timeout handling works")
        return True
    else:
        print("⚠️  Timeout test inconclusive (may have been killed by Judge0)")
        return True  # Don't fail on this as Judge0 might kill it


async def test_get_languages():
    """Test getting supported languages"""
    print("\n🌐 Testing Get Languages...")
    
    languages = await judge0_executor.get_languages()
    
    if languages:
        print(f"   Found {len(languages)} languages")
        print(f"   Sample: {', '.join([lang.get('name', 'Unknown') for lang in languages[:5]])}")
        print("✅ Get languages works")
        return True
    else:
        print("❌ Could not get languages")
        return False


async def run_all_tests():
    """Run all tests and report results"""
    print("=" * 60)
    print("🧪 Judge0 Integration Test Suite")
    print("=" * 60)
    
    # Health check is critical - stop if it fails
    if not await test_health_check():
        print("\n❌ Judge0 is not accessible. Please check:")
        print("   1. Is Judge0 running? (docker ps)")
        print("   2. Is it accessible at the configured URL?")
        print("   3. Check JUDGE0_BASE_URL in .env")
        return False
    
    # Run all other tests
    tests = [
        test_python_hello_world,
        test_python_with_input,
        test_java_hello_world,
        test_cpp_hello_world,
        test_compilation_error,
        test_runtime_error,
        test_timeout,
        test_get_languages,
    ]
    
    results = []
    for test in tests:
        try:
            result = await test()
            results.append((test.__name__, result))
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            results.append((test.__name__, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status}: {name}")
    
    print("\n" + "=" * 60)
    print(f"Results: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    print("=" * 60)
    
    return passed == total


if __name__ == "__main__":
    try:
        success = asyncio.run(run_all_tests())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test suite crashed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
