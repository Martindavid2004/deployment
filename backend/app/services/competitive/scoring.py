"""
Pure competitive-mode helpers (scoring, code shuffling, bug injection).

Extracted verbatim from app/routers/competitive.py during the
behavior-preserving refactor. No business logic was changed; only
``print()`` calls were routed through ``logger.debug()`` so that emoji
output cannot crash on Windows consoles.
"""

import logging
import random
import re
from typing import List

logger = logging.getLogger(__name__)


def shuffle_code_lines(code: str) -> List[str]:
    """Shuffle code lines while maintaining logical structure"""
    # Handle escaped newlines from seed data
    if "\\n" in code:
        code = code.replace("\\n", "\n")
        
    lines = code.strip().split('\n')
    # Filter out empty lines
    non_empty_lines = [line for line in lines if line.strip()]
    # Shuffle the lines
    shuffled = non_empty_lines.copy()
    random.shuffle(shuffled)
    
    logger.debug(f"🔀 Shuffling code:")
    logger.debug(f"  - Original lines: {len(lines)}")
    logger.debug(f"  - Non-empty lines: {len(non_empty_lines)}")
    logger.debug(f"  - Shuffled lines: {len(shuffled)}")
    
    return shuffled

def normalize_code_indentation(lines: List[str]) -> str:
    """
    Join and normalize code lines to fix indentation issues.
    This handles cases where arranged lines have inconsistent indentation.
    """
    if not lines:
        return ""
    
    # Join lines first
    code = '\n'.join(lines)
    
    # Try to detect the minimum indentation for non-empty lines
    non_empty_lines = [line for line in lines if line.strip()]
    if not non_empty_lines:
        return code
    
    # Find minimum indentation (except for blank lines)
    min_indent = float('inf')
    for line in non_empty_lines:
        if line.strip():
            indent = len(line) - len(line.lstrip())
            min_indent = min(min_indent, indent)
    
    min_indent = 0 if min_indent == float('inf') else min_indent
    
    # Dedent all lines by the minimum indentation to normalize
    if min_indent > 0:
        normalized_lines = []
        for line in lines:
            if line.strip():  # Non-empty line
                # Remove minimum indentation
                if len(line) >= min_indent and line[:min_indent].strip() == '':
                    normalized_lines.append(line[min_indent:])
                else:
                    normalized_lines.append(line)
            else:
                normalized_lines.append(line)  # Keep blank lines as-is
        code = '\n'.join(normalized_lines)
    
    return code

def calculate_code_shuffle_score(original: str, arranged: List[str]) -> int:
    """Calculate score for code shuffle game mode based on correctness"""
    original_lines = [line.strip() for line in original.strip().split('\n') if line.strip()]
    arranged_lines = [line.strip() for line in arranged if line.strip()]
    
    if len(original_lines) != len(arranged_lines):
        return 0
    
    # Calculate percentage of correctly placed lines
    correct = sum(1 for o, a in zip(original_lines, arranged_lines) if o == a)
    return int((correct / len(original_lines)) * 100)

def evaluate_test_cases(test_cases: List[dict], reference_code: str, language: str) -> int:
    """Evaluate quality of user-created test cases"""
    if not test_cases:
        return 0
    
    # Score based on:
    # 1. Number of test cases (more is better, up to a point)
    # 2. Variety of inputs (edge cases, normal cases)
    # 3. Correctness (do they actually test the function properly)
    
    score = 0
    
    # Basic score for having test cases
    score += min(len(test_cases) * 10, 50)  # Max 50 points for quantity
    
    # Bonus for variety (check if inputs vary significantly)
    if len(test_cases) >= 3:
        score += 20
    if len(test_cases) >= 5:
        score += 15
    
    # Bonus for edge cases (empty, negative, large numbers, etc.)
    edge_case_patterns = [r'0', r'-\d+', r'\[\]', r'""', r"''", r'None']
    for tc in test_cases:
        input_str = str(tc.get('input', ''))
        for pattern in edge_case_patterns:
            if re.search(pattern, input_str):
                score += 5
                break
    
    return min(score, 100)  # Cap at 100

