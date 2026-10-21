import React, { useState } from "react";
import { Flame, Zap, AlertTriangle, ShieldCheck, ArrowRight, Gauge, Activity, Cpu } from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function ChaosEngine({ problemId, chaosConfig, onCompleteStage }) {
  const [nElements, setNElements] = useState(10000);
  const [distribution, setDistribution] = useState("random");
  const [algorithmType, setAlgorithmType] = useState("naive");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [hasTriggeredStress, setHasTriggeredStress] = useState(false);

  const runBenchmark = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/intuition/chaos-benchmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: problemId || "two_sum_sorted",
          n_elements: nElements,
          distribution: distribution,
          algorithm_type: algorithmType
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (data.status === "OVERHEAT_TLE" || data.algorithm_type === "optimal") {
          setHasTriggeredStress(true);
        }
      } else {
        // Fallback local calculation
        const ops = algorithmType === "naive" ? Math.floor((nElements * (nElements - 1)) / 2) : nElements;
        const isTLE = algorithmType === "naive" && nElements >= 20000;
        setResult({
          n_elements: nElements,
          distribution,
          algorithm_type: algorithmType,
          time_taken_ms: isTLE ? 5200 : (ops / 150000).toFixed(2),
          simulated_operations: ops,
          status: isTLE ? "OVERHEAT_TLE" : "SUCCESS",
          complexity_label: algorithmType === "naive" ? "O(N^2)" : "O(N)",
          insight_message: isTLE
            ? `🔥 CPU OVERHEAT ALERT! At N=${nElements.toLocaleString()}, naive loop took ${ops.toLocaleString()} operations. TLE!`
            : `⚡ Fast execution! Handled ${ops.toLocaleString()} operations smoothly.`
        });
        setHasTriggeredStress(true);
      }
    } catch (e) {
      console.error("Failed to run benchmark", e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 text-rose-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-500/30 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Stage 2: The Chaos Engineer
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">Stress & Complexity Tester</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Crank up the data volume slider to crash naive $O(N^2)$ algorithms and witness the power of $O(N)$ efficiency!
          </p>
        </div>

        {hasTriggeredStress && (
          <button
            onClick={onCompleteStage}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/25 transition-all transform hover:scale-105 active:scale-95"
          >
            Next: Scaffold & Build <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2 Cols: Sliders and Algorithm Type */}
        <div className="lg:col-span-2 space-y-6 bg-slate-950/80 p-6 rounded-xl border border-slate-800">
          {/* Data Volume Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" /> Data Volume (N Elements):
              </label>
              <span className="text-base font-mono font-bold text-emerald-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                {nElements.toLocaleString()} items
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="100000"
              step="500"
              value={nElements}
              onChange={(e) => setNElements(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>100 (Tiny)</span>
              <span>10,000 (Medium)</span>
              <span>50,000 (Stress)</span>
              <span>100,000 (Extreme)</span>
            </div>
          </div>

          {/* Algorithm Type Selector */}
          <div>
            <label className="text-sm font-semibold text-slate-200 block mb-2">Algorithm Strategy:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAlgorithmType("naive")}
                className={`p-4 rounded-xl border flex flex-col text-left transition-all ${
                  algorithmType === "naive"
                    ? "border-rose-500 bg-rose-950/40 text-rose-200 shadow-lg shadow-rose-500/20"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Naive Approach
                </span>
                <span className="text-xs text-slate-400 mt-1">Nested loops, checks all pairs {chaosConfig?.naive_complexity || "O(N^2)"}</span>
              </button>

              <button
                onClick={() => setAlgorithmType("optimal")}
                className={`p-4 rounded-xl border flex flex-col text-left transition-all ${
                  algorithmType === "optimal"
                    ? "border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-lg shadow-emerald-500/20"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" /> Optimal Approach
                </span>
                <span className="text-xs text-slate-400 mt-1">Single pass pointers / window {chaosConfig?.optimal_complexity || "O(N)"}</span>
              </button>
            </div>
          </div>

          {/* Distribution Selector */}
          <div>
            <label className="text-sm font-semibold text-slate-200 block mb-2">Data Distribution:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "random", label: "Random Order" },
                { id: "sorted", label: "Strictly Sorted" },
                { id: "reverse", label: "Reverse Sorted" },
                { id: "duplicates", label: "Heavy Duplicates" }
              ].map((dist) => (
                <button
                  key={dist.id}
                  onClick={() => setDistribution(dist.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    distribution === dist.id
                      ? "border-indigo-500 bg-indigo-600/30 text-indigo-300"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {dist.label}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Benchmark Button */}
          <button
            onClick={runBenchmark}
            disabled={isRunning}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <Cpu className="w-5 h-5 animate-spin" /> Simulating Stress Load...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Flame className="w-5 h-5" /> Launch Stress Benchmark
              </span>
            )}
          </button>
        </div>

        {/* Right Col: Live Telemetry & Gauge */}
        <div className="bg-slate-950/80 p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-400" /> Telemetry HUD
            </h4>

            {result ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    result.status === "OVERHEAT_TLE"
                      ? "border-rose-500/60 bg-rose-950/40 text-rose-200 animate-pulse"
                      : "border-emerald-500/60 bg-emerald-950/40 text-emerald-200"
                  }`}
                >
                  <div className="text-xs uppercase font-mono tracking-wider text-slate-400">Status</div>
                  <div className="text-lg font-bold mt-0.5">{result.status === "OVERHEAT_TLE" ? "🚨 TIME LIMIT EXCEEDED" : "✅ 100% OPERATIONAL"}</div>
                  <div className="text-xs text-slate-300 mt-2">{result.insight_message}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400">Total Ops</div>
                    <div className="text-sm font-mono font-bold text-amber-400">{result.simulated_operations.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400">Time Taken</div>
                    <div className="text-sm font-mono font-bold text-indigo-400">{result.time_taken_ms} ms</div>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Theoretical Complexity</div>
                  <div className="text-base font-mono font-bold text-white">{result.complexity_label}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                Select parameters and launch benchmark to view real-time stress telemetry.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 mt-4 border-t border-slate-900 pt-3">
            {chaosConfig?.worst_case_explanation}
          </div>
        </div>
      </div>
    </div>
  );
}
