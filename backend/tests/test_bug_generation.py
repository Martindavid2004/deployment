"""
Test script for Bug Hunt Mode bug generation
This script tests the generate_buggy_code function to ensure bugs are introduced correctly.

Usage:
    python test_bug_generation.py
"""

import random

# Standalone version of generate_buggy_code function
def generate_buggy_code(correct_code: str, language: str = "python") -> str:
    """Generate buggy code by introducing common programming errors"""
    if not correct_code:
        return ""
    
    lines = correct_code.split('\n')
    buggy_lines = lines.copy()
    bugs_introduced = 0
    max_bugs = min(3, max(1, len([l for l in lines if l.strip()]) // 4))  # 1-3 bugs based on code lines
    
    # Common bug patterns for different languages
    bug_types = []
    
    if language == "python":
        bug_types = [
            # Off-by-one error in range
            lambda line: line.replace('range(len(', 'range(len(') if 'range(len(' in line else (
                line.replace('range(', 'range(1, ') if 'range(' in line and 'range(1,' not in line and 'range(0' not in line else line
            ),
            # Missing colon after control structures
            lambda line: line.rstrip(':') if line.strip().endswith(':') and any(kw in line for kw in ['if ', 'for ', 'while ', 'def ', 'class ', 'elif ', 'else:', 'try:', 'except']) else line,
            # Wrong comparison operator (== vs =)
            lambda line: line.replace('==', '=', 1) if '==' in line and 'def ' not in line and '#' not in line else line,
            # Wrong indentation
            lambda line: line[1:] if line.startswith('    ') and not line.strip().startswith('#') else line,
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
    
    # Randomly select and apply bugs
    available_indices = list(range(len(buggy_lines)))
    random.shuffle(available_indices)
    
    for idx in available_indices:
        if bugs_introduced >= max_bugs:
            break
        
        line = buggy_lines[idx]
        # Skip empty lines, comments, and function definitions
        if not line.strip() or line.strip().startswith('#') or line.strip().startswith('//'):
            continue
        
        # Try to apply a random bug
        bug_func = random.choice(bug_types)
        modified_line = bug_func(line)
        
        # Only apply if the line actually changed
        if modified_line != line:
            buggy_lines[idx] = modified_line
            bugs_introduced += 1
    
    return '\n'.join(buggy_lines)

# Sample codes to test
SAMPLE_CODES = {
    "python_factorial": """n = int(input())
result = 1
for i in range(1, n + 1):
    result *= i
print(result)""",
    
    "python_sum": """a = int(input())
b = int(input())
print(a + b)""",
    
    "python_even_odd": """n = int(input())
if n % 2 == 0:
    print('Even')
else:
    print('Odd')""",
    
    "javascript_sum": """function sum(a, b) {
    return a + b;
}

const x = parseInt(input());
const y = parseInt(input());
console.log(sum(x, y));"""
}

def test_bug_generation():
    """Test the bug generation function"""
    
    print("=" * 70)
    print("BUG HUNT MODE - BUG GENERATION TEST")
    print("=" * 70)
    print()
    
    for name, code in SAMPLE_CODES.items():
        language = "javascript" if "javascript" in name else "python"
        
        print(f"\n{'='*70}")
        print(f"Test: {name} ({language})")
        print(f"{'='*70}")
        print("\n📝 ORIGINAL CODE:")
        print("-" * 70)
        print(code)
        
        # Generate buggy version
        buggy = generate_buggy_code(code, language)
        
        print("\n🐛 BUGGY CODE:")
        print("-" * 70)
        print(buggy)
        
        # Compare and highlight differences
        original_lines = code.split('\n')
        buggy_lines = buggy.split('\n')
        
        print("\n🔍 CHANGES DETECTED:")
        print("-" * 70)
        changes_found = False
        for i, (orig, bug) in enumerate(zip(original_lines, buggy_lines), 1):
            if orig != bug:
                changes_found = True
                print(f"Line {i}:")
                print(f"  - Original: {repr(orig)}")
                print(f"  + Buggy:    {repr(bug)}")
        
        if not changes_found:
            print("⚠️ WARNING: No bugs were introduced!")
        
        print()

if __name__ == "__main__":
    try:
        test_bug_generation()
        print("\n✅ Test completed successfully!")
        print("\n💡 Tips:")
        print("   - Bugs are randomly generated each run")
        print("   - Run this script multiple times to see different bugs")
        print("   - Check that bugs are realistic and not too obvious")
        print("   - Verify that bugs would actually cause failures")
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