def generate_buggy_code(correct_code: str, language: str = "python") -> str:
    """Generate buggy code by introducing common programming errors"""
    if not correct_code:
        return ""
    
    lines = correct_code.split('\n')
    buggy_lines = lines.copy()
    bugs_introduced = 0
    non_empty_lines = len([l for l in lines if l.strip() and not l.strip().startswith('#')])
    max_bugs = min(3, max(1, non_empty_lines // 3))  # Ensure at least 1 bug for short code
    
    logger.debug(f"🐛 Generating buggy code: {non_empty_lines} lines, target {max_bugs} bugs")
    
    # Common bug patterns for different languages
    bug_types = []
    
    if language == "python":
        bug_types = [
            # Off-by-one error in range
            lambda line: line.replace('range(len(', 'range(len(') if 'range(len(' in line else (
                line.replace('range(', 'range(1, ', 1) if 'range(' in line and 'range(1,' not in line and 'range(0' not in line else line
            ),
            # Missing colon after control structures
            lambda line: line.rstrip(':') if line.strip().endswith(':') and any(kw in line for kw in ['if ', 'for ', 'while ', 'def ', 'class ', 'elif ', 'else:', 'try:', 'except']) else line,
            # Wrong comparison operator (== vs =)
            lambda line: line.replace('==', '=', 1) if '==' in line and 'def ' not in line and '#' not in line else line,
            # Wrong indentation - remove 4 spaces (1 indentation level) for indented lines
            lambda line: line[4:] if line.startswith('    ') and line.strip() and not line.strip().startswith('#') and len(line.lstrip()) < len(line) - 4 else line,
            # Missing return statement (comment it out)
            lambda line: '# ' + line if 'return ' in line and not line.strip().startswith('#') else line,
            # Wrong operator precedence (+ vs *)
            lambda line: line.replace(' + ', ' * ', 1) if ' + ' in line and 'def ' not in line and '#' not in line else line,
            # Wrong list indexing
            lambda line: line.replace('[0]', '[1]', 1) if '[0]' in line else (
                line.replace('[-1]', '[-2]', 1) if '[-1]' in line else line
            ),
            # Incorrect loop variable
            lambda line: line.replace('for i in', 'for j in', 1) if 'for i in' in line and 'i]' in line else line,
            # Wrong boolean operator
            lambda line: line.replace(' and ', ' or ', 1) if ' and ' in line else (
                line.replace(' or ', ' and ', 1) if ' or ' in line else line
            ),
            # Missing increment
            lambda line: line.replace('i += 1', 'i += 2', 1) if 'i += 1' in line else (
                line.replace('count += 1', 'count += 2', 1) if 'count += 1' in line else line
            ),
            # Wrong string method
            lambda line: line.replace('.append(', '.extend(', 1) if '.append(' in line else line,
            # Incorrect condition
            lambda line: line.replace(' < ', ' <= ', 1) if ' < ' in line else (
                line.replace(' > ', ' >= ', 1) if ' > ' in line else line
            ),
        ]
    
    elif language == "javascript":
        bug_types = [
            # Missing semicolon
            lambda line: line.rstrip(';') if line.strip().endswith(';') and not line.strip().startswith('for') else line,
            # Wrong comparison (== vs ===)
            lambda line: line.replace('===', '==', 1) if '===' in line else line,
            # Missing return
            lambda line: '// ' + line if 'return ' in line and not line.strip().startswith('//') else line,
            # Wrong array method
            lambda line: line.replace('.push(', '.pop(', 1) if '.push(' in line else line,
            # Off-by-one in loop
            lambda line: line.replace('< length', '<= length', 1) if '< length' in line else line,
            # Wrong operator
            lambda line: line.replace(' + ', ' - ', 1) if ' + ' in line and '//' not in line else line,
            # Missing var/let/const
            lambda line: line.replace('let ', '', 1) if line.strip().startswith('let ') else (
                line.replace('const ', '', 1) if line.strip().startswith('const ') else line
            ),
            # Wrong increment
            lambda line: line.replace('++', '--', 1) if '++' in line else line,
        ]
    
    elif language == "java":
        bug_types = [
            # Missing semicolon
            lambda line: line.rstrip(';') if line.strip().endswith(';') and not line.strip().startswith('for') and not line.strip().startswith('if') else line,
            # Wrong comparison operator
            lambda line: line.replace('==', '=', 1) if '==' in line and 'if' in line else line,
            # Off-by-one in loop
            lambda line: line.replace('< ', '<= ', 1) if '< ' in line and 'for' in line else line,
            # Wrong operator
            lambda line: line.replace(' + ', ' * ', 1) if ' + ' in line and '//' not in line else line,
            # Missing return
            lambda line: '// ' + line if 'return ' in line and not line.strip().startswith('//') else line,
            # Wrong array indexing
            lambda line: line.replace('[0]', '[1]', 1) if '[0]' in line else line,
            # Wrong increment
            lambda line: line.replace('++', '--', 1) if '++' in line else line,
            # Wrong condition
            lambda line: line.replace(' < ', ' <= ', 1) if ' < ' in line else line,
        ]
    
    elif language == "cpp" or language == "c++":
        bug_types = [
            # Missing semicolon
            lambda line: line.rstrip(';') if line.strip().endswith(';') and not line.strip().startswith('for') and not line.strip().startswith('if') else line,
            # Wrong comparison operator
            lambda line: line.replace('==', '=', 1) if '==' in line and 'if' in line else line,
            # Off-by-one in loop
            lambda line: line.replace('< ', '<= ', 1) if '< ' in line and 'for' in line else line,
            # Wrong operator
            lambda line: line.replace(' + ', ' * ', 1) if ' + ' in line and '//' not in line else line,
            # Missing return
            lambda line: '// ' + line if 'return ' in line and not line.strip().startswith('//') else line,
            # Wrong array indexing
            lambda line: line.replace('[0]', '[1]', 1) if '[0]' in line else line,
            # Wrong increment
            lambda line: line.replace('++', '--', 1) if '++' in line else line,
            # Wrong condition
            lambda line: line.replace(' < ', ' <= ', 1) if ' < ' in line else line,
        ]
    
    # If no bug types defined for language, return original code
    if not bug_types:
        logger.debug(f"  ⚠️ Warning: No bug patterns defined for language '{language}', returning original code")
        return correct_code
    
    # Try multiple passes to ensure we introduce bugs
    max_attempts = 10
    attempt = 0
    
    while bugs_introduced < max_bugs and attempt < max_attempts:
        attempt += 1
        available_indices = list(range(len(buggy_lines)))
        random.shuffle(available_indices)
        
        for idx in available_indices:
            if bugs_introduced >= max_bugs:
                break
            
            line = buggy_lines[idx]
            # Skip empty lines, comments
            if not line.strip() or line.strip().startswith('#') or line.strip().startswith('//'):
                continue
            
            # Try to apply a random bug
            bug_func = random.choice(bug_types)
            modified_line = bug_func(line)
            
            # Only apply if the line actually changed
            if modified_line != line:
                logger.debug(f"  🐛 Bug {bugs_introduced + 1}: Line {idx + 1}: '{line.strip()}' → '{modified_line.strip()}'")
                buggy_lines[idx] = modified_line
                bugs_introduced += 1
    
    if bugs_introduced == 0:
        logger.debug(f"  ⚠️ Warning: No bugs introduced after {attempt} attempts!")
    else:
        logger.debug(f"  ✅ Successfully introduced {bugs_introduced} bug(s)")
    
    # Validate that the buggy code is syntactically valid (even if logically wrong)
    buggy_code = '\n'.join(buggy_lines)
    
    if language == "python":
        try:
            compile(buggy_code, '<string>', 'exec')
            logger.debug(f"  ✅ Buggy code syntax is valid")
        except SyntaxError as e:
            # If syntax is invalid, return the original correct code with bugs commented out
            # This ensures the code at least compiles, even if it doesn't run correctly
            logger.debug(f"  ⚠️ ERROR: Generated buggy code has syntax error: {str(e)}")
            logger.debug(f"  ⚠️ Returning original code to avoid IndentationError in Bug Hunt")
            # Apply only safe, non-structural bugs to the original code
            safe_buggy = correct_code.split('\n')
            for i, line in enumerate(safe_buggy):
                if '==' in line and 'def ' not in line and '#' not in line:
                    safe_buggy[i] = line.replace('==', '=', 1)
                    break
            return '\n'.join(safe_buggy)
    
    return buggy_code

def calculate_rating_change(winner_rating: int, loser_rating: int, used_hints: bool = False) -> int:
    """Calculate ELO-style rating change"""
    k_factor = 32
    expected_winner = 1 / (1 + 10 ** ((loser_rating - winner_rating) / 400))
    rating_change = int(k_factor * (1 - expected_winner))
    
    # Bonus for not using hints
    if not used_hints:
        rating_change += 10
    
    return max(10, rating_change)  # Minimum 10 points

def calculate_xp_bonus(time_elapsed: float, time_limit: int, used_hints: bool) -> int:
    """Calculate bonus XP based on performance"""
    base_xp = 100
    
    # Time bonus (faster = more XP)
    time_ratio = time_elapsed / time_limit
    if time_ratio < 0.25:
        time_bonus = 50
    elif time_ratio < 0.5:
        time_bonus = 30
    else:
        time_bonus = 10
    
    # No hints bonus
    no_hints_bonus = 50 if not used_hints else 0
    
    return base_xp + time_bonus + no_hints_bonus
