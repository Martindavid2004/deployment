# Judge0 Migration Guide

## Overview

This document describes the migration from Piston API to Judge0 for code compilation and execution across the CodoAi platform.

## What Changed

### 1. **New Judge0 Executor Service**
- **File**: `app/services/judge0_executor.py`
- Replaces the Piston executor with Judge0 integration
- Supports base64 encoding/decoding as required by Judge0
- Handles multiple programming languages (Python, Java, C++, C, JavaScript, TypeScript, Go, Rust, etc.)

### 2. **Updated Code Executor**
- **File**: `app/services/code_executor.py`
- Removed local subprocess execution
- Removed AWS Lambda integration
- Now exclusively uses Judge0 for all code execution
- Maintains Python code wrapping logic for function testing

### 3. **Updated Routers**
- **File**: `app/routers/competitive.py` - Bug Hunt mode now uses Judge0
- **File**: `app/routers/execute.py` - All execution endpoints use Judge0
- **File**: `app/services/queue_manager.py` - Competitive mode queue uses Judge0

### 4. **Configuration Updates**
- **File**: `app/core/config.py` - Added `judge0_base_url` configuration
- **File**: `.env` - Added `JUDGE0_BASE_URL` environment variable

## Judge0 Setup

### Local Installation

Your Judge0 instance is running at: `http://localhost:2358`

Test it with:
```bash
curl -X POST "http://localhost:2358/submissions?base64_encoded=true&wait=true" \
-H "Content-Type: application/json" \
-d '{
  "language_id": 71,
  "source_code": "cHJpbnQoIkhlbGxvIFdvcmxkIik="
}'
```

Expected response:
```json
{
  "stdout": "SGVsbG8gV29ybGQK\n",
  "time": "0.123",
  "memory": 12345,
  "stderr": null,
  "compile_output": null,
  "message": null,
  "status": {
    "id": 3,
    "description": "Accepted"
  }
}
```

## Language Support

Judge0 supports many more languages than Piston. The platform currently maps:

| Language | Judge0 ID | Description |
|----------|-----------|-------------|
| Python | 71 | Python 3.8.1 |
| Java | 62 | Java (OpenJDK 13.0.1) |
| C++ | 54 | C++ (GCC 9.2.0) |
| C | 50 | C (GCC 9.2.0) |
| JavaScript | 63 | JavaScript (Node.js 12.14.0) |
| TypeScript | 74 | TypeScript (3.7.4) |
| Go | 60 | Go (1.13.5) |
| Rust | 73 | Rust (1.40.0) |
| Ruby | 72 | Ruby (2.7.0) |
| PHP | 68 | PHP (7.4.1) |
| C# | 51 | C# (Mono 6.6.0.161) |

To add more languages, update the `language_map` in `judge0_executor.py`.

## API Endpoints

### Health Check
```bash
GET /execute/health
```

Response:
```json
{
  "status": "healthy",
  "judge0_url": "http://localhost:2358",
  "message": "Judge0 API is accessible"
}
```

### Get Supported Languages
```bash
GET /execute/languages
```

Response:
```json
{
  "languages": [...],
  "supported_by_platform": ["python", "java", "cpp", "c", "javascript", ...]
}
```

### Execute Code
```bash
POST /execute/run
Content-Type: application/json

{
  "code": "print('Hello World')",
  "language": "python",
  "test_input": "",
  "timeout": 10
}
```

Response:
```json
{
  "success": true,
  "output": "Hello World",
  "error": "",
  "execution_time": 0.123,
  "memory": 12345,
  "status": "Accepted",
  "status_id": 3
}
```

## Status Codes

Judge0 returns different status codes:

| ID | Description | Meaning |
|----|-------------|---------|
| 1 | In Queue | Submission is waiting in queue |
| 2 | Processing | Submission is being processed |
| 3 | Accepted | Code executed successfully ✅ |
| 4 | Wrong Answer | Output doesn't match expected |
| 5 | Time Limit Exceeded | Execution took too long ⏱️ |
| 6 | Compilation Error | Code failed to compile 🔴 |
| 7-12 | Runtime Error | Various runtime errors 💥 |
| 13 | Internal Error | Judge0 internal error |
| 14 | Exec Format Error | Invalid executable format |

## Migration Benefits

