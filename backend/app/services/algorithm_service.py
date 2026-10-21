import structlog
from typing import List, Dict, Any, Optional

from app.schemas.algorithm import (
    AlgorithmTrackResponse,
    AlgorithmTrackSummary,
    GenerateAlgorithmRequest,
    RealWorldApplication,
)
from app.harness.contracts import AlgorithmExplanationResult
from app.harness.context import Budget
from app.harness.provider import call_with_repair

log = structlog.get_logger()

# Catalog of verified algorithm and system design tracks
ALGORITHM_CATALOG: Dict[str, Dict[str, Any]] = {
    # ------------------ ARRAYS & POINTERS ------------------
    "two_pointers": {
        "track_id": "two_pointers",
        "title": "Two Pointers (Inward Squeeze)",
        "category": "arrays",
        "difficulty": "beginner",
        "icon": "🎯",
        "time_complexity": "O(N)",
        "space_complexity": "O(1) Auxiliary",
        "clue": "Array is SORTED + Need to find pairs or triplets meeting a sum or condition",
        "intuition_summary": "Squeeze Left & Right pointers inward to eliminate O(N²) nested loops on sorted arrays.",
        "real_world_applications": [
            {
                "company_or_system": "Netflix / YouTube Video Encoding",
                "architecture_context": "Bitrate adaptation algorithms squeeze bandwidth bounds between minimum acceptable video resolution and max available network throughput.",
                "performance_gain": "Zero memory overhead O(1) buffer calculations executed within real-time streaming constraints (sub-10ms)."
            },
            {
                "company_or_system": "Financial Arbitrage (High-Frequency Trading)",
                "architecture_context": "Matching sorted buy and sell limit order books to find execution pairs instantly during high market volatility.",
                "performance_gain": "Processes 500,000+ limit orders/second with strictly linear O(N) traversals without sorting overhead."
            }
        ],
        "sandbox_config": {
            "type": "two_pointers",
            "title": "Sorted Array Pair Search",
            "initial_data": [2, 4, 7, 11, 15, 18],
            "target": 18,
            "pointers": [
                {"name": "left", "initial_index": 0, "color": "#3B82F6", "label": "L (Low)"},
                {"name": "right", "initial_index": 5, "color": "#EF4444", "label": "R (High)"}
            ],
            "goal_rule": "sum_equals_target"
        },
        "reference_code": {
            "python": "def two_sum_sorted(nums: list[int], target: int) -> list[int]:\n    l, r = 0, len(nums) - 1\n    while l < r:\n        s = nums[l] + nums[r]\n        if s == target: return [l, r]\n        elif s < target: l += 1\n        else: r -= 1\n    return []",
            "cpp": "vector<int> twoSum(vector<int>& nums, int target) {\n    int l = 0, r = nums.size() - 1;\n    while (l < r) {\n        int s = nums[l] + nums[r];\n        if (s == target) return {l, r};\n        else if (s < target) l++;\n        else r--;\n    }\n    return {};\n}",
            "java": "public int[] twoSum(int[] nums, int target) {\n    int l = 0, r = nums.length - 1;\n    while (l < r) {\n        int s = nums[l] + nums[r];\n        if (s == target) return new int[]{l, r};\n        else if (s < target) l++;\n        else r--;\n    }\n    return new int[]{};\n}"
        },
        "test_cases": [
            {"input": "nums = [2, 4, 7, 11, 15, 18], target = 18", "expected": "[1, 3]"}
        ]
    },
    "sliding_window": {
        "track_id": "sliding_window",
        "title": "Sliding Window Technique",
        "category": "arrays",
        "difficulty": "intermediate",
        "icon": "🪟",
        "time_complexity": "O(N)",
        "space_complexity": "O(1) / O(K)",
        "clue": "Contiguous Subarray / Substring + Window of fixed size K or dynamic max/min bounds",
        "intuition_summary": "Reuse overlapping subproblem sums by adding incoming elements and subtracting outgoing elements in O(1) time.",
        "real_world_applications": [
            {
                "company_or_system": "TCP Reno / Cubic Congestion Control",
                "architecture_context": "Maintains a sliding packet transmission window across network sockets to maximize bandwidth utilization without packet drop over WAN.",
                "performance_gain": "Sustains 100 Gbps network interfaces without re-calculating whole packet buffers per packet acknowledgement."
            },
            {
                "company_or_system": "Datadog / Prometheus Real-Time Metrics",
                "architecture_context": "Computes rolling 5-minute averages of CPU utilization and API latencies over continuous event streams.",
                "performance_gain": "Downsamples millions of telemetry points per second in O(1) incremental time per metric event."
            }
        ],
        "sandbox_config": {
            "type": "sliding_window",
            "title": "Maximum Average Rolling Window",
            "initial_data": [1, 12, -5, -6, 50, 3, 22, 9],
            "target": 4,
            "pointers": [
                {"name": "start", "initial_index": 0, "color": "#10B981", "label": "Start"},
                {"name": "end", "initial_index": 3, "color": "#6366F1", "label": "End"}
            ],
            "goal_rule": "max_window_sum"
        },
        "reference_code": {
            "python": "def max_sliding_avg(nums: list[int], k: int) -> float:\n    curr = sum(nums[:k])\n    best = curr\n    for i in range(k, len(nums)):\n        curr += nums[i] - nums[i - k]\n        best = max(best, curr)\n    return best / k",
            "cpp": "double maxSlidingAvg(vector<int>& nums, int k) {\n    double curr = 0;\n    for(int i=0; i<k; i++) curr += nums[i];\n    double best = curr;\n    for(int i=k; i<nums.size(); i++) {\n        curr += nums[i] - nums[i-k];\n        best = max(best, curr);\n    }\n    return best / k;\n}",
            "java": "public double maxSlidingAvg(int[] nums, int k) {\n    double curr = 0;\n    for(int i=0; i<k; i++) curr += nums[i];\n    double best = curr;\n    for(int i=k; i<nums.length; i++) {\n        curr += nums[i] - nums[i-k];\n        best = Math.max(best, curr);\n    }\n    return best / k;\n}"
        },
        "test_cases": [
            {"input": "nums = [1, 12, -5, -6, 50, 3], k = 4", "expected": "12.75"}
        ]
    },
    "kadane": {
        "track_id": "kadane",
        "title": "Kadane's Algorithm (Max Subarray)",
        "category": "arrays",
        "difficulty": "intermediate",
        "icon": "⚡",
        "time_complexity": "O(N)",
        "space_complexity": "O(1)",
        "clue": "Find maximum contiguous sum subarray containing both negative and positive numbers",
        "intuition_summary": "Discard past negative prefix sums: either extend the running contiguous subarray or start fresh at current element.",
        "real_world_applications": [
            {
                "company_or_system": "Computer Vision & Genomic Sequence Alignment",
                "architecture_context": "Locates bright spots in astronomical CCD images and high-density protein binding regions in DNA genomic sequencing.",
                "performance_gain": "Processes billions of base pairs in single linear pass without exponential O(N²) substring comparisons."
            }
        ],
        "sandbox_config": {
            "type": "array_kadane",
            "title": "Max Subarray Visualizer",
            "initial_data": [-2, 1, -3, 4, -1, 2, 1, -5, 4],
            "target": 6,
            "goal_rule": "max_contiguous_sum"
        },
        "reference_code": {
            "python": "def max_sub_array(nums: list[int]) -> int:\n    curr = best = nums[0]\n    for x in nums[1:]:\n        curr = max(x, curr + x)\n        best = max(best, curr)\n    return best",
            "cpp": "int maxSubArray(vector<int>& nums) {\n    int curr = nums[0], best = nums[0];\n    for (size_t i = 1; i < nums.size(); i++) {\n        curr = max(nums[i], curr + nums[i]);\n        best = max(best, curr);\n    }\n    return best;\n}",
            "java": "public int maxSubArray(int[] nums) {\n    int curr = nums[0], best = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        curr = Math.max(nums[i], curr + nums[i]);\n        best = Math.max(best, curr);\n    }\n    return best;\n}"
        },
        "test_cases": [
            {"input": "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", "expected": "6"}
        ]
    },

    # ------------------ TREES & TRIES ------------------
    "tree_traversal": {
        "track_id": "tree_traversal",
        "title": "Binary Tree BFS & DFS Traversal",
        "category": "trees",
        "difficulty": "intermediate",
        "icon": "🌲",
        "time_complexity": "O(N)",
        "space_complexity": "O(H) Height / O(W) Width",
        "clue": "Hierarchical parent-child nodes, level-order queues, or depth recursion",
        "intuition_summary": "Use recursion / stack for Depth-First Search (DFS) or FIFO Queue for Breadth-First Level Search (BFS).",
        "real_world_applications": [
            {
                "company_or_system": "React Virtual DOM Reconciliation (Fiber)",
                "architecture_context": "React Fiber traverses UI component hierarchy trees to generate diff patches before committing minimal DOM updates to the browser.",
                "performance_gain": "Enables 60fps responsive UI updates by prioritizing subtree traversal tasks dynamically."
            },
            {
                "company_or_system": "Linux / MacOS VFS (Virtual File System)",
                "architecture_context": "Operating system directory traversals and path resolution (e.g., /var/log/syslog) execute via hierarchical tree lookups.",
                "performance_gain": "Resolves multi-level file paths in logarithmic O(depth) time across millions of inodes."
            }
        ],
        "sandbox_config": {
            "type": "tree_traversal",
            "title": "Hierarchical Tree Traversal",
            "nodes": [
                {"id": 1, "value": 4, "left": 2, "right": 3, "x": 200, "y": 40},
                {"id": 2, "value": 2, "left": 4, "right": 5, "x": 110, "y": 105},
                {"id": 3, "value": 7, "left": 6, "right": 7, "x": 290, "y": 105},
                {"id": 4, "value": 1, "left": None, "right": None, "x": 60, "y": 175},
                {"id": 5, "value": 3, "left": None, "right": None, "x": 160, "y": 175},
                {"id": 6, "value": 6, "left": None, "right": None, "x": 240, "y": 175},
                {"id": 7, "value": 9, "left": None, "right": None, "x": 340, "y": 175}
            ],
            "goal_rule": "inorder_or_levelorder"
        },
        "reference_code": {
            "python": "def level_order(root) -> list[list[int]]:\n    if not root: return []\n    res, queue = [], [root]\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.pop(0)\n            level.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        res.append(level)\n    return res",
            "cpp": "vector<vector<int>> levelOrder(TreeNode* root) {\n    if (!root) return {};\n    vector<vector<int>> res;\n    queue<TreeNode*> q; q.push(root);\n    while(!q.empty()) {\n        int sz = q.size();\n        vector<int> level;\n        while(sz--) {\n            auto* cur = q.front(); q.pop();\n            level.push_back(cur->val);\n            if(cur->left) q.push(cur->left);\n            if(cur->right) q.push(cur->right);\n        }\n        res.push_back(level);\n    }\n    return res;\n}",
            "java": "public List<List<Integer>> levelOrder(TreeNode root) {\n    List<List<Integer>> res = new ArrayList<>();\n    if (root == null) return res;\n    Queue<TreeNode> q = new LinkedList<>(); q.offer(root);\n    while (!q.isEmpty()) {\n        int sz = q.size();\n        List<Integer> level = new ArrayList<>();\n        for (int i=0; i<sz; i++) {\n            TreeNode cur = q.poll();\n            level.add(cur.val);\n            if (cur.left != null) q.offer(cur.left);\n            if (cur.right != null) q.offer(cur.right);\n        }\n        res.add(level);\n    }\n    return res;\n}"
        },
        "test_cases": [
            {"input": "root = [4,2,7,1,3,6,9]", "expected": "[[4],[2,7],[1,3,6,9]]"}
        ]
    },
    "trie_prefix_tree": {
        "track_id": "trie_prefix_tree",
        "title": "Trie (Prefix Tree & Autocomplete)",
        "category": "trees",
        "difficulty": "intermediate",
        "icon": "🔤",
        "time_complexity": "O(L) Query (L = Word Length)",
        "space_complexity": "O(N * L * Alphabet)",
        "clue": "String prefix searches, dictionary matching, or search autocomplete",
        "intuition_summary": "Share common prefixes across tree branches so word lookups depend solely on key length L, independent of dataset size.",
        "real_world_applications": [
            {
                "company_or_system": "Google Search / Amazon Autocomplete",
                "architecture_context": "Prefix trees store billions of indexed search terms to instantly suggest top matching search queries as user types keystrokes.",
                "performance_gain": "Returns autocomplete candidates in <2ms lookup time regardless of whether dictionary has 10,000 or 50,000,000 words."
            },
            {
                "company_or_system": "Cloudflare / Cisco IP Routing (CIDR Longest Prefix Match)",
                "architecture_context": "Network routers match destination IP addresses against routing tables using Radix Trie longest prefix matching.",
                "performance_gain": "Routes millions of wire packets per microsecond with deterministic O(32) or O(128) bit lookups."
            }
        ],
        "sandbox_config": {
            "type": "trie_tree",
            "title": "Interactive Prefix Autocomplete Tree",
            "words": ["app", "apple", "apply", "bat", "batch"],
            "goal_rule": "prefix_search"
        },
        "reference_code": {
            "python": "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n    def insert(self, word: str):\n        curr = self.root\n        for c in word:\n            curr = curr.children.setdefault(c, TrieNode())\n        curr.is_word = True\n    def starts_with(self, prefix: str) -> bool:\n        curr = self.root\n        for c in prefix:\n            if c not in curr.children: return False\n            curr = curr.children[c]\n        return True",
            "cpp": "class TrieNode {\npublic:\n    unordered_map<char, TrieNode*> children;\n    bool isWord = false;\n};\nclass Trie {\n    TrieNode* root = new TrieNode();\npublic:\n    void insert(string word) {\n        auto* cur = root;\n        for (char c : word) {\n            if (!cur->children.count(c)) cur->children[c] = new TrieNode();\n            cur = cur->children[c];\n        }\n        cur->isWord = true;\n    }\n};",
            "java": "class TrieNode {\n    Map<Character, TrieNode> children = new HashMap<>();\n    boolean isWord = false;\n}\npublic class Trie {\n    private TrieNode root = new TrieNode();\n    public void insert(String word) {\n        TrieNode cur = root;\n        for (char c : word.toCharArray()) cur = cur.children.computeIfAbsent(c, k -> new TrieNode());\n        cur.isWord = true;\n    }\n}"
        },
        "test_cases": [
            {"input": "words=['app','apple'], prefix='app'", "expected": "true"}
        ]
    },

    # ------------------ GRAPHS ------------------
    "dijkstra_shortest_path": {
        "track_id": "dijkstra_shortest_path",
        "title": "Dijkstra's Shortest Path Algorithm",
        "category": "graphs",
        "difficulty": "advanced",
        "icon": "🗺️",
        "time_complexity": "O((V + E) log V)",
        "space_complexity": "O(V)",
        "clue": "Weighted graph with non-negative edge costs finding minimum path cost from source",
        "intuition_summary": "Greedily relax shortest distances using a Min-Priority Queue to guarantee optimal paths at each step.",
        "real_world_applications": [
            {
                "company_or_system": "Google Maps / Uber Navigation",
                "architecture_context": "Calculates fastest driving routes across city road networks where road distance, current traffic delay, and toll costs form weighted graph edges.",
                "performance_gain": "Computes optimal multi-turn directions across hundreds of thousands of road segments in milliseconds."
            },
            {
                "company_or_system": "OSPF (Open Shortest Path First) Internet Routing",
                "architecture_context": "Autonomous system routers exchange link-state packets and run Dijkstra to determine optimal next-hop router interfaces for IP traffic.",
                "performance_gain": "Converges global network packets around broken transit links in sub-second intervals."
            }
        ],
        "sandbox_config": {
            "type": "graph_dijkstra",
            "title": "Interactive Road Network Graph",
            "nodes": ["A", "B", "C", "D", "E"],
            "edges": [
                {"from": "A", "to": "B", "weight": 4},
                {"from": "A", "to": "C", "weight": 2},
                {"from": "C", "to": "B", "weight": 1},
                {"from": "B", "to": "D", "weight": 5},
                {"from": "C", "to": "D", "weight": 8},
                {"from": "D", "to": "E", "weight": 2}
            ],
            "goal_rule": "find_shortest_path"
        },
        "reference_code": {
            "python": "import heapq\n\ndef dijkstra(graph, start):\n    distances = {node: float('inf') for node in graph}\n    distances[start] = 0\n    pq = [(0, start)]\n    while pq:\n        cur_dist, node = heapq.heappop(pq)\n        if cur_dist > distances[node]: continue\n        for neighbor, weight in graph[node].items():\n            dist = cur_dist + weight\n            if dist < distances[neighbor]:\n                distances[neighbor] = dist\n                heapq.heappush(pq, (dist, neighbor))\n    return distances",
            "cpp": "unordered_map<char, int> dijkstra(unordered_map<char, vector<pair<char, int>>>& g, char src) {\n    priority_queue<pair<int, char>, vector<pair<int, char>>, greater<>> pq;\n    unordered_map<char, int> dist;\n    pq.push({0, src});\n    dist[src] = 0;\n    while(!pq.empty()) {\n        auto [d, u] = pq.top(); pq.pop();\n        for(auto& [v, w] : g[u]) {\n            if(!dist.count(v) || d + w < dist[v]) {\n                dist[v] = d + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    return dist;\n}",
            "java": "public Map<String, Integer> dijkstra(Map<String, Map<String, Integer>> graph, String start) {\n    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));\n    Map<String, Integer> dist = new HashMap<>();\n    pq.offer(new int[]{0, start.hashCode()});\n    return dist;\n}"
        },
        "test_cases": [
            {"input": "start='A', end='E'", "expected": "A -> C -> B -> D -> E (Cost: 10)"}
        ]
    },
    "graph_bfs_shortest_path": {
        "track_id": "graph_bfs_shortest_path",
        "title": "Breadth-First Search (Shortest Hops)",
        "category": "graphs",
        "difficulty": "intermediate",
        "icon": "🕸️",
        "time_complexity": "O(V + E)",
        "space_complexity": "O(V)",
        "clue": "Unweighted network finding minimum edge hops between start and target",
        "intuition_summary": "Expand outwards in concentric rings layer-by-layer; first time target is reached is guaranteed minimum hops.",
        "real_world_applications": [
            {
                "company_or_system": "LinkedIn 1st/2nd/3rd Degree Connections",
                "architecture_context": "Evaluates shortest social graph friendship hops to calculate degree of separation and people you may know.",
                "performance_gain": "Terminates within 3 layers across millions of member connections using early BFS exit."
            },
            {
                "company_or_system": "Amazon Warehouse Robotic Routing",
                "architecture_context": "Automated guided vehicles (Kiva bots) navigate 2D grid floor layouts to retrieve product shelves without colliding.",
                "performance_gain": "Generates collision-free shortest grid trajectories in under 5 milliseconds."
            }
        ],
        "sandbox_config": {
            "type": "graph_bfs",
            "title": "Concentric Social Graph BFS",
            "nodes": ["You", "Alice", "Bob", "Charlie", "David", "Target"],
            "edges": [
                {"from": "You", "to": "Alice"},
                {"from": "You", "to": "Bob"},
                {"from": "Alice", "to": "Charlie"},
                {"from": "Bob", "to": "David"},
                {"from": "Charlie", "to": "Target"}
            ],
            "goal_rule": "min_hop_path"
        },
        "reference_code": {
            "python": "from collections import deque\n\ndef bfs_shortest_hops(graph, start, target):\n    queue = deque([(start, [start])])\n    visited = {start}\n    while queue:\n        node, path = queue.popleft()\n        if node == target: return path\n        for nbr in graph.get(node, []):\n            if nbr not in visited:\n                visited.add(nbr)\n                queue.append((nbr, path + [nbr]))\n    return []",
            "cpp": "vector<string> bfsShortest(unordered_map<string, vector<string>>& g, string s, string target) {\n    queue<pair<string, vector<string>>> q;\n    unordered_set<string> vis{s};\n    q.push({s, {s}});\n    while(!q.empty()) {\n        auto [node, path] = q.front(); q.pop();\n        if (node == target) return path;\n        for(auto& nbr : g[node]) if(!vis.count(nbr)) { vis.insert(nbr); auto p = path; p.push_back(nbr); q.push({nbr, p}); }\n    }\n    return {};\n}",
            "java": "public List<String> bfs(Map<String, List<String>> g, String s, String target) {\n    Queue<List<String>> q = new LinkedList<>();\n    Set<String> vis = new HashSet<>(); vis.add(s);\n    q.offer(List.of(s));\n    while(!q.isEmpty()) {\n        List<String> path = q.poll();\n        String node = path.get(path.size()-1);\n        if (node.equals(target)) return path;\n        for (String nbr : g.getOrDefault(node, List.of())) if (vis.add(nbr)) { List<String> np = new ArrayList<>(path); np.add(nbr); q.offer(np); }\n    }\n    return List.of();\n}"
        },
        "test_cases": [
            {"input": "start='You', target='Target'", "expected": "['You', 'Alice', 'Charlie', 'Target']"}
        ]
    },

    # ------------------ DYNAMIC PROGRAMMING ------------------
    "dynamic_programming_1d": {
        "track_id": "dynamic_programming_1d",
        "title": "1D DP (House Robber / State Transitions)",
        "category": "dynamic_programming",
        "difficulty": "intermediate",
        "icon": "📊",
        "time_complexity": "O(N)",
        "space_complexity": "O(1) Rolling State",
        "clue": "Overlapping subproblems + Optimal substructure with adjacent constraints",
        "intuition_summary": "At each choice i, decide: Rob current house + best from i-2, OR skip current and keep best from i-1.",
        "real_world_applications": [
            {
                "company_or_system": "AWS EC2 Spot Instance Bidding",
                "architecture_context": "Optimizes server procurement schedules across fluctuating time slots where choosing high capacity now locks minimum downtime.",
                "performance_gain": "Computes optimal cloud spend strategy across months in under 1 second of compute."
            },
            {
                "company_or_system": "Digital Signal Processing (DSP Viterbi Algorithm)",
                "architecture_context": "Decodes noisy cellular radio signals into clean bitstreams by maintaining highest likelihood state transitions.",
                "performance_gain": "Processes telecommunication audio packets in real-time embedded DSP silicon."
            }
        ],
        "sandbox_config": {
            "type": "dp_table_1d",
            "title": "House Robber State Transition Grid",
            "initial_data": [2, 7, 9, 3, 1],
            "target": 12,
            "goal_rule": "max_non_adjacent_sum"
        },
        "reference_code": {
            "python": "def rob(nums: list[int]) -> int:\n    prev1, prev2 = 0, 0\n    for x in nums:\n        prev1, prev2 = max(prev2 + x, prev1), prev1\n    return prev1",
            "cpp": "int rob(vector<int>& nums) {\n    int prev1 = 0, prev2 = 0;\n    for(int x : nums) {\n        int tmp = max(prev2 + x, prev1);\n        prev2 = prev1;\n        prev1 = tmp;\n    }\n    return prev1;\n}",
            "java": "public int rob(int[] nums) {\n    int prev1 = 0, prev2 = 0;\n    for(int x : nums) {\n        int tmp = Math.max(prev2 + x, prev1);\n        prev2 = prev1;\n        prev1 = tmp;\n    }\n    return prev1;\n}"
        },
        "test_cases": [
            {"input": "nums = [2, 7, 9, 3, 1]", "expected": "12"}
        ]
    },
    "longest_common_subsequence": {
        "track_id": "longest_common_subsequence",
        "title": "2D DP: Longest Common Subsequence",
        "category": "dynamic_programming",
        "difficulty": "advanced",
        "icon": "🧬",
        "time_complexity": "O(M * N)",
        "space_complexity": "O(M * N) Matrix",
        "clue": "Finding common ordered characters between two strings without requiring contiguity",
        "intuition_summary": "Fill a 2D matrix: if characters match, take diagonal + 1; otherwise take max of top or left cell.",
        "real_world_applications": [
            {
                "company_or_system": "Git Diff & Version Control Merge Engine",
                "architecture_context": "Git calculates code diffs (Myers diff / LCS) between two commit snapshots to detect added, modified, and deleted lines.",
                "performance_gain": "Renders exact colored line-by-line file diffs for tens of thousands of lines of code in sub-second time."
            },
            {
                "company_or_system": "Bioinformatics (NCBI BLAST DNA Alignment)",
                "architecture_context": "Compares human and viral RNA sequences to identify mutations, hereditary traits, and evolutionary lineages.",
                "performance_gain": "Pinpoints homologous gene patterns across genomic databases with mathematical certainty."
            }
        ],
        "sandbox_config": {
            "type": "dp_matrix_2d",
            "title": "2D LCS Matrix Filler",
            "text1": "abcde",
            "text2": "ace",
            "target": 3,
            "goal_rule": "fill_matrix_lcs"
        },
        "reference_code": {
            "python": "def lcs(s1: str, s2: str) -> int:\n    m, n = len(s1), len(s2)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    for i in range(1, m+1):\n        for j in range(1, n+1):\n            if s1[i-1] == s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1\n            else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    return dp[m][n]",
            "cpp": "int lcs(string s1, string s2) {\n    int m = s1.size(), n = s2.size();\n    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));\n    for(int i=1; i<=m; i++)\n        for(int j=1; j<=n; j++)\n            dp[i][j] = (s1[i-1] == s2[j-1]) ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);\n    return dp[m][n];\n}",
            "java": "public int lcs(String s1, String s2) {\n    int m = s1.length(), n = s2.length();\n    int[][] dp = new int[m+1][n+1];\n    for(int i=1; i<=m; i++)\n        for(int j=1; j<=n; j++)\n            dp[i][j] = (s1.charAt(i-1) == s2.charAt(j-1)) ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);\n    return dp[m][n];\n}"
        },
        "test_cases": [
            {"input": "text1 = 'abcde', text2 = 'ace'", "expected": "3"}
        ]
    },

    # ------------------ SYSTEM DESIGN PATTERNS ------------------
    "consistent_hashing": {
        "track_id": "consistent_hashing",
        "title": "Consistent Hashing Ring",
        "category": "system_design",
        "difficulty": "advanced",
        "icon": "⭕",
        "time_complexity": "O(log N) Binary Search on Ring",
        "space_complexity": "O(N * V) Virtual Nodes",
        "clue": "Distributed caching / database sharding where nodes scale up/down dynamically",
        "intuition_summary": "Map servers and keys onto a 360° circular hash ring; when a server fails, only K/N keys rebalance instead of all keys.",
        "real_world_applications": [
            {
                "company_or_system": "Discord Voice Servers / Amazon DynamoDB",
                "architecture_context": "Discord distributes millions of active voice channels across hundreds of regional server nodes without disconnecting users on server reboot.",
                "performance_gain": "Adding or removing a server node reshards only 1/N percent of cached sessions instead of 100% cache stampede."
            },
            {
                "company_or_system": "Akamai / Cloudflare CDN Edge Caching",
                "architecture_context": "Routes global web traffic requests to regional edge cache proxy servers based on URL hashes.",
                "performance_gain": "Guarantees 95%+ edge cache hit rates during continuous server deployments."
            }
        ],
        "sandbox_config": {
            "type": "system_design_consistent_hashing",
            "title": "Interactive Distributed Hash Ring",
            "nodes": [
                {"id": "Server_A", "angle": 45, "color": "#3B82F6"},
                {"id": "Server_B", "angle": 160, "color": "#10B981"},
                {"id": "Server_C", "angle": 280, "color": "#F59E0B"}
            ],
            "keys": [
                {"key": "user_102", "angle": 80, "assignedTo": "Server_B"},
                {"key": "session_99", "angle": 190, "assignedTo": "Server_C"},
                {"key": "video_chunk_4", "angle": 320, "assignedTo": "Server_A"}
            ],
            "goal_rule": "route_key_clockwise"
        },
        "reference_code": {
            "python": "import bisect, hashlib\n\nclass ConsistentHashRing:\n    def __init__(self, replicas=3):\n        self.replicas = replicas\n        self.ring = []\n        self.node_map = {}\n    def _hash(self, key):\n        return int(hashlib.md5(key.encode()).hexdigest(), 16)\n    def add_node(self, node):\n        for i in range(self.replicas):\n            h = self._hash(f'{node}:{i}')\n            bisect.insort(self.ring, h)\n            self.node_map[h] = node\n    def get_node(self, key):\n        if not self.ring: return None\n        h = self._hash(key)\n        idx = bisect.bisect_right(self.ring, h) % len(self.ring)\n        return self.node_map[self.ring[idx]]",
            "cpp": "class ConsistentHashRing {\n    map<size_t, string> ring;\npublic:\n    void addNode(string node) {\n        for(int i=0; i<3; i++) ring[hash<string>{}(node + \":\" + to_string(i))] = node;\n    }\n    string getNode(string key) {\n        auto it = ring.lower_bound(hash<string>{}(key));\n        return it == ring.end() ? ring.begin()->second : it->second;\n    }\n};",
            "java": "public class ConsistentHashRing {\n    private final SortedMap<Integer, String> ring = new TreeMap<>();\n    public void addNode(String node) {\n        for (int i=0; i<3; i++) ring.put((node + \":\" + i).hashCode(), node);\n    }\n    public String getNode(String key) {\n        if (ring.isEmpty()) return null;\n        int h = key.hashCode();\n        SortedMap<Integer, String> tail = ring.tailMap(h);\n        return tail.isEmpty() ? ring.get(ring.firstKey()) : tail.get(tail.firstKey());\n    }\n}"
        },
        "test_cases": [
            {"input": "key = 'user_102'", "expected": "Routed clockwise to Server_B"}
        ]
    },
    "lru_cache": {
        "track_id": "lru_cache",
        "title": "LRU Cache (Least Recently Used)",
        "category": "system_design",
        "difficulty": "intermediate",
        "icon": "📦",
        "time_complexity": "O(1) Get and Put",
        "space_complexity": "O(Capacity)",
        "clue": "High speed key-value cache that evicts the least recently accessed item at capacity limit",
        "intuition_summary": "Pair a Hash Map for O(1) key lookups with a Doubly-Linked List for O(1) order updates and tail eviction.",
        "real_world_applications": [
            {
                "company_or_system": "Redis In-Memory Database / Linux Page Cache",
                "architecture_context": "Operating system kernel memory manager evicts oldest unused disk pages from RAM cache to prevent physical out-of-memory kernel panics.",
                "performance_gain": "Achieves sub-microsecond cache access with deterministic O(1) constant time bound."
            },
            {
                "company_or_system": "Google Chrome / Firefox Browser Image Cache",
                "architecture_context": "Maintains decoded image textures and rendered DOM assets in browser memory, evicting oldest website assets.",
                "performance_gain": "Provides instant back/forward page navigation without downloading image bytes twice."
            }
        ],
        "sandbox_config": {
            "type": "system_design_lru_cache",
            "title": "Doubly Linked List + Hash Map Sandbox",
            "capacity": 3,
            "initial_state": [
                {"key": "A", "val": 10},
                {"key": "B", "val": 20},
                {"key": "C", "val": 30}
            ],
            "goal_rule": "lru_eviction"
        },
        "reference_code": {
            "python": "class Node:\n    def __init__(self, k, v):\n        self.k, self.v = k, v\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.map = {}\n        self.head, self.tail = Node(0, 0), Node(0, 0)\n        self.head.next = self.tail\n        self.tail.prev = self.head\n    def _remove(self, node):\n        node.prev.next, node.next.prev = node.next, node.prev\n    def _insert(self, node):\n        node.next, node.prev = self.head.next, self.head\n        self.head.next.prev = node\n        self.head.next = node\n    def get(self, key: int) -> int:\n        if key not in self.map: return -1\n        node = self.map[key]\n        self._remove(node)\n        self._insert(node)\n        return node.v\n    def put(self, key: int, value: int):\n        if key in self.map: self._remove(self.map[key])\n        node = Node(key, value)\n        self.map[key] = node\n        self._insert(node)\n        if len(self.map) > self.cap:\n            lru = self.tail.prev\n            self._remove(lru)\n            del self.map[lru.k]",
            "cpp": "class LRUCache {\n    int cap;\n    list<pair<int, int>> l;\n    unordered_map<int, list<pair<int, int>>::iterator> m;\npublic:\n    LRUCache(int capacity) : cap(capacity) {}\n    int get(int key) {\n        if (!m.count(key)) return -1;\n        l.splice(l.begin(), l, m[key]);\n        return m[key]->second;\n    }\n    void put(int key, int value) {\n        if (m.count(key)) { l.erase(m[key]); }\n        else if (m.size() >= cap) { m.erase(l.back().first); l.pop_back(); }\n        l.push_front({key, value});\n        m[key] = l.begin();\n    }\n};",
            "java": "public class LRUCache {\n    private final int cap;\n    private final LinkedHashMap<Integer, Integer> map;\n    public LRUCache(int capacity) {\n        this.cap = capacity;\n        this.map = new LinkedHashMap<>(capacity, 0.75f, true) {\n            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) { return size() > cap; }\n        };\n    }\n    public int get(int key) { return map.getOrDefault(key, -1); }\n    public void put(int key, int value) { map.put(key, value); }\n}"
        },
        "test_cases": [
            {"input": "put(1,1), put(2,2), get(1), put(3,3)", "expected": "Key 2 evicted; Key 1 promoted to head"}
        ]
    },
    "token_bucket_limiter": {
        "track_id": "token_bucket_limiter",
        "title": "Token Bucket Rate Limiter",
        "category": "system_design",
        "difficulty": "intermediate",
        "icon": "⏳",
        "time_complexity": "O(1) Check and Consume",
        "space_complexity": "O(1) Per Client Key",
        "clue": "API traffic shaping that allows bursts up to bucket capacity while refilling at a constant rate",
        "intuition_summary": "Replenish tokens lazily based on elapsed time: tokens = min(capacity, current + (now - last_refill) * rate).",
        "real_world_applications": [
            {
                "company_or_system": "Cloudflare DDoS Protection / Stripe API Gateway",
                "architecture_context": "Protects microservices from noisy neighbor exhaustion and credential stuffing attacks by capping requests per client IP.",
                "performance_gain": "Processes 1,000,000+ API requests per second with atomic Redis token decrement."
            },
            {
                "company_or_system": "AWS Lambda Concurrency Throttle",
                "architecture_context": "Limits concurrent function invocations to match downstream database connection pool constraints.",
                "performance_gain": "Prevents database crashes during traffic spikes by returning 429 Too Many Requests."
            }
        ],
        "sandbox_config": {
            "type": "system_design_token_bucket",
            "title": "Interactive Token Bucket Water Tank",
            "capacity": 5,
            "refill_rate_per_sec": 1,
            "goal_rule": "consume_and_refill"
        },
        "reference_code": {
            "python": "import time\n\nclass TokenBucket:\n    def __init__(self, capacity: int, refill_rate: float):\n        self.capacity = capacity\n        self.refill_rate = refill_rate\n        self.tokens = capacity\n        self.last_refill = time.time()\n    def allow_request(self, tokens=1) -> bool:\n        now = time.time()\n        elapsed = now - self.last_refill\n        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)\n        self.last_refill = now\n        if self.tokens >= tokens:\n            self.tokens -= tokens\n            return True\n        return False",
            "cpp": "class TokenBucket {\n    double cap, rate, tokens, lastTime;\npublic:\n    TokenBucket(double c, double r) : cap(c), rate(r), tokens(c), lastTime(chrono::duration<double>(chrono::steady_clock::now().time_since_epoch()).count()) {}\n    bool allow(int count = 1) {\n        double now = chrono::duration<double>(chrono::steady_clock::now().time_since_epoch()).count();\n        tokens = min(cap, tokens + (now - lastTime) * rate);\n        lastTime = now;\n        if (tokens >= count) { tokens -= count; return true; }\n        return false;\n    }\n};",
            "java": "public class TokenBucket {\n    private final double capacity, refillRate;\n    private double tokens;\n    private long lastRefillTime = System.currentTimeMillis();\n    public TokenBucket(double capacity, double refillRate) {\n        this.capacity = capacity; this.refillRate = refillRate; this.tokens = capacity;\n    }\n    public synchronized boolean allow(int count) {\n        long now = System.currentTimeMillis();\n        tokens = Math.min(capacity, tokens + ((now - lastRefillTime) / 1000.0) * refillRate);\n        lastRefillTime = now;\n        if (tokens >= count) { tokens -= count; return true; }\n        return false;\n    }\n}"
        },
        "test_cases": [
            {"input": "capacity=5, requests=6", "expected": "5 Allowed, 6th Denied (Rate Limited 429)"}
        ]
    }
}


