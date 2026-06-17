import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import ProgressBar from "../components/ProgressBar";

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
        <Link
          key={p.id}
          to={`/workspace/${p.id}`}
          className="block rounded-2xl px-5 py-5 transition-transform hover:-translate-y-1 hover:shadow-lg cc-card-muted flex flex-col h-full justify-between gap-4"
        >
          <div>
            <div className="font-bold text-lg mb-2">
              {p.title}
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor:
                    p.difficulty === "Easy"
                      ? 'var(--ok-soft)'
                      : p.difficulty === "Medium"
                      ? 'var(--warn-soft)'
                      : 'var(--danger-soft)',
                  color: 'var(--text-primary)'
                }}
              >
                {p.difficulty}
              </span>
              {p.topics.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-xs font-bold cc-pill"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <ProgressBar value={progress} />
            <div className="text-xs font-semibold mt-2 text-right" style={{ color: 'var(--text-tertiary)' }}>
              {completed ? <span className="flex items-center justify-end gap-1"><CheckCircle2 size={12} /> COMPLETED</span> : roundsDone > 0 ? "IN PROGRESS" : "NOT STARTED"}
            </div>
          </div>
        </Link>
      );
    });
  };

  return (
    <div>
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
            {completedProblems.map((p) => {
              const att = attempts[p.key];
              return (
                <Link
                  key={p.id}
                  to={`/workspace/${p.id}`}
                  className="block rounded-2xl p-5 transition-transform hover:-translate-y-1 hover:shadow-lg cc-card-muted flex flex-col justify-between h-full gap-4"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-bold text-lg">
                        {p.title}
                      </div>
                      <CheckCircle2 size={24} style={{ color: 'var(--accent-primary)' }} />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor:
                            p.difficulty === "Easy"
                              ? 'var(--ok-soft)'
                              : p.difficulty === "Medium"
                              ? 'var(--warn-soft)'
                              : 'var(--danger-soft)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {p.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm pt-4 border-t" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
                    <div className="flex justify-between items-center">
                      <span className="uppercase text-xs font-semibold tracking-wider">Total Time</span>
                      <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        {p.totalTime.toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="uppercase text-xs font-semibold tracking-wider">Rounds</span>
                      <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        {p.roundsCompleted}/4
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="uppercase text-xs font-semibold tracking-wider">Language</span>
                      <span className="font-bold text-base uppercase" style={{ color: 'var(--accent-primary)' }}>
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
            className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none"
            style={{ borderColor: 'var(--input-border)' }}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 text-sm">
          {/* Difficulty Filter */}
          <div className="flex gap-1.5">
            <span className="self-center" style={{ color: 'var(--text-tertiary)' }}>Difficulty:</span>
            {["All", "Easy", "Medium", "Hard"].map(diff => (
              <button
                key={diff}
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
          <div className="flex gap-1.5">
            <span className="self-center" style={{ color: 'var(--text-tertiary)' }}>Status:</span>
            {["All", "Completed", "In Progress"].map(status => (
              <button
                key={status}
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
      <div className="mb-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
        Showing {filteredProblems.length} of {problems.length} problems
      </div>

      {/* Problems Sections */}
      {filteredProblems.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
          <p className="text-base">No problems found matching your filters.</p>
          <button
            onClick={() => {
              setSelectedDifficulty("All");
              setSelectedStatus("All");
              setSearchQuery("");
            }}
            className="mt-3 text-sm cc-link"
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
