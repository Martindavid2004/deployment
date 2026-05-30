export const LANGUAGES = ["python", "cpp", "java"];

export const initialProblems = [
  {
    id: 1,
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    topics: ["basics", "I/O"],
    videoUrl: "https://example.com/sum-two-numbers",
    referenceCode: {
      python: `def sum_two_numbers(a, b):
    return a + b

if __name__ == "__main__":
    x = int(input())
    y = int(input())
    print(sum_two_numbers(x, y))`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int sum_two_numbers(int a, int b) {
    return a + b;
}

int main() {
    int x, y;
    cin >> x >> y;
    cout << sum_two_numbers(x, y) << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int sumTwoNumbers(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        int y = sc.nextInt();
        System.out.println(sumTwoNumbers(x, y));
    }
}`
    },
    buggyCode: {
      python: `def sum_two_numbers(a, b):
    return a - b  # Bug: Should be + not -

if __name__ == "__main__":
    x = int(input())
    y = int(input())
    print(sum_two_numbers(x, y))`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int sum_two_numbers(int a, int b) {
    return a - b;  // Bug: Should be + not -
}

int main() {
    int x, y;
    cin >> x >> y;
    cout << sum_two_numbers(x, y) << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int sumTwoNumbers(int a, int b) {
        return a - b;  // Bug: Should be + not -
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        int y = sc.nextInt();
        System.out.println(sumTwoNumbers(x, y));
    }
}`
    },
    explanations: {
      python: [
        "Define a function that returns the sum of two numbers.",
        "Read two integers from input.",
        "Call the function and print the result."
      ],
      cpp: [
        "Define a function that takes two ints and returns their sum.",
        "In main, read two integers from standard input.",
        "Call the function and print the result."
      ],
      java: [
        "Create a Main class with a static method to sum two integers.",
        "Use Scanner to read two integers from input.",
        "Call the method and print the result."
      ]
    },
    sampleTests: [
      { id: 1, input: "2 3", expected: "5" },
      { id: 2, input: "10 -4", expected: "6" }
    ]
  },
  {
    id: 2,
    title: "Maximum of Three Numbers",
    difficulty: "Easy",
    topics: ["conditionals"],
    videoUrl: "https://example.com/max-three",
    referenceCode: {
      python: `def max_of_three(a, b, c):
    return max(a, b, c)

if __name__ == "__main__":
    a = int(input())
    b = int(input())
    c = int(input())
    print(max_of_three(a, b, c))`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int max_of_three(int a, int b, int c) {
    int m = a;
    if (b > m) m = b;
    if (c > m) m = c;
    return m;
}

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    cout << max_of_three(a, b, c) << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int maxOfThree(int a, int b, int c) {
        int m = a;
        if (b > m) m = b;
        if (c > m) m = c;
        return m;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();
        System.out.println(maxOfThree(a, b, c));
    }
}`
    },
    buggyCode: {
      python: `def max_of_three(a, b, c):
    return min(a, b, c)  # Bug: Should be max() not min()

if __name__ == "__main__":
    a = int(input())
    b = int(input())
    c = int(input())
    print(max_of_three(a, b, c))`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int max_of_three(int a, int b, int c) {
    int m = a;
    if (b < m) m = b;  // Bug: Should be > not <
    if (c < m) m = c;  // Bug: Should be > not <
    return m;
}

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    cout << max_of_three(a, b, c) << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int maxOfThree(int a, int b, int c) {
        int m = a;
        if (b < m) m = b;  // Bug: Should be > not <
        if (c < m) m = c;  // Bug: Should be > not <
        return m;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();
        System.out.println(maxOfThree(a, b, c));
    }
}`
    },
    explanations: {
      python: [
        "Use Python's built-in max() to get the largest of three numbers.",
        "Read three integers from input and print the maximum."
      ],
      cpp: [
        "Track the maximum value using if conditions.",
        "Compare each of the three numbers to find the largest."
      ],
      java: [
        "Use conditional checks to update the current maximum.",
        "Read three integers using Scanner and print the largest."
      ]
    },
    sampleTests: [
      { id: 1, input: "1 2 3", expected: "3" },
      { id: 2, input: "10 5 7", expected: "10" }
    ]
  },
  {
    id: 3,
    title: "Check Odd or Even",
    difficulty: "Easy",
    topics: ["basics", "conditionals"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
if n % 2 == 0:
    print("Even")
else:
    print("Odd")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n % 2 == 0)
        cout << "Even" << endl;
    else
        cout << "Odd" << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n % 2 == 0)
            System.out.println("Even");
        else
            System.out.println("Odd");
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
if n % 2 == 1:  # Bug: This misses negative odd numbers
    print("Even")
else:
    print("Odd")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n % 2 == 1)  // Bug
        cout << "Even" << endl;
    else
        cout << "Odd" << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n % 2 == 1)  // Bug
            System.out.println("Even");
        else
            System.out.println("Odd");
    }
}`
    },
    explanations: {
      python: ["Check if number modulo 2 equals 0 for even, otherwise odd"],
      cpp: ["Use modulo operator to check remainder when divided by 2"],
      java: ["Apply modulo 2 and check if result is 0"]
    },
    sampleTests: [
      { id: 1, input: "4", expected: "Even" },
      { id: 2, input: "7", expected: "Odd" }
    ]
  },
  {
    id: 4,
    title: "Positive, Negative, or Zero",
    difficulty: "Easy",
    topics: ["conditionals"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
if n > 0:
    print("Positive")
elif n < 0:
    print("Negative")
else:
    print("Zero")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n > 0)
        cout << "Positive" << endl;
    else if (n < 0)
        cout << "Negative" << endl;
    else
        cout << "Zero" << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n > 0)
            System.out.println("Positive");
        else if (n < 0)
            System.out.println("Negative");
        else
            System.out.println("Zero");
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
if n >= 0:  # Bug: Zero counted as positive
    print("Positive")
elif n < 0:
    print("Negative")
else:
    print("Zero")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n >= 0)  // Bug
        cout << "Positive" << endl;
    else if (n < 0)
        cout << "Negative" << endl;
    else
        cout << "Zero" << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n >= 0)  // Bug
            System.out.println("Positive");
        else if (n < 0)
            System.out.println("Negative");
        else
            System.out.println("Zero");
    }
}`
    },
    explanations: {
      python: ["Use if-elif-else to check three conditions"],
      cpp: ["Chain if-else if-else statements"],
      java: ["Check sign with comparison operators"]
    },
    sampleTests: [
      { id: 1, input: "5", expected: "Positive" },
      { id: 2, input: "-3", expected: "Negative" },
      { id: 3, input: "0", expected: "Zero" }
    ]
  },
  {
    id: 5,
    title: "Sum of Digits",
    difficulty: "Easy",
    topics: ["loops", "math"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
sum_digits = 0
while n > 0:
    sum_digits += n % 10
    n //= 10
print(sum_digits)`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    cout << sum << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int sum = 0;
        while (n > 0) {
            sum += n % 10;
            n /= 10;
        }
        System.out.println(sum);
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
sum_digits = 0
while n >= 0:  # Bug: Infinite loop
    sum_digits += n % 10
    n //= 10
print(sum_digits)`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    while (n >= 0) {  // Bug
        sum += n % 10;
        n /= 10;
    }
    cout << sum << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int sum = 0;
        while (n >= 0) {  // Bug
            sum += n % 10;
            n /= 10;
        }
        System.out.println(sum);
    }
}`
    },
    explanations: {
      python: ["Extract last digit using modulo 10", "Remove last digit using integer division by 10"],
      cpp: ["Use while loop until n becomes 0"],
      java: ["Accumulate sum of each digit extracted"]
    },
    sampleTests: [
      { id: 1, input: "123", expected: "6" },
      { id: 2, input: "456", expected: "15" }
    ]
  },
  {
    id: 6,
    title: "Reverse a Number",
    difficulty: "Easy",
    topics: ["loops", "math"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
rev = 0
while n > 0:
    rev = rev * 10 + n % 10
    n //= 10
print(rev)`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int rev = 0;
    while (n > 0) {
        rev = rev * 10 + n % 10;
        n /= 10;
    }
    cout << rev << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int rev = 0;
        while (n > 0) {
            rev = rev * 10 + n % 10;
            n /= 10;
        }
        System.out.println(rev);
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
rev = 0
while n > 0:
    rev = rev + n % 10  # Bug: Missing multiplication by 10
    n //= 10
