export default function ProgressBar({ value, label, big = false }) {
  const clamped = Math.max(0, Math.min(value ?? 0, 100));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>{label}</span>
          <span>{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-800 overflow-hidden ${big ? "h-3" : "h-2"}`}>
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-500 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
