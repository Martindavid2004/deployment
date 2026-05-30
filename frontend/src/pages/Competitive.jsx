import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Zap, Bug, Target, Gamepad2, DoorOpen, CheckCircle2, Shuffle } from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import { API_BASE } from "../utils/api";

export default function Competitive({ attempts, problems, stats }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(1200);
  const [selectedGameMode, setSelectedGameMode] = useState("standard");

  const gameModes = [
    {
      id: "standard",
      name: "Code Sprint",
      description: "Classic competitive coding - solve the problem fastest",
      icon: <Zap size={20} />,
      color: "emerald"
    },
    {
      id: "bug_hunt",
      name: "Bug Hunt",
      description: "Find and fix bugs in broken code",
      icon: <Bug size={20} />,
      color: "red"
    },
    {
      id: "code_shuffle",
      name: "Code Shuffle",
      description: "Rearrange shuffled code lines in the correct order",
      icon: <Shuffle size={20} />,
      color: "purple"
    }
  ];

  useEffect(() => {
    fetchMatches();
    fetchLeaderboard();
    fetchUserRating();
  }, []);

  const fetchUserRating = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRating(data.rating || 1200);
    } catch (err) {
      console.error("Error fetching user rating:", err);
    }
  };

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/competitive/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMatches(data.slice(0, 5)); // Show last 5 matches
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/competitive/leaderboard?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  const startMatchmaking = async (gameMode = selectedGameMode) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      console.log("[INFO] Starting matchmaking with game mode:", gameMode);

      const res = await fetch(`${API_BASE}/competitive/matchmaking`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          game_mode: gameMode
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`HTTP ${res.status}: ${errorText}`);
        alert(`Failed to start matchmaking: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.match_id) {
        // Navigate to match page
        navigate(`/competitive/match/${data.match_id}`);
      }

      fetchMatches();
    } catch (err) {
      console.error("Error starting matchmaking:", err);
      alert("Failed to start matchmaking: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMatchStatus = (match) => {
    if (match.status === "waiting") return "Waiting for opponent";
    if (match.status === "active") return "In Progress";
    if (match.status === "completed") return "Completed";
    return match.status;
  };

  const getGameModeName = (modeId) => {
    const mode = gameModes.find(m => m.id === modeId);
    return mode ? mode.name : "Code Sprint";
  };

  const getGameModeColor = (modeId) => {
    const mode = gameModes.find(m => m.id === modeId);
    return mode ? mode.color : "emerald";
  };

  return (
    <div>
      <div className="border border-emerald-500/50 rounded-2xl p-4 bg-slate-950/90">
        <h1 className="text-xl font-semibold mb-1">
          Competitive mode{" "}
          <span className="text-[11px] uppercase text-emerald-300 bg-emerald-500/10 px-2 py-[2px] rounded-full">
            live
          </span>
        </h1>
        <p className="text-xs text-slate-400 mb-4">
          Compete against other players in timed coding challenges! Play 1v1 or create multiplayer lobbies up to 15 players.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-4 text-xs">
          <div className="border border-slate-700 rounded-xl p-3">
            <div className="text-slate-400 mb-1">Your Rating</div>
            <div className="text-2xl font-semibold text-emerald-400">{rating}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Win matches to increase your rating. Higher rating = tougher opponents!
            </div>
          </div>
          <div className="border border-slate-700 rounded-xl p-3">
            <div className="text-slate-400 mb-1">
              Level progress (Level {stats.level})
            </div>
            <ProgressBar value={stats.levelProgress} big />
            <div className="text-[11px] text-slate-400 mt-1">
              XP: {stats.xp}. Win competitive matches for bonus XP.
            </div>
          </div>
        </div>

        {/* Multiplayer Options */}
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => navigate("/lobby/create")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-sm"
          >
            <Gamepad2 size={24} className="mb-1 mx-auto" />
            <div>Create Lobby</div>
            <div className="text-xs opacity-80">Host a game (2-15 players)</div>
          </button>
          <button
            onClick={() => navigate("/lobby/join")}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg text-sm"
          >
            <DoorOpen size={24} className="mb-1 mx-auto" />
            <div>Join Lobby</div>
            <div className="text-xs opacity-80">Enter game ID to join</div>
          </button>
          <button
            onClick={() => startMatchmaking(selectedGameMode)}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Zap size={24} className="mb-1 mx-auto" />
            <div>{loading ? "Finding..." : "Quick 1v1"}</div>
            <div className="text-xs opacity-80">Find opponent instantly</div>
          </button>
        </div>

        {/* Game Mode Selection */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2 text-slate-300">Select Game Mode for Quick 1v1</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {gameModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedGameMode(mode.id)}
                className={`text-left border rounded-lg p-3 transition-all ${selectedGameMode === mode.id
                  ? `border-${mode.color}-500 bg-${mode.color}-500/10`
                  : "border-slate-700 hover:border-slate-600"
                  }`}
              >
                <div className="flex items-start gap-2">
                  <div className="text-xl">{mode.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${selectedGameMode === mode.id ? `text-${mode.color}-400` : "text-slate-200"
                      }`}>
                      {mode.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{mode.description}</div>
                  </div>
                  {selectedGameMode === mode.id && (
                    <CheckCircle2 size={16} className={`text-${mode.color}-400`} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-slate-700 rounded-2xl p-4 mt-4 text-xs">
        <h2 className="text-sm font-semibold mb-2">Game Modes Explained</h2>
        <div className="space-y-2 text-slate-300">
          <div>
            <span className="font-medium text-emerald-400">Code Sprint:</span> Classic competitive programming. Both players solve the same problem. Fastest correct solution wins.
          </div>
          <div>
            <span className="font-medium text-red-400">Bug Hunt:</span> Given buggy code with intentional errors. Debug and fix the code to make all tests pass. Speed matters!
          </div>
          <div>
            <span className="font-medium text-purple-400">Code Shuffle:</span> Code lines are shuffled randomly. Rearrange them in the correct logical order. Tests accuracy and code understanding.
          </div>
        </div>
      </div>

      {/* Recent Matches */}
      {matches.length > 0 && (
        <div className="border border-slate-700 rounded-2xl p-4 mt-4">
          <h2 className="text-sm font-semibold mb-3">Recent Matches</h2>
          <div className="space-y-2">
            {matches.map((match) => (
              <Link
                key={match.id}
                to={match.status === "active" ? `/competitive/match/${match.id}` : "#"}
                className={`block border border-slate-700 rounded-lg p-3 text-xs ${match.status === "active" ? "hover:border-emerald-500 cursor-pointer" : ""
                  }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">
                      {match.player1.username} vs {match.player2?.username || "Waiting..."}
                    </div>
                    <div className={`text-[10px] px-2 py-0.5 rounded-full bg-${getGameModeColor(match.game_mode)}-500/10 text-${getGameModeColor(match.game_mode)}-400`}>
                      {getGameModeName(match.game_mode)}
                    </div>
                  </div>
                  <div className={`text-[10px] uppercase px-2 py-1 rounded-full ${match.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                    match.status === "active" ? "bg-blue-500/10 text-blue-400" :
                      "bg-slate-700 text-slate-400"
                    }`}>
                    {getMatchStatus(match)}
                  </div>
                </div>
                <div className="text-slate-400 text-[11px]">
                  {match.winner_id && (
                    <span className="text-emerald-400">
                      Winner: {match.player1.user_id === match.winner_id ? match.player1.username : match.player2.username}
                    </span>
                  )}
                  {!match.winner_id && match.status === "waiting" && (
                    <span>Waiting for opponent to join...</span>
                  )}
                  {!match.winner_id && match.status === "active" && (
                    <span className="text-blue-400">Click to join match →</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="border border-slate-700 rounded-2xl p-4 mt-4">
          <h2 className="text-sm font-semibold mb-3">Top Players</h2>
          <div className="space-y-2">
            {leaderboard.map((player, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs border border-slate-700 rounded-lg p-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold ${idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                    idx === 1 ? "bg-slate-400/20 text-slate-300" :
                      idx === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-slate-700 text-slate-400"
                    }`}>
                    {player.rank}
                  </div>
                  <div className="font-medium">{player.username}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-slate-400">
                    <span className="text-emerald-400 font-semibold">{player.rating}</span> rating
                  </div>
                  <div className="text-slate-400">
                    Lvl {player.level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
