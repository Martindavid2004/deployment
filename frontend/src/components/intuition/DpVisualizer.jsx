import React, { useState } from "react";
import { Play, RotateCcw, ChevronRight, CheckCircle2, Sparkles, Database } from "lucide-react";

export function DpVisualizer({ config, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dpTable, setDpTable] = useState([0, 0, 0, 0, 0]);
  const [explanation, setExplanation] = useState("Initialize DP table with base states.");
  const [isDone, setIsDone] = useState(false);

  const houses = config?.initial_data || [2, 7, 9, 3, 1];

  const steps = [
    {
      idx: 0,
      table: [2, 0, 0, 0, 0],
      note: "House 0 ($2): Only one house to rob. Base case: dp[0] = 2."
    },
    {
      idx: 1,
      table: [2, 7, 0, 0, 0],
      note: "House 1 ($7): Choose max(dp[0] = 2, house[1] = 7). dp[1] = 7."
    },
    {
      idx: 2,
      table: [2, 7, 11, 0, 0],
      note: "House 2 ($9): Compare skip (dp[1]=7) vs rob (dp[0]+9 = 11). Max is 11!"
    },
    {
      idx: 3,
      table: [2, 7, 11, 11, 0],
      note: "House 3 ($3): Compare skip (dp[2]=11) vs rob (dp[1]+3 = 10). Max is 11!"
    },
    {
      idx: 4,
      table: [2, 7, 11, 11, 12],
      note: "House 4 ($1): Compare skip (dp[3]=11) vs rob (dp[2]+1 = 12). Max is 12! Optimal Answer."
    }
  ];

  const handleStep = () => {
    if (currentIdx < steps.length) {
      const s = steps[currentIdx];
      setDpTable(s.table);
      setExplanation(s.note);
      setCurrentIdx(currentIdx + 1);

      if (currentIdx + 1 === steps.length) {
        setIsDone(true);
        if (onComplete) onComplete();
      }
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setDpTable([0, 0, 0, 0, 0]);
    setExplanation("Table reset. Press 'Compute Next State' to observe memoized subproblem transitions.");
    setIsDone(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold">
            <Database className="w-3.5 h-3.5" /> Dynamic Programming Tabulation Machinery
          </div>
          <h3 className="text-xl font-black text-white mt-2">
            {config?.title || "1D DP State Transitions: House Robber"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Observe the recurrence relation: <code className="text-purple-300 font-mono">dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code> avoiding repeated recursion in O(N) time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleStep}
            disabled={isDone}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/25 transition-all"
          >
            <Play className="w-3.5 h-3.5" /> Compute Next State <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Input Array Row */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase text-slate-500">Input Array (House Values):</div>
        <div className="grid grid-cols-5 gap-3">
          {houses.map((val, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-center transition-all ${
                currentIdx > idx
                  ? "bg-purple-950/40 border-purple-500/50 text-white shadow-lg shadow-purple-500/10"
                  : "bg-slate-950 border-slate-800 text-slate-400"
              }`}
            >
              <div className="text-[10px] font-mono text-slate-500">idx: {idx}</div>
              <div className="text-xl font-black font-mono mt-1">${val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabulation DP Memory Table */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase text-slate-500">Memoized DP State Array:</div>
        <div className="grid grid-cols-5 gap-3">
          {dpTable.map((val, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-center transition-all ${
                val > 0
                  ? "bg-purple-600 text-white border-purple-400 shadow-xl shadow-purple-600/30 scale-105"
                  : "bg-slate-950 border-slate-800/80 text-slate-600"
              }`}
            >
              <div className="text-[10px] font-mono text-slate-300">dp[{idx}]</div>
              <div className="text-xl font-black font-mono mt-1">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recurrence Explanation Box */}
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-300 font-mono leading-relaxed">
          <span className="font-bold text-purple-400">Step {currentIdx}:</span> {explanation}
        </div>
        {isDone && (
          <div className="bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-bounce whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-purple-400" /> Optimal DP Value: $12
          </div>
        )}
      </div>
    </div>
  );
}
export default DpVisualizer;
