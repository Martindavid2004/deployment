import React, { useState } from "react";
import { Play, RotateCcw, ChevronRight, CheckCircle2, Sparkles, Navigation, MousePointerClick } from "lucide-react";

export function GraphVisualizer({ config, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedNodes, setVisitedNodes] = useState(["A"]);
  const [distances, setDistances] = useState({ A: 0, B: 4, C: 2, D: "∞", E: "∞" });
  const [activeEdge, setActiveEdge] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDone, setIsDone] = useState(false);

  const rawNodes = config?.nodes || ["A", "B", "C", "D", "E"];
  const rawEdges = config?.edges || [
    { from: "A", to: "B", weight: 4 },
    { from: "A", to: "C", weight: 2 },
    { from: "C", to: "B", weight: 1 },
    { from: "B", to: "D", weight: 5 },
    { from: "C", to: "D", weight: 8 },
    { from: "D", to: "E", weight: 2 }
  ];

  const defaultPositions = {
    A: { x: 50, y: 120 },
    B: { x: 170, y: 50 },
    C: { x: 170, y: 190 },
    D: { x: 290, y: 120 },
    E: { x: 380, y: 120 },
    You: { x: 50, y: 120 },
    Alice: { x: 150, y: 50 },
    Bob: { x: 150, y: 190 },
    Charlie: { x: 260, y: 50 },
    David: { x: 260, y: 190 },
    Target: { x: 370, y: 120 }
  };

  const getNodePos = (id, idx = 0) => {
    if (defaultPositions[id]) return defaultPositions[id];
    const total = rawNodes.length;
    const angle = (idx / total) * 2 * Math.PI;
    return {
      x: Math.round(210 + 140 * Math.cos(angle)),
      y: Math.round(120 + 65 * Math.sin(angle))
    };
  };

  const nodePositions = {};
  rawNodes.forEach((nodeId, idx) => {
    const id = typeof nodeId === "object" ? nodeId.id || nodeId.name : nodeId;
    nodePositions[id] = getNodePos(id, idx);
  });

  const steps = [
    {
      action: "Pick unvisited node with min distance: 'C' (dist = 2). Relax neighbor B via C: 2 + 1 = 3 < 4!",
      vis: ["A", "C"],
      edge: { from: "C", to: "B" },
      dist: { A: 0, B: 3, C: 2, D: 10, E: "∞" }
    },
    {
      action: "Pick next min unvisited node: 'B' (dist = 3). Relax neighbor D: 3 + 5 = 8 < 10!",
      vis: ["A", "C", "B"],
      edge: { from: "B", to: "D" },
      dist: { A: 0, B: 3, C: 2, D: 8, E: "∞" }
    },
    {
      action: "Pick next min unvisited node: 'D' (dist = 8). Relax neighbor E: 8 + 2 = 10!",
      vis: ["A", "C", "B", "D"],
      edge: { from: "D", to: "E" },
      dist: { A: 0, B: 3, C: 2, D: 8, E: 10 }
    },
    {
      action: "Target reached with guaranteed shortest cost = 10 via path: A ➔ C ➔ B ➔ D ➔ E!",
      vis: ["A", "C", "B", "D", "E"],
      edge: null,
      dist: { A: 0, B: 3, C: 2, D: 8, E: 10 }
    }
  ];

  const handleStep = () => {
    if (currentStep < steps.length) {
      const s = steps[currentStep];
      setVisitedNodes(s.vis);
      setDistances(s.dist);
      setActiveEdge(s.edge);
      setCurrentStep(currentStep + 1);

      if (currentStep + 1 === steps.length) {
        setIsDone(true);
        if (onComplete) onComplete();
      }
    }
  };

  const handleNodeClick = (id) => {
    setSelectedNode(id);
    if (!visitedNodes.includes(id)) {
      setVisitedNodes([...visitedNodes, id]);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setVisitedNodes([Object.keys(nodePositions)[0] || "A"]);
    setDistances({ A: 0, B: 4, C: 2, D: "∞", E: "∞" });
    setActiveEdge(null);
    setSelectedNode(null);
    setIsDone(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Navigation className="w-3.5 h-3.5" /> Graph Edge Relaxation Machinery
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white mt-2">
            {config?.title || "Dijkstra's Min-Priority Shortest Path"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Watch greedy distance relaxation from Source to Destination through priority updates, or click on any node to inspect incident edges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleStep}
            disabled={isDone}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/25 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Relax Edge Step <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas for Graph */}
      <div className="relative bg-slate-950 rounded-2xl border border-slate-800/80 p-6 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
        <div className="absolute top-3 left-4 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" /> Click any node to select and highlight
        </div>

        <svg viewBox="0 0 440 240" className="w-full max-w-lg md:max-w-xl h-auto select-none mt-2">
          {/* Edges */}
          {rawEdges.map((e, idx) => {
            const p1 = nodePositions[e.from] || { x: 50, y: 120 };
            const p2 = nodePositions[e.to] || { x: 380, y: 120 };
            const isRelaxing = activeEdge && activeEdge.from === e.from && activeEdge.to === e.to;
            const isOptimalPath = isDone && ((e.from === "A" && e.to === "C") || (e.from === "C" && e.to === "B") || (e.from === "B" && e.to === "D") || (e.from === "D" && e.to === "E"));

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  className={`transition-all duration-300 ${
                    isOptimalPath
                      ? "stroke-cyan-400 stroke-[3.5px] filter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                      : isRelaxing
                      ? "stroke-amber-400 stroke-[3px]"
                      : "stroke-slate-800 stroke-[2px]"
                  }`}
                />
                {/* Weight badge if weight exists */}
                {e.weight !== undefined && (
                  <>
                    <rect
                      x={(p1.x + p2.x) / 2 - 10}
                      y={(p1.y + p2.y) / 2 - 10}
                      width="20"
                      height="20"
                      rx="6"
                      className="fill-slate-900 stroke-slate-700 stroke-1"
                    />
                    <text
                      x={(p1.x + p2.x) / 2}
                      y={(p1.y + p2.y) / 2 + 4}
                      textAnchor="middle"
                      className="text-[10px] font-mono font-bold fill-slate-300"
                    >
                      {e.weight}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {Object.entries(nodePositions).map(([id, pos]) => {
            const isVisited = visitedNodes.includes(id);
            const isSelected = selectedNode === id;
            const isSource = id === Object.keys(nodePositions)[0];
            const isTarget = id === Object.keys(nodePositions)[Object.keys(nodePositions).length - 1];

            return (
              <g
                key={`node-${id}`}
                onClick={() => handleNodeClick(id)}
                className="cursor-pointer group transition-all duration-300"
              >
                {/* Outer halo */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="26"
                  className={`transition-all duration-300 ${
                    isSelected
                      ? "fill-cyan-500/20 stroke-cyan-400 stroke-[2px] animate-pulse"
                      : "fill-transparent stroke-transparent group-hover:stroke-cyan-500/30"
                  }`}
                />

                {/* Node body */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="20"
                  className={`transition-all duration-300 ${
                    isTarget && isDone
                      ? "fill-cyan-500 stroke-white stroke-[3px] filter drop-shadow-[0_0_15px_rgba(34,211,238,0.9)]"
                      : isSource
                      ? "fill-indigo-600 stroke-indigo-400 stroke-2"
                      : isVisited
                      ? "fill-slate-900 stroke-cyan-400 stroke-2"
                      : "fill-slate-950 stroke-slate-800 stroke-2 group-hover:stroke-cyan-400"
                  }`}
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  className="text-xs font-mono font-black fill-white select-none pointer-events-none"
                >
                  {id}
                </text>
              </g>
            );
          })}
        </svg>

        {isDone && (
          <div className="absolute top-4 right-4 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Optimal Shortest Path Confirmed
          </div>
        )}
      </div>

      {/* Live Distance Table */}
      <div className="grid grid-cols-5 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        {Object.entries(distances).map(([node, dist]) => (
          <div key={node} className="text-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Node {node}</div>
            <div className={`text-sm font-mono font-black mt-1 ${dist !== "∞" ? "text-cyan-400" : "text-slate-600"}`}>
              {dist}
            </div>
          </div>
        ))}
      </div>

      {/* Step Feedback Explanation */}
      <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
        <span className="font-bold text-cyan-400">Step {currentStep}:</span>{" "}
        {currentStep === 0 ? "Initial state: Start at source node with distance 0. Click 'Relax Edge Step' to begin." : steps[currentStep - 1].action}
      </div>
    </div>
  );
}
export default GraphVisualizer;
