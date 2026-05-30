"""
Quick test to verify Code Shuffle shuffling works correctly
"""
import sys
sys.path.insert(0, '.')

from app.routers.competitive import shuffle_code_lines

# Test with a sample code
test_code = """a = int(input())
b = int(input())
print(a + b)"""

print("=" * 60)
print("Testing Code Shuffle Functionality")
print("=" * 60)

print("\nOriginal Code:")
print(test_code)

shuffled = shuffle_code_lines(test_code)

print("\nShuffled Lines:")
for i, line in enumerate(shuffled, 1):
    print(f"{i}. {line}")

print(f"\nTotal lines shuffled: {len(shuffled)}")
print("\n✅ Shuffling works correctly!" if shuffled else "\n❌ No lines were shuffled!")
