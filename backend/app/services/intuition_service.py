import time
import math
import random
import json
import os
from typing import Dict, Any, List, Optional
import google.generativeai as genai

from app.core.config import get_settings
from app.schemas.intuition import (
    IntuitionProblemResponse,
    SandboxConfig,
    PointerConfig,
    LogicCard,
    SocraticHintResponse,
    ChaosBenchmarkResponse,
    ArenaEvaluateResponse,
    CognitiveProfileResponse,
    CognitiveVectorScores,
    BlindspotItem
)

settings = get_settings()
api_key = settings.google_api_key or os.getenv("GOOGLE_API_KEY", "")

if api_key:
    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        print(f"[WARNING] Failed to configure Gemini API: {e}")

# Built-in Intuition Problems for Phase 1 MVP
INTUITION_PROBLEMS: Dict[str, Dict[str, Any]] = {
    "two_sum_sorted": {
        "problem_id": "two_sum_sorted",
        "title": "Two Sum II - Pair in Sorted Array",
        "difficulty": "Medium",
        "category": "Two Pointers",
        "story_hook": "🚨 The orbital docking station needs two balancing counter-weights whose combined mass matches the exact docking target. The storage bay is sorted by weight.",
        "sandbox_config": {
            "type": "two_pointers",
            "title": "The Weight Balancer",
            "description": "Drag the Left (Blue) and Right (Red) pointers across the weights until their sum equals the Target Mass of 18.",
            "initial_data": [2, 4, 7, 11, 15, 18],
            "target": 18,
            "pointers": [
                {"name": "left", "initial_index": 0, "color": "#3B82F6", "label": "L (Low)"},
                {"name": "right", "initial_index": 5, "color": "#EF4444", "label": "R (High)"}
            ],
            "goal_rule": "sum_equals_target",
            "hints_on_drag": {
                "sum_too_large": "Sum is greater than target! The array is sorted, so move the Right pointer left to decrease the sum.",
                "sum_too_small": "Sum is smaller than target! Move the Left pointer right to increase the sum.",
                "target_matched": "🎯 BINGO! When sum matches target, we found our indices in O(N) operations without nested loops!"
            }
        },
        "chaos_config": {
            "naive_complexity": "O(N^2)",
            "optimal_complexity": "O(N)",
            "threshold_n": 50000,
            "worst_case_explanation": "A nested loop checks every pair (N*(N-1)/2). At N=50,000, that's 1.25 Billion calculations! Two pointers only makes 50,000 steps max."
        },
        "logic_cards": [
            {
                "id": "card_1",
                "label": "1. Initialize left at 0, right at end of array",
                "category": "init",
                "code_template": {
                    "python": "left = 0\nright = len(numbers) - 1",
                    "cpp": "int left = 0;\nint right = numbers.size() - 1;",
                    "java": "int left = 0;\nint right = numbers.length - 1;"
                }
            },
            {
                "id": "card_2",
                "label": "2. Loop while left pointer is strictly less than right",
                "category": "loop",
                "code_template": {
                    "python": "while left < right:",
                    "cpp": "while (left < right) {",
                    "java": "while (left < right) {"
                }
            },
            {
                "id": "card_3",
                "label": "3. Calculate current sum = numbers[left] + numbers[right]",
                "category": "condition",
                "code_template": {
                    "python": "    curr_sum = numbers[left] + numbers[right]",
                    "cpp": "    int curr_sum = numbers[left] + numbers[right];",
                    "java": "    int curr_sum = numbers[left] + numbers[right];"
                }
            },
            {
                "id": "card_4",
                "label": "4. If curr_sum == target, return 1-based indices [left+1, right+1]",
                "category": "return",
                "code_template": {
                    "python": "    if curr_sum == target:\n        return [left + 1, right + 1]",
                    "cpp": "    if (curr_sum == target) return {left + 1, right + 1};",
                    "java": "    if (curr_sum == target) return new int[]{left + 1, right + 1};"
                }
            },
            {
                "id": "card_5",
                "label": "5. Else if curr_sum < target, advance left++",
                "category": "condition",
                "code_template": {
                    "python": "    elif curr_sum < target:\n        left += 1",
                    "cpp": "    else if (curr_sum < target) left++;",
                    "java": "    else if (curr_sum < target) left++;"
                }
            },
            {
                "id": "card_6",
                "label": "6. Else (curr_sum > target), decrement right--",
                "category": "condition",
                "code_template": {
                    "python": "    else:\n        right -= 1",
                    "cpp": "    else right--;",
                    "java": "    else right--;"
                }
            }
        ],
        "reference_code": {
            "python": """def twoSum(numbers: list[int], target: int) -> list[int]:
    left, right = 0, len(numbers) - 1
    while left < right:
        curr_sum = numbers[left] + numbers[right]
        if curr_sum == target:
            return [left + 1, right + 1]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []""",
            "cpp": """#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& numbers, int target) {
    int left = 0, right = numbers.size() - 1;
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return {left + 1, right + 1};
        else if (sum < target) left++;
        else right--;
    }
    return {};
}""",
            "java": """public class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) return new int[]{left + 1, right + 1};
            else if (sum < target) left++;
            else right--;
        }
        return new int[]{};
    }
}"""
        },
        "test_cases": [
            {"input": "[2, 7, 11, 15], target = 9", "expected": "[1, 2]"},
            {"input": "[2, 3, 4], target = 6", "expected": "[1, 3]"},
            {"input": "[-1, 0], target = -1", "expected": "[1, 2]"}
        ]
    },
    "sliding_window_max": {
        "problem_id": "sliding_window_max",
        "title": "Maximum Average Subarray",
        "difficulty": "Easy",
        "category": "Sliding Window",
        "story_hook": "🛰️ An astronomical sensor records continuous energy pulses. Find the consecutive window of k seconds that delivers maximum average solar power.",
        "sandbox_config": {
            "type": "sliding_window",
            "title": "The Solar Energy Window",
            "description": "Drag the fixed-size window of length K=4 across the sensor readings. Watch how we add the incoming reading and subtract the outgoing reading in O(1) time!",
            "initial_data": [1, 12, -5, -6, 50, 3, 22, 9],
            "target": 4,
            "pointers": [
                {"name": "window_start", "initial_index": 0, "color": "#10B981", "label": "Start"},
                {"name": "window_end", "initial_index": 3, "color": "#6366F1", "label": "End"}
            ],
            "goal_rule": "max_window_sum",
            "hints_on_drag": {
                "window_shifted": "Notice: When sliding the window by 1 step, we don't recalculate all 4 items! We just: window_sum += next_element - previous_element."
            }
        },
        "chaos_config": {
            "naive_complexity": "O(N * K)",
            "optimal_complexity": "O(N)",
            "threshold_n": 100000,
            "worst_case_explanation": "Re-summing K elements for every window does N*K operations. At N=100,000 and K=50,000, that's 5 BILLION operations. Sliding window runs in a blink."
        },
        "logic_cards": [
            {
                "id": "sw_1",
                "label": "1. Compute initial sum of the first k elements",
                "category": "init",
                "code_template": {
                    "python": "window_sum = sum(nums[:k])\nmax_sum = window_sum",
                    "cpp": "double window_sum = 0;\nfor(int i=0; i<k; i++) window_sum += nums[i];\ndouble max_sum = window_sum;",
                    "java": "double windowSum = 0;\nfor(int i=0; i<k; i++) windowSum += nums[i];\ndouble maxSum = windowSum;"
                }
            },
            {
                "id": "sw_2",
                "label": "2. Iterate from index k to the end of the array",
                "category": "loop",
                "code_template": {
                    "python": "for i in range(k, len(nums)):",
                    "cpp": "for (int i = k; i < nums.size(); i++) {",
                    "java": "for (int i = k; i < nums.length; i++) {"
                }
            },
            {
                "id": "sw_3",
                "label": "3. Add new item entering window, subtract outgoing item",
                "category": "condition",
                "code_template": {
                    "python": "    window_sum += nums[i] - nums[i - k]",
                    "cpp": "    window_sum += nums[i] - nums[i - k];",
                    "java": "    windowSum += nums[i] - nums[i - k];"
                }
            },
            {
                "id": "sw_4",
                "label": "4. Update maximum sum recorded so far",
                "category": "condition",
                "code_template": {
                    "python": "    max_sum = max(max_sum, window_sum)",
                    "cpp": "    max_sum = max(max_sum, window_sum);",
                    "java": "    maxSum = Math.max(maxSum, windowSum);"
                }
            },
            {
                "id": "sw_5",
                "label": "5. Return max_sum / k",
                "category": "return",
                "code_template": {
                    "python": "return max_sum / k",
                    "cpp": "return max_sum / k;",
                    "java": "return maxSum / k;"
                }
            }
        ],
        "reference_code": {
            "python": """def findMaxAverage(nums: list[int], k: int) -> float:
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum / k""",
            "cpp": """#include <vector>
#include <numeric>
#include <algorithm>
using namespace std;

double findMaxAverage(vector<int>& nums, int k) {
    double window_sum = 0;
    for(int i = 0; i < k; i++) window_sum += nums[i];
    double max_sum = window_sum;
    for(int i = k; i < nums.size(); i++) {
        window_sum += nums[i] - nums[i - k];
        max_sum = max(max_sum, window_sum);
    }
    return max_sum / k;
}""",
            "java": """public class Solution {
    public double findMaxAverage(int[] nums, int k) {
        double windowSum = 0;
        for (int i = 0; i < k; i++) windowSum += nums[i];
        double maxSum = windowSum;
        for (int i = k; i < nums.length; i++) {
            windowSum += nums[i] - nums[i - k];
            maxSum = Math.max(maxSum, windowSum);
        }
        return maxSum / k;
    }
}"""
        },
        "test_cases": [
            {"input": "nums = [1,12,-5,-6,50,3], k = 4", "expected": "12.75"},
            {"input": "nums = [5], k = 1", "expected": "5.0"}
        ]
    },
    "valid_parentheses": {
        "problem_id": "valid_parentheses",
        "title": "Valid Bracket Structure",
        "difficulty": "Easy",
        "category": "Stack",
        "story_hook": "🛡️ The compiler syntax parser has received nested enclosure signals. Verify every opened bracket is closed in reverse chronological order (LIFO).",
        "sandbox_config": {
            "type": "stack",
            "title": "The Bracket Stack Elevator",
            "description": "Click the brackets in the stream to push opening brackets onto the stack and pop matching closing brackets. See why LIFO maintains perfect nesting!",
            "initial_data": ["(", "[", "{", "}", "]", ")"],
            "target": "valid",
            "pointers": [],
            "goal_rule": "empty_stack_on_valid",
            "hints_on_drag": {
                "push": "Opening bracket pushed to the top of the stack.",
                "match": "Closing bracket matches top of stack! Popped successfully.",
                "mismatch": "Mismatch error! The top bracket does not match the closing symbol."
            }
        },
        "chaos_config": {
            "naive_complexity": "O(N^2) String Replacement",
            "optimal_complexity": "O(N) Stack",
            "threshold_n": 100000,
            "worst_case_explanation": "Repeatedly replacing '()' or '[]' in a string creates O(N^2) memory allocations and scans. A stack processes every character in exactly 1 pass (O(N))."
        },
        "logic_cards": [
            {
                "id": "st_1",
                "label": "1. Initialize an empty stack and bracket matching dictionary",
                "category": "init",
                "code_template": {
                    "python": "stack = []\nmapping = {')': '(', '}': '{', ']': '['}",
                    "cpp": "stack<char> st;\nunordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};",
                    "java": "Stack<Character> stack = new Stack<>();\nMap<Character, Character> map = Map.of(')', '(', '}', '{', ']', '[');"
                }
            },
            {
                "id": "st_2",
                "label": "2. Iterate over each character in the string",
                "category": "loop",
                "code_template": {
                    "python": "for char in s:",
                    "cpp": "for (char c : s) {",
                    "java": "for (char c : s.toCharArray()) {"
                }
            },
            {
                "id": "st_3",
                "label": "3. If closing bracket, check stack is non-empty and top matches",
                "category": "condition",
                "code_template": {
                    "python": "    if char in mapping:\n        top = stack.pop() if stack else '#'\n        if mapping[char] != top:\n            return False",
                    "cpp": "    if (mapping.count(c)) {\n        char top = st.empty() ? '#' : st.top();\n        if (!st.empty()) st.pop();\n        if (top != mapping[c]) return false;\n    }",
                    "java": "    if (map.containsKey(c)) {\n        char top = stack.isEmpty() ? '#' : stack.pop();\n        if (top != map.get(c)) return false;\n    }"
                }
            },
            {
                "id": "st_4",
                "label": "4. Else (opening bracket), push onto stack",
                "category": "condition",
                "code_template": {
                    "python": "    else:\n        stack.append(char)",
                    "cpp": "    else {\n        st.push(c);\n    }",
                    "java": "    else {\n        stack.push(c);\n    }"
                }
            },
            {
                "id": "st_5",
                "label": "5. Return True if stack is completely empty",
                "category": "return",
                "code_template": {
                    "python": "return not stack",
                    "cpp": "return st.empty();",
                    "java": "return stack.isEmpty();"
                }
            }
        ],
        "reference_code": {
            "python": """def isValid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack""",
            "cpp": """#include <string>
#include <stack>
#include <unordered_map>
using namespace std;

bool isValid(string s) {
    stack<char> st;
    unordered_map<char, char> map = {{')', '('}, {'}', '{'}, {']', '['}};
    for (char c : s) {
        if (map.count(c)) {
            char top = st.empty() ? '#' : st.top();
            if (!st.empty()) st.pop();
            if (top != map[c]) return false;
        } else {
            st.push(c);
        }
    }
    return st.empty();
}""",
            "java": """import java.util.*;

public class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        Map<Character, Character> map = Map.of(')', '(', '}', '{', ']', '[');
        for (char c : s.toCharArray()) {
            if (map.containsKey(c)) {
                char top = stack.isEmpty() ? '#' : stack.pop();
                if (top != map.get(c)) return false;
            } else {
                stack.push(c);
            }
        }
        return stack.isEmpty();
    }
}"""
        },
        "test_cases": [
            {"input": "s = \"()[]{}\"", "expected": "true"},
            {"input": "s = \"(]\"", "expected": "false"},
            {"input": "s = \"([{}])\"", "expected": "true"}
        ]
    }
}


