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

export default function Dashboard({
  user,
  problems,
  attempts,
  currentLanguage,
  stats,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);

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
    // 1. Look for first problem that is in-progress (rounds done > 0, but finalCompleted is false)
    const inProgressProblems = problems.filter((p) => {
      const key = `${p.id}_${currentLanguage}`;
      const att = attempts[key];
      if (!att) return false;
      const roundsDone = Object.values(att.roundCompleted || {}).filter(Boolean).length;
      return roundsDone > 0 && !att.finalCompleted;
    });

    if (inProgressProblems.length > 0) {
      return { problem: inProgressProblems[0], isInProgress: true };
    }

    // 2. Otherwise recommend the first unattempted problem
    const unattemptedProblems = problems.filter((p) => {
      const key = `${p.id}_${currentLanguage}`;
      const att = attempts[key];
      const roundsDone = att ? Object.values(att.roundCompleted || {}).filter(Boolean).length : 0;
      return !att || (!att.finalCompleted && roundsDone === 0);
    });

    if (unattemptedProblems.length > 0) {
      return { problem: unattemptedProblems[0], isInProgress: false };
    }

    return { problem: problems[0], isInProgress: false };
  };

  const { problem: resumeProblem, isInProgress: resumeIsInProgress } = getResumeProblem();

  // Dynamic Skill Vectors based on user accomplishments
  const totalProblems = problems.length;
  const completedInLang = problems.filter((p) => {
    const key = `${p.id}_${currentLanguage}`;
    return attempts[key]?.finalCompleted;
  }).length;

  const skills = [
    {
      name: "Algorithmic Logic",
      val: Math.min(100, Math.floor((completedInLang / Math.max(1, totalProblems)) * 70) + 30),
      desc: "Problem formulation & execution"
    },
    {
      name: "Debugging Precision",
      val: stats.fastSolve ? 95 : Math.min(100, Math.floor(stats.xp * 0.4) + 20),
      desc: "Speed of spotting buggy logic"
    },
    {
      name: "Language Polyglot",
      val: stats.multiLang ? 90 : 30,
      desc: "Cross-language versatility"
    },
    {
      name: "Efficiency Score",
      val: Math.min(100, Math.floor(stats.xp * 0.3) + 40),
      desc: "Clean & performant compilation"
    }
  ];

  // Dynamic GitHub-style Coding contribution calendar seed
  const heatmapDays = [];
  const nameSeed = (user?.name || "coder").length;
  for (let i = 0; i < 84; i++) {
    // Generate organic-looking levels (0: none, 1: light, 2: medium, 3: high)
    let level = (i * 7 + nameSeed * 3) % 4;
    if (i % 7 === 0 || i % 11 === 0 || i % 13 === 0) level = 0; // dynamic gaps
    if (Object.keys(attempts || {}).length > 0 && i % 4 === 0) {
      level = Math.min(3, level + 1);
    }
    heatmapDays.push({ id: i, level });
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


  // Dynamic Recent Activity Log generator
  const getActivities = () => {
    const act = [];
    Object.entries(attempts || {}).forEach(([key, attempt]) => {
      const [pId, lang] = key.split("_");
      const prob = problems.find((p) => p.id === Number(pId));
      if (!prob) return;

      if (attempt.finalCompleted) {
        act.push({
          id: `solve-${pId}-${lang}`,
          type: "solve",
          title: "Challenge Solved",
          desc: `Completed "${prob.title}" in ${lang.toUpperCase()}`,
          xp: "+30 XP",
          color: "var(--ok-soft)"
        });
      } else {
        const rounds = Object.values(attempt.roundCompleted || {}).filter(Boolean).length;
        if (rounds > 0) {
          act.push({
            id: `round-${pId}-${lang}`,
            type: "attempt",
            title: "Bug Defeated",
            desc: `Round ${rounds} of "${prob.title}" in ${lang.toUpperCase()}`,
            xp: `+${rounds * 5} XP`,
            color: "var(--accent-primary)"
          });
        }
      }
    });

    if (act.length === 0) {
      act.push({
        id: "init-profile",
        type: "system",
        title: "Profile Seeded",
        desc: `Ready to code in ${currentLanguage.toUpperCase()}`,
        xp: "+10 XP",
        color: "var(--accent-primary)"
      });
    }

    return act.slice(0, 3);
  };
  const activities = getActivities();

  // Problem Filters
  const filteredProblems = problems.filter((p) => {
    // Search filter
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Difficulty filter
    const matchesDifficulty = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;

    // Status filter
    const key = `${p.id}_${currentLanguage}`;
    const att = attempts[key];
    const completed = att?.finalCompleted;
    const roundsDone = att ? Object.values(att.roundCompleted || {}).filter(Boolean).length : 0;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Completed" && completed) ||
      (selectedStatus === "In Progress" && !completed && roundsDone > 0) ||
      (selectedStatus === "Not Started" && (!att || (!completed && roundsDone === 0)));

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const completionPercent = totalProblems ? (completedInLang / totalProblems) * 100 : 0;

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

        {/* Dynamic & Expandable Problem Explorer list */}
        <div className="p-6 cc-card flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold heading-font">Problem Explorer</h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Filter problems, study syntax structures, and compile codes.
              </p>
            </div>
            
            {/* Inline dynamic filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-full border outline-none font-semibold cursor-pointer transition-all hover:border-[var(--accent-primary)]"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-full border outline-none font-semibold cursor-pointer transition-all hover:border-[var(--accent-primary)]"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
              >
                <option value="All">All Progress</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
          </div>

          {/* Search Inputs */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-tertiary)' }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search problem title or topic tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-[var(--accent-primary)]"
              style={{
                borderColor: 'var(--border-light)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Sleek Row-by-Row Problem Catalog (Scrollable) */}
          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1.5">
            {filteredProblems.length > 0 ? (
              filteredProblems.map((p) => {
                const key = `${p.id}_${currentLanguage}`;
                const att = attempts[key];
                const roundsDone = att
                  ? Object.values(att.roundCompleted || {}).filter(Boolean).length
                  : 0;
                const completed = att?.finalCompleted;

                return (
                  <Link
                    key={p.id}
                    to={`/workspace/${p.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)] gap-4 group"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 94%, var(--bg-tertiary))',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {/* Left: Checkmark Status Icon & Title / Tags */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div 
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                          completed 
                            ? "text-[var(--ok-soft)] bg-[rgba(16,185,129,0.1)]" 
                            : roundsDone > 0 
                            ? "text-[var(--accent-primary)] bg-[var(--accent-soft)] animate-pulse" 
                            : "text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 size={16} className="text-[var(--ok-soft)]" />
                        ) : roundsDone > 0 ? (
                          <Zap size={14} fill="currentColor" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-[var(--border-light)]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">
                          {p.title}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {p.tags && p.tags.map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.25 rounded font-mono" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Metadata */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 text-xs">
                      
                      {/* Difficulty Pill */}
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-center w-16"
                        style={{
                          backgroundColor:
                            p.difficulty === "Easy"
                              ? 'rgba(16, 185, 129, 0.12)'
                              : p.difficulty === "Medium"
                              ? 'rgba(245, 158, 11, 0.12)'
                              : 'rgba(239, 68, 68, 0.12)',
                          color:
                            p.difficulty === "Easy"
                              ? 'var(--ok-soft)'
                              : p.difficulty === "Medium"
                              ? 'var(--warn-soft)'
                              : 'var(--danger-soft)'
                        }}
                      >
                        {p.difficulty}
                      </span>

                      {/* Micro rounds dot tracker */}
                      <div className="flex flex-col items-center sm:items-end gap-0.5 min-w-[90px]">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((r) => {
                            const isDone = att?.roundCompleted?.[r];
                            const isActive = !completed && (roundsDone + 1 === r);
                            return (
                              <div
                                key={r}
                                className={`h-2.5 w-2.5 rounded-full transition-all ${
                                  isDone 
                                    ? "bg-[var(--accent-primary)] shadow-[0_0_6px_var(--accent-primary)]" 
                                    : isActive 
                                    ? "bg-white border-2 border-[var(--accent-primary)] animate-pulse" 
                                    : "bg-[var(--bg-secondary)] border border-[var(--border-light)]"
                                }`}
                                title={`Round ${r}`}
                              />
                            );
                          })}
                        </div>
                        <span className="text-[9px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                          {completed ? "Completed" : `${roundsDone}/4 rounds`}
                        </span>
                      </div>

                      {/* Action trigger button */}
                      <button className="px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider cc-btn-primary flex items-center gap-1 group-hover:scale-105 transition-transform">
                        {completed ? "Review" : roundsDone > 0 ? "Resume" : "Solve"}
                        <ArrowRight size={10} />
                      </button>

                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
                <BookOpen size={36} className="mx-auto mb-2 opacity-30 animate-bounce" style={{ animationDuration: '3s' }} />
                <p className="text-sm font-semibold">No matching problems found.</p>
                <p className="text-xs mt-1">Try relaxing your search query or selecting 'All' in the filters.</p>
              </div>
            )}
          </div>
        </div>

        <AchievementsPanel stats={stats} />

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
          <div className="relative h-24 w-24 mb-4 flex items-center justify-center">
            {/* Pulsing glow behind avatar */}
            <div className="absolute inset-0 rounded-full blur bg-[var(--accent-soft)] animate-pulse" />
            <div 
              className="h-20 w-20 rounded-full relative z-10 flex items-center justify-center text-3xl font-extrabold text-white" 
              style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-strong))' }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--accent-primary)] flex items-center justify-center font-bold text-xs">
              {stats.level}
            </div>
          </div>

          <h2 className="text-lg font-bold leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            {user?.name || "Coder"}
          </h2>
          <div className="text-xs uppercase font-bold tracking-wider mb-4 flex items-center gap-1 justify-center text-[var(--accent-primary)]">
            <Shield size={12} /> Rank Tier: {stats.level >= 10 ? "Archmage" : stats.level >= 5 ? "Elite" : "Acolyte"}
          </div>

          {/* Level Progress */}
          <div className="w-full text-left bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-color)]">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span style={{ color: 'var(--text-secondary)' }}>XP Level {stats.level} Progress</span>
              <span className="text-[var(--accent-primary)]">{stats.xp} XP total</span>
            </div>
            <ProgressBar value={stats.levelProgress} big />
          </div>

          {/* Primary & Secondary mini stats */}
          <div className="grid grid-cols-2 gap-2.5 w-full mt-3 text-left">
            <div className="p-2.5 rounded-xl bg-[rgba(255,255,255,0.01)] border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Language</div>
              <div className="text-sm font-extrabold" style={{ color: 'var(--accent-primary)' }}>{currentLanguage.toUpperCase()}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[rgba(255,255,255,0.01)] border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Solves Count</div>
              <div className="text-sm font-extrabold" style={{ color: 'var(--accent-primary)' }}>{stats.totalSolved} Problems</div>
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
            {allUsers.map((u, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded-xl transition-all"
                style={{
                  backgroundColor: u.isCurrentUser ? 'var(--accent-soft)' : 'transparent',
                  border: u.isCurrentUser ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 text-center font-bold text-sm ${index === 0 ? "text-yellow-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-600" : "text-[var(--text-tertiary)]"}`}>
                    #{index + 1}
                  </span>
                  <div 
                    className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase"
                    style={{ background: u.isCurrentUser ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-strong))' : 'var(--bg-tertiary)' }}
                  >
                    {u.name[0]}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${u.isCurrentUser ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                      {u.name}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Level {u.level} • {u.title}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs font-extrabold" style={{ color: 'var(--text-secondary)' }}>
                  {u.xp} <span className="text-[9px] font-semibold text-gray-500">XP</span>
                </div>
              </div>
            ))}
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
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 p-1 bg-[var(--bg-tertiary)] rounded-lg border justify-center max-w-full overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
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
                title={
                  day.level === 0
                    ? "No activity"
                    : day.level === 1
                    ? "Moderate debugging session"
                    : day.level === 2
                    ? "Heavy compilation practice"
                    : "Intense solve streak! +50XP"
                }
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

        {/* Recent Activity stream panel */}
        <div className="p-6 cc-card flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider heading-font flex items-center gap-1.5 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
            <Award size={14} className="text-[var(--ok-soft)]" /> Activity Log
          </h2>

          <div className="flex flex-col gap-3.5">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs items-start">
                <div 
                  className="h-2 w-2 rounded-full mt-1.5" 
                  style={{ backgroundColor: act.color, boxShadow: `0 0 8px ${act.color}` }} 
                />
                <div className="flex-1">
                  <div className="font-extrabold flex justify-between">
                    <span>{act.title}</span>
                    <span className="text-[10px]" style={{ color: act.color }}>{act.xp}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {act.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
