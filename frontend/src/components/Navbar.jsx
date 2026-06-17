import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

export default function Navbar({ user, onLogout, theme, toggleTheme, currentLanguage, setCurrentLanguage }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
                className="hidden md:block text-sm px-3 py-1 rounded-full border transition-colors duration-200"
                style={{ 
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-secondary)'
                }}
              >
                Sign out
              </button>
              
              <button
                onClick={toggleMobileMenu}
                className="md:hidden h-8 w-8 flex items-center justify-center rounded-full border transition-all duration-200"
                style={{ 
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-secondary)'
                }}
                title="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
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

      {/* Mobile navigation menu overlay */}
      {user && isMobileMenuOpen && (
        <div 
          className="md:hidden border-t py-4 px-6 flex flex-col gap-4 transition-colors duration-300"
          style={{ 
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          <nav className="flex flex-col gap-2">
            <NavLink
              to="/dashboard"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl border text-sm font-semibold transition-colors duration-200 ${isActive
                  ? "cc-pill"
                  : "border-transparent"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/problems"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl border text-sm font-semibold transition-colors duration-200 ${isActive
                  ? "cc-pill"
                  : "border-transparent"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
            >
              Problems
            </NavLink>
            <NavLink
              to="/profile"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl border text-sm font-semibold transition-colors duration-200 ${isActive
                  ? "cc-pill"
                  : "border-transparent"
                }`}
              style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
            >
              Profile
            </NavLink>
            <NavLink
              to="/competitive"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl border text-sm font-semibold transition-colors duration-200 ${isActive
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
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl border text-sm font-semibold transition-colors duration-200 ${isActive
                    ? "cc-pill"
                    : "border-transparent"
                  }`}
                style={({ isActive }) => !isActive ? { color: 'var(--text-secondary)' } : { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
              >
                Admin
              </NavLink>
            )}
          </nav>

          <div 
            className="flex items-center gap-3 p-3 rounded-xl border bg-opacity-80 mt-2"
            style={{ 
              borderColor: 'var(--border-light)',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-strong))' }}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col leading-tight flex-1">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Preferred Language: {user.preferredLanguage?.toUpperCase() || "PYTHON"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              closeMobileMenu();
              onLogout();
            }}
            className="w-full text-center text-sm py-2.5 rounded-xl border font-semibold hover:bg-[var(--bg-hover)] transition-colors duration-200"
            style={{ 
              borderColor: 'var(--border-light)',
              color: 'var(--text-secondary)'
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
