import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

export default function Navbar({ user, onLogout, theme, toggleTheme, currentLanguage, setCurrentLanguage }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header 
      className="sticky top-0 z-40 border-b backdrop-blur transition-colors duration-300"
      style={{ 
        borderColor: 'var(--border-color)',
        backgroundColor: 'rgba(var(--bg-primary-rgb), 0.9)'
      }}
    >
      <div className="w-full 2xl:max-w-[1920px] mx-auto px-4 md:px-8 xl:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>
            ProEduvate
          </div>
          {!isLanding && (
            <div className="hidden sm:block text-xl font-bold heading-font" style={{ color: 'var(--accent-primary)' }}>
              codoAI
            </div>
          )}
        </div>

        {user && (
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border transition-colors duration-200 ${isActive
                  ? "cc-pill"
                  : "border-transparent"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/problems"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border transition-colors duration-200 ${isActive
                  ? "cc-pill"
                  : "border-transparent"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
            >
              Problems
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border transition-colors duration-200 ${isActive
                  ? "cc-pill"
                  : "border-transparent"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
            >
              Profile
            </NavLink>
            <NavLink
              to="/competitive"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border transition-colors duration-200 ${isActive
                  ? "cc-pill"
                  : "border-transparent"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
            >
              Competitive
            </NavLink>
            {user?.isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-1 rounded-full border transition-colors duration-200 ${isActive
                    ? "cc-pill"
                    : "border-transparent"
                  }`}
                style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
              >
                Admin
              </NavLink>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user && currentLanguage && setCurrentLanguage && (
            <div className="mr-1">
              <LanguageSelector
                current={currentLanguage}
                onChange={setCurrentLanguage}
              />
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="h-8 w-8 flex items-center justify-center rounded-full border transition-all duration-200"
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
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-strong))' }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {user.name}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {user.preferredLanguage?.toUpperCase() || "PYTHON"}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-sm px-3 py-1 rounded-full border transition-colors duration-200"
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
                className="text-sm px-3 py-1 cc-btn-primary"
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
