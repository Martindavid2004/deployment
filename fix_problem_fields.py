import asyncio
from app.db.mongo import get_database, connect_to_mongo, close_mongo_connection
from bson import ObjectId

async def fix_problem_fields():
    await connect_to_mongo()
    db = get_database()
    
    problem_id = "696f73a681408db737ce32f4"
    
    # Get current problem
    problem = await db.problems.find_one({"_id": ObjectId(problem_id)})
    
    if problem:
        print(f"Current problem: {problem.get('title')}")
        print(f"Has description: {'description' in problem}")
        print(f"Has examples: {'examples' in problem}")
        print(f"Has testCases: {'testCases' in problem}")
        print(f"Has starterCode: {'starterCode' in problem}")
        print(f"Has hint: {'hint' in problem}")
        
        # Add the missing fields from the fallback problem definition
        update_data = {
            "description": "Find the maximum element in an array of integers.",
            "examples": [
                {
                    "input": "5\n3 7 2 9 1",
                    "output": "9",
                    "explanation": "9 is the largest number"
                }
            ],
            "testCases": [
                {"input": "5\n3 7 2 9 1", "expected": "9"},
                {"input": "3\n-5 -2 -8", "expected": "-2"},
                {"input": "1\n42", "expected": "42"},
                {"input": "4\n100 200 50 150", "expected": "200"}
            ],
            "hint": "Keep track of the maximum value as you iterate",
            "starterCode": {
                "python": "def solution(arr):\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    print(solution(arr))",
                "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint solution(vector<int>& arr) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n    cout << solution(arr);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] arr) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) {\n            arr[i] = sc.nextInt();\n        }\n        System.out.println(solution(arr));\n    }\n}"
            }
        }
        
        result = await db.problems.update_one(
            {"_id": ObjectId(problem_id)},
            {"$set": update_data}
        )
        
        print(f"\n✅ Updated {result.modified_count} problem(s)")
        
        # Verify
        updated = await db.problems.find_one({"_id": ObjectId(problem_id)})
        print(f"\nAfter update:")
        print(f"Has description: {'description' in updated}")
        print(f"Has examples: {'examples' in updated}")
        print(f"Has testCases: {'testCases' in updated}")
        print(f"Has starterCode: {'starterCode' in updated}")
        print(f"Has hint: {'hint' in updated}")
    else:
        print("❌ Problem not found")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(fix_problem_fields())
