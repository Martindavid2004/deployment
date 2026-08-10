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

@router.get("/health")
async def health_check():
    """
    Check if Judge0 API is accessible
    """
    from app.services.judge0_executor import judge0_executor
    
    is_healthy = await judge0_executor.health_check()
    
    if is_healthy:
        return {
            "status": "healthy",
            "judge0_url": judge0_executor.base_url,
            "message": "Judge0 API is accessible"
        }
    else:
        raise HTTPException(
            status_code=503,
            detail=f"Judge0 API is not accessible at {judge0_executor.base_url}"
        )

@router.get("/languages")
async def get_supported_languages():
    """
    Get list of supported languages from Judge0
    """
    from app.services.judge0_executor import judge0_executor
    
    languages = await judge0_executor.get_languages()
    
    if languages:
        return {
            "languages": languages,
            "supported_by_platform": list(judge0_executor.language_map.keys())
        }
    else:
        return {
            "languages": [],
            "supported_by_platform": list(judge0_executor.language_map.keys()),
            "message": "Could not fetch languages from Judge0"
        }

