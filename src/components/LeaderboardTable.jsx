export default function LeaderboardTable({ entries }) {
  if (!entries?.length) {
    return (
      <p className="text-xs text-slate-400 mt-2">
        No completed attempts yet. Solve all 4 rounds to appear here.
      </p>
    );
  }

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs border border-slate-800 rounded-lg overflow-hidden">
        <thead className="bg-slate-900">
          <tr>
            <th className="px-2 py-1 text-left">Rank</th>
            <th className="px-2 py-1 text-left">Name</th>
            <th className="px-2 py-1 text-left">Language</th>
            <th className="px-2 py-1 text-left">Time (s)</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? "bg-slate-900/70" : "bg-slate-900/40"}
            >
              <td className="px-2 py-1">#{idx + 1}</td>
              <td className="px-2 py-1">{e.name}</td>
              <td className="px-2 py-1">{e.language.toUpperCase()}</td>
              <td className="px-2 py-1">{e.time.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
