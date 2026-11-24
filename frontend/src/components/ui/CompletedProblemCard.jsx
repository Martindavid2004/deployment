import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import DifficultyBadge from "./DifficultyBadge";

/**
 * Completed problem summary card.
 * Markup extracted from Problems.jsx without behavior changes.
 */
export default function CompletedProblemCard({ problem, currentLanguage }) {
  return (
    <Link
      to={`/workspace/${problem.id}`}
      className="block rounded-2xl p-5 transition-transform hover:-translate-y-1 hover:shadow-lg cc-card-muted flex flex-col justify-between h-full gap-4"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="font-bold text-lg">{problem.title}</div>
          <CheckCircle2 size={24} style={{ color: "var(--accent-primary)" }} />
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
      </div>

      <div
        className="space-y-2 text-sm pt-4 border-t"
        style={{ borderColor: "var(--border-color)", color: "var(--text-tertiary)" }}
      >
        <div className="flex justify-between items-center">
          <span className="uppercase text-xs font-semibold tracking-wider">Total Time</span>
          <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            {problem.totalTime.toFixed(1)}s
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="uppercase text-xs font-semibold tracking-wider">Rounds</span>
          <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            {problem.roundsCompleted}/4
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="uppercase text-xs font-semibold tracking-wider">Language</span>
          <span
            className="font-bold text-base uppercase"
            style={{ color: "var(--accent-primary)" }}
          >
            {currentLanguage}
          </span>
        </div>
      </div>
    </Link>
  );
}