print(rev)`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int rev = 0;
    while (n > 0) {
        rev = rev + n % 10;  // Bug
        n /= 10;
    }
    cout << rev << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int rev = 0;
        while (n > 0) {
            rev = rev + n % 10;  // Bug
            n /= 10;
        }
        System.out.println(rev);
    }
}`
    },
    explanations: {
      python: ["Multiply reversed number by 10 before adding next digit", "Extract digits from right to left"],
      cpp: ["Build reversed number by shifting left and adding digits"],
      java: ["Use modulo to get last digit and division to remove it"]
    },
    sampleTests: [
      { id: 1, input: "123", expected: "321" },
      { id: 2, input: "4560", expected: "654" }
    ]
  },
  {
    id: 7,
    title: "Check Palindrome Number",
    difficulty: "Easy",
    topics: ["loops", "strings"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
original = n
rev = 0
while n > 0:
    rev = rev * 10 + n % 10
    n //= 10
if original == rev:
    print("Palindrome")
else:
    print("Not a Palindrome")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int original = n, rev = 0;
    while (n > 0) {
        rev = rev * 10 + n % 10;
        n /= 10;
    }
    if (original == rev)
        cout << "Palindrome" << endl;
    else
        cout << "Not a Palindrome" << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n, rev = 0;
        while (n > 0) {
            rev = rev * 10 + n % 10;
            n /= 10;
        }
        if (original == rev)
            System.out.println("Palindrome");
        else
            System.out.println("Not a Palindrome");
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
rev = 0
while n > 0:
    rev = rev * 10 + n % 10
    n //= 10
if n == rev:  # Bug: n is now 0
    print("Palindrome")
else:
    print("Not a Palindrome")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int rev = 0;
    while (n > 0) {
        rev = rev * 10 + n % 10;
        n /= 10;
    }
    if (n == rev)  // Bug
        cout << "Palindrome" << endl;
    else
        cout << "Not a Palindrome" << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int rev = 0;
        while (n > 0) {
            rev = rev * 10 + n % 10;
            n /= 10;
        }
        if (n == rev)  // Bug
            System.out.println("Palindrome");
        else
            System.out.println("Not a Palindrome");
    }
}`
    },
    explanations: {
      python: ["Store original number before reversing", "Reverse the number", "Compare original with reversed"],
      cpp: ["Use variable to preserve original value"],
      java: ["Check if original equals its reverse"]
    },
    sampleTests: [
      { id: 1, input: "121", expected: "Palindrome" },
      { id: 2, input: "123", expected: "Not a Palindrome" }
    ]
  },
  {
    id: 8,
    title: "Factorial of a Number",
    difficulty: "Easy",
    topics: ["loops", "math"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
fact = 1
for i in range(1, n + 1):
    fact *= i
print(fact)`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int fact = 1;
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    cout << fact << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int fact = 1;
        for (int i = 1; i <= n; i++) {
            fact *= i;
        }
        System.out.println(fact);
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
fact = 0  # Bug: Should initialize to 1
for i in range(1, n + 1):
    fact *= i
print(fact)`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int fact = 0;  // Bug
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    cout << fact << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int fact = 0;  // Bug
        for (int i = 1; i <= n; i++) {
            fact *= i;
        }
        System.out.println(fact);
    }
}`
    },
    explanations: {
      python: ["Initialize factorial to 1", "Multiply by each number from 1 to n"],
      cpp: ["Use for loop from 1 to n inclusive"],
      java: ["Accumulate product in fact variable"]
    },
    sampleTests: [
      { id: 1, input: "5", expected: "120" },
      { id: 2, input: "3", expected: "6" }
    ]
  },
  {
    id: 9,
    title: "Print Even Numbers in Range",
    difficulty: "Easy",
    topics: ["loops", "conditionals"],
    videoUrl: "",
    referenceCode: {
      python: `start = int(input())
end = int(input())
for i in range(start, end + 1):
    if i % 2 == 0:
        print(i, end=" ")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int start, end;
    cin >> start >> end;
    for (int i = start; i <= end; i++) {
        if (i % 2 == 0)
            cout << i << " ";
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int start = sc.nextInt();
        int end = sc.nextInt();
        for (int i = start; i <= end; i++) {
            if (i % 2 == 0)
                System.out.print(i + " ");
        }
    }
}`
    },
    buggyCode: {
      python: `start = int(input())
end = int(input())
for i in range(start, end):  # Bug: Missing +1
    if i % 2 == 0:
        print(i, end=" ")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int start, end;
    cin >> start >> end;
    for (int i = start; i < end; i++) {  // Bug
        if (i % 2 == 0)
            cout << i << " ";
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int start = sc.nextInt();
        int end = sc.nextInt();
        for (int i = start; i < end; i++) {  // Bug
            if (i % 2 == 0)
                System.out.print(i + " ");
        }
    }
}`
    },
    explanations: {
      python: ["Loop from start to end inclusive", "Check if each number is divisible by 2"],
      cpp: ["Use for loop with conditional check for even"],
      java: ["Print numbers with modulo 2 equal to 0"]
    },
    sampleTests: [
      { id: 1, input: "1\n10", expected: "2 4 6 8 10 " },
      { id: 2, input: "5\n15", expected: "6 8 10 12 14 " }
    ]
  },
  {
    id: 10,
    title: "Count Vowels in String",
    difficulty: "Easy",
    topics: ["strings", "loops"],
    videoUrl: "",
    referenceCode: {
      python: `s = input()
vowels = "aeiouAEIOU"
count = 0
for char in s:
    if char in vowels:
        count += 1
print(count)`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    string vowels = "aeiouAEIOU";
    int count = 0;
    for (char c : s) {
        if (vowels.find(c) != string::npos)
            count++;
    }
    cout << count << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        String vowels = "aeiouAEIOU";
        int count = 0;
        for (char c : s.toCharArray()) {
            if (vowels.indexOf(c) != -1)
                count++;
        }
        System.out.println(count);
    }
}`
    },
    buggyCode: {
      python: `s = input()
vowels = "aeiou"  # Bug: Missing uppercase
count = 0
for char in s:
    if char in vowels:
        count += 1