class IntuitionService:
    @staticmethod
    def get_problem(problem_id: str) -> Optional[IntuitionProblemResponse]:
        # Fallback to two_sum_sorted if id not found
        data = INTUITION_PROBLEMS.get(problem_id, INTUITION_PROBLEMS.get("two_sum_sorted"))
        if not data:
            return None
        return IntuitionProblemResponse(**data)

    @staticmethod
    def get_all_intuition_problems() -> List[Dict[str, Any]]:
        return [
            {
                "problem_id": k,
                "title": v["title"],
                "difficulty": v["difficulty"],
                "category": v["category"],
                "story_hook": v["story_hook"]
            }
            for k, v in INTUITION_PROBLEMS.items()
        ]

    @staticmethod
    def run_chaos_benchmark(req) -> ChaosBenchmarkResponse:
        n = req.n_elements
        alg = req.algorithm_type
        
        # Calculate simulated physical runtime and operations
        if alg == "naive":
            # O(N^2)
            ops = int((n * (n - 1)) / 2)
            # Scaling ms calculation: 10,000 ops = ~1ms
            calc_ms = round((ops / 150000.0) + (random.uniform(0.5, 3.0)), 2)
            if n >= 20000:
                calc_ms = min(calc_ms, 5240.0)
                status = "OVERHEAT_TLE"
                msg = f"🔥 CPU OVERHEAT ALERT! At N={n:,}, naive algorithm tried to execute {ops:,} operations. Server Time Limit Exceeded (TLE)!"
            else:
                status = "SUCCESS"
                msg = f"Completed in {calc_ms}ms with {ops:,} operations, but scaling to larger datasets will cause TLE."
            complexity = "O(N^2)"
        else:
            # O(N) Optimal
            ops = n
            calc_ms = round((n / 450000.0) + (random.uniform(0.1, 0.8)), 2)
            status = "SUCCESS"
            complexity = "O(N)"
            msg = f"⚡ ULTRA-FAST! Linear O(N) approach executed {ops:,} steps in just {calc_ms}ms. Handles massive scale effortlessly!"

        return ChaosBenchmarkResponse(
            n_elements=n,
            distribution=req.distribution,
            algorithm_type=alg,
            time_taken_ms=calc_ms,
            simulated_operations=ops,
            status=status,
            complexity_label=complexity,
            insight_message=msg
        )

    @staticmethod
    async def generate_socratic_hint(req) -> SocraticHintResponse:
        tier = req.tier
        tier_names = {
            1: "Gentle Nudge",
            2: "Boundary Check",
            3: "Counter-Example Drill",
            4: "Algorithmic Concept"
        }
        
        tier_name = tier_names.get(tier, "Guided Nudge")
        
        # Fallback default hints if Gemini is not reachable
        fallback_hints = {
            1: {
                "question": "Notice the ordering of the input data. Is there a property you can exploit instead of checking every pair?",
                "concept": "Sorted Order Invariant",
                "counter_input": "[-5, -1, 3, 7], target = 2"
            },
            2: {
                "question": "Take a look at your loop boundary condition. What happens when the two pointers meet at the exact same index?",
                "concept": "Loop Termination Condition",
                "counter_input": "[3, 3], target = 6"
            },
            3: {
                "question": "Run your logic manually on this small test: What is the sum if all numbers are negative?",
                "concept": "Negative Value Edge Cases",
                "counter_input": "[-10, -5, -2], target = -7"
            },
            4: {
                "question": "Instead of nested loops O(N^2), moving pointers inward based on whether the current sum is too high or too low guarantees O(N) time with O(1) memory.",
                "concept": "Two-Pointer Inward Contraction",
                "counter_input": None
            }
        }
        
        fb = fallback_hints.get(tier, fallback_hints[1])
        
        if not api_key:
            return SocraticHintResponse(
                tier=tier,
                tier_name=tier_name,
                guided_question=fb["question"],
                target_concept=fb["concept"],
                line_number_hint=random.choice([12, 18, 24]) if tier >= 2 else None,
                suggested_counter_input=fb["counter_input"],
                encouragement="Keep exploring! You are one thought away from the optimal insight."
            )

        # Call Gemini with structured Socratic prompt
        try:
            model_name = os.getenv("GOOGLE_MODEL", "gemini-flash-latest")
            model = genai.GenerativeModel(model_name)
            prompt = f"""You are a master Socratic Computer Science Professor.
The student is working on problem: {req.problem_id} in {req.language}.
Student's Current Code:
```
{req.student_code}
```
Failed Test/Error Context: {req.failed_test_case or req.execution_error or 'Student is stuck'}
Requested Hint Tier: {tier} ({tier_name}).

RULES:
- Tier 1: Give a subtle nudge about data structure invariant or pattern.
- Tier 2: Ask a specific question about a boundary or loop condition in their code.
- Tier 3: Provide a minimal breaking counter-example input without giving code.
- Tier 4: Explain the high-level algorithmic concept.
- NEVER write complete solution code.
- Return ONLY valid JSON format with keys:
{{"guided_question": "...", "target_concept": "...", "line_number_hint": 14, "suggested_counter_input": "...", "encouragement": "..."}}
"""
            res = model.generate_content(prompt)
            raw = res.text.strip()
            # Clean markdown JSON wraps if present
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.endswith("```"):
                raw = raw[:-3]
            data = json.loads(raw.strip())
            
            return SocraticHintResponse(
                tier=tier,
                tier_name=tier_name,
                guided_question=data.get("guided_question", fb["question"]),
                target_concept=data.get("target_concept", fb["concept"]),
                line_number_hint=data.get("line_number_hint", 15),
                suggested_counter_input=data.get("suggested_counter_input", fb["counter_input"]),
                encouragement=data.get("encouragement", "Great problem-solving mindset! Keep pushing.")
            )
        except Exception as e:
            print(f"[WARNING] Socratic AI generation failed, using fallback: {e}")
            return SocraticHintResponse(
                tier=tier,
                tier_name=tier_name,
                guided_question=fb["question"],
                target_concept=fb["concept"],
                line_number_hint=14 if tier >= 2 else None,
                suggested_counter_input=fb["counter_input"],
                encouragement="Trust your intuition! You are very close."
            )

    @staticmethod
    async def evaluate_arena_defense(req) -> ArenaEvaluateResponse:
        student_defense = req.student_defense_response.lower()
        
        # Fast baseline evaluation
        mentions_time = any(w in student_defense for w in ["o(n)", "linear", "time", "pass", "log n", "complexity", "single loop"])
        mentions_space = any(w in student_defense for w in ["o(1)", "constant", "space", "memory", "in-place", "hash map", "pointers"])
        
        base_score = 60
        if mentions_time:
            base_score += 20
        if mentions_space:
            base_score += 20
            
        base_score = min(base_score, 100)
        passed = base_score >= 70
        badge = "Optimal Space Architect" if mentions_space else "Algorithmic Defender"

        if not api_key:
            return ArenaEvaluateResponse(
                passed_defense=passed,
                score=base_score,
                critique="Clear articulation of the single-pass invariant and auxiliary memory efficiency.",
                time_complexity_accuracy="Accurately justified O(N) single-pass traversal.",
                space_complexity_accuracy="Identified O(1) in-place pointers vs O(N) Hash Map memory cost.",
                earned_badge=badge if passed else None,
                xp_awarded=150 if passed else 50,
                senior_feedback="Well defended! In engineering interviews, discussing memory footprint before writing code demonstrates Senior-level maturity."
            )

        try:
            model_name = os.getenv("GOOGLE_MODEL", "gemini-flash-latest")
            model = genai.GenerativeModel(model_name)
            prompt = f"""You are 'Senior Architect Alex' conducting a post-solution defense round for problem '{req.problem_id}'.
Student's Code:
```
{req.student_code}
```
Question asked to student: "{req.question_context}"
Student's Defense Response: "{req.student_defense_response}"

Evaluate the student's explanation on:
1. Time complexity reasoning.
2. Space complexity trade-off awareness.
3. Clarity and engineering maturity.

Return ONLY a JSON object with:
{{
  "passed_defense": true/false,
  "score": 0-100,
  "critique": "1-2 sentences on their defense",
  "time_complexity_accuracy": "Analysis of time complexity claim",
  "space_complexity_accuracy": "Analysis of space complexity claim",
  "earned_badge": "Optimal Space Architect" (or null if score < 75),
  "xp_awarded": 150,
  "senior_feedback": "Encouraging senior engineer feedback"
}}
"""
            res = model.generate_content(prompt)
            raw = res.text.strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.endswith("```"):
                raw = raw[:-3]
            data = json.loads(raw.strip())
            
            return ArenaEvaluateResponse(
                passed_defense=data.get("passed_defense", True),
                score=data.get("score", base_score),
                critique=data.get("critique", "Strong conceptual justification."),
                time_complexity_accuracy=data.get("time_complexity_accuracy", "O(N) validated"),
                space_complexity_accuracy=data.get("space_complexity_accuracy", "O(1) memory validated"),
                earned_badge=data.get("earned_badge", badge),
                xp_awarded=data.get("xp_awarded", 150),
                senior_feedback=data.get("senior_feedback", "Excellent defense!")
            )
        except Exception as e:
            print(f"[WARNING] Arena AI evaluation failed, using fallback: {e}")
            return ArenaEvaluateResponse(
                passed_defense=passed,
                score=base_score,
                critique="Good grasp of algorithmic trade-offs.",
                time_complexity_accuracy="O(N) single-pass recognized.",
                space_complexity_accuracy="O(1) in-place auxiliary memory validated.",
                earned_badge=badge if passed else None,
                xp_awarded=150 if passed else 50,
                senior_feedback="Great defense! Knowing your trade-offs is what sets great engineers apart."
            )

    @staticmethod
    def get_user_cognitive_profile(user_id: str, username: str) -> CognitiveProfileResponse:
        return CognitiveProfileResponse(
            user_id=user_id,
            username=username,
            level=3,
            total_xp=1450,
            radar_scores=CognitiveVectorScores(
                edge_case_handling=82,
                time_optimization=88,
                space_optimization=85,
                syntax_translation=78,
                articulation_score=80
            ),
            active_blindspots=[
                BlindspotItem(
                    id="bs_1",
                    title="Off-by-One in Pointer Convergence",
                    severity="low",
                    occurrences=2,
                    drill_recommendation="Practice 2-minute drill on 'Strict vs Inclusive While Loops'"
                ),
                BlindspotItem(
                    id="bs_2",
                    title="Negative Value Target Handling",
                    severity="medium",
                    occurrences=3,
                    drill_recommendation="Verify sign preservation when calculating sliding differences"
                )
            ],
            mastery_badges=[
                {"name": "Chaos Slayer", "desc": "Benchmarked and defeated O(N^2) bottlenecks", "icon": "🔥"},
                {"name": "Optimal Space Architect", "desc": "Defended O(1) in-place memory solutions", "icon": "🏛️"},
                {"name": "Intuition Master", "desc": "Completed 5 Visual Sandbox puzzles", "icon": "🧠"}
            ],
            intuition_streak_days=4
        )
