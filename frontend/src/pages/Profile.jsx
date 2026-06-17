import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Edit3,
  Save,
  X,
  Flame,
  Trophy,
  Zap,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Code2,
  Terminal,
  Compass
} from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import AchievementsPanel from "../components/AchievementsPanel";

const FACTIONS = [
  {
    id: "sorcerer",
    name: "Syntax Sorcerer",
    desc: "Masters of language structure & compiler error remediation.",
    color: "#818cf8",
    gradient: "linear-gradient(135deg, #818cf8, #6366f1)"
  },
  {
    id: "berserker",
    name: "Binary Berserker",
    desc: "Raw algorithmic speed, clearing compiler rounds at lightning velocity.",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #f43f5e, #be123c)"
  },
  {
    id: "legend",
    name: "Logic Legend",
    desc: "Elite bug spotters, analyzing compiler edge cases with maximum precision.",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24, #d97706)"
  }
];

export default function Profile({
  user,
  setUser,
  attempts,
  problems,
  currentLanguage,
  stats,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editLanguage, setEditLanguage] = useState(user?.preferredLanguage || "python");
  const [editFaction, setEditFaction] = useState(user?.faction || "sorcerer");

  // Filter calculations
  const totalProblems = problems.length;
  
  const easyTotal = problems.filter(p => p.difficulty === "Easy").length;
  const easySolved = problems.filter(
    p => p.difficulty === "Easy" && attempts[`${p.id}_${currentLanguage}`]?.finalCompleted
  ).length;

  const mediumTotal = problems.filter(p => p.difficulty === "Medium").length;
  const mediumSolved = problems.filter(
    p => p.difficulty === "Medium" && attempts[`${p.id}_${currentLanguage}`]?.finalCompleted
  ).length;

  const hardTotal = problems.filter(p => p.difficulty === "Hard").length;
  const hardSolved = problems.filter(
    p => p.difficulty === "Hard" && attempts[`${p.id}_${currentLanguage}`]?.finalCompleted
  ).length;

  const completedInLang = easySolved + mediumSolved + hardSolved;
  const completionPercent = totalProblems ? (completedInLang / totalProblems) * 100 : 0;

  const totalTime = Object.values(attempts || {}).reduce(
    (sum, a) => sum + (a.totalTimeSeconds || 0),
    0
  );

  const activeFaction = FACTIONS.find(f => f.id === (user?.faction || "sorcerer")) || FACTIONS[0];

  const handleSave = () => {
    if (!editName.trim()) return;
    if (setUser) {
      setUser({
        ...user,
        name: editName.trim(),
        preferredLanguage: editLanguage,
        faction: editFaction
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(user?.name || "");
    setEditLanguage(user?.preferredLanguage || "python");
    setEditFaction(user?.faction || "sorcerer");
    setIsEditing(false);
  };

  // Render SVG circular progress loops
  const renderProgressCircle = (solved, total, colorClass, title) => {
    const percent = total ? Math.min(100, Math.floor((solved / total) * 100)) : 0;
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] p-3 rounded-xl border border-[var(--border-color)]">
        <div className="relative h-16 w-16 flex items-center justify-center">
          <svg className="h-full w-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="var(--border-light)"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={colorClass}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span className="absolute text-xs font-extrabold text-[var(--text-primary)]">
            {percent}%
          </span>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{title}</div>
          <div className="text-base font-extrabold text-[var(--text-primary)] mt-0.5">
            {solved} <span className="text-xs text-[var(--text-tertiary)] font-normal">/ {total} solves</span>
          </div>
        </div>
      </div>
    );
  };

  // Dynamic profile timelines checklist
  const timelineMilestones = [
    {
      title: "Archmage Class Attained",
      desc: `Reached XP Level ${stats.level} and compiled dynamic modules.`,
      date: `Level ${stats.level} unlocked`,
      unlocked: stats.level >= 2,
      icon: <Trophy size={14} />
    },
    {
      title: "Algorithmic Solver",
      desc: `Successfully completed ${stats.totalSolved} compiler tasks across python/cpp/java.`,
      date: `${stats.totalSolved} solves confirmed`,
      unlocked: stats.totalSolved >= 1,
      icon: <CheckCircle2 size={14} />
    },
    {
      title: "Preferred Compiler Calibrated",
      desc: `Registered Preferred Language to standard compiler (${currentLanguage.toUpperCase()}).`,
      date: "Configured language profile",
      unlocked: true,
      icon: <Terminal size={14} />
    },
    {
      title: "Diagnostics Initialized",
      desc: "Account created and performance diagnostic streams initialized.",
      date: "Account initialized",
      unlocked: true,
      icon: <Compass size={14} />
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      
      {/* Left Column: Profile Card, Editor & Stats */}
      <div className="flex flex-col gap-6 lg:col-span-1">
        
        {/* Profile Card & Faction Panel */}
        <div 
          className="p-6 cc-card flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl border-none"
          style={{
            background: `linear-gradient(180deg, var(--bg-secondary) 50%, color-mix(in srgb, ${activeFaction.color} 8%, var(--bg-secondary)) 100%)`,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Active Faction banner highlight */}
          <div className="absolute top-0 inset-x-0 h-1.5" style={{ background: activeFaction.gradient }} />

          {/* Edit profile controls togglers */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 p-2 rounded-lg border hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all cursor-pointer"
              style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
              title="Edit profile settings"
            >
              <Edit3 size={14} />
            </button>
          )}

          {/* Regular Profile view */}
          {!isEditing ? (
            <div className="flex flex-col items-center w-full mt-2">
              <div className="relative h-24 w-24 mb-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full blur-md opacity-35" style={{ background: activeFaction.gradient }} />
                <div 
                  className="h-20 w-20 rounded-full relative z-10 flex items-center justify-center text-3xl font-extrabold text-white uppercase shadow-lg"
                  style={{ background: activeFaction.gradient }}
                >
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--accent-primary)] flex items-center justify-center font-bold text-xs">
                  {stats.level}
                </div>
              </div>

              <h1 className="text-2xl font-extrabold mb-1 heading-font text-[var(--text-primary)]">
                {user?.name || "Coder"}
              </h1>
              
              <span 
                className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-5 flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: activeFaction.color, border: `1px solid color-mix(in srgb, ${activeFaction.color} 25%, transparent)` }}
              >
                <Shield size={12} fill="currentColor" /> {activeFaction.name}
              </span>

              {/* Faction Description text */}
              <p className="text-xs mb-6 max-w-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                "{activeFaction.desc}"
              </p>

              {/* Quick stats items */}
              <div className="w-full bg-[var(--bg-tertiary)] p-3 rounded-xl border flex flex-col gap-2.5" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between text-xs font-bold">
                  <span style={{ color: 'var(--text-secondary)' }}>Level {stats.level} Progress</span>
                  <span className="text-[var(--accent-primary)]">{stats.xp} XP total</span>
                </div>
                <ProgressBar value={stats.levelProgress} big />
              </div>
            </div>
          ) : (
            
            /* Profile Edit Form view */
            <div className="flex flex-col w-full text-left mt-2">
              <h2 className="text-lg font-extrabold heading-font text-[var(--text-primary)] mb-4">Edit Profile Settings</h2>
              
              {/* Username Input */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Username</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3.5 py-2 text-sm rounded-xl border outline-none transition-all focus:border-[var(--accent-primary)]"
                  style={{
                    borderColor: 'var(--border-light)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                  maxLength={15}
                />
              </div>

              {/* Preferred Language Input */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Preferred Compiler</label>
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="px-3.5 py-2 text-sm rounded-xl border outline-none font-semibold cursor-pointer transition-all focus:border-[var(--accent-primary)]"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>

              {/* Faction selector card list */}
              <div className="flex flex-col gap-2 mb-5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Select Faction Avatar</label>
                <div className="flex flex-col gap-2">
                  {FACTIONS.map((fac) => (
                    <button
                      key={fac.id}
                      onClick={() => setEditFaction(fac.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col gap-1 cursor-pointer`}
                      style={{
                        borderColor: editFaction === fac.id ? fac.color : 'var(--border-color)',
                        backgroundColor: editFaction === fac.id ? 'rgba(255,255,255,0.02)' : 'var(--bg-tertiary)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: fac.color, boxShadow: `0 0 6px ${fac.color}` }} />
                        <span className="text-xs font-extrabold" style={{ color: editFaction === fac.id ? fac.color : 'var(--text-primary)' }}>{fac.name}</span>
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{fac.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Controls */}
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  <X size={12} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cc-btn-primary"
                >
                  <Save size={12} /> Save Settings
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Streaks & Performance Metrics Card */}
        <div className="p-6 cc-card flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider heading-font flex items-center gap-1.5 border-b pb-2.5" style={{ borderColor: 'var(--border-color)' }}>
            <Activity size={14} className="text-[var(--accent-primary)]" /> Performance Stats
          </h2>

          <div className="flex flex-col gap-3">
            {/* Streak Tracker */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[rgba(245,158,11,0.08)] to-transparent border border-[rgba(245,158,11,0.15)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[rgba(245,158,11,0.15)] text-[var(--warn-soft)] flex items-center justify-center">
                  <Flame size={20} fill="currentColor" className="animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Coding Streak</div>
                  <div className="text-lg font-extrabold text-[var(--text-primary)]">7 Days Active</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-[var(--warn-soft)] bg-[rgba(245,158,11,0.1)] px-2 py-0.5 rounded border border-[rgba(245,158,11,0.15)]">
                  1.5x XP Boost
                </span>
              </div>
            </div>

            {/* Time tracker */}
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent-primary)] flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Code Runtime</div>
                  <div className="text-lg font-extrabold text-[var(--text-primary)]">{totalTime.toFixed(1)}s</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Total compilation time</span>
            </div>
          </div>
        </div>

        {/* Dynamic Skill gauge indices */}
        <div className="p-6 cc-card flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider heading-font flex items-center gap-1.5 border-b pb-2.5" style={{ borderColor: 'var(--border-color)' }}>
            <Code2 size={14} className="text-[var(--accent-primary)]" /> Skill Capabilities
          </h2>

          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col">
              <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                <span>Monaco Syntax Precision</span>
                <span className="text-[var(--accent-primary)]">90%</span>
              </div>
              <ProgressBar value={90} />
            </div>
            
            <div className="flex flex-col">
              <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                <span>Piston Compilation Speed</span>
                <span className="text-[var(--accent-primary)]">{stats.fastSolve ? 95 : 65}%</span>
              </div>
              <ProgressBar value={stats.fastSolve ? 95 : 65} />
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                <span>Polyglot Language Flexibility</span>
                <span className="text-[var(--accent-primary)]">{stats.multiLang ? 90 : 30}%</span>
              </div>
              <ProgressBar value={stats.multiLang ? 90 : 30} />
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Solves Breakdown, Chronological Timelines & Problems Inventory */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        
        {/* Difficulty Solve breakdown row circular loops */}
        <div className="p-6 cc-card flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider heading-font flex items-center gap-1.5 border-b pb-2.5" style={{ borderColor: 'var(--border-color)' }}>
            <Trophy size={14} className="text-[var(--warn-soft)]" /> Solving Calibration Breakdown
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderProgressCircle(easySolved, easyTotal, 'var(--ok-soft)', 'Easy Problems Solved')}
            {renderProgressCircle(mediumSolved, mediumTotal, 'var(--warn-soft)', 'Medium Problems Solved')}
            {renderProgressCircle(hardSolved, hardTotal, 'var(--danger-soft)', 'Hard Problems Solved')}
          </div>
        </div>

        <AchievementsPanel stats={stats} />

        {/* Chronological Platform Milestone Timelines */}
        <div className="p-6 cc-card flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider heading-font flex items-center gap-1.5 border-b pb-2.5" style={{ borderColor: 'var(--border-color)' }}>
            <Activity size={14} className="text-[var(--accent-primary)]" /> Chronological Platform Milestones
          </h2>

          <div className="flex flex-col relative pl-4 border-l-2 ml-3" style={{ borderColor: 'var(--border-light)' }}>
            {timelineMilestones.map((milestone, idx) => (
              <div key={idx} className="relative mb-6 last:mb-1 flex gap-4 text-xs">
                {/* Timeline vertical dot check */}
                <div 
                  className={`absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                    milestone.unlocked 
                      ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] shadow-[0_0_6px_var(--accent-primary)] text-white" 
                      : "bg-[var(--bg-secondary)] border-gray-600"
                  }`}
                />
                
                <div className="flex-1 bg-[rgba(255,255,255,0.01)] border p-3 rounded-xl" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-[var(--text-primary)] flex items-center gap-1">
                      {milestone.icon}
                      {milestone.title}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
                      {milestone.date}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                    {milestone.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed inventory of Solves progress */}
        <div className="p-6 cc-card flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider heading-font flex items-center gap-1.5 border-b pb-2.5" style={{ borderColor: 'var(--border-color)' }}>
            <Terminal size={14} className="text-[var(--ok-soft)]" /> Calibration Solves Inventory
          </h2>

          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1.5">
            {problems.map((p) => {
              const key = `${p.id}_${currentLanguage}`;
              const att = attempts[key];
              const roundsDone = att ? Object.values(att.roundCompleted || {}).filter(Boolean).length : 0;
              const progress = (roundsDone / 4) * 100;
              const completed = att?.finalCompleted;

              return (
                <div 
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-transparent transition-all duration-200 hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)] gap-4"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 94%, var(--bg-tertiary))' }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                        completed 
                          ? "text-[var(--ok-soft)] bg-[rgba(16,185,129,0.1)]" 
                          : roundsDone > 0 
                          ? "text-[var(--accent-primary)] bg-[var(--accent-soft)]" 
                          : "text-[var(--text-tertiary)]"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 size={12} className="text-[var(--ok-soft)]" />
                      ) : roundsDone > 0 ? (
                        <Zap size={10} fill="currentColor" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-[var(--border-light)]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[var(--text-primary)]">
                        {p.title}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span
                          className="px-2 py-0.25 rounded text-[8px] font-bold uppercase tracking-wider"
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
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4.5 justify-between sm:justify-end text-xs">
                    <div className="flex flex-col items-end gap-0.5 min-w-[80px]">
                      <ProgressBar value={progress} />
                      <span className="text-[9px] font-semibold text-[var(--text-tertiary)]">
                        {completed ? "4/4 rounds done" : `${roundsDone}/4 rounds`}
                      </span>
                    </div>

                    <Link
                      to={`/workspace/${p.id}`}
                      className="px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider cc-btn-primary flex items-center gap-1"
                    >
                      {completed ? "Review" : roundsDone > 0 ? "Resume" : "Solve"}
                      <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
