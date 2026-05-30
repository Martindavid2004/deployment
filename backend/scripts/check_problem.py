import asyncio
from app.db.mongo import get_database, connect_to_mongo, close_mongo_connection
from bson import ObjectId
import json

async def check_problem():
    await connect_to_mongo()
    db = get_database()
    
    problem_id = "696f73a681408db737ce32f4"
    
    # Get the problem
    problem = await db.problems.find_one({"_id": ObjectId(problem_id)})
    
    if problem:
        print("Problem found:")
        print(f"Title: {problem.get('title')}")
        print(f"Description: {problem.get('description', 'N/A')[:100]}...")
        print(f"\nExamples field exists: {'examples' in problem}")
        if 'examples' in problem:
            print(f"Number of examples: {len(problem.get('examples', []))}")
            print(f"Examples: {json.dumps(problem.get('examples', []), indent=2)}")
        else:
            print("❌ Examples field is missing!")
            
        print(f"\nTest cases: {len(problem.get('testCases', []))} test cases")
        if problem.get('testCases'):
            print(f"First test case: {problem['testCases'][0]}")
    else:
        print("❌ Problem not found")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(check_problem())
