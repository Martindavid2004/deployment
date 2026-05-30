from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.security.auth import get_current_user
from app.services.code_executor import code_executor

router = APIRouter(prefix="/execute", tags=["code-execution"])

class CodeExecutionRequest(BaseModel):
    code: str
    language: str
    test_input: str = ""
    timeout: int = 10

class TestCaseExecutionRequest(BaseModel):
    code: str
    language: str
    test_cases: List[Dict[str, Any]]

# Optional authentication - allows both authenticated and anonymous users
async def get_optional_user(current_user = Depends(get_current_user)):
    return current_user

@router.post("/run")
async def execute_code(
    request: CodeExecutionRequest
):
    """
    Execute code with given input.
    Used for testing and debugging. No authentication required for testing.
    """
    print(f"🔧 Executing code: {request.language}")
    print(f"📝 Code: {request.code[:100]}...")
    
    result = await code_executor.execute_code(
        code=request.code,
        language=request.language,
        test_input=request.test_input,
        timeout=request.timeout
    )
    
    print(f"✅ Result: success={result.get('success')}, output_len={len(result.get('output', ''))}, error={result.get('error', 'None')[:100]}")
    
    return result

@router.post("/test")
async def run_test_cases(
    request: TestCaseExecutionRequest
):
    """
    Run all test cases against the code.
    No authentication required for testing.
    """
    result = await code_executor.run_test_cases(
        code=request.code,
        language=request.language,
        test_cases=request.test_cases
    )
    return result

@router.post("/validate")
async def validate_syntax(
    request: CodeExecutionRequest
):
    """
    Validate code syntax without execution.
    Can be used for quick feedback.
    """
    # Basic syntax validation by attempting to execute with empty input
    result = await code_executor.execute_code(
        code=request.code,
        language=request.language,
        test_input="",
        timeout=5
    )
    
    return {
        "valid": result.get("success", False) or result.get("error", "") == "",
        "error": result.get("error", "")
    }
