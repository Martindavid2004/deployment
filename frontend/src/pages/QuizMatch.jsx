import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, CheckCircle, Circle, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { API_BASE } from "../utils/api";
import QuizNavigator from "../components/QuizNavigator";
import QuizLeaderboard from "../components/QuizLeaderboard";
import QuizWaiting from "../components/QuizWaiting";

export default function QuizMatch() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);

  // Load match data
  useEffect(() => {
    loadMatch();
  }, [matchId]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
      // Retry loading if there was an error
      if (error) {
        loadMatch();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setError("You are offline. Please check your internet connection.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error]);

  // Auto-save progress every 30 seconds (for 30+ question quizzes)
  useEffect(() => {
    if (!match || submitted || questions.length < 30) return;

    const autoSaveInterval = setInterval(() => {
      saveProgress();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [match, submitted, answers, currentQuestionIndex, questions.length]);

  // Load saved progress on mount
  useEffect(() => {
    if (match && questions.length >= 30) {
      loadSavedProgress();
    }
  }, [match, questions.length]);

  // Timer countdown
  useEffect(() => {
    if (!match || submitted || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [match, submitted, timeRemaining]);

  const loadMatch = async (retry = 0) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/competitive/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error("Failed to load match");
      }

      const data = await res.json();
      setMatch(data);
      
      // Load quiz questions
      if (data.quiz_questions) {
        setQuestions(data.quiz_questions);
        
        // Calculate time remaining
        const startedAt = new Date(data.started_at + 'Z');
        const now = new Date();
        const elapsed = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, data.time_limit_seconds - elapsed);
        
        setTimeRemaining(remaining);
        setStartTime(startedAt);
      }

      setLoading(false);
      setRetryCount(0);
    } catch (err) {
      console.error("Error loading match:", err);
      
      // Retry logic with exponential backoff
      if (retry < 3 && isOnline) {
        const delay = Math.pow(2, retry) * 1000; // 1s, 2s, 4s
        setError(`Connection error. Retrying in ${delay / 1000}s...`);
        setTimeout(() => {
          setRetryCount(retry + 1);
          loadMatch(retry + 1);
        }, delay);
      } else {
        setError(err.message || "Failed to load quiz match. Please refresh the page.");
        setLoading(false);
      }
    }
  };

  const saveProgress = async () => {
    if (!isOnline || submitted) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/competitive/matches/${matchId}/save-progress`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          match_id: matchId,
          code: "",
          language: "python",
          quiz_answers: answers,
          quiz_current_question: currentQuestionIndex
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.saved) {
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus(null), 2000);
        }
      }
    } catch (err) {
      console.error("Auto-save error:", err);
      // Silent fail for auto-save
    }
  };

  const loadSavedProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/competitive/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const players = data.players || [];
        const currentUserId = JSON.parse(atob(token.split('.')[1])).sub;
        const playerData = players.find(p => p.user_id === currentUserId);

        if (playerData && playerData.quiz_answers) {
          setAnswers(playerData.quiz_answers);
          if (playerData.quiz_current_question !== undefined) {
            setCurrentQuestionIndex(playerData.quiz_current_question);
          }
        }
      }
    } catch (err) {
      console.error("Error loading saved progress:", err);
      // Silent fail
    }
  };

  const handleAnswerSelect = useCallback((optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  }, [currentQuestionIndex]);

  const handleNavigate = useCallback((index) => {
    setCurrentQuestionIndex(index);
  }, []);

  const handleSubmit = () => {
    // Check for unanswered questions
    const unansweredCount = questions.length - Object.keys(answers).length;
    
    if (unansweredCount > 0) {
      setShowConfirmDialog(true);
    } else {
      submitQuiz();
    }
  };

  const handleAutoSubmit = async () => {
    // Auto-submit when time expires
    await submitQuiz();
  };

  const submitQuiz = async (retry = 0) => {
    if (submitting) return;
    
    if (!isOnline) {
      setError("You are offline. Please check your internet connection before submitting.");
      return;
    }
    
    setSubmitting(true);
    setShowConfirmDialog(false);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const timeTaken = match.time_limit_seconds - timeRemaining;

      console.log("[INFO] Submitting quiz:", {
        matchId,
        answersCount: Object.keys(answers).length,
        timeTaken,
        answers
      });

      const res = await fetch(`${API_BASE}/competitive/matches/${matchId}/submit-quiz`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          match_id: matchId,
          code: "",
          language: "python",
          quiz_answers: answers,
          quiz_time_taken: timeTaken
        })
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("[ERROR] Submit error:", error);
        throw new Error(error.detail || "Failed to submit quiz");
      }

      const data = await res.json();
      console.log("[SUCCESS] Submit success:", data);
      setResults(data);
      setSubmitted(true);

      // If showing leaderboard, poll for updates might not be needed
      // But if waiting for others, we should poll
      if (!data.show_leaderboard) {
        startPolling();
      }

    } catch (err) {
      console.error("Error submitting quiz:", err);
      
      // Retry logic
      if (retry < 3 && isOnline) {
        const delay = Math.pow(2, retry) * 1000;
        setError(`Submission failed. Retrying in ${delay / 1000}s...`);
        setTimeout(() => {
          submitQuiz(retry + 1);
        }, delay);
      } else {
        setError(err.message || "Failed to submit quiz. Please try again.");
        setSubmitting(false);
      }
    }
  };

  const startPolling = () => {
    console.log("[INFO] Starting polling for match completion...");
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        // Poll the match status, not submit again!
        const res = await fetch(`${API_BASE}/competitive/matches/${matchId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const matchData = await res.json();
          
          // Check if match is completed
          if (matchData.status === "completed") {
            console.log("[SUCCESS] Match completed! Fetching final results...");
            clearInterval(pollInterval);
            
            // Fetch final leaderboard
            const players = matchData.players || [];
            const currentUserId = JSON.parse(atob(token.split('.')[1])).sub;
            const currentPlayer = players.find(p => p.user_id === currentUserId);
            
            // Build leaderboard
            const rankedPlayers = players
              .filter(p => p.completed)
              .sort((a, b) => {
                if (b.quiz_score !== a.quiz_score) {
                  return b.quiz_score - a.quiz_score;
                }
                return a.quiz_time_taken - b.quiz_time_taken;
              });
            
            const leaderboard = rankedPlayers.map((p, idx) => ({
              user_id: p.user_id,
              username: p.username,
              score: p.quiz_score,
              correct: p.quiz_correct_count,
              time_taken: p.quiz_time_taken,
              rank: idx + 1
            }));
            
            // Update results to show leaderboard
            setResults({
              ...results,
              show_leaderboard: true,
              leaderboard: leaderboard,
              rank: rankedPlayers.findIndex(p => p.user_id === currentUserId) + 1
            });
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // Poll every 3 seconds

    // Clean up after 5 minutes
    setTimeout(() => {
      console.log("[TIMEOUT] Polling timeout");
      clearInterval(pollInterval);
    }, 300000);
  };

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTimerColor = useMemo(() => {
    if (timeRemaining > 60) return "text-white";
    if (timeRemaining > 30) return "text-yellow-400";
    return "text-red-400";
  }, [timeRemaining]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading quiz...</div>
          {error && (
            <div className="text-red-400 text-sm max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show results screens
  if (submitted && results) {
    if (results.show_leaderboard) {
      return <QuizLeaderboard results={results} matchId={matchId} />;
    } else {
      return <QuizWaiting results={results} matchId={matchId} />;
    }
  }

  // Safety check for questions
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">No questions available</div>
          <div className="text-gray-400 text-sm">Please contact support if this issue persists.</div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  // Safety check for current question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Question not found</div>
          <div className="text-gray-400 text-sm">Question index: {currentQuestionIndex}</div>
        </div>
      </div>
    );
  }
  
  const answeredCount = Object.keys(answers).length;
  const selectedAnswer = answers[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Code Quiz</h1>
              <p className="text-gray-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-3 ${getTimerColor}`}>
              <Clock size={32} />
              <div className="text-right">
                <div className="text-3xl font-bold">{formatTime(timeRemaining)}</div>
                <div className="text-sm text-gray-400">Time Remaining</div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-4 flex items-center gap-4">
            {/* Network Status */}
            <div className={`flex items-center gap-2 text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Auto-save Status */}
            {questions.length >= 30 && autoSaveStatus && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle size={16} />
                <span>Progress saved</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{answeredCount} / {questions.length} answered</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <QuizNavigator
              questions={questions}
              answers={answers}
              currentIndex={currentQuestionIndex}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Question Display */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
              {/* Question Type Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm font-semibold">
                  {currentQuestion.question_type.replace('_', ' ').toUpperCase()}
                </span>
                <span className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm font-semibold">
                  {currentQuestion.points} points
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-2xl font-bold text-white mb-6">
                {currentQuestion.question}
              </h2>

              {/* Code Block (if present) */}
              {currentQuestion.code && (
                <div className="mb-6 bg-slate-900/50 rounded-lg p-4 border border-white/10">
                  <pre className="text-gray-300 overflow-x-auto">
                    <code>{currentQuestion.code}</code>
                  </pre>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === idx
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:border-purple-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {selectedAnswer === idx ? (
                        <CheckCircle size={24} className="text-purple-400 flex-shrink-0" />
                      ) : (
                        <Circle size={24} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-white">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleNavigate(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => handleNavigate(currentQuestionIndex + 1)}
                    className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md mx-4 border-2 border-yellow-500/50">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={32} className="text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">Unanswered Questions</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              You have {questions.length - Object.keys(answers).length} unanswered question(s). 
              These will be marked as incorrect. Are you sure you want to submit?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={submitQuiz}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