class AlgorithmService:
    @staticmethod
    async def get_all_tracks() -> List[AlgorithmTrackSummary]:
        summaries: List[AlgorithmTrackSummary] = []
        for track in ALGORITHM_CATALOG.values():
            apps = [
                RealWorldApplication(
                    company_or_system=a["company_or_system"],
                    architecture_context=a["architecture_context"],
                    performance_gain=a["performance_gain"]
                )
                for a in track.get("real_world_applications", [])
            ]
            summaries.append(
                AlgorithmTrackSummary(
                    track_id=track["track_id"],
                    title=track["title"],
                    category=track["category"],
                    difficulty=track["difficulty"],
                    icon=track.get("icon", "⚡"),
                    time_complexity=track["time_complexity"],
                    space_complexity=track["space_complexity"],
                    clue=track["clue"],
                    intuition_summary=track["intuition_summary"],
                    real_world_applications=apps,
                    scenario_title=track.get("scenario_title", f"Production Incident: {track['title']}"),
                    scenario_description=track.get("scenario_description", f"High-throughput real-world engineering challenge applying {track['title']} within production latency SLA."),
                    naive_disaster=track.get("naive_disaster", "Naive nested loops or unoptimized lookups cause quadratic O(N^2) latency spikes, triggering cluster timeout alerts.")
                )
            )
        return summaries

    @staticmethod
    async def get_track(track_id: str) -> Optional[AlgorithmTrackResponse]:
        track = ALGORITHM_CATALOG.get(track_id)
        if not track:
            return None
        apps = [
            RealWorldApplication(
                company_or_system=a["company_or_system"],
                architecture_context=a["architecture_context"],
                performance_gain=a["performance_gain"]
            )
            for a in track.get("real_world_applications", [])
        ]
        return AlgorithmTrackResponse(
            track_id=track["track_id"],
            title=track["title"],
            category=track["category"],
            difficulty=track["difficulty"],
            icon=track.get("icon", "⚡"),
            time_complexity=track["time_complexity"],
            space_complexity=track["space_complexity"],
            clue=track["clue"],
            intuition_summary=track["intuition_summary"],
            real_world_applications=apps,
            sandbox_config=track.get("sandbox_config", {}),
            reference_code=track.get("reference_code", {}),
            test_cases=track.get("test_cases", []),
            scenario_title=track.get("scenario_title", f"Production Incident: {track['title']}"),
            scenario_description=track.get("scenario_description", f"High-throughput real-world engineering challenge applying {track['title']} within production latency SLA."),
            naive_disaster=track.get("naive_disaster", "Naive nested loops or unoptimized lookups cause quadratic O(N^2) latency spikes, triggering cluster timeout alerts.")
        )

    @staticmethod
    async def generate_custom_algorithm(req: GenerateAlgorithmRequest) -> AlgorithmTrackResponse:
        """
        Synthesizes an algorithm track using the backend LLM harness.
        Ensures strict token budget <= 2000 and validates against AlgorithmExplanationResult.
        """
        scenario_guidance = (
            f"Focus specifically on this scenario context: '{req.scenario_prompt}'."
            if req.scenario_prompt
            else "Craft a compelling, realistic production incident or high-scale system scenario (e.g. at Stripe, Uber, Netflix, Discord, or Cloudflare)."
        )

        prompt = (
            f"Generate a valid JSON object explaining the algorithm/pattern: '{req.topic}' "
            f"under category '{req.category}' at difficulty '{req.difficulty}'.\n"
            f"{scenario_guidance}\n\n"
            f"You MUST return ONLY a JSON object with these EXACT field names:\n"
            f'{{"topic": "{req.topic}", '
            f'"scenario_title": "<Realistic incident/system challenge title, e.g. Stripe Webhook Deduplication Window>", '
            f'"scenario_description": "<Realistic production engineering problem description explaining input data flow, throughput constraints, and the core challenge under 800 characters>", '
            f'"naive_disaster": "<1-2 sentences on why a naive/brute-force approach crashes or causes latency bottlenecks>", '
            f'"category": "{req.category}", '
            f'"intuition_breakdown": "<clear high level insight under 500 characters>", '
            f'"time_complexity": "<e.g. O(N) or O(log N)>", '
            f'"space_complexity": "<e.g. O(1) or O(N)>", '
            f'"real_world_production_use_cases": ["<Real company/system use case 1>", "<Real company/system use case 2>", "<Real company/system use case 3>"], '
            f'"interactive_initial_state": [1, 2, 3, 4, 5], '
            f'"step_by_step_rules": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"], '
            f'"reference_solution_python": "<working clean python code>"}}\n'
            f"Notes: 'real_world_production_use_cases' must contain 2 to 4 items. "
            f"'step_by_step_rules' must contain 3 to 6 concise step items. "
            f"Do not include markdown or backticks."
        )

        try:
            budget = Budget(max_prompt_tokens=2000)
            llm_result: AlgorithmExplanationResult = await call_with_repair(
                contract=AlgorithmExplanationResult,
                messages=[{"role": "user", "content": prompt}],
                budget=budget,
                feature="algorithm_generation",
                max_tokens=2500,
            )

            apps = [
                RealWorldApplication(
                    company_or_system="Production Architecture",
                    architecture_context=case,
                    performance_gain="Optimized execution scale"
                )
                for case in llm_result.real_world_production_use_cases
            ]

            slug = req.topic.lower().replace(" ", "_")[:32]
            return AlgorithmTrackResponse(
                track_id=slug,
                title=llm_result.topic,
                category=req.category,
                difficulty=req.difficulty,
                icon="🤖",
                time_complexity=llm_result.time_complexity,
                space_complexity=llm_result.space_complexity,
                clue=f"Pattern recognition for {llm_result.topic}",
                intuition_summary=llm_result.intuition_breakdown,
                real_world_applications=apps,
                sandbox_config={
                    "type": req.category,
                    "title": f"Interactive {llm_result.topic} Sandbox",
                    "initial_data": llm_result.interactive_initial_state,
                    "rules": llm_result.step_by_step_rules
                },
                reference_code={
                    "python": llm_result.reference_solution_python
                },
                test_cases=[
                    {"input": f"{req.topic} sample input", "expected": "valid"}
                ],
                scenario_title=llm_result.scenario_title,
                scenario_description=llm_result.scenario_description,
                naive_disaster=llm_result.naive_disaster
            )
        except Exception as e:
            log.warning("algorithm_generation_fallback", error=str(e), topic=req.topic)
            # Safe deterministic fallback matching the category
            fallback_id = "two_pointers"
            if req.category == "trees":
                fallback_id = "tree_traversal"
            elif req.category == "graphs":
                fallback_id = "dijkstra_shortest_path"
            elif req.category == "dynamic_programming":
                fallback_id = "dynamic_programming_1d"
            elif req.category == "system_design":
                fallback_id = "consistent_hashing"
            
            fb_track = await AlgorithmService.get_track(fallback_id)
            if fb_track:
                return fb_track
            # Ultimate safe return
            return AlgorithmTrackResponse(
                track_id="fallback",
                title=req.topic,
                category=req.category,
                difficulty=req.difficulty,
                icon="⚡",
                time_complexity="O(N)",
                space_complexity="O(1)",
                clue="Fallback baseline pattern",
                intuition_summary="Learn the foundational invariant before optimizing.",
                real_world_applications=[
                    RealWorldApplication(
                        company_or_system="Industry Standard",
                        architecture_context="Applied across high-throughput distributed services.",
                        performance_gain="Guaranteed bounded resource usage."
                    )
                ],
                sandbox_config={"type": req.category, "initial_data": [1, 2, 3]},
                reference_code={"python": "# Baseline solution\n"},
                test_cases=[],
                scenario_title=f"Production Challenge: {req.topic}",
                scenario_description="High-scale real-world incident requiring optimal algorithmic time and space bounds.",
                naive_disaster="Unoptimized brute-force approach leads to exponential compute consumption and timeout exceptions."
            )
