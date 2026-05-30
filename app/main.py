from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from contextlib import asynccontextmanager
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_settings
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.routers import auth, users, problems, attempts, leaderboard, execute, competitive

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await connect_to_mongo()
    except Exception as e:
        print(f"Warning: MongoDB connection failed: {e}")
        print("Continuing without database connection...")
    
    # Initialize Bug Hunt Piston Upgrade services
    try:
        from app.routers.competitive import get_queue_manager
        from app.services.question_loader import QuestionLoader
        from app.db.mongo import get_database
        from pathlib import Path
        
        print("🚀 Initializing Bug Hunt Piston Upgrade services...")
        
        # Initialize and start queue manager
        queue_manager = get_queue_manager()
        try:
            await queue_manager.start()
            print("✅ Queue Manager started successfully")
        except Exception as e:
            print(f"❌ Failed to start Queue Manager: {e}")
            import traceback
            traceback.print_exc()
            raise
        
        # Verify JSON backup file exists
        json_path = Path("data/bug_hunt_questions.json")
        if not json_path.exists():
            print(f"⚠️ Warning: Bug hunt questions JSON file not found at {json_path}")
        else:
            print(f"✅ Bug hunt questions JSON file found")
        
        # Pre-load questions
        try:
            db = get_database()
            question_loader = QuestionLoader(db=db)
            await question_loader.preload_questions()
            print("✅ Bug hunt questions pre-loaded")
        except Exception as e:
            print(f"⚠️ Warning: Failed to pre-load questions: {e}")
        
        print("✅ Bug Hunt Piston Upgrade services initialized")
    except Exception as e:
        print(f"⚠️ Warning: Failed to initialize Bug Hunt services: {e}")
    
    yield
    
    # Shutdown
    try:
        # Stop queue manager
        from app.routers.competitive import get_queue_manager
        queue_manager = get_queue_manager()
        await queue_manager.stop()
        print("✅ Queue Manager stopped")
    except Exception as e:
        print(f"⚠️ Warning: Error stopping Queue Manager: {e}")
    
    try:
        await close_mongo_connection()
    except Exception as e:
        print(f"Warning: Error closing MongoDB connection: {e}")

app = FastAPI(title="codoAI Backend", version="1.0.0", lifespan=lifespan)

# Custom middleware to handle dev tunnels CORS properly
class DevTunnelCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Get origin from request
        origin = request.headers.get("origin", "*")
        
        # Handle preflight OPTIONS requests immediately
        if request.method == "OPTIONS":
            return JSONResponse(
                content="OK",
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": origin if origin else "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "86400",
                    "Vary": "Origin",
                }
            )
        
        # Process actual request
        response = await call_next(request)
        
        # Force CORS headers on all responses
        response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"
        
        return response

# Add custom CORS middleware first
app.add_middleware(DevTunnelCORSMiddleware)

# CORS configuration - Keep for additional compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev tunnels
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Exception handlers to ensure CORS headers are present even on errors
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Vary": "Origin",
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Vary": "Origin",
        }
    )

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(problems.router)
app.include_router(attempts.router)
app.include_router(leaderboard.router)
app.include_router(execute.router)
app.include_router(competitive.router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "codoAI Backend API",
        "version": "1.0.0",
        "status": "running",
        "cors_enabled": True
    }

# Test endpoint for CORS
@app.get("/test")
async def test_endpoint():
    return {"message": "CORS test successful", "timestamp": "2026-02-09"}

# OPTIONS endpoint for manual CORS testing
@app.options("/{full_path:path}")
async def options_handler(request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )
