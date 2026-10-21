import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, AlertTriangle, ArrowRight, Code2, FastForward, Info } from "lucide-react";

export default function BruteForceViewer({ config, onCompleteStage }) {
  const data = config?.initial_data || [2, 4, 7, 11, 15, 18];
  const target = config?.target || 18;

  const [iIdx, setIIdx] = useState(0);
  const [jIdx, setJIdx] = useState(1);
  const [operationsCount, setOperationsCount] = useState(1);
  const [isFound, setIsFound] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [explanation, setExplanation] = useState("Line 2 & 3: Outer loop i=0 (val: 2), Inner loop j=1 (val: 4). Checking 2 + 4 = 6.");

  const totalPossiblePairs = Math.floor((data.length * (data.length - 1)) / 2);

  // Step brute force forward (i, j)
  const stepBruteForce = () => {
    if (isFound) return;

    let nextI = iIdx;
    let nextJ = jIdx + 1;

    if (nextJ >= data.length) {
      nextI = iIdx + 1;
      nextJ = nextI + 1;
    }

    if (nextI >= data.length - 1) {
      // Finished all checks
      setIsAutoPlaying(false);
      return;
    }

    setIIdx(nextI);
    setJIdx(nextJ);
    setOperationsCount((prev) => prev + 1);

    const sum = data[nextI] + data[nextJ];
    if (sum === target) {
      setIsFound(true);
      setIsAutoPlaying(false);
      setExplanation(`🎯 Match found! nums[${nextI}] (${data[nextI]}) + nums[${nextJ}] (${data[nextJ]}) = ${target}. But it took ${operationsCount + 1} blind checks!`);
    } else {
      setExplanation(`Checking pair: nums[${nextI}] (${data[nextI]}) + nums[${nextJ}] (${data[nextJ]}) = ${sum} (Target is ${target} -> Not a match, keep searching...)`);
    }
  };

  const handleReset = () => {
    setIIdx(0);
    setJIdx(1);
    setOperationsCount(1);
    setIsFound(false);
    setIsAutoPlaying(false);
    setExplanation("Reset to start: i=0, j=1. Ready to step through every pair.");
  };

  useEffect(() => {
    let timer;
    if (isAutoPlaying && !isFound) {
      timer = setInterval(() => {
        stepBruteForce();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, isFound, iIdx, jIdx]);

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 text-rose-400 text-xs font-semibold px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1.5 font-mono">
              🐢 Step 1: The Normal O(N²) Brute-Force Method
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">How the Naive Nested Loops Work</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Before learning optimal algorithms, see how standard nested loops blindly test every single pair one by one.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              isAutoPlaying
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isAutoPlaying ? "Pause Loop" : "Auto-Step Brute Force"}
          </button>

          <button
            onClick={stepBruteForce}
            disabled={isFound || iIdx >= data.length - 1}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold disabled:opacity-30"
          >
            <FastForward className="w-3.5 h-3.5" /> Next Pair ➔
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onCompleteStage}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105 active:scale-95 text-xs"
          >
            Next: Which Algorithm to Use? <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Canvas + Code Stepper Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left: Nested Loop Pair Visualizer (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            {/* HUD Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-800 mb-6">
              <div className="flex items-center gap-4">
                <div className="text-xs text-slate-400">
                  Target Sum: <span className="text-base font-bold text-emerald-400">{target}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Checking Sum:{" "}
                  <span className={`text-base font-bold ${data[iIdx] + data[jIdx] === target ? "text-emerald-400" : "text-amber-400"}`}>
                    {data[iIdx] + data[jIdx]} ({data[iIdx]} + {data[jIdx]})
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/30 font-bold">
                Pair Check #{operationsCount} of {totalPossiblePairs}
              </div>
            </div>

            {/* Visual Array with i and j pointers */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-6">
              {data.map((val, idx) => {
                const isI = idx === iIdx;
                const isJ = idx === jIdx;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="h-6 flex items-center justify-center mb-1">
                      {isI && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 animate-bounce">
                          i (Outer)
                        </span>
                      )}
                      {isJ && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40 animate-bounce">
                          j (Inner)
                        </span>
                      )}
                    </div>

                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center text-base md:text-lg font-mono font-bold transition-all duration-300 border-2 ${
                        isI
                          ? "border-amber-500 bg-amber-950/70 text-amber-200 shadow-xl shadow-amber-500/30 scale-105"
                          : isJ
                          ? "border-rose-500 bg-rose-950/70 text-rose-200 shadow-xl shadow-rose-500/30 scale-105"
                          : "border-slate-800 bg-slate-900/50 text-slate-500 opacity-40"
                      }`}
                    >
                      <span>{val}</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">[{idx}]</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Inefficiency Warning */}
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-300 mb-0.5">Why this brute-force method is wasteful:</div>
              <span>
                Even though numbers are sorted, nested loops stubbornly check pairs like $(2 + 4 = 6)$ and $(2 + 7 = 9)$ one by one without using the sorted property. At $N=50,000$, this wastes <strong>1.25 Billion checks</strong>!
              </span>
            </div>
          </div>
        </div>

        {/* Right: The Naive Code Trace (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Naive O(N²) Python Code</span>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                Quadratic Time O(N²)
              </span>
            </div>

            {/* Code lines with active line highlight */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 font-mono text-xs space-y-1">
              {[
                { line: 1, text: "def twoSum_naive(nums, target):" },
                { line: 2, text: `    for i in range(len(nums)):          # i = ${iIdx}`, active: true },
                { line: 3, text: `        for j in range(i + 1, len(nums)):  # j = ${jIdx}`, active: true },
                { line: 4, text: `            if nums[i] + nums[j] == target:  # ${data[iIdx]}+${data[jIdx]}==${target}?`, active: true },
                { line: 5, text: `                return [i + 1, j + 1]` },
                { line: 6, text: `    return []` }
              ].map(({ line, text, active }) => (
                <div
                  key={line}
                  className={`flex items-center gap-3 px-2 py-1 rounded transition-all duration-200 ${
                    active && (line === 3 || line === 4)
                      ? "bg-rose-500/20 text-rose-300 border-l-4 border-rose-400 font-bold"
                      : "text-slate-400 opacity-80"
                  }`}
                >
                  <span className="text-[10px] text-slate-600 select-none w-4 text-right">{line}</span>
                  <span className="whitespace-pre">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs">
            <div className="font-bold text-[10px] uppercase font-mono tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> What the Naive Loop is Doing:
            </div>
            <p className="leading-relaxed font-sans text-[11px]">{explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
