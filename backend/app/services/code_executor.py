import time
from typing import Dict, Any, List
from app.core.config import get_settings
from app.services.judge0_executor import judge0_executor

settings = get_settings()

class CodeExecutor:
    def __init__(self):
        # Use Judge0 for all code execution
        self.executor = judge0_executor
        print(f"CodeExecutor initialized - using Judge0 at {self.executor.base_url}")
    
    async def _prepare_code(self, code: str, language: str, test_input: str) -> tuple[str, str]:
        """
        Prepare code and stdin for execution.
        For Python, auto-wrap function definitions to handle input/output.
        For other languages, return code and input as-is.
        
        Returns:
            Tuple of (prepared_code, stdin)
        """
        if language.lower() == "python":
            import re
            
            # Check if code defines a function but doesn't have a main block
            function_match = re.search(r'def\s+(\w+)\s*\(([^)]*)\)', code)
            
            if function_match and 'if __name__' not in code:
                func_name = function_match.group(1)
                params = function_match.group(2).strip()
                
                # Build wrapper to call the function with test input
                wrapper = f"{code}\n\n"
                wrapper += "# Auto-generated test wrapper\n"
                wrapper += "if __name__ == '__main__':\n"
                wrapper += "    import ast\n"
                
                if not params:
                    # No parameters - just call the function
                    wrapper += f"    result = {func_name}()\n"
                elif '=' in test_input and not test_input.strip().startswith('='):
                    # Input contains variable assignments
                    if ',' in test_input and test_input.count('=') > 1:
                        # Multiple assignments: "nums = [2,7], target = 9"
                        assignments = [a.strip() for a in test_input.split(',') if '=' in a]
                        var_names = []
                        for assignment in assignments:
                            wrapper += f"    {assignment}\n"
                            var_names.append(assignment.split('=')[0].strip())
                        wrapper += f"    result = {func_name}({', '.join(var_names)})\n"
                    else:
                        # Single assignment: "arr = [1,2,3]"
                        wrapper += f"    {test_input}\n"
                        var_name = test_input.split('=')[0].strip()
                        wrapper += f"    result = {func_name}({var_name})\n"
                elif '\\n' in test_input or '\n' in test_input:
                    # Newline-separated values
                    lines = test_input.replace('\\n', '\n').split('\n')
                    param_count = len([p for p in params.split(',') if p.strip()])
                    
                    if len(lines) == param_count:
                        parsed_params = []
                        for i, line in enumerate(lines):
                            wrapper += f"    try:\n"
                            wrapper += f"        param_{i} = ast.literal_eval({repr(line)})\n"
                            wrapper += f"    except:\n"
                            wrapper += f"        param_{i} = {repr(line)}\n"
                            parsed_params.append(f"param_{i}")
                        wrapper += f"    result = {func_name}({', '.join(parsed_params)})\n"
                    else:
                        wrapper += f"    test_input_value = {repr(test_input)}\n"
                        wrapper += f"    result = {func_name}(test_input_value)\n"
                else:
                    # Direct value - try to evaluate it
                    wrapper += f"    test_input_str = {repr(test_input)}\n"
                    wrapper += f"    try:\n"
                    wrapper += f"        test_input_value = ast.literal_eval(test_input_str)\n"
                    wrapper += f"    except:\n"
                    wrapper += f"        test_input_value = test_input_str\n"
                    wrapper += f"    result = {func_name}(test_input_value)\n"
                
                # Print result with proper formatting
                wrapper += "    if isinstance(result, bool):\n"
                wrapper += "        print('true' if result else 'false')\n"
                wrapper += "    elif isinstance(result, (list, tuple)):\n"
                wrapper += "        print(str(result))\n"
                wrapper += "    else:\n"
                wrapper += "        print(result)\n"
                
                return wrapper, ""  # Input is embedded in code, no stdin needed
            else:
                # Code already has main block or no function - use stdin
                return code, test_input
        else:
            # For non-Python languages, return as-is
            return code, test_input

    async def execute_code(
        self, 
        code: str, 
        language: str, 
        test_input: str,
        timeout: int = 10
    ) -> Dict[str, Any]:
        """
        Execute code using Judge0 API.
        
        Args:
            code: The source code to execute
            language: Programming language (python, cpp, java, c, javascript, etc.)
            test_input: Input data for the program
            timeout: Execution timeout in seconds
            
        Returns:
            Dict with keys: success, output, error, execution_time, compile_error
        """
        print(f"🔧 Executing code via Judge0: {language}")
        print(f"📝 Code preview: {code[:100]}...")
        
        # Quick health check first to provide immediate feedback
        try:
            is_healthy = await self.executor.health_check()
            if not is_healthy:
                return {
                    "success": False,
                    "output": "",
                    "error": "Code execution service is currently unavailable. Please try again later or contact support if the issue persists.",
                    "execution_time": 0,
                    "memory": 0,
                    "status": "Service Unavailable",
                    "status_id": -1
                }
        except Exception:
            # If health check itself fails, continue to regular execution which will handle the error
            pass
        
        # Prepare code and stdin based on language
        prepared_code, stdin = await self._prepare_code(code, language, test_input)
        
        # Execute via Judge0
        result = await self.executor.execute_code(
            code=prepared_code,
            language=language,
            stdin=stdin,
            timeout=timeout
        )
        
        # Transform Judge0 result to expected format
        error_message = ""
        if result.compile_error:
            error_message = f"Compilation Error:\n{result.compile_error}"
        elif result.runtime_error:
            error_message = f"Runtime Error:\n{result.runtime_error}"
        elif not result.success:
            error_message = f"Execution failed: {result.status_description}"
        
        response = {
            "success": result.success,
            "output": result.output.strip(),
            "error": error_message,
            "execution_time": result.execution_time,
            "memory": result.memory,
            "status": result.status_description,
            "status_id": result.status_id
        }
        
        print(f"✅ Judge0 result: success={result.success}, status={result.status_description}, output_len={len(result.output)}")
        
        return response
    
    async def run_test_cases(
        self,
        code: str,
        language: str,
        test_cases: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Run multiple test cases against the code.
        
        Args:
            code: The source code to test
            language: Programming language
            test_cases: List of dicts with 'input' and 'expected' keys
            
        Returns:
            Dict with keys: passed, failed, total, results
        """
        results = []
        passed = 0
        failed = 0
        
        for i, test_case in enumerate(test_cases):
            test_input = test_case.get("input", "")
            expected_output = test_case.get("expected", "").strip()
            
            result = await self.execute_code(code, language, test_input)
            
            actual_output = result.get("output", "").strip()
            test_passed = result.get("success", False) and actual_output == expected_output
            
            if test_passed:
                passed += 1
            else:
                failed += 1
            
            results.append({
                "test_id": test_case.get("id", i + 1),
                "input": test_input,
                "expected": expected_output,
                "actual": actual_output,
                "passed": test_passed,
                "error": result.get("error", ""),
                "execution_time": result.get("execution_time", 0)
            })
        
        return {
            "passed": passed,
            "failed": failed,
            "total": len(test_cases),
            "results": results,
            "all_passed": failed == 0
        }

code_executor = CodeExecutor()
