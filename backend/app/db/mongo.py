from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient | None = None
db = None

async def connect_to_mongo():
    global client, db
    try:
        print(f"🔄 Connecting to MongoDB...")
        print(f"📍 URI: {settings.mongodb_uri[:50]}...")
        print(f"📦 Database: {settings.mongodb_db_name}")
        
        client = AsyncIOMotorClient(settings.mongodb_uri)
        db = client[settings.mongodb_db_name]
        
        # Test the connection
        await client.admin.command('ping')
        print(f"✅ Successfully connected to MongoDB!")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")

def get_database():
    """Get the database instance. Use this in route handlers."""
    if db is None:
        # Try to connect if not connected
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If event loop is running, we can't await, so raise error
                raise RuntimeError("Database not initialized. Make sure the app has started.")
            else:
                # Try to connect synchronously (this might not work with async)
                raise RuntimeError("Database not initialized. Make sure the app has started.")
        except:
            raise RuntimeError("Database not initialized. Make sure the app has started.")
    return db
