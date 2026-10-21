import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Flame,
  Building2,
  Compass,
  Cpu,
  Layers,
  Network,
  Zap,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";

export default function AlgorithmMasteryWidget() {
  const pathways = [
    {
      id: "system_design",
      track_id: "consistent_hashing",
      title: "Consistent Hashing Ring",
      domain: "System Design",
      company: "Amazon DynamoDB / Discord",
      complexity: "O(log N) Ring",
      rule: "Virtual nodes prevent hotspot cascades when servers reboot.",
      icon: "🪐",
      color: "border-indigo-500/30 text-indigo-300 bg-indigo-500/10",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
    },
    {
      id: "trees",
      track_id: "tree_traversal",
      title: "Binary Tree BFS & DFS",
      domain: "Trees & Hierarchies",
      company: "React Fiber Virtual DOM",
      complexity: "O(N) Traversal",
      rule: "Prioritize subtree diffing tasks before committing minimal DOM patches.",
      icon: "🌲",
      color: "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
    },
    {
      id: "graphs",
      track_id: "dijkstra_shortest_path",
      title: "Dijkstra's Shortest Path",
      domain: "Graphs & Routing",
      company: "Google Maps / Uber Fleet",
      complexity: "O((V+E) log V)",
      rule: "Greedily relax shortest edge costs via priority queue.",
      icon: "🗺️",
      color: "border-cyan-500/30 text-cyan-300 bg-cyan-500/10",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
    },
    {
      id: "dynamic_programming",
      track_id: "dynamic_programming_1d",
      title: "1D State Transitions",
      domain: "Dynamic Programming",
      company: "AWS EC2 Spot Bidding",
      complexity: "O(N) Time / O(1) Space",
      rule: "Memoize overlapping subproblems with rolling constant memory.",
      icon: "📊",
      color: "border-purple-500/30 text-purple-300 bg-purple-500/10",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40"
    },
    {
      id: "arrays",
      track_id: "two_pointers",
      title: "Two Pointers Squeeze",
      domain: "Arrays & Pointers",
      company: "Netflix Video Bitrate Stream",
      complexity: "O(N) Linear Time",
      rule: "Squeeze sorted bounds inward to eliminate O(N²) nested loops.",
      icon: "🎯",
      color: "border-blue-500/30 text-blue-300 bg-blue-500/10",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40"
    }
  ];

  return (
    <div className="p-6 cc-card flex flex-col gap-6 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 shadow-2xl relative overflow-hidden">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-1">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Applied Algorithm Machinery & System Design
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight heading-font">
            Interactive Visual Machinery & Production Case Studies
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Bridge the gap between sterile LeetCode puzzles and real-world high-throughput engineering at Netflix, Stripe, Discord, and Google.
          </p>
        </div>

        <Link
          to="/algorithms"
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all transform active:scale-95 flex-shrink-0"
        >
          Explore All Pathways <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Featured Production Incident Spotlight */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border border-amber-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-amber-400" />
                Featured Sev-1 Incident Challenge
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Stripe Ingestion Pipeline</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Stripe Webhook Velocity Filter & Card-Testing Attack Mitigation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Detect automated fraud velocity spikes in thousands of low-dollar transactions using a rolling 60-second window in O(1) memory before queue backpressure drops legitimate checkouts.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-rose-300 bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span><strong>The Disaster:</strong> Scanning past history produces quadratic O(N²) lockups, triggering cluster timeout alerts.</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto flex-shrink-0">
            <Link
              to="/algorithms/sliding_window"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              Simulate Incident Sandbox <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/algorithms"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Synthesize Custom AI Scenario
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Core Invariant Domain Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Core Spatial Invariants & Machinery
          </div>
          <span className="text-[11px] text-slate-500">5 Foundational Architectural Domains</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {pathways.map((p) => (
            <Link
              key={p.id}
              to={`/algorithms/${p.track_id}`}
              className="group p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{p.icon}</span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                    {p.complexity}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">{p.domain}</div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mt-0.5">
                  {p.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  {p.rule}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Building2 className="w-3 h-3 text-blue-400" />
                  <span className="truncate max-w-[150px] font-medium text-slate-300">{p.company}</span>
                </div>
                <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Launch <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
