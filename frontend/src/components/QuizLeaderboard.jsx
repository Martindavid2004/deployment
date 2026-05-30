import { memo } from "react";
import { Trophy, Medal, Award, Clock, CheckCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuizLeaderboard = memo(function QuizLeaderboard({ results, matchId }) {
  const navigate = useNavigate();

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Trophy size={32} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={32} className="text-gray-400" />;
    if (rank === 3) return <Award size={32} className="text-orange-600" />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-600 to-yellow-400";
    if (rank === 2) return "from-gray-600 to-gray-400";
    if (rank === 3) return "from-orange-600 to-orange-400";
    return "from-purple-600 to-pink-600";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentUserId = localStorage.getItem("userId"); // Assuming you store this

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-full flex items-center justify-center">
              <Trophy size={64} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">Quiz Complete!</h1>
          <p className="text-gray-300 text-xl">Final Rankings</p>
        </div>

        {/* Top 3 Podium */}
        {results.leaderboard && results.leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-400 rounded-full flex items-center justify-center mb-3">
                <Medal size={40} className="text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 w-full text-center border-2 border-gray-400">
                <div className="text-2xl font-bold text-white mb-1">
                  {results.leaderboard[1].username}
                </div>
                <div className="text-3xl font-bold text-gray-400 mb-2">2nd</div>
                <div className="text-xl text-white">{results.leaderboard[1].score} pts</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-full flex items-center justify-center mb-3 ring-4 ring-yellow-400/50">
                <Trophy size={48} className="text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full text-center border-2 border-yellow-400">
                <div className="text-2xl font-bold text-white mb-1">
                  {results.leaderboard[0].username}
                </div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">1st</div>
                <div className="text-2xl text-white font-bold">{results.leaderboard[0].score} pts</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-16">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-400 rounded-full flex items-center justify-center mb-3">
                <Award size={40} className="text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 w-full text-center border-2 border-orange-400">
                <div className="text-2xl font-bold text-white mb-1">
                  {results.leaderboard[2].username}
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-2">3rd</div>
                <div className="text-xl text-white">{results.leaderboard[2].score} pts</div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Complete Rankings</h2>
          
          <div className="space-y-3">
            {results.leaderboard && results.leaderboard.map((player, index) => {
              const isCurrentUser = player.user_id === currentUserId;
              
              return (
                <div
                  key={player.user_id}
                  className={`
                    rounded-xl p-4 transition-all
                    ${isCurrentUser 
                      ? 'bg-purple-600/30 border-2 border-purple-400 ring-2 ring-purple-400/50' 
                      : 'bg-white/5 border border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-16 text-center">
                      {player.rank <= 3 ? (
                        getMedalIcon(player.rank)
                      ) : (
                        <div className="text-3xl font-bold text-gray-400">
                          #{player.rank}
                        </div>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">
                          {player.username}
                        </span>
                        {isCurrentUser && (
                          <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle size={16} />
                          {player.correct}/{results.total} correct
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {formatTime(player.time_taken)}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className={`
                        text-3xl font-bold bg-gradient-to-r ${getRankColor(player.rank)} 
                        bg-clip-text text-transparent
                      `}>
                        {player.score}
                      </div>
                      <div className="text-sm text-gray-400">points</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/quiz-results/${matchId}`)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <Eye size={20} />
            View Detailed Results
          </button>
          <button
            onClick={() => navigate("/competitive")}
            className="flex-1 px-6 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20"
          >
            Back to Competitive
          </button>
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">
              {results.total_players}
            </div>
            <div className="text-gray-400 text-sm">Total Players</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">
              {results.total}
            </div>
            <div className="text-gray-400 text-sm">Questions</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">
              {results.leaderboard && results.leaderboard[0] ? 
                `${Math.round((results.leaderboard[0].correct / results.total) * 100)}%` : 
                'N/A'
              }
            </div>
            <div className="text-gray-400 text-sm">Top Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuizLeaderboard;
