import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  MousePointerClick,
  GitBranch,
  Repeat
} from "lucide-react";

export function TreeVisualizer({ config, onComplete }) {
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [traversalType, setTraversalType] = useState("bfs");
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);

  // Position defaults for clean tree layout
  const defaultLayout = {
    1: { x: 200, y: 40 },
    2: { x: 110, y: 105 },
    3: { x: 290, y: 105 },
    4: { x: 60, y: 175 },
    5: { x: 160, y: 175 },
    6: { x: 240, y: 175 },
    7: { x: 340, y: 175 }
  };

  // Raw nodes from config or fallback
  const rawNodes = config?.nodes && config.nodes.length > 0 ? config.nodes : [
    { id: 1, value: 4, left: 2, right: 3 },
    { id: 2, value: 2, left: 4, right: 5 },
    { id: 3, value: 7, left: 6, right: 7 },
    { id: 4, value: 1, left: null, right: null },
    { id: 5, value: 3, left: null, right: null },
    { id: 6, value: 6, left: null, right: null },
    { id: 7, value: 9, left: null, right: null }
  ];

  // Guaranteed valid x, y coordinates
  const nodes = rawNodes.map((n, idx) => ({
    ...n,
    x: typeof n.x === "number" ? n.x : defaultLayout[n.id]?.x || 50 + idx * 50,
    y: typeof n.y === "number" ? n.y : defaultLayout[n.id]?.y || (idx < 3 ? 60 : 150)
  }));

  const nodeMap = {};
  nodes.forEach((n) => {
    nodeMap[n.id] = n;
  });

  const bfsOrder = [1, 2, 3, 4, 5, 6, 7];
  const dfsPreOrder = [1, 2, 4, 5, 3, 6, 7];
  const dfsInOrder = [4, 2, 5, 1, 6, 3, 7];

  let targetOrder = bfsOrder;
  if (traversalType === "dfs_pre") targetOrder = dfsPreOrder;
  else if (traversalType === "dfs_in") targetOrder = dfsInOrder;

  const handleStep = () => {
    const nextIdx = visitedNodes.length;
    if (nextIdx < targetOrder.length) {
      const nextId = targetOrder[nextIdx];
      setActiveNode(nextId);
      setSelectedNodeDetails(nodeMap[nextId]);
      const updated = [...visitedNodes, nextId];
      setVisitedNodes(updated);
      if (updated.length === targetOrder.length) {
        setIsDone(true);
        setIsAutoPlaying(false);
        if (onComplete) onComplete();
      }
    }
  };

  // Direct user click on ANY node
  const handleNodeClick = (nodeId) => {
    setActiveNode(nodeId);
    setSelectedNodeDetails(nodeMap[nodeId]);
    if (!visitedNodes.includes(nodeId)) {
      const updated = [...visitedNodes, nodeId];
      setVisitedNodes(updated);
      if (updated.length === nodes.length) {
        setIsDone(true);
        if (onComplete) onComplete();
      }
    }
  };

  const handleReset = () => {
    setVisitedNodes([]);
    setActiveNode(null);
    setSelectedNodeDetails(null);
    setIsDone(false);
    setIsAutoPlaying(false);
  };

  // Auto-play timer
  useEffect(() => {
    let timer;
    if (isAutoPlaying && !isDone) {
      timer = setInterval(() => {
        handleStep();
      }, 900);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, isDone, visitedNodes, traversalType]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Interactive Tree Hierarchy Machinery
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white mt-2">
            {config?.title || "Binary Tree Level & Depth Traversal"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Click on <strong>any node</strong> to inspect and visit it directly, or switch traversal modes to auto-play tree processing algorithms in O(N) time.
          </p>
        </div>

        {/* Traversal Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setTraversalType("bfs"); handleReset(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              traversalType === "bfs"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Level-Order (BFS)
          </button>
          <button
            onClick={() => { setTraversalType("dfs_pre"); handleReset(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              traversalType === "dfs_pre"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Pre-Order (DFS)
          </button>
          <button
            onClick={() => { setTraversalType("dfs_in"); handleReset(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              traversalType === "dfs_in"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            In-Order (DFS)
          </button>
        </div>
      </div>

      {/* SVG Canvas for Tree */}
      <div className="relative bg-slate-950 rounded-2xl border border-slate-800/80 p-6 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
        <div className="absolute top-3 left-4 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" /> Click any circle to select & traverse
        </div>

        <svg viewBox="0 0 400 230" className="w-full max-w-md md:max-w-xl h-auto select-none mt-4">
          {/* Edges */}
          {nodes.map((node) => {
            const leftChild = node.left ? nodeMap[node.left] : null;
            const rightChild = node.right ? nodeMap[node.right] : null;

            return (
              <g key={`edges-${node.id}`}>
                {leftChild && (
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={leftChild.x}
                    y2={leftChild.y}
                    stroke={
                      visitedNodes.includes(node.id) && visitedNodes.includes(leftChild.id)
                        ? "#10B981"
                        : "#334155"
                    }
                    strokeWidth={visitedNodes.includes(leftChild.id) ? "3" : "2"}
                    strokeDasharray={visitedNodes.includes(leftChild.id) ? "none" : "4 2"}
                    className="transition-all duration-300"
                  />
                )}
                {rightChild && (
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={rightChild.x}
                    y2={rightChild.y}
                    stroke={
                      visitedNodes.includes(node.id) && visitedNodes.includes(rightChild.id)
                        ? "#10B981"
                        : "#334155"
                    }
                    strokeWidth={visitedNodes.includes(rightChild.id) ? "3" : "2"}
                    strokeDasharray={visitedNodes.includes(rightChild.id) ? "none" : "4 2"}
                    className="transition-all duration-300"
                  />
                )}
              </g>
            );
          })}

          {/* Interactive Tree Nodes */}
          {nodes.map((node) => {
            const isVisited = visitedNodes.includes(node.id);
            const isActive = activeNode === node.id;

            return (
              <g
                key={`node-${node.id}`}
                onClick={() => handleNodeClick(node.id)}
                className="cursor-pointer group transition-all duration-300"
              >
                {/* Glow ring on hover / active */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  className={`transition-all duration-300 ${
                    isActive
                      ? "fill-emerald-500/20 stroke-emerald-400 stroke-[2px] animate-pulse"
                      : "fill-transparent stroke-transparent group-hover:stroke-emerald-500/40"
                  }`}
                />

                {/* Node Body */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="19"
                  className={`transition-all duration-300 ${
                    isActive
                      ? "fill-emerald-500 stroke-white stroke-[3px] filter drop-shadow-[0_0_14px_rgba(16,185,129,0.9)]"
                      : isVisited
                      ? "fill-emerald-950 stroke-emerald-500 stroke-2"
                      : "fill-slate-900 stroke-slate-700 stroke-2 group-hover:stroke-emerald-400"
                  }`}
                />

                {/* Node Value */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className={`text-xs font-mono font-black select-none pointer-events-none transition-colors ${
                    isActive ? "fill-slate-950" : isVisited ? "fill-emerald-300" : "fill-slate-200"
                  }`}
                >
                  {node.value}
                </text>
              </g>
            );
          })}
        </svg>

        {isDone && (
          <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full Tree Traversed!
          </div>
        )}
      </div>

      {/* Node Inspector Bar (When User Clicks Any Node) */}
      {selectedNodeDetails && (
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold">Selected Node:</span>
            <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-700 text-white font-bold">
              val: {selectedNodeDetails.value} (id: {selectedNodeDetails.id})
            </span>
            <span className="text-slate-400">
              Left: {selectedNodeDetails.left ? nodeMap[selectedNodeDetails.left]?.value : "null"}
            </span>
            <span className="text-slate-400">
              Right: {selectedNodeDetails.right ? nodeMap[selectedNodeDetails.right]?.value : "null"}
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            {visitedNodes.includes(selectedNodeDetails.id) ? "✓ Visited in Traversal" : "○ Unvisited"}
          </span>
        </div>
      )}

      {/* Traversal Trace & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400">Traversed Order:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {visitedNodes.length === 0 ? (
              <span className="text-xs text-slate-600 font-mono">[ Click a node or press 'Next Step' ]</span>
            ) : (
              visitedNodes.map((id, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold animate-fadeIn"
                >
                  {nodeMap[id]?.value}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            disabled={isDone}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isAutoPlaying
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isAutoPlaying ? "Pause" : "Auto-Play"}
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <button
            onClick={handleStep}
            disabled={isDone}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Next Step <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default TreeVisualizer;
