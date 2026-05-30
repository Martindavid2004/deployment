import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Bug, Target, Bot, Shuffle, Brain } from "lucide-react";
import { API_BASE } from "../utils/api";

export default function LobbyCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    game_mode: "standard",
    time_limit_seconds: 900,
    max_players: 5,
    lobby_name: "",
    quiz_language: "python",
    quiz_question_count: 10
  });

  const gameModes = [
    {
      id: "standard",
      name: "Code Sprint",
      description: "Classic competitive coding - solve the problem fastest",
      icon: <Zap size={32} />
    },
    {
      id: "bug_hunt",
      name: "Bug Hunt",
      description: "Find and fix bugs in broken code",
      icon: <Bug size={32} />
    },
    {
      id: "code_shuffle",
      name: "Code Shuffle",
      description: "Rearrange shuffled code lines in the correct order",
      icon: <Shuffle size={32} />
    },
    {
      id: "code_quiz",
      name: "Code Quiz",
      description: "Answer programming questions - test your knowledge!",
      icon: <Brain size={32} />
    }
  ];

  const handleCreateLobby = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/competitive/lobby/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to create lobby");
      }

      const data = await res.json();
      // Navigate to lobby waiting room
      navigate(`/lobby/${data.game_id}`);
    } catch (err) {
      console.error("Error creating lobby:", err);
      alert(err.message || "Failed to create lobby");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">Create Multiplayer Lobby</h1>
            <p className="text-gray-300">Set up a game for up to 15 players - AI will generate a random problem!</p>
          </div>

          <form onSubmit={handleCreateLobby} className="space-y-6">
            {/* AI Generation Info */}
            <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-4 border-2 border-blue-500/30">
              <div className="flex items-start gap-3">
                <Bot size={32} className="text-blue-400" />
                <div>
                  <h3 className="text-lg font-bold text-blue-300 mb-1">AI-Generated Problems</h3>
                  <p className="text-sm text-gray-300">
                    Each game will feature a unique, randomly generated coding problem created by AI!
                    The difficulty is chosen automatically to provide the best competitive experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Lobby Name */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Lobby Name (Optional)
              </label>
              <input
                type="text"
                value={formData.lobby_name}
                onChange={(e) => setFormData({ ...formData, lobby_name: e.target.value })}
                placeholder="My Awesome Game"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Game Mode Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Select Game Mode
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameModes.map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => setFormData({ ...formData, game_mode: mode.id })}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.game_mode === mode.id
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-white/20 bg-white/5 hover:border-purple-400"
                      }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-3xl mr-3">{mode.icon}</span>
                      <h3 className="text-lg font-bold text-white">{mode.name}</h3>
                    </div>
                    <p className="text-sm text-gray-300">{mode.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Quiz Specific Fields */}
            {formData.game_mode === "code_quiz" && (
              <>
                {/* Language Selection */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Programming Language
                  </label>
                  <select
                    value={formData.quiz_language}
                    onChange={(e) => setFormData({ ...formData, quiz_language: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="python" className="bg-slate-800">Python</option>
                    <option value="java" className="bg-slate-800">Java</option>
                    <option value="cpp" className="bg-slate-800">C++</option>
                  </select>
                </div>

                {/* Question Count */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Question Count
                  </label>
                  <select
                    value={formData.quiz_question_count}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      setFormData({
                        ...formData,
                        quiz_question_count: count,
                        time_limit_seconds: count * 30  // Auto-calculate: 30 seconds per question
                      });
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {[5, 10, 15, 20, 30, 40, 50, 60].map(n => (
                      <option key={n} value={n} className="bg-slate-800">{n} questions</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-400 mt-2">
                    Time limit: {Math.floor(formData.time_limit_seconds / 60)} minutes ({formData.time_limit_seconds} seconds)
                  </p>
                </div>
              </>
            )}

            {/* Max Players */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Maximum Players: {formData.max_players}
              </label>
              <input
                type="range"
                min="2"
                max="15"
                value={formData.max_players}
                onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>2 players</span>
                <span>15 players</span>
              </div>
            </div>

            {/* Time Limit - Only show for non-quiz modes */}
            {formData.game_mode !== "code_quiz" && (
              <div>
                <label className="block text-white font-semibold mb-2">
                  Time Limit
                </label>
                <select
                  value={formData.time_limit_seconds}
                  onChange={(e) => setFormData({ ...formData, time_limit_seconds: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="900" className="bg-slate-800">15 minutes</option>
                  <option value="1800" className="bg-slate-800">30 minutes</option>
                  <option value="2700" className="bg-slate-800">45 minutes</option>
                  <option value="3600" className="bg-slate-800">60 minutes</option>
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <span className="flex items-center gap-2 justify-center">
                  {loading ? (
                    formData.game_mode === "code_quiz" ? "Creating & Generating Questions..." : "Creating & Generating Problem..."
                  ) : (
                    <>
                      <Bot size={20} /> 
                      {formData.game_mode === "code_quiz" ? "Create Quiz Lobby" : "Create Lobby (AI Problem)"}
                    </>
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/competitive")}
                className="px-6 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
