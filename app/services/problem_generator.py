import google.generativeai as genai
from app.core.config import get_settings
import json
import random
import os

settings = get_settings()

# Configure Gemini - Check both settings and environment variable
api_key = settings.google_api_key or os.getenv("GOOGLE_API_KEY", "")

print(f"[INIT] Problem Generator - Google API Key configured: {bool(api_key)}")

if api_key:
    genai.configure(api_key=api_key)
    print(f"[SUCCESS] Gemini API configured successfully")
else:
    print(f"[WARNING] No Google API Key found - will use fallback problems")

DIFFICULTY_LEVELS = ["easy", "medium", "hard"]
TOPICS = ["arrays", "strings", "math", "loops", "conditionals", "recursion", "sorting"]

def generate_competitive_problem(difficulty: str = "easy") -> dict:
    """
    Generate a random coding problem using Gemini API for competitive mode.
    Each call generates a unique problem for variety in competitive matches.
    Falls back to predefined problems if API is not available.
    """
    
    if not api_key:
        print(f"[WARNING] No API key available, using fallback {difficulty} problem")
        return _get_fallback_problem(difficulty)
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        # Enhanced prompt for harder, more diverse problems
        difficulty_instructions = {
            "easy": "Problem should be solvable in 5-10 minutes for beginners",
            "medium": "Problem should require basic algorithms and data structures, solvable in 10-20 minutes",
            "hard": "Problem should be challenging, require complex algorithms, and be solvable in 15-30 minutes. Include multiple edge cases."
        }
        
        difficulty_level = difficulty.lower()
        instruction = difficulty_instructions.get(difficulty_level, difficulty_instructions["easy"])
        
        prompt = f"""Generate a UNIQUE competitive programming problem for difficulty level: {difficulty_level}.
IMPORTANT: Each call must generate a completely different, novel problem. Never repeat problems.

Requirements:
1. {instruction}
2. Include clear, detailed problem description with examples
3. Provide 4-5 comprehensive test cases with edge cases
4. Add a non-obvious hint that guides toward the solution
5. Include starter code for Python, C++, and Java with helpful comments
6. Include COMPLETE, WORKING reference solutions that DEFINITELY pass all test cases
7. For {difficulty_level} problems, include interesting edge cases

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{{
  "title": "Unique problem title",
  "description": "Detailed problem description with input/output format specification and examples",
  "difficulty": "{difficulty_level}",
  "examples": [
    {{"input": "example input", "output": "example output", "explanation": "detailed explanation"}}
  ],
  "testCases": [
    {{"input": "test input 1", "expected": "expected output 1"}},
    {{"input": "test input 2", "expected": "expected output 2"}},
    {{"input": "test input 3", "expected": "expected output 3"}},
    {{"input": "test input 4", "expected": "expected output 4"}}
  ],
  "hint": "A non-obvious hint that guides toward the solution",
  "starterCode": {{
    "python": "def solution():\\n    # TODO: Implement solution\\n    pass",
    "cpp": "// TODO: Complete the solution\\nint main() {{\\n    return 0;\\n}}",
    "java": "class Solution {{\\n    // TODO: Implement solution\\n    public static void main(String[] args) {{\\n    }}\\n}}"
  }},
  "referenceCode": {{
    "python": "# Complete, working Python solution with input/output handling",
    "cpp": "// Complete, working C++ solution with input/output handling",
    "java": "// Complete, working Java solution with input/output handling"
  }}
}}

CRITICAL: The referenceCode MUST be COMPLETE and WORKING. It must handle all input parsing and output formatting correctly. Test it mentally against all test cases."""

        print(f"   [INFO] Requesting {difficulty_level} problem from Gemini API...")
        response = model.generate_content(prompt, safety_settings=[
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE"
            }
        ])
        
        problem_text = response.text.strip()
        print(f"   [INFO] Received response from API ({len(problem_text)} chars)")
        
        # Remove markdown code blocks if present
        if problem_text.startswith("```"):
            problem_text = problem_text.split("```")[1]
            if problem_text.startswith("json"):
                problem_text = problem_text[4:]
            problem_text = problem_text.strip()
        
        # Parse JSON
        problem_data = json.loads(problem_text)
        
        # Validate required fields
        required_fields = ["title", "description", "testCases", "referenceCode"]
        missing_fields = [f for f in required_fields if f not in problem_data]
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")
        
        # Ensure test cases have proper format
        if not problem_data.get("testCases"):
            raise ValueError("testCases cannot be empty")
        
        print(f"   [SUCCESS] Generated '{problem_data['title']}' ({difficulty_level})")
        return problem_data
        
    except json.JSONDecodeError as je:
        print(f"   [ERROR] Failed to parse JSON response: {je}")
        print(f"   [INFO] Falling back to local problem database...")
        return _get_fallback_problem(difficulty)
    except Exception as e:
        print(f"   [ERROR] Gemini API error: {str(e)}")
        print(f"   [INFO] Using fallback {difficulty} problem")
        return _get_fallback_problem(difficulty)

