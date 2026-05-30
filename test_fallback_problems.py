#!/usr/bin/env python3
"""
Test all fallback problems to ensure they work correctly with their test cases
"""

def test_double_number():
    """Easy: Double the Number"""
    def solution(n):
        return n * 2
    
    test_cases = [("5", "10"), ("0", "0"), ("-3", "-6"), ("100", "200")]
    for inp, expected in test_cases:
        result = str(solution(int(inp)))
        assert result == expected, f"Double Number: {inp} -> {result} (expected {expected})"
    print("✅ Double the Number - All tests passed")

def test_sum_array():
    """Easy: Sum of Array"""
    def solution(arr):
        return sum(arr)
    
    test_cases = [
        (([1, 2, 3]), "6"),
        (([10, 20, 30, 40]), "100"),
        (([5]), "5"),
        (([-1, -2, 3, 4, 5]), "9")
    ]
    for arr, expected in test_cases:
        result = str(solution(arr))
        assert result == expected, f"Sum Array: {arr} -> {result} (expected {expected})"
    print("✅ Sum of Array - All tests passed")

def test_reverse_string():
    """Easy: Reverse String"""
    def solution(s):
        return s[::-1]
    
    test_cases = [("hello", "olleh"), ("world", "dlrow"), ("a", "a"), ("racecar", "racecar")]
    for inp, expected in test_cases:
        result = solution(inp)
        assert result == expected, f"Reverse String: {inp} -> {result} (expected {expected})"
    print("✅ Reverse String - All tests passed")

def test_is_palindrome():
    """Easy: Is Palindrome"""
    def solution(s):
        return s == s[::-1]
    
    test_cases = [("racecar", "true"), ("hello", "false"), ("a", "true"), ("aabbaa", "true")]
    for inp, expected in test_cases:
        result = str(solution(inp)).lower()
        assert result == expected, f"Is Palindrome: {inp} -> {result} (expected {expected})"
    print("✅ Is Palindrome - All tests passed")

def test_count_vowels():
    """Easy: Count Vowels"""
    def solution(s):
        vowels = 'aeiouAEIOU'
        return sum(1 for c in s if c in vowels)
    
    test_cases = [("hello", "2"), ("aeiou", "5"), ("xyz", "0"), ("AEIOUaeiou", "10")]
    for inp, expected in test_cases:
        result = str(solution(inp))
        assert result == expected, f"Count Vowels: {inp} -> {result} (expected {expected})"
    print("✅ Count Vowels - All tests passed")

def test_fibonacci():
    """Easy: Find Nth Fibonacci"""
    def solution(n):
        if n <= 1:
            return n
        a, b = 0, 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        return b
    
    test_cases = [(6, "8"), (0, "0"), (1, "1"), (10, "55")]
    for inp, expected in test_cases:
        result = str(solution(inp))
        assert result == expected, f"Fibonacci: {inp} -> {result} (expected {expected})"
    print("✅ Find Nth Fibonacci - All tests passed")

def test_two_sum():
    """Medium: Two Sum"""
    def solution(arr, target):
        seen = {}
        for i, num in enumerate(arr):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return [-1, -1]
    
    test_cases = [
        (([2, 7, 11, 15], 9), "0 1"),
        (([3, 2, 4, 1, 5], 6), "1 2"),
        (([1, 2, 3], 5), "1 2")
    ]
    for (arr, target), expected in test_cases:
        result = solution(arr, target)
        result_str = f"{result[0]} {result[1]}"
        assert result_str == expected, f"Two Sum: {arr}, {target} -> {result_str} (expected {expected})"
    print("✅ Two Sum - All tests passed")