print(count)`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    string vowels = "aeiou";  // Bug
    int count = 0;
    for (char c : s) {
        if (vowels.find(c) != string::npos)
            count++;
    }
    cout << count << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        String vowels = "aeiou";  // Bug
        int count = 0;
        for (char c : s.toCharArray()) {
            if (vowels.indexOf(c) != -1)
                count++;
        }
        System.out.println(count);
    }
}`
    },
    explanations: {
      python: ["Define vowels string with both cases", "Iterate through each character", "Check membership in vowels"],
      cpp: ["Use string find() method to check for vowel"],
      java: ["Use indexOf() to check if character is vowel"]
    },
    sampleTests: [
      { id: 1, input: "Hello World", expected: "3" },
      { id: 2, input: "Programming", expected: "3" }
    ]
  },
  {
    id: 11,
    title: "Swap Two Numbers Without Temp Variable",
    difficulty: "Easy",
    topics: ["math", "basics"],
    videoUrl: "",
    referenceCode: {
      python: `a = int(input())
b = int(input())
a = a + b
b = a - b
a = a - b
print(f"After swap: a = {a}, b = {b}")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    a = a + b;
    b = a - b;
    a = a - b;
    cout << "After swap: a = " << a << ", b = " << b << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        a = a + b;
        b = a - b;
        a = a - b;
        System.out.println("After swap: a = " + a + ", b = " + b);
    }
}`
    },
    buggyCode: {
      python: `a = int(input())
b = int(input())
a = a + b
a = a - b  # Bug: Wrong order
b = a - b
print(f"After swap: a = {a}, b = {b}")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    a = a + b;
    a = a - b;  // Bug
    b = a - b;
    cout << "After swap: a = " << a << ", b = " << b << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        a = a + b;
        a = a - b;  // Bug
        b = a - b;
        System.out.println("After swap: a = " + a + ", b = " + b);
    }
}`
    },
    explanations: {
      python: ["Add both numbers and store in first", "Subtract new second from sum", "Complete swap using arithmetic"],
      cpp: ["Use addition and subtraction to swap"],
      java: ["No temporary variable needed with this method"]
    },
    sampleTests: [
      { id: 1, input: "5\n10", expected: "After swap: a = 10, b = 5" },
      { id: 2, input: "3\n7", expected: "After swap: a = 7, b = 3" }
    ]
  },
  {
    id: 12,
    title: "Check Prime Number",
    difficulty: "Medium",
    topics: ["loops", "math"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
if n < 2:
    print("Not Prime")
else:
    is_prime = True
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            is_prime = False
            break
    if is_prime:
        print("Prime")
    else:
        print("Not Prime")`,
      cpp: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n < 2) {
        cout << "Not Prime" << endl;
    } else {
        bool is_prime = true;
        for (int i = 2; i <= sqrt(n); i++) {
            if (n % i == 0) {
                is_prime = false;
                break;
            }
        }
        cout << (is_prime ? "Prime" : "Not Prime") << endl;
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n < 2) {
            System.out.println("Not Prime");
        } else {
            boolean isPrime = true;
            for (int i = 2; i <= Math.sqrt(n); i++) {
                if (n % i == 0) {
                    isPrime = false;
                    break;
                }
            }
            System.out.println(isPrime ? "Prime" : "Not Prime");
        }
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
if n < 2:
    print("Not Prime")
else:
    is_prime = True
    for i in range(2, n):  # Bug: Inefficient, should use sqrt
        if n % i == 0:
            is_prime = False
            break
    if is_prime:
        print("Prime")
    else:
        print("Not Prime")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n < 2) {
        cout << "Not Prime" << endl;
    } else {
        bool is_prime = true;
        for (int i = 2; i < n; i++) {  // Bug
            if (n % i == 0) {
                is_prime = false;
                break;
            }
        }
        cout << (is_prime ? "Prime" : "Not Prime") << endl;
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n < 2) {
            System.out.println("Not Prime");
        } else {
            boolean isPrime = true;
            for (int i = 2; i < n; i++) {  // Bug
                if (n % i == 0) {
                    isPrime = false;
                    break;
                }
            }
            System.out.println(isPrime ? "Prime" : "Not Prime");
        }
    }
}`
    },
    explanations: {
      python: ["Check if number is less than 2", "Loop up to square root of n for efficiency", "Check divisibility"],
      cpp: ["Use sqrt() for optimal checking"],
      java: ["Break early when divisor found"]
    },
    sampleTests: [
      { id: 1, input: "7", expected: "Prime" },
      { id: 2, input: "10", expected: "Not Prime" }
    ]
  },
  {
    id: 13,
    title: "Fibonacci Sequence",
    difficulty: "Medium",
    topics: ["loops", "sequences"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
a, b = 0, 1
for _ in range(n):
    print(a, end=" ")
    a, b = b, a + b`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        cout << a << " ";
        int temp = a;
        a = b;
        b = temp + b;
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int a = 0, b = 1;
        for (int i = 0; i < n; i++) {
            System.out.print(a + " ");
            int temp = a;
            a = b;
            b = temp + b;
        }
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
a, b = 0, 1
for _ in range(n):
    print(a, end=" ")
    a, b = b, b + a  # Bug: Wrong order
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        cout << a << " ";
        a = b;
        b = a + b;  // Bug: a already changed
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int a = 0, b = 1;
        for (int i = 0; i < n; i++) {
            System.out.print(a + " ");
            a = b;
            b = a + b;  // Bug
        }
    }
}`
    },
    explanations: {
      python: ["Initialize first two Fibonacci numbers", "Use simultaneous assignment to update both variables"],
      cpp: ["Use temporary variable to preserve old value"],
      java: ["Each term is sum of previous two"]
    },
    sampleTests: [
      { id: 1, input: "5", expected: "0 1 1 2 3 " },
      { id: 2, input: "8", expected: "0 1 1 2 3 5 8 13 " }
    ]
  },
  {
    id: 14,
    title: "GCD and LCM of Two Numbers",
    difficulty: "Medium",
    topics: ["math", "algorithms"],
    videoUrl: "",
    referenceCode: {
      python: `a = int(input())
b = int(input())
def gcd(x, y):
    while y:
        x, y = y, x % y
    return x
g = gcd(a, b)
lcm = (a * b) // g
print(f"GCD: {g}, LCM: {lcm}")`,
      cpp: `#include <iostream>
using namespace std;

int gcd(int a, int b) {
    while (b) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

int main() {
    int a, b;
    cin >> a >> b;
    int g = gcd(a, b);
    int lcm = (a * b) / g;
    cout << "GCD: " << g << ", LCM: " << lcm << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    static int gcd(int a, int b) {
        while (b != 0) {
            int temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int g = gcd(a, b);
        int lcm = (a * b) / g;
        System.out.println("GCD: " + g + ", LCM: " + lcm);
    }
}`
    },
    buggyCode: {
      python: `a = int(input())
b = int(input())
def gcd(x, y):
    while y:
        x, y = y, y % x  # Bug: Wrong order
    return x
g = gcd(a, b)
lcm = (a * b) // g
print(f"GCD: {g}, LCM: {lcm}")`,
      cpp: `#include <iostream>
using namespace std;

int gcd(int a, int b) {
    while (b) {
        int temp = b;
        b = b % a;  // Bug
        a = temp;
    }
    return a;
}

int main() {
    int a, b;
    cin >> a >> b;
    int g = gcd(a, b);
    int lcm = (a * b) / g;
    cout << "GCD: " << g << ", LCM: " << lcm << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    static int gcd(int a, int b) {
        while (b != 0) {
            int temp = b;
            b = b % a;  // Bug
            a = temp;
        }
        return a;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int g = gcd(a, b);
        int lcm = (a * b) / g;
        System.out.println("GCD: " + g + ", LCM: " + lcm);
    }
}`
    },
    explanations: {
      python: ["Use Euclidean algorithm for GCD", "LCM formula: (a*b)/GCD"],
      cpp: ["Iterate until remainder is 0"],
      java: ["Compute LCM using GCD relationship"]
    },
    sampleTests: [
      { id: 1, input: "12\n15", expected: "GCD: 3, LCM: 60" },
      { id: 2, input: "7\n5", expected: "GCD: 1, LCM: 35" }
    ]
  },
  {
    id: 15,
    title: "Check if Two Strings are Anagrams",
    difficulty: "Medium",
    topics: ["strings", "sorting"],
    videoUrl: "",
    referenceCode: {
      python: `s1 = input()
s2 = input()
if sorted(s1) == sorted(s2):
    print("Anagrams")
else:
    print("Not Anagrams")`,
      cpp: `#include <iostream>
#include <algorithm>
#include <string>
using namespace std;

int main() {
    string s1, s2;
    cin >> s1 >> s2;
    sort(s1.begin(), s1.end());
    sort(s2.begin(), s2.end());
    if (s1 == s2)
        cout << "Anagrams" << endl;
    else
        cout << "Not Anagrams" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s1 = sc.next();
        String s2 = sc.next();
        char[] arr1 = s1.toCharArray();
        char[] arr2 = s2.toCharArray();
        Arrays.sort(arr1);
        Arrays.sort(arr2);
        if (Arrays.equals(arr1, arr2))
            System.out.println("Anagrams");
        else
            System.out.println("Not Anagrams");
    }
}`
    },
    buggyCode: {
      python: `s1 = input()
s2 = input()
if s1 == s2:  # Bug: Should sort first
    print("Anagrams")
else:
    print("Not Anagrams")`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s1, s2;
    cin >> s1 >> s2;
    if (s1 == s2)  // Bug
        cout << "Anagrams" << endl;
    else
        cout << "Not Anagrams" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s1 = sc.next();
        String s2 = sc.next();
        if (s1.equals(s2))  // Bug
            System.out.println("Anagrams");
        else
            System.out.println("Not Anagrams");
    }
}`
    },
    explanations: {
      python: ["Sort both strings", "Compare sorted versions"],
      cpp: ["Use sort() from algorithm library"],
      java: ["Convert to char arrays and sort"]
    },
    sampleTests: [
      { id: 1, input: "listen\nsilent", expected: "Anagrams" },
      { id: 2, input: "hello\nworld", expected: "Not Anagrams" }
    ]
  },
  {
    id: 16,
    title: "Find Second Largest Element",
    difficulty: "Medium",
    topics: ["arrays", "sorting"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
arr = list(set(arr))  # Remove duplicates
arr.sort()
if len(arr) < 2:
    print("No second largest")
else:
    print(arr[-2])`,
      cpp: `#include <iostream>
#include <set>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    set<int> s;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        s.insert(x);
    }
    if (s.size() < 2) {
        cout << "No second largest" << endl;
    } else {
        vector<int> v(s.begin(), s.end());
        cout << v[v.size()-2] << endl;
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        TreeSet<Integer> set = new TreeSet<>();
        for (int i = 0; i < n; i++) {
            set.add(sc.nextInt());
        }
        if (set.size() < 2) {
            System.out.println("No second largest");
        } else {
            List<Integer> list = new ArrayList<>(set);
            System.out.println(list.get(list.size()-2));
        }
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
arr.sort()
if len(arr) < 2:
    print("No second largest")
else:
    print(arr[-2])  # Bug: Doesn't handle duplicates`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }
    sort(v.begin(), v.end());
    if (v.size() < 2) {
        cout << "No second largest" << endl;
    } else {
        cout << v[v.size()-2] << endl;  // Bug
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            list.add(sc.nextInt());
        }
        Collections.sort(list);
        if (list.size() < 2) {
            System.out.println("No second largest");
        } else {
            System.out.println(list.get(list.size()-2));  // Bug
        }
    }
}`
    },
    explanations: {
      python: ["Remove duplicates using set", "Sort the array", "Return second last element"],
      cpp: ["Use set to automatically remove duplicates"],
      java: ["TreeSet maintains sorted unique elements"]
    },
    sampleTests: [
      { id: 1, input: "5\n3 5 1 4 2", expected: "4" },
      { id: 2, input: "4\n5 5 5 5", expected: "No second largest" }
    ]
  },
  {
    id: 17,
    title: "Remove Duplicates from Array",
    difficulty: "Medium",
    topics: ["arrays", "data structures"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
result = list(dict.fromkeys(arr))
print(" ".join(map(str, result)))`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    vector<int> result;
    unordered_set<int> seen;
    for (int x : arr) {
        if (seen.find(x) == seen.end()) {
            result.push_back(x);
            seen.insert(x);
        }
    }
    for (int i = 0; i < result.size(); i++) {
        cout << result[i] << (i < result.size()-1 ? " " : "");
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        List<Integer> arr = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            arr.add(sc.nextInt());
        }
        List<Integer> result = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();
        for (int x : arr) {
            if (!seen.contains(x)) {
                result.add(x);
                seen.add(x);
            }
        }
        for (int i = 0; i < result.size(); i++) {
            System.out.print(result.get(i) + (i < result.size()-1 ? " " : ""));
        }
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
result = list(set(arr))  # Bug: Loses order
print(" ".join(map(str, result)))`,
      cpp: `#include <iostream>
#include <vector>
#include <set>
using namespace std;

int main() {
    int n;
    cin >> n;
    set<int> s;  // Bug: Loses order
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        s.insert(x);
    }
    for (int x : s) {
        cout << x << " ";
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Set<Integer> set = new HashSet<>();  // Bug: Loses order
        for (int i = 0; i < n; i++) {
            set.add(sc.nextInt());
        }
        for (int x : set) {
            System.out.print(x + " ");
        }
    }
}`
    },
    explanations: {
      python: ["Use dict.fromkeys() to preserve insertion order", "Convert back to list"],
      cpp: ["Use unordered_set to track seen elements", "Maintain original order in result vector"],
      java: ["HashSet for O(1) lookup", "Maintain insertion order with separate list"]
    },
    sampleTests: [
      { id: 1, input: "6\n1 2 2 3 4 4", expected: "1 2 3 4" },
      { id: 2, input: "5\n5 5 5 5 5", expected: "5" }
    ]
  },
  {
    id: 18,
    title: "Character Frequency Count",
    difficulty: "Medium",
    topics: ["strings", "hashmaps"],
    videoUrl: "",
    referenceCode: {
      python: `s = input()
freq = {}
for char in s:
    freq[char] = freq.get(char, 0) + 1
