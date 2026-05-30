import google.generativeai as genai
from app.core.config import get_settings
import json
import random
import asyncio
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from bson import ObjectId

settings = get_settings()

# Configure Gemini
if settings.google_api_key:
    genai.configure(api_key=settings.google_api_key)

# Load question banks from JSON files
QUESTION_BANKS = {}

def load_question_banks():
    """Load question banks from JSON files"""
    global QUESTION_BANKS
    
    data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
    
    for language in ['python', 'java', 'cpp']:
        file_path = os.path.join(data_dir, f'{language}_questions.json')
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                QUESTION_BANKS[language] = json.load(f)
            print(f"✅ Loaded {language} question bank")
        except Exception as e:
            print(f"⚠️ Failed to load {language} questions: {e}")
            QUESTION_BANKS[language] = {}

# Load question banks on module import
load_question_banks()

# Question type distribution
QUESTION_TYPE_DISTRIBUTION = {
    "find_bug": 0.30,
    "missing_code": 0.20,
    "output": 0.20,
    "error": 0.20,
    "best_practice": 0.10
}

# Difficulty distribution
DIFFICULTY_DISTRIBUTION = {
    "easy": 0.50,
    "medium": 0.30,
    "hard": 0.20
}

# Points by difficulty
POINTS_BY_DIFFICULTY = {
    "easy": 10,
    "medium": 15,
    "hard": 20
}


