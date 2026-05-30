import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../utils/api";

export default function Register({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("python");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm rounded-2xl border border-emerald-500/60 bg-slate-950/90 p-6 shadow-xl">
        <h1 className="text-lg font-semibold mb-1">Create Account</h1>
        <p className="text-xs text-slate-400 mb-4">
          Join codoAI and start your coding journey. Use <b>admin</b> as username for admin access.
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
          <div className="text-xs flex flex-col gap-1">
            <label>Confirm Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="text-xs flex flex-col gap-1">
            <label>Preferred Language</label>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-emerald-500"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          {error && (
            <div className="text-[11px] text-rose-300">{error}</div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 rounded-full bg-emerald-500 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
