const DIFFICULTY_COLORS = {
  Easy: "var(--ok-soft)",
  Medium: "var(--warn-soft)",
  Hard: "var(--danger-soft)",
};

/**
 * Difficulty pill used across problem lists.
 * Keeps the existing color mapping in one place.
 */
export default function DifficultyBadge({ difficulty }) {
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-bold"
      style={{
        backgroundColor: DIFFICULTY_COLORS[difficulty] || "var(--bg-tertiary)",
        color: "var(--text-primary)",
      }}
    >
      {difficulty}
    </span>
  );
}