for char, count in sorted(freq.items()):
    print(f"{char}: {count}")`,
      cpp: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    map<char, int> freq;
    for (char c : s) {
        freq[c]++;
    }
    for (auto& p : freq) {
        cout << p.first << ": " << p.second << endl;
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        TreeMap<Character, Integer> freq = new TreeMap<>();
        for (char c : s.toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) + 1);
        }
        for (Map.Entry<Character, Integer> e : freq.entrySet()) {
            System.out.println(e.getKey() + ": " + e.getValue());
        }
    }
}`
    },
    buggyCode: {
      python: `s = input()
freq = {}
for char in s:
    freq[char] += 1  # Bug: KeyError on first occurrence
for char, count in sorted(freq.items()):
    print(f"{char}: {count}")`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    unordered_map<char, int> freq;
    for (char c : s) {
        freq[c]++;
    }
    for (auto& p : freq) {  // Bug: Unordered output
        cout << p.first << ": " << p.second << endl;
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        HashMap<Character, Integer> freq = new HashMap<>();  // Bug: Unordered
        for (char c : s.toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) + 1);
        }
        for (Map.Entry<Character, Integer> e : freq.entrySet()) {
            System.out.println(e.getKey() + ": " + e.getValue());
        }
    }
}`
    },
    explanations: {
      python: ["Use dictionary to count frequencies", "Use get() method to handle missing keys", "Sort by keys for consistent output"],
      cpp: ["Use map (not unordered_map) for sorted output"],
      java: ["TreeMap maintains sorted order of keys"]
    },
    sampleTests: [
      { id: 1, input: "hello", expected: "e: 1\nh: 1\nl: 2\no: 1" },
      { id: 2, input: "aabbcc", expected: "a: 2\nb: 2\nc: 2" }
    ]
  },
  {
    id: 19,
    title: "Check Leap Year",
    difficulty: "Medium",
    topics: ["conditionals", "math"],
    videoUrl: "",
    referenceCode: {
      python: `year = int(input())
if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
    print("Leap Year")
else:
    print("Not a Leap Year")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int year;
    cin >> year;
    if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0))
        cout << "Leap Year" << endl;
    else
        cout << "Not a Leap Year" << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int year = sc.nextInt();
        if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0))
            System.out.println("Leap Year");
        else
            System.out.println("Not a Leap Year");
    }
}`
    },
    buggyCode: {
      python: `year = int(input())
if year % 4 == 0:  # Bug: Missing century check
    print("Leap Year")
else:
    print("Not a Leap Year")`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int year;
    cin >> year;
    if (year % 4 == 0)  // Bug
        cout << "Leap Year" << endl;
    else
        cout << "Not a Leap Year" << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int year = sc.nextInt();
        if (year % 4 == 0)  // Bug
            System.out.println("Leap Year");
        else
            System.out.println("Not a Leap Year");
    }
}`
    },
    explanations: {
      python: ["Divisible by 4 but not 100, OR divisible by 400"],
      cpp: ["Check both conditions with logical operators"],
      java: ["Century years must be divisible by 400"]
    },
    sampleTests: [
      { id: 1, input: "2020", expected: "Leap Year" },
      { id: 2, input: "1900", expected: "Not a Leap Year" },
      { id: 3, input: "2000", expected: "Leap Year" }
    ]
  },
  {
    id: 20,
    title: "First Non-Repeating Character",
    difficulty: "Medium",
    topics: ["strings", "hashmaps"],
    videoUrl: "",
    referenceCode: {
      python: `s = input()
freq = {}
for char in s:
    freq[char] = freq.get(char, 0) + 1
for char in s:
    if freq[char] == 1:
        print(char)
        break
else:
    print("None")`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    unordered_map<char, int> freq;
    for (char c : s) {
        freq[c]++;
    }
    bool found = false;
    for (char c : s) {
        if (freq[c] == 1) {
            cout << c << endl;
            found = true;
            break;
        }
    }
    if (!found) cout << "None" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        Map<Character, Integer> freq = new HashMap<>();
        for (char c : s.toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) + 1);
        }
        boolean found = false;
        for (char c : s.toCharArray()) {
            if (freq.get(c) == 1) {
                System.out.println(c);
                found = true;
                break;
            }
        }
        if (!found) System.out.println("None");
    }
}`
    },
    buggyCode: {
      python: `s = input()
freq = {}
for char in s:
    freq[char] = freq.get(char, 0) + 1
for char, count in freq.items():  # Bug: Loses order
    if count == 1:
        print(char)
        break
else:
    print("None")`,
      cpp: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    map<char, int> freq;
    for (char c : s) {
        freq[c]++;
    }
    bool found = false;
    for (auto& p : freq) {  // Bug: Wrong iteration
        if (p.second == 1) {
            cout << p.first << endl;
            found = true;
            break;
        }
    }
    if (!found) cout << "None" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        Map<Character, Integer> freq = new HashMap<>();
        for (char c : s.toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) + 1);
        }
        boolean found = false;
        for (Map.Entry<Character, Integer> e : freq.entrySet()) {  // Bug
            if (e.getValue() == 1) {
                System.out.println(e.getKey());
                found = true;
                break;
            }
        }
        if (!found) System.out.println("None");
    }
}`
    },
    explanations: {
      python: ["Count character frequencies", "Iterate through original string to maintain order", "Return first character with count 1"],
      cpp: ["Use two passes: one for counting, one for finding"],
      java: ["HashMap for counting, iterate original string for order"]
    },
    sampleTests: [
      { id: 1, input: "leetcode", expected: "l" },
      { id: 2, input: "aabb", expected: "None" }
    ]
  },
  {
    id: 21,
    title: "Rotate List by K Positions",
    difficulty: "Medium",
    topics: ["arrays", "algorithms"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
k = int(input())
k = k % n
result = arr[k:] + arr[:k]
print(" ".join(map(str, result)))`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    int k;
    cin >> k;
    k = k % n;
    rotate(arr.begin(), arr.begin() + k, arr.end());
    for (int i = 0; i < arr.size(); i++) {
        cout << arr[i] << (i < arr.size()-1 ? " " : "");
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int k = sc.nextInt();
        k = k % n;
        int[] result = new int[n];
        for (int i = 0; i < n; i++) {
            result[i] = arr[(i + k) % n];
        }
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i] + (i < result.length-1 ? " " : ""));
        }
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
k = int(input())
result = arr[k:] + arr[:k]  # Bug: No modulo for k > n
print(" ".join(map(str, result)))`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    int k;
    cin >> k;
    rotate(arr.begin(), arr.begin() + k, arr.end());  // Bug: No modulo
    for (int i = 0; i < arr.size(); i++) {
        cout << arr[i] << (i < arr.size()-1 ? " " : "");
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int k = sc.nextInt();
        int[] result = new int[n];
        for (int i = 0; i < n; i++) {
            result[i] = arr[(i + k) % n];  // Bug: Wrong rotation direction
        }
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i] + (i < result.length-1 ? " " : ""));
        }
    }
}`
    },
    explanations: {
      python: ["Use modulo to handle k > n", "Slice array into two parts and concatenate"],
      cpp: ["Use STL rotate function", "Apply modulo to k first"],
      java: ["Calculate new positions with modulo arithmetic"]
    },
    sampleTests: [
      { id: 1, input: "5\n1 2 3 4 5\n2", expected: "3 4 5 1 2" },
      { id: 2, input: "3\n10 20 30\n1", expected: "20 30 10" }
    ]
  },
  {
    id: 22,
    title: "Longest Palindromic Substring",
    difficulty: "Hard",
    topics: ["strings", "dynamic programming"],
    videoUrl: "",
    referenceCode: {
      python: `s = input()
def longest_palindrome(s):
    if len(s) < 2:
        return s
    start, max_len = 0, 1
    for i in range(len(s)):
        # Check for odd length palindromes
        left, right = i, i
        while left >= 0 and right < len(s) and s[left] == s[right]:
            if right - left + 1 > max_len:
                start = left
                max_len = right - left + 1
            left -= 1
            right += 1
        # Check for even length palindromes
        left, right = i, i + 1
        while left >= 0 and right < len(s) and s[left] == s[right]:
            if right - left + 1 > max_len:
                start = left
                max_len = right - left + 1
            left -= 1
            right += 1
    return s[start:start + max_len]
print(longest_palindrome(s))`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

string longestPalindrome(string s) {
    if (s.length() < 2) return s;
    int start = 0, maxLen = 1;
    for (int i = 0; i < s.length(); i++) {
        int left = i, right = i;
        while (left >= 0 && right < s.length() && s[left] == s[right]) {
            if (right - left + 1 > maxLen) {
                start = left;
                maxLen = right - left + 1;
            }
            left--;
            right++;
        }
        left = i;
        right = i + 1;
        while (left >= 0 && right < s.length() && s[left] == s[right]) {
            if (right - left + 1 > maxLen) {
                start = left;
                maxLen = right - left + 1;
            }
            left--;
            right++;
        }
    }
    return s.substr(start, maxLen);
}

int main() {
    string s;
    getline(cin, s);
    cout << longestPalindrome(s) << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    static String longestPalindrome(String s) {
        if (s.length() < 2) return s;
        int start = 0, maxLen = 1;
        for (int i = 0; i < s.length(); i++) {
            int left = i, right = i;
            while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
                if (right - left + 1 > maxLen) {
                    start = left;
                    maxLen = right - left + 1;
                }
                left--;
                right++;
            }
            left = i;
            right = i + 1;
            while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
                if (right - left + 1 > maxLen) {
                    start = left;
                    maxLen = right - left + 1;
                }
                left--;
                right++;
            }
        }
        return s.substring(start, start + maxLen);
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(longestPalindrome(s));
    }
}`
    },
    buggyCode: {
      python: `s = input()
def longest_palindrome(s):
    if len(s) < 2:
        return s
    start, max_len = 0, 1
    for i in range(len(s)):
        left, right = i, i
        while left >= 0 and right < len(s) and s[left] == s[right]:
            if right - left + 1 > max_len:
                start = left
                max_len = right - left + 1
            left -= 1
            right += 1
        # Bug: Missing even length palindrome check
    return s[start:start + max_len]
print(longest_palindrome(s))`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

string longestPalindrome(string s) {
    if (s.length() < 2) return s;
    int start = 0, maxLen = 1;
    for (int i = 0; i < s.length(); i++) {
        int left = i, right = i;
        while (left >= 0 && right < s.length() && s[left] == s[right]) {
            if (right - left + 1 > maxLen) {
                start = left;
                maxLen = right - left + 1;
            }
            left--;
            right++;
        }
        // Bug: Missing even length check
    }
    return s.substr(start, maxLen);
}

int main() {
    string s;
    getline(cin, s);
    cout << longestPalindrome(s) << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    static String longestPalindrome(String s) {
        if (s.length() < 2) return s;
        int start = 0, maxLen = 1;
        for (int i = 0; i < s.length(); i++) {
            int left = i, right = i;
            while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
                if (right - left + 1 > maxLen) {
                    start = left;
                    maxLen = right - left + 1;
                }
                left--;
                right++;
            }
            // Bug: Missing even length check
        }
        return s.substring(start, start + maxLen);
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(longestPalindrome(s));
    }
}`
    },
    explanations: {
      python: ["Expand around each center", "Check both odd and even length palindromes", "Track longest found"],
      cpp: ["Two-pointer approach from center"],
      java: ["Expand from each possible center"]
    },
    sampleTests: [
      { id: 1, input: "babad", expected: "bab" },
      { id: 2, input: "cbbd", expected: "bb" }
    ]
  },
  {
    id: 23,
    title: "Binary Search (Recursive)",
    difficulty: "Hard",
    topics: ["arrays", "recursion", "searching"],
    videoUrl: "",
    referenceCode: {
      python: `def binary_search(arr, target, left, right):
    if left > right:
        return -1
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] > target:
        return binary_search(arr, target, left, mid - 1)
    else:
        return binary_search(arr, target, mid + 1, right)

