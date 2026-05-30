import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import ProgressBar from "../components/ProgressBar";

export default function Problems({ problems, attempts, currentLanguage }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Get all unique topics
  const allTopics = useMemo(() => {
    const topics = new Set();
    problems.forEach(p => p.topics.forEach(t => topics.add(t)));
    return Array.from(topics).sort();
  }, [problems]);

  // Filter problems based on selected filters
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const key = `${p.id}_${currentLanguage}`;
      const att = attempts[key];
      const completed = att?.finalCompleted;

      // Difficulty filter
      if (selectedDifficulty !== "All" && p.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      if (selectedStatus === "Completed" && !completed) {
        return false;
      }
      if (selectedStatus === "In Progress" && completed) {
        return false;
      }

      // Search filter (title and topics)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = p.title.toLowerCase().includes(query);
        const topicMatch = p.topics.some(t => t.toLowerCase().includes(query));
        if (!titleMatch && !topicMatch) {
          return false;
        }
      }

      return true;
    });
  }, [problems, selectedDifficulty, selectedStatus, searchQuery, currentLanguage, attempts]);

  // Get completed problems with results
  const completedProblems = useMemo(() => {
    return problems
      .map(p => {
        const key = `${p.id}_${currentLanguage}`;
        const att = attempts[key];
        if (!att?.finalCompleted) return null;

        return {
          ...p,
          totalTime: att.totalTimeSeconds || 0,
          roundsCompleted: Object.values(att.roundCompleted || {}).filter(Boolean).length,
          key
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.totalTime - a.totalTime); // Sort by time (slowest first)
  }, [problems, attempts, currentLanguage]);

  // Group filtered problems by difficulty
  const easyProblems = filteredProblems.filter(p => p.difficulty === "Easy");
  const mediumProblems = filteredProblems.filter(p => p.difficulty === "Medium");
  const hardProblems = filteredProblems.filter(p => p.difficulty === "Hard");

  const renderProblemsList = (problemsList) => {
    return problemsList.map((p) => {
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
          className="block rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 hover:border-emerald-500/80 transition-colors"
        >
          <div className="flex justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-100">
                {p.title}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                <span
                  className={`px-2 py-[2px] rounded-full text-[10px] ${p.difficulty === "Easy"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : p.difficulty === "Medium"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-rose-500/15 text-rose-300"
                    }`}
                >
                  {p.difficulty}
                </span>
                {p.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-[2px] rounded-full text-[10px] border border-slate-700 text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-28">
              <ProgressBar value={progress} />
              <div className="text-[10px] text-slate-400 mt-1 text-right">
                {completed ? <span className="flex items-center gap-1"><CheckCircle2 size={10} /> Completed</span> : "In progress"}
              </div>
            </div>
          </div>
        </Link>
      );
    });
  };

  return (
    <div>
      <h1 className="text-lg font-semibold mb-2">All problems</h1>
      <p className="text-xs text-slate-400 mb-4">
        Practice step by step in {currentLanguage.toUpperCase()}.
      </p>

      {/* Completed Problems Section */}
      {completedProblems.length > 0 && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} /> Completed Problems
            </h2>
            <span className="text-xs text-slate-400">
              ({completedProblems.length} completed)
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedProblems.map((p) => {
              const att = attempts[p.key];
              return (
                <Link
                  key={p.id}
                  to={`/workspace/${p.id}`}
                  className="block rounded-lg border border-slate-700 bg-slate-950/80 p-3 hover:border-emerald-500/80 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-slate-100 text-xs">
                      {p.title}
                    </div>
                    <CheckCircle2 className="text-emerald-400" size={18} />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <span
                      className={`px-2 py-[2px] rounded-full text-[10px] ${p.difficulty === "Easy"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : p.difficulty === "Medium"
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                    >
                      {p.difficulty}
                    </span>
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Total Time:</span>
                      <span className="text-slate-300 font-medium">
                        {p.totalTime.toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rounds Completed:</span>
                      <span className="text-slate-300 font-medium">
                        {p.roundsCompleted}/4
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span className="text-slate-300 font-medium uppercase">
                        {currentLanguage}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-6 space-y-3">
        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Search problems by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 text-xs">
          {/* Difficulty Filter */}
          <div className="flex gap-1.5">
            <span className="text-slate-400 self-center">Difficulty:</span>
            {["All", "Easy", "Medium", "Hard"].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${selectedDifficulty === diff
                    ? diff === "Easy"
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                      : diff === "Medium"
                        ? "border-amber-500 bg-amber-500/20 text-amber-300"
                        : diff === "Hard"
                          ? "border-rose-500 bg-rose-500/20 text-rose-300"
                          : "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-slate-700 bg-slate-950/80 text-slate-400 hover:border-slate-600"
                  }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-1.5">
            <span className="text-slate-400 self-center">Status:</span>
            {["All", "Completed", "In Progress"].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${selectedStatus === status
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                    : "border-slate-700 bg-slate-950/80 text-slate-400 hover:border-slate-600"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedDifficulty !== "All" || selectedStatus !== "All" || searchQuery) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Active filters:</span>
            {selectedDifficulty !== "All" && (
              <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300">
                {selectedDifficulty}
              </span>
            )}
            {selectedStatus !== "All" && (
              <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300">
                {selectedStatus}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300">
                "{searchQuery}"
              </span>
            )}
            <button
              onClick={() => {
                setSelectedDifficulty("All");
                setSelectedStatus("All");
                setSearchQuery("");
              }}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-xs text-slate-400">
        Showing {filteredProblems.length} of {problems.length} problems
      </div>

      {/* Problems Sections */}
      {filteredProblems.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-sm">No problems found matching your filters.</p>
          <button
            onClick={() => {
              setSelectedDifficulty("All");
              setSelectedStatus("All");
              setSearchQuery("");
            }}
            className="mt-3 text-xs text-emerald-400 hover:text-emerald-300"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Easy Problems Section */}
          {easyProblems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-emerald-300">
                  Easy Problems
                </h2>
                <span className="text-xs text-slate-500">
                  ({easyProblems.length})
                </span>
              </div>
              <div className="space-y-3 text-xs">
                {renderProblemsList(easyProblems)}
              </div>
            </div>
          )}

          {/* Medium Problems Section */}
          {mediumProblems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-amber-300">
                  Medium Problems
                </h2>
                <span className="text-xs text-slate-500">
                  ({mediumProblems.length})
                </span>
              </div>
              <div className="space-y-3 text-xs">
                {renderProblemsList(mediumProblems)}
              </div>
            </div>
          )}

          {/* Hard Problems Section */}
          {hardProblems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-rose-300">
                  Hard Problems
                </h2>
                <span className="text-xs text-slate-500">
                  ({hardProblems.length})
                </span>
              </div>
              <div className="space-y-3 text-xs">
                {renderProblemsList(hardProblems)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
