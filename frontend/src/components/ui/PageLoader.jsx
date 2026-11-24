/**
 * Fallback shown while a lazily loaded route chunk is being fetched.
 * Announced to screen readers via role="status".
 */
export default function PageLoader({ label = "Loading page" }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-24"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--border-light)", borderTopColor: "var(--accent-primary)" }}
        aria-hidden="true"
      />
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </span>
    </div>
  );
}