def generate_sample_question(language: str, difficulty: str, question_type: str) -> Dict:
    """Generate a sample question from JSON files (fallback for quota issues)"""
    
    # Try to get question from loaded JSON files
    try:
        if language in QUESTION_BANKS:
            questions = QUESTION_BANKS[language].get(difficulty, {}).get(question_type, [])
            if questions:
                # Randomly select a question from the bank
                q = random.choice(questions)
                return {
                    **q,
                    "question_type": question_type,
                    "language": language,
                    "difficulty": difficulty,
                    "points": POINTS_BY_DIFFICULTY[difficulty],
                    "created_at": datetime.utcnow(),
                    "created_by": "bank",
                    "usage_count": 0,
                    "last_used": None,
                    "times_correct": 0,
                    "times_incorrect": 0,
                    "average_time_to_answer": 0.0
                }
    except Exception as e:
        print(f"⚠️ Error loading from question bank: {e}")
    
    # Generic fallback if JSON loading fails
    return {
        "question": f"Sample {difficulty} {question_type} question for {language}",
        "code": "# Sample code",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": 0,
        "explanation": "This is a sample question for testing purposes.",
        "question_type": question_type,
        "language": language,
        "difficulty": difficulty,
        "points": POINTS_BY_DIFFICULTY[difficulty],
        "created_at": datetime.utcnow(),
        "created_by": "fallback",
        "usage_count": 0,
        "last_used": None,
        "times_correct": 0,
        "times_incorrect": 0,
        "average_time_to_answer": 0.0
    }
    """Generate a sample question without AI (fallback for quota issues)"""
    
    sample_questions = {
        "python": {
            "easy": {
                "output": {
                    "question": "What is the output of this code?",
                    "code": "x = [1, 2, 3]\nprint(len(x))",
                    "options": ["3", "2", "[1, 2, 3]", "Error"],
                    "correct_answer": 0,
                    "explanation": "The len() function returns the number of items in a list. The list has 3 elements, so it returns 3."
                },
                "find_bug": {
                    "question": "What is wrong with this code?",
                    "code": "def greet(name)\n    print(f'Hello {name}')",
                    "options": [
                        "Missing colon after function definition",
                        "Missing return statement",
                        "Wrong indentation",
                        "Nothing is wrong"
                    ],
                    "correct_answer": 0,
                    "explanation": "Python function definitions must end with a colon (:). The correct syntax is 'def greet(name):'"
                },
                "missing_code": {
                    "question": "What should replace the blank to make this code work?",
                    "code": "numbers = [1, 2, 3, 4, 5]\nresult = _____(numbers)\nprint(result)  # Output: 15",
                    "options": ["sum", "len", "max", "min"],
                    "correct_answer": 0,
                    "explanation": "The sum() function adds all elements in a list. sum([1,2,3,4,5]) returns 15."
                },
                "error": {
                    "question": "What error will this code raise?",
                    "code": "my_list = [1, 2, 3]\nprint(my_list[5])",
                    "options": ["IndexError", "ValueError", "KeyError", "TypeError"],
                    "correct_answer": 0,
                    "explanation": "Accessing an index that doesn't exist in a list raises an IndexError."
                },
                "best_practice": {
                    "question": "Which is the best way to check if a key exists in a dictionary?",
                    "code": "my_dict = {'name': 'John', 'age': 30}",
                    "options": [
                        "'name' in my_dict",
                        "my_dict.has_key('name')",
                        "my_dict['name'] != None",
                        "try: my_dict['name']"
                    ],
                    "correct_answer": 0,
                    "explanation": "Using 'in' operator is the most Pythonic and efficient way to check if a key exists in a dictionary."
                }
            },
            "medium": {
                "output": {
                    "question": "What is the output of this code?",
                    "code": "x = [1, 2, 3]\ny = x\ny.append(4)\nprint(len(x))",
                    "options": ["4", "3", "Error", "None"],
                    "correct_answer": 0,
                    "explanation": "Lists are mutable and y = x creates a reference, not a copy. When y.append(4) is called, x is also modified."
                },
                "find_bug": {
                    "question": "What is the bug in this code?",
                    "code": "def add_item(item, my_list=[]):\n    my_list.append(item)\n    return my_list",
                    "options": [
                        "Mutable default argument",
                        "Missing return statement",
                        "Wrong parameter order",
                        "No bug"
                    ],
                    "correct_answer": 0,
                    "explanation": "Using mutable default arguments (like []) is dangerous because the same list is reused across function calls."
                },
                "missing_code": {
                    "question": "What should replace the blank?",
                    "code": "numbers = [1, 2, 3, 4, 5]\nsquares = [x___2 for x in numbers]",
                    "options": ["**", "*", "^", "pow"],
                    "correct_answer": 0,
                    "explanation": "The ** operator is used for exponentiation in Python. x**2 means x squared."
                },
                "error": {
                    "question": "What error will this code raise?",
                    "code": "result = '5' + 5",
                    "options": ["TypeError", "ValueError", "SyntaxError", "AttributeError"],
                    "correct_answer": 0,
                    "explanation": "Python doesn't allow concatenating strings and integers directly. This raises a TypeError."
                },
                "best_practice": {
                    "question": "Which is the best way to open and read a file?",
                    "code": None,
                    "options": [
                        "with open('file.txt') as f: data = f.read()",
                        "f = open('file.txt'); data = f.read()",
                        "f = open('file.txt'); data = f.read(); f.close()",
                        "data = open('file.txt').read()"
                    ],
                    "correct_answer": 0,
                    "explanation": "Using 'with' statement ensures the file is properly closed even if an exception occurs."
                }
            },
            "hard": {
                "output": {
                    "question": "What is the output of this code?",
                    "code": "def func(x=[]):\n    x.append(1)\n    return x\nprint(len(func()) + len(func()))",
                    "options": ["3", "2", "1", "4"],
                    "correct_answer": 0,
                    "explanation": "Mutable default arguments persist across calls. First call: [1], second call: [1,1]. Total: 1 + 2 = 3."
                },
                "find_bug": {
                    "question": "What is the subtle bug in this code?",
                    "code": "class Counter:\n    count = 0\n    def increment(self):\n        count += 1",
                    "options": [
                        "Should use self.count instead of count",
                        "Missing return statement",
                        "Wrong indentation",
                        "No bug"
                    ],
                    "correct_answer": 0,
                    "explanation": "The method tries to modify a local variable 'count' instead of the class attribute 'self.count'."
                },
                "missing_code": {
                    "question": "What decorator should be used here?",
                    "code": "class MyClass:\n    _____\n    def class_method(cls):\n        return cls.__name__",
                    "options": ["@classmethod", "@staticmethod", "@property", "@abstractmethod"],
                    "correct_answer": 0,
                    "explanation": "@classmethod decorator is used when a method needs access to the class (cls) rather than instance (self)."
                },
                "error": {
                    "question": "What error will this code raise?",
                    "code": "x = 5\ndel x\nprint(x)",
                    "options": ["NameError", "ValueError", "AttributeError", "KeyError"],
                    "correct_answer": 0,
                    "explanation": "After 'del x', the variable x no longer exists. Trying to access it raises a NameError."
                },
                "best_practice": {
                    "question": "Which is the most efficient way to concatenate many strings?",
                    "code": "strings = ['a', 'b', 'c', 'd', 'e']",
                    "options": [
                        "''.join(strings)",
                        "result = ''; for s in strings: result += s",
                        "reduce(lambda x,y: x+y, strings)",
                        "sum(strings, '')"
                    ],
                    "correct_answer": 0,
                    "explanation": "''.join() is the most efficient method for concatenating multiple strings in Python."
                }
            }
        }
    }
    
    # Try to get a sample question
    try:
        q = sample_questions[language][difficulty][question_type]
        return {
            **q,
            "question_type": question_type,
            "language": language,
            "difficulty": difficulty,
            "points": POINTS_BY_DIFFICULTY[difficulty],
            "created_at": datetime.utcnow(),
            "created_by": "sample",
            "usage_count": 0,
            "last_used": None,
            "times_correct": 0,
            "times_incorrect": 0,
            "average_time_to_answer": 0.0
        }
    except KeyError:
        # Generic fallback
        return {
            "question": f"Sample {difficulty} {question_type} question for {language}",
            "code": "# Sample code",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0,
            "explanation": "This is a sample question for testing purposes.",
            "question_type": question_type,
            "language": language,
            "difficulty": difficulty,
            "points": POINTS_BY_DIFFICULTY[difficulty],
            "created_at": datetime.utcnow(),
            "created_by": "sample",
            "usage_count": 0,
            "last_used": None,
            "times_correct": 0,
            "times_incorrect": 0,
            "average_time_to_answer": 0.0
        }


