import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { CheckCircle2, Sparkles, ArrowRight, Zap } from "lucide-react";
import ProblemCard from "../components/ui/ProblemCard";
import CompletedProblemCard from "../components/ui/CompletedProblemCard";
import EmptyState from "../components/ui/EmptyState";

export default function Problems({ problems, attempts, currentLanguage }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
        <ProblemCard
          key={p.id}
          problem={p}
          progress={progress}
          roundsDone={roundsDone}
          completed={completed}
        />
      );
    });
  };

  return (
    <div>
      {/* Intuition Loop Feature Highlight Banner */}
      <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shrink-0 shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                NEW LEARNING PARADIGM
              </span>
              <span className="text-xs text-slate-400">Intuition First, Code Second</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">The 4-D Intuition Loop</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Tired of staring at blank editors? Try our new interactive mode: <strong>Play</strong> with visual sandboxes, <strong>Break</strong> naive algorithms with chaos stress tests, <strong>Build</strong> scaffolded logic, and <strong>Defend</strong> trade-offs in the AI Arena!
            </p>
          </div>
        </div>

        <Link
          to="/intuition"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold px-6 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 text-sm transition-all transform hover:scale-105 active:scale-95 shrink-0"
        >
          Launch Intuition Mode <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <h1 className="text-xl font-semibold mb-2">All problems</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
        Practice step by step in {currentLanguage.toUpperCase()}.
      </p>

      {/* Completed Problems Section */}
      {completedProblems.length > 0 && (
        <div className="mb-6 rounded-xl p-4 cc-card" style={{ borderColor: 'var(--accent-primary)' }}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={16} /> Completed Problems
            </h2>
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              ({completedProblems.length} completed)
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {completedProblems.map((p) => (
              <CompletedProblemCard
                key={p.id}
                problem={p}
                currentLanguage={currentLanguage}
              />
            ))}
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
            aria-label="Search problems by title or topic"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none"
            style={{ borderColor: 'var(--input-border)' }}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 text-sm">
          {/* Difficulty Filter */}
          <div className="flex gap-1.5" role="group" aria-label="Filter by difficulty">
            <span className="self-center" style={{ color: 'var(--text-tertiary)' }}>Difficulty:</span>
            {["All", "Easy", "Medium", "Hard"].map(diff => (
              <button
                key={diff}
                type="button"
                aria-pressed={selectedDifficulty === diff}
                onClick={() => setSelectedDifficulty(diff)}
                className="px-3 py-1.5 rounded-lg border transition-colors"
                style={{
                  borderColor: selectedDifficulty === diff ? 'var(--accent-primary)' : 'var(--border-color)',
                  backgroundColor: selectedDifficulty === diff ? 'color-mix(in srgb, var(--accent-primary) 20%, var(--bg-secondary))' : 'var(--bg-secondary)',
                  color: selectedDifficulty === diff ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-1.5" role="group" aria-label="Filter by status">
            <span className="self-center" style={{ color: 'var(--text-tertiary)' }}>Status:</span>
            {["All", "Completed", "In Progress"].map(status => (
              <button
                key={status}
                type="button"
                aria-pressed={selectedStatus === status}
                onClick={() => setSelectedStatus(status)}
                className="px-3 py-1.5 rounded-lg border transition-colors"
                style={{
                  borderColor: selectedStatus === status ? 'var(--accent-primary)' : 'var(--border-color)',
                  backgroundColor: selectedStatus === status ? 'color-mix(in srgb, var(--accent-primary) 20%, var(--bg-secondary))' : 'var(--bg-secondary)',
                  color: selectedStatus === status ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedDifficulty !== "All" || selectedStatus !== "All" || searchQuery) && (
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Active filters:</span>
            {selectedDifficulty !== "All" && (
              <span className="px-2 py-1 rounded-md cc-pill">
                {selectedDifficulty}
              </span>
            )}
            {selectedStatus !== "All" && (
              <span className="px-2 py-1 rounded-md cc-pill">
                {selectedStatus}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-1 rounded-md cc-pill">
                "{searchQuery}"
              </span>
            )}
            <button
              onClick={() => {
                setSelectedDifficulty("All");
                setSelectedStatus("All");
                setSearchQuery("");
              }}
              className="px-2 py-1 rounded-md"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div
        className="mb-4 text-sm"
        style={{ color: 'var(--text-tertiary)' }}
        aria-live="polite"
      >
        Showing {filteredProblems.length} of {problems.length} problems
      </div>

      {/* Problems Sections */}
      {filteredProblems.length === 0 ? (
        <EmptyState
          title="No problems found matching your filters."
          action={
            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty("All");
                setSelectedStatus("All");
                setSearchQuery("");
              }}
              className="text-sm cc-link"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          {/* Easy Problems Section */}
          {easyProblems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-semibold" style={{ color: 'var(--accent-primary)' }}>
                  Easy Problems
                </h2>
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  ({easyProblems.length})
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {renderProblemsList(easyProblems)}
              </div>
            </div>
          )}

          {/* Medium Problems Section */}
          {mediumProblems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-semibold" style={{ color: 'var(--accent-primary)' }}>
                  Medium Problems
                </h2>
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  ({mediumProblems.length})
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {renderProblemsList(mediumProblems)}
              </div>
            </div>
          )}

          {/* Hard Problems Section */}
          {hardProblems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-semibold" style={{ color: 'var(--accent-primary)' }}>
                  Hard Problems
                </h2>
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  ({hardProblems.length})
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {renderProblemsList(hardProblems)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
