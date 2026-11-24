/**
 * Shared empty-state block for lists and filter results.
 */
export default function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-12" style={{ color: "var(--text-tertiary)" }} role="status">
      <p className="text-base">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