def build_question_prompt(language: str, difficulty: str, question_type: str) -> str:
    """Build optimized prompt for Google Gemini"""
    
    language_names = {
        "python": "Python",
        "java": "Java",
        "cpp": "C++"
    }
    
    lang_display = language_names.get(language, language)
    
    base_context = f"""You are an expert programming educator creating quiz questions.

CRITICAL REQUIREMENTS:
1. Output ONLY valid JSON (no markdown, no code blocks, no backticks)
2. Code must be syntactically correct {lang_display}
3. All 4 options must be plausible but only 1 correct
4. Explanations must be concise (2-3 sentences)
5. Code snippets under 15 lines

Language: {lang_display}
Difficulty: {difficulty.upper()}
Question Type: {question_type.replace('_', ' ').title()}
"""
    
    # Difficulty-specific guidelines
    if difficulty == "easy":
        base_context += "\nDifficulty Guidelines: Basic syntax, simple logic, common patterns. Suitable for beginners."
    elif difficulty == "medium":
        base_context += "\nDifficulty Guidelines: Intermediate concepts, multiple steps, edge cases. Requires solid understanding."
    else:  # hard
        base_context += "\nDifficulty Guidelines: Advanced concepts, tricky edge cases, optimization. Requires deep knowledge."
    
    # Question type-specific format
    type_formats = {
        "find_bug": f"""
Question Type: Find the Bug
Task: Provide {lang_display} code with a subtle bug. Ask what the bug is.

JSON Format:
{{
  "question": "What is the bug in this code?",
  "code": "def example():\\n    # buggy code here\\n    return result",
  "options": [
    "Correct answer describing the bug",
    "Plausible wrong answer 1",
    "Plausible wrong answer 2",
    "Plausible wrong answer 3"
  ],
  "correct_answer": 0,
  "explanation": "Why this is the bug and how to fix it"
}}

Bug Examples: Off-by-one errors, wrong operators, incorrect conditions, missing edge cases, wrong variable names.
""",
        "missing_code": f"""
Question Type: Missing Code
Task: Provide {lang_display} code with a blank (___). Ask what should fill the blank.

JSON Format:
{{
  "question": "What should replace the blank (___) to make this code work correctly?",
  "code": "def example():\\n    result = ___\\n    return result",
  "options": [
    "Correct code to fill the blank",
    "Plausible wrong answer 1",
    "Plausible wrong answer 2",
    "Plausible wrong answer 3"
  ],
  "correct_answer": 0,
  "explanation": "Why this is correct"
}}

Examples: Missing loop condition, missing return value, missing function call, missing operator.
""",
        "output": f"""
Question Type: Output Prediction
Task: Provide {lang_display} code. Ask what it outputs.

JSON Format:
{{
  "question": "What is the output of this code?",
  "code": "x = 5\\ny = 10\\nprint(x + y)",
  "options": [
    "Correct output",
    "Plausible wrong output 1",
    "Plausible wrong output 2",
    "Plausible wrong output 3"
  ],
  "correct_answer": 0,
  "explanation": "Why this is the output"
}}

Focus on: Type conversions, operator precedence, loop iterations, function returns, string operations.
""",
        "error": f"""
Question Type: Error Identification
Task: Provide {lang_display} code that will cause an error. Ask what error occurs.

JSON Format:
{{
  "question": "What error will this code produce?",
  "code": "numbers = [1, 2, 3]\\nprint(numbers[5])",
  "options": [
    "Correct error type",
    "Plausible wrong error 1",
    "Plausible wrong error 2",
    "Plausible wrong error 3"
  ],
  "correct_answer": 0,
  "explanation": "Why this error occurs"
}}

Error Types: IndexError, TypeError, ValueError, NameError, AttributeError, SyntaxError, ZeroDivisionError.
""",
        "best_practice": f"""
Question Type: Best Practice
Task: Ask about {lang_display} best practices, conventions, or optimal approaches.

JSON Format:
{{
  "question": "Which is the best practice for [specific scenario]?",
  "code": "# Optional code example if needed",
  "options": [
    "Correct best practice",
    "Acceptable but not best",
    "Poor practice 1",
    "Poor practice 2"
  ],
  "correct_answer": 0,
  "explanation": "Why this is the best practice"
}}

Topics: Naming conventions, code organization, performance, readability, security, error handling.
"""
    }
    
    full_prompt = base_context + type_formats.get(question_type, type_formats["output"])
    
    full_prompt += f"""

IMPORTANT REMINDERS:
- Return ONLY the JSON object (no markdown formatting)
- Ensure all code is valid {lang_display} syntax
- Make distractors believable but clearly wrong
- Keep explanations under 50 words
- Test that your question has exactly one correct answer
"""
    
    return full_prompt


