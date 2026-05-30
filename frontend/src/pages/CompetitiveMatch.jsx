import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Zap, Bug, Target, Trophy, Lightbulb, CheckCircle2, AlertTriangle, Play, Shuffle, Medal, Award, Clock as ClockIcon, Home, Check, X } from "lucide-react";
import MonacoEditorWrapper from "../components/MonacoEditorWrapper";
import { API_BASE } from "../utils/api";

// Theme detection helper
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check if light-theme class exists on document root
    return !document.documentElement.classList.contains("light-theme");
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(!document.documentElement.classList.contains("light-theme"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
};

// Helper function to get theme-aware styles
const getThemeClasses = (isDark) => ({
  bg: {
    primary: isDark ? 'bg-slate-950' : 'bg-gray-50',
    secondary: isDark ? 'bg-slate-900' : 'bg-white',
    tertiary: isDark ? 'bg-slate-800' : 'bg-gray-100',
    hover: isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200',
  },
  text: {
    primary: isDark ? 'text-white' : 'text-gray-900',
    secondary: isDark ? 'text-slate-300' : 'text-gray-700',
    tertiary: isDark ? 'text-slate-400' : 'text-gray-500',
  },
  border: {
    light: isDark ? 'border-slate-700' : 'border-gray-200',
    dark: isDark ? 'border-slate-600' : 'border-gray-300',
  },
});

export default function CompetitiveMatch() {
  const isDark = useTheme();
  const theme = getThemeClasses(isDark);
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [matchStartTime, setMatchStartTime] = useState(null); // Server timestamp
  const [usedHints, setUsedHints] = useState(false);
  const timerRef = useRef(null);

  // For Bug Hunt Piston execution
  const [executionId, setExecutionId] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queuePosition, setQueuePosition] = useState(null);
  const pollingRef = useRef(null);

  // For Code Shuffle mode
  const [shuffledLines, setShuffledLines] = useState([]);
  const [arrangedLines, setArrangedLines] = useState([]);

  // For Test Master mode
  const [testCases, setTestCases] = useState([{ input: "", expected: "" }]);

  // For Match Completion Leaderboard
  const [matchCompleted, setMatchCompleted] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const pollIntervalRef = useRef(null);

  // For Leave Game Confirmation
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLeavingGame, setIsLeavingGame] = useState(false);

  // For validation dialog
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    fetchMatch();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [matchId]);

  // Poll for match completion (check every 2 seconds)
  useEffect(() => {
    if (matchCompleted || !matchId) return;

    const pollMatchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const currentUserId = localStorage.getItem("userId");
        
        const res = await fetch(`${API_BASE}/competitive/matches/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) return;
        
        const data = await res.json();
        
        // Check if match has been completed
        if (data.status === "completed" && !matchCompleted) {
          console.log("[INFO] Match completed! Showing scoreboard for:", currentUserId);
          
          if (data.players && data.players.length >= 2) {
            // Multiplayer match
            const allPlayers = data.players;
            const rank = allPlayers.findIndex(p => p.user_id === currentUserId) + 1;
            
            setFinalResults({
              type: 'multiplayer',
              rank: rank > 0 ? rank : 1,
              score: allPlayers.find(p => p.user_id === currentUserId)?.score || 0,
              players: allPlayers,
              currentUserId
            });
          }
          
          setMatchCompleted(true);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        }
      } catch (err) {
        console.error("[DEBUG] Poll error:", err);
      }
    };
    
    // Start polling
    pollIntervalRef.current = setInterval(pollMatchStatus, 2000);
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [matchId, matchCompleted]);

  // Update timer based on server start time
  useEffect(() => {
    if (matchStartTime && !matchCompleted) {
      // Parse server timestamp as UTC (server sends naive UTC datetime without 'Z')
      const utcTimestamp = matchStartTime.endsWith('Z') || matchStartTime.includes('+') 
        ? matchStartTime 
        : matchStartTime + 'Z';
      const startTime = new Date(utcTimestamp).getTime();
      
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        // Clamp elapsed to 0 minimum (handles clock skew)
        setTimeElapsed(Math.max(0, elapsed));
      };

      // Update immediately
      updateTimer();

      // Then update every second
      timerRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [matchStartTime, matchCompleted]);

  // Check if time has run out and end the game
  useEffect(() => {
    if (!match || !matchStartTime || matchCompleted) return;

    const timeLimit = match.time_limit_seconds || 900; // Default 15 minutes
    
    // Safety: Ensure we have a valid time limit
    if (timeLimit <= 0) {
      console.log("[WARNING] Invalid time limit:", timeLimit);
      return;
    }
    
    // Only check timeout for active matches
    if (match.status !== "active") {
      console.log("[WARNING] Match not active, status:", match.status);
      return;
    }
    
    // Prevent checking on initial load - wait for at least 10 seconds of game time
    if (timeElapsed < 10) {
      return;
    }
    
    const timeRemaining = Math.max(0, timeLimit - timeElapsed);

    // Only trigger timeout if timer reached 0 and has been running
    if (timeRemaining === 0 && timeElapsed >= timeLimit) {
      console.log("[TIMEOUT] Game time expired - auto-submitting current code...");
      console.log(`   Time limit: ${timeLimit}s, Elapsed: ${timeElapsed}s`);
      handleTimeExpired();
    }
  }, [timeElapsed, match, matchStartTime, matchCompleted]);

  // Poll for match completion after player submits
  useEffect(() => {
    if (!match || matchCompleted) return;
    
    // Check if current player has submitted
    const currentUserId = localStorage.getItem("userId");
    const currentPlayer = match.players?.find(p => p.user_id === currentUserId);
    
    if (!currentPlayer?.completed) return; // Current player hasn't submitted yet
    
    // Start polling every 3 seconds to check if all players are done
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/competitive/matches/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) return;
        
        const data = await res.json();
        
        // Check if match is completed
        if (data.status === "completed") {
          clearInterval(pollInterval);
          
          // Show leaderboard
          if (data.players && data.players.length >= 2) {
            // Multiplayer (2 or more players)
            const sortedPlayers = [...data.players].sort((a, b) => {
              return (b.score || 0) - (a.score || 0) || (a.time_elapsed || Infinity) - (b.time_elapsed || Infinity);
            });
            
            const rank = sortedPlayers.findIndex(p => p.user_id === currentUserId) + 1;
            
            setFinalResults({
              type: 'multiplayer',
              rank,
              score: currentPlayer?.score || 0,
              winners: sortedPlayers.slice(0, 3).map(p => p.username),
              players: sortedPlayers,
              currentUserId
            });
          } else if (data.player1 && data.player2) {
            // 1v1
            const isWinner = data.winner_id === currentUserId;
            
            setFinalResults({
              type: '1v1',
              isWinner,
              winnerId: data.winner_id,
              winnerUsername: data.winner_username,
              player1: {
                userId: data.player1.user_id,
                username: data.player1.username,
                isWinner: data.winner_id === data.player1.user_id,
                completionTime: data.player1.time_elapsed,
                completed: data.player1.completed
              },
              player2: {
                userId: data.player2.user_id,
                username: data.player2.username,
                isWinner: data.winner_id === data.player2.user_id,
                completionTime: data.player2.time_elapsed,
                completed: data.player2.completed
              },
              ratingChange: data.rating_change,
              xpBonus: data.xp_bonus,
              currentUserId
            });
          }
          
          setMatchCompleted(true);
          console.log("[INFO] Match completed - showing leaderboard");
        } else {
          // Update match data to show other players' progress
          setMatch(data);
        }
      } catch (err) {
        console.error("Error polling match status:", err);
      }
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(pollInterval);
  }, [match, matchCompleted, matchId]);

  const handleTimeExpired = async () => {
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Auto-submit current code with force_submit=true
    console.log("[TIMEOUT] Auto-submitting code...");
    await handleSubmit(true);
  };

  const fetchMatch = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentUserId = localStorage.getItem("userId");

      // 1. Fetch Match Details
      const res = await fetch(`${API_BASE}/competitive/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Match not found");
        throw new Error("Failed to load match");
      }

      const data = await res.json();
      console.log("Match data:", data);
      console.log("[INFO] Match Status:", data.status);
      console.log("[INFO] Player1 completed:", data.player1?.completed);
      console.log("[INFO] Player2 completed:", data.player2?.completed);
      console.log("[INFO] Winner ID:", data.winner_id);
      console.log("[INFO] Time limit:", data.time_limit_seconds);
      setMatch(data);
      
      // Set match start time for accurate timer calculation (survives page refresh)
      if (data.started_at) {
        setMatchStartTime(data.started_at);
        console.log("[INFO] Match started at:", data.started_at);
      }

      // 2. Determine Correct Problem ID (Multi-problem support)
      let problemIdToFetch = data.problem_id; // Default to legacy single ID
      let currentProblemIndex = 0;

      // Find current player to check progress
      let currentPlayer = null;
      if (data.players) {
        currentPlayer = data.players.find(p => p.user_id === currentUserId);
      } else if (data.player1 && data.player1.user_id === currentUserId) {
        currentPlayer = data.player1;
      } else if (data.player2 && data.player2.user_id === currentUserId) {
        currentPlayer = data.player2;
      }

      // 3. Fetch Problem Details
      // For Bug Hunt mode, fetch from special endpoint
      if (data.game_mode === "bug_hunt") {
        try {
          const bugHuntRes = await fetch(`${API_BASE}/competitive/matches/${matchId}/bug-hunt-question`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!bugHuntRes.ok) {
            const errorData = await bugHuntRes.json().catch(() => ({ detail: "Failed to load Bug Hunt question" }));
            console.error("[ERROR] Bug Hunt question fetch failed:", errorData);
            setProblem({ error: errorData.detail || "Bug Hunt question data missing." });
            return;
          }

          const bugHuntData = await bugHuntRes.json();
          console.log("[SUCCESS] Bug Hunt question loaded:", bugHuntData.title);
          
          // Convert Bug Hunt question format to problem format for compatibility
          const problemData = {
            id: bugHuntData.id,
            title: bugHuntData.title,
            description: bugHuntData.description,
            difficulty: bugHuntData.difficulty,
            buggyCode: bugHuntData.buggyCode,
            testCases: bugHuntData.testCases,
            hint: bugHuntData.hints?.[0] || "",
            current_index: bugHuntData.current_index,
            total_questions: bugHuntData.total_questions
          };
          
          setProblem(problemData);
          loadGameModeContent(data, problemData, currentUserId);
          
        } catch (err) {
          console.error("[ERROR] Error fetching Bug Hunt question:", err);
          setProblem({ error: "Failed to load Bug Hunt question: " + err.message });
        }
        return; // Exit early for Bug Hunt mode
      }

      // For other modes, use MongoDB problems
      // If multi-problem match, use progress to pick ID
      if (currentPlayer && data.problem_ids && data.problem_ids.length > 0) {
        currentProblemIndex = currentPlayer.current_problem_index || 0;

        // Safety check: Don't go out of bounds
        if (currentProblemIndex >= data.problem_ids.length) {
          currentProblemIndex = data.problem_ids.length - 1;
        }

        problemIdToFetch = data.problem_ids[currentProblemIndex];
        console.log(`[INFO] Resuming at Problem ${currentProblemIndex + 1}/${data.problem_ids.length} (ID: ${problemIdToFetch})`);
      }

      // Fetch MongoDB problem
      if (problemIdToFetch) {
        const problemRes = await fetch(`${API_BASE}/problems/${problemIdToFetch}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const problemData = await problemRes.json();

        if (!problemRes.ok || problemData.detail) {
          console.error("[ERROR] Problem fetch failed:", problemData);
          setProblem({ error: "Problem data missing or deleted. This match may be invalid." });
          return; // Stop loading
        }

        console.log("[SUCCESS] Problem loaded:", problemData.title);
        setProblem(problemData);

        // Load Code / Game Mode Specifics
        loadGameModeContent(data, problemData, currentUserId);
      } else {
        setProblem({ error: "No problem ID found for this match." });
      }

    } catch (err) {
      console.error("Error fetching match:", err);
      alert("Failed to load match: " + err.message);
      navigate("/competitive");
    }
  };

  // Helper to fix escaped newlines from seed data and normalize indentation
  const sanitizeCode = (codeStr) => {
    if (!codeStr) return "";
    // Replace escaped newlines
    let code = codeStr.replace(/\\n/g, '\n');
    
    // Normalize indentation - ensure consistent spacing
    const lines = code.split('\n');
    const normalized = lines.map(line => {
      // Fix lines with mismatched indentation
      if (line.match(/^ +\S/) && !line.match(/^    /) && !line.match(/^  /)) {
        // Likely has broken indentation - try to fix it
        const stripped = line.trimStart();
        const indent = line.length - stripped.length;
        // Round indentation to nearest 4-space increment
        const normalizedIndent = Math.round(indent / 4) * 4;
        return ' '.repeat(normalizedIndent) + stripped;
      }
      return line;
    });
    
    return normalized.join('\n');
  };

  const loadGameModeContent = (matchData, problemData, currentUserId) => {
    const gameMode = matchData.game_mode || "standard";
    console.log("[INFO] Game Mode:", gameMode);

    if (gameMode === "bug_hunt") {
      // Load buggy code for Bug Hunt mode
      const buggyFromMatch = matchData.buggy_code || "";
      const buggyFromProblem = problemData.buggyCode?.[language] || "";
      const starterFallback = problemData.starterCode?.[language] || "";
      const buggyCodeToUse = buggyFromMatch || buggyFromProblem || starterFallback;

      if (buggyCodeToUse) {
        setCode(sanitizeCode(buggyCodeToUse));
      } else {
        setCode("// No buggy code available");
      }
    } else if (gameMode === "code_shuffle") {
      // Load shuffled lines
      let shuffled = [];
      if (matchData.players && matchData.players.length > 0) {
        const p = matchData.players.find(user => user.user_id === currentUserId);
        shuffled = p?.shuffled_lines || [];
      } else {
        // Legacy 1v1
        const pKey = matchData.player1.user_id === currentUserId ? "player1" : "player2";
        shuffled = matchData[pKey]?.shuffled_lines || [];
      }
      setShuffledLines(shuffled);
      setArrangedLines([...shuffled]);
    } else {
      // Standard mode - load starter code
      const starter = problemData.starterCode?.[language] || "";
      setCode(sanitizeCode(starter));
    }
  };

  const handleSubmit = async (forceSubmit = false) => {
    setLoading(true);
    setOutput("Running tests...");

    try {
      const token = localStorage.getItem("token");
      const gameMode = match.game_mode || "standard";

      // Ensure code is a string (not a DOM element or other object)
      const codeString = typeof code === 'string' ? code : String(code || '');

      let submissionBody = {
        match_id: matchId,
        code: codeString,
        language,
        force_submit: forceSubmit,
      };

      // Add game mode specific data
      if (gameMode === "code_shuffle") {
        submissionBody.arranged_lines = arrangedLines;
      } else if (gameMode === "test_master") {
        submissionBody.test_cases = testCases.filter(tc => tc.input || tc.expected);
      }
      // Bug Hunt mode just sends the fixed code

      console.log("[DEBUG] Preparing submission:", {
        matchId,
        gameMode,
        hasCode: !!codeString,
        codeLength: codeString?.length,
        language,
        forceSubmit
      });

      let bodyString;
      try {
        bodyString = JSON.stringify(submissionBody);
      } catch (stringifyError) {
        console.error("[ERROR] Failed to stringify submission body:", stringifyError);
        console.error("[ERROR] Submission body keys:", Object.keys(submissionBody));
        setOutput(`[ERROR] Failed to prepare submission: ${stringifyError.message}`);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/competitive/matches/${matchId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: bodyString,
      });

      console.log("[DEBUG] Submit response status:", res.status, res.ok);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Unknown error" }));
        console.error("[ERROR] Submit failed:", res.status, errorData);
        setOutput(`[ERROR] ${errorData.detail || "Submission failed"}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("[INFO] Submission response received", data); // Debug log

      // Check for validation failure (Bug Hunt mode)
      if (data.validation_failed && !forceSubmit) {
        setValidationError(data);
        setShowValidationDialog(true);
        setLoading(false);
        return;
      }

      // Multi-problem race: Check if there's a next problem
        if (data.next_problem) {
          console.log("[INFO] Next problem detected! Auto-loading...");
          // Player solved current problem, load next one immediately
          setProblem(data.next_problem);
          setCode(data.next_problem.starterCode?.[language] || "");
          setOutput(`[SUCCESS] Problem ${data.problems_solved}/${data.total_problems} solved! Loading next problem...\n\nTime: ${data.time_elapsed?.toFixed(2) || 0}s | Score: ${data.score || 0}`);

          // Update progress tracking if needed
          if (data.progress) {
            console.log(`Progress: ${data.progress.current}/${data.progress.total}`);
          }

          setLoading(false);
          return; // Exit early, don't show leaderboard
        }

        // Check if all problems solved but waiting for others
        if (data.all_problems_complete && !data.winner_id && !data.winners) {
          setOutput(`[SUCCESS] All ${data.total_problems || 5} problems solved! Waiting for other players to finish...\n\nYour Score: ${data.score || 0}\nTime: ${data.time_elapsed?.toFixed(2) || 0}s`);
          setLoading(false);
          return;
        }

        if (data.winner_id || data.winners) {
          // Match completed - store results and show leaderboard
          const currentUserId = localStorage.getItem("userId");
          console.log("[INFO] MATCH COMPLETED! Showing scoreboard...");
          console.log("[INFO] Completion data:", data);

          if (data.winners) {
            // Multiplayer match completed
            const allPlayers = data.players || match?.players || [];
            const rank = data.rank || allPlayers.findIndex(p => p.user_id === currentUserId) + 1;

            console.log("[DEBUG] Match completed with players:", allPlayers.length);
            console.log("[DEBUG] Players data:", allPlayers);

            setFinalResults({
              type: 'multiplayer',
              rank,
              score: data.final_score || data.score || 0,
              winners: data.winners,
              players: allPlayers,
              currentUserId
            });
            console.log("[INFO] Multiplayer scoreboard set with", allPlayers.length, "players");
          } else {
            // 1v1 match completed
            const isWinner = data.winner_id === currentUserId;

            setFinalResults({
              type: '1v1',
              isWinner,
              winnerId: data.winner_id,
              winnerUsername: data.winner_username,
              winnerTime: data.winner_time,
              player1: {
                userId: match.player1?.user_id || '',
                username: match.player1?.username || 'Player 1',
                completed: true,
                completionTime: data.winner_id === match.player1?.user_id ? data.winner_time : data.loser_time,
                isWinner: data.winner_id === match.player1?.user_id
              },
              player2: {
                userId: match.player2?.user_id || '',
                username: match.player2?.username || 'Player 2',
                completed: true,
                completionTime: data.winner_id === match.player2?.user_id ? data.winner_time : data.loser_time,
                isWinner: data.winner_id === match.player2?.user_id
              },
              ratingChange: data.rating_change,
              xpBonus: data.xp_bonus,
              currentUserId
            });
            console.log("[INFO] 1v1 scoreboard set");
          }

          setMatchCompleted(true);
          console.log("[SUCCESS] matchCompleted set to TRUE - scoreboard should display now!");

          // Scoreboard stays visible until user clicks "Back to Competitive"
          // No auto-redirect - user controls when to leave

          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        } else {
          const waitMsg = data.message || "[SUCCESS] Solution submitted! Waiting for other players to finish...";
          if (data.score) {
            setOutput(`${waitMsg}\n\nYour Score: ${data.score}`);
          } else {
            setOutput(waitMsg);
          }
          
          // Refresh match data to update player cards with scores
          await fetchMatch();
        }

        if (timerRef.current && (data.winner_id || data.winners)) {
          clearInterval(timerRef.current);
        }
    } catch (err) {
      console.error("Error submitting solution:", err);
      console.error("Error details:", {
        message: err.message,
        name: err.name,
        matchId,
        gameMode: match?.game_mode,
        hasCode: !!code,
        language
      });
      setOutput(`[ERROR] Error submitting solution: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    const gameMode = match.game_mode || "standard";

    if (gameMode === "code_shuffle") {
      // For Code Shuffle, execute the arranged code to test if it works
      const arrangedCode = arrangedLines.join('\n');

      if (!arrangedCode.trim()) {
        setOutput("[WARNING] Please arrange some code lines first!");
        return;
      }

      // Check if problem has test cases or examples
      const sampleInput = problem.examples?.[0]?.input || problem.testCases?.[0]?.input || "";
      const expectedOutput = problem.examples?.[0]?.output || problem.testCases?.[0]?.expected || "";

      if (!sampleInput.trim()) {
        setOutput(
          `[INFO] Your Arranged Code:\n${arrangedCode}\n\n` +
          `[WARNING] Cannot test - no sample input available\n\n` +
          `[TIP] This problem doesn't have test cases defined. Your arrangement will be validated when you submit!\n` +
          `[INFO] Submit your arrangement to have it officially tested against all test cases.`
        );
        return;
      }

      setLoading(true);
      setOutput("Testing your arranged code...");

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/execute/run`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: arrangedCode,
            language: language,
            test_input: sampleInput,
          }),
        });

        const data = await res.json();

        if (data.success) {
          const actualOutput = data.output.trim();
          const expected = expectedOutput.trim();
          const passed = actualOutput === expected;

          setOutput(
            `[INFO] Your Arranged Code:\n${arrangedCode}\n\n` +
            `[TEST] Sample Test Result:\n\n` +
            `Input:\n${sampleInput}\n\n` +
            `Expected Output:\n${expected}\n\n` +
            `Your Output:\n${actualOutput}\n\n` +
            `Status: ${passed ? '[PASSED]' : '[FAILED]'}\n\n` +
            `[TIP] This is just a sample test. Submit to check arrangement accuracy!`
          );
        } else {
          // Check if it's an indentation error
          const errorMsg = data.error || data.output || "";
          const isIndentationError = errorMsg.includes("IndentationError") || errorMsg.includes("indent");
          
          if (isIndentationError) {
            setOutput(
              `[INFO] Your Arranged Code:\n${arrangedCode}\n\n` +
              `[ERROR] Indentation Error:\n\n${errorMsg}\n\n` +
              `[TIP] The lines might be in the wrong order. Check that:\n` +
              `  1. Control structures (if/for/while) are before their bodies\n` +
              `  2. Indentation levels match the code structure\n` +
              `  3. Related lines are together in logical order\n\n` +
              `Try rearranging the lines to fix the indentation!`
            );
          } else {
            setOutput(
              `[INFO] Your Arranged Code:\n${arrangedCode}\n\n` +
              `[ERROR] Runtime Error:\n\n${errorMsg}\n\n` +
              `[TIP] The code arrangement might be incorrect or have syntax errors!`
            );
          }
        }
      } catch (err) {
        console.error("Error running arranged code:", err);
        setOutput("[ERROR] Error running code. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (gameMode === "test_master") {
      // For Test Master, show created test cases
      const validTestCases = testCases.filter(tc => tc.input || tc.expected);
      if (validTestCases.length === 0) {
        setOutput("[WARNING] No test cases created yet. Add some test cases to review.");
        return;
      }
      let output = `[INFO] Your Test Cases (${validTestCases.length} total):\n\n`;
      validTestCases.forEach((tc, idx) => {
        output += `Test Case ${idx + 1}:\n`;
        output += `  Input: ${tc.input || '(empty)'}\n`;
        output += `  Expected: ${tc.expected || '(empty)'}\n\n`;
      });
      output += "[TIP] Tip: Make sure to include edge cases!";
      setOutput(output);
      return;
    }

    // For Standard and Bug Hunt modes - run code with sample tests
    if (!code.trim()) {
      setOutput("[WARNING] Please write some code first!");
      return;
    }

    // Bug Hunt mode: Use Piston API for real compilation
    if (gameMode === "bug_hunt") {
      setIsExecuting(true);
      setLoading(true);
      setOutput("Compiling and executing code via Piston API...");

      const sampleInput = problem.examples?.[0]?.input || problem.testCases?.[0]?.input || "";
      const expectedOutput = problem.examples?.[0]?.output || problem.testCases?.[0]?.expected || "";
      
      console.log("Bug Hunt - problem structure:", problem);
      console.log("Bug Hunt - sampleInput:", sampleInput);
      console.log("Bug Hunt - expectedOutput:", expectedOutput);

      const result = await executeBugHuntCode(code, sampleInput);
      
      if (result) {
        if (result.compile_error) {
          setOutput(
            `[COMPILATION ERROR]\n\n${result.compile_error}\n\n` +
            `[TIP] Fix the compilation errors and try again!`
          );
        } else if (result.runtime_error) {
          setOutput(
            `[RUNTIME ERROR]\n\n${result.runtime_error}\n\n` +
            `[TIP] Check your code logic and try again!`
          );
        } else if (result.timed_out) {
          setOutput(
            `[TIMEOUT]\n\nExecution timed out after 10 seconds.\n\n` +
            `[TIP] Your code might have an infinite loop!`
          );
        } else {
          const actualOutput = (result.output || "").trim();
          const expected = expectedOutput.trim();
          const passed = actualOutput === expected;

          setOutput(
            `[TEST] Sample Test Result:\n\n` +
            `Input:\n${sampleInput}\n\n` +
            `Expected Output:\n${expected}\n\n` +
            `Your Output:\n${actualOutput}\n\n` +
            `Status: ${passed ? '[PASSED ✓]' : '[FAILED ✗]'}\n\n` +
            `Execution Time: ${result.execution_time?.toFixed(3) || 0}s\n\n` +
            `[TIP] This is just a sample test. Submit to run all test cases!`
          );
        }
      }

      setLoading(false);
      return;
    }

    // Standard mode: Use existing local execution
    setLoading(true);
    setOutput("Running sample tests...");

    try {
      const token = localStorage.getItem("token");

      // Use the first example or test case as a sample
      const sampleInput = problem.examples?.[0]?.input || problem.testCases?.[0]?.input || "";
      const expectedOutput = problem.examples?.[0]?.output || problem.testCases?.[0]?.expected || "";

      const res = await fetch(`${API_BASE}/execute/run`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          test_input: sampleInput,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const actualOutput = data.output.trim();
        const expected = expectedOutput.trim();
        const passed = actualOutput === expected;

        setOutput(
          `[TEST] Sample Test Result:\n\n` +
          `Input:\n${sampleInput}\n\n` +
          `Expected Output:\n${expected}\n\n` +
          `Your Output:\n${actualOutput}\n\n` +
          `Status: ${passed ? '[PASSED]' : '[FAILED]'}\n\n` +
          `[TIP] This is just a sample test. Submit to run all test cases!`
        );
      } else {
        // Check for indentation errors and provide helpful feedback
        const errorMsg = data.error || data.output || "";
        const isIndentationError = errorMsg.includes("IndentationError") || errorMsg.includes("indent does not match");
        
        if (isIndentationError) {
          setOutput(
            `[ERROR] Indentation Error:\n\n${errorMsg}\n\n` +
            `[TIP] In Bug Hunt mode, you need to fix the indentation:\n` +
            `  1. Check that the indentation is consistent (use spaces, not tabs)\n` +
            `  2. Make sure code inside if/for/while blocks is indented 4 more spaces\n` +
            `  3. Code at the same level should have the same indentation\n` +
            `  4. Use the editor's auto-format if available\n\n` +
            `[HINT] This is likely a bug that needs to be fixed!`
          );
        } else {
          setOutput(
            `[ERROR] Runtime Error:\n\n${errorMsg}\n\n` +
            `[TIP] Fix the error and try again!`
          );
        }
      }
    } catch (err) {
      console.error("Error running code:", err);
      setOutput("[ERROR] Error running code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseHint = async () => {
    if (usedHints) {
      alert("You have already used a hint in this match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/competitive/matches/${matchId}/hint`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsedHints(true);
      alert("Hint used! Note: This reduces your potential XP bonus.");
    } catch (err) {
      console.error("Error using hint:", err);
    }
  };

  const handleLeaveGame = async () => {
    setIsLeavingGame(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/competitive/matches/${matchId}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        // Clear the leave confirmation dialog
        setShowLeaveConfirm(false);
        // Navigate back to competitive page
        alert("You have left the game and been marked as lost.");
        navigate("/competitive");
      } else {
        const error = await res.json();
        alert("Error leaving game: " + (error.detail || "Failed to leave game"));
      }
    } catch (err) {
      console.error("Error leaving game:", err);
      alert("Failed to leave game. Please try again.");
    } finally {
      setIsLeavingGame(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLineMove = (fromIndex, direction) => {
    const newLines = [...arrangedLines];
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= newLines.length) return;

    [newLines[fromIndex], newLines[toIndex]] = [newLines[toIndex], newLines[fromIndex]];
    setArrangedLines(newLines);
  };

  const handleDragEnd = (result) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = Array.from(arrangedLines);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setArrangedLines(items);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expected: "" }]);
  };

  const removeTestCase = (index) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  // Bug Hunt: Language Switching Handler
  const handleLanguageSwitch = async (newLanguage) => {
    if (newLanguage === language) return;

    const gameMode = match?.game_mode || "standard";
    if (gameMode !== "bug_hunt") {
      // For non-bug-hunt modes, just switch language normally
      setLanguage(newLanguage);
      if (problem?.starterCode?.[newLanguage]) {
        setCode(sanitizeCode(problem.starterCode[newLanguage]));
      }
      return;
    }

    // Bug Hunt mode: Call API to switch language
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/competitive/matches/${matchId}/switch-language`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_language: newLanguage }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Failed to switch language: ${error.detail || "Unknown error"}`);
        return;
      }

      const data = await res.json();
      setLanguage(newLanguage);
      setCode(sanitizeCode(data.buggy_code));
      setOutput(`[INFO] Switched to ${newLanguage.toUpperCase()}. Timer and progress preserved.`);
    } catch (err) {
      console.error("Error switching language:", err);
      alert("Failed to switch language. Please try again.");
    }
  };

  // Bug Hunt: Async Code Execution with Piston API
  const executeBugHuntCode = async (codeToRun, testInput = "") => {
    try {
      console.log("executeBugHuntCode called with testInput:", testInput);
      const token = localStorage.getItem("token");
      
      // Submit code for execution
      const res = await fetch(`${API_BASE}/competitive/matches/${matchId}/execute`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeToRun,
          language,
          stdin: testInput || "",  // Pass test input for execution
        }),
      });
      
      console.log("Sent stdin to backend:", testInput || "");

      if (res.status === 503) {
        const error = await res.json();
        setOutput(`[ERROR] ${error.detail || "Server is busy. Please try again in a moment."}`);
        return null;
      }

      if (!res.ok) {
        const error = await res.json();
        setOutput(`[ERROR] ${error.detail || "Failed to execute code"}`);
        return null;
      }

      const data = await res.json();
      setExecutionId(data.execution_id);
      setQueuePosition(data.queue_position);
      
      // Start polling for results
      return await pollExecutionResult(data.execution_id);
    } catch (err) {
      console.error("Error executing code:", err);
      setOutput("[ERROR] Failed to execute code. Please try again.");
      return null;
    }
  };

  // Poll for execution results
  const pollExecutionResult = async (execId) => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 60; // 30 seconds (500ms * 60)

      const poll = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE}/competitive/matches/${matchId}/execution/${execId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            clearInterval(pollingRef.current);
            setOutput("[ERROR] Failed to get execution result");
            setIsExecuting(false);
            resolve(null);
            return;
          }

          const data = await res.json();

          if (data.status === "completed") {
            clearInterval(pollingRef.current);
            setIsExecuting(false);
            setQueuePosition(null);
            resolve(data);
          } else if (data.status === "failed") {
            clearInterval(pollingRef.current);
            setIsExecuting(false);
            setQueuePosition(null);
            
            // Display the actual error from backend
            let errorMsg = data.compile_error || data.runtime_error;
            if (!errorMsg && !data.output) {
              errorMsg = "Code executed but produced no output. Check if your code is reading input and printing results correctly.";
            } else if (!errorMsg) {
              errorMsg = "Unknown error";
            }
            setOutput(`[ERROR] Execution failed:\n${errorMsg}`);
            resolve(null);
          } else {
            // Still processing
            attempts++;
            if (attempts >= maxAttempts) {
              clearInterval(pollingRef.current);
              setIsExecuting(false);
              setOutput("[ERROR] Execution timed out. Please try again.");
              resolve(null);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
          clearInterval(pollingRef.current);
          setIsExecuting(false);
          resolve(null);
        }
      };

      pollingRef.current = setInterval(poll, 500);
      poll(); // Initial poll
    });
  };



  const getGameModeInfo = () => {
    const mode = match?.game_mode || "standard";
    const modes = {
      standard: { name: "Code Sprint", icon: <Zap size={20} />, color: "emerald" },
      bug_hunt: { name: "Bug Hunt", icon: <Bug size={20} />, color: "red" },
      code_shuffle: { name: "Code Shuffle", icon: <Shuffle size={20} />, color: "purple" },
    };
    return modes[mode] || modes.standard;
  };

  if (!match || !problem) {
    return (
      <div className={`flex items-center justify-center h-screen ${theme.bg.primary}`}>
        <div className={`${theme.text.tertiary} flex flex-col items-center gap-4`}>
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-slate-400' : 'border-gray-600'}`}></div>
          <div>Loading match...</div>
        </div>
      </div>
    );
  }

  // Error State - Problem Missing or Match Invalid
  if (problem?.error) {
    return (
      <div className={`flex items-center justify-center h-screen ${theme.bg.primary}`}>
        <div className={`text-center p-8 ${theme.bg.secondary} rounded-lg border border-red-900/50 max-w-md`}>
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>Match Validation Failed</h2>
          <p className={`${theme.text.secondary} mb-6`}>{problem.error}</p>
          <p className={`text-xs ${theme.text.tertiary} mb-6`}>
            This usually happens if the problem database was updated while you were in a match.
          </p>
          <button
            onClick={() => navigate('/competitive')}
            className={`px-6 py-2 ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'} ${theme.text.primary} rounded-md transition-colors`}
          >
            ← Back to Competitive
          </button>
        </div>
      </div>
    );
  }

  const timeLimit = match.time_limit_seconds || 900; // Default 15 minutes  
  const timeRemaining = Math.max(0, timeLimit - timeElapsed);
  const timeProgress = Math.min(100, (timeElapsed / timeLimit) * 100);
  const gameMode = match.game_mode || "standard";
  const modeInfo = getGameModeInfo();

  // Check if this is a multiplayer match
  const isMultiplayer = match.players && match.players.length >= 2;
  const players = match.players || [match.player1, match.player2].filter(p => p);
  const currentUserId = localStorage.getItem("userId");
  const currentPlayer = players.find(p => p.user_id === currentUserId);

  return (
    <div className={`w-screen h-screen flex flex-col fixed inset-0 ${isDark 
      ? 'bg-slate-950' 
      : 'bg-gray-50'
      }`}>
      {/* Header */}
      <div className={`border-b ${isDark 
        ? 'border-slate-700 bg-slate-900' 
        : 'border-gray-200 bg-white'
        } p-4`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span>{modeInfo.icon}</span>
              <span>{modeInfo.name}</span>
              {isMultiplayer ? (
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {players.length} Players
                  {match.game_id && <span className="ml-2 font-mono text-purple-400">{match.game_id}</span>}
                </span>
              ) : (
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {match.player1?.username || 'Player 1'} vs {match.player2?.username || "Waiting..."}
                </span>
              )}
            </h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{problem.title}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`text-right ${timeRemaining < 60 ? 'text-red-400' : isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Time Remaining</div>
              <div className="text-xl font-mono font-bold">
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Player Status */}
            {isMultiplayer ? (
              <div className="text-right">
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Completed</div>
                <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {players.filter(p => p.completed).length} / {players.length}
                </div>
              </div>
            ) : null}

            {/* Leave Game Button */}
            <button
              onClick={() => setShowLeaveConfirm(true)}
              disabled={matchCompleted}
              className={`px-3 py-2 rounded text-xs font-medium flex items-center gap-2 transition-colors ${
                matchCompleted
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              }`}
              title="Leave the game - you will be marked as lost"
            >
              <X size={16} />
              Leave
            </button>
          </div>
        </div>

        {/* Player Progress Bars for 1v1 */}
        {!isMultiplayer && match.player2 && (
          <div className="mb-3 space-y-2">
            {/* Player 1 (Current User) */}
            <div className="flex items-center gap-3">
              <div className={`w-32 text-xs ${isDark ? 'text-slate-300' : 'text-gray-700'} font-medium truncate`}>
                {match.player1?.username || 'Player 1'}
                {match.player1?.user_id === currentUserId && (
                  <span className="ml-1 text-purple-400">(You)</span>
                )}
              </div>
              <div className={`flex-1 ${isDark ? 'bg-slate-700' : 'bg-gray-300'} rounded-full h-2 overflow-hidden relative`}>
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${match.player1?.completed ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  style={{
                    width: `${Math.max(5, ((match.player1?.problems_solved || 0) / (match.total_problems || 5)) * 100)}%`
                  }}
                />
              </div>
              <div className="w-20 text-xs text-right">
                {match.player1?.completed ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1"><Check size={14} /> Completed</span>
                ) : (
                  <span className="text-blue-400">
                    {match.player1?.problems_solved || 0}/{match.total_problems || 5} solved
                  </span>
                )}
              </div>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="flex items-center gap-3">
              <div className={`w-32 text-xs ${isDark ? 'text-slate-300' : 'text-gray-700'} font-medium truncate`}>
                {match.player2?.username || 'Player 2'}
                {match.player2?.user_id === currentUserId && (
                  <span className="ml-1 text-purple-400">(You)</span>
                )}
              </div>
              <div className={`flex-1 ${isDark ? 'bg-slate-700' : 'bg-gray-300'} rounded-full h-2 overflow-hidden relative`}>
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${match.player2?.completed ? 'bg-emerald-500' : 'bg-purple-500'
                    }`}
                  style={{
                    width: `${Math.max(5, ((match.player2?.problems_solved || 0) / (match.total_problems || 5)) * 100)}%`
                  }}
                />
              </div>
              <div className="w-20 text-xs text-right">
                {match.player2.completed ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1"><Check size={14} /> Completed</span>
                ) : (
                  <span className="text-purple-400">
                    {match.player2.problems_solved || 0}/{match.total_problems || 5} solved
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Players List for Multiplayer */}
        {isMultiplayer && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            {players.map((player, idx) => (
              <div
                key={player?.user_id || idx}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs border ${player?.user_id === currentUserId
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : player?.completed
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : isDark ? 'border-slate-600 bg-slate-800 text-slate-400' : 'border-gray-300 bg-gray-200 text-gray-600'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {player?.rank && <span className="font-bold">#{player.rank}</span>}
                  <span className="font-medium">{player?.username || `Player ${idx + 1}`}</span>
                  {player?.completed && <Check size={14} />}
                </div>
                {player?.score !== undefined && player?.score !== null && (
                  <div className={`text-xs mt-1 ${player?.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                    Score: {player.score}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className={`w-full ${isDark ? 'bg-slate-700' : 'bg-gray-300'} rounded-full h-1`}>
          <div
            className={`h-1 rounded-full transition-all ${timeProgress > 90 ? 'bg-red-500' :
              timeProgress > 70 ? 'bg-orange-500' :
                'bg-emerald-500'
              }`}
            style={{ width: `${timeProgress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Description */}
        <div className={`w-1/3 border-r ${theme.border.light} overflow-y-auto p-4 ${theme.bg.primary}`}>
          <div className="mb-4">
            <h2 className={`text-sm font-semibold mb-2 text-emerald-400`}>Problem</h2>
            <div className="mb-2">
              <span className={`text-xs px-2 py-1 rounded ${problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                {problem.difficulty}
              </span>
            </div>
            <p className={`text-sm ${theme.text.secondary} leading-relaxed whitespace-pre-line`}>{problem.description}</p>
          </div>

          {problem.examples && problem.examples.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 text-blue-400">Examples</h3>
              {problem.examples.map((ex, idx) => (
                <div key={idx} className={`mb-3 p-3 ${theme.bg.tertiary} rounded ${theme.border.light} border`}>
                  <div className={`text-xs mb-1 ${theme.text.tertiary}`}>Example {idx + 1}</div>
                  <div className="text-xs space-y-2">
                    <div>
                      <div className={`${theme.text.secondary} font-semibold mb-1`}>Input:</div>
                      <div className={`font-mono text-xs text-emerald-400 ${theme.bg.secondary} p-2 rounded whitespace-pre`}>{ex.input}</div>
                    </div>
                    <div>
                      <div className={`${theme.text.secondary} font-semibold mb-1`}>Output:</div>
                      <div className={`font-mono text-xs text-blue-400 ${theme.bg.secondary} p-2 rounded whitespace-pre`}>{ex.output}</div>
                    </div>
                    {ex.explanation && (
                      <div>
                        <div className={`${theme.text.secondary} font-semibold mb-1`}>Explanation:</div>
                        <div className={`text-xs ${theme.text.secondary}`}>{ex.explanation}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {problem.hint && (
            <div className="mb-4">
              <button
                onClick={handleUseHint}
                disabled={usedHints}
                className={`text-xs px-3 py-1 rounded ${usedHints
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  }`}
              >
                <span className="flex items-center gap-1">
                  <Lightbulb size={14} />
                  {usedHints ? 'Hint Used' : 'Use Hint (reduces XP bonus)'}
                </span>
              </button>
              {usedHints && (
                <div className={`mt-2 p-2 border rounded text-xs ${isDark ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                  {problem.hint}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Code Editor & Output */}
        <div className="flex-1 flex flex-col">
          {/* Bug Hunt Mode Banner */}
          {gameMode === "bug_hunt" && (
            <div className="bg-red-500/10 border-b border-red-500/30 p-3">
              <div className="flex items-center gap-3">
                <Bug size={32} className="text-red-400" />
                <div>
                  <h3 className="text-sm font-bold text-red-400">Bug Hunt Challenge</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    The code below contains bugs! Find and fix all errors to make it pass the test cases.
                    <span className="text-red-300 font-semibold"> Copy/Paste is disabled</span> - you must manually edit the code.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Game Mode Specific UI */}
          {gameMode === "code_shuffle" ? (
            /* Code Shuffle Mode */
            <div className="flex-1 overflow-hidden p-4">
              <div className="h-full flex flex-col">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">
                    Arrange the code lines in the correct order
                  </h3>
                  <p className="text-xs text-slate-400">
                    Drag lines to reorder or use arrow buttons. At least 80% accuracy required.
                  </p>
                </div>

                {arrangedLines.length === 0 ? (
                  /* No lines available - show error */
                  <div className="flex-1 flex items-center justify-center">
                    <div className={`text-center p-8 rounded-lg border ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-300'}`}>
                      <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-red-400 mb-2">No Code Lines Available</h3>
                      <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        This problem doesn't have reference code for shuffling.
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                        Please try a different problem or contact an administrator.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Code lines available - show drag & drop interface */
                  <>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="code-lines">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="flex-1 overflow-y-auto space-y-2 mb-4"
                            style={{
                              backgroundColor: snapshot.isDraggingOver ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
                            }}
                          >
                            {arrangedLines.map((line, idx) => (
                              <Draggable key={`line-${idx}`} draggableId={`line-${idx}`} index={idx}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`flex items-center gap-2 ${isDark ? 'bg-slate-900' : 'bg-white'} border rounded p-2 transition-all ${snapshot.isDragging
                                      ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-105'
                                      : isDark ? 'border-slate-700' : 'border-gray-300'
                                      }`}
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      className={`cursor-grab active:cursor-grabbing p-2 rounded ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
                                      title="Drag to reorder"
                                    >
                                      <svg className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <button
                                        onClick={() => handleLineMove(idx, "up")}
                                        disabled={idx === 0}
                                        className={`text-xs px-2 py-1 rounded disabled:opacity-30 transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                                        title="Move up"
                                      >
                                        ↑
                                      </button>
                                      <button
                                        onClick={() => handleLineMove(idx, "down")}
                                        disabled={idx === arrangedLines.length - 1}
                                        className={`text-xs px-2 py-1 rounded disabled:opacity-30 transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                                        title="Move down"
                                      >
                                        ↓
                                      </button>
                                    </div>
                                    <div className={`text-xs font-bold w-8 text-center ${isDark ? 'text-slate-500' : 'text-gray-600'}`}>
                                      {idx + 1}
                                    </div>
                                    <div className={`flex-1 font-mono text-xs p-3 rounded overflow-x-auto whitespace-pre ${isDark ? 'text-slate-300 bg-slate-950' : 'text-gray-700 bg-gray-100'}`}>
                                      {line}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <div className="flex gap-2">
                      <button
                        onClick={handleRun}
                        disabled={loading}
                        className={`px-4 py-2 rounded font-medium ${loading
                          ? isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                          }`}
                      >
                        {loading ? 'Running...' : '▶ Run & Preview'}
                      </button>
                      <button
                        onClick={() => handleSubmit(false)}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 rounded font-medium ${loading
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                          }`}
                      >
                        {loading ? 'Submitting...' : 'Submit Arrangement'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : gameMode === "test_master" ? (
            /* Test Master Mode */
            <div className="flex-1 overflow-hidden p-4">
              <div className="h-full flex flex-col">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">
                    <span className="flex items-center gap-2"><Target size={16} /> Create comprehensive test cases</span>
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Create diverse test cases covering edge cases. Minimum score: 60/100.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {testCases.map((tc, idx) => (
                    <div key={idx} className={`border rounded p-3 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-300 bg-gray-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>Test Case {idx + 1}</div>
                        {testCases.length > 1 && (
                          <button
                            onClick={() => removeTestCase(idx)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>Input</label>
                          <textarea
                            value={tc.input}
                            onChange={(e) => updateTestCase(idx, "input", e.target.value)}
                            className={`w-full border rounded p-2 text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-600 text-slate-300' : 'bg-white border-gray-400 text-gray-900'}`}
                            rows="2"
                            placeholder='e.g., [1, 2, 3]'
                          />
                        </div>
                        <div>
                          <label className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>Expected Output</label>
                          <textarea
                            value={tc.expected}
                            onChange={(e) => updateTestCase(idx, "expected", e.target.value)}
                            className={`w-full border rounded p-2 text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-600 text-slate-300' : 'bg-white border-gray-400 text-gray-900'}`}
                            rows="2"
                            placeholder='e.g., 6'
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleRun}
                    disabled={loading}
                    className={`px-4 py-2 rounded ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-300 text-gray-900 hover:bg-gray-400'}`}
                  >
                    ▶ Review Test Cases
                  </button>
                  <button
                    onClick={addTestCase}
                    className={`px-4 py-2 rounded ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-300 text-gray-900 hover:bg-gray-400'}`}
                  >
                    + Add Test Case
                  </button>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded font-medium ${loading
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  >
                    {loading ? 'Submitting...' : 'Submit Test Cases'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Standard and Bug Hunt Mode - Code Editor with copy-paste disabled */
            <>
              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className={`p-2 flex items-center justify-between border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <select
                        value={language}
                        onChange={(e) => handleLanguageSwitch(e.target.value)}
                        className={`text-xs px-2 py-1 rounded border ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-gray-100 border-gray-400'}`}
                      >
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>
                      {gameMode === "bug_hunt" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-400 font-semibold">Bug Hunt Mode</span>
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            | Fix all bugs | Copy/Paste Disabled | Switch languages anytime
                          </span>
                          {isExecuting && queuePosition !== null && (
                            <span className="text-xs text-yellow-400 animate-pulse">
                              | Queue position: {queuePosition}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Copy/Paste Disabled</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleRun}
                        disabled={loading || isExecuting || !code.trim()}
                        className={`px-4 py-1 rounded text-xs font-medium ${loading || isExecuting || !code.trim()
                          ? isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                          }`}
                      >
                        {isExecuting ? 'Executing...' : loading ? 'Running...' : '▶ Run'}
                      </button>
                      <button
                        onClick={() => handleSubmit(false)}
                        disabled={loading || !code.trim()}
                        className={`px-4 py-1 rounded text-xs font-medium ${
                          modeInfo.color === 'emerald'
                            ? loading || !code.trim()
                              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              : 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : modeInfo.color === 'purple'
                              ? loading || !code.trim()
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                              : loading || !code.trim()
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {loading ? 'Submitting...' : 'Submit Solution'}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <MonacoEditorWrapper
                      value={code}
                      onChange={setCode}
                      language={language}
                      disableCopyPaste={true}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Output */}
          {output && (
            <div className={`h-48 border-t ${theme.border.light} ${theme.bg.primary} p-3 overflow-y-auto`}>
              <div className={`text-xs font-semibold ${theme.text.tertiary} mb-1`}>Output</div>
              <pre className={`text-xs ${theme.text.secondary} font-mono whitespace-pre-wrap`}>
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Validation Error Dialog */}
      {showValidationDialog && validationError && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full border-2 ${isDark ? 'border-red-500/30' : 'border-red-300'}`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={32} className="text-red-400" />
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Code Validation Failed
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Your code didn't pass all test cases
                  </p>
                </div>
              </div>

              {/* Error Details */}
              <div className={`rounded-lg p-4 mb-4 ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
                <div className="mb-3">
                  <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Test Results:
                  </div>
                  <div className={`text-lg ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                    Passed: <span className="text-green-400 font-bold">{validationError.passed_tests}</span> / {validationError.total_tests}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Partial Score: <span className="text-yellow-400 font-bold">{validationError.score}%</span>
                  </div>
                </div>

                {validationError.compilation_error && (
                  <div className="mb-3">
                    <div className={`text-sm font-semibold mb-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      Compilation Error:
                    </div>
                    <pre className={`text-xs font-mono p-3 rounded overflow-x-auto ${isDark ? 'bg-slate-950 text-red-300' : 'bg-red-50 text-red-700'}`}>
                      {validationError.compilation_error}
                    </pre>
                  </div>
                )}

                {validationError.failed_test && !validationError.compilation_error && (
                  <div>
                    <div className={`text-sm font-semibold mb-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      Failed Test Case:
                    </div>
                    <div className={`text-xs font-mono p-3 rounded ${isDark ? 'bg-slate-950' : 'bg-gray-200'}`}>
                      <div className="mb-2">
                        <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Input:</span>
                        <div className={`mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {validationError.failed_test.input || '(empty)'}
                        </div>
                      </div>
                      <div>
                        <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Expected:</span>
                        <div className={`mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {validationError.failed_test.expected || '(empty)'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowValidationDialog(false);
                    setValidationError(null);
                  }}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isDark 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setShowValidationDialog(false);
                    setValidationError(null);
                    handleSubmit(true); // Force submit with partial score
                  }}
                  className="flex-1 px-6 py-3 rounded-lg font-medium bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
                >
                  Submit Anyway ({validationError.score}% score)
                </button>
              </div>

              <p className={`text-xs text-center mt-3 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                Submitting with errors will record your partial score based on passed tests
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Match Completion Leaderboard Overlay */}
      {matchCompleted && finalResults && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/30">
            {(() => {
              console.log("[INFO] Rendering scoreboard overlay! Type:", finalResults.type);
              return null;
            })()}
            {finalResults.type === '1v1' ? (
              /* 1v1 Leaderboard */
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <Trophy size={64} className="text-yellow-400 mx-auto mb-4 animate-bounce" />
                  <h1 className="text-4xl font-bold text-white mb-2">Match Complete!</h1>
                  <p className="text-xl text-slate-300">
                    {finalResults.isWinner ? 'Victory Achieved!' : 'Better luck next time!'}
                  </p>
                </div>

                {/* Player Comparison */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Player 1 */}
                  <div className={`p-6 rounded-xl border-2 ${finalResults.player1.isWinner
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-slate-700 bg-slate-800/50'
                    }`}>
                    <div className="text-center">
                      {finalResults.player1.isWinner && (
                        <Trophy size={32} className="text-yellow-400 mx-auto mb-2" />
                      )}
                      <div className={`text-2xl font-bold mb-2 ${finalResults.player1.isWinner ? 'text-yellow-400' : isDark ? 'text-slate-300' : 'text-gray-900'
                        }`}>
                        {finalResults.player1.username}
                      </div>
                      {finalResults.player1.userId === finalResults.currentUserId && (
                        <div className="text-sm text-purple-400 mb-2">(You)</div>
                      )}
                      <div className={`text-sm font-medium mb-1 ${finalResults.player1.isWinner ? 'text-yellow-300' : isDark ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                        {finalResults.player1.isWinner ? 'Champion' : '2nd Place'}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-slate-300 mt-3">
                        <ClockIcon size={16} />
                        <span>{finalResults.player1.completionTime?.toFixed(1) || 'N/A'}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className={`p-6 rounded-xl border-2 ${finalResults.player2.isWinner
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-300 bg-gray-100'
                    }`}>
                    <div className="text-center">
                      {finalResults.player2.isWinner && (
                        <Trophy size={32} className="text-yellow-400 mx-auto mb-2" />
                      )}
                      <div className={`text-2xl font-bold mb-2 ${finalResults.player2.isWinner ? 'text-yellow-400' : isDark ? 'text-slate-300' : 'text-gray-900'
                        }`}>
                        {finalResults.player2.username}
                      </div>
                      {finalResults.player2.userId === finalResults.currentUserId && (
                        <div className="text-sm text-purple-400 mb-2">(You)</div>
                      )}
                      <div className={`text-sm font-medium mb-1 ${finalResults.player2.isWinner ? 'text-yellow-300' : isDark ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                        {finalResults.player2.isWinner ? 'Champion' : '2nd Place'}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-slate-300 mt-3">
                        <ClockIcon size={16} />
                        <span>{finalResults.player2.completionTime?.toFixed(1) || 'N/A'}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Change */}
                <div className={`rounded-lg p-4 mb-6 ${isDark ? 'bg-slate-800/50' : 'bg-gray-200'}`}>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>Rating Change</div>
                      <div className={`text-2xl font-bold ${finalResults.isWinner ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {finalResults.isWinner ? '+' : '-'}{finalResults.ratingChange || 0}
                      </div>
                    </div>
                    {finalResults.isWinner && finalResults.xpBonus && (
                      <div>
                        <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>XP Bonus</div>
                        <div className="text-2xl font-bold text-emerald-400">
                          +{finalResults.xpBonus}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate("/competitive")}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Home size={20} />
                    Return to Lobby
                  </button>
                </div>
              </div>
            ) : (
              /* Multiplayer Leaderboard */
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <Award size={64} className="text-yellow-400 mx-auto mb-4 animate-bounce" />
                  <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Match Complete!</h1>
                  <p className={`text-xl ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Your Rank: #{finalResults.rank}
                  </p>
                </div>

                {/* Leaderboard */}
                <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-slate-800/50' : 'bg-gray-200'}`}>
                  <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Final Rankings</h2>
                  <div className="space-y-3">
                    {(finalResults.players || []).map((player, idx) => {
                      const rank = idx + 1;
                      const isCurrentUser = player?.user_id === finalResults.currentUserId;
                      const getMedalIcon = () => {
                        if (rank === 1) return <Trophy size={24} className="text-yellow-400" />;
                        if (rank === 2) return <Medal size={24} className="text-gray-400" />;
                        if (rank === 3) return <Medal size={24} className="text-orange-600" />;
                        return <div className={`w-6 h-6 flex items-center justify-center font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{rank}</div>;
                      };

                      return (
                        <div
                          key={player?.user_id || idx}
                          className={`flex items-center gap-4 p-4 rounded-lg border-2 ${isCurrentUser
                            ? 'border-purple-500 bg-purple-500/20'
                            : isDark ? 'border-slate-700 bg-slate-900/50' : 'border-gray-300 bg-gray-100'
                            }`}
                        >
                          <div className="flex-shrink-0">
                            {getMedalIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${isCurrentUser ? 'text-purple-300' : isDark ? 'text-white' : 'text-gray-900'}`}>
                                {player?.username || `Player ${idx + 1}`}
                              </span>
                              {isCurrentUser && (
                                <span className="text-xs text-purple-400">(You)</span>
                              )}
                            </div>
                            <div className={`flex items-center gap-3 mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                              <span>Score: {player.score || finalResults.score || 0}</span>
                              {player.completion_time && (
                                <span className="flex items-center gap-1">
                                  <ClockIcon size={12} />
                                  {player.completion_time.toFixed(1)}s
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}  
                  </div>
                </div>

                {/* Your Stats */}
                <div className={`rounded-lg p-4 mb-6 ${isDark ? 'bg-slate-800/50' : 'bg-gray-200'}`}>
                  <div className="text-center">
                    <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>Your Final Score</div>
                    <div className="text-3xl font-bold text-emerald-400">
                      {finalResults.score}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate("/competitive")}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Home size={20} />
                    Return to Lobby
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
