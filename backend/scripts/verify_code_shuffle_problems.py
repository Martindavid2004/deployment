"""
Verify Code Shuffle problems are in database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def verify_problems():
    MONGODB_URI = os.getenv("MONGODB_URI")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "codo-ai")
    
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB_NAME]
    
    print("=" * 70)
    print("Code Shuffle Problems Verification")
    print("=" * 70)
    
    # Count all problems
    total = await db.problems.count_documents({})
    print(f"\n📊 Total problems in database: {total}")
    
    # Count problems with Python reference code
    with_ref = await db.problems.count_documents({
        "referenceCode.python": {"$exists": True, "$ne": ""}
    })
    print(f"✅ Problems with Python reference code: {with_ref}")
    
    # List problems with reference code
    problems = await db.problems.find({
        "referenceCode.python": {"$exists": True, "$ne": ""}
    }).to_list(None)
    
    print(f"\n📝 Problems suitable for Code Shuffle:\n")
    for i, p in enumerate(problems, 1):
        ref_code = p.get("referenceCode", {}).get("python", "")
        lines = len([l for l in ref_code.split('\n') if l.strip()])
        print(f"  {i}. {p.get('title', 'Untitled')}")
        print(f"     - Difficulty: {p.get('difficulty', 'N/A')}")
        print(f"     - Lines of code: {lines}")
        print(f"     - ID: {p.get('_id')}")
        print()
    
    if with_ref > 0:
        print("🎉 SUCCESS! Code Shuffle mode should work now!")
        print("\n💡 Next steps:")
        print("   1. Restart backend if it's running")
        print("   2. Try creating a Code Shuffle match")
        print("   3. Check if shuffled lines appear in UI")
    else:
        print("⚠️  WARNING: No problems with reference code found!")
        print("\n💡 Fix:")
        print("   Run: python seed_problems.py")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(verify_problems())
