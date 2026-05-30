import { memo } from "react";
import { Clock, Users, Trophy, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuizWaiting = memo(function QuizWaiting({ results, matchId }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center">
              <CheckCircle size={64} className="text-green-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white text-center mb-2">
            Quiz Submitted!
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Great job! Here's how you did:
          </p>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
              <Trophy size={32} className="text-yellow-400 mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-2">
                {results.score}
              </div>
              <div className="text-gray-400 text-sm">Total Score</div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
              <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-2">
                {results.correct}/{results.total}
              </div>
              <div className="text-gray-400 text-sm">Correct Answers</div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
              <Clock size={32} className="text-blue-400 mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-2">
                +{results.time_bonus}
              </div>
              <div className="text-gray-400 text-sm">Time Bonus</div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-purple-600/10 rounded-xl p-6 mb-8 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Base Points ({results.correct} correct)</span>
                <span className="font-semibold">{results.score - results.time_bonus}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Time Bonus</span>
                <span className="font-semibold text-green-400">+{results.time_bonus}</span>
              </div>
              <div className="border-t border-white/20 pt-3 flex justify-between text-white text-lg font-bold">
                <span>Total Score</span>
                <span>{results.score}</span>
              </div>
            </div>
          </div>

          {/* Waiting Message */}
          <div className="bg-blue-600/10 rounded-xl p-6 mb-8 border border-blue-500/30">
            <div className="flex items-center gap-4 mb-4">
              <Users size={32} className="text-blue-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Waiting for Other Players...
                </h3>
                <p className="text-gray-400 text-sm">
                  The leaderboard will appear when all players finish or time expires
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
              <span className="text-gray-300">Players Finished</span>
              <span className="text-2xl font-bold text-white">
                {results.players_finished} / {results.total_players}
              </span>
            </div>
          </div>

          {/* Accuracy Display */}
          <div className="bg-white/5 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Your Accuracy</h3>
            <div className="relative">
              <div className="w-full bg-white/20 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-600 to-green-400 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(results.correct / results.total) * 100}%` }}
                >
                  <span className="text-white text-xs font-bold">
                    {Math.round((results.correct / results.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/competitive")}
              className="flex-1 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Back to Competitive
            </button>
          </div>

          {/* Auto-refresh notice */}
          <p className="text-center text-gray-500 text-sm mt-6">
            This page will automatically update when all players finish
          </p>
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">
              {results.total_players || 0}
            </div>
            <div className="text-gray-400 text-sm">Total Players</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">
              {results.total || 0}
            </div>
            <div className="text-gray-400 text-sm">Questions</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">
              {results.correct && results.total ? 
                `${Math.round((results.correct / results.total) * 100)}%` : 
                'N/A'
              }
            </div>
            <div className="text-gray-400 text-sm">Your Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuizWaiting;
