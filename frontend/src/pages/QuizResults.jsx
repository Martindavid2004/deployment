import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ArrowLeft, Bug, Search, BarChart3, AlertCircle, Lightbulb, HelpCircle } from "lucide-react";
import { API_BASE } from "../utils/api";

export default function QuizResults() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [filterType, setFilterType] = useState("all"); // all, correct, incorrect
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  useEffect(() => {
    loadResults();
  }, [matchId]);

  const loadResults = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/competitive/matches/${matchId}/quiz-results`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to load results");

      const data = await res.json();
      setResults(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading results:", err);
      alert("Failed to load quiz results");
      navigate("/competitive");
    }
  };

  const toggleQuestion = (index) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const expandAll = () => {
    setExpandedQuestions(new Set(results.questions.map((_, idx) => idx)));
  };

  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  const getFilteredQuestions = () => {
    if (!results) return [];
    
    return results.questions.filter(q => {
      if (filterType === "correct" && !q.is_correct) return false;
      if (filterType === "incorrect" && q.is_correct) return false;
      if (filterDifficulty !== "all" && q.difficulty !== filterDifficulty) return false;
      return true;
    });
  };

  const getQuestionTypeIcon = (type) => {
    const iconMap = {
      find_bug: <Bug size={16} className="inline" />,
      missing_code: <Search size={16} className="inline" />,
      output: <BarChart3 size={16} className="inline" />,
      error: <AlertCircle size={16} className="inline" />,
      best_practice: <Lightbulb size={16} className="inline" />
    };
    return iconMap[type] || <HelpCircle size={16} className="inline" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    );
  }

  const filteredQuestions = getFilteredQuestions();
  const correctCount = results.questions.filter(q => q.is_correct).length;
  const totalCount = results.questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/competitive")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-4"
          >
            <ArrowLeft size={20} />
            Back to Competitive
          </button>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h1 className="text-4xl font-bold text-white mb-4">Quiz Results Review</h1>
            
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {correctCount}/{totalCount}
                </div>
                <div className="text-gray-400 text-sm">Correct</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {Math.round((correctCount / totalCount) * 100)}%
                </div>
                <div className="text-gray-400 text-sm">Accuracy</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {correctCount}
                </div>
                <div className="text-gray-400 text-sm">Correct</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {totalCount - correctCount}
                </div>
                <div className="text-gray-400 text-sm">Incorrect</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        {results.score_breakdown && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* By Difficulty */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">By Difficulty</h3>
              <div className="space-y-3">
                {Object.entries(results.score_breakdown.by_difficulty).map(([difficulty, stats]) => (
                  <div key={difficulty} className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white capitalize">{difficulty}</span>
                      <span className="text-gray-400">
                        {stats.correct}/{stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Type */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">By Question Type</h3>
              <div className="space-y-3">
                {Object.entries(results.score_breakdown.by_type).map(([type, stats]) => (
                  <div key={type} className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white flex items-center gap-2">
                        <span>{getQuestionTypeIcon(type)}</span>
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </span>
                      <span className="text-gray-400">
                        {stats.correct}/{stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full"
                        style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4">
              {/* Filter by Result */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all" className="bg-slate-800">All Questions</option>
                <option value="correct" className="bg-slate-800">Correct Only</option>
                <option value="incorrect" className="bg-slate-800">Incorrect Only</option>
              </select>

              {/* Filter by Difficulty */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all" className="bg-slate-800">All Difficulties</option>
                <option value="easy" className="bg-slate-800">Easy</option>
                <option value="medium" className="bg-slate-800">Medium</option>
                <option value="hard" className="bg-slate-800">Hard</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all text-sm"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all text-sm"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="mt-4 text-gray-400 text-sm">
            Showing {filteredQuestions.length} of {totalCount} questions
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => {
            const isExpanded = expandedQuestions.has(index);
            const actualIndex = results.questions.indexOf(question);
            
            return (
              <div
                key={question.id}
                className={`
                  bg-white/10 backdrop-blur-md rounded-xl overflow-hidden transition-all
                  ${question.is_correct ? 'border-2 border-green-600/30' : 'border-2 border-red-600/30'}
                `}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    {/* Status Icon */}
                    {question.is_correct ? (
                      <CheckCircle size={32} className="text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle size={32} className="text-red-400 flex-shrink-0" />
                    )}

                    {/* Question Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-semibold">
                          Question {actualIndex + 1}
                        </span>
                        <span className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs">
                          {getQuestionTypeIcon(question.question_type)} {question.question_type.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs capitalize">
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {question.question}
                      </p>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  {isExpanded ? (
                    <ChevronUp size={24} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={24} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Question Details (Expanded) */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-white/10">
                    {/* Question Text */}
                    <div className="mt-4 mb-4">
                      <h4 className="text-white font-semibold mb-2">Question:</h4>
                      <p className="text-gray-300">{question.question}</p>
                    </div>

                    {/* Code Block */}
                    {question.code && (
                      <div className="mb-4">
                        <h4 className="text-white font-semibold mb-2">Code:</h4>
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-white/10">
                          <pre className="text-gray-300 overflow-x-auto">
                            <code>{question.code}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Options */}
                    <div className="mb-4">
                      <h4 className="text-white font-semibold mb-3">Options:</h4>
                      <div className="space-y-2">
                        {question.options.map((option, optIdx) => {
                          const isCorrect = optIdx === question.correct_answer;
                          const isPlayerAnswer = optIdx === question.player_answer;
                          
                          return (
                            <div
                              key={optIdx}
                              className={`
                                p-3 rounded-lg border-2 transition-all
                                ${isCorrect 
                                  ? 'border-green-600 bg-green-600/10' 
                                  : isPlayerAnswer 
                                    ? 'border-red-600 bg-red-600/10'
                                    : 'border-white/10 bg-white/5'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                {isCorrect && <CheckCircle size={20} className="text-green-400" />}
                                {isPlayerAnswer && !isCorrect && <XCircle size={20} className="text-red-400" />}
                                <span className="text-white">{option}</span>
                                {isCorrect && (
                                  <span className="ml-auto px-2 py-1 bg-green-600 text-white text-xs rounded">
                                    Correct Answer
                                  </span>
                                )}
                                {isPlayerAnswer && !isCorrect && (
                                  <span className="ml-auto px-2 py-1 bg-red-600 text-white text-xs rounded">
                                    Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-500/30">
                      <h4 className="text-blue-300 font-semibold mb-2">Explanation:</h4>
                      <p className="text-gray-300">{question.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No questions match the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
