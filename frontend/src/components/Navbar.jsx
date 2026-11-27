import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, Save, Edit3, Sparkles } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { updateUserProfile } from "../api";
import { showToast } from "./ui/ToastProvider";

const FACTIONS = [
  {
    id: "sorcerer",
    name: "Syntax Sorcerer",
    desc: "Masters of language structure & compiler error remediation.",
    color: "#6a9641",
    gradient: "linear-gradient(135deg, #7fae51, #6a9641)"
  },
  {
    id: "berserker",
    name: "Binary Berserker",
    desc: "Raw algorithmic speed, clearing compiler rounds at lightning velocity.",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #f43f5e, #be123c)"
  },
  {
    id: "legend",
    name: "Logic Legend",
    desc: "Elite bug spotters, analyzing compiler edge cases with maximum precision.",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24, #d97706)"
  }
];

export default function Navbar({ user, setUser, onLogout, theme, toggleTheme, currentLanguage, setCurrentLanguage }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editLanguage, setEditLanguage] = useState(user?.preferredLanguage || "python");
  const [editFaction, setEditFaction] = useState(user?.faction || "sorcerer");

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Escape closes the profile dialog and the mobile menu.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setShowProfileDropdown(false);
      setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
              to="/algorithms"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border transition-colors duration-200 flex items-center gap-1.5 ${isActive
                  ? "cc-pill"
                  : "border-purple-500/40 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20"
                }`}
              style={({ isActive }) => isActive ? { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' } : {}}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Algorithm Hub
            </NavLink>
            <NavLink
              to="/intuition"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border transition-colors duration-200 flex items-center gap-1.5 ${isActive
                  ? "cc-pill"
                  : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                }`}
              style={({ isActive }) => isActive ? { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' } : {}}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Intuition Loop
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
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            aria-pressed={theme === "dark"}
          >
            {theme === "dark" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
          </button>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setEditName(user.name || "");
                  setEditLanguage(user.preferredLanguage || "python");
                  setEditFaction(user.faction || "sorcerer");
                }}
                className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border bg-opacity-80 transition-all duration-300 hover:border-[var(--accent-primary)] hover:scale-[1.02] cursor-pointer"
                style={{ 
                  borderColor: 'var(--border-light)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                title="Profile Settings"
                aria-haspopup="dialog"
                aria-expanded={showProfileDropdown}
                aria-controls="profile-settings-dialog"
              >
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold text-white font-mono" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-strong))' }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {user.name}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {user.preferredLanguage?.toUpperCase() || "PYTHON"}
                  </span>
                </div>
              </button>

              {showProfileDropdown && (
                <div 
                  id="profile-settings-dialog"
                  role="dialog"
                  aria-label="Edit profile settings"
                  className="absolute right-0 mt-3 w-[380px] p-5 rounded-2xl border backdrop-blur-md shadow-2xl z-50 flex flex-col gap-4 text-left"
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    borderColor: 'var(--border-color)',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                  }}
                >
                  <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="text-sm font-extrabold heading-font text-[var(--text-primary)]">Edit Profile Settings</h3>
                    <div className="flex items-center gap-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="text-[11px] font-semibold text-emerald-400 hover:underline"
                      >
                        Full Profile
                      </Link>
                      <button 
                        onClick={() => setShowProfileDropdown(false)} 
                        className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        aria-label="Close profile settings"
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="profile-username" className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Username</label>
                    <input
                      id="profile-username"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border outline-none transition-all focus:border-[var(--accent-primary)]"
                      style={{
                        borderColor: 'var(--border-light)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)'
                      }}
                      maxLength={15}
                    />
                  </div>

                  {/* Preferred Language */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="profile-language" className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Preferred Compiler</label>
                    <select
                      id="profile-language"
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border outline-none font-semibold cursor-pointer transition-all focus:border-[var(--accent-primary)] text-[var(--text-primary)]"
                      style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                  </div>

                  {/* Faction selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Select Faction Avatar</label>
                    <div className="grid grid-cols-2 gap-1.5 pr-1">
                      {FACTIONS.map((fac) => (
                        <button
                          key={fac.id}
                          onClick={() => setEditFaction(fac.id)}
                          className="p-2 rounded-lg border text-left transition-all flex flex-col gap-0.5 cursor-pointer"
                          style={{
                            borderColor: editFaction === fac.id ? fac.color : 'var(--border-color)',
                            backgroundColor: editFaction === fac.id ? 'rgba(255,255,255,0.02)' : 'var(--bg-tertiary)'
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: fac.color }} />
                            <span className="text-[10px] font-bold" style={{ color: editFaction === fac.id ? fac.color : 'var(--text-primary)' }}>{fac.name}</span>
                          </div>
                          <p className="text-[9px] leading-relaxed text-[var(--text-tertiary)]">{fac.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save/Cancel Actions */}
                  <div className="flex gap-2 border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex-1 py-1.5 text-xs font-bold border rounded-lg hover:bg-[var(--bg-hover)] transition-all cursor-pointer flex items-center justify-center gap-1 text-[var(--text-secondary)]"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        const trimmed = editName.trim();
                        if (!trimmed) return;
                        try {
                          const updated = await updateUserProfile({
                            name: trimmed,
                            preferredLanguage: editLanguage,
                            faction: editFaction,
                          });
                          if (setUser) {
                            setUser({
                              ...user,
                              name: updated.username || trimmed,
                              preferredLanguage: updated.preferred_language || editLanguage,
                              faction: updated.faction || editFaction,
                            });
                          }
                          if (setCurrentLanguage) {
                            setCurrentLanguage(updated.preferred_language || editLanguage);
                          }
                          showToast("Profile updated!", "success");
                          setShowProfileDropdown(false);
                        } catch (err) {
                          showToast(err.message || "Failed to update profile", "error");
                        }
                      }}
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cc-btn-primary"
                    >
                      <Save size={10} /> Save
                    </button>
                  </div>

                  {/* Sign Out inside the settings */}
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-center text-xs py-1.5 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold transition-all"
                  >
                    Sign out
                  </button>
                </div>
              )}

              <button
                onClick={toggleMobileMenu}
                className="sm:hidden h-8 w-8 flex items-center justify-center rounded-full border transition-all duration-200"
                style={{ 
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-secondary)'
                }}
                title="Toggle navigation menu"
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {isMobileMenuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
              </button>
            </div>
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
          id="mobile-navigation"
          className="md:hidden border-t py-4 px-6 flex flex-col gap-4 transition-colors duration-300"
          style={{ 
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
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
              to="/algorithms"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl border text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${isActive
                  ? "cc-pill"
                  : "border-purple-500/40 text-purple-300 bg-purple-500/10"
                }`}
              style={({ isActive }) => isActive ? { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' } : {}}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Algorithm Hub & System Design
            </NavLink>
            <NavLink
              to="/intuition"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl border text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${isActive
                  ? "cc-pill"
                  : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                }`}
              style={({ isActive }) => isActive ? { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' } : {}}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Intuition Loop (Play ➔ Defend)
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
