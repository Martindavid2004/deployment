import { Link } from "react-router-dom";

export default function Home({ user, stats }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 mb-2">
        ProEduvate
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent mb-3">
        codoAI
      </h1>
      <p className="max-w-xl text-sm text-slate-300 mb-6">
        Practice coding the smart way. Type from reference, debug, recall from
        memory, and pass test cases — with AI-powered hints, XP, levels, and a
        competitive mode.
      </p>

      <div className="flex gap-3 mb-6">
        <Link
          to={user ? "/dashboard" : "/login"}
          className="px-5 py-2 rounded-full bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400"
        >
          {user ? "Go to Dashboard" : "Sign in to get started"}
        </Link>
        {!user && (
          <Link
            to="/login"
            className="px-5 py-2 rounded-full border border-slate-600 text-sm text-slate-200 hover:border-emerald-400"
          >
            Try as student
          </Link>
        )}
      </div>

      {user && (
        <div className="mt-4 text-xs text-slate-400">
          Logged in as <span className="text-emerald-300 font-semibold">{user.name}</span> • Level{" "}
          <span className="font-semibold">{stats.level}</span> • XP{" "}
          <span className="font-semibold">{stats.xp}</span>
        </div>
      )}
    </div>
  );
}
