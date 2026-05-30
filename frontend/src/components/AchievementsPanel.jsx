import { CheckCircle2, Clock, Globe } from "lucide-react";

export default function AchievementsPanel({ stats }) {
  const { totalSolved, fastSolve, multiLang, bestTime } = stats;

  const badges = [
    {
      id: "first-solve",
      label: "First Solve",
      desc: "Solved at least one problem.",
      unlocked: totalSolved >= 1,
      icon: <CheckCircle2 size={20} />,
    },
    {
      id: "speed-runner",
      label: "Speed Runner",
      desc: "Solved a problem in under 60 seconds.",
      unlocked: fastSolve,
      icon: <Clock size={20} />,
    },
    {
      id: "polyglot",
      label: "Polyglot",
      desc: "Solved the same problem in 2+ languages.",
      unlocked: multiLang,
      icon: <Globe size={20} />,
    },
  ];

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold mb-1">Achievements & Badges</h2>
      <p className="text-xs text-slate-400 mb-3">
        Earn badges as you complete more problems, solve them faster, and use
        multiple languages.
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`flex gap-2 p-2.5 rounded-xl border text-xs ${b.unlocked
                ? "border-emerald-500/70 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "border-slate-700 bg-slate-900/70 opacity-70"
              }`}
          >
            <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-lg">
              {b.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">{b.label}</span>
              <span className="text-[11px] text-slate-300">{b.desc}</span>
              <span
                className={`mt-1 text-[10px] uppercase tracking-wide ${b.unlocked ? "text-emerald-300" : "text-slate-500"
                  }`}
              >
                {b.unlocked ? "Unlocked" : "Locked"}
                {b.id === "speed-runner" && b.unlocked && bestTime && (
                  <> • Best: {bestTime.toFixed(1)}s</>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
