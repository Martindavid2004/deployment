"""
Piston API Executor Service

This service handles code compilation and execution through the Piston API.
Supports Python, Java, and C++ with proper error handling and timeout management.
"""

import aiohttp
import asyncio
from dataclasses import dataclass
from typing import Optional
import logging

logger = logging.getLogger(__name__)


@dataclass
class ExecutionResult:
    """Result of code execution through Piston API"""
    success: bool
    output: str
    compile_error: str
    runtime_error: str
    execution_time: float
    timed_out: bool


class PistonExecutor:
    """Handles communication with the Piston API for code compilation and execution"""
    
    def __init__(self, base_url: str = "https://emkc.org/api/v2/piston"):
        """
        Initialize Piston executor with API endpoint
        
        Args:
            base_url: Piston API base URL
        """
        self.base_url = base_url
        self.language_map = {
            'python': {'language': 'python', 'version': '3.10.0'},
            'java': {'language': 'java', 'version': '15.0.2'},
            'cpp': {'language': 'c++', 'version': '10.2.0'}
        }
    
    async def execute_code(
        self,
        code: str,
        language: str,
        stdin: str = "",
        timeout: int = 10
    ) -> ExecutionResult:
        """
        Execute code through Piston API
        
        Args:
            code: Source code to execute
            language: One of 'python', 'java', 'cpp'
            stdin: Standard input for the program
            timeout: Maximum execution time in seconds
            
        Returns:
            ExecutionResult with output, errors, and success status
        """
        try:
            # Map language to Piston runtime
            runtime = self._map_language_to_piston(language)
            if not runtime:
                return ExecutionResult(
                    success=False,
                    output="",
                    compile_error=f"Unsupported language: {language}",
                    runtime_error="",
                    execution_time=0.0,
                    timed_out=False
                )
            
            # Prepare request payload
            payload = {
                "language": runtime['language'],
                "version": runtime['version'],
                "files": [
                    {
                        "name": self._get_filename(language),
                        "content": code
                    }
                ],
                "stdin": stdin,
                "compile_timeout": timeout * 1000,  # Convert to milliseconds
                "run_timeout": timeout * 1000
            }
            
            # Make request to Piston API
            timeout_config = aiohttp.ClientTimeout(total=timeout + 2)  # Add buffer
            
            print(f"DEBUG Piston: Calling API for language={language}, stdin='{stdin}'")
            logger.info(f"Calling Piston API for language={language}, code_length={len(code)}, stdin='{stdin}'")
            
            async with aiohttp.ClientSession(timeout=timeout_config) as session:
                async with session.post(
                    f"{self.base_url}/execute",
                    json=payload
                ) as response:
                    logger.info(f"Piston API response status: {response.status}")
                    
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Piston API error: {response.status} - {error_text}")
                        return ExecutionResult(
                            success=False,
                            output="",
                            compile_error="",
                            runtime_error=f"API error: {response.status}",
                            execution_time=0.0,
                            timed_out=False
                        )
                    
                    response_data = await response.json()
                    print(f"DEBUG Piston: Raw response data: {response_data}")
                    logger.info(f"Piston API response: {response_data}")
                    result = self._parse_piston_response(response_data)
                    print(f"DEBUG Piston: Parsed result: {result}")
                    logger.info(f"Parsed result: success={result.success}, output_length={len(result.output)}")
                    return result
        
        except asyncio.TimeoutError:
            logger.warning(f"Code execution timed out after {timeout} seconds")
            return ExecutionResult(
                success=False,
                output="",
                compile_error="",
                runtime_error="",
                execution_time=float(timeout),
                timed_out=True
            )
        
        except aiohttp.ClientError as e:
            logger.error(f"Network error calling Piston API: {e}")
            return ExecutionResult(
                success=False,
                output="",
                compile_error="",
                runtime_error=f"Network error: {str(e)}",
                execution_time=0.0,
                timed_out=False
            )
        
        except Exception as e:
            logger.error(f"Unexpected error in execute_code: {e}")
            return ExecutionResult(
                success=False,
                output="",
                compile_error="",
                runtime_error=f"Unexpected error: {str(e)}",
                execution_time=0.0,
                timed_out=False
            )
    
    def _map_language_to_piston(self, language: str) -> Optional[dict]:
        """
        Map internal language names to Piston runtime identifiers
        
        Args:
            language: Internal language name ('python', 'java', 'cpp')
            
        Returns:
            Dictionary with 'language' and 'version' keys, or None if unsupported
        """
        return self.language_map.get(language.lower())
    
    def _get_filename(self, language: str) -> str:
        """
        Get appropriate filename for the language
        
        Args:
            language: Language name
            
        Returns:
            Filename with appropriate extension
        """
        filename_map = {
            'python': 'main.py',
            'java': 'Main.java',
            'cpp': 'main.cpp'
        }
        return filename_map.get(language.lower(), 'main.txt')
    
    def _parse_piston_response(self, response: dict) -> ExecutionResult:
        """
        Parse Piston API response into ExecutionResult
        
        Args:
            response: JSON response from Piston API
            
        Returns:
            ExecutionResult object
        """
        # Extract compile stage if present
        compile_output = ""
        compile_error = ""
        if "compile" in response:
            compile_output = response["compile"].get("output", "")
            compile_error = response["compile"].get("stderr", "")
        
        # Extract run stage
        run_output = ""
        runtime_error = ""
        if "run" in response:
            run_output = response["run"].get("stdout", "")
            runtime_error = response["run"].get("stderr", "")
            
            # Check if stderr contains compilation errors (Java/C++)
            # Compilation errors typically contain "error:" and mention compilation
            if runtime_error and ("error:" in runtime_error.lower() or "compilation failed" in runtime_error.lower()):
                compile_error = runtime_error
                runtime_error = ""
        
        # Determine success
        # Success if:
        # 1. No compilation errors
        # 2. No runtime errors (or exit code 0)
        # 3. Code executed (even if output is empty)
        exit_code = response.get("run", {}).get("code", 1)
        success = (
            not compile_error and
            not runtime_error and
            exit_code == 0
        )
        
        # Combine outputs
        output = run_output if run_output else compile_output
        
        return ExecutionResult(
            success=success,
            output=output,
            compile_error=compile_error,
            runtime_error=runtime_error,
            execution_time=0.0,  # Piston doesn't provide this
            timed_out=False
        )
