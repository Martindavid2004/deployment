import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Lightbulb, Bug, Keyboard, Play } from "lucide-react";
import MonacoEditorWrapper from "../components/MonacoEditorWrapper";
import ProgressBar from "../components/ProgressBar";
import LeaderboardTable from "../components/LeaderboardTable";
import { API_BASE } from "../utils/api";

export default function Workspace({
  user,
  problems,
  attempts,
  setAttempts,
  currentLanguage,
  setCurrentLanguage,
}) {
  const { id } = useParams();
  const problemId = Number(id);

  const problem = useMemo(
    () => problems.find((p) => p.id === problemId),
    [problems, problemId]
  );

  const [currentRound, setCurrentRound] = useState(1);
  const [roundState, setRoundState] = useState({
    1: { code: "", completed: false, time: 0 },
    2: { code: "", completed: false, time: 0 },
    3: { code: "", completed: false, time: 0 },
    4: { code: "", completed: false, time: 0 },
  });
  const [roundStartTimes, setRoundStartTimes] = useState({});
  const [globalStartTime, setGlobalStartTime] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [showReference, setShowReference] = useState(true);
  const [testResults, setTestResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState(null);

  const key = `${problemId}_${currentLanguage}`;
  const existingAttempt = attempts[key];

  useEffect(() => {
    if (existingAttempt) {
      setRoundState(existingAttempt.roundState || roundState);
      setCurrentRound(existingAttempt.lastRound || 1);
      setGlobalStartTime(existingAttempt.globalStartTime || null);
    } else {
      // Initialize round states with appropriate starting code
      const buggyCodeForR2 = problem?.buggyCode?.[currentLanguage] || "";
      setRoundState({
        1: { code: "", completed: false, time: 0 },
        2: { code: buggyCodeForR2, completed: false, time: 0 }, // Start with buggy code
        3: { code: "", completed: false, time: 0 },
        4: { code: "", completed: false, time: 0 },
      });
      setCurrentRound(1);
      setGlobalStartTime(null);
    }
    setRoundStartTimes({});
    setTestResults(null);
    setExecutionOutput(null);
  }, [problemId, currentLanguage]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!problem) {
    return (
      <div>
        <h1 className="text-lg font-semibold mb-2">Problem not found</h1>
        <p className="text-xs text-slate-400">Please go back and select again.</p>
      </div>
    );
  }

  const handleCodeChange = (value) => {
    setRoundState((prev) => ({
      ...prev,
      [currentRound]: { ...prev[currentRound], code: value },
    }));
    if (!roundStartTimes[currentRound]) {
      const ts = Date.now();
      setRoundStartTimes((prev) => ({ ...prev, [currentRound]: ts }));
      if (!globalStartTime) setGlobalStartTime(ts);
    }
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setExecutionOutput(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setExecutionOutput({
          success: false,
          output: "",
          error: "Authentication required. Please login to execute code."
        });
        setIsExecuting(false);
        return;
      }

      const response = await fetch(`${API_BASE}/execute/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code: currentRoundData.code,
          language: currentLanguage,
          test_input: problem.sampleTests[0]?.input || "",
          timeout: 10
        })
      });

      if (response.status === 401) {
        setExecutionOutput({
          success: false,
          output: "",
          error: "Session expired. Please login again to execute code."
        });
        setIsExecuting(false);
        return;
      }

      const result = await response.json();
      setExecutionOutput(result);
    } catch (error) {
      setExecutionOutput({
        success: false,
        output: "",
        error: `Failed to execute: ${error.message}`
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunTests = async () => {
    setIsExecuting(true);
    setTestResults(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication required. Please login to run tests.");
        setIsExecuting(false);
        return;
      }

      const response = await fetch(`${API_BASE}/execute/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code: currentRoundData.code,
          language: currentLanguage,
          test_cases: problem.sampleTests
        })
      });

      if (response.status === 401) {
        alert("Session expired. Please login again to run tests.");
        setIsExecuting(false);
        return;
      }

      const result = await response.json();
      setTestResults(result);

      if (result.all_passed) {
        alert(`All ${result.total} test cases passed!`);
      } else {
        alert(`${result.passed}/${result.total} test cases passed. Check the results below.`);
      }
    } catch (error) {
      alert(`Failed to run tests: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitRound = async () => {
    const tsNow = Date.now();
    const roundStart = roundStartTimes[currentRound] || tsNow;
    const elapsedSeconds = (tsNow - roundStart) / 1000;

    setRoundState((prev) => ({
      ...prev,
      [currentRound]: {
        ...prev[currentRound],
        completed: true,
        time: elapsedSeconds,
      },
    }));

    const prevAttempt = attempts[key] || {
      roundCompleted: {},
      roundState: {},
      finalCompleted: false,
      totalTimeSeconds: 0,
      globalStartTime: globalStartTime || roundStart,
    };

    const newRoundCompleted = {
      ...prevAttempt.roundCompleted,
      [currentRound]: true,
    };

    const newRoundState = {
      ...prevAttempt.roundState,
      [currentRound]: {
        ...roundState[currentRound],
        completed: true,
        time: elapsedSeconds,
      },
    };

    const total = Object.values(newRoundState).reduce(
      (sum, r) => sum + (r.time || 0),
      0
    );

    const allRoundsDone =
      newRoundCompleted[1] &&
      newRoundCompleted[2] &&
      newRoundCompleted[3] &&
      newRoundCompleted[4];
    const finalCompleted =
      currentRound === 4 ? Boolean(allRoundsDone) : prevAttempt.finalCompleted;

    if (finalCompleted && !prevAttempt.finalCompleted) {
      alert(
        `Finished "${problem.title}" in ${total.toFixed(
          1
        )}s (${currentLanguage.toUpperCase()}).`
      );
    }

    const updatedAttempt = {
      ...prevAttempt,
      roundCompleted: newRoundCompleted,
      roundState: newRoundState,
      totalTimeSeconds: total,
      finalCompleted,
      lastRound: currentRound,
      globalStartTime:
        prevAttempt.globalStartTime || globalStartTime || roundStart,
    };

    setAttempts((prev) => ({
      ...prev,
      [key]: updatedAttempt,
    }));

    // Save to database
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found, cannot save to database");
        if (currentRound < 4) setCurrentRound((r) => r + 1);
        return;
      }

      if (!user) {
        console.warn("No user found, cannot save to database");
        if (currentRound < 4) setCurrentRound((r) => r + 1);
        return;
      }

      // Fetch current user to get proper user ID
      console.log("Fetching user info for database save...");
      const userResponse = await fetch(`${API_BASE}/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!userResponse.ok) {
        console.error("Failed to fetch user info, status:", userResponse.status);
        alert("Warning: Could not authenticate. Progress not saved to database.");
        if (currentRound < 4) setCurrentRound((r) => r + 1);
        return;
      }

      const currentUser = await userResponse.json();
      console.log("Current user ID:", currentUser.id);

      const attemptData = {
        user_id: currentUser.id,
        problem_id: String(problemId),
        language: currentLanguage,
        roundState: updatedAttempt.roundState,
        roundCompleted: updatedAttempt.roundCompleted,
        totalTimeSeconds: updatedAttempt.totalTimeSeconds,
        finalCompleted: updatedAttempt.finalCompleted,
        lastRound: updatedAttempt.lastRound,
        globalStartTime: updatedAttempt.globalStartTime
      };

      console.log("Saving attempt to database:", attemptData);

      const response = await fetch(`${API_BASE}/attempts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(attemptData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to save attempt. Status:", response.status, "Error:", errorData);
        alert(`Warning: Progress was not saved to database. ${errorData.detail || 'Unknown error'}`);
      } else {
        const savedData = await response.json();
        console.log("[SUCCESS] Attempt saved successfully to database:", savedData);
      }
    } catch (err) {
      console.error("Failed to save attempt to database:", err);
      alert("Warning: Progress was not saved to database. Error: " + err.message);
    }

    if (currentRound < 4) setCurrentRound((r) => r + 1);
  };

  const attempt = attempts[key];
  const roundsCompletedCount = attempt
    ? Object.values(attempt.roundCompleted || {}).filter(Boolean).length
    : 0;
  const overallProgress = (roundsCompletedCount / 4) * 100;

  const currentRoundData = roundState[currentRound];
  const currentRoundStart = roundStartTimes[currentRound];
  let liveRoundTime = currentRoundData.time || 0;
  if (!currentRoundData.completed && currentRoundStart) {
    liveRoundTime = (now - currentRoundStart) / 1000;
  }

  let overallTime = 0;
  for (let r = 1; r <= 4; r++) {
    if (r === currentRound && !roundState[r].completed && roundStartTimes[r]) {
      overallTime += (now - roundStartTimes[r]) / 1000;
    } else {
      overallTime += roundState[r].time || 0;
    }
  }

  const referenceCode = problem.referenceCode[currentLanguage];
  const explanations = problem.explanations[currentLanguage];

  const leaderboardEntries = [];
  Object.entries(attempts).forEach(([k, a]) => {
    if (!k.startsWith(problemId + "_")) return;
    if (!a.finalCompleted) return;
    const lang = k.split("_")[1];
    leaderboardEntries.push({
      name: user?.name || "Student",
      time: a.totalTimeSeconds || 0,
      language: lang,
    });
  });
  leaderboardEntries.sort((a, b) => a.time - b.time);

  const roundTitleMap = {
    1: "Round 1 – Reference & Exercise",
    2: "Round 2 – Debug the Code",
    3: "Round 3 – Blind Typing",
    4: "Round 4 – Test Cases & Final Submission",
  };

  const roundDescriptions = {
    1: "Study the reference code and explanations, then type it yourself to learn the pattern.",
    2: "The code below has bugs. Find and fix them to make it work correctly.",
    3: "Type the complete solution from memory without viewing the reference.",
    4: "Submit your final solution and run all test cases to verify correctness.",
  };

  const elapsedSeconds = liveRoundTime || 0;
  const totalSeconds = overallTime || 0;

  const roundProgress =
    referenceCode && (currentRound === 1 || currentRound === 3)
      ? Math.min(100, (currentRoundData.code.length / referenceCode.length) * 100)
      : currentRound === 2
        ? currentRoundData.completed
          ? 100
          : 30
        : currentRound === 4
          ? currentRoundData.completed
            ? 100
            : 50
          : 0;

  return (
    <div className="space-y-4 text-xs">
      <div className="border border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold mb-1">{problem.title}</h1>
          <p className="text-[11px] text-slate-400">
            Problem #{problem.id} • Difficulty{" "}
            <span>{problem.difficulty}</span> • Language{" "}
            <span className="font-semibold">
              {currentLanguage.toUpperCase()}
            </span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Topics: {problem.topics.join(", ")} •{" "}
            <a
              href={problem.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 underline"
            >
              Watch learning video ↗
            </a>
          </p>
        </div>
        <div className="w-full md:w-64 space-y-2">
          <ProgressBar value={overallProgress} label="Overall progress" />
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4].map((r) => {
              const done = attempt?.roundCompleted?.[r];
              return (
                <button
                  key={r}
                  onClick={() => setCurrentRound(r)}
                  className={`px-2.5 py-1 rounded-full border text-[11px] ${currentRound === r
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
                      : "border-slate-600 bg-slate-900 text-slate-300"
                    } ${done ? "border-dashed" : ""}`}
                >
                  R{r}
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-slate-400">
            Overall time: <span className="text-slate-100">{totalSeconds.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      <div className="border border-slate-700 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-center flex-1">
            <div className="text-base md:text-lg font-bold mb-1">
              {roundTitleMap[currentRound]}
            </div>
          </div>
          <div className="w-full md:w-64 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 px-2 py-1 rounded-lg border border-emerald-500/60 bg-slate-950 text-[11px] text-center">
                <div className="text-slate-400">Round time</div>
                <div className="text-sm font-semibold">
                  {elapsedSeconds.toFixed(1)}s
                </div>
              </div>
              <div className="flex-1 px-2 py-1 rounded-lg border border-emerald-500/60 bg-slate-950 text-[11px] text-center">
                <div className="text-slate-400">Overall</div>
                <div className="text-sm font-semibold">
                  {totalSeconds.toFixed(1)}s
                </div>
              </div>
            </div>
            <ProgressBar value={roundProgress} label="Round progress" big />
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>Language</span>
              <select
                className="bg-slate-900 border border-slate-700 rounded-full px-2 py-1 text-[11px]"
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-semibold">Your Code</span>
              <div className="flex gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isExecuting || !currentRoundData.code.trim()}
                  className="px-3 py-1 rounded-full bg-green-600 text-white text-[10px] font-semibold hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-1">
                    {isExecuting ? "Running..." : <><Play size={12} /> Run Code</>}
                  </span>
                </button>
                {currentRound === 2 && (
                  <button
                    onClick={handleRunCode}
                    disabled={isExecuting}
                    className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold hover:bg-blue-500 disabled:opacity-50"
                  >
                    {isExecuting ? "Running..." : "Test Run"}
                  </button>
                )}
              </div>
            </div>
            <MonacoEditorWrapper
              language={currentLanguage}
              value={currentRoundData.code}
              onChange={handleCodeChange}
              height="260px"
            />

            {/* Output box for all rounds */}
            <div className="border border-slate-700 rounded-lg bg-slate-950 p-3 min-h-[120px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-semibold text-slate-300">Output</span>
                {executionOutput && (
                  <button
                    onClick={() => setExecutionOutput(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {isExecuting ? (
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500"></div>
                  Executing code...
                </div>
              ) : executionOutput ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    {executionOutput.success ? (
                      <span className="text-green-400 text-[11px] font-semibold flex items-center gap-1"><CheckCircle2 size={14} /> Success</span>
                    ) : (
                      <span className="text-red-400 text-[11px] font-semibold flex items-center gap-1"><XCircle size={14} /> Error</span>
                    )}
                    {executionOutput.execution_time && (
                      <span className="text-slate-500 text-[10px]">
                        ({executionOutput.execution_time.toFixed(2)}s)
                      </span>
                    )}
                  </div>

                  {executionOutput.output && (
                    <div>
                      <div className="text-[10px] text-slate-400 mb-1">Output:</div>
                      <pre className="text-[11px] text-slate-200 whitespace-pre-wrap font-mono bg-slate-900 p-2 rounded">
                        {executionOutput.output}
                      </pre>
                    </div>
                  )}

                  {executionOutput.error && (
                    <div>
                      <div className="text-[10px] text-red-400 mb-1">Error:</div>
                      <pre className="text-[11px] text-red-300 whitespace-pre-wrap font-mono bg-red-950/20 p-2 rounded border border-red-900">
                        {executionOutput.error}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  Click "Run Code" to execute your code and see the output here
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {/* R1: Show reference code and explanations */}
            {currentRound === 1 && (
              <>
                <div className="flex justify-between items-center">
                  <div className="text-[11px] font-semibold mb-1">Reference Code</div>
                  <button
                    onClick={() => setShowReference(!showReference)}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    {showReference ? "Hide" : "Show"} Reference
                  </button>
                </div>
                {showReference && (
                  <div className="p-2 rounded-lg border border-slate-700 bg-slate-950 text-[10px]">
                    <pre className="text-slate-300 whitespace-pre overflow-x-auto">
                      {referenceCode}
                    </pre>
                  </div>
                )}
                <div className="text-[11px] font-semibold mt-3 mb-1">
                  Line-by-line explanation
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                  {explanations.map((exp, idx) => (
                    <li key={idx}>{exp}</li>
                  ))}
                </ul>
              </>
            )}

            {/* R2: Show debugging hints and sample test */}
            {currentRound === 2 && (
              <>
                <div className="text-[11px] font-semibold mb-1">Debugging Challenge</div>
                <div className="p-3 rounded-lg border border-orange-500/50 bg-orange-950/20 text-[11px] text-slate-300 space-y-2">
                  <p className="font-semibold text-orange-300 flex items-center gap-2"><Bug size={16} /> Find and fix the bugs!</p>
                  <p>The code above has intentional errors. Debug it to make it work correctly.</p>
                  <div className="mt-2 p-2 rounded bg-slate-900">
                    <div className="font-semibold text-[10px] mb-1">Sample Test:</div>
                    <div className="text-[10px]">
                      <span className="text-slate-400">Input:</span> {problem.sampleTests[0]?.input}
                    </div>
                    <div className="text-[10px]">
                      <span className="text-slate-400">Expected:</span> {problem.sampleTests[0]?.expected}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><Lightbulb size={12} /> Tip: Use "Test Run" to check your fixes</span>
                  </p>
                </div>
                <div className="text-[11px] font-semibold mt-3 mb-1">Hints</div>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                  {explanations.map((exp, idx) => (
                    <li key={idx}>{exp}</li>
                  ))}
                </ul>
              </>
            )}

            {/* R3: Blind typing - no reference */}
            {currentRound === 3 && (
              <>
                <div className="text-[11px] font-semibold mb-1">Blind Typing Challenge</div>
                <div className="p-3 rounded-lg border border-purple-500/50 bg-purple-950/20 text-[11px] text-slate-300 space-y-2">
                  <p className="font-semibold text-purple-300 flex items-center gap-2"><Keyboard size={16} /> Type from memory!</p>
                  <p>Write the complete solution without looking at the reference code.</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    This tests your understanding and muscle memory.
                  </p>
                </div>
                <div className="text-[11px] font-semibold mt-3 mb-1">Problem Requirements</div>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                  {explanations.map((exp, idx) => (
                    <li key={idx}>{exp}</li>
                  ))}
                </ul>
              </>
            )}

            {/* R4: Test cases and final submission */}
            {currentRound === 4 && (
              <>
                <div className="text-[11px] font-semibold mb-1">Test Cases</div>
                <div className="space-y-2">
                  {problem.sampleTests.map((test, idx) => (
                    <div key={idx} className="p-2 rounded-lg border border-slate-700 bg-slate-950 text-[10px]">
                      <div className="font-semibold mb-1">Test Case {idx + 1}</div>
                      <div><span className="text-slate-400">Input:</span> {test.input}</div>
                      <div><span className="text-slate-400">Expected:</span> {test.expected}</div>
                    </div>
                  ))}
                </div>

                {testResults && (
                  <div className="mt-3 p-3 rounded-lg border border-slate-700 bg-slate-950">
                    <div className="text-[11px] font-semibold mb-2">
                      Test Results: {testResults.passed}/{testResults.total} Passed
                    </div>
                    {testResults.results.map((result, idx) => (
                      <div key={idx} className="text-[10px] mb-2 p-2 rounded bg-slate-900">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">Test {result.test_id}</span>
                          <span className={result.passed ? "text-green-400" : "text-red-400"}>
                            <span className="flex items-center gap-1">
                              {result.passed ? <><CheckCircle2 size={12} /> Passed</> : <><XCircle size={12} /> Failed</>}
                            </span>
                          </span>
                        </div>
                        {!result.passed && (
                          <>
                            <div className="text-slate-400">Expected: {result.expected}</div>
                            <div className="text-slate-400">Got: {result.actual}</div>
                            {result.error && <div className="text-red-400 mt-1">{result.error}</div>}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center text-[11px] text-slate-400">
          <span>{roundDescriptions[currentRound]}</span>
          <div className="flex gap-2">
            {currentRound === 4 && (
              <button
                onClick={handleRunTests}
                disabled={isExecuting}
                className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {isExecuting ? "Running..." : "Run All Tests"}
              </button>
            )}
            <button
              onClick={handleSubmitRound}
              disabled={currentRound === 4 && !testResults?.all_passed}
              className="px-4 py-1.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentRound === 4 ? "Submit Final Answer" : "Complete Round"}
            </button>
          </div>
        </div>
      </div>

      <div className="border border-slate-700 rounded-2xl p-4">
        <h2 className="text-sm font-semibold mb-1">
          Leaderboard — {problem.title}
        </h2>
        <p className="text-[11px] text-slate-400 mb-2">
          Local-only scoreboard. A backend can later store this across all
          students.
        </p>
        <LeaderboardTable entries={leaderboardEntries} />
      </div>
    </div>
  );
}
