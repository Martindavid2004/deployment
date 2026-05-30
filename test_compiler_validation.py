"""
Comprehensive compiler validation test for all problem types with test cases.
Tests the actual code_executor used in the application.
"""
import asyncio
import sys
import os
import ast
import re

# Add app to path
sys.path.insert(0, os.path.dirname(__file__))

from app.services.code_executor import CodeExecutor

class CompilerValidator:
    def __init__(self):
        self.executor = CodeExecutor()
        self.fallback_problems = self._extract_problems()
    
    def _extract_problems(self):
        """Extract problems from problem_generator.py source code"""
        with open('app/services/problem_generator.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        problems = []
        
        # Extract easy_problems list
        easy_match = re.search(r'easy_problems\s*=\s*\[(.*?)\n\s*\]', content, re.DOTALL)
        if easy_match:
            easy_problems = self._parse_problems_list(easy_match.group(1))
            problems.extend(easy_problems)
        
        # Extract medium_problems list
        medium_match = re.search(r'medium_problems\s*=\s*\[(.*?)\n\s*\]', content, re.DOTALL)
        if medium_match:
            medium_problems = self._parse_problems_list(medium_match.group(1))
            problems.extend(medium_problems)
        
        # Extract hard_problems list
        hard_match = re.search(r'hard_problems\s*=\s*\[(.*)\Z', content, re.DOTALL)
        if hard_match:
            hard_problems = self._parse_problems_list(hard_match.group(1))
            problems.extend(hard_problems)
        
        return problems
    
    def _parse_problems_list(self, problems_str):
        """Parse Python dict structures from string"""
        # Try to extract individual problem dicts
        problems = []
        depth = 0
        current_dict = ""
        in_string = False
        escape_next = False
        string_char = None
        
        for char in problems_str:
            if escape_next:
                current_dict += char
                escape_next = False
                continue
            
            if char == '\\':
                current_dict += char
                escape_next = True
                continue
            
            if char in ('"', "'") and not in_string:
                current_dict += char
                in_string = True
                string_char = char
                continue
            
            if char == string_char and in_string:
                current_dict += char
                in_string = False
                string_char = None
                continue
            
            if not in_string:
                if char == '{':
                    depth += 1
                    current_dict += char
                elif char == '}':
                    depth -= 1
                    current_dict += char
                    if depth == 0 and current_dict.strip():
                        try:
                            problem = eval(current_dict)
                            if isinstance(problem, dict) and 'title' in problem:
                                problems.append(problem)
                        except:
                            pass
                        current_dict = ""
                else:
                    if depth > 0:
                        current_dict += char
            else:
                current_dict += char
        
        return problems
        
    async def test_compiler_with_all_problems(self):
        """Test compiler with all fallback problems and their test cases"""
        
        print("\n" + "="*70)
        print("[COMPILER VALIDATION] Testing Code Executor with All Problems")
        print("="*70)
        
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        problem_results = {}
        
        for problem in self.fallback_problems:
            problem_name = problem['title']
            print(f"\n[TESTING] {problem_name}")
            print("-" * 70)
            
            # Get the reference solution code
            reference_code = problem['reference_solution']['python']
            
            problem_passed = 0
            problem_failed = 0
            problem_tests = problem['test_cases']
            
            for idx, test_case in enumerate(problem_tests):
                total_tests += 1
                test_input = test_case['input']
                expected_output = str(test_case['expected_output']).strip()
                
                try:
                    # Execute code through the actual executor
                    result = await self.executor.execute_code_locally(
                        code=reference_code,
                        language="python",
                        test_input=test_input,
                        timeout=5
                    )
                    
                    if result['success']:
                        actual_output = result['output'].strip()
                        
                        if actual_output == expected_output:
                            print(f"  [PASS] Test Case {idx + 1}")
                            passed_tests += 1
                            problem_passed += 1
                        else:
                            print(f"  [FAIL] Test Case {idx + 1}")
                            print(f"     Input:    {test_input}")
                            print(f"     Expected: {expected_output}")
                            print(f"     Got:      {actual_output}")
                            failed_tests += 1
                            problem_failed += 1
                    else:
                        print(f"  [ERROR] Test Case {idx + 1}")
                        print(f"     Error: {result['error'][:100]}")
                        failed_tests += 1
                        problem_failed += 1
                        
                except Exception as e:
                    print(f"  [EXCEPTION] Test Case {idx + 1}")
                    print(f"     Error: {str(e)[:100]}")
                    failed_tests += 1
                    problem_failed += 1
            
            # Summary for this problem
            status = "[PASS]" if problem_failed == 0 else "[FAIL]"
            problem_results[problem_name] = {
                "passed": problem_passed,
                "failed": problem_failed,
                "total": len(problem_tests)
            }
            print(f"{status} {problem_name}: {problem_passed}/{len(problem_tests)} passed")
        
        # Final summary
        print("\n" + "="*70)
        print("[COMPILER VALIDATION SUMMARY]")
        print("="*70)
        print(f"\nTotal Test Cases: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%\n")
        
        if failed_tests == 0:
            print("[SUCCESS] Compiler validation PASSED!")
            print("All problems work correctly with the code executor!")
            print("="*70)
            return True
        else:
            print("[FAILURE] Compiler validation FAILED!")
            print("Some problems have issues:")
            for problem_name, results in problem_results.items():
                if results['failed'] > 0:
                    print(f"  - {problem_name}: {results['failed']}/{results['total']} failed")
            print("="*70)
            return False

async def main():
    validator = CompilerValidator()
    success = await validator.test_compiler_with_all_problems()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