async def generate_single_question(
    language: str,
    difficulty: str,
    question_type: str
) -> Optional[Dict]:
    """Generate a single quiz question using AI"""
    
    if not settings.google_api_key:
        print("⚠️ No API key, using sample question")
        return generate_sample_question(language, difficulty, question_type)
    
    try:
        # Use gemini-flash-latest (alias for latest stable flash model)
        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = build_question_prompt(language, difficulty, question_type)
        
        response = model.generate_content(prompt)
        question_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if question_text.startswith("```"):
            lines = question_text.split("\n")
            question_text = "\n".join(lines[1:-1])
            if question_text.startswith("json"):
                question_text = question_text[4:].strip()
        
        question_data = json.loads(question_text)
        
        # Validate structure
        required_fields = ["question", "options", "correct_answer", "explanation"]
        if not all(field in question_data for field in required_fields):
            print(f"⚠️ Missing required fields in generated question, using sample")
            return generate_sample_question(language, difficulty, question_type)
        
        if len(question_data["options"]) != 4:
            print(f"⚠️ Question must have exactly 4 options, using sample")
            return generate_sample_question(language, difficulty, question_type)
        
        if not (0 <= question_data["correct_answer"] <= 3):
            print(f"⚠️ correct_answer must be 0-3, using sample")
            return generate_sample_question(language, difficulty, question_type)
        
        # Add metadata
        question_data["question_type"] = question_type
        question_data["language"] = language
        question_data["difficulty"] = difficulty
        question_data["points"] = POINTS_BY_DIFFICULTY[difficulty]
        question_data["created_at"] = datetime.utcnow()
        question_data["created_by"] = "ai"
        question_data["usage_count"] = 0
        question_data["last_used"] = None
        question_data["times_correct"] = 0
        question_data["times_incorrect"] = 0
        question_data["average_time_to_answer"] = 0.0
        
        return question_data
        
    except json.JSONDecodeError as e:
        print(f"⚠️ Failed to parse AI response as JSON: {e}, using sample")
        return generate_sample_question(language, difficulty, question_type)
    except Exception as e:
        print(f"⚠️ AI question generation failed: {e}, using sample")
        return generate_sample_question(language, difficulty, question_type)