n = int(input())
arr = list(map(int, input().split()))
target = int(input())
result = binary_search(arr, target, 0, len(arr) - 1)
print(result if result != -1 else "Not found")`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target, int left, int right) {
    if (left > right) return -1;
    int mid = (left + right) / 2;
    if (arr[mid] == target) return mid;
    else if (arr[mid] > target) return binarySearch(arr, target, left, mid - 1);
    else return binarySearch(arr, target, mid + 1, right);
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    int target;
    cin >> target;
    int result = binarySearch(arr, target, 0, n - 1);
    if (result != -1) cout << result << endl;
    else cout << "Not found" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    static int binarySearch(int[] arr, int target, int left, int right) {
        if (left > right) return -1;
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] > target) return binarySearch(arr, target, left, mid - 1);
        else return binarySearch(arr, target, mid + 1, right);
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        int result = binarySearch(arr, target, 0, n - 1);
        if (result != -1) System.out.println(result);
        else System.out.println("Not found");
    }
}`
    },
    buggyCode: {
      python: `def binary_search(arr, target, left, right):
    if left >= right:  # Bug: Should be left > right
        return -1
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] > target:
        return binary_search(arr, target, left, mid - 1)
    else:
        return binary_search(arr, target, mid + 1, right)

n = int(input())
arr = list(map(int, input().split()))
target = int(input())
result = binary_search(arr, target, 0, len(arr) - 1)
print(result if result != -1 else "Not found")`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target, int left, int right) {
    if (left >= right) return -1;  // Bug
    int mid = (left + right) / 2;
    if (arr[mid] == target) return mid;
    else if (arr[mid] > target) return binarySearch(arr, target, left, mid - 1);
    else return binarySearch(arr, target, mid + 1, right);
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    int target;
    cin >> target;
    int result = binarySearch(arr, target, 0, n - 1);
    if (result != -1) cout << result << endl;
    else cout << "Not found" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    static int binarySearch(int[] arr, int target, int left, int right) {
        if (left >= right) return -1;  // Bug
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] > target) return binarySearch(arr, target, left, mid - 1);
        else return binarySearch(arr, target, mid + 1, right);
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        int result = binarySearch(arr, target, 0, n - 1);
        if (result != -1) System.out.println(result);
        else System.out.println("Not found");
    }
}`
    },
    explanations: {
      python: ["Base case: left > right means not found", "Calculate mid point", "Recursively search left or right half"],
      cpp: ["Divide and conquer approach"],
      java: ["O(log n) time complexity"]
    },
    sampleTests: [
      { id: 1, input: "5\n1 2 3 4 5\n3", expected: "2" },
      { id: 2, input: "4\n10 20 30 40\n25", expected: "Not found" }
    ]
  },
  {
    id: 24,
    title: "Maximum Subarray Sum (Kadane's Algorithm)",
    difficulty: "Hard",
    topics: ["arrays", "dynamic programming"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
max_sum = current_sum = arr[0]
for i in range(1, n):
    current_sum = max(arr[i], current_sum + arr[i])
    max_sum = max(max_sum, current_sum)
print(max_sum)`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    int max_sum = arr[0], current_sum = arr[0];
    for (int i = 1; i < n; i++) {
        current_sum = max(arr[i], current_sum + arr[i]);
        max_sum = max(max_sum, current_sum);
    }
    cout << max_sum << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int maxSum = arr[0], currentSum = arr[0];
        for (int i = 1; i < n; i++) {
            currentSum = Math.max(arr[i], currentSum + arr[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        System.out.println(maxSum);
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
max_sum = current_sum = 0  # Bug: Should start from arr[0]
for i in range(n):
    current_sum = max(arr[i], current_sum + arr[i])
    max_sum = max(max_sum, current_sum)
print(max_sum)`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    int max_sum = 0, current_sum = 0;  // Bug
    for (int i = 0; i < n; i++) {
        current_sum = max(arr[i], current_sum + arr[i]);
        max_sum = max(max_sum, current_sum);
    }
    cout << max_sum << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int maxSum = 0, currentSum = 0;  // Bug
        for (int i = 0; i < n; i++) {
            currentSum = Math.max(arr[i], currentSum + arr[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        System.out.println(maxSum);
    }
}`
    },
    explanations: {
      python: ["Initialize with first element", "For each element, decide to extend or start new subarray", "Track maximum seen"],
      cpp: ["Kadane's algorithm - O(n) solution"],
      java: ["Choose between adding to current sum or starting fresh"]
    },
    sampleTests: [
      { id: 1, input: "5\n-2 1 -3 4 -1", expected: "4" },
      { id: 2, input: "8\n-2 -3 4 -1 -2 1 5 -3", expected: "7" }
    ]
  },
  {
    id: 25,
    title: "Two Sum Problem",
    difficulty: "Hard",
    topics: ["arrays", "hashmaps"],
    videoUrl: "",
    referenceCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
target = int(input())
seen = {}
for i, num in enumerate(arr):
    complement = target - num
    if complement in seen:
        print(f"{seen[complement]} {i}")
        break
    seen[num] = i
else:
    print("Not found")`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    int target;
    cin >> target;
    unordered_map<int, int> seen;
    bool found = false;
    for (int i = 0; i < n; i++) {
        int complement = target - arr[i];
        if (seen.find(complement) != seen.end()) {
            cout << seen[complement] << " " << i << endl;
            found = true;
            break;
        }
        seen[arr[i]] = i;
    }
    if (!found) cout << "Not found" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        Map<Integer, Integer> seen = new HashMap<>();
        boolean found = false;
        for (int i = 0; i < n; i++) {
            int complement = target - arr[i];
            if (seen.containsKey(complement)) {
                System.out.println(seen.get(complement) + " " + i);
                found = true;
                break;
            }
            seen.put(arr[i], i);
        }
        if (!found) System.out.println("Not found");
    }
}`
    },
    buggyCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
target = int(input())
for i in range(n):
    for j in range(i+1, n):  # Bug: O(n^2) instead of O(n)
        if arr[i] + arr[j] == target:
            print(f"{i} {j}")
            break
else:
    print("Not found")`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    int target;
    cin >> target;
    bool found = false;
    for (int i = 0; i < n; i++) {
        for (int j = i+1; j < n; j++) {  // Bug
            if (arr[i] + arr[j] == target) {
                cout << i << " " << j << endl;
                found = true;
                break;
            }
        }
        if (found) break;
    }
    if (!found) cout << "Not found" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        boolean found = false;
        for (int i = 0; i < n; i++) {
            for (int j = i+1; j < n; j++) {  // Bug
                if (arr[i] + arr[j] == target) {
                    System.out.println(i + " " + j);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (!found) System.out.println("Not found");
    }
}`
    },
    explanations: {
      python: ["Use hashmap to store seen numbers", "For each number, check if complement exists", "O(n) time complexity"],
      cpp: ["Hash table for O(1) lookup"],
      java: ["Single pass solution with HashMap"]
    },
    sampleTests: [
      { id: 1, input: "4\n2 7 11 15\n9", expected: "0 1" },
      { id: 2, input: "3\n3 2 4\n6", expected: "1 2" }
    ]
  },
  {
    id: 26,
    title: "Implement Stack Using Two Queues",
    difficulty: "Hard",
    topics: ["data structures", "queues", "stacks"],
    videoUrl: "",
    referenceCode: {
      python: `from collections import deque

class Stack:
    def __init__(self):
        self.q1 = deque()
        self.q2 = deque()
    
    def push(self, x):
        self.q2.append(x)
        while self.q1:
            self.q2.append(self.q1.popleft())
        self.q1, self.q2 = self.q2, self.q1
    
    def pop(self):
        if self.q1:
            return self.q1.popleft()
        return None
    
    def top(self):
        if self.q1:
            return self.q1[0]
        return None

stack = Stack()
operations = input().split(";")
for op in operations:
    parts = op.strip().split()
    if parts[0] == "push":
        stack.push(int(parts[1]))
        print(f"Pushed {parts[1]}")
    elif parts[0] == "pop":
        val = stack.pop()
        print(f"Popped {val}" if val else "Empty")
    elif parts[0] == "top":
        val = stack.top()
        print(f"Top {val}" if val else "Empty")`,
      cpp: `#include <iostream>
#include <queue>
#include <sstream>
using namespace std;

class Stack {
    queue<int> q1, q2;
public:
    void push(int x) {
        q2.push(x);
        while (!q1.empty()) {
            q2.push(q1.front());
            q1.pop();
        }
        swap(q1, q2);
    }
    
    int pop() {
        if (q1.empty()) return -1;
        int val = q1.front();
        q1.pop();
        return val;
    }
    
    int top() {
        if (q1.empty()) return -1;
        return q1.front();
    }
};

int main() {
    Stack s;
    string line;
    getline(cin, line);
    istringstream iss(line);
    string op;
    while (getline(iss, op, ';')) {
        istringstream opss(op);
        string cmd;
        opss >> cmd;
        if (cmd == "push") {
            int x;
            opss >> x;
            s.push(x);
            cout << "Pushed " << x << endl;
        } else if (cmd == "pop") {
            int val = s.pop();
            cout << "Popped " << val << endl;
        } else if (cmd == "top") {
            int val = s.top();
            cout << "Top " << val << endl;
        }
    }
    return 0;
}`,
      java: `import java.util.*;

class Stack {
    Queue<Integer> q1 = new LinkedList<>();
    Queue<Integer> q2 = new LinkedList<>();
    
    void push(int x) {
        q2.add(x);
        while (!q1.isEmpty()) {
            q2.add(q1.remove());
        }
        Queue<Integer> temp = q1;
        q1 = q2;
        q2 = temp;
    }
    
    int pop() {
        if (q1.isEmpty()) return -1;
        return q1.remove();
    }
    
    int top() {
        if (q1.isEmpty()) return -1;
        return q1.peek();
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Stack s = new Stack();
        String line = sc.nextLine();
        String[] operations = line.split(";");
        for (String op : operations) {
            String[] parts = op.trim().split(" ");
            if (parts[0].equals("push")) {
                int x = Integer.parseInt(parts[1]);
                s.push(x);
                System.out.println("Pushed " + x);
            } else if (parts[0].equals("pop")) {
                int val = s.pop();
                System.out.println("Popped " + val);
            } else if (parts[0].equals("top")) {
                int val = s.top();
                System.out.println("Top " + val);
            }
        }
    }
}`
    },
    buggyCode: {
      python: `from collections import deque

class Stack:
    def __init__(self):
        self.q1 = deque()
        self.q2 = deque()
    
    def push(self, x):
        self.q1.append(x)  # Bug: Should use q2 and swap
    
    def pop(self):
        if self.q1:
            return self.q1.popleft()  # Bug: Wrong order
        return None
    
    def top(self):
        if self.q1:
            return self.q1[0]
        return None

stack = Stack()
operations = input().split(";")
for op in operations:
    parts = op.strip().split()
    if parts[0] == "push":
        stack.push(int(parts[1]))
        print(f"Pushed {parts[1]}")
    elif parts[0] == "pop":
        val = stack.pop()
        print(f"Popped {val}" if val else "Empty")
    elif parts[0] == "top":
        val = stack.top()
        print(f"Top {val}" if val else "Empty")`,
      cpp: `#include <iostream>
#include <queue>
#include <sstream>
using namespace std;

class Stack {
    queue<int> q1, q2;
public:
    void push(int x) {
        q1.push(x);  // Bug: Should use q2 and swap
    }
    
    int pop() {
        if (q1.empty()) return -1;
        int val = q1.front();
        q1.pop();
        return val;  // Bug: Wrong order
    }
    
    int top() {
        if (q1.empty()) return -1;
        return q1.front();
    }
};

int main() {
    Stack s;
    string line;
    getline(cin, line);
    istringstream iss(line);
    string op;
    while (getline(iss, op, ';')) {
        istringstream opss(op);
        string cmd;
        opss >> cmd;
        if (cmd == "push") {
            int x;
            opss >> x;
            s.push(x);
            cout << "Pushed " << x << endl;
        } else if (cmd == "pop") {
            int val = s.pop();
            cout << "Popped " << val << endl;
        } else if (cmd == "top") {
            int val = s.top();
            cout << "Top " << val << endl;
        }
    }
    return 0;
}`,
      java: `import java.util.*;

class Stack {
    Queue<Integer> q1 = new LinkedList<>();
    Queue<Integer> q2 = new LinkedList<>();
    
    void push(int x) {
        q1.add(x);  // Bug: Should use q2 and swap
    }
    
    int pop() {
        if (q1.isEmpty()) return -1;
        return q1.remove();  // Bug: Wrong order
    }
    
    int top() {
        if (q1.isEmpty()) return -1;
        return q1.peek();
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Stack s = new Stack();
        String line = sc.nextLine();
        String[] operations = line.split(";");
        for (String op : operations) {
            String[] parts = op.trim().split(" ");
            if (parts[0].equals("push")) {
                int x = Integer.parseInt(parts[1]);
                s.push(x);
                System.out.println("Pushed " + x);
            } else if (parts[0].equals("pop")) {
                int val = s.pop();
                System.out.println("Popped " + val);
            } else if (parts[0].equals("top")) {
                int val = s.top();
                System.out.println("Top " + val);
            }
        }
    }
}`
    },
    explanations: {
      python: ["Push to q2, transfer all from q1 to q2, then swap queues", "Ensures most recent element is at front"],
      cpp: ["Use two queues to simulate LIFO behavior"],
      java: ["Push operation maintains stack property"]
    },
    sampleTests: [
      { id: 1, input: "push 1;push 2;top", expected: "Pushed 1\nPushed 2\nTop 2" },
      { id: 2, input: "push 3;push 4;pop", expected: "Pushed 3\nPushed 4\nPopped 4" }
    ]
  },
  {
    id: 27,
    title: "Detect Cycle in Linked List",
    difficulty: "Hard",
    topics: ["linked lists", "two pointers"],
    videoUrl: "",
    referenceCode: {
      python: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

# Create linked list from input
n = int(input())
if n == 0:
    print("No cycle")
else:
    nodes = [Node(i) for i in range(n)]
    for i in range(n-1):
        nodes[i].next = nodes[i+1]
    cycle_pos = int(input())
    if cycle_pos != -1 and 0 <= cycle_pos < n:
        nodes[n-1].next = nodes[cycle_pos]
    print("Cycle detected" if has_cycle(nodes[0]) else "No cycle")`,
      cpp: `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

bool hasCycle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

int main() {
    int n;
    cin >> n;
    if (n == 0) {
        cout << "No cycle" << endl;
        return 0;
    }
    Node** nodes = new Node*[n];
    for (int i = 0; i < n; i++) {
        nodes[i] = new Node(i);
    }
    for (int i = 0; i < n-1; i++) {
        nodes[i]->next = nodes[i+1];
    }
    int cyclePos;
    cin >> cyclePos;
    if (cyclePos != -1 && cyclePos >= 0 && cyclePos < n) {
        nodes[n-1]->next = nodes[cyclePos];
    }
    cout << (hasCycle(nodes[0]) ? "Cycle detected" : "No cycle") << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

class Node {
    int data;
    Node next;
    Node(int d) { data = d; next = null; }
}

public class Main {
    static boolean hasCycle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println("No cycle");
            return;
        }
        Node[] nodes = new Node[n];
        for (int i = 0; i < n; i++) {
            nodes[i] = new Node(i);
        }
        for (int i = 0; i < n-1; i++) {
            nodes[i].next = nodes[i+1];
        }
        int cyclePos = sc.nextInt();
        if (cyclePos != -1 && cyclePos >= 0 && cyclePos < n) {
            nodes[n-1].next = nodes[cyclePos];
        }
        System.out.println(hasCycle(nodes[0]) ? "Cycle detected" : "No cycle");
    }
}`
    },
    buggyCode: {
      python: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

def has_cycle(head):
    slow = head
    fast = head.next  # Bug: Should start at same position
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

n = int(input())
if n == 0:
    print("No cycle")
else:
    nodes = [Node(i) for i in range(n)]
    for i in range(n-1):
        nodes[i].next = nodes[i+1]
    cycle_pos = int(input())
    if cycle_pos != -1 and 0 <= cycle_pos < n:
        nodes[n-1].next = nodes[cycle_pos]
    print("Cycle detected" if has_cycle(nodes[0]) else "No cycle")`,
      cpp: `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

bool hasCycle(Node* head) {
    Node* slow = head;
    Node* fast = head->next;  // Bug
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

int main() {
    int n;
    cin >> n;
    if (n == 0) {
        cout << "No cycle" << endl;
        return 0;
    }
    Node** nodes = new Node*[n];
    for (int i = 0; i < n; i++) {
        nodes[i] = new Node(i);
    }
    for (int i = 0; i < n-1; i++) {
        nodes[i]->next = nodes[i+1];
    }
    int cyclePos;
    cin >> cyclePos;
    if (cyclePos != -1 && cyclePos >= 0 && cyclePos < n) {
        nodes[n-1]->next = nodes[cyclePos];
    }
    cout << (hasCycle(nodes[0]) ? "Cycle detected" : "No cycle") << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

class Node {
    int data;
    Node next;
    Node(int d) { data = d; next = null; }
}

public class Main {
    static boolean hasCycle(Node head) {
        Node slow = head;
        Node fast = head.next;  // Bug
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println("No cycle");
            return;
        }
        Node[] nodes = new Node[n];
        for (int i = 0; i < n; i++) {
            nodes[i] = new Node(i);
        }
        for (int i = 0; i < n-1; i++) {
            nodes[i].next = nodes[i+1];
        }
        int cyclePos = sc.nextInt();
        if (cyclePos != -1 && cyclePos >= 0 && cyclePos < n) {
            nodes[n-1].next = nodes[cyclePos];
        }
        System.out.println(hasCycle(nodes[0]) ? "Cycle detected" : "No cycle");
    }
}`
    },
    explanations: {
      python: ["Floyd's cycle detection (tortoise and hare)", "Slow pointer moves 1 step, fast moves 2 steps", "If they meet, cycle exists"],
      cpp: ["Two pointer technique"],
      java: ["O(n) time, O(1) space solution"]
    },
    sampleTests: [
      { id: 1, input: "4\n1", expected: "Cycle detected" },
      { id: 2, input: "3\n-1", expected: "No cycle" }
    ]
  },
  {
    id: 28,
    title: "Generate All String Permutations",
    difficulty: "Hard",
    topics: ["strings", "backtracking", "recursion"],
    videoUrl: "",
    referenceCode: {
      python: `def permute(s, left, right, result):
    if left == right:
        result.append(''.join(s))
    else:
        for i in range(left, right + 1):
            s[left], s[i] = s[i], s[left]
            permute(s, left + 1, right, result)
            s[left], s[i] = s[i], s[left]  # backtrack

s = input()
result = []
permute(list(s), 0, len(s) - 1, result)
for p in sorted(result):
    print(p)`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
#include <vector>
using namespace std;

void permute(string& s, int left, int right, vector<string>& result) {
    if (left == right) {
        result.push_back(s);
    } else {
        for (int i = left; i <= right; i++) {
            swap(s[left], s[i]);
            permute(s, left + 1, right, result);
            swap(s[left], s[i]);  // backtrack
        }
    }
}

int main() {
    string s;
    cin >> s;
    vector<string> result;
    permute(s, 0, s.length() - 1, result);
    sort(result.begin(), result.end());
    for (const string& p : result) {
        cout << p << endl;
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    static void permute(char[] s, int left, int right, List<String> result) {
        if (left == right) {
            result.add(new String(s));
        } else {
            for (int i = left; i <= right; i++) {
                char temp = s[left];
                s[left] = s[i];
                s[i] = temp;
                permute(s, left + 1, right, result);
                temp = s[left];
                s[left] = s[i];
                s[i] = temp;  // backtrack
            }
        }
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        List<String> result = new ArrayList<>();
        permute(s.toCharArray(), 0, s.length() - 1, result);
        Collections.sort(result);
        for (String p : result) {
            System.out.println(p);
        }
    }
}`
    },
    buggyCode: {
      python: `def permute(s, left, right, result):
    if left == right:
        result.append(''.join(s))
    else:
        for i in range(left, right + 1):
            s[left], s[i] = s[i], s[left]
            permute(s, left + 1, right, result)
            # Bug: Missing backtrack

s = input()
result = []
permute(list(s), 0, len(s) - 1, result)
for p in sorted(result):
    print(p)`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
#include <vector>
using namespace std;

void permute(string& s, int left, int right, vector<string>& result) {
    if (left == right) {
        result.push_back(s);
    } else {
        for (int i = left; i <= right; i++) {
            swap(s[left], s[i]);
            permute(s, left + 1, right, result);
            // Bug: Missing backtrack
        }
    }
}

int main() {
    string s;
    cin >> s;
    vector<string> result;
    permute(s, 0, s.length() - 1, result);
    sort(result.begin(), result.end());
    for (const string& p : result) {
        cout << p << endl;
    }
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    static void permute(char[] s, int left, int right, List<String> result) {
        if (left == right) {
            result.add(new String(s));
        } else {
            for (int i = left; i <= right; i++) {
                char temp = s[left];
                s[left] = s[i];
                s[i] = temp;
                permute(s, left + 1, right, result);
                // Bug: Missing backtrack
            }
        }
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        List<String> result = new ArrayList<>();
        permute(s.toCharArray(), 0, s.length() - 1, result);
        Collections.sort(result);
        for (String p : result) {
            System.out.println(p);
        }
    }
}`
    },
    explanations: {
      python: ["Backtracking algorithm", "Swap characters and recurse", "Backtrack to restore original state"],
      cpp: ["Generate all possible arrangements"],
      java: ["Recursively swap and generate permutations"]
    },
    sampleTests: [
      { id: 1, input: "abc", expected: "abc\nacb\nbac\nbca\ncab\ncba" },
      { id: 2, input: "ab", expected: "ab\nba" }
    ]
  },
  {
    id: 29,
    title: "N-Queens Problem",
    difficulty: "Hard",
    topics: ["backtracking", "recursion"],
    videoUrl: "",
    referenceCode: {
      python: `def is_safe(board, row, col, n):
    # Check column
    for i in range(row):
        if board[i][col] == 1:
            return False
    # Check upper left diagonal
    i, j = row - 1, col - 1
    while i >= 0 and j >= 0:
        if board[i][j] == 1:
            return False
        i -= 1
        j -= 1
    # Check upper right diagonal
    i, j = row - 1, col + 1
    while i >= 0 and j < n:
        if board[i][j] == 1:
            return False
        i -= 1
        j += 1
    return True

def solve_n_queens(board, row, n, count):
    if row == n:
        return count + 1
    for col in range(n):
        if is_safe(board, row, col, n):
            board[row][col] = 1
            count = solve_n_queens(board, row + 1, n, count)
            board[row][col] = 0
    return count

n = int(input())
board = [[0] * n for _ in range(n)]
print(solve_n_queens(board, 0, n, 0))`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

bool isSafe(vector<vector<int>>& board, int row, int col, int n) {
    for (int i = 0; i < row; i++)
        if (board[i][col]) return false;
    for (int i = row-1, j = col-1; i >= 0 && j >= 0; i--, j--)
        if (board[i][j]) return false;
    for (int i = row-1, j = col+1; i >= 0 && j < n; i--, j++)
        if (board[i][j]) return false;
    return true;
}

int solveNQueens(vector<vector<int>>& board, int row, int n) {
    if (row == n) return 1;
    int count = 0;
    for (int col = 0; col < n; col++) {
        if (isSafe(board, row, col, n)) {
            board[row][col] = 1;
            count += solveNQueens(board, row + 1, n);
            board[row][col] = 0;
        }
    }
    return count;
}

int main() {
    int n;
    cin >> n;
    vector<vector<int>> board(n, vector<int>(n, 0));
    cout << solveNQueens(board, 0, n) << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    static boolean isSafe(int[][] board, int row, int col, int n) {
        for (int i = 0; i < row; i++)
            if (board[i][col] == 1) return false;
        for (int i = row-1, j = col-1; i >= 0 && j >= 0; i--, j--)
            if (board[i][j] == 1) return false;
        for (int i = row-1, j = col+1; i >= 0 && j < n; i--, j++)
            if (board[i][j] == 1) return false;
        return true;
    }
    
    static int solveNQueens(int[][] board, int row, int n) {
        if (row == n) return 1;
        int count = 0;
        for (int col = 0; col < n; col++) {
            if (isSafe(board, row, col, n)) {
                board[row][col] = 1;
                count += solveNQueens(board, row + 1, n);
                board[row][col] = 0;
            }
        }
        return count;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] board = new int[n][n];
        System.out.println(solveNQueens(board, 0, n));
    }
}`
    },
    buggyCode: {
      python: `def is_safe(board, row, col, n):
    # Only check column
    for i in range(row):
        if board[i][col] == 1:
            return False
    # Bug: Missing diagonal checks
    return True

def solve_n_queens(board, row, n, count):
    if row == n:
        return count + 1
    for col in range(n):
        if is_safe(board, row, col, n):
            board[row][col] = 1
            count = solve_n_queens(board, row + 1, n, count)
            board[row][col] = 0
    return count

n = int(input())
board = [[0] * n for _ in range(n)]
print(solve_n_queens(board, 0, n, 0))`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

bool isSafe(vector<vector<int>>& board, int row, int col, int n) {
    for (int i = 0; i < row; i++)
        if (board[i][col]) return false;
    // Bug: Missing diagonal checks
    return true;
}

int solveNQueens(vector<vector<int>>& board, int row, int n) {
    if (row == n) return 1;
    int count = 0;
    for (int col = 0; col < n; col++) {
        if (isSafe(board, row, col, n)) {
            board[row][col] = 1;
            count += solveNQueens(board, row + 1, n);
            board[row][col] = 0;
        }
    }
    return count;
}

int main() {
    int n;
    cin >> n;
    vector<vector<int>> board(n, vector<int>(n, 0));
    cout << solveNQueens(board, 0, n) << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    static boolean isSafe(int[][] board, int row, int col, int n) {
        for (int i = 0; i < row; i++)
            if (board[i][col] == 1) return false;
        // Bug: Missing diagonal checks
        return true;
    }
    
    static int solveNQueens(int[][] board, int row, int n) {
        if (row == n) return 1;
        int count = 0;
        for (int col = 0; col < n; col++) {
            if (isSafe(board, row, col, n)) {
                board[row][col] = 1;
                count += solveNQueens(board, row + 1, n);
                board[row][col] = 0;
            }
        }
        return count;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] board = new int[n][n];
        System.out.println(solveNQueens(board, 0, n));
    }
}`
    },
    explanations: {
      python: ["Place queens row by row", "Check if position is safe (no conflicts in column or diagonals)", "Backtrack if no solution"],
      cpp: ["Classic backtracking problem"],
      java: ["Count all possible solutions"]
    },
    sampleTests: [
      { id: 1, input: "4", expected: "2" },
      { id: 2, input: "1", expected: "1" }
    ]
  },
  {
    id: 30,
    title: "Merge Sort",
    difficulty: "Hard",
    topics: ["sorting", "divide and conquer", "recursion"],
    videoUrl: "",
    referenceCode: {
      python: `def merge(arr, left, mid, right):
    L = arr[left:mid+1]
    R = arr[mid+1:right+1]
    i = j = 0
    k = left
    while i < len(L) and j < len(R):
        if L[i] <= R[j]:
            arr[k] = L[i]
            i += 1
        else:
            arr[k] = R[j]
            j += 1
        k += 1
    while i < len(L):
        arr[k] = L[i]
        i += 1
        k += 1
    while j < len(R):
        arr[k] = R[j]
        j += 1
        k += 1

def merge_sort(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        merge_sort(arr, left, mid)
        merge_sort(arr, mid + 1, right)
        merge(arr, left, mid, right)

n = int(input())
arr = list(map(int, input().split()))
merge_sort(arr, 0, len(arr) - 1)
print(" ".join(map(str, arr)))`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& arr, int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    vector<int> L(n1), R(n2);
    for (int i = 0; i < n1; i++)
        L[i] = arr[left + i];
    for (int j = 0; j < n2; j++)
        R[j] = arr[mid + 1 + j];
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
    }
    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
    }
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    mergeSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i < n-1 ? " " : "");
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    static void merge(int[] arr, int left, int mid, int right) {
        int n1 = mid - left + 1;
        int n2 = right - mid;
        int[] L = new int[n1];
        int[] R = new int[n2];
        for (int i = 0; i < n1; i++)
            L[i] = arr[left + i];
        for (int j = 0; j < n2; j++)
            R[j] = arr[mid + 1 + j];
        int i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            if (L[i] <= R[j]) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            k++;
        }
        while (i < n1) {
            arr[k] = L[i];
            i++;
            k++;
        }
        while (j < n2) {
            arr[k] = R[j];
            j++;
            k++;
        }
    }
    
    static void mergeSort(int[] arr, int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSort(arr, left, mid);
            mergeSort(arr, mid + 1, right);
            merge(arr, left, mid, right);
        }
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        mergeSort(arr, 0, n - 1);
        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i < n-1 ? " " : ""));
        }
    }
}`
    },
    buggyCode: {
      python: `def merge(arr, left, mid, right):
    L = arr[left:mid+1]
    R = arr[mid+1:right+1]
    i = j = 0
    k = left
    while i < len(L) and j < len(R):
        if L[i] < R[j]:  # Bug: Should use <= for stable sort
            arr[k] = L[i]
            i += 1
        else:
            arr[k] = R[j]
            j += 1
        k += 1
    # Bug: Missing code to copy remaining elements

