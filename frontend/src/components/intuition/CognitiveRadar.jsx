import React, { useState, useEffect } from "react";
import { Brain, ShieldAlert, Award, TrendingUp, Zap, Sparkles, CheckCircle2 } from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function CognitiveRadar({ userId, username }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/intuition/profile?user_id=${userId || "demo"}&username=${username || "Coder"}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, username]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-indigo-400" /> Loading Cognitive Radar...
      </div>
    );
  }

  if (!profile) return null;

  const scores = profile.radar_scores || {
    edge_case_handling: 80,
    time_optimization: 85,
    space_optimization: 80,
    syntax_translation: 75,
    articulation_score: 80
  };

  const vectorList = [
    { label: "Edge-Case Handling", val: scores.edge_case_handling, color: "bg-blue-500", text: "text-blue-400" },
    { label: "Time Optimization", val: scores.time_optimization, color: "bg-emerald-500", text: "text-emerald-400" },
    { label: "Space Optimization", val: scores.space_optimization, color: "bg-purple-500", text: "text-purple-400" },
    { label: "Syntax Translation", val: scores.syntax_translation, color: "bg-amber-500", text: "text-amber-400" },
    { label: "Architectural Articulation", val: scores.articulation_score, color: "bg-rose-500", text: "text-rose-400" }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
      {/* Header Profile Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 font-bold text-2xl font-mono">
            {profile.level || 3}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold">
                Level {profile.level} Intuition Scholar
              </span>
              <span className="text-xs text-slate-500 font-mono">🔥 {profile.intuition_streak_days} Day Streak</span>
            </div>
            <h3 className="text-2xl font-bold text-white mt-1">{profile.username}</h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs uppercase font-mono text-slate-500">Total Intuition XP</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">+{profile.total_xp} XP</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Cognitive Mastery Vectors */}
        <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Cognitive Mastery Vectors
          </h4>

          <div className="space-y-4">
            {vectorList.map((vec, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">{vec.label}</span>
                  <span className={`font-mono font-bold ${vec.text}`}>{vec.val}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${vec.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${vec.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Blindspots & Badges */}
        <div className="space-y-6">
          {/* Active Blindspots */}
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Detected Blind Spots
            </h4>

            <div className="space-y-3">
              {profile.active_blindspots?.map((bs) => (
                <div key={bs.id} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{bs.title}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {bs.severity} severity
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{bs.drill_recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mastery Badges */}
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-400" /> Mastery Badges
            </h4>

            <div className="flex flex-wrap gap-3">
              {profile.mastery_badges?.map((badge, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2.5"
                >
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{badge.name}</div>
                    <div className="text-[10px] text-slate-500">{badge.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
