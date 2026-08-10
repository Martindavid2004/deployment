# CodoAI - Code Execution Engine

**CodoAI** is a lightweight, high-performance code execution API that supports 5 programming languages. Built for speed, simplicity, and reliability.

## 🚀 **Features**

- **5 Programming Languages**: C, C++, Java, Python, JavaScript
- **Fast Execution**: Optimized for performance and low latency  
- **Docker Ready**: One-command deployment with all dependencies
- **REST API**: Simple HTTP endpoints for easy integration
- **Judge0 Compatible**: Drop-in replacement with same API format
- **Lightweight**: ~100MB Docker image vs 3GB+ alternatives

## 🎯 **Quick Start**

### **1. Run with Docker (Recommended)**
```bash
# Clone and navigate
git clone <your-repo>
cd codoai/simple-server

# Start CodoAI
docker-compose up --build

# CodoAI is now running at http://localhost:8888
```

### **2. Test the API**
```bash
# Get supported languages
curl http://localhost:8888/languages

# Execute Python code
curl -X POST http://localhost:8888/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 4,
    "source_code": "print(\"Hello CodoAI!\")",
    "wait": true
  }'
```

## 📋 **Supported Languages**

| ID | Language | Runtime | Extension |
|----|----------|---------|-----------|
| 1 | C | GCC | `.c` |
| 2 | C++ | G++ | `.cpp` |
| 3 | Java | OpenJDK | `.java` |
| 4 | Python | Python 3.x | `.py` |
| 5 | JavaScript | Node.js | `.js` |

## 🔧 **API Endpoints**

### **Get Languages**
```
GET /languages
```
Returns list of supported programming languages.

### **Execute Code**  
```
POST /submissions
```
Compiles and executes source code.

**Request Body:**
```json
{
  "language_id": 4,
  "source_code": "print('Hello World!')",
  "stdin": "optional input",
  "wait": true
}
```

**Response:**
```json
{
  "token": "unique-id",
  "stdout": "Hello World!\n",
  "stderr": null,
  "status_id": 3,
  "status": {"id": 3, "description": "Accepted"},
  "time": 0.045,
  "memory": 1024,
  "exit_code": 0
}
```

### **Health Check**
```
GET /health
```
Returns server status and statistics.

## 🐳 **Docker Deployment**

### **Production Ready**
```bash
# Build and run
docker-compose up -d

# Scale for high load  
docker-compose up -d --scale codoai=3

# View logs
docker-compose logs -f
```

### **Configuration**
The Docker setup includes:
- ✅ All 5 language compilers pre-installed
- ✅ Secure execution environment  
- ✅ Automatic cleanup and resource management
- ✅ Production-ready logging and monitoring

## 📊 **Performance**

### **Execution Speed**
- **C/C++**: ~0.3s compile + ~0.1s execution
- **Java**: ~1.1s compile + ~0.2s execution  
- **Python**: ~0.1s execution (interpreted)
- **JavaScript**: ~0.2s execution (Node.js)

### **Concurrent Handling**
- **Optimal**: 1-10 concurrent requests
- **Good**: 10-20 concurrent requests
- **Scale**: Use multiple containers for 50+ requests

### **Resource Usage**
- **Memory**: ~100MB base + ~50MB per execution
- **CPU**: Low baseline, spikes during compilation
- **Disk**: Temporary files cleaned automatically

## 🔒 **Security**

### **Execution Isolation**
- ✅ Docker container isolation
- ✅ Temporary file cleanup
- ✅ Resource limits (10s timeout)
- ✅ No network access for executed code

### **Production Considerations**
For production deployment, consider:
- Rate limiting
- Input validation  
- Resource monitoring
- Load balancing
- Advanced sandboxing

## 🛠 **Development**

### **Local Development**
```bash
# Run without Docker (requires compilers installed)
cd simple-server
npm install
npm start

# Server runs on http://localhost:2358
```

### **Testing**
```bash
# Test all languages
curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":1,"source_code":"#include<stdio.h>\nint main(){printf(\"C works!\");return 0;}","wait":true}'

curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":2,"source_code":"#include<iostream>\nint main(){std::cout<<\"C++ works!\";return 0;}","wait":true}'

curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":3,"source_code":"public class Main{public static void main(String[] args){System.out.println(\"Java works!\");}}","wait":true}'

curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":4,"source_code":"print(\"Python works!\")","wait":true}'

curl -X POST http://localhost:8888/submissions -H "Content-Type: application/json" -d '{"language_id":5,"source_code":"console.log(\"JavaScript works!\");","wait":true}'
```

## 📈 **Use Cases**

### **Perfect For:**
- **Online IDEs**: Code playgrounds and editors
- **Educational Platforms**: Programming courses and tutorials  
- **Interview Platforms**: Technical assessment tools
- **Contest Platforms**: Programming competitions
- **API Services**: Code execution as a service

### **Integration Examples**
```javascript
// Frontend integration
const response = await fetch('http://localhost:8888/submissions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language_id: 4,
    source_code: userCode,
    wait: true
  })
});
const result = await response.json();
console.log(result.stdout);
```

## 🔧 **Architecture**

### **Technology Stack**
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Containerization**: Docker
- **Languages**: GCC, G++, OpenJDK, Python 3, Node.js

### **Design Principles**
- **Simplicity**: Minimal dependencies, easy to understand
- **Performance**: Optimized for speed and low resource usage
- **Reliability**: Robust error handling and cleanup
- **Compatibility**: Judge0 API compatible for easy migration

## 📞 **Support**

### **Documentation**
- API Documentation: `/simple-server/API_DOCUMENTATION.md`
- Performance Guide: `/PERFORMANCE_COMPARISON.md`

### **Issues**
- Report bugs and feature requests on GitHub
- Check logs: `docker-compose logs -f`

---

## 🎉 **About CodoAI**

**CodoAI** is designed to be the fastest, simplest, and most reliable code execution engine for modern applications. Built with performance and developer experience in mind.

**Built by developers, for developers.** 🚀

---

*CodoAI - Execute code at the speed of thought.*