async def get_cached_questions(
    db,
    language: str,
    difficulty: str,
    question_type: str,
    count: int
) -> List[Dict]:
    """Get cached questions from database that haven't been used recently"""
    
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Find questions matching criteria that haven't been used in 7 days
    cursor = db.quiz_questions.find({
        "language": language,
        "difficulty": difficulty,
        "question_type": question_type,
        "$or": [
            {"last_used": {"$lt": seven_days_ago}},
            {"last_used": None}
        ]
    }).limit(count * 2)
    
    questions = await cursor.to_list(length=None)
    
    if not questions:
        return []
    
    # Randomly select from available pool
    selected = random.sample(questions, min(count, len(questions)))
    
    # Update last_used timestamp
    for q in selected:
        await db.quiz_questions.update_one(
            {"_id": q["_id"]},
            {
                "$set": {"last_used": datetime.utcnow()},
                "$inc": {"usage_count": 1}
            }
        )
    
    return selected


async def save_questions(db, questions: List[Dict]) -> List[str]:
    """Save generated questions to database"""
    
    if not questions:
        return []
    
    result = await db.quiz_questions.insert_many(questions)
    return [str(id) for id in result.inserted_ids]


async def generate_quiz_questions(
    db,
    language: str,
    question_count: int
) -> List[Dict]:
    """
    Generate quiz questions with hybrid approach:
    1. Try to get from database first (cached)
    2. Generate missing ones with AI
    3. Store new questions for future reuse
    """
    
    print(f"🎯 Generating {question_count} quiz questions for {language}...")
    
    # Calculate distribution
    difficulty_counts = {
        "easy": int(question_count * DIFFICULTY_DISTRIBUTION["easy"]),
        "medium": int(question_count * DIFFICULTY_DISTRIBUTION["medium"]),
        "hard": 0
    }
    # Ensure total adds up
    difficulty_counts["hard"] = question_count - difficulty_counts["easy"] - difficulty_counts["medium"]
    
    type_counts = {
        "find_bug": int(question_count * QUESTION_TYPE_DISTRIBUTION["find_bug"]),
        "missing_code": int(question_count * QUESTION_TYPE_DISTRIBUTION["missing_code"]),
        "output": int(question_count * QUESTION_TYPE_DISTRIBUTION["output"]),
        "error": int(question_count * QUESTION_TYPE_DISTRIBUTION["error"]),
        "best_practice": 0
    }
    # Ensure total adds up
    type_counts["best_practice"] = question_count - sum([
        type_counts["find_bug"],
        type_counts["missing_code"],
        type_counts["output"],
        type_counts["error"]
    ])
    
    print(f"  📊 Distribution:")
    print(f"     Difficulty: {difficulty_counts}")
    print(f"     Types: {type_counts}")
    
    questions = []
    questions_to_generate = []
    
    # Try to get cached questions first
    print(f"  💾 Checking cache...")
    for difficulty, diff_count in difficulty_counts.items():
        for question_type, type_count in type_counts.items():
            # Calculate how many of this type+difficulty combo we need
            needed = int((diff_count / question_count) * (type_count / question_count) * question_count)
            if needed == 0:
                needed = 1 if diff_count > 0 and type_count > 0 else 0
            
            if needed > 0:
                cached = await get_cached_questions(db, language, difficulty, question_type, needed)
                questions.extend(cached)
                
                remaining = needed - len(cached)
                if remaining > 0:
                    questions_to_generate.extend([
                        (language, difficulty, question_type) for _ in range(remaining)
                    ])
    
    print(f"  ✅ Found {len(questions)} cached questions")
    print(f"  🤖 Need to generate {len(questions_to_generate)} new questions")
    
    # Generate missing questions with AI
    if questions_to_generate and settings.google_api_key:
        print(f"  🤖 Generating with AI...")
        
        # Generate in batches to respect rate limits
        batch_size = 5
        new_questions = []
        
        for i in range(0, len(questions_to_generate), batch_size):
            batch = questions_to_generate[i:i + batch_size]
            
            # Generate batch in parallel
            tasks = [
                generate_single_question(lang, diff, qtype)
                for lang, diff, qtype in batch
            ]
            
            batch_results = await asyncio.gather(*tasks)
            
            # Filter out None results
            valid_results = [q for q in batch_results if q is not None]
            new_questions.extend(valid_results)
            
            print(f"     Generated {len(valid_results)}/{len(batch)} questions in batch")
            
            # Small delay between batches
            if i + batch_size < len(questions_to_generate):
                await asyncio.sleep(0.5)
        
        # Save new questions to database
        if new_questions:
            await save_questions(db, new_questions)
            questions.extend(new_questions)
            print(f"  💾 Saved {len(new_questions)} new questions to database")
    
    # If we still don't have enough, fill with any available cached questions
    if len(questions) < question_count:
        print(f"  ⚠️ Still need {question_count - len(questions)} more questions, using any available...")
        
        cursor = db.quiz_questions.find({
            "language": language
        }).limit(question_count - len(questions))
        
        additional = await cursor.to_list(length=None)
        questions.extend(additional)
    
    # Shuffle to mix difficulties and types
    random.shuffle(questions)
    
    # Return exactly the requested count
    final_questions = questions[:question_count]
    
    print(f"  ✅ Returning {len(final_questions)} questions")
    
    return final_questions


def calculate_quiz_score(
    answers: Dict[int, int],
    questions: List[Dict],
    time_taken: int,
    time_limit: int
) -> Dict:
    """Calculate quiz score with time bonus"""
    
    correct_count = 0
    base_points = 0
    
    for idx, question in enumerate(questions):
        selected = answers.get(idx)
        
        if selected is not None and selected == question.get("correct_answer"):
            correct_count += 1
            base_points += question.get("points", 10)
    
    # Time bonus (faster = more points, max 50 bonus)
    time_ratio = max(0, 1 - (time_taken / time_limit))
    time_bonus = int(time_ratio * 50)
    
    final_score = base_points + time_bonus
    
    return {
        "score": final_score,
        "base_points": base_points,
        "time_bonus": time_bonus,
        "correct": correct_count,
        "total": len(questions),
        "time_taken": time_taken
    }
