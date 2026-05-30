import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

export default function Navbar({ user, onLogout, theme, toggleTheme }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header 
      className="sticky top-0 z-40 border-b backdrop-blur transition-colors duration-300"
      style={{ 
        borderColor: 'var(--border-color)',
        backgroundColor: 'rgba(var(--bg-primary-rgb), 0.8)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>
            ProEduvate
          </div>
          {!isLanding && (
            <div className="hidden sm:block text-lg font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              codoAI
            </div>
          )}
        </div>

        {!isLanding && (
          <nav className="hidden md:flex items-center gap-4 text-xs">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border transition-colors duration-200 ${isActive
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
                  : "border-transparent hover:border-emerald-500/30"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : {}}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/problems"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border transition-colors duration-200 ${isActive
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
                  : "border-transparent hover:border-emerald-500/30"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : {}}
            >
              Problems
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border transition-colors duration-200 ${isActive
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
                  : "border-transparent hover:border-emerald-500/30"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : {}}
            >
              Profile
            </NavLink>
            <NavLink
              to="/competitive"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border transition-colors duration-200 ${isActive
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
                  : "border-transparent hover:border-emerald-500/30"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : {}}
            >
              Competitive
            </NavLink>
            {user?.isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-1 rounded-full border transition-colors duration-200 ${isActive
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
                    : "border-transparent hover:border-emerald-500/30"
                  }`}
                style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : {}}
              >
                Admin
              </NavLink>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="h-8 w-8 flex items-center justify-center rounded-full border transition-all duration-200 hover:border-emerald-500 hover:text-emerald-400"
            style={{ 
              borderColor: 'var(--border-light)',
              color: 'var(--text-secondary)'
            }}
            title="Toggle theme"
          >
            {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {user ? (
            <>
              <div 
                className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full border bg-opacity-80 transition-colors duration-300"
                style={{ 
                  borderColor: 'var(--border-light)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-emerald-400 to-sky-400 flex items-center justify-center text-xs font-bold text-slate-900">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {user.name}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {user.preferredLanguage?.toUpperCase() || "PYTHON"}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-xs px-3 py-1 rounded-full border transition-colors duration-200 hover:border-rose-500 hover:text-rose-400"
                style={{ 
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-secondary)'
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            !isLanding && (
              <Link
                to="/login"
                className="text-xs px-3 py-1 rounded-full bg-emerald-500 text-white font-semibold transition-all duration-200 hover:bg-emerald-600"
              >
                Sign in
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
