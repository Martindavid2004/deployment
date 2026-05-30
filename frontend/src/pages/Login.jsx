import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../utils/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Try to login via backend
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        const loginSuccess = await onLogin(username.trim());
        if (loginSuccess !== false) {
          navigate("/dashboard");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || "Invalid username or password.");
      }
    } catch (err) {
      setError(`Connection error: ${err.message}. Make sure the backend is running.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm rounded-2xl border border-emerald-500/60 bg-slate-950/90 p-6 shadow-xl">
        <h1 className="text-lg font-semibold mb-1">Sign in to codoAI</h1>
        <p className="text-xs text-slate-400 mb-4">
          Use any username + password. Login as <b>admin</b> to access the admin
          panel.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="text-xs flex flex-col gap-1">
            <label>Username</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. wesley"
            />
          </div>
          <div className="text-xs flex flex-col gap-1">
            <label>Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="text-[11px] text-rose-300">{error}</div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 rounded-full bg-emerald-500 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
