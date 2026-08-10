# CodoAI Project Structure

```
codoai/
├── README.md                    # Main project documentation
├── simple-server/               # CodoAI Engine (Docker ready)
│   ├── server.js               # Main API server
│   ├── package.json            # Node.js dependencies
│   ├── Dockerfile              # Container definition
│   ├── docker-compose.yml      # Easy deployment
│   ├── API_DOCUMENTATION.md    # Complete API guide
│   └── temp/                   # Temporary execution files
│
├── PERFORMANCE_COMPARISON.md    # Performance benchmarks
└── PROJECT_STRUCTURE.md        # This file

Legacy Files (can be removed):
├── app/                        # Old Rails application
├── config/                     # Old Rails configuration  
├── db/                         # Old database files
└── other Judge0 files...       # Original Judge0 codebase
```

## 🎯 **Active CodoAI Components:**

### **Production Ready:**
- `simple-server/` - **Main CodoAI Engine**
- `README.md` - **Product documentation**
- `PERFORMANCE_COMPARISON.md` - **Benchmarks**

### **Development:**
- `simple-server/API_DOCUMENTATION.md` - **Developer guide**
- `PROJECT_STRUCTURE.md` - **Project overview**

## 🚀 **Quick Commands:**

```bash
# Start CodoAI
cd simple-server
docker-compose up --build

# Access CodoAI
open http://localhost:8888/languages

# View documentation
cat README.md
cat simple-server/API_DOCUMENTATION.md
```

---

**Focus on `simple-server/` - that's your complete CodoAI product!** 🎯