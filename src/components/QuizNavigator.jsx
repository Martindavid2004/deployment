import { memo } from "react";
import { CheckCircle, Circle } from "lucide-react";

const QuizNavigator = memo(function QuizNavigator({ questions, answers, currentIndex, onNavigate }) {
  const answeredCount = Object.keys(answers).length;

  // For large quizzes (30+), show pagination
  const showPagination = questions.length > 30;
  const questionsPerPage = 20;
  const currentPage = Math.floor(currentIndex / questionsPerPage);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const getVisibleQuestions = () => {
    if (!showPagination) {
      return questions.map((_, idx) => idx);
    }
    
    const start = currentPage * questionsPerPage;
    const end = Math.min(start + questionsPerPage, questions.length);
    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  const visibleQuestions = getVisibleQuestions();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 sticky top-8">
      <h3 className="text-white font-bold text-lg mb-4">Questions</h3>
      
      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {visibleQuestions.map((idx) => {
          const isAnswered = answers[idx] !== undefined;
          const isCurrent = idx === currentIndex;
          
          return (
            <button
              key={idx}
              onClick={() => onNavigate(idx)}
              className={`
                aspect-square rounded-lg font-semibold text-sm transition-all
                flex items-center justify-center relative
                ${isCurrent 
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400 scale-110' 
                  : isAnswered
                    ? 'bg-green-600/30 text-green-300 hover:bg-green-600/40'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }
              `}
            >
              {idx + 1}
              {isAnswered && !isCurrent && (
                <CheckCircle size={12} className="absolute top-0 right-0 -mt-1 -mr-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Pagination for large quizzes */}
      {showPagination && totalPages > 1 && (
        <div className="mb-4 pb-4 border-b border-white/20">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Page {currentPage + 1} of {totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate(Math.max(0, (currentPage - 1) * questionsPerPage))}
              disabled={currentPage === 0}
              className="flex-1 px-3 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onNavigate(Math.min(questions.length - 1, (currentPage + 1) * questionsPerPage))}
              disabled={currentPage === totalPages - 1}
              className="flex-1 px-3 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Answered</span>
          <span className="text-green-400 font-semibold">{answeredCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Unanswered</span>
          <span className="text-gray-400 font-semibold">{questions.length - answeredCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total</span>
          <span className="text-white font-semibold">{questions.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
        <div className="text-center text-sm text-gray-400 mt-2">
          {Math.round((answeredCount / questions.length) * 100)}% Complete
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/20 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-600 ring-2 ring-purple-400"></div>
          <span className="text-gray-400">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-green-600/30 flex items-center justify-center">
            <CheckCircle size={12} className="text-green-300" />
          </div>
          <span className="text-gray-400">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white/10"></div>
          <span className="text-gray-400">Unanswered</span>
        </div>
      </div>
    </div>
  );
});

export default QuizNavigator;
