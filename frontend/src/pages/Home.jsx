import { Link } from "react-router-dom";

export default function Home({ user, stats }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="px-3 py-1 mb-4 text-sm font-bold uppercase tracking-[0.2em] rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)]" style={{ color: 'var(--text-tertiary)' }}>
        ProEduvate
      </div>
      <div className="relative">
        <div className="absolute -inset-4 bg-[var(--accent-primary)] opacity-20 blur-2xl rounded-full"></div>
        <h1 className="relative text-5xl md:text-7xl font-extrabold mb-4 heading-font" style={{ color: 'var(--text-primary)' }}>
          codo<span style={{ color: 'var(--accent-primary)' }}>AI</span>
        </h1>
      </div>
      <p className="max-w-xl text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
        Practice coding the smart way. Type from reference, debug, recall from
        memory, and pass test cases — with AI-powered hints, XP, levels, and a
        competitive mode.
      </p>

      <div className="flex gap-4 mb-6">
        <Link
          to={user ? "/dashboard" : "/login"}
          className="px-5 py-2 text-base cc-btn-primary"
        >
          {user ? "Go to Dashboard" : "Sign in to get started"}
        </Link>
        {!user && (
          <Link
            to="/login"
            className="px-5 py-2 text-base cc-btn-secondary"
          >
            Try as student
          </Link>
        )}
      </div>

      {user && (
        <div className="mt-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Logged in as <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>{user.name}</span> • Level{" "}
          <span className="font-semibold">{stats.level}</span> • XP{" "}
          <span className="font-semibold">{stats.xp}</span>
        </div>
      )}
    </div>
  );
}
