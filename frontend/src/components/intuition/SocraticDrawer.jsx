import React, { useState } from "react";
import { Brain, HelpCircle, ChevronDown, ChevronUp, Sparkles, Send, Lightbulb, Play, AlertCircle } from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function SocraticDrawer({ problemId, language, code, onInsertCounterTest }) {
  const [activeTier, setActiveTier] = useState(1);
  const [hints, setHints] = useState({});
  const [loadingTier, setLoadingTier] = useState(null);

  const fetchHint = async (tier) => {
    setLoadingTier(tier);
    try {
      const res = await fetch(`${API_BASE}/intuition/socratic-hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: problemId || "two_sum_sorted",
          language: language || "python",
          student_code: code || "",
          tier: tier
        })
      });

      if (res.ok) {
        const data = await res.json();
        setHints((prev) => ({ ...prev, [tier]: data }));
      }
    } catch (e) {
      console.error("Failed to fetch hint", e);
    } finally {
      setLoadingTier(null);
    }
  };

  const TIERS = [
    { tier: 1, name: "Gentle Nudge", desc: "A subtle observation about the problem structure" },
    { tier: 2, name: "Boundary Check", desc: "A targeted question on pointer limits & loop conditions" },
    { tier: 3, name: "Counter-Example Drill", desc: "A minimal breaking test case that exposes logic flaws" },
    { tier: 4, name: "Algorithmic Concept", desc: "High-level theoretical paradigm without code spoon-feeding" }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <h4 className="text-base font-bold text-white">Socratic AI Mentor</h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
          Pedagogical Guidance
        </span>
      </div>

      <div className="space-y-3">
        {TIERS.map(({ tier, name, desc }) => {
          const hintData = hints[tier];
          const isOpen = activeTier === tier;
          const isLoading = loadingTier === tier;

          return (
            <div
              key={tier}
              className={`rounded-xl border transition-all ${
                isOpen ? "border-indigo-500/60 bg-slate-950/80 shadow-lg" : "border-slate-800 bg-slate-950/40"
              }`}
            >
              <button
                onClick={() => {
                  setActiveTier(tier);
                  if (!hintData && !isLoading) {
                    fetchHint(tier);
                  }
                }}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-xs font-bold font-mono">
                    {tier}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{name}</div>
                    <div className="text-[11px] text-slate-500">{desc}</div>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 text-sm">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-indigo-400 text-xs py-3">
                      <Sparkles className="w-4 h-4 animate-spin" /> Formulating Socratic Question...
                    </div>
                  ) : hintData ? (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-indigo-950/40 rounded-lg border border-indigo-500/30 text-indigo-200 font-medium">
                        "{hintData.guided_question}"
                      </div>

                      {hintData.suggested_counter_input && (
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase font-mono text-slate-500">Breaking Counter-Example</div>
                            <div className="text-xs font-mono text-amber-400 font-bold mt-0.5">
                              {hintData.suggested_counter_input}
                            </div>
                          </div>
                          {onInsertCounterTest && (
                            <button
                              onClick={() => onInsertCounterTest(hintData.suggested_counter_input)}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" /> Test in Runner
                            </button>
                          )}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Focus Concept: <strong>{hintData.target_concept}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fetchHint(tier)}
                      className="w-full py-2 mt-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold"
                    >
                      Unlock Tier {tier} Hint
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
