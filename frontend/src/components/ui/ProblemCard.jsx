import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import ProgressBar from "../ProgressBar";
import DifficultyBadge from "./DifficultyBadge";

/**
 * A single problem card in the browse list.
 * Markup extracted from Problems.jsx without behavior changes.
 */
export default function ProblemCard({ problem, progress, roundsDone, completed }) {
  return (
    <Link
      to={`/workspace/${problem.id}`}
      className="block rounded-2xl px-5 py-5 transition-transform hover:-translate-y-1 hover:shadow-lg cc-card-muted flex flex-col h-full justify-between gap-4"
    >
      <div>
        <div className="font-bold text-lg mb-2">{problem.title}</div>
        <div className="flex flex-wrap gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          {problem.topics.map((topic) => (
            <span key={topic} className="px-3 py-1 rounded-full text-xs font-bold cc-pill">
              {topic}
            </span>
          ))}
        </div>
      </div>
      <div>
        <ProgressBar value={progress} />
        <div
          className="text-xs font-semibold mt-2 text-right"
          style={{ color: "var(--text-tertiary)" }}
        >
          {completed ? (
            <span className="flex items-center justify-end gap-1">
              <CheckCircle2 size={12} /> COMPLETED
            </span>
          ) : roundsDone > 0 ? (
            "IN PROGRESS"
          ) : (
            "NOT STARTED"
          )}
        </div>
      </div>
    </Link>
  );
}
