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
      <h2 className="text-base font-semibold mb-1">Achievements & Badges</h2>
      <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>
        Earn badges as you complete more problems, solve them faster, and use
        multiple languages.
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`flex gap-2 p-2.5 rounded-xl border text-sm ${b.unlocked
                ? "opacity-100"
                : "opacity-75"
              }`}
            style={{
              borderColor: b.unlocked ? 'var(--accent-primary)' : 'var(--border-color)',
              backgroundColor: b.unlocked ? 'color-mix(in srgb, var(--accent-primary) 15%, var(--bg-secondary))' : 'var(--bg-secondary)'
            }}
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              {b.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">{b.label}</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b.desc}</span>
              <span
                className="mt-1 text-sm uppercase tracking-wide"
                style={{ color: b.unlocked ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
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
