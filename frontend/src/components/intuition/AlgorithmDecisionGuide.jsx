import React, { useState } from "react";
import { Compass, Lightbulb, CheckCircle2, ArrowRight, Zap, Target, HelpCircle, ShieldCheck } from "lucide-react";

export default function AlgorithmDecisionGuide({ category, onCompleteStage }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const ALGORITHM_PATTERNS = [
    {
      name: "Two Pointers (Inward Squeeze)",
      clue: "Array is SORTED + Need to find pairs or triplets meeting a sum or condition",
      solves: "Eliminates O(N²) nested loops by moving left/right inward based on sum comparison",
      complexity: "Time: O(N) | Space: O(1)",
      badge: "In-Place Champion"
    },
    {
      name: "Sliding Window",
      clue: "Contiguous Subarray or Substring + Window of fixed size K or dynamic max/min length",
      solves: "Eliminates re-summing sub-arrays by adding the incoming element and subtracting the outgoing element",
      complexity: "Time: O(N) | Space: O(1) or O(K)",
      badge: "Continuous Stream Master"
    },
    {
      name: "Stack (LIFO / Monotonic)",
      clue: "Nested structures (brackets), undo operations, or 'Next Greater / Smaller Element'",
      solves: "Eliminates backwards search by remembering the most recent unmatched elements in Last-In-First-Out order",
      complexity: "Time: O(N) | Space: O(N)",
      badge: "Nesting Guardian"
    },
    {
      name: "Binary Search",
      clue: "Array is SORTED + Need to find an element or threshold in logarithmic time",
      solves: "Divides search range by half on each step instead of checking one-by-one",
      complexity: "Time: O(log N) | Space: O(1)",
      badge: "Logarithmic Sniper"
    }
  ];

  const handleQuizSelect = (ans) => {
    setSelectedAnswer(ans);
    setShowFeedback(true);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5 font-mono">
              🧭 Step 2: Which Algorithm to Use & Why?
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">The Algorithm Selector Blueprint</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Learn how to recognize the clues in any problem description to instantly pick the right algorithm.
          </p>
        </div>

        <button
          onClick={onCompleteStage}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95 text-xs"
        >
          Apply Algorithm in Sandbox <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1. What are we optimizing? */}
      <div className="bg-indigo-950/30 rounded-2xl border border-indigo-500/30 p-6 mb-8">
        <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase font-mono font-bold mb-2">
          <Lightbulb className="w-4 h-4 text-amber-400" /> The Core Revelation (What does the algorithm fix?)
        </div>
        <h4 className="text-lg font-bold text-white mb-2">Why can we skip 99% of nested checks?</h4>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          In the brute force method, when Left is at <code>2</code> and Right is at <code>18</code>, their sum is <code>20</code> (which is greater than 18).
          Because the array is <strong>already sorted</strong>, testing <code>4 + 18</code> or <code>7 + 18</code> is completely pointless because they will be even larger than 20!
          By moving the <strong>Right pointer inward</strong>, we eliminate thousands of useless pairs in a single decision!
        </p>
      </div>

      {/* 2. Algorithm Pattern Decision Cheat Sheet */}
      <div className="mb-8">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-4">
          <Compass className="w-4 h-4 text-indigo-400" /> Algorithm Recognition Matrix
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALGORITHM_PATTERNS.map((pat, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                pat.name.toLowerCase().includes(category?.toLowerCase() || "two pointers")
                  ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10"
                  : "bg-slate-950/70 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> {pat.name}
                </span>
                <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {pat.complexity}
                </span>
              </div>

              <div className="text-xs text-slate-300 mb-2">
                <strong className="text-indigo-400">Problem Clue:</strong> {pat.clue}
              </div>

              <div className="text-[11px] text-slate-400">
                <strong className="text-slate-300">Why it works:</strong> {pat.solves}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive Pattern Recognition Check */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 text-xs uppercase font-mono font-bold text-amber-400 mb-2">
          <HelpCircle className="w-4 h-4" /> Quick Pattern Check
        </div>
        <h4 className="text-sm font-bold text-white mb-4">
          "Given a SORTED array of integers, find two numbers that sum up to K in $O(1)$ auxiliary space. Which algorithm must you choose?"
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { id: "hash", label: "Hash Map / Dictionary", desc: "Takes O(N) extra memory" },
            { id: "two_pointers", label: "Two Pointers (Left & Right)", desc: "Takes O(N) time and O(1) in-place memory", correct: true },
            { id: "nested", label: "Nested For Loops", desc: "Slow O(N²) time" }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleQuizSelect(opt)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedAnswer?.id === opt.id
                  ? opt.correct
                    ? "border-emerald-500 bg-emerald-950/60 text-emerald-200"
                    : "border-rose-500 bg-rose-950/60 text-rose-200"
                  : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="font-bold text-xs">{opt.label}</div>
              <div className="text-[10px] text-slate-500 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>

        {showFeedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              selectedAnswer?.correct
                ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
                : "bg-rose-950/50 border-rose-500/50 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {selectedAnswer?.correct ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <HelpCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              <span>
                {selectedAnswer?.correct
                  ? "🎯 Exactly correct! Because the array is already sorted, Two Pointers gives optimal O(N) time with O(1) in-place memory without needing an extra Hash Map!"
                  : "Not quite. Remember: If the array is already sorted and we want O(1) space, Two Pointers is the optimal choice!"}
              </span>
            </div>

            {selectedAnswer?.correct && (
              <button
                onClick={onCompleteStage}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shrink-0 text-xs shadow"
              >
                Launch Sandbox ➔
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
