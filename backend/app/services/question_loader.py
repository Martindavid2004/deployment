"""
Question Loader Service

Loads bug hunt questions from local JSON file.
Supports multi-language questions with Python, Java, and C++ variants.
"""

import json
import random
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


@dataclass
class TestCase:
    """Test case for validating code correctness"""
    input: str
    expected: str
    description: str


@dataclass
class LanguageVariant:
    """Language-specific implementation of a bug hunt question"""
    buggy_code: str
    fixed_code: str
    test_cases: List[TestCase]


@dataclass
class BugHuntQuestion:
    """Complete bug hunt question with all language variants"""
    id: str
    title: str
    description: str
    difficulty: str  # 'easy', 'medium', 'hard'
    time_limit: int  # seconds
    languages: Dict[str, LanguageVariant]  # 'python', 'java', 'cpp'
    hints: List[str]


class QuestionLoader:
    """
    Loads bug hunt questions from local JSON file
    
    Features:
    - Primary source: Local JSON file (data/bug_hunt_questions.json)
    - Pre-loading on startup for fast access
    - In-memory caching by difficulty
    """
    
    def __init__(
        self,
        db=None,
        json_path: str = "data/bug_hunt_questions.json",
        redis_client=None
    ):
        """
        Initialize question loader with data sources
        
        Args:
            db: MongoDB database instance
            json_path: Path to JSON backup file
            redis_client: Optional Redis client for caching
        """
        self.db = db
        self.json_path = Path(json_path)
        self.redis_client = redis_client
        
        # In-memory cache
        self.questions_cache: Dict[str, List[BugHuntQuestion]] = {
            'easy': [],
            'medium': [],
            'hard': []
        }
        
        self._preloaded = False
    
    async def preload_questions(self):
        """Pre-load all questions from JSON file on startup"""
        if self._preloaded:
            return
        
        logger.info("Pre-loading bug hunt questions from JSON...")
        
        for difficulty in ['easy', 'medium', 'hard']:
            try:
                # Load from JSON only (skip MongoDB)
                questions = self._load_from_json(difficulty)
                self.questions_cache[difficulty] = questions
                logger.info(f"✅ Loaded {len(self.questions_cache[difficulty])} {difficulty} questions from JSON")
            
            except Exception as e:
                logger.error(f"❌ Error pre-loading {difficulty} questions: {e}")
        
        self._preloaded = True
        total_questions = sum(len(q) for q in self.questions_cache.values())
        logger.info(f"✅ Question pre-loading complete: {total_questions} total questions")
    
    async def get_question(
        self,
        difficulty: str,
        exclude_ids: List[str] = None
    ) -> Optional[BugHuntQuestion]:
        """
        Get random question by difficulty from JSON file
        
        Args:
            difficulty: One of 'easy', 'medium', 'hard'
            exclude_ids: Question IDs to exclude (avoid repeats)
            
        Returns:
            BugHuntQuestion with all language variants, or None if not found
        """
        if exclude_ids is None:
            exclude_ids = []
        
        # Ensure questions are preloaded
        if not self._preloaded:
            await self.preload_questions()
        
        # Get questions from cache
        available_questions = [
            q for q in self.questions_cache.get(difficulty, [])
            if q.id not in exclude_ids
        ]
        
        if not available_questions:
            logger.warning(f"⚠️ No {difficulty} questions available in JSON file")
            return None
        
        # Return random question
        question = random.choice(available_questions)
        logger.info(f"📝 Selected question: {question.id} ({difficulty})")
        
        return question
    
    async def _load_from_mongodb(self, difficulty: str) -> List[BugHuntQuestion]:
        """
        Load questions from MongoDB
        
        Args:
            difficulty: Question difficulty level
            
        Returns:
            List of BugHuntQuestion objects
        """
        try:
            if self.db is None:
                return []
            
            collection = self.db.bug_hunt_questions
            cursor = collection.find({'difficulty': difficulty})
            
            questions = []
            async for doc in cursor:
                try:
                    question = self._parse_question_document(doc)
                    questions.append(question)
                except Exception as e:
                    logger.warning(f"Skipping invalid question {doc.get('id')}: {e}")
            
            return questions
        
        except Exception as e:
            logger.error(f"Error loading from MongoDB: {e}")
            return []
    
    def _load_from_json(self, difficulty: str) -> List[BugHuntQuestion]:
        """
        Load questions from JSON file
        
        Args:
            difficulty: Question difficulty level
            
        Returns:
            List of BugHuntQuestion objects
        """
        try:
            if not self.json_path.exists():
                logger.error(f"JSON file not found: {self.json_path}")
                return []
            
            with open(self.json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            questions = []
            for q_data in data.get(difficulty, []):
                try:
                    question = self._parse_question_dict(q_data)
                    questions.append(question)
                except Exception as e:
                    logger.warning(f"Skipping invalid question {q_data.get('id')}: {e}")
            
            return questions
        
        except Exception as e:
            logger.error(f"Error loading from JSON: {e}")
            return []
    
    def _parse_question_document(self, doc: dict) -> BugHuntQuestion:
        """
        Parse MongoDB document into BugHuntQuestion
        
        Args:
            doc: MongoDB document
            
        Returns:
            BugHuntQuestion object
        """
        # Parse language variants
        languages = {}
        for lang in ['python', 'java', 'cpp']:
            if lang in doc.get('languages', {}):
                lang_data = doc['languages'][lang]
                test_cases = [
                    TestCase(**tc) for tc in lang_data.get('test_cases', [])
                ]
                languages[lang] = LanguageVariant(
                    buggy_code=lang_data['buggy_code'],
                    fixed_code=lang_data['fixed_code'],
                    test_cases=test_cases
                )
        
        return BugHuntQuestion(
            id=doc['id'],
            title=doc['title'],
            description=doc['description'],
            difficulty=doc['difficulty'],
            time_limit=doc['time_limit'],
            languages=languages,
            hints=doc.get('hints', [])
        )
    
    def _parse_question_dict(self, data: dict) -> BugHuntQuestion:
        """
        Parse dictionary into BugHuntQuestion
        
        Args:
            data: Question dictionary from JSON
            
        Returns:
            BugHuntQuestion object
        """
        # Parse language variants
        languages = {}
        for lang in ['python', 'java', 'cpp']:
            if lang in data.get('languages', {}):
                lang_data = data['languages'][lang]
                test_cases = [
                    TestCase(**tc) for tc in lang_data.get('test_cases', [])
                ]
                languages[lang] = LanguageVariant(
                    buggy_code=lang_data['buggy_code'],
                    fixed_code=lang_data['fixed_code'],
                    test_cases=test_cases
                )
        
        return BugHuntQuestion(
            id=data['id'],
            title=data['title'],
            description=data['description'],
            difficulty=data['difficulty'],
            time_limit=data['time_limit'],
            languages=languages,
            hints=data.get('hints', [])
        )
    
    async def _cache_question(self, question: BugHuntQuestion):
        """
        Cache question in Redis if available
        
        Args:
            question: Question to cache
        """
        if not self.redis_client:
            return
        
        try:
            key = f"bug_hunt_question:{question.id}"
            # Convert to dict for JSON serialization
            question_dict = self._question_to_dict(question)
            await self.redis_client.setex(
                key,
                3600,  # 1 hour TTL
                json.dumps(question_dict)
            )
        except Exception as e:
            logger.warning(f"Failed to cache question in Redis: {e}")
    
    def _question_to_dict(self, question: BugHuntQuestion) -> dict:
        """Convert BugHuntQuestion to dictionary"""
        return {
            'id': question.id,
            'title': question.title,
            'description': question.description,
            'difficulty': question.difficulty,
            'time_limit': question.time_limit,
            'languages': {
                lang: {
                    'buggy_code': variant.buggy_code,
                    'fixed_code': variant.fixed_code,
                    'test_cases': [asdict(tc) for tc in variant.test_cases]
                }
                for lang, variant in question.languages.items()
            },
            'hints': question.hints
        }
