# CodoAI Judge - Streamlined Language Definitions
# Only supports 5 languages: C, C++, Java, Python, JavaScript

@languages ||= []
@languages +=
[
  {
    id: 1,
    name: "C (GCC 11)",
    is_archived: false,
    source_file: "main.c",
    compile_cmd: "/usr/bin/gcc -std=c11 -O2 -Wall -Wextra %s main.c -o main",
    run_cmd: "./main"
  },
  {
    id: 2,
    name: "C++ (G++ 11)",
    is_archived: false,
    source_file: "main.cpp",
    compile_cmd: "/usr/bin/g++ -std=c++17 -O2 -Wall -Wextra %s main.cpp -o main",
    run_cmd: "./main"
  },
  {
    id: 3,
    name: "Java (OpenJDK 11)",
    is_archived: false,
    source_file: "Main.java",
    compile_cmd: "/usr/bin/javac %s Main.java",
    run_cmd: "/usr/bin/java Main"
  },
  {
    id: 4,
    name: "Python (3.10)",
    is_archived: false,
    source_file: "script.py",
    run_cmd: "/usr/bin/python3 script.py"
  },
  {
    id: 5,
    name: "JavaScript (Node.js)",
    is_archived: false,
    source_file: "script.js",
    run_cmd: "/usr/bin/node script.js"
  }
]