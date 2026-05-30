import ProgressBar from "../components/ProgressBar";
import AchievementsPanel from "../components/AchievementsPanel";

export default function Profile({
  user,
  onSave,
  attempts,
  problems,
  currentLanguage,
  stats,
}) {
  const totalProblems = problems.length;
  const completedInLang = problems.filter((p) => {
    const key = `${p.id}_${currentLanguage}`;
    return attempts[key]?.finalCompleted;
  }).length;

  const totalTime = Object.values(attempts || {}).reduce(
    (sum, a) => sum + (a.totalTimeSeconds || 0),
    0
  );

  return (
    <div>
      <div className="border border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-400 to-sky-400 flex items-center justify-center text-lg font-bold text-slate-950">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="text-lg font-semibold">{user?.name}</div>
            <div className="text-[11px] text-slate-400">
              Level {stats.level} • {stats.xp} XP • Preferred{" "}
              {user?.preferredLanguage?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-xs flex-1">
          <div className="border border-slate-700 rounded-xl p-3">
            <div className="text-slate-400 mb-1">
              Problems completed ({currentLanguage.toUpperCase()})
            </div>
            <div className="font-semibold">
              {completedInLang} / {totalProblems}
            </div>
            <ProgressBar
              value={
                totalProblems ? (completedInLang / totalProblems) * 100 : 0
              }
            />
          </div>
          <div className="border border-slate-700 rounded-xl p-3">
            <div className="text-slate-400 mb-1">Total time spent</div>
            <div className="font-semibold">{totalTime.toFixed(1)}s</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Time is tracked per round once you start typing.
            </div>
          </div>
        </div>
      </div>

      <AchievementsPanel stats={stats} />

      <div className="border border-slate-700 rounded-2xl p-4 mt-4 text-xs">
        <h2 className="text-sm font-semibold mb-2">
          Per-problem progress ({currentLanguage.toUpperCase()})
        </h2>
        <div className="space-y-2">
          {problems.map((p) => {
            const key = `${p.id}_${currentLanguage}`;
            const att = attempts[key];
            const roundsDone = att
              ? Object.values(att.roundCompleted || {}).filter(Boolean).length
              : 0;
            const progress = (roundsDone / 4) * 100;

            return (
              <div
                key={p.id}
                className="flex justify-between gap-3 border border-slate-700 rounded-xl px-3 py-2"
              >
                <div>
                  <div className="font-semibold text-slate-100">{p.title}</div>
                  <div className="text-[11px] text-slate-400">
                    Difficulty: {p.difficulty}
                  </div>
                </div>
                <div className="w-32">
                  <ProgressBar value={progress} />
                  <div className="text-[10px] text-slate-400 mt-1 text-right">
                    {att?.finalCompleted ? "Completed" : "In progress"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