def merge_sort(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        merge_sort(arr, left, mid)
        merge_sort(arr, mid + 1, right)
        merge(arr, left, mid, right)

n = int(input())
arr = list(map(int, input().split()))
merge_sort(arr, 0, len(arr) - 1)
print(" ".join(map(str, arr)))`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& arr, int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    vector<int> L(n1), R(n2);
    for (int i = 0; i < n1; i++)
        L[i] = arr[left + i];
    for (int j = 0; j < n2; j++)
        R[j] = arr[mid + 1 + j];
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] < R[j]) {  // Bug
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    // Bug: Missing code to copy remaining elements
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    mergeSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i < n-1 ? " " : "");
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    static void merge(int[] arr, int left, int mid, int right) {
        int n1 = mid - left + 1;
        int n2 = right - mid;
        int[] L = new int[n1];
        int[] R = new int[n2];
        for (int i = 0; i < n1; i++)
            L[i] = arr[left + i];
        for (int j = 0; j < n2; j++)
            R[j] = arr[mid + 1 + j];
        int i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            if (L[i] < R[j]) {  // Bug
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            k++;
        }
        // Bug: Missing code to copy remaining elements
    }
    
    static void mergeSort(int[] arr, int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSort(arr, left, mid);
            mergeSort(arr, mid + 1, right);
            merge(arr, left, mid, right);
        }
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        mergeSort(arr, 0, n - 1);
        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i < n-1 ? " " : ""));
        }
    }
}`
    },
    explanations: {
      python: ["Divide array into halves recursively", "Merge sorted halves", "O(n log n) time complexity"],
      cpp: ["Stable sorting algorithm"],
      java: ["Divide and conquer approach"]
    },
    sampleTests: [
      { id: 1, input: "5\n5 2 8 1 9", expected: "1 2 5 8 9" },
      { id: 2, input: "6\n3 7 1 4 2 6", expected: "1 2 3 4 6 7" }
    ]
  },
  {
    id: 31,
    title: "Shortest Path in Graph (BFS)",
    difficulty: "Hard",
    topics: ["graphs", "bfs", "shortest path"],
    videoUrl: "",
    referenceCode: {
      python: `from collections import deque

def bfs_shortest_path(graph, start, end, n):
    visited = [False] * n
    queue = deque([(start, 0)])
    visited[start] = True
    
    while queue:
        node, dist = queue.popleft()
        if node == end:
            return dist
        for neighbor in graph[node]:
            if not visited[neighbor]:
                visited[neighbor] = True
                queue.append((neighbor, dist + 1))
    return -1

n = int(input())
e = int(input())
graph = [[] for _ in range(n)]
print("Enter edges (u v):")
for _ in range(e):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
start = int(input())
end = int(input())
result = bfs_shortest_path(graph, start, end, n)
print(result if result != -1 else "No path")`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int bfsShortestPath(vector<vector<int>>& graph, int start, int end, int n) {
    vector<bool> visited(n, false);
    queue<pair<int, int>> q;
    q.push({start, 0});
    visited[start] = true;
    
    while (!q.empty()) {
        int node = q.front().first;
        int dist = q.front().second;
        q.pop();
        
        if (node == end) return dist;
        
        for (int neighbor : graph[node]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push({neighbor, dist + 1});
            }
        }
    }
    return -1;
}

int main() {
    int n, e;
    cin >> n >> e;
    vector<vector<int>> graph(n);
    for (int i = 0; i < e; i++) {
        int u, v;
        cin >> u >> v;
        graph[u].push_back(v);
        graph[v].push_back(u);
    }
    int start, end;
    cin >> start >> end;
    int result = bfsShortestPath(graph, start, end, n);
    if (result != -1) cout << result << endl;
    else cout << "No path" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    static int bfsShortestPath(List<List<Integer>> graph, int start, int end, int n) {
        boolean[] visited = new boolean[n];
        Queue<int[]> queue = new LinkedList<>();
        queue.add(new int[]{start, 0});
        visited[start] = true;
        
        while (!queue.isEmpty()) {
            int[] current = queue.poll();
            int node = current[0];
            int dist = current[1];
            
            if (node == end) return dist;
            
            for (int neighbor : graph.get(node)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.add(new int[]{neighbor, dist + 1});
                }
            }
        }
        return -1;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int e = sc.nextInt();
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            graph.add(new ArrayList<>());
        }
        for (int i = 0; i < e; i++) {
            int u = sc.nextInt();
            int v = sc.nextInt();
            graph.get(u).add(v);
            graph.get(v).add(u);
        }
        int start = sc.nextInt();
        int end = sc.nextInt();
        int result = bfsShortestPath(graph, start, end, n);
        if (result != -1) System.out.println(result);
        else System.out.println("No path");
    }
}`
    },
    buggyCode: {
      python: `from collections import deque