def test_search_rotated():
    """Medium: Search in Rotated Array"""
    def solution(arr, target):
        left, right = 0, len(arr) - 1
        while left <= right:
            mid = (left + right) // 2
            if arr[mid] == target:
                return mid
            if arr[left] <= arr[mid]:
                if arr[left] <= target < arr[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if arr[mid] < target <= arr[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        return -1
    
    test_cases = [
        (([4, 5, 6, 7, 0, 1, 2], 0), "4"),
        (([4, 5, 6, 7, 0, 1, 2], 3), "-1"),
        (([1], 1), "0")
    ]
    for (arr, target), expected in test_cases:
        result = str(solution(arr, target))
        assert result == expected, f"Search Rotated: {arr}, {target} -> {result} (expected {expected})"
    print("✅ Search in Rotated Array - All tests passed")

def test_lis():
    """Hard: Longest Increasing Subsequence"""
    def solution(arr):
        if not arr:
            return 0
        
        n = len(arr)
        dp = [1] * n
        
        for i in range(1, n):
            for j in range(i):
                if arr[j] < arr[i]:
                    dp[i] = max(dp[i], dp[j] + 1)
        
        return max(dp)
    
    test_cases = [
        (([10, 9, 2, 5, 3, 7, 101, 18]), "4"),
        (([0, 1, 0, 4, 4, 3, 4, 2, 0, 1]), "4"),
        (([5, 4, 3, 2, 1]), "1"),
        (([1, 2, 3, 4, 5]), "5")
    ]
    for arr, expected in test_cases:
        result = str(solution(arr))
        assert result == expected, f"LIS: {arr} -> {result} (expected {expected})"
    print("✅ Longest Increasing Subsequence - All tests passed")

def test_coin_change():
    """Hard: Coin Change"""
    def solution(coins, amount):
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0
        
        for i in range(1, amount + 1):
            for coin in coins:
                if coin <= i:
                    dp[i] = min(dp[i], dp[i - coin] + 1)
        
        return dp[amount] if dp[amount] != float('inf') else -1
    
    test_cases = [
        (([1, 2, 5], 5), "1"),
        (([2], 3), "-1"),
        (([10], 10), "1"),
        (([1, 2, 5], 7), "2")
    ]
    for (coins, amount), expected in test_cases:
        result = str(solution(coins, amount))
        assert result == expected, f"Coin Change: {coins}, {amount} -> {result} (expected {expected})"
    print("✅ Coin Change - All tests passed")

def test_edit_distance():
    """Hard: Edit Distance"""
    def solution(s1, s2):
        m, n = len(s1), len(s2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i-1] == s2[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
        
        return dp[m][n]
    
    test_cases = [
        (("horse", "ros"), "3"),
        (("abc", "ab"), "1"),
        (("kitten", "sitting"), "3"),
        (("a", ""), "1")
    ]
    for (s1, s2), expected in test_cases:
        result = str(solution(s1, s2))
        assert result == expected, f"Edit Distance: {s1}, {s2} -> {result} (expected {expected})"
    print("✅ Edit Distance - All tests passed")

def test_number_of_islands():
    """Hard: Number of Islands"""
    def solution(grid):
        if not grid:
            return 0
        
        rows, cols = len(grid), len(grid[0])
        visited = [[False] * cols for _ in range(rows)]
        
        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or visited[r][c] or grid[r][c] == '0':
                return
            visited[r][c] = True
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)
        
        islands = 0
        for i in range(rows):
            for j in range(cols):
                if grid[i][j] == '1' and not visited[i][j]:
                    dfs(i, j)
                    islands += 1
        return islands
    
    test_cases = [
        ((["110", "110", "001"]), "2"),
        ((["11", "11"]), "1"),
        ((["01", "10"]), "2")
    ]
    for grid, expected in test_cases:
        result = str(solution(grid))
        assert result == expected, f"Number of Islands: {grid} -> {result} (expected {expected})"
    print("✅ Number of Islands - All tests passed")

def test_word_ladder():
    """Hard: Word Ladder"""
    from collections import deque
    
    def solution(beginWord, endWord, wordList):
        word_set = set(wordList)
        if endWord not in word_set:
            return 0
        
        queue = deque([(beginWord, 1)])
        visited = {beginWord}
        
        while queue:
            word, length = queue.popleft()
            
            if word == endWord:
                return length
            
            for i in range(len(word)):
                for c in 'abcdefghijklmnopqrstuvwxyz':
                    new_word = word[:i] + c + word[i+1:]
                    if new_word in word_set and new_word not in visited:
                        visited.add(new_word)
                        queue.append((new_word, length + 1))
        
        return 0
    
    test_cases = [
        (("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]), "5"),
        (("hit", "cog", ["hot", "dot", "dog", "lot", "log"]), "0"),
        (("a", "c", ["a", "b", "c"]), "2"),
        (("cold", "warm", ["cold", "cord", "card", "ward", "warm"]), "5")
    ]
    for (begin, end, words), expected in test_cases:
        result = str(solution(begin, end, words))
        assert result == expected, f"Word Ladder: {begin} -> {end} -> {result} (expected {expected})"
    print("✅ Word Ladder - All tests passed")

def main():
    print("Testing all fallback problems...\n")
    
    # Easy problems
    print("[EASY DIFFICULTY]")
    test_double_number()
    test_sum_array()
    test_reverse_string()
    test_is_palindrome()
    test_count_vowels()
    test_fibonacci()
    
    # Medium problems
    print("\n[MEDIUM DIFFICULTY]")
    test_two_sum()
    test_search_rotated()
    
    # Hard problems
    print("\n[HARD DIFFICULTY]")
    test_lis()
    test_coin_change()
    test_edit_distance()
    test_number_of_islands()
    test_word_ladder()
    
    print("\n" + "="*50)
    print("🎉 ALL TESTS PASSED! All problems work correctly!")
    print("="*50)

if __name__ == "__main__":
    main()
