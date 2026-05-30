import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { API_BASE } from "../utils/api";

export default function LobbyJoin() {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinLobby = async (e) => {
    e.preventDefault();
    if (!gameId.trim()) {
      alert("Please enter a Game ID");
      return;
    }

    // Check authentication first
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to join a lobby. Please login first.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      console.log("[INFO] Attempting to join lobby:", gameId.toUpperCase().trim());
      
      const res = await fetch(`${API_BASE}/competitive/lobby/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ game_id: gameId.toUpperCase().trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("[ERROR] Join error:", error);
        
        // Handle specific error cases
        if (res.status === 401) {
          alert("Your session has expired. Please login again.");
          navigate("/login");
          return;
        }
        
        throw new Error(error.detail || "Failed to join lobby");
      }

      const data = await res.json();
      console.log("[SUCCESS] Successfully joined lobby:", data.lobby.game_id);
      
      // Navigate to lobby room
      navigate(`/lobby/${data.lobby.game_id}`);
    } catch (err) {
      console.error("Error joining lobby:", err);
      alert(err.message || "Failed to join lobby. Check the Game ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Gamepad2 size={64} className="text-purple-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Join Game</h1>
            <p className="text-gray-300">Enter the Game ID to join a lobby</p>
          </div>

          <form onSubmit={handleJoinLobby} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Game ID
              </label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength="6"
                className="w-full px-6 py-4 rounded-lg bg-white/10 border-2 border-white/20 text-white text-center text-3xl font-mono font-bold tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
              <p className="text-gray-400 text-sm mt-2 text-center">
                Enter the 6-character code shared by the host
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !gameId.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? "Joining..." : "Join Lobby"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/competitive")}
                className="px-6 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Back
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-gray-400 mb-3">Don't have a Game ID?</p>
              <button
                onClick={() => navigate("/lobby/create")}
                className="text-purple-400 hover:text-purple-300 font-semibold underline"
              >
                Create Your Own Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
