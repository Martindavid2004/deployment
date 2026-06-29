import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Sparkles,
  Flame,
  Trophy,
  Zap,
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  Code2,
  Users,
  ArrowRight,
  CheckCircle2,
  Shield,
  BookOpen,
  TrendingUp,
  Award,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ListTodo,
  FileText,
  Terminal
} from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import AchievementsPanel from "../components/AchievementsPanel";
import { API_BASE } from "../utils/api";

export default function Dashboard({
  user,
  problems,
  attempts,
  currentLanguage,
  stats,
}) {
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);
  const [topUsers, setTopUsers] = useState([]);

  // Fetch top users on mount
  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE}/users/top`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTopUsers(data);
          }
        }
      } catch (err) {
        console.error("Error fetching top users:", err);
      }
    };
    fetchTopUsers();
  }, []);

  // Expanded Developer widgets states
  const [scratchpadCode, setScratchpadCode] = useState(
    () => localStorage.getItem("codoai_scratchpad") || ""
  );
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Daily Challenge Selection (date-based selection)
  const dailyProblemIndex = (new Date().getDate() + new Date().getMonth()) % (problems.length || 1);
  const dailyProblem = problems[dailyProblemIndex] || problems[0];

  // Daily Countdown Timer to midnight
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        [
          String(hrs).padStart(2, "0"),
          String(mins).padStart(2, "0"),
          String(secs).padStart(2, "0")
        ].join(":")
      );
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Compute Resume Last Session Problem
  const getResumeProblem = () => {
    const list = Object.entries(attempts || {}).map(([k, att]) => {
      const [problemIdStr, lang] = k.split("_");
      const roundsCompleted = Object.values(att.roundCompleted || {}).filter(Boolean).length;
      return {
        id: Number(problemIdStr),
        language: lang,
        globalStartTime: att.globalStartTime || 0,
        roundsCompleted,
        finalCompleted: att.finalCompleted
      };
    });

    // 1. Look for the most recently started in-progress problem
    const inProgress = list
      .filter((item) => item.roundsCompleted > 0 && !item.finalCompleted)
      .sort((a, b) => b.globalStartTime - a.globalStartTime);

    if (inProgress.length > 0) {
      const found = problems.find((p) => p.id === inProgress[0].id);
      if (found) return { problem: found, isInProgress: true };
    }

    // 2. Otherwise recommend the first uncompleted problem from general list
    const unstarted = problems.filter((p) => {
      const key = `${p.id}_${currentLanguage}`;
      const att = attempts[key];
      const roundsDone = att ? Object.values(att.roundCompleted || {}).filter(Boolean).length : 0;
      return !att || (!att.finalCompleted && roundsDone === 0);
    });

    if (unstarted.length > 0) {
      return { problem: unstarted[0], isInProgress: false };
    }

    return { problem: problems[0], isInProgress: false };
  };

  const { problem: resumeProblem, isInProgress: resumeIsInProgress } = getResumeProblem();

  // Dynamic Skill Vectors based on user accomplishments
  const totalProblems = problems.length || 1;
  const completedInLang = problems.filter((p) => {
    const key = `${p.id}_${currentLanguage}`;
    return attempts[key]?.finalCompleted;
  }).length;

  const debugCompletedCount = Object.values(attempts || {}).filter((att) => att.roundCompleted?.[2]).length;
  
  const uniqueLangs = new Set();
  Object.keys(attempts || {}).forEach((k) => {
    const lang = k.split("_")[1];
    if (lang) uniqueLangs.add(lang);
  });
  const langCount = uniqueLangs.size;
  const polyglotVal = langCount >= 3 ? 100 : langCount === 2 ? 75 : langCount === 1 ? 40 : 0;

  const finalCompletedCount = Object.values(attempts || {}).filter((att) => att.finalCompleted).length;

  const skills = [
    {
      name: "Algorithmic Logic",
      val: totalProblems > 0 ? Math.min(100, Math.floor((completedInLang / totalProblems) * 100)) : 0,
      desc: "Problem formulation & execution"
    },
    {
      name: "Debugging Precision",
      val: debugCompletedCount > 0 ? Math.min(100, Math.floor((debugCompletedCount / totalProblems) * 80) + 20) : 0,
      desc: "Speed of spotting buggy logic"
    },
    {
      name: "Language Polyglot",
      val: polyglotVal,
      desc: "Cross-language versatility"
    },
    {
      name: "Efficiency Score",
      val: finalCompletedCount > 0 ? Math.min(100, Math.floor((finalCompletedCount / totalProblems) * 60) + 40) : 0,
      desc: "Clean & performant compilation"
    }
  ];

  // Dynamic GitHub-style Coding contribution calendar based on actual user attempt activities
  const heatmapDays = [];
  const activityMap = {};

  Object.values(attempts || {}).forEach((att) => {
    if (att.globalStartTime) {
      const dateStr = new Date(att.globalStartTime).toDateString();
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    }
  });

  for (let i = 83; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const count = activityMap[d.toDateString()] || 0;
    const level = count >= 3 ? 3 : count === 2 ? 2 : count === 1 ? 1 : 0;
    heatmapDays.push({ id: 83 - i, level, date: d.toDateString(), count });
  }

  // Dynamic Leaderboard sorting
  const mockUsers = [
    { name: "HexCoder", level: 12, xp: 1150, title: "Grandmaster" },
    { name: "ByteQueen", level: 9, xp: 850, title: "Master" },
    { name: "DevWizard", level: 6, xp: 520, title: "Acolyte" },
    { name: "CodeMaster", level: 3, xp: 220, title: "Novice" },
  ];
  const allUsers = [
    ...mockUsers,
    {
      name: `${user?.name || "You"} (You)`,
      level: stats.level,
      xp: stats.xp,
      title: stats.level >= 10 ? "Archmage" : stats.level >= 5 ? "Elite" : "Acolyte",
      isCurrentUser: true
    }
  ].sort((a, b) => b.xp - a.xp);


  const handleScratchpadChange = (e) => {
    const val = e.target.value;
    setScratchpadCode(val);
    localStorage.setItem("codoai_scratchpad", val);
  };

  const handleScratchpadCopy = () => {
    navigator.clipboard.writeText(scratchpadCode);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleScratchpadClear = () => {
    setScratchpadCode("");
    localStorage.removeItem("codoai_scratchpad");
  };





  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      
      {/* Left Column (Core Features) */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        
        {/* Sleek Hero Dashboard Welcome Card with Resume Session */}
        <div 
          className="p-6 cc-card relative overflow-hidden transition-all duration-300 hover:shadow-2xl border-none"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary) 40%, rgba(99, 102, 241, 0.08) 100%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles size={160} className="text-[var(--accent-primary)] animate-pulse" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-3">
              <Sparkles size={14} /> Recommended Next Step
            </div>
            <h1 className="text-3xl font-extrabold mb-2 heading-font tracking-tight">
              Greetings, <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[#c084fc] bg-clip-text text-transparent">{user?.name || "coder"}</span>!
            </h1>
            <p className="text-sm max-w-xl mb-6 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              Spot compilation issues, refactor round by round, build streaks, and master the system in Python, C++, and Java.
            </p>

            {/* Resume last session launcher banner */}
            {resumeProblem && (
              <div 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-dashed gap-4 backdrop-blur-md"
                style={{ 
                  borderColor: 'rgba(99, 102, 241, 0.25)', 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent-primary)]">
                    <Play size={18} fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                      {resumeIsInProgress ? "Resume Last Session" : "Recommended Solves"}
                    </div>
                    <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {resumeProblem.title}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/workspace/${resumeProblem.id}`}
                  className="w-full sm:w-auto px-4 py-2 text-xs flex items-center justify-center gap-1.5 cc-btn-primary"
                >
                  Start Solving <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Daily Challenge Box */}
        {dailyProblem && (
          <div 
            className="p-6 cc-card transition-all duration-300 hover:shadow-xl relative overflow-hidden"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.15)',
              background: 'linear-gradient(170deg, var(--bg-secondary) 70%, rgba(245, 158, 11, 0.04) 100%)'
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[rgba(245,158,11,0.12)] text-[var(--warn-soft)] flex items-center justify-center">
                  <Flame size={16} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-base font-bold heading-font flex items-center gap-2">
                    Daily Bug Hunt Challenge
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Solve today's featured problem to score extra XP!</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--warn-soft)] bg-[rgba(245,158,11,0.06)] px-3 py-1 rounded-full border border-[rgba(245,158,11,0.15)]">
                <Clock size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
                Resets in: <span className="font-mono">{timeLeft}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {dailyProblem.title}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span
                    className="px-2.5 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor:
                        dailyProblem.difficulty === "Easy"
                          ? 'var(--ok-soft)'
                          : dailyProblem.difficulty === "Medium"
                          ? 'var(--warn-soft)'
                          : 'var(--danger-soft)',
                      color: '#fff'
                    }}
                  >
                    {dailyProblem.difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold cc-pill">
                    {currentLanguage.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold text-[var(--accent-primary)] bg-[var(--accent-soft)]">
                    +150 XP Bonus
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowCodeDrawer(!showCodeDrawer)}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs cc-btn-secondary flex items-center justify-center gap-1"
                >
                  <Code2 size={14} />
                  {showCodeDrawer ? "Hide Code" : "Inspect Bug"}
                  {showCodeDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <Link
                  to={`/workspace/${dailyProblem.id}`}
                  className="flex-1 sm:flex-none px-5 py-2 text-xs cc-btn-primary flex items-center justify-center gap-1"
                >
                  Go Solve <Play size={12} fill="currentColor" />
                </Link>
              </div>
            </div>

            {/* Collapsible Buggy Code Drawer */}
            {showCodeDrawer && (
              <div 
                className="mt-4 p-4 rounded-xl border font-mono text-xs overflow-auto max-h-48 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex justify-between items-center mb-2 text-xs border-b pb-1.5" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
                  <span>Buggy Snippet ({currentLanguage})</span>
                  <span className="text-[var(--danger-soft)] font-bold">⚠️ Spot the compilation/logic error!</span>
                </div>
                <pre className="border-none p-0 bg-transparent text-[var(--text-secondary)] select-all leading-relaxed whitespace-pre-wrap">
                  {dailyProblem.buggyCode?.[currentLanguage] || "// No buggy snippet provided for this language."}
                </pre>
              </div>
            )}
          </div>
        )}

        <AchievementsPanel stats={stats} />

        {/* Custom Contribution/Coding Grid Heatmap */}
        <div className="p-6 cc-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider heading-font flex items-center gap-1.5">
              <Code2 size={14} className="text-[var(--ok-soft)]" /> Coding Activity Heatmap
            </h2>
            <span className="text-[9px] font-bold" style={{ color: 'var(--text-tertiary)' }}>
              12 Weeks Streak
            </span>
          </div>

          {/* Grid Blocks */}
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 p-1.5 bg-[var(--bg-tertiary)] rounded-lg border justify-start md:justify-center max-w-full overflow-x-auto" style={{ borderColor: 'var(--border-color)' }}>
            {heatmapDays.map((day) => (
              <div
                key={day.id}
                className="h-2.5 w-2.5 rounded-[2px] transition-all hover:scale-125 cursor-help"
                style={{
                  backgroundColor:
                    day.level === 0
                      ? 'var(--bg-secondary)'
                      : day.level === 1
                      ? 'rgba(129, 140, 248, 0.25)'
                      : day.level === 2
                      ? 'rgba(99, 102, 241, 0.6)'
                      : 'var(--accent-primary)',
                  boxShadow: day.level === 3 ? '0 0 6px rgba(99, 102, 241, 0.4)' : 'none'
                }}
                title={`${day.date}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[9px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
            <span>Less active</span>
            <div className="flex gap-1 items-center">
              <div className="h-2 w-2 rounded-[2px] bg-[var(--bg-secondary)]" />
              <div className="h-2 w-2 rounded-[2px] bg-[rgba(129,140,248,0.25)]" />
              <div className="h-2 w-2 rounded-[2px] bg-[rgba(99,102,241,0.6)]" />
              <div className="h-2 w-2 rounded-[2px] bg-[var(--accent-primary)]" />
            </div>
            <span>More active</span>
          </div>
        </div>

        {/* Persistent Developer Sticky Scratchpad */}
        <div className="p-6 cc-card flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent-primary)] flex items-center justify-center">
                <FileText size={16} />
              </div>
              <div>
                <h2 className="text-base font-extrabold heading-font">Developer Scratchpad</h2>
                <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Auto-saves to browser memory as you type.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleScratchpadClear}
                disabled={!scratchpadCode}
                className="p-2 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                title="Clear all text"
              >
                <Trash2 size={12} />
                <span className="hidden sm:inline">Clear</span>
              </button>
              <button 
                onClick={handleScratchpadCopy}
                disabled={!scratchpadCode}
                className="px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 cc-btn-primary"
                title="Copy code to clipboard"
              >
                {copyFeedback ? <Check size={12} /> : <Copy size={12} />}
                <span>{copyFeedback ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={scratchpadCode}
              onChange={handleScratchpadChange}
              placeholder={`// Write quick algorithms, drafts, or code notes here... \n// E.g., drafting sorting logic or helper templates.`}
              className="w-full h-40 p-4 font-mono text-xs rounded-xl border outline-none resize-y transition-all focus:border-[var(--accent-primary)] leading-relaxed"
              style={{
                borderColor: 'var(--border-light)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
            />
            <div className="absolute bottom-3 right-3 text-[10px] pointer-events-none uppercase font-bold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              {scratchpadCode ? `${scratchpadCode.length} chars` : "empty"}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Analytics, Leaderboard & Activity) */}
      <div className="flex flex-col gap-6 lg:col-span-1">
        
        {/* Core Progression Circle Profile and XP */}
        <div className="p-6 cc-card flex flex-col items-center text-center bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
          <div className="relative h-20 w-20 mb-3 flex items-center justify-center">
            {/* Pulsing glow behind avatar */}
            <div className="absolute inset-0 rounded-full blur bg-[var(--accent-soft)] animate-pulse" />
            <div 
              className="h-16 w-16 rounded-full relative z-10 flex items-center justify-center text-2xl font-extrabold text-white" 
              style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-strong))' }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>

          <h2 className="text-base font-bold leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            {user?.name || "Coder"}
          </h2>
          <div className="text-xs uppercase font-bold tracking-wider mb-4 flex items-center gap-1 justify-center text-[var(--accent-primary)]">
            <Shield size={12} /> Rank Tier: {(user?.learning_level || stats.level) >= 10 ? "Archmage" : (user?.learning_level || stats.level) >= 5 ? "Elite" : "Acolyte"}
          </div>

          <div className="w-full flex flex-col gap-4">
            {/* Learning pathway stats */}
            <div className="text-left bg-[rgba(255,255,255,0.01)] p-3 rounded-xl border border-dashed" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span className="text-emerald-400">Learning Level {user?.learning_level || stats.level}</span>
                <span className="text-theme-text-secondary">{(user?.learning_xp !== undefined ? user.learning_xp : stats.xp)} XP</span>
              </div>
              <ProgressBar value={(((user?.learning_xp !== undefined ? user.learning_xp : stats.xp) % 500) / 500) * 100} />
            </div>

            {/* Competitive pathway stats */}
            <div className="text-left bg-[rgba(255,255,255,0.01)] p-3 rounded-xl border border-dashed" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span className="text-purple-400">Arena Level {user?.competitive_level || 1} ({user?.rating || 1200} ELO)</span>
                <span className="text-theme-text-secondary">{(user?.competitive_xp || 0)} XP</span>
              </div>
              <ProgressBar value={(((user?.competitive_xp || 0) % 500) / 500) * 100} />
            </div>
          </div>
        </div>

        {/* Global Leaderboard & Competitive Arena Quicklaunch */}
        <div className="p-6 cc-card flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-sm font-bold uppercase tracking-wider heading-font flex items-center gap-1.5">
              <Trophy size={14} className="text-[var(--warn-soft)]" /> Top Rank Ladder
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-tertiary)' }}>
              Global
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {topUsers.map((u, index) => {
              const isMe = u.username === user?.username;
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 rounded-xl transition-all"
                  style={{
                    backgroundColor: isMe ? 'var(--accent-soft)' : 'transparent',
                    border: isMe ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent'
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 text-center font-bold text-sm ${index === 0 ? "text-yellow-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-600" : "text-[var(--text-tertiary)]"}`}>
                      #{index + 1}
                    </span>
                    <div 
                      className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase"
                      style={{ background: isMe ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-strong))' : 'var(--bg-tertiary)' }}
                    >
                      {u.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isMe ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                        {u.username} {isMe && "(You)"}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                        Level {u.level} • {u.level >= 10 ? "Archmage" : u.level >= 5 ? "Elite" : "Acolyte"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs font-extrabold" style={{ color: 'var(--text-secondary)' }}>
                    {u.xp} <span className="text-[9px] font-semibold text-gray-500">XP</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Arena Matchmaking quick-launch card */}
          <div 
            className="p-3.5 rounded-xl border flex flex-col gap-2 relative overflow-hidden bg-gradient-to-r from-[#1e152f] to-[#12162d]"
            style={{ borderColor: 'rgba(99, 102, 241, 0.2)' }}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[var(--accent-primary)] tracking-widest uppercase flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Live Arena Open
              </span>
              <Users size={12} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              Engage in 1v1 match challenges with programmers in real time!
            </p>
            <Link
              to="/competitive"
              className="mt-1 w-full py-1.5 rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 cc-btn-primary"
            >
              Enter Arena Lobby <ArrowRight size={10} />
            </Link>
          </div>
        </div>

        {/* Dynamic Skill Proficiency vectors */}
        <div className="p-6 cc-card flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider heading-font flex items-center gap-1.5">
            <TrendingUp size={14} className="text-[var(--accent-primary)]" /> Skill Proficiency
          </h2>

          <div className="flex flex-col gap-3">
            {skills.map((s, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  <span>{s.name}</span>
                  <span className="text-[var(--accent-primary)]">{s.val}%</span>
                </div>
                <ProgressBar value={s.val} />
                <span className="text-[9px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>


      </div>

    </div>
  );
}