def _get_fallback_problem(difficulty: str = "easy") -> dict:
    """Fallback problems when Gemini API is not available"""
    
    easy_problems = [
        {
            "title": "Double the Number",
            "description": "Write a function that takes an integer and returns it doubled.",
            "difficulty": "easy",
            "examples": [
                {"input": "5", "output": "10", "explanation": "5 * 2 = 10"}
            ],
            "testCases": [
                {"input": "5", "expected": "10"},
                {"input": "0", "expected": "0"},
                {"input": "-3", "expected": "-6"},
                {"input": "100", "expected": "200"}
            ],
            "hint": "Simply multiply the input by 2",
            "starterCode": {
                "python": "def solution(n):\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(solution(n))",
                "cpp": "#include <iostream>\nusing namespace std;\n\nint solution(int n) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << solution(n);\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int solution(int n) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(solution(n));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(n):\n    return n * 2\n\nif __name__ == '__main__':\n    n = int(input())\n    print(solution(n))",
                "cpp": "#include <iostream>\nusing namespace std;\n\nint solution(int n) {\n    return n * 2;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << solution(n);\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int solution(int n) {\n        return n * 2;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(solution(n));\n    }\n}"
            }
        },
        {
            "title": "Sum of Array",
            "description": "Calculate the sum of all elements in an array of integers.",
            "difficulty": "easy",
            "examples": [
                {"input": "3\n1 2 3", "output": "6", "explanation": "1 + 2 + 3 = 6"}
            ],
            "testCases": [
                {"input": "3\n1 2 3", "expected": "6"},
                {"input": "4\n10 20 30 40", "expected": "100"},
                {"input": "1\n5", "expected": "5"},
                {"input": "5\n-1 -2 3 4 5", "expected": "9"}
            ],
            "hint": "Use a loop to add each element to a running total",
            "starterCode": {
                "python": "def solution(arr):\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    print(solution(arr))",
                "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint solution(vector<int>& arr) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n    cout << solution(arr);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] arr) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) {\n            arr[i] = sc.nextInt();\n        }\n        System.out.println(solution(arr));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(arr):\n    return sum(arr)\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    print(solution(arr))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <numeric>\nusing namespace std;\n\nint solution(vector<int>& arr) {\n    return accumulate(arr.begin(), arr.end(), 0);\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n    cout << solution(arr);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] arr) {\n        int sum = 0;\n        for(int num : arr) {\n            sum += num;\n        }\n        return sum;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) {\n            arr[i] = sc.nextInt();\n        }\n        System.out.println(solution(arr));\n    }\n}"
            }
        },
        {
            "title": "Reverse String",
            "description": "Given a string, return it reversed.",
            "difficulty": "easy",
            "examples": [
                {"input": "hello", "output": "olleh", "explanation": "The string is reversed"}
            ],
            "testCases": [
                {"input": "hello", "expected": "olleh"},
                {"input": "world", "expected": "dlrow"},
                {"input": "a", "expected": "a"},
                {"input": "racecar", "expected": "racecar"}
            ],
            "hint": "Python has a built-in way to reverse strings using slicing",
            "starterCode": {
                "python": "def solution(s):\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    s = input()\n    print(solution(s))",
                "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nstring solution(string s) {\n    // Your code here\n    return \"\";\n}\n\nint main() {\n    string s;\n    cin >> s;\n    cout << solution(s);\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static String solution(String s) {\n        // Your code here\n        return \"\";\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(solution(s));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(s):\n    return s[::-1]\n\nif __name__ == '__main__':\n    s = input()\n    print(solution(s))",
                "cpp": "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nstring solution(string s) {\n    reverse(s.begin(), s.end());\n    return s;\n}\n\nint main() {\n    string s;\n    cin >> s;\n    cout << solution(s);\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static String solution(String s) {\n        return new StringBuilder(s).reverse().toString();\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(solution(s));\n    }\n}"
            }
        },
        {
            "title": "Is Palindrome",
            "description": "Check if a given string is a palindrome (reads the same forwards and backwards).",
            "difficulty": "easy",
            "examples": [
                {"input": "racecar", "output": "true", "explanation": "racecar reads the same both ways"}
            ],
            "testCases": [
                {"input": "racecar", "expected": "true"},
                {"input": "hello", "expected": "false"},
                {"input": "a", "expected": "true"},
                {"input": "aabbaa", "expected": "true"}
            ],
            "hint": "Compare the string with its reverse",
            "starterCode": {
                "python": "def solution(s):\n    # Check if palindrome\n    pass\n\nif __name__ == '__main__':\n    s = input().strip()\n    print(str(solution(s)).lower())",
                "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nbool solution(string s) {\n    return false;\n}\n\nint main() {\n    string s;\n    cin >> s;\n    cout << (solution(s) ? \"true\" : \"false\");\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static boolean solution(String s) {\n        return false;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(solution(s));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(s):\n    return s == s[::-1]\n\nif __name__ == '__main__':\n    s = input().strip()\n    print(str(solution(s)).lower())",
                "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nbool solution(string s) {\n    string rev = s;\n    reverse(rev.begin(), rev.end());\n    return s == rev;\n}\n\nint main() {\n    string s;\n    cin >> s;\n    cout << (solution(s) ? \"true\" : \"false\");\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static boolean solution(String s) {\n        return s.equals(new StringBuilder(s).reverse().toString());\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(solution(s));\n    }\n}"
            }
        },
        {
            "title": "Count Vowels",
            "description": "Count the number of vowels in a given string.",
            "difficulty": "easy",
            "examples": [
                {"input": "hello", "output": "2", "explanation": "e and o are vowels"}
            ],
            "testCases": [
                {"input": "hello", "expected": "2"},
                {"input": "aeiou", "expected": "5"},
                {"input": "xyz", "expected": "0"},
                {"input": "AEIOUaeiou", "expected": "10"}
            ],
            "hint": "Iterate through the string and count characters that are vowels",
            "starterCode": {
                "python": "def solution(s):\n    # Count vowels\n    pass\n\nif __name__ == '__main__':\n    s = input().strip()\n    print(solution(s))",
                "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint solution(string s) {\n    return 0;\n}\n\nint main() {\n    string s;\n    cin >> s;\n    cout << solution(s);\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int solution(String s) {\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(solution(s));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(s):\n    vowels = 'aeiouAEIOU'\n    return sum(1 for c in s if c in vowels)\n\nif __name__ == '__main__':\n    s = input().strip()\n    print(solution(s))",
                "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint solution(string s) {\n    int count = 0;\n    for(char c : s) {\n        if(c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u' ||\n           c == 'A' || c == 'E' || c == 'I' || c == 'O' || c == 'U') {\n            count++;\n        }\n    }\n    return count;\n}\n\nint main() {\n    string s;\n    cin >> s;\n    cout << solution(s);\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int solution(String s) {\n        int count = 0;\n        String vowels = \"aeiouAEIOU\";\n        for(char c : s.toCharArray()) {\n            if(vowels.indexOf(c) >= 0) {\n                count++;\n            }\n        }\n        return count;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(solution(s));\n    }\n}"
            }
        },
        {
            "title": "Find Nth Fibonacci",
            "description": "Return the Nth number in the Fibonacci sequence (0-indexed).",
            "difficulty": "easy",
            "examples": [
                {"input": "6", "output": "8", "explanation": "Sequence: 0, 1, 1, 2, 3, 5, 8... (6th is 8)"}
            ],
            "testCases": [
                {"input": "6", "expected": "8"},
                {"input": "0", "expected": "0"},
                {"input": "1", "expected": "1"},
                {"input": "10", "expected": "55"}
            ],
            "hint": "Use iteration or recursion. Fib(0)=0, Fib(1)=1, Fib(n)=Fib(n-1)+Fib(n-2)",
            "starterCode": {
                "python": "def solution(n):\n    # Find nth Fibonacci number\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(solution(n))",
                "cpp": "#include <iostream>\nusing namespace std;\n\nint solution(int n) {\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << solution(n);\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int solution(int n) {\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(solution(n));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\nif __name__ == '__main__':\n    n = int(input())\n    print(solution(n))",
                "cpp": "#include <iostream>\nusing namespace std;\n\nint solution(int n) {\n    if(n <= 1) return n;\n    int a = 0, b = 1;\n    for(int i = 2; i <= n; i++) {\n        int temp = b;\n        b = a + b;\n        a = temp;\n    }\n    return b;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << solution(n);\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int solution(int n) {\n        if(n <= 1) return n;\n        int a = 0, b = 1;\n        for(int i = 2; i <= n; i++) {\n            int temp = b;\n            b = a + b;\n            a = temp;\n        }\n        return b;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(solution(n));\n    }\n}"
            }
        }
    ]
    
    medium_problems = [
        {
            "title": "Find Maximum",
            "description": "Find the maximum value in an array of integers.",
            "difficulty": "medium",
            "examples": [
                {"input": "5\n3 7 2 9 1", "output": "9", "explanation": "9 is the largest number"}
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
            },
            "referenceCode": {
                "python": "def solution(arr):\n    return max(arr)\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    print(solution(arr))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint solution(vector<int>& arr) {\n    return *max_element(arr.begin(), arr.end());\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n    cout << solution(arr);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] arr) {\n        int max = arr[0];\n        for(int i = 1; i < arr.length; i++) {\n            if(arr[i] > max) {\n                max = arr[i];\n            }\n        }\n        return max;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) {\n            arr[i] = sc.nextInt();\n        }\n        System.out.println(solution(arr));\n    }\n}"
            }
        },
        {
            "title": "Two Sum",
            "description": "Given an array of integers and a target number, find two indices where the numbers add up to the target.",
            "difficulty": "medium",
            "examples": [
                {"input": "4\n2 7 11 15\n9", "output": "0 1", "explanation": "nums[0] + nums[1] = 2 + 7 = 9"}
            ],
            "testCases": [
                {"input": "4\n2 7 11 15\n9", "expected": "0 1"},
                {"input": "5\n3 2 4 1 5\n6", "expected": "1 2"},
                {"input": "3\n1 2 3\n5", "expected": "1 2"}
            ],
            "hint": "Use a hash map to store numbers you've seen with their indices. Look for target - current_number.",
            "starterCode": {
                "python": "def solution(arr, target):\n    # Find two indices that sum to target\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    target = int(input())\n    print(' '.join(map(str, solution(arr, target))))",
                "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> solution(vector<int>& arr, int target) {\n    return {};\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) cin >> arr[i];\n    int target;\n    cin >> target;\n    auto res = solution(arr, target);\n    cout << res[0] << \" \" << res[1];\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int[] solution(int[] arr, int target) {\n        return new int[]{};\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        int target = sc.nextInt();\n        int[] res = solution(arr, target);\n        System.out.println(res[0] + \" \" + res[1]);\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(arr, target):\n    seen = {}\n    for i, num in enumerate(arr):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return [-1, -1]\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    target = int(input())\n    print(' '.join(map(str, solution(arr, target))))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> solution(vector<int>& arr, int target) {\n    unordered_map<int, int> seen;\n    for(int i = 0; i < arr.size(); i++) {\n        int complement = target - arr[i];\n        if(seen.find(complement) != seen.end()) {\n            return {seen[complement], i};\n        }\n        seen[arr[i]] = i;\n    }\n    return {-1, -1};\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) cin >> arr[i];\n    int target;\n    cin >> target;\n    auto res = solution(arr, target);\n    cout << res[0] << \" \" << res[1];\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int[] solution(int[] arr, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for(int i = 0; i < arr.length; i++) {\n            int complement = target - arr[i];\n            if(seen.containsKey(complement)) {\n                return new int[]{seen.get(complement), i};\n            }\n            seen.put(arr[i], i);\n        }\n        return new int[]{-1, -1};\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        int target = sc.nextInt();\n        int[] res = solution(arr, target);\n        System.out.println(res[0] + \" \" + res[1]);\n    }\n}"
            }
        },
        {
            "title": "Search in Rotated Array",
            "description": "Search for a target value in a rotated sorted array. Return the index if found, otherwise -1.",
            "difficulty": "medium",
            "examples": [
                {"input": "7\n4 5 6 7 0 1 2\n0", "output": "4", "explanation": "Target 0 is found at index 4"}
            ],
            "testCases": [
                {"input": "7\n4 5 6 7 0 1 2\n0", "expected": "4"},
                {"input": "7\n4 5 6 7 0 1 2\n3", "expected": "-1"},
                {"input": "1\n1\n1", "expected": "0"}
            ],
            "hint": "Use binary search. Determine which half is sorted and search accordingly.",
            "starterCode": {
                "python": "def solution(arr, target):\n    # Search in rotated array\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    target = int(input())\n    print(solution(arr, target))",
                "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint solution(vector<int>& arr, int target) {\n    return -1;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) cin >> arr[i];\n    int target;\n    cin >> target;\n    cout << solution(arr, target);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] arr, int target) {\n        return -1;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        int target = sc.nextInt();\n        System.out.println(solution(arr, target));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        if arr[left] <= arr[mid]:\n            if arr[left] <= target < arr[mid]:\n                right = mid - 1\n            else:\n                left = mid + 1\n        else:\n            if arr[mid] < target <= arr[right]:\n                left = mid + 1\n            else:\n                right = mid - 1\n    return -1\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    target = int(input())\n    print(solution(arr, target))",
                "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint solution(vector<int>& arr, int target) {\n    int left = 0, right = arr.size() - 1;\n    while(left <= right) {\n        int mid = (left + right) / 2;\n        if(arr[mid] == target) return mid;\n        if(arr[left] <= arr[mid]) {\n            if(arr[left] <= target && target < arr[mid]) {\n                right = mid - 1;\n            } else {\n                left = mid + 1;\n            }\n        } else {\n            if(arr[mid] < target && target <= arr[right]) {\n                left = mid + 1;\n            } else {\n                right = mid - 1;\n            }\n        }\n    }\n    return -1;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) cin >> arr[i];\n    int target;\n    cin >> target;\n    cout << solution(arr, target);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] arr, int target) {\n        int left = 0, right = arr.length - 1;\n        while(left <= right) {\n            int mid = (left + right) / 2;\n            if(arr[mid] == target) return mid;\n            if(arr[left] <= arr[mid]) {\n                if(arr[left] <= target && target < arr[mid]) {\n                    right = mid - 1;\n                } else {\n                    left = mid + 1;\n                }\n            } else {\n                if(arr[mid] < target && target <= arr[right]) {\n                    left = mid + 1;\n                } else {\n                    right = mid - 1;\n                }\n            }\n        }\n        return -1;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        int target = sc.nextInt();\n        System.out.println(solution(arr, target));\n    }\n}"
            }
        }
    ]
    
    hard_problems = [
        {
            "title": "Longest Increasing Subsequence",
            "description": "Find the length of the longest strictly increasing subsequence in an array of integers.",
            "difficulty": "hard",
            "examples": [
                {"input": "8\n10 9 2 5 3 7 101 18", "output": "4", "explanation": "The LIS is [2, 3, 7, 101] with length 4"}
            ],
            "testCases": [
                {"input": "8\n10 9 2 5 3 7 101 18", "expected": "4"},
                {"input": "10\n0 1 0 4 4 3 4 2 0 1", "expected": "4"},
                {"input": "5\n5 4 3 2 1", "expected": "1"},
                {"input": "5\n1 2 3 4 5", "expected": "5"}
            ],
            "hint": "Use dynamic programming where dp[i] represents the length of LIS ending at index i. Time complexity: O(n²)",
            "starterCode": {
                "python": "def solution(arr):\n    # Find longest increasing subsequence\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    print(solution(arr))",
                "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint solution(vector<int>& arr) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n    cout << solution(arr);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] arr) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) {\n            arr[i] = sc.nextInt();\n        }\n        System.out.println(solution(arr));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(arr):\n    if not arr:\n        return 0\n    \n    n = len(arr)\n    dp = [1] * n\n    \n    for i in range(1, n):\n        for j in range(i):\n            if arr[j] < arr[i]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    \n    return max(dp)\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    print(solution(arr))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint solution(vector<int>& arr) {\n    if(arr.empty()) return 0;\n    int n = arr.size();\n    vector<int> dp(n, 1);\n    \n    for(int i = 1; i < n; i++) {\n        for(int j = 0; j < i; j++) {\n            if(arr[j] < arr[i]) {\n                dp[i] = max(dp[i], dp[j] + 1);\n            }\n        }\n    }\n    \n    return *max_element(dp.begin(), dp.end());\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n    cout << solution(arr);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] arr) {\n        if(arr.length == 0) return 0;\n        int n = arr.length;\n        int[] dp = new int[n];\n        Arrays.fill(dp, 1);\n        \n        for(int i = 1; i < n; i++) {\n            for(int j = 0; j < i; j++) {\n                if(arr[j] < arr[i]) {\n                    dp[i] = Math.max(dp[i], dp[j] + 1);\n                }\n            }\n        }\n        \n        int result = 0;\n        for(int length : dp) {\n            result = Math.max(result, length);\n        }\n        return result;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) {\n            arr[i] = sc.nextInt();\n        }\n        System.out.println(solution(arr));\n    }\n}"
            }
        },
        {
            "title": "Coin Change",
            "description": "Given coins of different denominations and an amount, find the minimum number of coins needed to make that amount. Return -1 if impossible.",
            "difficulty": "hard",
            "examples": [
                {"input": "3\n1 2 5\n5", "output": "1", "explanation": "Use 1 coin: [5]"}
            ],
            "testCases": [
                {"input": "3\n1 2 5\n5", "expected": "1"},
                {"input": "3\n2\n3", "expected": "-1"},
                {"input": "1\n10\n10", "expected": "1"},
                {"input": "3\n1 2 5\n7", "expected": "2"}
            ],
            "hint": "Use DP where dp[i] = minimum coins to make amount i. Initialize with infinity except dp[0]=0",
            "starterCode": {
                "python": "def solution(coins, amount):\n    # Find minimum coins to make amount\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    coins = list(map(int, input().split()))\n    amount = int(input())\n    print(solution(coins, amount))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <climits>\nusing namespace std;\n\nint solution(vector<int>& coins, int amount) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> coins(n);\n    for(int i = 0; i < n; i++) {\n        cin >> coins[i];\n    }\n    int amount;\n    cin >> amount;\n    cout << solution(coins, amount);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] coins, int amount) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] coins = new int[n];\n        for(int i = 0; i < n; i++) {\n            coins[i] = sc.nextInt();\n        }\n        int amount = sc.nextInt();\n        System.out.println(solution(coins, amount));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    \n    for i in range(1, amount + 1):\n        for coin in coins:\n            if coin <= i:\n                dp[i] = min(dp[i], dp[i - coin] + 1)\n    \n    return dp[amount] if dp[amount] != float('inf') else -1\n\nif __name__ == '__main__':\n    n = int(input())\n    coins = list(map(int, input().split()))\n    amount = int(input())\n    print(solution(coins, amount))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <climits>\nusing namespace std;\n\nint solution(vector<int>& coins, int amount) {\n    vector<int> dp(amount + 1, INT_MAX);\n    dp[0] = 0;\n    \n    for(int i = 1; i <= amount; i++) {\n        for(int coin : coins) {\n            if(coin <= i && dp[i - coin] != INT_MAX) {\n                dp[i] = min(dp[i], dp[i - coin] + 1);\n            }\n        }\n    }\n    \n    return dp[amount] == INT_MAX ? -1 : dp[amount];\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> coins(n);\n    for(int i = 0; i < n; i++) {\n        cin >> coins[i];\n    }\n    int amount;\n    cin >> amount;\n    cout << solution(coins, amount);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        \n        for(int i = 1; i <= amount; i++) {\n            for(int coin : coins) {\n                if(coin <= i) {\n                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n                }\n            }\n        }\n        \n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] coins = new int[n];\n        for(int i = 0; i < n; i++) {\n            coins[i] = sc.nextInt();\n        }\n        int amount = sc.nextInt();\n        System.out.println(solution(coins, amount));\n    }\n}"
            }
        },
        {
            "title": "Word Ladder",
            "description": "Given two words (beginWord and endWord) and a dictionary, find the shortest transformation sequence from beginWord to endWord. Each intermediate word must be in the dictionary and differ by exactly one letter.",
            "difficulty": "hard",
            "examples": [
                {"input": "hit\ncog\nhot dot dog lot log cog", "output": "5", "explanation": "hit -> hot -> dot -> dog -> cog"}
            ],
            "testCases": [
                {"input": "hit\ncog\nhot dot dog lot log cog", "expected": "5"},
                {"input": "hit\ncog\nhot dot dog lot log", "expected": "0"},
                {"input": "a\nc\na b c", "expected": "2"},
                {"input": "cold\nwarm\ncold cord card ward warm", "expected": "5"}
            ],
            "hint": "Use BFS to find the shortest path. For each word, try changing one letter at a time and check if the new word exists in the dictionary.",
            "starterCode": {
                "python": "def solution(beginWord, endWord, wordList):\n    # Find shortest word ladder\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    beginWord = input().strip()\n    endWord = input().strip()\n    words = input().strip().split()\n    print(solution(beginWord, endWord, words))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint solution(string begin, string end, vector<string> words) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    string begin, end;\n    cin >> begin >> end;\n    vector<string> words;\n    string word;\n    while(cin >> word) words.push_back(word);\n    cout << solution(begin, end, words);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(String begin, String end, List<String> words) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String begin = sc.next();\n        String end = sc.next();\n        List<String> words = new ArrayList<>();\n        while(sc.hasNext()) {\n            words.add(sc.next());\n        }\n        System.out.println(solution(begin, end, words));\n    }\n}"
            },
            "referenceCode": {
                "python": "from collections import deque\n\ndef solution(beginWord, endWord, wordList):\n    word_set = set(wordList)\n    if endWord not in word_set:\n        return 0\n    \n    queue = deque([(beginWord, 1)])\n    visited = {beginWord}\n    \n    while queue:\n        word, length = queue.popleft()\n        \n        if word == endWord:\n            return length\n        \n        for i in range(len(word)):\n            for c in 'abcdefghijklmnopqrstuvwxyz':\n                new_word = word[:i] + c + word[i+1:]\n                if new_word in word_set and new_word not in visited:\n                    visited.add(new_word)\n                    queue.append((new_word, length + 1))\n    \n    return 0\n\nif __name__ == '__main__':\n    beginWord = input().strip()\n    endWord = input().strip()\n    words = input().strip().split()\n    print(solution(beginWord, endWord, words))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_set>\n#include <queue>\nusing namespace std;\n\nint solution(string begin, string end, vector<string> words) {\n    unordered_set<string> word_set(words.begin(), words.end());\n    if(word_set.find(end) == word_set.end()) return 0;\n    \n    queue<pair<string, int>> q;\n    unordered_set<string> visited;\n    q.push({begin, 1});\n    visited.insert(begin);\n    \n    while(!q.empty()) {\n        auto [word, length] = q.front();\n        q.pop();\n        \n        if(word == end) return length;\n        \n        for(int i = 0; i < word.length(); i++) {\n            for(char c = 'a'; c <= 'z'; c++) {\n                string new_word = word;\n                new_word[i] = c;\n                if(word_set.count(new_word) && !visited.count(new_word)) {\n                    visited.insert(new_word);\n                    q.push({new_word, length + 1});\n                }\n            }\n        }\n    }\n    return 0;\n}\n\nint main() {\n    string begin, end;\n    cin >> begin >> end;\n    vector<string> words;\n    string word;\n    while(cin >> word) words.push_back(word);\n    cout << solution(begin, end, words);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(String begin, String end, List<String> words) {\n        Set<String> word_set = new HashSet<>(words);\n        if(!word_set.contains(end)) return 0;\n        \n        Queue<String> q = new LinkedList<>();\n        Map<String, Integer> dist = new HashMap<>();\n        q.offer(begin);\n        dist.put(begin, 1);\n        \n        while(!q.isEmpty()) {\n            String word = q.poll();\n            int length = dist.get(word);\n            \n            if(word.equals(end)) return length;\n            \n            for(int i = 0; i < word.length(); i++) {\n                for(char c = 'a'; c <= 'z'; c++) {\n                    String new_word = word.substring(0, i) + c + word.substring(i+1);\n                    if(word_set.contains(new_word) && !dist.containsKey(new_word)) {\n                        dist.put(new_word, length + 1);\n                        q.offer(new_word);\n                    }\n                }\n            }\n        }\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String begin = sc.next();\n        String end = sc.next();\n        List<String> words = new ArrayList<>();\n        while(sc.hasNext()) {\n            words.add(sc.next());\n        }\n        System.out.println(solution(begin, end, words));\n    }\n}"
            }
        },
        {
            "title": "Edit Distance",
            "description": "Calculate the minimum number of edit operations (insert, delete, replace) needed to transform one string into another.",
            "difficulty": "hard",
            "examples": [
                {"input": "horse\nros", "output": "3", "explanation": "horse -> rorse -> rose -> ros"}
            ],
            "testCases": [
                {"input": "horse\nros", "expected": "3"},
                {"input": "abc\nab", "expected": "1"},
                {"input": "kitten\nsitting", "expected": "3"},
                {"input": "a\n", "expected": "1"}
            ],
            "hint": "Use dynamic programming with a 2D table where dp[i][j] = min edits to transform first i chars to first j chars.",
            "starterCode": {
                "python": "def solution(s1, s2):\n    # Find edit distance\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    s1 = input().strip()\n    s2 = input().strip()\n    print(solution(s1, s2))",
                "cpp": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint solution(string s1, string s2) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    string s1, s2;\n    getline(cin, s1);\n    getline(cin, s2);\n    cout << solution(s1, s2);\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int solution(String s1, String s2) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s1 = sc.nextLine();\n        String s2 = sc.nextLine();\n        System.out.println(solution(s1, s2));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(s1, s2):\n    m, n = len(s1), len(s2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    \n    for i in range(m + 1):\n        dp[i][0] = i\n    for j in range(n + 1):\n        dp[0][j] = j\n    \n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if s1[i-1] == s2[j-1]:\n                dp[i][j] = dp[i-1][j-1]\n            else:\n                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\n    \n    return dp[m][n]\n\nif __name__ == '__main__':\n    s1 = input().strip()\n    s2 = input().strip()\n    print(solution(s1, s2))",
                "cpp": "#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint solution(string s1, string s2) {\n    int m = s1.length(), n = s2.length();\n    vector<vector<int>> dp(m + 1, vector<int>(n + 1));\n    \n    for(int i = 0; i <= m; i++) dp[i][0] = i;\n    for(int j = 0; j <= n; j++) dp[0][j] = j;\n    \n    for(int i = 1; i <= m; i++) {\n        for(int j = 1; j <= n; j++) {\n            if(s1[i-1] == s2[j-1]) {\n                dp[i][j] = dp[i-1][j-1];\n            } else {\n                dp[i][j] = 1 + min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]});\n            }\n        }\n    }\n    return dp[m][n];\n}\n\nint main() {\n    string s1, s2;\n    getline(cin, s1);\n    getline(cin, s2);\n    cout << solution(s1, s2);\n    return 0;\n}",
                "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int solution(String s1, String s2) {\n        int m = s1.length(), n = s2.length();\n        int[][] dp = new int[m + 1][n + 1];\n        \n        for(int i = 0; i <= m; i++) dp[i][0] = i;\n        for(int j = 0; j <= n; j++) dp[0][j] = j;\n        \n        for(int i = 1; i <= m; i++) {\n            for(int j = 1; j <= n; j++) {\n                if(s1.charAt(i-1) == s2.charAt(j-1)) {\n                    dp[i][j] = dp[i-1][j-1];\n                } else {\n                    dp[i][j] = 1 + Math.min(Math.min(dp[i-1][j], dp[i][j-1]), dp[i-1][j-1]);\n                }\n            }\n        }\n        return dp[m][n];\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s1 = sc.nextLine();\n        String s2 = sc.nextLine();\n        System.out.println(solution(s1, s2));\n    }\n}"
            }
        },
        {
            "title": "Binary Tree Maximum Path Sum",
            "description": "Find the maximum sum of any path in a binary tree. A path is defined as any sequence of nodes where each node is the parent of the next node.",
            "difficulty": "hard",
            "examples": [
                {"input": "1 -2 -3", "output": "1", "explanation": "Path is just the node with value 1"}
            ],
            "testCases": [
                {"input": "1 2 3", "expected": "6"},
                {"input": "1 -2 -3", "expected": "1"},
                {"input": "-10 9 20 15 7", "expected": "42"}
            ],
            "hint": "Use DFS recursion. For each node, calculate the max path sum through that node by considering left and right subtrees. Keep track of global maximum.",
            "starterCode": {
                "python": "def solution(nodes):\n    # Build tree and find maximum path sum\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    nodes = list(map(int, input().split()))\n    print(solution(nodes))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint solution(vector<int> nodes) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    vector<int> nodes;\n    int n;\n    while(cin >> n) nodes.push_back(n);\n    cout << solution(nodes);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(int[] nodes) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextInt()) {\n            list.add(sc.nextInt());\n        }\n        int[] nodes = list.stream().mapToInt(Integer::intValue).toArray();\n        System.out.println(solution(nodes));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(nodes):\n    if not nodes:\n        return 0\n    \n    max_sum = float('-inf')\n    \n    def dfs(node):\n        nonlocal max_sum\n        if node is None:\n            return 0\n        \n        left = max(0, dfs(node.left))\n        right = max(0, dfs(node.right))\n        \n        max_sum = max(max_sum, node.val + left + right)\n        return node.val + max(left, right)\n    \n    return max_sum\n\nif __name__ == '__main__':\n    nodes = list(map(int, input().split()))\n    print(solution(nodes))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <climits>\nusing namespace std;\n\nint result = INT_MIN;\n\nint maxPath(vector<int>& nodes, int idx) {\n    if(idx >= nodes.size() || nodes[idx] < -10000) return 0;\n    int val = nodes[idx];\n    int left = maxPath(nodes, 2 * idx + 1);\n    int right = maxPath(nodes, 2 * idx + 2);\n    result = max(result, val + max(0, left) + max(0, right));\n    return val + max(0, max(left, right));\n}\n\nint solution(vector<int> nodes) {\n    result = INT_MIN;\n    maxPath(nodes, 0);\n    return result;\n}\n\nint main() {\n    vector<int> nodes;\n    int n;\n    while(cin >> n) nodes.push_back(n);\n    cout << solution(nodes);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    static int maxSum = Integer.MIN_VALUE;\n    \n    public static int dfs(int[] nodes, int idx) {\n        if(idx >= nodes.length) return 0;\n        \n        int val = nodes[idx];\n        int left = Math.max(0, dfs(nodes, 2 * idx + 1));\n        int right = Math.max(0, dfs(nodes, 2 * idx + 2));\n        \n        maxSum = Math.max(maxSum, val + left + right);\n        return val + Math.max(left, right);\n    }\n    \n    public static int solution(int[] nodes) {\n        maxSum = Integer.MIN_VALUE;\n        dfs(nodes, 0);\n        return maxSum;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextInt()) {\n            list.add(sc.nextInt());\n        }\n        int[] nodes = list.stream().mapToInt(Integer::intValue).toArray();\n        System.out.println(solution(nodes));\n    }\n}"
            }
        },
        {
            "title": "Number of Islands",
            "description": "Given a 2D grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.",
            "difficulty": "hard",
            "examples": [
                {"input": "3\n110\n110\n001", "output": "1", "explanation": "There is 1 island formed by connecting adjacent 1s"}
            ],
            "testCases": [
                {"input": "3\n110\n110\n001", "expected": "2"},
                {"input": "2\n11\n11", "expected": "1"},
                {"input": "2\n01\n10", "expected": "2"}
            ],
            "hint": "Use DFS or BFS. For each unvisited '1', start a DFS/BFS to mark all connected lands. Increment island count.",
            "starterCode": {
                "python": "def solution(grid):\n    # Count number of islands\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    grid = []\n    for _ in range(n):\n        grid.append(list(input().strip()))\n    print(solution(grid))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint solution(vector<string> grid) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<string> grid(n);\n    for(int i = 0; i < n; i++) {\n        cin >> grid[i];\n    }\n    cout << solution(grid);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static int solution(String[] grid) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        String[] grid = new String[n];\n        for(int i = 0; i < n; i++) {\n            grid[i] = sc.next();\n        }\n        System.out.println(solution(grid));\n    }\n}"
            },
            "referenceCode": {
                "python": "def solution(grid):\n    if not grid:\n        return 0\n    \n    rows, cols = len(grid), len(grid[0])\n    visited = [[False] * cols for _ in range(rows)]\n    \n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols or visited[r][c] or grid[r][c] == '0':\n            return\n        visited[r][c] = True\n        dfs(r + 1, c)\n        dfs(r - 1, c)\n        dfs(r, c + 1)\n        dfs(r, c - 1)\n    \n    islands = 0\n    for i in range(rows):\n        for j in range(cols):\n            if grid[i][j] == '1' and not visited[i][j]:\n                dfs(i, j)\n                islands += 1\n    return islands\n\nif __name__ == '__main__':\n    n = int(input())\n    grid = []\n    for _ in range(n):\n        grid.append(list(input().strip()))\n    print(solution(grid))",
                "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nvoid dfs(vector<string>& grid, vector<vector<bool>>& visited, int r, int c) {\n    int rows = grid.size(), cols = grid[0].size();\n    if(r < 0 || r >= rows || c < 0 || c >= cols || visited[r][c] || grid[r][c] == '0') return;\n    visited[r][c] = true;\n    dfs(grid, visited, r + 1, c);\n    dfs(grid, visited, r - 1, c);\n    dfs(grid, visited, r, c + 1);\n    dfs(grid, visited, r, c - 1);\n}\n\nint solution(vector<string> grid) {\n    if(grid.empty()) return 0;\n    int rows = grid.size(), cols = grid[0].size();\n    vector<vector<bool>> visited(rows, vector<bool>(cols, false));\n    int islands = 0;\n    for(int i = 0; i < rows; i++) {\n        for(int j = 0; j < cols; j++) {\n            if(grid[i][j] == '1' && !visited[i][j]) {\n                dfs(grid, visited, i, j);\n                islands++;\n            }\n        }\n    }\n    return islands;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<string> grid(n);\n    for(int i = 0; i < n; i++) {\n        cin >> grid[i];\n    }\n    cout << solution(grid);\n    return 0;\n}",
                "java": "import java.util.*;\n\npublic class Main {\n    public static void dfs(String[] grid, boolean[][] visited, int r, int c) {\n        int rows = grid.length, cols = grid[0].length();\n        if(r < 0 || r >= rows || c < 0 || c >= cols || visited[r][c] || grid[r][c] == '0') return;\n        visited[r][c] = true;\n        dfs(grid, visited, r + 1, c);\n        dfs(grid, visited, r - 1, c);\n        dfs(grid, visited, r, c + 1);\n        dfs(grid, visited, r, c - 1);\n    }\n    \n    public static int solution(String[] grid) {\n        if(grid.length == 0) return 0;\n        int rows = grid.length, cols = grid[0].length();\n        boolean[][] visited = new boolean[rows][cols];\n        int islands = 0;\n        for(int i = 0; i < rows; i++) {\n            for(int j = 0; j < cols; j++) {\n                if(grid[i][j] == '1' && !visited[i][j]) {\n                    dfs(grid, visited, i, j);\n                    islands++;\n                }\n            }\n        }\n        return islands;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        String[] grid = new String[n];\n        for(int i = 0; i < n; i++) {\n            grid[i] = sc.next();\n        }\n        System.out.println(solution(grid));\n    }\n}"
            }
        }
    ]
    
    # Select problems based on difficulty
    if difficulty.lower() == "easy":
        return random.choice(easy_problems)
    elif difficulty.lower() == "medium":
        return random.choice(medium_problems)
    else:  # hard
        return random.choice(hard_problems)
