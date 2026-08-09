"""
Judge0 API Executor Service

This service handles code compilation and execution through Judge0 API.
Supports multiple languages with proper error handling and timeout management.

Custom Judge0 API: http://localhost:8888
"""

import httpx
import asyncio
import base64
from dataclasses import dataclass
from typing import Optional, Dict, Any
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class ExecutionResult:
    """Result of code execution through Judge0 API"""
    success: bool
    output: str
    compile_error: str
    runtime_error: str
    execution_time: float
    memory: int
    timed_out: bool
    status_id: int
    status_description: str


class Judge0Executor:
    """Handles communication with Judge0 API for code compilation and execution"""
    
    def __init__(self, base_url: str = None):
        """
        Initialize Judge0 executor with API endpoint
        
        Args:
            base_url: Judge0 API base URL (default: from settings or http://localhost:2358)
        """
        self.base_url = base_url or settings.judge0_base_url
        
        # Language ID mapping for Judge0
        # Reference: Your local Judge0 instance at port 8888
        self.language_map = {
            'c': 1,           # C (GCC)
            'cpp': 2,         # C++ (G++)
            'java': 3,        # Java (OpenJDK)
            'python': 4,      # Python (3.x)
            'javascript': 5,  # JavaScript (Node.js)
        }
    
    def _encode_base64(self, text: str) -> str:
        """Encode text to base64"""
        return base64.b64encode(text.encode('utf-8')).decode('utf-8')
    
    def _decode_base64(self, encoded: Optional[str]) -> str:
        """Decode base64 text, return empty string if None"""
        if not encoded:
            return ""
        try:
            return base64.b64decode(encoded).decode('utf-8')
        except Exception as e:
            logger.error(f"Base64 decode error: {e}")
            return ""
    
    async def execute_code(
        self,
        code: str,
        language: str,
        stdin: str = "",
        timeout: int = 10,
        wait: bool = True
    ) -> ExecutionResult:
        """
        Execute code through Judge0 API
        
        Args:
            code: Source code to execute
            language: One of 'python', 'java', 'cpp', 'c', 'javascript', etc.
            stdin: Standard input for the program
            timeout: Maximum execution time in seconds (Judge0 default is 5s)
            wait: If True, wait for result synchronously; if False, return submission token
            
        Returns:
            ExecutionResult with output, errors, and success status
        """
        try:
            # Map language to Judge0 language ID
            language_id = self._map_language_to_judge0(language)
            if not language_id:
                return ExecutionResult(
                    success=False,
                    output="",
                    compile_error=f"Unsupported language: {language}",
                    runtime_error="",
                    execution_time=0.0,
                    memory=0,
                    timed_out=False,
                    status_id=-1,
                    status_description="Unsupported Language"
                )
            
            # Prepare request payload for custom Judge0 API (no base64 encoding)
            payload: Dict[str, Any] = {
                "language_id": language_id,
                "source_code": code,  # Plain text, not base64
                "wait": wait
            }
            
            # Add stdin if provided
            if stdin:
                payload["stdin"] = stdin  # Plain text, not base64
            
            # No query parameters needed for custom API
            params = {}
            
            print(f"DEBUG Judge0: Calling API for language={language} (id={language_id}), stdin='{stdin[:50]}...'")
            logger.info(f"Calling Judge0 API for language={language}, code_length={len(code)}, stdin_length={len(stdin)}")
            
            # Configure timeout with buffer for API call - reduce for faster failure
            timeout_config = httpx.Timeout(timeout + 3.0)  # Reduced from 5.0 to 3.0
            
            async with httpx.AsyncClient(timeout=timeout_config) as client:
                # Submit code for execution
                response = await client.post(
                    f"{self.base_url}/submissions",
                    json=payload
                )
                
                logger.info(f"Judge0 API response status: {response.status_code}")
                
                if response.status_code not in (200, 201):
                    error_text = response.text
                    logger.error(f"Judge0 API error: {response.status_code} - {error_text}")
                    return ExecutionResult(
                        success=False,
                        output="",
                        compile_error="",
                        runtime_error=f"API error: {response.status_code} - {error_text}",
                        execution_time=0.0,
                        memory=0,
                        timed_out=False,
                        status_id=-1,
                        status_description="API Error"
                    )
                
                response_data = response.json()
                print(f"DEBUG Judge0: Raw response data: {response_data}")
                logger.info(f"Judge0 API response: {response_data}")
                
                # If wait=true, response contains full result
                # If wait=false, response only contains token - need to poll
                if wait or "status" in response_data:
                    result = self._parse_judge0_response(response_data)
                    print(f"DEBUG Judge0: Parsed result: success={result.success}, status={result.status_description}")
                    logger.info(f"Parsed result: success={result.success}, status={result.status_description}")
                    return result
                else:
                    # Need to poll for result
                    token = response_data.get("token")
                    if not token:
                        raise Exception("No token returned from Judge0")
                    
                    return await self._poll_submission(token, timeout_config)
        
        except (asyncio.TimeoutError, httpx.TimeoutException):
            logger.warning(f"Code execution timed out after {timeout} seconds")
            return ExecutionResult(
                success=False,
                output="",
                compile_error="",
                runtime_error="",
                execution_time=float(timeout),
                memory=0,
                timed_out=True,
                status_id=5,  # Status 5 = Time Limit Exceeded
                status_description="Time Limit Exceeded"
            )
        
        except httpx.RequestError as e:
            logger.error(f"Network error calling Judge0 API: {e}")
            return ExecutionResult(
                success=False,
                output="",
                compile_error="",
                runtime_error=f"Code execution service is currently unavailable. Please try again later.",
                execution_time=0.0,
                memory=0,
                timed_out=False,
                status_id=-1,
                status_description="Service Unavailable"
            )
        
        except Exception as e:
            logger.error(f"Unexpected error in execute_code: {e}")
            return ExecutionResult(
                success=False,
                output="",
                compile_error="",
                runtime_error=f"Unexpected error: {str(e)}",
                execution_time=0.0,
                memory=0,
                timed_out=False,
                status_id=-1,
                status_description="Internal Error"
            )
    
    async def _poll_submission(
        self,
        token: str,
        timeout_config: httpx.Timeout,
        max_attempts: int = 20,
        poll_interval: float = 0.5
    ) -> ExecutionResult:
        """
        Poll Judge0 API for submission result
        
        Args:
            token: Submission token
            timeout_config: HTTP timeout configuration
            max_attempts: Maximum number of polling attempts
            poll_interval: Seconds to wait between polls
            
        Returns:
            ExecutionResult
        """
        async with httpx.AsyncClient(timeout=timeout_config) as client:
            for attempt in range(max_attempts):
                await asyncio.sleep(poll_interval)
                
                response = await client.get(
                    f"{self.base_url}/submissions/{token}"
                )
                
                if response.status_code != 200:
                    continue
                
                response_data = response.json()
                status_id = response_data.get("status", {}).get("id", 1)
                
                # Status 1 = In Queue, 2 = Processing
                if status_id in (1, 2):
                    continue
                
                # Finished processing
                return self._parse_judge0_response(response_data)
        
        # Polling timed out
        return ExecutionResult(
            success=False,
            output="",
            compile_error="",
            runtime_error="Polling timeout - submission may still be processing",
            execution_time=0.0,
            memory=0,
            timed_out=True,
            status_id=5,
            status_description="Polling Timeout"
        )
    
    def _map_language_to_judge0(self, language: str) -> Optional[int]:
        """
        Map internal language names to Judge0 language IDs
        
        Args:
            language: Internal language name ('python', 'java', 'cpp', etc.)
            
        Returns:
            Judge0 language ID, or None if unsupported
        """
        return self.language_map.get(language.lower())
    
    def _parse_judge0_response(self, response: dict) -> ExecutionResult:
        """
        Parse Judge0 API response into ExecutionResult
        
        Custom API Status IDs (based on API documentation):
        3: Accepted (success)
        4: Runtime Error
        5: Time Limit Exceeded  
        6: Compilation Error
        13: Internal Error
        
        Args:
            response: JSON response from Judge0 API
            
        Returns:
            ExecutionResult object
        """
        # Extract status
        status = response.get("status", {})
        status_id = status.get("id", -1)
        status_description = status.get("description", "Unknown")
        
        # For custom API, output fields are plain text (no base64 decoding needed)
        stdout = response.get("stdout", "")
        stderr = response.get("stderr", "")
        compile_output = response.get("compile_output", "")
        message = response.get("message", "")
        
        # Extract execution metrics
        execution_time = float(response.get("time") or 0)
        memory = int(response.get("memory") or 0)
        
        # Determine success
        # Status 3 = Accepted
        success = status_id == 3
        
        # Categorize errors
        compile_error = ""
        runtime_error = ""
        timed_out = False
        
        if status_id == 6:  # Compilation Error
            compile_error = compile_output or stderr or message
        elif status_id == 5:  # Time Limit Exceeded
            timed_out = True
            runtime_error = "Time limit exceeded"
        elif status_id == 4:  # Runtime Error
            runtime_error = message or stderr or f"Runtime error: {status_description}"
        elif status_id == 13:  # Internal Error
            runtime_error = message or "Internal Judge0 error"
        elif not success and stderr:
            runtime_error = stderr
        
        # Use stdout as primary output
        output = stdout
        
        return ExecutionResult(
            success=success,
            output=output,
            compile_error=compile_error,
            runtime_error=runtime_error,
            execution_time=execution_time,
            memory=memory,
            timed_out=timed_out,
            status_id=status_id,
            status_description=status_description
        )
    
    async def get_languages(self) -> Dict[str, Any]:
        """
        Get list of supported languages from Judge0
        
        Returns:
            Dictionary mapping language names to their IDs and details
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/languages")
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get languages: {response.status_code}")
                    return {}
        except Exception as e:
            logger.error(f"Error getting languages: {e}")
            return {}
    
    async def health_check(self) -> bool:
        """
        Check if Judge0 API is accessible
        
        Returns:
            True if API is healthy, False otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Judge0 health check failed: {e}")
            return False


# Singleton instance
judge0_executor = Judge0Executor()
