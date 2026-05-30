import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import AchievementsPanel from "../components/AchievementsPanel";

export default function Dashboard({
  user,
  problems,
  attempts,
  currentLanguage,
  stats,
}) {
  const totalProblems = problems.length;
  const completedInLang = problems.filter((p) => {
    const key = `${p.id}_${currentLanguage}`;
    return attempts[key]?.finalCompleted;
  }).length;
  const completionPercent = totalProblems
    ? (completedInLang / totalProblems) * 100
    : 0;

  return (
    <div>
      <div className="grid md:grid-cols-[1.3fr,1.1fr] gap-4">
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-4">
          <h1 className="text-2xl font-bold mb-1">
            Hey {user?.name || "coder"},{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              ready to level up?
            </span>
          </h1>
          <p className="text-xs text-slate-400 mb-4 max-w-xl">
            Solve problems round by round, earn XP, unlock badges and compete
            across Python, C++ and Java.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="border border-slate-700 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">Level</div>
              <div className="text-xl font-semibold mb-1">
                Level {stats.level}
              </div>
              <ProgressBar
                value={stats.levelProgress}
                label={`${stats.xp} XP total`}
                big
              />
            </div>
            <div className="border border-slate-700 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">
                Problems completed ({currentLanguage.toUpperCase()})
              </div>
              <div className="text-xl font-semibold mb-1">
                {completedInLang} / {totalProblems}
              </div>
              <ProgressBar value={completionPercent} big />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-4 text-xs">
            <div className="border border-slate-700 rounded-xl p-3">
              <div className="text-slate-400 mb-1">Primary language</div>
              <div className="font-semibold text-slate-100">
                {currentLanguage.toUpperCase()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Switch at the top-right to practice in Python, C++ or Java.
              </div>
            </div>
            <div className="border border-slate-700 rounded-xl p-3">
              <div className="text-slate-400 mb-1">
                Total solves (all languages)
              </div>
              <div className="font-semibold text-slate-100">
                {stats.totalSolved}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Solve same problem in multiple languages for more XP.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <Link
              to="/problems"
              className="px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
            >
              Start solving problems
            </Link>
            <Link
              to="/competitive"
              className="px-4 py-2 rounded-full border border-slate-600 text-slate-200 hover:border-emerald-400"
            >
              Try competitive mode
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-950/90 p-4">
          <h2 className="text-sm font-semibold mb-2">Problem list</h2>
          <div className="space-y-2 max-h-[320px] overflow-auto pr-1 text-xs">
            {problems.map((p) => {
              const key = `${p.id}_${currentLanguage}`;
              const att = attempts[key];
              const roundsDone = att
                ? Object.values(att.roundCompleted || {}).filter(Boolean).length
                : 0;
              const progress = (roundsDone / 4) * 100;
              const completed = att?.finalCompleted;

              return (
                <Link
                  key={p.id}
                  to={`/workspace/${p.id}`}
                  className="block border border-slate-700 rounded-xl px-3 py-2 hover:border-emerald-500/80"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-100">
                        {p.title}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span
                          className={`px-2 py-[2px] rounded-full text-[10px] ${
                            p.difficulty === "Easy"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : p.difficulty === "Medium"
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {p.difficulty}
                        </span>
                        <span className="px-2 py-[2px] rounded-full text-[10px] border border-slate-700 text-slate-300">
                          {currentLanguage.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="w-28">
                      <ProgressBar value={progress} />
                      <div className="text-[10px] text-slate-400 mt-1 text-right">
                        {completed ? "Completed" : "In progress"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <AchievementsPanel stats={stats} />
    </div>
  );
}
