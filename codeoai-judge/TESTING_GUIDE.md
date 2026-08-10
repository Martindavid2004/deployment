# CodoAI Judge Local Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
1. **Docker Desktop** - Install and start Docker Desktop
2. **Internet connection** - For downloading base images

### Automated Testing
```bash
# Run the complete test suite
test-local.bat

# This will:
# ✅ Check Docker
# ✅ Build image  
# ✅ Start services
# ✅ Initialize database
# ✅ Test all 5 languages
# ✅ Generate test reports
```

## 🧪 Manual Testing Steps

### 1. Start Services
```bash
# Build and start
docker-compose up --build -d

# Check status
docker-compose ps
```

### 2. Initialize Database
```bash
# Create and seed database
docker-compose exec server rails db:create db:migrate db:seed
```

### 3. Test API Endpoints

#### Get Supported Languages
```bash
curl http://localhost:2358/languages
```
**Expected Response:**
```json
[
  {"id": 1, "name": "C (GCC 9.4.0)"},
  {"id": 2, "name": "C++ (G++ 9.4.0)"},
  {"id": 3, "name": "Java (OpenJDK 11)"},
  {"id": 4, "name": "Python (3.8)"},
  {"id": 5, "name": "JavaScript (Node.js)"}
]
```

#### Test C Code Execution
```bash
curl -X POST http://localhost:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 1,
    "source_code": "#include<stdio.h>\nint main(){\n  printf(\"Hello World!\");\n  return 0;\n}",
    "wait": true
  }'
```

#### Test C++ Code Execution
```bash
curl -X POST http://localhost:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 2,
    "source_code": "#include<iostream>\nint main(){\n  std::cout<<\"Hello C++!\"<<std::endl;\n  return 0;\n}",
    "wait": true
  }'
```

#### Test Java Code Execution
```bash
curl -X POST http://localhost:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 3,
    "source_code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello Java!\");\n  }\n}",
    "wait": true
  }'
```

#### Test Python Code Execution
```bash
curl -X POST http://localhost:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 4,
    "source_code": "print(\"Hello Python!\")",
    "wait": true
  }'
```

#### Test JavaScript Code Execution
```bash
curl -X POST http://localhost:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 5,
    "source_code": "console.log(\"Hello JavaScript!\");",
    "wait": true
  }'
```

## 🔍 Expected Successful Response

```json
{
  "token": "abc123-def456",
  "source_code": "console.log(\"Hello JavaScript!\");",
  "language_id": 5,
  "language": {
    "id": 5,
    "name": "JavaScript (Node.js)"
  },
  "stdin": null,
  "stdout": "Hello JavaScript!\n",
  "stderr": null,
  "status_id": 3,
  "status": {
    "id": 3,
    "description": "Accepted"
  },
  "created_at": "2024-08-06T10:30:00.000Z",
  "finished_at": "2024-08-06T10:30:01.123Z",
  "time": "0.045",
  "wall_time": 0.123,
  "memory": 2048,
  "compile_output": null,
  "message": null,
  "exit_code": 0,
  "exit_signal": null
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Docker not running
**Error:** `Cannot connect to Docker daemon`
**Solution:** Start Docker Desktop and wait for it to fully initialize

#### 2. Port already in use
**Error:** `Port 2358 already in use`
**Solution:** 
```bash
docker-compose down
# Wait a moment, then
docker-compose up -d
```

#### 3. Database connection error
**Error:** `could not connect to server`
**Solution:**
```bash
# Restart services
docker-compose restart
# Wait 30 seconds
docker-compose exec server rails db:create db:migrate db:seed
```

#### 4. Compilation errors
**Error:** `Compilation Error status`
**Check:** 
- Source code syntax
- Language ID matches code language
- Check logs: `docker-compose logs worker`

#### 5. Service not responding
**Check service status:**
```bash
docker-compose ps
docker-compose logs server
docker-compose logs worker
```

## 📊 Performance Testing

### Load Testing with Apache Bench
```bash
# Install Apache Bench (if not installed)
# Test concurrent requests
ab -n 100 -c 10 -H "Content-Type: application/json" \
   -p test_payload.json \
   http://localhost:2358/submissions
```

### Create test payload file:
```json
{
  "language_id": 4,
  "source_code": "print('Hello from load test!')",
  "wait": false
}
```

## 🎯 Success Criteria

✅ **All services start successfully**
✅ **Database initializes with 5 languages**  
✅ **API responds to /languages endpoint**
✅ **All 5 languages compile and execute correctly**
✅ **Responses include execution time and memory usage**
✅ **Error handling works for invalid code**
✅ **Performance is noticeably faster than Judge0**

## 📝 Test Checklist

- [ ] Docker services start
- [ ] Database seeded with 5 languages
- [ ] C code compiles and runs
- [ ] C++ code compiles and runs  
- [ ] Java code compiles and runs
- [ ] Python code executes
- [ ] JavaScript code executes
- [ ] API returns proper JSON responses
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] Memory usage is reasonable
- [ ] Services can be stopped/started cleanly

## 🎉 Next Steps After Successful Testing

1. **Document any issues found**
2. **Benchmark performance vs original Judge0**
3. **Test with your specific use cases**
4. **Prepare for deployment to staging/production**
5. **Set up monitoring and logging**