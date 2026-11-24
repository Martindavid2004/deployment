import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Award, Sparkles, CheckCircle2, ShieldAlert, X, Volume2, Bot } from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function ArenaModal({ isOpen, onClose, problemId, language, code, onDefenseCompleted }) {
  const [defenseText, setDefenseText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const recognitionRef = useRef(null);
  const baseTextRef = useRef("");
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus management: move focus into the dialog, trap Tab, close on Escape,
  // and restore focus to the trigger when the dialog unmounts.
  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    if (panel) panel.focus();

    const getFocusable = () =>
      panel
        ? Array.from(
            panel.querySelectorAll(
              'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null)
        : [];

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  const questionContext = "Explain the time and space complexity of your solution. Why is this approach optimal compared to auxiliary memory hash maps or naive iterations?";

  // Web Speech API initialization with non-duplicating final/interim separation
  const toggleRecording = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please type your defense below.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    // Snapshot existing text so speaking appends cleanly without repetition
    baseTextRef.current = defenseText ? defenseText.trim() + " " : "";

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript + " ";
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const combined = (baseTextRef.current + finalTranscript + interimTranscript).trim();
      setDefenseText(combined);
    };

    recognition.onerror = (event) => {
      console.error("Speech error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Speech start error", e);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handleDefenseSubmit = async () => {
    if (!defenseText.trim()) return;
    setIsEvaluating(true);

    try {
      const res = await fetch(`${API_BASE}/intuition/arena-evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: problemId || "two_sum_sorted",
          language: language || "python",
          student_code: code || "",
          student_defense_response: defenseText,
          question_context: questionContext
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluation(data);
        if (onDefenseCompleted) {
          onDefenseCompleted(data);
        }
      }
    } catch (e) {
      console.error("Failed to evaluate defense", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="arena-modal-title"
        tabIndex={-1}
        className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative outline-none"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close AI defense dialog"
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25" aria-hidden="true">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Stage 4: The AI Defense Arena
              </span>
            </div>
            <h3 id="arena-modal-title" className="text-xl font-bold text-white mt-1">Senior Architect Alex</h3>
          </div>
        </div>

        {/* Dialogue Prompt */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
          <div className="text-xs uppercase font-mono text-slate-400 mb-1 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" /> Architect Challenge
          </div>
          <p className="text-sm font-medium text-slate-200">{questionContext}</p>
        </div>

        {/* Evaluation Results Card */}
        {evaluation ? (
          <div className="space-y-4 animate-scaleUp">
            <div
              className={`p-6 rounded-2xl border ${
                evaluation.passed_defense
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                  : "bg-amber-950/40 border-amber-500/50 text-amber-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-amber-400" />
                  <div>
                    <div className="text-xs uppercase font-mono text-slate-400">Defense Score</div>
                    <div className="text-2xl font-bold text-white">{evaluation.score}/100</div>
                  </div>
                </div>
                {evaluation.earned_badge && (
                  <div className="text-right">
                    <span className="text-xs font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-bold">
                      🏆 {evaluation.earned_badge}
                    </span>
                    <div className="text-xs text-emerald-400 mt-1 font-mono font-semibold">+{evaluation.xp_awarded} XP Earned</div>
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-slate-300 border-t border-slate-800/80 pt-3">
                "{evaluation.senior_feedback}"
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
            >
              Complete Problem & Save Mastery Profile
            </button>
          </div>
        ) : (
          /* Defense Input Box */
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={defenseText}
                onChange={(e) => setDefenseText(e.target.value)}
                aria-label="Your spoken or written defense of the solution"
                placeholder="Explain your algorithmic trade-offs here (e.g., 'I used two pointers for O(N) time and O(1) in-place auxiliary memory without extra hash maps...')"
                className="w-full h-32 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none"
              />

              {/* Mic Speech-to-Text Button */}
              <button
                onClick={toggleRecording}
                aria-pressed={isRecording}
                aria-label={isRecording ? "Stop recording your defense" : "Start recording your defense"}
                className={`absolute bottom-3 right-3 p-2.5 rounded-xl border transition-all ${
                  isRecording
                    ? "bg-rose-600 border-rose-500 text-white animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
                title="Speak your answer"
              >
                {isRecording ? <MicOff className="w-4 h-4" aria-hidden="true" /> : <Mic className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                {isRecording ? "🔴 Listening... Speak clearly into your mic." : "💡 Tip: State both Time & Space complexities."}
              </span>

              <button
                onClick={handleDefenseSubmit}
                disabled={!defenseText.trim() || isEvaluating}
                aria-busy={isEvaluating}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 text-sm"
              >
                {isEvaluating ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" aria-hidden="true" /> Evaluating Defense...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" aria-hidden="true" /> Submit Defense
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
