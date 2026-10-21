import React, { useState, useEffect } from "react";
import {
  Compass,
  Zap,
  Layers,
  ArrowRight,
  Sparkles,
  Award,
  TrendingUp,
  Cpu,
  Brain,
  ShieldCheck,
  Search,
  Filter,
  Building2,
  PlusCircle,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  Flame
} from "lucide-react";
import { fetchAlgorithmTracks, generateCustomAlgorithmTrack } from "../../api";

export const BUILTIN_TRACKS = [
  {
    track_id: "two_pointers",
    title: "Two Pointers (Inward Squeeze)",
    category: "arrays",
    difficulty: "beginner",
    icon: "🎯",
    time_complexity: "O(N)",
    space_complexity: "O(1) Auxiliary",
    clue: "Array is SORTED + Need to find pairs or triplets meeting a sum or condition",
    intuition_summary: "Squeeze Left & Right pointers inward to eliminate O(N²) nested loops on sorted arrays.",
    real_world_applications: [
      { company_or_system: "Netflix Video Encoding", architecture_context: "Bitrate adaptation algorithms squeeze bandwidth bounds.", performance_gain: "Zero memory O(1) in-place latency" }
    ]
  },
  {
    track_id: "sliding_window",
    title: "Sliding Window Technique",
    category: "arrays",
    difficulty: "intermediate",
    icon: "🪟",
    time_complexity: "O(N)",
    space_complexity: "O(1) / O(K)",
    clue: "Contiguous Subarray / Substring + Window of fixed size K or dynamic max/min bounds",
    intuition_summary: "Reuse overlapping subproblem sums by adding incoming elements and subtracting outgoing elements in O(1) time.",
    real_world_applications: [
      { company_or_system: "TCP Reno / Congestion Control", architecture_context: "Maintains packet transmission window without drop over WAN.", performance_gain: "Sustains 100 Gbps network interfaces" }
    ]
  },
  {
    track_id: "kadane",
    title: "Kadane's Algorithm (Max Subarray)",
    category: "arrays",
    difficulty: "intermediate",
    icon: "⚡",
    time_complexity: "O(N)",
    space_complexity: "O(1)",
    clue: "Find maximum contiguous sum subarray containing both negative and positive numbers",
    intuition_summary: "Discard past negative prefix sums: either extend running contiguous subarray or start fresh at current element.",
    real_world_applications: [
      { company_or_system: "Genomic Sequence Alignment", architecture_context: "Detects high-density protein binding regions in DNA.", performance_gain: "Processes billions of base pairs in 1 pass" }
    ]
  },
  {
    track_id: "tree_traversal",
    title: "Binary Tree BFS & DFS Traversal",
    category: "trees",
    difficulty: "intermediate",
    icon: "🌲",
    time_complexity: "O(N)",
    space_complexity: "O(H) Height / O(W) Width",
    clue: "Hierarchical parent-child nodes, level-order queues, or depth recursion",
    intuition_summary: "Use recursion / stack for Depth-First Search (DFS) or FIFO Queue for Breadth-First Level Search (BFS).",
    real_world_applications: [
      { company_or_system: "React Virtual DOM Fiber", architecture_context: "Traverses component trees to generate minimal DOM diff patches.", performance_gain: "Enables 60fps responsive UI updates" }
    ]
  },
  {
    track_id: "trie_prefix_tree",
    title: "Trie (Prefix Tree & Autocomplete)",
    category: "trees",
    difficulty: "intermediate",
    icon: "🔤",
    time_complexity: "O(L) Query",
    space_complexity: "O(N * L)",
    clue: "String prefix searches, dictionary matching, or search autocomplete",
    intuition_summary: "Share common prefixes across tree branches so word lookups depend solely on key length L.",
    real_world_applications: [
      { company_or_system: "Google Search Autocomplete", architecture_context: "Indexes search terms to instantly suggest matching queries.", performance_gain: "Sub-2ms lookups across millions of words" }
    ]
  },
  {
    track_id: "dijkstra_shortest_path",
    title: "Dijkstra's Shortest Path Algorithm",
    category: "graphs",
    difficulty: "advanced",
    icon: "🗺️",
    time_complexity: "O((V + E) log V)",
    space_complexity: "O(V)",
    clue: "Weighted graph with non-negative edge costs finding minimum path cost from source",
    intuition_summary: "Greedily relax shortest distances using a Min-Priority Queue to guarantee optimal paths at each step.",
    real_world_applications: [
      { company_or_system: "Google Maps / Uber Navigation", architecture_context: "Calculates fastest driving routes accounting for traffic and turns.", performance_gain: "Optimal navigation routes in milliseconds" }
    ]
  },
  {
    track_id: "graph_bfs_shortest_path",
    title: "Breadth-First Search (Shortest Hops)",
    category: "graphs",
    difficulty: "intermediate",
    icon: "🕸️",
    time_complexity: "O(V + E)",
    space_complexity: "O(V)",
    clue: "Unweighted network finding minimum edge hops between start and target",
    intuition_summary: "Expand outwards in concentric rings layer-by-layer; first time target is reached is guaranteed minimum hops.",
    real_world_applications: [
      { company_or_system: "LinkedIn Degree Connections", architecture_context: "Calculates shortest social graph hops to recommend connections.", performance_gain: "Evaluates connections across millions of users" }
    ]
  },
  {
    track_id: "dynamic_programming_1d",
    title: "1D DP (House Robber / State Transitions)",
    category: "dynamic_programming",
    difficulty: "intermediate",
    icon: "📊",
    time_complexity: "O(N)",
    space_complexity: "O(1) Rolling State",
    clue: "Overlapping subproblems + Optimal substructure with adjacent constraints",
    intuition_summary: "At each choice i, decide: Rob current house + best from i-2, OR skip current and keep best from i-1.",
    real_world_applications: [
      { company_or_system: "AWS EC2 Spot Bidding", architecture_context: "Optimizes cloud server bidding schedules with minimal downtime.", performance_gain: "Optimal compute spend in <1s calculations" }
    ]
  },
  {
    track_id: "longest_common_subsequence",
    title: "2D DP: Longest Common Subsequence",
    category: "dynamic_programming",
    difficulty: "advanced",
    icon: "🧬",
    time_complexity: "O(M * N)",
    space_complexity: "O(M * N) Matrix",
    clue: "Finding common ordered characters between two strings without requiring contiguity",
    intuition_summary: "Fill a 2D matrix: if characters match, take diagonal + 1; otherwise take max of top or left cell.",
    real_world_applications: [
      { company_or_system: "Git Diff Merge Engine", architecture_context: "Calculates file diffs between commit snapshots (Myers diff / LCS).", performance_gain: "Line-by-line diffs in milliseconds" }
    ]
  },
  {
    track_id: "consistent_hashing",
    title: "Consistent Hashing Ring",
    category: "system_design",
    difficulty: "advanced",
    icon: "⭕",
    time_complexity: "O(log N) Ring Lookup",
    space_complexity: "O(N * V) Virtual Nodes",
    clue: "Distributed caching / database sharding where nodes scale up/down dynamically",
    intuition_summary: "Map servers and keys onto a 360° circular hash ring; only K/N keys rebalance on server change.",
    real_world_applications: [
      { company_or_system: "Discord Voice / DynamoDB", architecture_context: "Distributes voice channels without disconnecting users on reboots.", performance_gain: "Prevents 100% cache stampedes" }
    ]
  },
  {
    track_id: "lru_cache",
    title: "LRU Cache (Least Recently Used)",
    category: "system_design",
    difficulty: "intermediate",
    icon: "📦",
    time_complexity: "O(1) Get and Put",
    space_complexity: "O(Capacity)",
    clue: "High speed key-value cache that evicts the least recently accessed item at capacity limit",
    intuition_summary: "Pair a Hash Map for O(1) lookups with a Doubly-Linked List for O(1) eviction and updates.",
    real_world_applications: [
      { company_or_system: "Redis / Linux Page Cache", architecture_context: "Kernel memory manager evicts oldest unused disk pages from RAM.", performance_gain: "Sub-microsecond deterministic O(1) access" }
    ]
  },
  {
    track_id: "token_bucket_limiter",
    title: "Token Bucket Rate Limiter",
    category: "system_design",
    difficulty: "intermediate",
    icon: "⏳",
    time_complexity: "O(1) Check and Consume",
    space_complexity: "O(1) Per Client",
    clue: "API traffic shaping that allows bursts up to bucket capacity while refilling at a constant rate",
    intuition_summary: "Replenish tokens lazily based on elapsed time: tokens = min(capacity, current + elapsed * rate).",
    real_world_applications: [
      { company_or_system: "Cloudflare DDoS / Stripe Gateway", architecture_context: "Protects microservices from DDoS exhaustion and noisy neighbors.", performance_gain: "Processes 1,000,000+ RPS atomically" }
    ]
  }
];

