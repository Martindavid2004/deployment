

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Zap, 
  Bug, 
  Target, 
  Gamepad2, 
  DoorOpen, 
  CheckCircle2, 
  Shuffle, 
  Shield, 
  Trophy, 
  Flame, 
  ListTodo, 
  Activity, 
  RefreshCw,
  Plus,
  Swords
} from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import { API_BASE } from "../utils/api";

export default function Competitive({ attempts, problems, stats }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(1200);
  const [currentUser, setCurrentUser] = useState(null);
  const [winRate, setWinRate] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [quests, setQuests] = useState([]);

  // Calculate Win Rate and Win Streak from actual matches list
  useEffect(() => {
    if (!currentUser || !matches) return;
    const completed = matches.filter(m => m.status === 'completed');
    const totalCompleted = completed.length;
    if (totalCompleted === 0) {
      setWinRate(0);
      setWinStreak(0);
      return;
    }
    
    const uid = currentUser.id || currentUser._id;
    const wins = completed.filter(m => m.winner_id === uid);
    const wr = ((wins.length / totalCompleted) * 100).toFixed(1);
    
    let streak = 0;
    const sortedCompleted = [...completed].sort((a, b) => new Date(b.completed_at || b.updated_at || 0) - new Date(a.completed_at || a.updated_at || 0));
    for (const m of sortedCompleted) {
      if (m.winner_id === uid) {
        streak++;
      } else {
        break;
      }
    }
    setWinRate(wr);
    setWinStreak(streak);
  }, [matches, currentUser]);

  // Daily Arena Quests generator and progress tracking
  useEffect(() => {
    if (!currentUser || !matches) return;
    const dateStr = new Date().toDateString();
    const uid = currentUser.id || currentUser._id;
    const storageKey = `quests_${uid}_${dateStr}`;
    
    const day = new Date().getDate();
    const month = new Date().getMonth();
    
    const questPool = [
      { id: 1, type: "win", target: 1, text: "Win 1 Match in Arena", xp: 50, icon: "zap" },
      { id: 2, type: "play", target: 2, text: "Participate in 2 Arena Matches", xp: 75, icon: "activity" },
      { id: 3, type: "hints", target: 1, text: "Win 1 Match without using hints", xp: 100, icon: "award" },
      { id: 4, type: "perfect", target: 1, text: "Submit a completed match win", xp: 100, icon: "check" },
      { id: 5, type: "sprint", target: 1, text: "Win 1 Code Sprint match", xp: 50, icon: "zap" },
      { id: 6, type: "bughunt", target: 1, text: "Win 1 Bug Hunt match", xp: 75, icon: "bug" },
    ];
    
    const indices = [
      (day + month) % questPool.length,
      (day + month + 2) % questPool.length,
      (day + month + 4) % questPool.length
    ];
    
    if (indices[0] === indices[1]) indices[1] = (indices[1] + 1) % questPool.length;
    if (indices[0] === indices[2] || indices[1] === indices[2]) indices[2] = (indices[2] + 2) % questPool.length;
    
    const activeQuests = [
      { ...questPool[indices[0]], uniqueId: "q1" },
      { ...questPool[indices[1]], uniqueId: "q2" },
      { ...questPool[indices[2]], uniqueId: "q3" }
    ];
    
    const todayMatches = matches.filter(m => {
      const matchDateStr = new Date(m.completed_at || m.updated_at || 0).toDateString();
      return m.status === "completed" && matchDateStr === dateStr;
    });
    
    const todayWins = todayMatches.filter(m => m.winner_id === uid);
    
    let claimedMap = {};
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) claimedMap = JSON.parse(saved);
    } catch (e) {}
    
    activeQuests.forEach(q => {
      let progress = 0;
      if (q.type === "win") {
        progress = todayWins.length;
      } else if (q.type === "play") {
        progress = todayMatches.length;
      } else if (q.type === "hints") {
        const noHintsWins = todayWins.filter(m => {
          const pData = m.player1.user_id === uid ? m.player1 : m.player2;
          return pData && !pData.used_hints;
        });
        progress = noHintsWins.length;
      } else if (q.type === "perfect") {
        progress = todayWins.length;
      } else if (q.type === "sprint") {
        progress = todayWins.filter(m => m.game_mode === "standard").length;
      } else if (q.type === "bughunt") {
        progress = todayWins.filter(m => m.game_mode === "bug_hunt").length;
      }
      
      q.progress = Math.min(q.target, progress);
      q.claimed = !!claimedMap[q.uniqueId];
    });
    
    setQuests(activeQuests);
  }, [matches, currentUser]);

  const handleClaimQuestXP = async (quest) => {
    if (quest.progress < quest.target || quest.claimed) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await fetch(`${API_BASE}/users/quests/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ xp: quest.xp })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        const dateStr = new Date().toDateString();
        const uid = currentUser.id || currentUser._id;
        const storageKey = `quests_${uid}_${dateStr}`;
        
        let claimedMap = {};
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) claimedMap = JSON.parse(saved);
        } catch (e) {}
        
        claimedMap[quest.uniqueId] = true;
        localStorage.setItem(storageKey, JSON.stringify(claimedMap));
        
        setCurrentUser(prev => ({
          ...prev,
          competitive_xp: data.competitive_xp,
          competitive_level: data.competitive_level,
          xp: data.xp,
          level: data.level
        }));
        
        setQuests(prev => prev.map(q => q.uniqueId === quest.uniqueId ? { ...q, claimed: true } : q));
        alert(`Successfully claimed +${quest.xp} Competitive XP!`);
      } else {
        const err = await res.json();
        alert(`Failed to claim XP: ${err.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error claiming XP");
    }
  };

  const [leaderboardFilter, setLeaderboardFilter] = useState("global");
  const [invites, setInvites] = useState([]);
  const [selectedGameMode, setSelectedGameMode] = useState("standard");
  const [matchmakingProgress, setMatchmakingProgress] = useState("");
  const [feedItems, setFeedItems] = useState([
    "🔥 ByteQueen defeated DevWizard in standard (+24 ELO)",
    "🚀 HexCoder joined the matchmaking queue",
    "⚡ CodeMaster is on a 4-win streak in Bug Hunt!",
    "👾 New lobby room #8821 created by CoderX"
  ]);

  const gameModes = [
    {
      id: "standard",
      name: "Code Sprint",
      description: "Classic competitive coding - solve the problem fastest",
      icon: <Zap size={20} />,
      color: "emerald"
    },
    {
      id: "bug_hunt",
      name: "Bug Hunt",
      description: "Find and fix bugs in broken code",
      icon: <Bug size={20} />,
      color: "red"
    },
    {
      id: "code_shuffle",
      name: "Code Shuffle",
      description: "Rearrange shuffled code lines in the correct order",
      icon: <Shuffle size={20} />,
      color: "purple"
    }
  ];

  // Rotate Live Ticker Feed
  useEffect(() => {
    const feeds = [
      "🔥 ByteQueen defeated DevWizard in standard (+24 ELO)",
      "🚀 HexCoder joined matchmaking queue",
      "⚡ CodeMaster is on a 4-win streak in Bug Hunt!",
      "👾 New lobby room #8821 created by CoderX",
      "👑 Grandmaster DevWizard entered Code Shuffle arena",
      "🏆 CoderPrime won a Standard match in C++ (+18 ELO)",
      "🎯 User704 solved Bug Hunt in 45 seconds!",
      "💥 Arena Match #1094 initialized (HexCoder vs ByteQueen)"
    ];
    const interval = setInterval(() => {
      setFeedItems(prev => {
        const nextFeed = feeds[Math.floor(Math.random() * feeds.length)];
        return [nextFeed, prev[0], prev[1], prev[2]];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Matchmaking Scanner Subtitle Updates
  useEffect(() => {
    if (!loading) {
      setMatchmakingProgress("");
      return;
    }
    const steps = [
      "Initializing Matchmaking Socket...",
      "Syncing ELO rating range (±50)...",
      "Looking for active matches...",
      "Expanding ELO filter to (±120)...",
      "Connecting shard servers...",
      "Finalizing target workspace..."
    ];
    let i = 0;
    setMatchmakingProgress(steps[0]);
    const interval = setInterval(() => {
      i = (i + 1) % steps.length;
      setMatchmakingProgress(steps[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    fetchUserRating();
    fetchMatches();
  }, []);

  useEffect(() => {
    fetchLeaderboard(leaderboardFilter);
  }, [leaderboardFilter]);

  // Match invites polling
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE}/users/invites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setInvites(data);
          } else {
            setInvites([]);
          }
        }
      } catch (err) {
        console.error("Error fetching invites:", err);
      }
    };
    fetchInvites(); // Initial fetch
    const interval = setInterval(fetchInvites, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserRating = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        setRating(data.rating || 1200);
      }
    } catch (err) {
      console.error("Error fetching user rating:", err);
    }
  };

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/competitive/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMatches(data.slice(0, 5)); // Show last 5 matches
        } else {
          setMatches([]);
        }
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  };

  const fetchLeaderboard = async (filter) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/competitive/leaderboard?limit=10&filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          setLeaderboard([]);
        }
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  const handleAddFriend = async (username) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/friends/request/${username}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Friend request sent!");
      } else {
        const error = await res.json();
        alert(`Failed: ${error.detail || "Could not add friend"}`);
      }
    } catch (err) {
      console.error("Error adding friend:", err);
    }
  };

  const handleInviteFriend = async (username) => {
    // Generate a random match id for them to join, or create a lobby first
    // In our simplified plan, we ask user to create lobby or we generate an id to join
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/invites/send/${username}`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ game_id: gameId })
      });
      if (res.ok) {
        alert(`Invite sent! Tell them to join Lobby ID: ${gameId}`);
      } else {
        const error = await res.json();
        alert(`Failed: ${error.detail || "Could not invite friend"}`);
      }
    } catch (err) {
      console.error("Error inviting friend:", err);
    }
  };

  const handleClearInvites = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/users/invites/clear`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvites([]);
    } catch (err) {
      console.error("Error clearing invites:", err);
    }
  };

  const startMatchmaking = async (gameMode = selectedGameMode) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("[INFO] Starting matchmaking with game mode:", gameMode);

      const res = await fetch(`${API_BASE}/competitive/matchmaking`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ game_mode: gameMode })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`HTTP ${res.status}: ${errorText}`);
        alert(`Failed to start matchmaking: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.match_id) {
        navigate(`/competitive/match/${data.match_id}`);
      }
      fetchMatches();
    } catch (err) {
      console.error("Error starting matchmaking:", err);
      alert("Failed to start matchmaking: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMatchStatus = (match) => {
    if (match.status === "waiting") return "Waiting for opponent";
    if (match.status === "active") return "In Progress";
    if (match.status === "completed") return "Completed";
    return match.status;
  };

  const getGameModeName = (modeId) => {
    const mode = gameModes.find(m => m.id === modeId);
    return mode ? mode.name : "Code Sprint";
  };

  const getGameModeColor = (modeId) => {
    const mode = gameModes.find(m => m.id === modeId);
    return mode ? mode.color : "emerald";
  };

  // ELO Tier Badge generator
  const getEloTier = (elo) => {
    if (elo < 1200) return { name: "Bronze Challenger", color: "#9ca3af", glow: "rgba(156,163,175,0.2)" };
    if (elo < 1400) return { name: "Code Knight", color: "#3b82f6", glow: "rgba(59,130,246,0.35)" };
    if (elo < 1600) return { name: "Logic Lord", color: "#a855f7", glow: "rgba(168,85,247,0.35)" };
    return { name: "Grandmaster", color: "#fbbf24", glow: "rgba(251,191,36,0.5)" };
  };

  const activeTier = getEloTier(rating);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-theme-text-primary font-sans w-full relative">
      
      {/* Invites Notification Toast */}
      {invites.length > 0 && (
        <div className="absolute top-4 right-4 z-50 bg-theme-bg-secondary border border-[var(--accent-primary)] shadow-2xl rounded-xl p-4 w-80 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-sm text-[var(--accent-primary)] mb-2 flex items-center gap-2">
            <Swords size={16} /> Match Invitation!
          </h3>
          <p className="text-xs text-theme-text-secondary mb-3">
            <span className="font-bold">{invites[0].inviter_username}</span> has invited you to a match!
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                handleClearInvites();
                // We'd ideally join via a join route or use websocket,
                // For now just alert that they should join Lobby ID
                alert(`Proceeding to join lobby: ${invites[0].game_id}`);
              }}
              className="flex-1 bg-[var(--accent-primary)] text-white text-xs font-bold py-1.5 rounded"
            >
              Accept
            </button>
            <button 
              onClick={handleClearInvites}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-1.5 rounded"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Left Column (Actions, Game Modes, Matches) */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        
        {/* Main Competitive Action Card */}
        <div 
          className="rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            boxShadow: '12px 12px 24px rgba(0, 0, 0, 0.4), -12px -12px 24px rgba(255, 255, 255, 0.015), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.03)'
          }}
        >
          {/* Physical corner screws */}
          <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[7px] text-slate-600 select-none shadow-inner font-mono">+</div>
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[7px] text-slate-600 select-none shadow-inner font-mono">+</div>
          <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[7px] text-slate-600 select-none shadow-inner font-mono">+</div>
          <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[7px] text-slate-600 select-none shadow-inner font-mono">+</div>

          {/* Glowing Status Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 opacity-60" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 mt-2">
            <div>
              <h1 className="text-2xl font-extrabold mb-1 heading-font flex items-center gap-2">
                Competitive Arena
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                  live
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Join multiplayer lobbies, match instantly 1v1, or host coding matches with up to 15 players.
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-slate-850 text-emerald-400 border border-slate-700/50 rounded-full flex items-center gap-1.5 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]" />
              147 Online
            </div>
          </div>

          {/* Radar Matchmaking overlay */}
          {loading ? (
            <div 
              className="flex flex-col items-center justify-center p-8 rounded-xl gap-4 relative overflow-hidden"
              style={{
                background: 'radial-gradient(circle, #022c22 0%, #02110a 100%)',
                boxShadow: 'inset 5px 5px 15px rgba(0,0,0,0.8)',
                border: '2px solid #065f46'
              }}
            >
              {/* Scanlines effect */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />

              <div className="relative h-20 w-20 flex items-center justify-center">
                {/* Spinning Radar Line */}
                <div className="absolute inset-0 rounded-full border border-emerald-500/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '2.5s' }} />
                <div className="absolute inset-3 rounded-full border border-dashed border-emerald-500/20" />
                <Zap size={24} className="text-emerald-400 animate-pulse" />
              </div>
              <div className="text-center z-10">
                <div className="font-mono font-bold text-sm text-emerald-400 tracking-wider">SEARCHING ARENA OPPONENT...</div>
                <div className="text-[10px] text-emerald-500/80 mt-1 font-mono uppercase tracking-wide">
                  {matchmakingProgress}
                </div>
              </div>
              <button
                onClick={() => setLoading(false)}
                className="z-10 px-4 py-1.5 text-xs font-bold border border-red-500/30 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-lg transition-all shadow-[0_2px_10px_rgba(239,68,68,0.2)]"
              >
                CANCEL MATCHMAKING
              </button>
            </div>
          ) : (
            /* Neumorphic/Skeuomorphic Action Console */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-2 bg-slate-900/60 rounded-xl shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5),_inset_-4px_-4px_10px_rgba(255,255,255,0.02)] border border-slate-800">
              
              {/* Create Lobby button */}
              <button
                onClick={() => navigate("/lobby/create")}
                className="relative py-5 px-4 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 group select-none active:scale-[0.98] transition-all"
                style={{ 
                  background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)', 
                  border: '1px solid #475569',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.02), inset 0px 1px 0px rgba(255,255,255,0.1)'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.6), inset -2px -2px 5px rgba(255,255,255,0.01)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.02), inset 0px 1px 0px rgba(255,255,255,0.1)';
                }}
              >
                {/* Physical LED Status Light */}
                <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                
                <Gamepad2 size={24} className="group-hover:scale-110 transition-transform text-purple-400" />
                <div className="font-bold text-slate-100 text-sm tracking-wide">Create Lobby</div>
                <div className="text-[10px] text-slate-400 leading-snug">Host a game (2-15 players)</div>
              </button>

              {/* Join Lobby button */}
              <button
                onClick={() => navigate("/lobby/join")}
                className="relative py-5 px-4 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 group select-none active:scale-[0.98] transition-all"
                style={{ 
                  background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)', 
                  border: '1px solid #475569',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.02), inset 0px 1px 0px rgba(255,255,255,0.1)'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.6), inset -2px -2px 5px rgba(255,255,255,0.01)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.02), inset 0px 1px 0px rgba(255,255,255,0.1)';
                }}
              >
                {/* Physical LED Status Light */}
                <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />

                <DoorOpen size={24} className="group-hover:scale-110 transition-transform text-blue-400" />
                <div className="font-bold text-slate-100 text-sm tracking-wide">Join Lobby</div>
                <div className="text-[10px] text-slate-400 leading-snug">Enter game ID to join</div>
              </button>

              {/* Quick 1v1 Match button */}
              <button
                onClick={() => startMatchmaking(selectedGameMode)}
                className="relative py-5 px-4 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 group select-none active:scale-[0.98] transition-all"
                style={{ 
                  background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)', 
                  border: '1px solid #475569',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.02), inset 0px 1px 0px rgba(255,255,255,0.1)'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.6), inset -2px -2px 5px rgba(255,255,255,0.01)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.02), inset 0px 1px 0px rgba(255,255,255,0.1)';
                }}
              >
                {/* Physical LED Status Light */}
                <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />

                <Zap size={24} className="group-hover:scale-110 transition-transform text-emerald-400" />
                <div className="font-bold text-slate-100 text-sm tracking-wide">Quick 1v1 Match</div>
                <div className="text-[10px] text-slate-400 leading-snug">Find opponent instantly</div>
              </button>

            </div>
          )}

          {/* Game Mode Selection */}
          {!loading && (
            <div className="mt-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Select Game Mode for Quick 1v1</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {gameModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedGameMode(mode.id)}
                    className="text-left rounded-xl p-3.5 transition-all flex flex-col justify-between"
                    style={{
                      background: selectedGameMode === mode.id ? '#1e293b' : '#0f172a',
                      boxShadow: selectedGameMode === mode.id 
                        ? 'inset 3px 3px 6px rgba(0,0,0,0.6), inset -2px -2px 5px rgba(255,255,255,0.01)'
                        : '3px 3px 6px rgba(0,0,0,0.4), -3px -3px 6px rgba(255,255,255,0.01)',
                      border: `1.5px solid ${selectedGameMode === mode.id ? `var(--${mode.color}-500)` : '#1e293b'}`
                    }}
                  >
                    <div className="flex justify-between items-center w-full mb-2">
                      <div className={`p-1.5 rounded-lg ${
                        selectedGameMode === mode.id 
                          ? `bg-${mode.color}-500/20 text-${mode.color}-400`
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {mode.icon}
                      </div>
                      {selectedGameMode === mode.id && (
                        <CheckCircle2 size={14} className={`text-${mode.color}-400 shrink-0`} />
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${
                        selectedGameMode === mode.id ? `text-${mode.color}-400` : "text-slate-300"
                      }`}>
                        {mode.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-snug">{mode.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Arena Ticker Feed */}
        <div className="p-4 rounded-xl border bg-theme-bg-secondary/40 border-theme-border flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--accent-primary)] shrink-0 bg-[var(--accent-soft)] px-2.5 py-1 rounded">
            <Activity size={12} className="animate-pulse" /> Live Ticker
          </div>
          <div className="flex-1 w-full text-xs font-mono truncate text-theme-text-secondary select-none">
            {feedItems[0]}
          </div>
        </div>

        {/* Recent Matches */}
        {matches.length > 0 && (
          <div className="border border-theme-border rounded-2xl p-6 bg-theme-bg-secondary/90 shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" /> Recent Shard Matches
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  to={match.status === "active" ? `/competitive/match/${match.id}` : "#"}
                  className={`block border border-theme-border rounded-xl p-4 transition-all ${
                    match.status === "active" ? "hover:border-emerald-500 cursor-pointer bg-emerald-500/5" : "bg-theme-bg-secondary/40"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-sm">
                        {match.player1.username} vs {match.player2?.username || "Waiting..."}
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-${getGameModeColor(match.game_mode)}-500/10 text-${getGameModeColor(match.game_mode)}-400`}>
                        {getGameModeName(match.game_mode)}
                      </span>
                    </div>
                    <span className={`self-start sm:self-auto text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                      match.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                      match.status === "active" ? "bg-blue-500/10 text-blue-400" :
                      "bg-slate-700 text-theme-text-tertiary"
                    }`}>
                      {getMatchStatus(match)}
                    </span>
                  </div>
                  <div className="text-theme-text-tertiary text-xs mt-2">
                    {match.winner_id && (
                      <span className="text-emerald-400 font-medium">
                        Winner: {match.player1.user_id === match.winner_id ? match.player1.username : match.player2.username}
                      </span>
                    )}
                    {!match.winner_id && match.status === "waiting" && (
                      <span>Waiting for opponent to join...</span>
                    )}
                    {!match.winner_id && match.status === "active" && (
                      <span className="text-blue-400 font-medium">Click to join match →</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column (Stats and Leaderboard) */}
      <div className="flex flex-col gap-6 lg:col-span-1">
        
        {/* User Stats Card with Tier Badge */}
        <div className="border border-theme-border rounded-2xl p-6 bg-theme-bg-secondary/90 shadow-xl flex flex-col gap-5">
          <h2 className="text-base font-bold uppercase tracking-wider text-theme-text-secondary border-b pb-2.5 border-theme-border">Your Performance</h2>
          
          <div className="flex items-center gap-4">
            {/* Tier shield graphic */}
            <div 
              className="h-16 w-16 rounded-xl flex flex-col items-center justify-center relative shadow-lg text-white"
              style={{
                background: `linear-gradient(135deg, ${activeTier.color}, #1e293b)`,
                boxShadow: `0 0 15px ${activeTier.glow}`,
                border: `1.5px solid ${activeTier.color}`
              }}
            >
              <Shield size={24} className="animate-pulse" />
              <div className="text-[8px] font-bold uppercase tracking-widest mt-1">Tier</div>
            </div>
            
            <div className="flex flex-col gap-0.5">
              <div className="text-theme-text-tertiary text-[10px] font-bold uppercase tracking-wider">{activeTier.name}</div>
              <div className="text-3xl font-extrabold text-emerald-400 heading-font">{rating} ELO</div>
            </div>
          </div>

          {/* Mini streak panel */}
          <div className="grid grid-cols-2 gap-2.5 text-center mt-1">
            <div className="p-3 rounded-xl bg-theme-bg-secondary/40 border border-theme-border">
              <div className="text-[10px] text-theme-text-tertiary uppercase font-bold tracking-wider">Win Streak</div>
              <div className="text-base font-extrabold text-amber-400 flex items-center justify-center gap-1.5 mt-0.5">
                <Flame size={14} fill="currentColor" /> {winStreak} {winStreak === 1 ? 'Match' : 'Matches'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-theme-bg-secondary/40 border border-theme-border">
              <div className="text-[10px] text-theme-text-tertiary uppercase font-bold tracking-wider">Win Rate</div>
              <div className="text-base font-extrabold text-blue-400 flex items-center justify-center gap-1.5 mt-0.5">
                <Activity size={14} /> {winRate}%
              </div>
            </div>
          </div>

          <div className="border-t border-theme-border pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-theme-text-secondary">Arena Level {currentUser?.competitive_level || 1} Progress</span>
              <span className="text-emerald-400 font-mono">{currentUser?.competitive_xp || 0} XP</span>
            </div>
            <ProgressBar value={(((currentUser?.competitive_xp || 0) % 500) / 500) * 100} big />
          </div>
        </div>

        {/* Daily Arena Quests Card */}
        <div className="border border-theme-border rounded-2xl p-6 bg-theme-bg-secondary/90 shadow-xl flex flex-col gap-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-theme-text-secondary border-b pb-2 border-theme-border flex items-center gap-1.5">
            <ListTodo size={16} className="text-[var(--accent-primary)]" /> Arena Quests
          </h2>
          <div className="flex flex-col gap-3">
            {quests.length > 0 ? (
              quests.map((quest) => {
                const isDone = quest.progress >= quest.target;
                return (
                  <div key={quest.uniqueId} className={`flex flex-col gap-1.5 bg-theme-bg-secondary/40 p-2.5 rounded-xl border border-theme-border transition-all ${quest.claimed ? 'opacity-60' : ''}`}>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={`text-theme-text-secondary flex items-center gap-1.5 ${quest.claimed ? 'line-through text-theme-text-tertiary' : ''}`}>
                        {quest.icon === "zap" ? <Zap size={12} className="text-emerald-400" /> :
                         quest.icon === "bug" ? <Bug size={12} className="text-red-400" /> :
                         quest.icon === "award" ? <Trophy size={12} className="text-yellow-400" /> :
                         <Zap size={12} className="text-purple-400" />}
                        {quest.text}
                      </span>
                      <span className="text-emerald-400 font-mono text-xs">{quest.progress}/{quest.target}</span>
                    </div>
                    <ProgressBar value={(quest.progress / quest.target) * 100} />
                    <div className="flex justify-between items-center mt-0.5">
                      {quest.claimed ? (
                        <span className="text-[9px] text-emerald-400 font-bold">Quest Complete (+{quest.xp} XP Claimed)</span>
                      ) : isDone ? (
                        <button
                          onClick={() => handleClaimQuestXP(quest)}
                          className="px-2.5 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-[9px] font-extrabold cursor-pointer transition-all"
                        >
                          Claim +{quest.xp} XP
                        </button>
                      ) : (
                        <span className="text-[9px] text-theme-text-tertiary">+{quest.xp} XP Reward</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-theme-text-tertiary italic text-center py-2">
                No active quests for today. Check back later!
              </div>
            )}
          </div>
        </div>

        {/* Competitive Leaderboard */}
        <div className="border border-theme-border rounded-2xl p-6 bg-theme-bg-secondary/90 shadow-xl">
          <div className="flex items-center justify-between border-b pb-2 border-theme-border mb-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-theme-text-secondary">Top Players</h2>
            
            {/* Leaderboard Toggle */}
            <div className="flex bg-theme-bg-secondary/60 rounded-lg p-0.5 border border-theme-border">
              <button 
                onClick={() => setLeaderboardFilter("global")}
                className={`text-[10px] uppercase font-bold px-3 py-1 rounded-md transition-colors ${
                  leaderboardFilter === "global" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-theme-text-tertiary hover:text-theme-text-secondary"
                }`}
              >
                Global
              </button>
              <button 
                onClick={() => setLeaderboardFilter("friends")}
                className={`text-[10px] uppercase font-bold px-3 py-1 rounded-md transition-colors ${
                  leaderboardFilter === "friends" ? "bg-purple-500 text-white shadow-sm" : "text-theme-text-tertiary hover:text-theme-text-secondary"
                }`}
              >
                Friends
              </button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
            {leaderboard.length === 0 ? (
              <div className="text-center text-xs text-theme-text-tertiary py-4">
                {leaderboardFilter === "friends" ? "No friends added yet." : "No players found."}
              </div>
            ) : (
              leaderboard.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs border border-theme-border rounded-xl p-3 bg-theme-bg-secondary/40"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                      idx === 1 ? "bg-slate-400/20 text-theme-text-secondary" :
                      idx === 2 ? "bg-orange-500/20 text-orange-400" :
                      "bg-slate-700/30 text-theme-text-tertiary"
                    }`}>
                      {player.rank}
                    </div>
                    <div className="font-bold text-theme-text-secondary flex items-center gap-2">
                      {player.username}
                      {currentUser?.username === player.username && (
                        <span className="bg-[var(--accent-soft)] text-[var(--accent-primary)] text-[8px] px-1.5 py-0.5 rounded-full uppercase">You</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-extrabold">{player.rating}</span>
                    
                    {/* Action Buttons */}
                    {currentUser?.username !== player.username && (
                      <>
                        {leaderboardFilter === "global" ? (
                          <button 
                            onClick={() => handleAddFriend(player.username)}
                            className="bg-theme-bg-secondary hover:bg-slate-700 text-theme-text-secondary border border-theme-border rounded-full p-1 transition-colors"
                            title="Add Friend"
                          >
                            <Plus size={12} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleInviteFriend(player.username)}
                            className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 border border-purple-500/30 rounded px-2 py-0.5 transition-colors font-bold uppercase text-[9px]"
                            title="Invite to Match"
                          >
                            Invite
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