### 1. **Better Multi-Language Support**
- Judge0 natively supports 60+ languages
- No need for local runtime installations
- Consistent execution environment

### 2. **Improved Error Handling**
- Clear separation of compile-time vs runtime errors
- Detailed status codes
- Better timeout management

### 3. **Production Ready**
- Judge0 is battle-tested in production environments
- Better resource management
- Scalable architecture

### 4. **Enhanced Metrics**
- Execution time tracking
- Memory usage monitoring
- Better performance profiling

## Configuration

### Environment Variables

Add to `.env`:
```bash
# Judge0 Configuration
JUDGE0_BASE_URL=http://localhost:2358
```

For production, you might use:
```bash
JUDGE0_BASE_URL=https://judge0.yourcompany.com
```

### Docker Deployment

If using Docker for Judge0:
```yaml
services:
  judge0:
    image: judge0/judge0:latest
    ports:
      - "2358:2358"
    environment:
      - REDIS_HOST=redis
      - POSTGRES_HOST=postgres
```

## Testing

### 1. Check Judge0 Health
```bash
curl http://localhost:8000/execute/health
```

### 2. Test Python Execution
```bash
curl -X POST http://localhost:8000/execute/run \
-H "Content-Type: application/json" \
-d '{
  "code": "print(\"Hello from Judge0\")",
  "language": "python",
  "test_input": ""
}'
```

### 3. Test with Input
```bash
curl -X POST http://localhost:8000/execute/run \
-H "Content-Type: application/json" \
-d '{
  "code": "name = input()\nprint(f\"Hello {name}\")",
  "language": "python",
  "test_input": "World"
}'
```

### 4. Test Compilation Error
```bash
curl -X POST http://localhost:8000/execute/run \
-H "Content-Type: application/json" \
-d '{
  "code": "public class Main { public static void main(String[] args) { System.out.println(\"Hello\" } }",
  "language": "java",
  "test_input": ""
}'
```

## Troubleshooting

### Judge0 Not Running
**Error**: "Judge0 API is not accessible"

**Solution**:
1. Check if Judge0 is running: `curl http://localhost:2358/about`
2. Verify the URL in `.env` matches your Judge0 instance
3. Check firewall settings

### Base64 Encoding Issues
**Error**: "Invalid base64"

**Solution**: The Judge0 executor handles encoding automatically. If you see this error, check that you're passing plain text to the executor, not pre-encoded strings.

### Language Not Supported
**Error**: "Unsupported language: xyz"

**Solution**: 
1. Check the language name matches those in `language_map`
2. Add the language to `language_map` in `judge0_executor.py`
3. Verify Judge0 supports the language version

### Timeout Issues
**Error**: "Time limit exceeded"

**Solution**:
1. Increase the `timeout` parameter in your request
2. Check if the code has infinite loops
3. Verify Judge0 CPU time limits

## Rollback Plan

If you need to temporarily rollback to Piston:

1. Restore `piston_executor.py` imports in affected files
2. Update `.env` to remove `JUDGE0_BASE_URL`
3. Restart the backend service

However, Judge0 provides superior functionality and should be preferred.

## Performance Comparison

| Metric | Piston | Judge0 |
|--------|--------|--------|
| Languages | ~20 | 60+ |
| Execution Time | Good | Excellent |
| Error Detail | Basic | Detailed |
| Production Ready | Yes | Yes++ |
| Memory Tracking | No | Yes |
| Status Granularity | 3 states | 14 states |

## Future Enhancements

1. **Batch Execution**: Submit multiple test cases in parallel
2. **Custom Test Cases**: Allow users to define custom inputs
3. **Performance Benchmarking**: Track execution time leaderboards
4. **Language Analytics**: Show popular languages and success rates
5. **Code Templates**: Pre-populate with language-specific templates

## Support

For issues with:
- **Judge0 Integration**: Check this document and `judge0_executor.py`
- **Judge0 Installation**: See https://github.com/judge0/judge0
- **API Documentation**: Visit https://ce.judge0.com/

## Summary

The migration to Judge0 provides:
- ✅ Better multi-language support
- ✅ More detailed error reporting
- ✅ Production-ready infrastructure
- ✅ Enhanced metrics and monitoring
- ✅ Scalable architecture

All existing functionality is preserved while gaining these improvements.
