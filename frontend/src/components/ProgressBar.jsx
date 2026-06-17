export default function ProgressBar({ value, label, big = false }) {
  const clamped = Math.max(0, Math.min(value ?? 0, 100));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>
          <span>{label}</span>
          <span>{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full rounded-full overflow-hidden ${big ? "h-3" : "h-2"}`} style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-strong))'
          }}
        />
      </div>
    </div>
  );
}