def bfs_shortest_path(graph, start, end, n):
    queue = deque([(start, 0)])  # Bug: Missing visited tracking
    
    while queue:
        node, dist = queue.popleft()
        if node == end:
            return dist
        for neighbor in graph[node]:
            queue.append((neighbor, dist + 1))
    return -1

n = int(input())
e = int(input())
graph = [[] for _ in range(n)]
print("Enter edges (u v):")
for _ in range(e):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)
start = int(input())
end = int(input())
result = bfs_shortest_path(graph, start, end, n)
print(result if result != -1 else "No path")`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int bfsShortestPath(vector<vector<int>>& graph, int start, int end, int n) {
    queue<pair<int, int>> q;
    q.push({start, 0});
    // Bug: Missing visited tracking
    
    while (!q.empty()) {
        int node = q.front().first;
        int dist = q.front().second;
        q.pop();
        
        if (node == end) return dist;
        
        for (int neighbor : graph[node]) {
            q.push({neighbor, dist + 1});
        }
    }
    return -1;
}

int main() {
    int n, e;
    cin >> n >> e;
    vector<vector<int>> graph(n);
    for (int i = 0; i < e; i++) {
        int u, v;
        cin >> u >> v;
        graph[u].push_back(v);
        graph[v].push_back(u);
    }
    int start, end;
    cin >> start >> end;
    int result = bfsShortestPath(graph, start, end, n);
    if (result != -1) cout << result << endl;
    else cout << "No path" << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    static int bfsShortestPath(List<List<Integer>> graph, int start, int end, int n) {
        Queue<int[]> queue = new LinkedList<>();
        queue.add(new int[]{start, 0});
        // Bug: Missing visited tracking
        
        while (!queue.isEmpty()) {
            int[] current = queue.poll();
            int node = current[0];
            int dist = current[1];
            
            if (node == end) return dist;
            
            for (int neighbor : graph.get(node)) {
                queue.add(new int[]{neighbor, dist + 1});
            }
        }
        return -1;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int e = sc.nextInt();
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            graph.add(new ArrayList<>());
        }
        for (int i = 0; i < e; i++) {
            int u = sc.nextInt();
            int v = sc.nextInt();
            graph.get(u).add(v);
            graph.get(v).add(u);
        }
        int start = sc.nextInt();
        int end = sc.nextInt();
        int result = bfsShortestPath(graph, start, end, n);
        if (result != -1) System.out.println(result);
        else System.out.println("No path");
    }
}`
    },
    explanations: {
      python: ["Use BFS to find shortest path", "Track visited nodes to avoid cycles", "Store distance with each node"],
      cpp: ["Queue-based level-order traversal"],
      java: ["Finds shortest path in unweighted graph"]
    },
    sampleTests: [
      { id: 1, input: "5\n5\n0 1\n0 2\n1 3\n2 3\n3 4\n0\n4", expected: "3" },
      { id: 2, input: "3\n1\n0 1\n0\n2", expected: "No path" }
    ]
  }
];

export default initialProblems;
