import React, { useState, useEffect } from "react";
import {
  Play,
  Sparkles,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  ChevronRight,
  Code2,
  Cpu,
  Eye,
  Pause,
  FastForward,
  Info
} from "lucide-react";

import TreeVisualizer from "./TreeVisualizer";
import GraphVisualizer from "./GraphVisualizer";
import DpVisualizer from "./DpVisualizer";
import SystemDesignVisualizer from "./SystemDesignVisualizer";

export default function VisualSandbox({ config, onCompleteStage }) {
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(config?.initial_data?.length ? config.initial_data.length - 1 : 0);

  // For sliding window
  const [windowStart, setWindowStart] = useState(0);
  const windowK = config?.target || 4;

  // For stack simulation
  const [stackItems, setStackItems] = useState([]);
  const [streamIdx, setStreamIdx] = useState(0);

  // Active language for code trace
  const [codeLang, setCodeLang] = useState("python");

  // Live execution trace state
  const [activeLine, setActiveLine] = useState(3);
  const [codeExplanation, setCodeExplanation] = useState("");
  const [hasSolved, setHasSolved] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  useEffect(() => {
    if (config) {
      if (config.type === "two_pointers") {
        setLeftIdx(0);
        setRightIdx(config.initial_data.length - 1);
        setActiveLine(3);
        setCodeExplanation("Line 3: Initialized `left = 0`, `right = 5`. Evaluating while loop condition: `left < right`.");
      } else if (config.type === "sliding_window") {
        setWindowStart(0);
        setActiveLine(2);
        setCodeExplanation("Line 2: Initialized window covering first 4 elements [1, 12, -5, -6].");
      } else if (config.type === "stack") {
        setStackItems([]);
        setStreamIdx(0);
        setActiveLine(2);
        setCodeExplanation("Line 2: Initialized empty stack. Ready to process stream character-by-character.");
      }
      setHasSolved(false);
      setIsAutoPlaying(false);
      setFeedback("Interact with the visual elements or click 'Auto-Solve Step' to watch the code execute live!");
    }
  }, [config]);

  if (!config) return null;

  if (
    config.type === "tree_traversal" ||
    config.type === "trees" ||
    config.type === "tree" ||
    config.type === "trie_tree"
  ) {
    return <TreeVisualizer config={config} onComplete={onCompleteStage} />;
  }

  if (
    config.type === "graph_dijkstra" ||
    config.type === "graph_bfs" ||
    config.type === "graphs"
  ) {
    return <GraphVisualizer config={config} onComplete={onCompleteStage} />;
  }

  if (
    config.type === "dp_table_1d" ||
    config.type === "dp_matrix_2d" ||
    config.type === "dynamic_programming"
  ) {
    return <DpVisualizer config={config} onComplete={onCompleteStage} />;
  }

  if (
    config.type?.startsWith("system_design") ||
    config.type === "system_design"
  ) {
    return <SystemDesignVisualizer config={config} onComplete={onCompleteStage} />;
  }

  const data = config.initial_data || [];
  const target = config.target;

  // --- Two Pointers Logic ---
  const currSum = data[leftIdx] !== undefined && data[rightIdx] !== undefined ? data[leftIdx] + data[rightIdx] : 0;

  const handlePointerMove = (pointer, direction) => {
    if (config.type !== "two_pointers") return;

    if (pointer === "left") {
      const nextL = leftIdx + direction;
      if (nextL >= 0 && nextL < rightIdx) {
        setLeftIdx(nextL);
        updateTwoPointersTrace(nextL, rightIdx, "left");
      }
    } else if (pointer === "right") {
      const nextR = rightIdx + direction;
      if (nextR > leftIdx && nextR < data.length) {
        setRightIdx(nextR);
        updateTwoPointersTrace(leftIdx, nextR, "right");
      }
    }
  };

  const updateTwoPointersTrace = (l, r, moved) => {
    const sum = data[l] + data[r];
    if (sum === target) {
      setHasSolved(true);
      setActiveLine(6);
      setCodeExplanation(`🎯 Line 6: curr_sum (${sum}) == target (${target}). MATCH FOUND! Returning 1-based indices [${l + 1}, ${r + 1}].`);
      setFeedback("🎯 BINGO! Target sum 18 matched in O(N) operations without nested loops!");
      setIsAutoPlaying(false);
    } else if (sum > target) {
      setActiveLine(10);
      setCodeExplanation(`Line 10: curr_sum (${sum}) > target (${target}). Since array is sorted, we execute 'right -= 1' to reduce sum. Right pointer moves from idx ${r + 1} to ${r}.`);
      setFeedback(`Sum is ${sum} (TOO BIG). Moving Right pointer left to decrease the total sum.`);
    } else {
      setActiveLine(8);
      setCodeExplanation(`Line 8: curr_sum (${sum}) < target (${target}). Since array is sorted, we execute 'left += 1' to increase sum. Left pointer advances from idx ${l - 1} to ${l}.`);
      setFeedback(`Sum is ${sum} (TOO SMALL). Advancing Left pointer right to increase the total sum.`);
    }
  };

  // Next Optimal Step Trigger
  const handleAutoStep = () => {
    if (config.type === "two_pointers") {
      if (currSum === target) return;
      if (currSum > target && rightIdx > leftIdx + 1) {
        handlePointerMove("right", -1);
      } else if (currSum < target && leftIdx < rightIdx - 1) {
        handlePointerMove("left", 1);
      }
    } else if (config.type === "sliding_window") {
      handleSlideWindow(1);
    } else if (config.type === "stack") {
      if (streamIdx < data.length) {
        handleStackStep(data[streamIdx]);
      }
    }
  };

  // Auto-play timer
  useEffect(() => {
    let timer;
    if (isAutoPlaying && !hasSolved) {
      timer = setInterval(() => {
        handleAutoStep();
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, hasSolved, leftIdx, rightIdx, windowStart, streamIdx]);

  // --- Sliding Window Logic ---
  const currentWindowSlice = data.slice(windowStart, windowStart + windowK);
  const currentWindowSum = currentWindowSlice.reduce((a, b) => a + b, 0);

  const handleSlideWindow = (dir) => {
    const nextStart = windowStart + dir;
    if (nextStart >= 0 && nextStart + windowK <= data.length) {
      setWindowStart(nextStart);
      const newSlice = data.slice(nextStart, nextStart + windowK);
      const newSum = newSlice.reduce((a, b) => a + b, 0);
      setActiveLine(4);
      setCodeExplanation(
        `Line 4: window_sum += nums[${nextStart + windowK - 1}] (${data[nextStart + windowK - 1]}) - nums[${nextStart - 1}] (${data[nextStart - 1]}). New sum: ${newSum}. Max updated!`
      );
      setFeedback("Window shifted! Adding new element and dropping old element in O(1) time.");
      if (nextStart + windowK === data.length) {
        setHasSolved(true);
        setIsAutoPlaying(false);
      }
    }
  };

  // --- Stack Logic ---
  const handleStackStep = (bracket) => {
    const mapping = { ')': '(', '}': '{', ']': '[' };
    if (['(', '{', '['].includes(bracket)) {
      setStackItems((prev) => [...prev, bracket]);
      setStreamIdx((prev) => prev + 1);
      setActiveLine(7);
      setCodeExplanation(`Line 7: char '${bracket}' is an opening bracket. Executed 'stack.append("${bracket}")'.`);
      setFeedback(`Pushed opening bracket '${bracket}' onto the stack.`);
    } else {
      if (stackItems.length > 0 && stackItems[stackItems.length - 1] === mapping[bracket]) {
        const popped = stackItems[stackItems.length - 1];
        setStackItems((prev) => prev.slice(0, -1));
        setStreamIdx((prev) => prev + 1);
        setActiveLine(5);
        setCodeExplanation(`Line 5: closing bracket '${bracket}' matched top '${popped}'. Executed 'stack.pop()'.`);
        setFeedback(`Closing bracket '${bracket}' matched top of stack! Popped successfully.`);
        if (streamIdx + 1 >= data.length) {
          setHasSolved(true);
          setIsAutoPlaying(false);
          setActiveLine(9);
          setCodeExplanation("Line 9: All characters processed. Stack is empty -> Return True (Valid Brackets)!");
        }
      } else {
        setActiveLine(6);
        setCodeExplanation(`Line 6: Mismatch! Top was '${stackItems[stackItems.length - 1] || "empty"}', expected '${mapping[bracket]}'. Returning False.`);
        setFeedback(`Mismatch! '${bracket}' cannot close '${stackItems[stackItems.length - 1] || "empty stack"}'.`);
      }
    }
  };

  // Code snippets with line numbers for each language
  const CODE_SNIPPETS = {
    two_sum_sorted: {
      python: [
        { line: 1, text: "def twoSum(numbers: list[int], target: int) -> list[int]:" },
        { line: 2, text: "    left, right = 0, len(numbers) - 1" },
        { line: 3, text: "    while left < right:" },
        { line: 4, text: "        curr_sum = numbers[left] + numbers[right]" },
        { line: 5, text: "        if curr_sum == target:" },
        { line: 6, text: "            return [left + 1, right + 1]" },
        { line: 7, text: "        elif curr_sum < target:" },
        { line: 8, text: "            left += 1  # Sum too small -> Advance left" },
        { line: 9, text: "        else:" },
        { line: 10, text: "            right -= 1  # Sum too large -> Retract right" },
        { line: 11, text: "    return []" }
      ],
      cpp: [
        { line: 1, text: "vector<int> twoSum(vector<int>& numbers, int target) {" },
        { line: 2, text: "    int left = 0, right = numbers.size() - 1;" },
        { line: 3, text: "    while (left < right) {" },
        { line: 4, text: "        int curr_sum = numbers[left] + numbers[right];" },
        { line: 5, text: "        if (curr_sum == target) return {left + 1, right + 1};" },
        { line: 6, text: "        else if (curr_sum < target) left++;" },
        { line: 7, text: "        else right--;" },
        { line: 8, text: "    }" },
        { line: 9, text: "    return {};" },
        { line: 10, text: "}" }
      ],
      java: [
        { line: 1, text: "public int[] twoSum(int[] numbers, int target) {" },
        { line: 2, text: "    int left = 0, right = numbers.length - 1;" },
        { line: 3, text: "    while (left < right) {" },
        { line: 4, text: "        int sum = numbers[left] + numbers[right];" },
        { line: 5, text: "        if (sum == target) return new int[]{left + 1, right + 1};" },
        { line: 6, text: "        else if (sum < target) left++;" },
        { line: 7, text: "        else right--;" },
        { line: 8, text: "    }" },
        { line: 9, text: "    return new int[]{};" },
        { line: 10, text: "}" }
      ]
    },
    sliding_window_max: {
      python: [
        { line: 1, text: "def findMaxAverage(nums: list[int], k: int) -> float:" },
        { line: 2, text: "    window_sum = sum(nums[:k])" },
        { line: 3, text: "    for i in range(k, len(nums)):" },
        { line: 4, text: "        window_sum += nums[i] - nums[i - k]" },
        { line: 5, text: "        max_sum = max(max_sum, window_sum)" },
        { line: 6, text: "    return max_sum / k" }
      ]
    },
    valid_parentheses: {
      python: [
        { line: 1, text: "def isValid(s: str) -> bool:" },
        { line: 2, text: "    stack = []" },
        { line: 3, text: "    for char in s:" },
        { line: 4, text: "        if char in mapping:" },
        { line: 5, text: "            top = stack.pop() if stack else '#'" },
        { line: 6, text: "            if mapping[char] != top: return False" },
        { line: 7, text: "        else: stack.append(char)" },
        { line: 8, text: "    return not stack" }
      ]
    }
  };

  const activeCodeLines = CODE_SNIPPETS[config.type === "sliding_window" ? "sliding_window_max" : config.type === "stack" ? "valid_parentheses" : "two_sum_sorted"]?.[codeLang] || CODE_SNIPPETS.two_sum_sorted.python;

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Stage 1: Intuition & Live Code Mirror
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">{config.title}</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">{config.description}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              isAutoPlaying
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isAutoPlaying ? "Pause Simulation" : "Auto-Play Simulation"}
          </button>

          <button
            onClick={handleAutoStep}
            disabled={hasSolved}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold disabled:opacity-30"
          >
            <FastForward className="w-3.5 h-3.5" /> Step ➔
          </button>

          {hasSolved && (
            <button
              onClick={onCompleteStage}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95 animate-pulse text-xs"
            >
              Next: Break with Chaos <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* DUAL PANE: Visual Canvas (Top/Left) + Live Code Trace (Bottom/Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* LEFT/TOP: Interactive Visual Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            {/* TWO POINTERS CANVAS */}
            {config.type === "two_pointers" && (
              <div className="space-y-6">
                {/* Target & Sum HUD */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-400">
                      Target Sum: <span className="text-base font-bold text-emerald-400">{target}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Current Sum:{" "}
                      <span className={`text-base font-bold ${currSum === target ? "text-emerald-400" : "text-amber-400"}`}>
                        {currSum} ({data[leftIdx]} + {data[rightIdx]})
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    L: idx {leftIdx} | R: idx {rightIdx}
                  </div>
                </div>

                {/* Visual Array Blocks */}
                <div className="flex flex-wrap items-center justify-center gap-3 py-6">
                  {data.map((val, idx) => {
                    const isLeft = idx === leftIdx;
                    const isRight = idx === rightIdx;

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        {/* Pointer Badge */}
                        <div className="h-6 flex items-center justify-center mb-1">
                          {isLeft && (
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/40 animate-bounce">
                              L ({val})
                            </span>
                          )}
                          {isRight && (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40 animate-bounce">
                              R ({val})
                            </span>
                          )}
                        </div>

                        {/* Array Cell */}
                        <div
                          className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center text-base md:text-lg font-mono font-bold transition-all duration-300 border-2 ${
                            isLeft
                              ? "border-blue-500 bg-blue-950/70 text-blue-200 shadow-xl shadow-blue-500/30 scale-110"
                              : isRight
                              ? "border-rose-500 bg-rose-950/70 text-rose-200 shadow-xl shadow-rose-500/30 scale-110"
                              : "border-slate-800 bg-slate-900/50 text-slate-400"
                          }`}
                        >
                          <span>{val}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">[{idx}]</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pointer Interactive Control Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/70 p-3.5 rounded-xl border border-blue-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-blue-400">Left Pointer (Index {leftIdx})</div>
                      <div className="text-[10px] text-slate-400">Advance to INCREASE sum</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handlePointerMove("left", -1)}
                        disabled={leftIdx === 0}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs font-bold text-slate-200"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => handlePointerMove("left", 1)}
                        disabled={leftIdx >= rightIdx - 1}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded text-xs font-bold text-white shadow"
                      >
                        Advance ▶
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900/70 p-3.5 rounded-xl border border-rose-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-rose-400">Right Pointer (Index {rightIdx})</div>
                      <div className="text-[10px] text-slate-400">Retract to DECREASE sum</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handlePointerMove("right", -1)}
                        disabled={rightIdx <= leftIdx + 1}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 rounded text-xs font-bold text-white shadow"
                      >
                        ◀ Retract
                      </button>
                      <button
                        onClick={() => handlePointerMove("right", 1)}
                        disabled={rightIdx >= data.length - 1}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs font-bold text-slate-200"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDING WINDOW CANVAS */}
            {config.type === "sliding_window" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Window Size: <span className="font-bold text-emerald-400">K = {windowK}</span></div>
                  <div className="text-xs text-slate-400">Window Sum: <span className="font-bold text-emerald-400">{currentWindowSum}</span></div>
                  <div className="text-xs text-slate-400">Average: <span className="font-bold text-indigo-400">{(currentWindowSum / windowK).toFixed(2)}</span></div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 py-6">
                  {data.map((val, idx) => {
                    const inWindow = idx >= windowStart && idx < windowStart + windowK;
                    return (
                      <div
                        key={idx}
                        className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-base font-mono font-bold transition-all duration-300 border-2 ${
                          inWindow
                            ? "border-emerald-500 bg-emerald-950/70 text-emerald-300 shadow-lg shadow-emerald-500/20 scale-105"
                            : "border-slate-800 bg-slate-900/40 text-slate-500 opacity-50"
                        }`}
                      >
                        <span>{val}</span>
                        <span className="text-[9px] text-slate-500">[{idx}]</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleSlideWindow(-1)}
                    disabled={windowStart === 0}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl font-bold text-xs text-white"
                  >
                    ◀ Slide Left
                  </button>
                  <button
                    onClick={() => handleSlideWindow(1)}
                    disabled={windowStart + windowK >= data.length}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 rounded-xl font-bold text-xs text-white shadow"
                  >
                    Slide Window Right ▶
                  </button>
                </div>
              </div>
            )}

            {/* STACK CANVAS */}
            {config.type === "stack" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-800 text-xs text-slate-400">
                  <div>Remaining Stream: <span className="font-mono font-bold text-amber-400">{data.slice(streamIdx).join(" ") || "None"}</span></div>
                  <div>Stack Height: <span className="font-bold text-purple-400">{stackItems.length}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="flex flex-col items-center justify-end h-44 bg-slate-900/90 rounded-xl border-2 border-dashed border-purple-500/40 p-3">
                    <div className="text-[10px] text-purple-400 font-mono mb-1">── TOP ──</div>
                    <div className="w-full flex flex-col-reverse gap-1 items-center overflow-y-auto">
                      {stackItems.length === 0 ? (
                        <div className="text-slate-600 text-[11px] italic py-4">Stack is empty</div>
                      ) : (
                        stackItems.map((item, idx) => (
                          <div key={idx} className="w-3/4 py-1.5 bg-purple-600/30 border border-purple-500 text-purple-200 font-mono font-bold text-center rounded-lg text-sm">
                            {item}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    {streamIdx < data.length ? (
                      <button
                        onClick={() => handleStackStep(data[streamIdx])}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-lg rounded-xl shadow"
                      >
                        Push '{data[streamIdx]}' ➔
                      </button>
                    ) : (
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-center text-xs">
                        All brackets matched!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback bar */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        </div>

        {/* RIGHT/BOTTOM: LIVE CODE EXECUTION MIRROR (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            {/* Mirror Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Code Execution Mirror</span>
              </div>

              {/* Language Selector */}
              <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {["python", "cpp", "java"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLang(lang)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                      codeLang === lang
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Synchronized Code Box with Glowing Active Line */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 font-mono text-xs overflow-x-auto space-y-1">
              {activeCodeLines.map(({ line, text }) => {
                const isCurrent = activeLine === line;
                return (
                  <div
                    key={line}
                    className={`flex items-center gap-3 px-2 py-1 rounded transition-all duration-200 ${
                      isCurrent
                        ? "bg-emerald-500/20 text-emerald-300 border-l-4 border-emerald-400 font-bold shadow-sm"
                        : "text-slate-400 opacity-70"
                    }`}
                  >
                    <span className="text-[10px] text-slate-600 select-none w-4 text-right">{line}</span>
                    <span className="whitespace-pre">{text}</span>
                  </div>
                );
              })}
            </div>

            {/* Live Variable State Inspector */}
            <div className="mt-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Active Variable State
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500">left:</span> <span className="text-blue-400 font-bold">{leftIdx}</span> (val: {data[leftIdx]})
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500">right:</span> <span className="text-rose-400 font-bold">{rightIdx}</span> (val: {data[rightIdx]})
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500">curr_sum:</span> <span className={`font-bold ${currSum === target ? "text-emerald-400" : "text-amber-400"}`}>{currSum}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500">target:</span> <span className="text-emerald-400 font-bold">{target}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Cause-and-Effect Explanation Card */}
          <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs">
            <div className="font-bold text-[10px] uppercase font-mono tracking-wider text-indigo-400 mb-1">
              ⚡ What's Happening in Code:
            </div>
            <p className="leading-relaxed font-sans text-[11px]">{codeExplanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
