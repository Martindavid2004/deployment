"""
Seed competitive problems - 15 pre-defined problems for competitive modes.

5 problems per mode (Code Sprint, Bug Hunt, Code Shuffle):
- 2 Easy
- 2 Medium  
- 1 Hard

Run: python seed_competitive_problems.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB_NAME", "codo_ai")

# ============================================================================
# CODE SPRINT PROBLEMS (Standard competitive programming)
# ============================================================================

CODE_SPRINT_PROBLEMS = [
    # EASY 1
    {
        "title": "Two Sum",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.",
        "difficulty": "Easy",
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9"},
            {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}
        ],
        "testCases": [
            {"input": "[2,7,11,15]\\n9", "expected": "[0, 1]"},
            {"input": "[3,2,4]\\n6", "expected": "[1, 2]"},
            {"input": "[3,3]\\n6", "expected": "[0, 1]"},
            {"input": "[1,5,3,7,9]\\n10", "expected": "[1, 3]"}
        ],
        "hint": "Use a hash map to store numbers you've seen and their indices. For each number, check if (target - number) exists in the map.",
        "starterCode": {
            "python": "def two_sum(nums, target):\\n    pass",
            "javascript": "function twoSum(nums, target) {\\n    // Your code here\\n}",
            "cpp": "#include <vector>\\nusing namespace std;\\n\\nvector<int> twoSum(vector<int>& nums, int target) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def two_sum(nums, target):\\n    seen = {}\\n    for i, num in enumerate(nums):\\n        complement = target - num\\n        if complement in seen:\\n            return [seen[complement], i]\\n        seen[num] = i\\n    return []"
        }
    },
    
    # EASY 2
    {
        "title": "Palindrome Number",
        "description": "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same backward as forward.",
        "difficulty": "Easy",
        "examples": [
            {"input": "x = 121", "output": "true", "explanation": "121 reads as 121 from left to right and from right to left."},
            {"input": "x = -121", "output": "false", "explanation": "From left to right, it reads -121. From right to left, it becomes 121-."},
            {"input": "x = 10", "output": "false"}
        ],
        "testCases": [
            {"input": "121", "expected": "true"},
            {"input": "-121", "expected": "false"},
            {"input": "10", "expected": "false"},
            {"input": "0", "expected": "true"},
            {"input": "12321", "expected": "true"}
        ],
        "hint": "Convert to string and compare with its reverse, or reverse the number mathematically.",
        "starterCode": {
            "python": "def is_palindrome(x):\\n    pass",
            "javascript": "function isPalindrome(x) {\\n    // Your code here\\n}",
            "cpp": "bool isPalindrome(int x) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def is_palindrome(x):\\n    if x < 0:\\n        return False\\n    return str(x) == str(x)[::-1]"
        }
    },
    
    # MEDIUM 1
    {
        "title": "Longest Substring Without Repeating Characters",
        "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
        "difficulty": "Medium",
        "examples": [
            {"input": 's = "abcabcbb"', "output": "3", "explanation": 'The answer is "abc", with the length of 3.'},
            {"input": 's = "bbbbb"', "output": "1", "explanation": 'The answer is "b", with the length of 1.'},
            {"input": 's = "pwwkew"', "output": "3", "explanation": 'The answer is "wke", with the length of 3.'}
        ],
        "testCases": [
            {"input": "abcabcbb", "expected": "3"},
            {"input": "bbbbb", "expected": "1"},
            {"input": "pwwkew", "expected": "3"},
            {"input": "", "expected": "0"},
            {"input": "dvdf", "expected": "3"}
        ],
        "hint": "Use sliding window technique with a set or hash map to track characters in the current window.",
        "starterCode": {
            "python": "def length_of_longest_substring(s):\\n    pass",
            "javascript": "function lengthOfLongestSubstring(s) {\\n    // Your code here\\n}",
            "cpp": "int lengthOfLongestSubstring(string s) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def length_of_longest_substring(s):\\n    char_set = set()\\n    left = 0\\n    max_length = 0\\n    \\n    for right in range(len(s)):\\n        while s[right] in char_set:\\n            char_set.remove(s[left])\\n            left += 1\\n        char_set.add(s[right])\\n        max_length = max(max_length, right - left + 1)\\n    \\n    return max_length"
        }
    },
    
    # MEDIUM 2
    {
        "title": "Container With Most Water",
        "description": "You are given an integer array `height` of length `n`. Find two lines that together with the x-axis form a container that contains the most water.\n\nReturn the maximum amount of water a container can store.",
        "difficulty": "Medium",
        "examples": [
            {"input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49", "explanation": "The max area is between heights 8 and 7 with width 7."},
            {"input": "height = [1,1]", "output": "1"}
        ],
        "testCases": [
            {"input": "[1,8,6,2,5,4,8,3,7]", "expected": "49"},
            {"input": "[1,1]", "expected": "1"},
            {"input": "[4,3,2,1,4]", "expected": "16"},
            {"input": "[1,2,1]", "expected": "2"}
        ],
        "hint": "Use two pointers from both ends. Move the pointer with smaller height inward.",
        "starterCode": {
            "python": "def max_area(height):\\n    pass",
            "javascript": "function maxArea(height) {\\n    // Your code here\\n}",
            "cpp": "int maxArea(vector<int>& height) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def max_area(height):\\n    left, right = 0, len(height) - 1\\n    max_water = 0\\n    \\n    while left < right:\\n        width = right - left\\n        max_water = max(max_water, min(height[left], height[right]) * width)\\n        \\n        if height[left] < height[right]:\\n            left += 1\\n        else:\\n            right -= 1\\n    \\n    return max_water"
        }
    },
    
    # HARD 1
    {
        "title": "Median of Two Sorted Arrays",
        "description": "Given two sorted arrays `nums1` and `nums2`, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
        "difficulty": "Hard",
        "examples": [
            {"input": "nums1 = [1,3], nums2 = [2]", "output": "2.0", "explanation": "merged array = [1,2,3] and median is 2."},
            {"input": "nums1 = [1,2], nums2 = [3,4]", "output": "2.5", "explanation": "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."}
        ],
        "testCases": [
            {"input": "[1,3]\\n[2]", "expected": "2.0"},
            {"input": "[1,2]\\n[3,4]", "expected": "2.5"},
            {"input": "[]\\n[1]", "expected": "1.0"},
            {"input": "[2]\\n[]", "expected": "2.0"}
        ],
        "hint": "Use binary search on the smaller array to partition both arrays such that elements on left half are smaller than elements on right half.",
        "starterCode": {
            "python": "def find_median_sorted_arrays(nums1, nums2):\\n    pass",
            "javascript": "function findMedianSortedArrays(nums1, nums2) {\\n    // Your code here\\n}",
            "cpp": "double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def find_median_sorted_arrays(nums1, nums2):\\n    if len(nums1) > len(nums2):\\n        nums1, nums2 = nums2, nums1\\n    \\n    m, n = len(nums1), len(nums2)\\n    left, right = 0, m\\n    \\n    while left <= right:\\n        partition1 = (left + right) // 2\\n        partition2 = (m + n + 1) // 2 - partition1\\n        \\n        maxLeft1 = float('-inf') if partition1 == 0 else nums1[partition1 - 1]\\n        minRight1 = float('inf') if partition1 == m else nums1[partition1]\\n        maxLeft2 = float('-inf') if partition2 == 0 else nums2[partition2 - 1]\\n        minRight2 = float('inf') if partition2 == n else nums2[partition2]\\n        \\n        if maxLeft1 <= minRight2 and maxLeft2 <= minRight1:\\n            if (m + n) % 2 == 0:\\n                return (max(maxLeft1, maxLeft2) + min(minRight1, minRight2)) / 2\\n            else:\\n                return max(maxLeft1, maxLeft2)\\n        elif maxLeft1 > minRight2:\\n            right = partition1 - 1\\n        else:\\n            left = partition1 + 1\\n    \\n    return 0.0"
        }
    }
]

# ============================================================================
# BUG HUNT PROBLEMS (Debug broken code)
# ============================================================================

BUG_HUNT_PROBLEMS = [
    # EASY 1
    {
        "title": "Fix the Factorial Function",
        "description": "The following factorial function has bugs. Find and fix all bugs to make it work correctly.\n\nThe function should return the factorial of n (n!).",
        "difficulty": "Easy",
        "examples": [
            {"input": "n = 5", "output": "120"},
            {"input": "n = 0", "output": "1"},
            {"input": "n = 3", "output": "6"}
        ],
        "testCases": [
            {"input": "5", "expected": "120"},
            {"input": "0", "expected": "1"},
            {"input": "1", "expected": "1"},
            {"input": "3", "expected": "6"},
            {"input": "7", "expected": "5040"}
        ],
        "hint": "Check the base case, loop condition, and multiplication logic.",
        "starterCode": {
            "python": "def factorial(n):\\n    pass",
            "javascript": "function factorial(n) {\\n    // Your code here\\n}",
            "cpp": "int factorial(int n) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def factorial(n):\\n    if n == 0:\\n        return 1\\n    result = 1\\n    for i in range(1, n + 1):\\n        result *= i\\n    return result"
        },
        "buggyCode": {
            "python": "def factorial(n):\\n    if n = 0:\\n        return 1\\n    result = 1\\n    for i in range(1, n):\\n        result *= i\\n    return result"
        }
    },
    
    # EASY 2
    {
        "title": "Debug Array Sum",
        "description": "Fix the bugs in this function that calculates the sum of all elements in an array.",
        "difficulty": "Easy",
        "examples": [
            {"input": "arr = [1, 2, 3, 4, 5]", "output": "15"},
            {"input": "arr = []", "output": "0"},
            {"input": "arr = [10]", "output": "10"}
        ],
        "testCases": [
            {"input": "arr = [1, 2, 3, 4, 5]", "expected": "15"},
            {"input": "arr = []", "expected": "0"},
            {"input": "arr = [10]", "expected": "10"},
            {"input": "arr = [-1, 1, 0]", "expected": "0"}
        ],
        "hint": "Check array indexing and initialization.",
        "starterCode": {
            "python": "def array_sum(arr):\\n    pass",
            "javascript": "function arraySum(arr) {\\n    // Your code here\\n}",
            "cpp": "int arraySum(vector<int> arr) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def array_sum(arr):\\n    total = 0\\n    for num in arr:\\n        total += num\\n    return total"
        },
        "buggyCode": {
            "python": "def array_sum(arr):\\n    total = 0\\n    for i in range(len(arr)):\\n        total += arr[i+1]\\n    return total"
        }
    },
    
    # MEDIUM 1
    {
        "title": "Fix Binary Search",
        "description": "This binary search implementation has multiple bugs. Find and fix them all.",
        "difficulty": "Medium",
        "examples": [
            {"input": "arr = [1,2,3,4,5,6,7], target = 4", "output": "3"},
            {"input": "arr = [1,2,3,4,5], target = 6", "output": "-1"}
        ],
        "testCases": [
            {"input": "[1,2,3,4,5,6,7]\\n4", "expected": "3"},
            {"input": "[1,2,3,4,5]\\n6", "expected": "-1"},
            {"input": "[1]\\n1", "expected": "0"},
            {"input": "[1,3,5,7,9]\\n5", "expected": "2"}
        ],
        "hint": "Check mid calculation, comparison operators, and return values.",
        "starterCode": {
            "python": "def binary_search(arr, target):\\n    pass",
            "javascript": "function binarySearch(arr, target) {\\n    // Your code here\\n}",
            "cpp": "int binarySearch(vector<int> arr, int target) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def binary_search(arr, target):\\n    left, right = 0, len(arr) - 1\\n    \\n    while left <= right:\\n        mid = (left + right) // 2\\n        if arr[mid] == target:\\n            return mid\\n        elif arr[mid] < target:\\n            left = mid + 1\\n        else:\\n            right = mid - 1\\n    \\n    return -1"
        },
        "buggyCode": {
            "python": "def binary_search(arr, target):\\n    left, right = 0, len(arr)\\n    \\n    while left < right:\\n        mid = (left + right) / 2\\n        if arr[mid] = target:\\n            return mid\\n        elif arr[mid] < target:\\n            left = mid\\n        else:\\n            right = mid\\n    \\n    return -1"
        }
    },
    
    # MEDIUM 2
    {
        "title": "Debug Merge Sort",
        "description": "Fix the bugs in this merge sort implementation.",
        "difficulty": "Medium",
        "examples": [
            {"input": "arr = [5,2,8,1,9]", "output": "[1,2,5,8,9]"},
            {"input": "arr = [3,1,2]", "output": "[1,2,3]"}
        ],
        "testCases": [
            {"input": "[5,2,8,1,9]", "expected": "[1, 2, 5, 8, 9]"},
            {"input": "[3,1,2]", "expected": "[1, 2, 3]"},
            {"input": "[1]", "expected": "[1]"},
            {"input": "[]", "expected": "[]"}
        ],
        "hint": "Check recursion base case, mid calculation, and merge logic.",
        "starterCode": {
            "python": "def merge_sort(arr):\\n    pass",
            "javascript": "function mergeSort(arr) {\\n    // Your code here\\n}",
            "cpp": "vector<int> mergeSort(vector<int> arr) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def merge_sort(arr):\\n    if len(arr) <= 1:\\n        return arr\\n    \\n    mid = len(arr) // 2\\n    left = merge_sort(arr[:mid])\\n    right = merge_sort(arr[mid:])\\n    \\n    return merge(left, right)\\n\\ndef merge(left, right):\\n    result = []\\n    i = j = 0\\n    \\n    while i < len(left) and j < len(right):\\n        if left[i] < right[j]:\\n            result.append(left[i])\\n            i += 1\\n        else:\\n            result.append(right[j])\\n            j += 1\\n    \\n    result.extend(left[i:])\\n    result.extend(right[j:])\\n    return result"
        },
        "buggyCode": {
            "python": "def merge_sort(arr):\\n    if len(arr) < 1:\\n        return arr\\n    \\n    mid = len(arr) / 2\\n    left = merge_sort(arr[:mid])\\n    right = merge_sort(arr[mid:])\\n    \\n    return merge(left, right)\\n\\ndef merge(left, right):\\n    result = []\\n    i = j = 0\\n    \\n    while i < len(left) or j < len(right):\\n        if left[i] < right[j]:\\n            result.append(left[i])\\n            i += 1\\n        else:\\n            result.append(right[j])\\n            j += 1\\n    \\n    result.extend(left[i:])\\n    result.extend(right[j:])\\n    return result"
        }
    },
    
    # HARD 1
    {
        "title": "Fix Dynamic Programming Solution",
        "description": "Debug this dynamic programming solution for the coin change problem. Find the minimum number of coins needed to make up an amount.",
        "difficulty": "Hard",
        "examples": [
            {"input": "coins = [1,2,5], amount = 11", "output": "3", "explanation": "11 = 5 + 5 + 1"},
            {"input": "coins = [2], amount = 3", "output": "-1"}
        ],
        "testCases": [
            {"input": "[1,2,5]\\n11", "expected": "3"},
            {"input": "[2]\\n3", "expected": "-1"},
            {"input": "[1]\\n0", "expected": "0"},
            {"input": "[1,3,4]\\n6", "expected": "2"}
        ],
        "hint": "Check DP initialization, loop boundaries, and update logic.",
        "starterCode": {
            "python": "def coin_change(coins, amount):\\n    pass",
            "javascript": "function coinChange(coins, amount) {\\n    // Your code here\\n}",
            "cpp": "int coinChange(vector<int>& coins, int amount) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def coin_change(coins, amount):\\n    dp = [float('inf')] * (amount + 1)\\n    dp[0] = 0\\n    \\n    for i in range(1, amount + 1):\\n        for coin in coins:\\n            if i >= coin:\\n                dp[i] = min(dp[i], dp[i - coin] + 1)\\n    \\n    return dp[amount] if dp[amount] != float('inf') else -1"
        },
        "buggyCode": {
            "python": "def coin_change(coins, amount):\\n    dp = [float('inf')] * amount\\n    dp[0] = 0\\n    \\n    for i in range(1, amount):\\n        for coin in coins:\\n            if i \u003e= coin:\\n                dp[i] = min(dp[i], dp[i - coin])\\n    \\n    return dp[amount] if dp[amount] != float('inf') else -1"
        }
    }
]

# ============================================================================
# CODE SHUFFLE PROBLEMS (Rearrange shuffled code)
# ============================================================================

CODE_SHUFFLE_PROBLEMS = [
    # EASY 1
    {
        "title": "Reverse String - Code Shuffle",
        "description": "Rearrange the shuffled lines of code to create a function that reverses a string.",
        "difficulty": "Easy",
        "examples": [
            {"input": 's = "hello"', "output": '"olleh"'},
            {"input": 's = "world"', "output": '"dlrow"'}
        ],
        "testCases": [
            {"input": "s = 'hello'", "expected": "olleh"},
            {"input": "s = 'world'", "expected": "dlrow"},
            {"input": "s = 'a'", "expected": "a"},
            {"input": "s = ''", "expected": ""}
        ],
        "hint": "Python slicing can reverse strings easily.",
        "starterCode": {
            "python": "def reverse_string(s):\\n    pass",
            "javascript": "function reverseString(s) {\\n    // Your code here\\n}",
            "cpp": "string reverseString(string s) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def reverse_string(s):\\n    return s[::-1]"
        }
    },
    
    # EASY 2  
    {
        "title": "Find Maximum - Code Shuffle",
        "description": "Rearrange the code lines to find the maximum element in an array.",
        "difficulty": "Easy",
        "examples": [
            {"input": "arr = [1, 5, 3, 9, 2]", "output": "9"},
            {"input": "arr = [-1, -5, -3]", "output": "-1"}
        ],
        "testCases": [
            {"input": "arr = [1, 5, 3, 9, 2]", "expected": "9"},
            {"input": "arr = [-1, -5, -3]", "expected": "-1"},
            {"input": "arr = [42]", "expected": "42"},
            {"input": "arr = [1, 1, 1, 1]", "expected": "1"}
        ],
        "hint": "Use a variable to track the maximum as you iterate.",
        "starterCode": {
            "python": "def find_max(arr):\\n    pass",
            "javascript": "function findMax(arr) {\\n    // Your code here\\n}",
            "cpp": "int findMax(vector<int> arr) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def find_max(arr):\\n    if not arr:\\n        return None\\n    max_val = arr[0]\\n    for num in arr:\\n        if num > max_val:\\n            max_val = num\\n    return max_val"
        }
    },
    
    # MEDIUM 1
    {
        "title": "Valid Parentheses - Code Shuffle",
        "description": "Rearrange the code to check if a string has valid parentheses.",
        "difficulty": "Medium",
        "examples": [
            {"input": 's = "()"', "output": "true"},
            {"input": 's = "()[]{}"', "output": "true"},
            {"input": 's = "(]"', "output": "false"}
        ],
        "testCases": [
            {"input": "s = '()'", "expected": "true"},
            {"input": "s = '()[]{}'", "expected": "true"},
            {"input": "s = '(]'", "expected": "false"},
            {"input": "s = '([)]'", "expected": "false"},
            {"input": "s = '{[]}'", "expected": "true"}
        ],
        "hint": "Use a stack to match opening and closing brackets.",
        "starterCode": {
            "python": "def is_valid(s):\\n    pass",
            "javascript": "function isValid(s) {\\n    // Your code here\\n}",
            "cpp": "bool isValid(string s) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def is_valid(s):\\n    stack = []\\n    mapping = {')': '(', '}': '{', ']': '['}\\n    \\n    for char in s:\\n        if char in mapping:\\n            top = stack.pop() if stack else '#'\\n            if mapping[char] != top:\\n                return False\\n        else:\\n            stack.append(char)\\n    \\n    return len(stack) == 0"
        }
    },
    
    # MEDIUM 2
    {
        "title": "Fibonacci - Code Shuffle",
        "description": "Rearrange the lines to create an efficient Fibonacci function using memoization.",
        "difficulty": "Medium",
        "examples": [
            {"input": "n = 10", "output": "55"},
            {"input": "n = 0", "output": "0"},
            {"input": "n = 1", "output": "1"}
        ],
        "testCases": [
            {"input": "n = 10", "expected": "55"},
            {"input": "n = 0", "expected": "0"},
            {"input": "n = 1", "expected": "1"},
            {"input": "n = 5", "expected": "5"},
            {"input": "n = 15", "expected": "610"}
        ],
        "hint": "Use a dictionary to cache previously computed values.",
        "starterCode": {
            "python": "def fibonacci(n):\\n    pass",
            "javascript": "function fibonacci(n) {\\n    // Your code here\\n}",
            "cpp": "int fibonacci(int n) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def fibonacci(n, memo={}):\\n    if n in memo:\\n        return memo[n]\\n    if n <= 1:\\n        return n\\n    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)\\n    return memo[n]"
        }
    },
    
    # HARD 1
    {
        "title": "Quick Sort - Code Shuffle",
        "description": "Rearrange the shuffled lines to implement the quick sort algorithm.",
        "difficulty": "Hard",
        "examples": [
            {"input": "arr = [3, 6, 8, 10, 1, 2, 1]", "output": "[1, 1, 2, 3, 6, 8, 10]"},
            {"input": "arr = [5, 2, 3, 1]", "output": "[1, 2, 3, 5]"}
        ],
        "testCases": [
            {"input": "arr = [3, 6, 8, 10, 1, 2, 1]", "expected": "[1, 1, 2, 3, 6, 8, 10]"},
            {"input": "arr = [5, 2, 3, 1]", "expected": "[1, 2, 3, 5]"},
            {"input": "arr = [1]", "expected": "[1]"},
            {"input": "arr = []", "expected": "[]"}
        ],
        "hint": "Quick sort uses partitioning - pick a pivot and recursively sort smaller and larger elements.",
        "starterCode": {
            "python": "def quick_sort(arr):\\n    pass",
            "javascript": "function quickSort(arr) {\\n    // Your code here\\n}",
            "cpp": "vector<int> quickSort(vector<int> arr) {\\n    // Your code here\\n}"
        },
        "referenceCode": {
            "python": "def quick_sort(arr):\\n    if len(arr) <= 1:\\n        return arr\\n    pivot = arr[len(arr) // 2]\\n    left = [x for x in arr if x < pivot]\\n    middle = [x for x in arr if x == pivot]\\n    right = [x for x in arr if x > pivot]\\n    return quick_sort(left) + middle + quick_sort(right)"
        }
    }
]


async def seed_problems():
    """Seed the database with competitive problems"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🌱 Seeding competitive problems...")
    
    # Clear existing competitive problems
    result = await db.problems.delete_many({"created_for_competitive": True})
    print(f"🗑️  Deleted {result.deleted_count} existing competitive problems")
    
    total_inserted = 0
    
    # Insert Code Sprint problems
    print("\\n⚡ Inserting Code Sprint problems...")
    for problem in CODE_SPRINT_PROBLEMS:
        problem_doc = {
            **problem,
            "topics": ["competitive", "code-sprint"],
            "created_for_competitive": True,
            "competitive_mode": "standard",
            "videoUrl": "",
            "explanations": {"approach": [], "complexity": []},
            "sampleTests": []
        }
        await db.problems.insert_one(problem_doc)
        total_inserted += 1
        print(f"  ✅ {problem['title']} ({problem['difficulty']})")
    
    # Insert Bug Hunt problems
    print("\\n🐛 Inserting Bug Hunt problems...")
    for problem in BUG_HUNT_PROBLEMS:
        problem_doc = {
            **problem,
            "topics": ["competitive", "bug-hunt"],
            "created_for_competitive": True,
            "competitive_mode": "bug_hunt",
            "videoUrl": "",
            "explanations": {"approach": [], "complexity": []},
            "sampleTests": []
        }
        await db.problems.insert_one(problem_doc)
        total_inserted += 1
        print(f"  ✅ {problem['title']} ({problem['difficulty']})")
    
    # Insert Code Shuffle problems
    print("\\n🔀 Inserting Code Shuffle problems...")
    for problem in CODE_SHUFFLE_PROBLEMS:
        problem_doc = {
            **problem,
            "topics": ["competitive", "code-shuffle"],
            "created_for_competitive": True,
            "competitive_mode": "code_shuffle",
            "videoUrl": "",
            "explanations": {"approach": [], "complexity": []},
            "sampleTests": []
        }
        await db.problems.insert_one(problem_doc)
        total_inserted += 1
        print(f"  ✅ {problem['title']} ({problem['difficulty']})")
    
    print(f"\\n✨ Successfully seeded {total_inserted} competitive problems!")
    print("\\nBreakdown:")
    print(f"  - Code Sprint: 5 problems (2 Easy, 2 Medium, 1 Hard)")
    print(f"  - Bug Hunt: 5 problems (2 Easy, 2 Medium, 1 Hard)")
    print(f"  - Code Shuffle: 5 problems (2 Easy, 2 Medium, 1 Hard)")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_problems())
