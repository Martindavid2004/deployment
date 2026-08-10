# CodoAI Judge API Documentation

**Base URL:** `http://localhost:8888`

CodoAI Judge is a lightweight code execution API that supports 5 programming languages. It provides Judge0-compatible endpoints for seamless integration.

## 📋 **Available Endpoints**

### **1. Get Supported Languages**
```
GET /languages
```
**Description:** Returns list of all supported programming languages  
**Response:** Array of language objects with ID and name

**Example Request:**
```bash
curl http://localhost:8888/languages
```

**Example Response:**
```json
[
  {"id": 1, "name": "C (GCC)"},
  {"id": 2, "name": "C++ (G++)"},
  {"id": 3, "name": "Java (OpenJDK)"},
  {"id": 4, "name": "Python (3.x)"},
  {"id": 5, "name": "JavaScript (Node.js)"}
]
```

---

### **2. Health Check**
```
GET /health
```
**Description:** Check if the API server is running  
**Response:** Status message

**Example Request:**
```bash
curl http://localhost:8888/health
```

**Example Response:**
```json
{
  "status": "OK",
  "message": "CodoAI Judge is running"
}
```

---

### **3. Execute Code**
```
POST /submissions
```
**Description:** Compile and execute source code  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "language_id": 1,           // Required: Language ID (1-5)
  "source_code": "...",       // Required: Source code to execute
  "stdin": "...",             // Optional: Input for the program
  "wait": true                // Optional: Wait for result (default: false)
}
```

**Response:** Submission object with execution results

**Example Request (Python):**
```bash
curl -X POST http://localhost:8888/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 4,
    "source_code": "print(\"Hello CodoAI!\")",
    "wait": true
  }'
```

**Example Request (C++):**
```bash
curl -X POST http://localhost:8888/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 2,
    "source_code": "#include<iostream>\nint main(){\n  std::cout<<\"Hello World!\";\n  return 0;\n}",
    "wait": true
  }'
```

**Example Request (Java):**
```bash
curl -X POST http://localhost:8888/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 3,
    "source_code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello Java!\");\n  }\n}",
    "wait": true
  }'
```

**Example Response:**
```json
{
  "token": "abc123-def456-789",
  "language_id": 4,
  "language": {
    "id": 4,
    "name": "Python (3.x)"
  },
  "source_code": "print('Hello CodoAI!')",
  "stdin": null,
  "stdout": "Hello CodoAI!\n",
  "stderr": null,
  "status_id": 3,
  "status": {
    "id": 3,
    "description": "Accepted"
  },
  "created_at": "2026-08-07T12:30:00.000Z",
  "finished_at": "2026-08-07T12:30:01.123Z",
  "time": 0.045,
  "memory": 1024,
  "exit_code": 0,
  "compile_output": null,
  "message": null
}
```

---

## 🎯 **Language IDs**

| ID | Language | Compiler/Runtime |
|----|----------|------------------|
| 1  | C | GCC |
| 2  | C++ | G++ |
| 3  | Java | OpenJDK |
| 4  | Python | Python 3.x |
| 5  | JavaScript | Node.js |

---

## 📊 **Status Codes**

| Status ID | Description | Meaning |
|-----------|-------------|---------|
| 3 | Accepted | Code executed successfully |
| 4 | Runtime Error | Code crashed during execution |
| 5 | Time Limit Exceeded | Code took too long to execute |
| 6 | Compilation Error | Code failed to compile |
| 13 | Internal Error | Server error occurred |

---

## ⚠️ **Limitations**

- **Execution Time:** 10 seconds maximum
- **Memory:** Basic limit (no strict enforcement)
- **File Size:** Reasonable source code size
- **Security:** Basic execution (no advanced sandboxing)

---

## 🔧 **Testing Examples**

### **Test All Languages:**
```bash
# C
curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":1,"source_code":"#include<stdio.h>\nint main(){\n printf(\"Hello C!\");\n return 0;\n}","wait":true}'

# C++  
curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":2,"source_code":"#include<iostream>\nint main(){\n std::cout<<\"Hello C++!\";\n return 0;\n}","wait":true}'

# Java
curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":3,"source_code":"public class Main {\n public static void main(String[] args) {\n System.out.println(\"Hello Java!\");\n }\n}","wait":true}'

# Python
curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":4,"source_code":"print(\"Hello Python!\")","wait":true}'

# JavaScript
curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":5,"source_code":"console.log(\"Hello JavaScript!\");","wait":true}'
```

### **Test with Input:**
```bash
# Python with stdin
curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":4,"source_code":"name = input()\nprint(f\"Hello {name}!\")","stdin":"CodoAI","wait":true}'
```

---

## 🚀 **Quick Start**

1. **Check if server is running:**
   ```bash
   curl http://localhost:8888/health
   ```

2. **Get available languages:**
   ```bash
   curl http://localhost:8888/languages  
   ```

3. **Execute your first code:**
   ```bash
   curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":4,"source_code":"print(\"Hello World!\")","wait":true}'
   ```

That's it! You now have a complete, lightweight code execution API ready to use! 🎉