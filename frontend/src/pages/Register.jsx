import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Terminal, Shield, ArrowRight, Activity, Terminal as Console } from "lucide-react";
import { API_BASE } from "../utils/api";

export default function Register({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("python");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Terminal simulator states
  const [terminalLogs, setTerminalLogs] = useState([
    { type: "info", text: "codoai_register --create" },
    { type: "success", text: "[OK] Calibrating fresh workspace registry..." },
    { type: "info", text: "Allocating XP level metrics: Level 1 (Acolyte) initialized." },
    { type: "success", text: "[OK] XP profiles seeded." },
    { type: "user", text: "Awaiting authentication input stream..." }
  ]);

  const mockLogPool = [
    { type: "info", text: "Mounting Monaco Code Editor framework..." },
    { type: "success", text: "[OK] Editor mounted successfully." },
    { type: "info", text: "Establishing secure diagnostics tunnels..." },
    { type: "warn", text: "[OK] Assigned 1.5x active active streaks multiplier." },
    { type: "info", text: "Loading diagnostics pools: 7 algorithmic units loaded." },
    { type: "success", text: "[READY] Pipelines operational." },
    { type: "user", text: "Awaiting compiler credentials handshake..." }
  ];

  // Terminal typing simulation loop
  useEffect(() => {
    let poolIndex = 0;
    const logInterval = setInterval(() => {
      setTerminalLogs((prev) => {
        const nextLogs = [...prev, mockLogPool[poolIndex]];
        if (nextLogs.length > 7) {
          nextLogs.shift();
        }
        return nextLogs;
      });
      poolIndex = (poolIndex + 1) % mockLogPool.length;
    }, 2000);

    return () => clearInterval(logInterval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          preferred_language: preferredLanguage
        })
      });

      if (registerResponse.ok) {
        // Now login after registration
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim()
          })
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          localStorage.setItem("token", data.access_token);
          const loginSuccess = await onLogin(username.trim());
          if (loginSuccess !== false) {
            navigate("/dashboard");
          }
        } else {
          setError("Registration successful! Please login.");
          navigate("/login");
        }
      } else {
        const errorData = await registerResponse.json().catch(() => ({}));
        setError(errorData.detail || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(`Connection error: ${err.message}. Make sure the backend is running.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-10 px-4 overflow-hidden">
      {/* Ambient background glow spheres */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[var(--accent-soft)] blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[rgba(99,102,241,0.08)] blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '10s' }} />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Animated Terminal Log (hidden on mobile) */}
        <div className="hidden md:flex md:col-span-6 lg:col-span-7 flex-col gap-6 text-left">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent-primary)] bg-[var(--accent-soft)] px-3.5 py-1 rounded-full border border-[rgba(99,102,241,0.15)]">
              Registry operational
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold heading-font tracking-tight mt-3 bg-gradient-to-r from-[var(--accent-primary)] to-[#c084fc] bg-clip-text text-transparent">
              codoAI
            </h1>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Spot compiler flaws, refactor round-by-round, compile code in seconds, and dominate 1v1 arenas.
            </p>
          </div>

          {/* Typing compiler console block */}
          <div 
            className="p-5 rounded-2xl border font-mono text-xs shadow-2xl relative overflow-hidden h-64 flex flex-col justify-between"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'rgba(9, 11, 17, 0.75)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            {/* Header toolbar */}
            <div className="flex items-center justify-between border-b pb-2 mb-3" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold uppercase ml-2 text-gray-500">compiler_registration_stream</span>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Scrolling terminal logs */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2 leading-relaxed whitespace-pre-wrap select-none transition-all duration-300">
                  <span className="text-gray-600 font-bold">&gt;</span>
                  <span
                    style={{
                      color:
                        log.type === "success"
                          ? "var(--ok-soft)"
                          : log.type === "warn"
                          ? "var(--warn-soft)"
                          : log.type === "user"
                          ? "var(--accent-primary)"
                          : "var(--text-secondary)"
                    }}
                  >
                    {log.text}
                  </span>
                </div>
              ))}
              <div className="flex gap-2">
                <span className="text-gray-600 font-bold">&gt;</span>
                <span className="h-3.5 w-1.5 bg-[var(--accent-primary)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic form */}
        <div className="col-span-1 md:col-span-6 lg:col-span-5 w-full">
          <div className="p-6 cc-card backdrop-blur-md relative overflow-hidden">
            <h2 className="text-2xl font-extrabold heading-font tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
              Create Account
            </h2>
            <p className="text-xs mb-5" style={{ color: 'var(--text-tertiary)' }}>
              Seize diagnostic rounds and start your journey.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Username Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-xl border pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-[var(--accent-primary)]"
                    style={{ borderColor: 'var(--input-border)' }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. wesley"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    className="w-full rounded-xl border pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-[var(--accent-primary)]"
                    style={{ borderColor: 'var(--input-border)' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    className="w-full rounded-xl border pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-[var(--accent-primary)]"
                    style={{ borderColor: 'var(--input-border)' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Preferred Language Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Preferred Compiler</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Console size={14} />
                  </span>
                  <select
                    className="w-full rounded-xl border pl-10 pr-4 py-2 text-sm outline-none font-semibold cursor-pointer transition-all focus:border-[var(--accent-primary)]"
                    style={{ borderColor: 'var(--input-border)' }}
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                  >
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>
              </div>

              {error && (
                <div 
                  className="text-xs p-2.5 rounded-xl border flex items-center gap-1.5 font-semibold text-[var(--danger-soft)]" 
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                >
                  <Activity size={12} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-sm font-bold flex items-center justify-center gap-1.5 cc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {isLoading ? "Provisioning handshake..." : (
                  <>Sign Up <ArrowRight size={14} /></>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Already have an account?{" "}
              <Link to="/login" className="cc-link font-bold uppercase tracking-wider hover:underline ml-1">
                Sign In
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
