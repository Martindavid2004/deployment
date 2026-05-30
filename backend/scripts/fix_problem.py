import asyncio
from app.db.mongo import get_database, connect_to_mongo, close_mongo_connection
from bson import ObjectId

async def fix_problem():
    await connect_to_mongo()
    db = get_database()
    
    problem_id = "696f73a681408db737ce32f4"
    
    # Update the problem with missing fields
    result = await db.problems.update_one(
        {"_id": ObjectId(problem_id)},
        {
            "$set": {
                "difficulty": "Medium",  # Capitalize
                "videoUrl": "",
                "referenceCode": {"python": "", "cpp": "", "java": ""},
                "buggyCode": {},
                "explanations": {"approach": [], "complexity": []},
                "sampleTests": []
            }
        }
    )
    
    print(f"✅ Updated {result.modified_count} problem(s)")
    
    # Verify the update
    problem = await db.problems.find_one({"_id": ObjectId(problem_id)})
    if problem:
        print(f"Problem title: {problem.get('title')}")
        print(f"Difficulty: {problem.get('difficulty')}")
        print(f"Has videoUrl: {'videoUrl' in problem}")
        print(f"Has referenceCode: {'referenceCode' in problem}")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(fix_problem())
