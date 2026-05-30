import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Zap, Bug, Target, Crown, User, CheckCircle2, Copy, Clock, Gamepad2, Megaphone, Shuffle } from "lucide-react";
import { API_BASE } from "../utils/api";

export default function LobbyRoom() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    console.log("[INFO] Current User:", { userId, username });
    
    // If userId is missing, fetch it
    if (!userId) {
      console.log("[WARNING] userId not in localStorage, fetching from API...");
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`${API_BASE}/users/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          console.log("[SUCCESS] Fetched user data:", data);
          localStorage.setItem("userId", data.id);
          localStorage.setItem("username", data.username);
          setCurrentUserId(data.id);
          setCurrentUsername(data.username);
        })
        .catch(err => console.error("[ERROR] Failed to fetch user:", err));
      }
    } else {
      setCurrentUserId(userId);
      setCurrentUsername(username);
    }
    
    fetchLobby();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchLobby, 2000);
    return () => clearInterval(interval);
  }, [gameId]);

  const fetchLobby = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("[ERROR] No authentication token found");
        alert("You must be logged in to view this lobby");
        navigate("/login");
        return;
      }
      
      console.log("[INFO] Fetching lobby:", gameId);
      
      const res = await fetch(`${API_BASE}/competitive/lobby/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Your session has expired. Please login again.");
          navigate("/login");
          return;
        }
        throw new Error("Lobby not found");
      }

      const data = await res.json();
      console.log("[SUCCESS] Lobby data received:", data.game_id, "Players:", data.players.length);
      setLobby(data);
      setLoading(false);

      // If game started, navigate to match
      if (data.status === "active" && data.match_id) {
        console.log("[INFO] Game started! Redirecting to match:", data.match_id);
        // Check game mode and redirect accordingly
        if (data.game_mode === "code_quiz") {
          navigate(`/quiz/${data.match_id}`);
        } else {
          navigate(`/competitive/${data.match_id}`);
        }
      }
    } catch (err) {
      console.error("Error fetching lobby:", err);
      setLoading(false);
      alert("Lobby not found or has been closed");
      navigate("/competitive");
    }
  };

  const handleStartGame = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/competitive/lobby/${gameId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to start game");
      }

      const data = await res.json();
      console.log("[ROCKET] Game started! Match ID:", data.match_id);
      // Redirect to match immediately - check game mode
      if (lobby.game_mode === "code_quiz") {
        navigate(`/quiz/${data.match_id}`);
      } else {
        navigate(`/competitive/${data.match_id}`);
      }
    } catch (err) {
      console.error("Error starting game:", err);
      alert(err.message || "Failed to start game");
    }
  };

  const handleLeaveLobby = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/competitive/lobby/${gameId}/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/competitive");
    } catch (err) {
      console.error("Error leaving lobby:", err);
      navigate("/competitive");
    }
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading lobby...</div>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Lobby not found</div>
      </div>
    );
  }

  const isHost = lobby.host_id === currentUserId || lobby.host_username === currentUsername;
  const playerCount = lobby.players.length;
  const maxPlayers = lobby.max_players;

  // Debug host check
  console.log("[DEBUG] Host Check:", {
    lobby_host_id: lobby.host_id,
    lobby_host_username: lobby.host_username,
    current_user_id: currentUserId,
    current_username: currentUsername,
    isHost: isHost
  });

  const gameModeIcons = {
    standard: <Zap size={32} />,
    bug_hunt: <Bug size={32} />,
    code_shuffle: <Shuffle size={32} />
  };

  const gameModeNames = {
    standard: "Code Sprint",
    bug_hunt: "Bug Hunt",
    code_shuffle: "Code Shuffle"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{lobby.lobby_name}</h1>
              <div className="flex items-center gap-4 text-gray-300">
                <span className="text-3xl">{gameModeIcons[lobby.game_mode] || <Gamepad2 size={32} />}</span>
                <span className="text-lg">{gameModeNames[lobby.game_mode]}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-gray-400 text-sm mb-1">Game ID</div>
              <div className="flex items-center gap-2">
                <div className="bg-purple-600/30 px-6 py-3 rounded-lg font-mono text-3xl font-bold text-white tracking-wider border-2 border-purple-500">
                  {gameId}
                </div>
                <button
                  onClick={copyGameId}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  title="Copy Game ID"
                >
                  {copySuccess ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              </div>
              {copySuccess && (
                <div className="text-green-400 text-sm mt-1">Copied to clipboard!</div>
              )}
            </div>
          </div>

          {/* Game Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Host</div>
              <div className="text-white font-semibold">{lobby.host_username}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Players</div>
              <div className="text-white font-semibold">{playerCount} / {maxPlayers}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Time Limit</div>
              <div className="text-white font-semibold">{lobby.time_limit_seconds / 60} min</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Status</div>
              <div className="text-yellow-400 font-semibold">
                {lobby.status === "waiting" ? (
                  <span className="flex items-center gap-1"><Clock size={16} /> Waiting</span>
                ) : (
                  <span className="flex items-center gap-1"><Gamepad2 size={16} /> Starting</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Always Visible */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-4">
              {isHost ? (
                <button
                  onClick={handleStartGame}
                  disabled={playerCount < 2}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-5 px-8 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl text-lg flex items-center justify-center gap-3"
                >
                  <Gamepad2 size={24} />
                  {playerCount < 2 ? "Need at least 2 players to start" : "Start Game Now!"}
                </button>
              ) : (
                <div className="flex-1 bg-yellow-600/20 border-2 border-yellow-600 text-yellow-300 font-bold py-5 px-8 rounded-xl text-center text-lg flex items-center justify-center gap-3">
                  <Clock size={24} />
                  Waiting for host to start the game...
                </div>
              )}
              <button
                onClick={handleLeaveLobby}
                className="sm:w-48 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-8 rounded-xl transition-all shadow-xl text-lg flex items-center justify-center gap-2"
              >
                <span>✕</span> Leave Lobby
              </button>
            </div>
            
            {/* Host instructions */}
            {isHost && playerCount >= 2 && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-300 text-center font-semibold">
                  Ready to start! All players are in the lobby. Click "Start Game Now!" when ready.
                </p>
              </div>
            )}
            
            {/* Non-host info */}
            {!isHost && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-center flex items-center justify-center gap-2">
                  <Crown size={18} className="text-yellow-400" />
                  <span className="font-semibold">{lobby.host_username}</span> is the host and will start the game
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Players in Lobby</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lobby.players.map((player, index) => (
              <div
                key={player.user_id}
                className={`p-4 rounded-lg border-2 ${player.user_id === currentUserId
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-white/20 bg-white/5"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold text-lg">
                      {player.username}
                      {player.user_id === lobby.host_id && (
                        <span className="ml-2 text-yellow-400"><Crown size={18} /></span>
                      )}
                      {player.user_id === currentUserId && (
                        <span className="ml-2 text-purple-400">(You)</span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">Player #{index + 1}</div>
                  </div>
                  <CheckCircle2 className="text-green-400" size={24} />
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: maxPlayers - playerCount }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="p-4 rounded-lg border-2 border-dashed border-white/10 bg-white/5"
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500 text-center">
                    <User size={32} className="text-gray-500 mx-auto mb-2" />
                    <div className="text-sm">Waiting for player...</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-500/10 backdrop-blur-md rounded-xl p-6 border-2 border-blue-500/30">
          <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
            <Megaphone size={24} /> How to Invite Players
          </h3>
          <ol className="text-gray-300 space-y-2 list-decimal list-inside">
            <li>Share the Game ID <span className="font-mono font-bold text-white">{gameId}</span> with your friends</li>
            <li>They can join by clicking "Join Game" and entering the Game ID</li>
            <li>Once enough players join, the host can start the game</li>
            <li>Everyone competes to solve the same problem - fastest wins!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