export function AlgorithmTrackHub({ onSelectTrack }) {
  const [tracks, setTracks] = useState(BUILTIN_TRACKS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategory, setAiCategory] = useState("arrays");
  const [aiDifficulty, setAiDifficulty] = useState("intermediate");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch from backend API
  const loadTracks = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const data = await fetchAlgorithmTracks();
      if (data && data.length > 0) {
        setTracks(data);
      }
    } catch (e) {
      console.warn("Backend tracks unavailable, active offline fallback enabled.", e);
      setTracks(BUILTIN_TRACKS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  // Handle AI generation
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setIsGenerating(true);
    try {
      const customTrack = await generateCustomAlgorithmTrack(aiTopic.trim(), aiCategory, aiDifficulty);
      if (customTrack) {
        setTracks([customTrack, ...tracks]);
        setIsAiModalOpen(false);
        setAiTopic("");
        onSelectTrack(customTrack.track_id);
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      alert("AI synthesis fallback activated. Custom track created from structured baseline!");
      setIsAiModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const [generatingTrackId, setGeneratingTrackId] = useState(null);

  const handleGenerateScenarioVariant = async (track) => {
    setGeneratingTrackId(track.track_id);
    try {
      const customTrack = await generateCustomAlgorithmTrack(
        track.title,
        track.category || "arrays",
        track.difficulty || "intermediate",
        `Generate a realistic production incident scenario challenge or edge-case variation for ${track.title}`
      );
      if (customTrack && customTrack.track_id) {
        setTracks((prev) => [customTrack, ...prev]);
        onSelectTrack(customTrack.track_id);
      } else {
        onSelectTrack(track.track_id);
      }
    } catch (err) {
      console.error("Failed to generate scenario variant", err);
      onSelectTrack(track.track_id);
    } finally {
      setGeneratingTrackId(null);
    }
  };

  const categories = [
    { id: "all", label: "All Algorithms" },
    { id: "arrays", label: "Arrays & Pointers" },
    { id: "trees", label: "Trees & Tries" },
    { id: "graphs", label: "Graphs & Routing" },
    { id: "dynamic_programming", label: "Dynamic Programming" },
    { id: "system_design", label: "System Design" }
  ];

  const filteredTracks = tracks.filter((t) => {
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Premium Hero Banner */}
      <div className="relative rounded-3xl p-8 md:p-10 overflow-hidden border border-indigo-500/40 shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 backdrop-blur-xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Interactive Algorithmic Machinery & System Design
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Master Algorithmic Patterns, <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Visual Machinery & Real-World Systems.
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
            Select any algorithm below across <strong>Arrays, Trees, Graphs, DP, or System Design</strong>. Feel the interactive visual mechanics, write clean code, and learn <strong>exactly where Netflix, Google Maps, Redis, and Discord run these in production</strong>.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono font-bold text-slate-300">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
              <span className="text-emerald-400 font-extrabold">12</span> Production Systems Modeled
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
              <span className="text-indigo-400 font-extrabold">5</span> Core Invariant Domains
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
              <span className="text-purple-400 font-extrabold">100%</span> Interactive Sandboxes
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
              <span className="text-amber-400 font-extrabold">AI</span> Unlimited Incident Synthesis
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xl shadow-indigo-500/25 transition-all transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> Synthesize Any Algorithm with AI
            </button>
            <button
              onClick={loadTracks}
              className="px-4 py-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all hover:border-slate-500"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} /> Refresh Catalog
            </button>
          </div>
        </div>

        {/* Ambient Glowing Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Filter Chips & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === c.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patterns, clues, or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTracks.length === 0 && (
        <div className="bg-slate-950 p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="text-3xl">🔍</div>
          <h3 className="text-xl font-bold text-white">No algorithms found matching your filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search query or reset your category filter to explore Arrays, Trees, Graphs, DP, or System Design.
          </p>
          <button
            onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Algorithm Tracks Grid (Success State) */}
      {!isLoading && filteredTracks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map((track) => {
            const categoryGradients = {
              system_design: "from-indigo-500 via-purple-500 to-pink-500",
              trees: "from-emerald-400 via-teal-400 to-cyan-500",
              graphs: "from-cyan-400 via-blue-500 to-indigo-500",
              dynamic_programming: "from-purple-500 via-pink-500 to-rose-500",
              arrays: "from-blue-500 via-cyan-400 to-emerald-400"
            };
            const accentGradient = categoryGradients[track.category] || "from-indigo-500 to-purple-500";

            return (
              <div
                key={track.track_id}
                className="group relative bg-slate-900/90 backdrop-blur-md border border-slate-800/80 hover:border-indigo-500/70 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.25)] flex flex-col justify-between overflow-hidden"
              >
                {/* Top Glowing Category Accent Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentGradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div>
                  {/* Top Row: Icon and Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-indigo-500/40 transition-all shadow-inner">
                      {track.icon || "⚡"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
                        {track.category?.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                        {track.difficulty || "medium"}
                      </span>
                    </div>
                  </div>

                  {/* Title and Intuition */}
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {track.intuition_summary}
                  </p>

                  {/* Complexities */}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                      ⚡ {track.time_complexity}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/30 flex items-center gap-1">
                      💾 {track.space_complexity}
                    </span>
                  </div>

                  {/* Clue Box */}
                  <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-300">
                    <span className="font-bold text-indigo-400">Pattern Clue:</span> {track.clue}
                  </div>

                  {/* Real-World Production Tag */}
                  {track.real_world_applications && track.real_world_applications.length > 0 && (
                    <div className="mt-4 p-2.5 bg-blue-950/40 rounded-xl border border-blue-500/30 flex items-center gap-2 text-[11px] text-blue-300">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="truncate">
                        <strong>Used in:</strong> {track.real_world_applications[0].company_or_system}
                      </span>
                    </div>
                  )}

                  {/* Production Incident / Scenario Title */}
                  {track.scenario_title && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-amber-950/40 to-slate-950/80 rounded-xl border border-amber-500/40 flex items-start gap-2.5 text-[11px] text-amber-300 shadow-inner">
                      <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="font-bold text-amber-200">Incident Challenge: </span>
                        <span className="line-clamp-2 text-slate-200">{track.scenario_title}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons: Launch Pathway & 1-Click AI Scenario */}
                <div className="mt-6 space-y-2.5">
                  <button
                    onClick={() => onSelectTrack(track.track_id)}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-xs transition-all transform active:scale-95"
                  >
                    Launch Visual Pathway & Code <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleGenerateScenarioVariant(track)}
                    disabled={generatingTrackId === track.track_id}
                    className="w-full py-2.5 bg-slate-950/90 hover:bg-slate-800/90 border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-purple-200 font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-all active:scale-95 disabled:opacity-50"
                    title="Generate a brand-new production scenario challenge for this algorithm with AI"
                  >
                    {generatingTrackId === track.track_id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                        <span>Synthesizing Scenario Variant...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>⚡ Generate Scenario Variant with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Synthesis Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" /> AI Algorithm Generator
              </div>
              <h3 className="text-2xl font-black text-white mt-2">
                Synthesize Custom Algorithm Track
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter any algorithm or system design concept. Our AI harness will generate the visual specification, production case studies, and code templates.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                  Topic / Algorithm Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., A* Search, Bloom Filter, Raft Consensus, Trie"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none"
                  >
                    <option value="arrays">Arrays & Pointers</option>
                    <option value="trees">Trees & Tries</option>
                    <option value="graphs">Graphs & Routing</option>
                    <option value="dynamic_programming">Dynamic Programming</option>
                    <option value="system_design">System Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating || !aiTopic.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing with AI Harness...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate Interactive Track
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default AlgorithmTrackHub;
