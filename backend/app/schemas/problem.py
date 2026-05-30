from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class SampleTest(BaseModel):
    id: int
    input: str
    expected: str

class TestCase(BaseModel):
    input: str
    expected: str

class Example(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None

class ProblemBase(BaseModel):
    title: str
    description: Optional[str] = ""
    difficulty: str = Field(..., pattern="^(Easy|Medium|Hard)$")
    topics: List[str] = []
    videoUrl: str
    referenceCode: Dict[str, str]  # python, cpp, java
    buggyCode: Dict[str, str] = {}  # Code with intentional bugs for R2
    explanations: Dict[str, List[str]]
    sampleTests: List[SampleTest]
    # Additional fields for competitive problems
    examples: Optional[List[Example]] = []
    testCases: Optional[List[TestCase]] = []
    starterCode: Optional[Dict[str, str]] = {}
    hint: Optional[str] = ""

class ProblemCreate(ProblemBase):
    pass

class ProblemInDB(ProblemBase):
    id: str

class ProblemPublic(ProblemBase):
    id: str
