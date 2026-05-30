"""
Seed script to populate the database with initial problems for competitive mode.
Run this script once to add starter problems to your database.

Usage:
    python seed_problems.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "codo-ai")

# Initial problems for competitive mode
INITIAL_PROBLEMS = [
    {
        "title": "Sum of Two Numbers",
        "description": "Write a program that reads two integers and outputs their sum.",
        "difficulty": "easy",
        "topics": ["basics", "math"],
        "testCases": [
            {"input": "5\n3", "expected": "8"},
            {"input": "10\n20", "expected": "30"},
            {"input": "-5\n5", "expected": "0"},
            {"input": "0\n0", "expected": "0"}
        ],
        "examples": [
            {"input": "5\n3", "output": "8", "explanation": "5 + 3 = 8"}
        ],
        "hint": "Use the + operator to add the two numbers",
        "starterCode": {
            "python": "a = int(input())\nb = int(input())\nprint(a + b)",
            "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}",
            "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}"
        },
        "referenceCode": {
            "python": "a = int(input())\nb = int(input())\nprint(a + b)",
            "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}",
            "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}"
        }
    },
    {
        "title": "Even or Odd",
        "description": "Given an integer, determine if it's even or odd. Print 'Even' if even, 'Odd' if odd.",
        "difficulty": "easy",
        "topics": ["basics", "conditionals"],
        "testCases": [
            {"input": "4", "expected": "Even"},
            {"input": "7", "expected": "Odd"},
            {"input": "0", "expected": "Even"},
            {"input": "-3", "expected": "Odd"}
        ],
        "examples": [
            {"input": "4", "output": "Even", "explanation": "4 is divisible by 2"}
        ],
        "hint": "Use the modulo operator % to check if a number is divisible by 2",
        "starterCode": {
            "python": "n = int(input())\nif n % 2 == 0:\n    print('Even')\nelse:\n    print('Odd')",
            "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n % 2 == 0) {\n        cout << \"Even\" << endl;\n    } else {\n        cout << \"Odd\" << endl;\n    }\n    return 0;\n}",
            "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n % 2 == 0) {\n            System.out.println(\"Even\");\n        } else {\n            System.out.println(\"Odd\");\n        }\n    }\n}"
        },
        "referenceCode": {
            "python": "n = int(input())\nif n % 2 == 0:\n    print('Even')\nelse:\n    print('Odd')",
            "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n % 2 == 0) {\n        cout << \"Even\" << endl;\n    } else {\n        cout << \"Odd\" << endl;\n    }\n    return 0;\n}",
            "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n % 2 == 0) {\n            System.out.println(\"Even\");\n        } else {\n            System.out.println(\"Odd\");\n        }\n    }\n}"
        }
    },
    {
        "title": "Maximum of Three",
        "description": "Given three integers, find and print the maximum value.",
        "difficulty": "easy",
        "topics": ["basics", "conditionals"],
        "testCases": [
            {"input": "5\n3\n9", "expected": "9"},
            {"input": "10\n20\n15", "expected": "20"},
            {"input": "-1\n-5\n-3", "expected": "-1"},
            {"input": "7\n7\n7", "expected": "7"}
        ],
        "examples": [
            {"input": "5\n3\n9", "output": "9", "explanation": "9 is the largest of the three numbers"}
        ],
        "hint": "Compare the numbers using if-else statements or use the max() function",
        "starterCode": {
            "python": "a = int(input())\nb = int(input())\nc = int(input())\nprint(max(a, b, c))",
            "cpp": "#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    cout << max({a, b, c}) << endl;\n    return 0;\n}",
            "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        int c = sc.nextInt();\n        System.out.println(Math.max(a, Math.max(b, c)));\n    }\n}"
        },
        "referenceCode": {
            "python": "a = int(input())\nb = int(input())\nc = int(input())\nprint(max(a, b, c))",
            "cpp": "#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    cout << max({a, b, c}) << endl;\n    return 0;\n}",
            "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        int c = sc.nextInt();\n        System.out.println(Math.max(a, Math.max(b, c)));\n    }\n}"
        }
    },
    {
        "title": "Count Digits",
        "description": "Given a positive integer, count and print the number of digits.",
        "difficulty": "easy",
        "topics": ["basics", "loops", "math"],
        "testCases": [
            {"input": "12345", "expected": "5"},
            {"input": "1", "expected": "1"},
            {"input": "999", "expected": "3"},
            {"input": "1000000", "expected": "7"}
        ],
        "examples": [
            {"input": "12345", "output": "5", "explanation": "The number has 5 digits"}
        ],
        "hint": "Convert to string and get length, or repeatedly divide by 10",
        "starterCode": {
            "python": "n = int(input())\nprint(len(str(n)))",
            "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string n;\n    cin >> n;\n    cout << n.length() << endl;\n    return 0;\n}",
            "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String n = sc.next();\n        System.out.println(n.length());\n    }\n}"
        },
        "referenceCode": {
            "python": "n = int(input())\nprint(len(str(n)))",
            "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string n;\n    cin >> n;\n    cout << n.length() << endl;\n    return 0;\n}",
            "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String n = sc.next();\n        System.out.println(n.length());\n    }\n}"
        }
    },
    {
        "title": "Factorial",
        "description": "Calculate and print the factorial of a non-negative integer n (n!).",
        "difficulty": "medium",
        "topics": ["math", "loops"],
        "testCases": [
            {"input": "5", "expected": "120"},
            {"input": "0", "expected": "1"},
            {"input": "1", "expected": "1"},
            {"input": "7", "expected": "5040"}
        ],
        "examples": [
            {"input": "5", "output": "120", "explanation": "5! = 5 × 4 × 3 × 2 × 1 = 120"}
        ],
        "hint": "Use a loop to multiply numbers from 1 to n",
        "starterCode": {
            "python": "n = int(input())\nresult = 1\nfor i in range(1, n + 1):\n    result *= i\nprint(result)",
            "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long result = 1;\n    for (int i = 1; i <= n; i++) {\n        result *= i;\n    }\n    cout << result << endl;\n    return 0;\n}",
            "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long result = 1;\n        for (int i = 1; i <= n; i++) {\n            result *= i;\n        }\n        System.out.println(result);\n    }\n}"
        },
        "referenceCode": {
            "python": "n = int(input())\nresult = 1\nfor i in range(1, n + 1):\n    result *= i\nprint(result)",
            "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long result = 1;\n    for (int i = 1; i <= n; i++) {\n        result *= i;\n    }\n    cout << result << endl;\n    return 0;\n}",
            "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long result = 1;\n        for (int i = 1; i <= n; i++) {\n            result *= i;\n        }\n        System.out.println(result);\n    }\n}"
        }
    }
]

async def seed_problems():
    """Seed the database with initial problems"""
    
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB_NAME]
    
    try:
        print("🌱 Seeding database with initial problems...")
        
        # Check if problems already exist
        existing_count = await db.problems.count_documents({})
        print(f"📊 Current problem count: {existing_count}")
        
        if existing_count > 0:
            response = input("⚠️  Problems already exist. Do you want to add more? (y/n): ")
            if response.lower() != 'y':
                print("❌ Seeding cancelled")
                return
        
        # Insert problems
        inserted_count = 0
        for problem in INITIAL_PROBLEMS:
            # Check if problem with same title exists
            existing = await db.problems.find_one({"title": problem["title"]})
            if existing:
                print(f"⏭️  Skipping '{problem['title']}' (already exists)")
                continue
            
            result = await db.problems.insert_one(problem)
            print(f"✅ Added: {problem['title']} (ID: {result.inserted_id})")
            inserted_count += 1
        
        print(f"\n🎉 Successfully added {inserted_count} problems!")
        print(f"📊 Total problems in database: {await db.problems.count_documents({})}")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Problem Database Seeder")
    print("=" * 60)
    asyncio.run(seed_problems())
