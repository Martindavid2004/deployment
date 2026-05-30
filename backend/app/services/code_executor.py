import subprocess
import tempfile
import os
import time
from typing import Dict, Any, List
from app.core.config import get_settings

settings = get_settings()

class CodeExecutor:
    def __init__(self):
        # Force local execution for now - AWS Lambda has output capture issues
        self.use_local = True
        print(f"🔧 CodeExecutor initialized - use_local: {self.use_local} (Forced local execution)")
        
        if not self.use_local:
            try:
                import boto3
                self.lambda_client = boto3.client(
                    'lambda',
                    region_name=settings.aws_region,
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key
                )
                self.function_name = settings.aws_lambda_function_name
                print(f"✅ AWS Lambda client initialized: {self.function_name}")
            except Exception as e:
                print(f"⚠️ AWS Lambda unavailable, using local execution: {e}")
                self.use_local = True
    
    async def execute_code_locally(
        self, 
        code: str, 
        language: str, 
        test_input: str,
        timeout: int = 10
    ) -> Dict[str, Any]:
        """Execute code locally using subprocess"""
        print(f"🐍 Executing locally: {language}")
        try:
            start_time = time.time()
            
            if language.lower() == "python":
                # Auto-wrap function definitions to handle input/output
                wrapped_code = self._wrap_python_code(code, test_input)
                
                # Create temporary Python file
                with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
                    f.write(wrapped_code)
                    temp_file = f.name
                
                print(f"📝 Temp file: {temp_file}")
                print(f"📦 Wrapped code preview: {wrapped_code[:200]}...")
                
                try:
                    # Execute Python code
                    result = subprocess.run(
                        ['python', temp_file],
                        input="",  # Input is embedded in wrapped code
                        capture_output=True,
                        text=True,
                        timeout=timeout
                    )
                    
                    execution_time = time.time() - start_time
                    
                    print(f"📊 Return code: {result.returncode}")
                    print(f"📤 Stdout: {result.stdout}")
                    print(f"📤 Stderr: {result.stderr}")
                    
                    if result.returncode == 0:
                        return {
                            "success": True,
                            "output": result.stdout,
                            "error": result.stderr if result.stderr else "",
                            "execution_time": execution_time
                        }
                    else:
                        return {
                            "success": False,
                            "output": result.stdout,
                            "error": result.stderr or "Execution failed",
                            "execution_time": execution_time
                        }
                finally:
                    # Clean up temp file
                    try:
                        os.unlink(temp_file)
                    except:
                        pass
            
            else:
                return {
                    "success": False,
                    "output": "",
                    "error": f"Language '{language}' not supported in local execution mode. Only Python is supported.",
                    "execution_time": 0
                }
                
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "",
                "error": f"Execution timed out after {timeout} seconds",
                "execution_time": timeout
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": f"Execution error: {str(e)}",
                "execution_time": 0
            }
    
    def _wrap_python_code(self, code: str, test_input: str) -> str:
        """
        Wrap Python code to automatically handle function execution.
        If code defines a function but doesn't call it, add a main block.
        Handles various input formats:
        - Variable assignment: "arr = [1,2,3]"
        - Multiple assignments: "nums = [2,7], target = 9"
        - Newline-separated: "[2,7]\n9"
        - Direct values: "121" or "abcabcbb"
        """
        import re
        
        # Check if code defines a function (def function_name(...):)
        function_match = re.search(r'def\s+(\w+)\s*\(([^)]*)\)', code)
        
        if function_match and 'if __name__' not in code:
            func_name = function_match.group(1)
            params = function_match.group(2).strip()
            
            # Build wrapper
            wrapper = f"{code}\n\n"
            wrapper += "# Auto-generated test wrapper\n"
            wrapper += "if __name__ == '__main__':\n"
            wrapper += "    import ast\n"
            
            if not params:
                # No parameters - just call the function
                wrapper += f"    result = {func_name}()\n"
            elif '=' in test_input and not test_input.strip().startswith('='):
                # Input contains variable assignments
                # Could be: "arr = [1,2,3]" or "nums = [2,7], target = 9"
                
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
                # Newline-separated values: "[2,7,11,15]\n9" or "[2,7,11,15]\\n9"
                # Split by actual newline or escaped newline
                lines = test_input.replace('\\n', '\n').split('\n')
                param_count = len([p for p in params.split(',') if p.strip()])
                
                if len(lines) == param_count:
                    # Parse each line as a parameter
                    parsed_params = []
                    for i, line in enumerate(lines):
                        wrapper += f"    try:\n"
                        wrapper += f"        param_{i} = ast.literal_eval({repr(line)})\n"
                        wrapper += f"    except:\n"
                        wrapper += f"        param_{i} = {repr(line)}\n"
                        parsed_params.append(f"param_{i}")
                    wrapper += f"    result = {func_name}({', '.join(parsed_params)})\n"
                else:
                    # Fallback: treat as single string parameter
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
            
            return wrapper
        
        # If no function or already has main block, return as-is
        return code

    async def execute_code(
        self, 
        code: str, 
        language: str, 
        test_input: str,
        timeout: int = 10
    ) -> Dict[str, Any]:
        """
        Execute code using AWS Lambda or locally.
        
        Args:
            code: The source code to execute
            language: Programming language (python, cpp, java)
            test_input: Input data for the program
            timeout: Execution timeout in seconds
            
        Returns:
            Dict with keys: success, output, error, execution_time
        """
        # Use local execution if AWS is not configured
        if self.use_local:
            print("🏠 Using local execution")
            return await self.execute_code_locally(code, language, test_input, timeout)
        
        # Use AWS Lambda
        print("☁️ Attempting AWS Lambda execution")
        try:
            import json
            payload = {
                "code": code,
                "language": language,
                "input": test_input,
                "timeout": timeout
            }
            
            response = self.lambda_client.invoke(
                FunctionName=self.function_name,
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )
            
            result = json.loads(response['Payload'].read())
            print(f"☁️ Lambda result: {result}")
            
            # Transform Lambda response to expected format
            # Lambda returns: {stdout, stderr, status: {id, description}, timme, memory}
            status_id = result.get('status', {}).get('id', -1) if isinstance(result.get('status'), dict) else -1
            is_success = status_id == 3  # Status 3 = Accepted
            
            return {
                "success": is_success,
                "output": result.get("stdout", "") or "",
                "error": result.get("stderr", "") or "",
                "execution_time": float(result.get("timme", result.get("time", 0)) or 0)
            }
            
        except Exception as e:
            # Fallback to local execution if Lambda fails
            print(f"⚠️ Lambda failed, falling back to local: {e}")
            return await self.execute_code_locally(code, language, test_input, timeout)
    
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
