import React, { useState } from "react";
import { Play, RotateCcw, Plus, Trash2, CheckCircle2, ShieldAlert, Cpu, Layers } from "lucide-react";

export function SystemDesignVisualizer({ config, onComplete }) {
  const [activeTab, setActiveTab] = useState(config?.type || "consistent_hashing");

  // Consistent Hashing State
  const [servers, setServers] = useState([
    { id: "Node_A", angle: 45, color: "#3B82F6" },
    { id: "Node_B", angle: 160, color: "#10B981" },
    { id: "Node_C", angle: 280, color: "#F59E0B" }
  ]);
  const [activeKey, setActiveKey] = useState("user_session_44");
  const [routedServer, setRoutedServer] = useState("Node_B");

  // LRU Cache State
  const [cacheItems, setCacheItems] = useState([
    { key: "item_1", val: "User Profile" },
    { key: "item_2", val: "Auth Token" },
    { key: "item_3", val: "Video Metadata" }
  ]);
  const [evictedItem, setEvictedItem] = useState(null);

  // Token Bucket State
  const [tokens, setTokens] = useState(5);
  const maxTokens = 5;
  const [rateLimitMessage, setRateLimitMessage] = useState("");

  // Consistent Hashing Route
  const handleRouteKey = (angle) => {
    // Find next server clockwise
    const sorted = [...servers].sort((a, b) => a.angle - b.angle);
    const target = sorted.find((s) => s.angle >= angle) || sorted[0];
    setRoutedServer(target.id);
  };

  const handleAddServer = () => {
    if (servers.length < 5) {
      const newServer = { id: `Node_${String.fromCharCode(65 + servers.length)}`, angle: 220, color: "#EC4899" };
      setServers([...servers, newServer]);
    }
  };

  // LRU Get / Put
  const handleLruAccess = (k) => {
    const item = cacheItems.find((i) => i.key === k);
    if (item) {
      // Move to head (Most Recently Used)
      const rest = cacheItems.filter((i) => i.key !== k);
      setCacheItems([item, ...rest]);
    }
  };

  const handleLruPut = () => {
    const newItem = { key: `item_${Date.now() % 1000}`, val: "New Cached Payload" };
    if (cacheItems.length >= 3) {
      const evicted = cacheItems[cacheItems.length - 1];
      setEvictedItem(evicted);
      setCacheItems([newItem, ...cacheItems.slice(0, 2)]);
    } else {
      setCacheItems([newItem, ...cacheItems]);
    }
  };

  // Token Bucket Consume
  const handleConsumeToken = () => {
    if (tokens > 0) {
      setTokens(tokens - 1);
      setRateLimitMessage("✅ 200 OK — Request Allowed through Gateway.");
    } else {
      setRateLimitMessage("🔥 429 Too Many Requests — Rate Limit Exceeded! Backing off.");
    }
  };

  const handleRefillTokens = () => {
    setTokens(Math.min(maxTokens, tokens + 2));
    setRateLimitMessage("💧 Tokens Refilled by Background Cron (+2 tokens).");
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6">
      {/* Header and Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            <Cpu className="w-3.5 h-3.5" /> Distributed Architecture Machinery
          </div>
          <h3 className="text-xl font-black text-white mt-2">
            System Design Production Patterns
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Interact with high-scale architecture algorithms running in production systems (Discord, Redis, Cloudflare).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("consistent_hashing")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "consistent_hashing"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Consistent Hashing Ring
          </button>
          <button
            onClick={() => setActiveTab("lru_cache")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "lru_cache"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            LRU Cache Doubly-Linked
          </button>
          <button
            onClick={() => setActiveTab("token_bucket")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "token_bucket"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Token Bucket Limiter
          </button>
        </div>
      </div>

      {/* Mode 1: Consistent Hashing Ring */}
      {activeTab === "consistent_hashing" && (
        <div className="space-y-6">
          <div className="relative bg-slate-950 rounded-2xl border border-slate-800 p-6 flex items-center justify-center min-h-[300px]">
            <svg viewBox="0 0 300 300" className="w-64 h-64 select-none">
              {/* Outer Ring */}
              <circle cx="150" cy="150" r="110" fill="none" stroke="#334155" strokeWidth="6" strokeDasharray="6 4" />

              {/* Server Nodes on Ring */}
              {servers.map((s) => {
                const rad = (s.angle * Math.PI) / 180;
                const x = 150 + 110 * Math.cos(rad);
                const y = 150 + 110 * Math.sin(rad);
                const isTarget = routedServer === s.id;

                return (
                  <g key={s.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill={s.color}
                      stroke={isTarget ? "#FFFFFF" : "#1E293B"}
                      strokeWidth={isTarget ? "4" : "2"}
                      className={isTarget ? "filter drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" : ""}
                    />
                    <text x={x} y={y + 4} textAnchor="middle" className="text-[9px] font-black font-mono fill-white">
                      {s.id.split("_")[1]}
                    </text>
                  </g>
                );
              })}

              {/* Key on Ring */}
              <g>
                <circle cx="150" cy="150" r="30" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
                <text x="150" y="154" textAnchor="middle" className="text-[9px] font-mono font-bold fill-amber-300">
                  {routedServer}
                </text>
              </g>
            </svg>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400">Incoming Key: <strong className="text-white">{activeKey}</strong></span>
              <span className="text-amber-400">Routed Clockwise ➔ <strong>{routedServer}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRouteKey(110)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              Simulate Key Hash (110°)
            </button>
            <button
              onClick={() => handleRouteKey(230)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              Simulate Key Hash (230°)
            </button>
            <button
              onClick={handleAddServer}
              disabled={servers.length >= 5}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all ml-auto"
            >
              <Plus className="w-4 h-4" /> Add Server Node
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: LRU Cache */}
      {activeTab === "lru_cache" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>HEAD (Most Recently Used)</span>
              <span>TAIL (Least Recently Used / Next Evicted)</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {cacheItems.map((item, idx) => (
                <div
                  key={item.key}
                  onClick={() => handleLruAccess(item.key)}
                  className="cursor-pointer p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all text-center hover:scale-105"
                >
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                    {idx === 0 ? "🔥 MRU Item" : idx === 2 ? "❄️ LRU Item" : "Active Item"}
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{item.key}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.val}</div>
                  <div className="text-[10px] text-slate-600 font-mono mt-2">Click to Access (O(1) Get)</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {evictedItem ? (
              <span className="text-xs text-rose-400 font-mono">
                Evicted: <strong>{evictedItem.key}</strong> from tail to satisfy capacity bound.
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-mono">Capacity: 3 items max in memory.</span>
            )}
            <button
              onClick={handleLruPut}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/25 transition-all"
            >
              <Plus className="w-4 h-4" /> Put New Item (O(1))
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Token Bucket Limiter */}
      {activeTab === "token_bucket" && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
            <div className="text-xs font-mono text-slate-400 uppercase font-bold">Bucket Capacity (Max 5 Tokens)</div>
            {/* Visual Token Tank */}
            <div className="flex items-center gap-2">
              {[...Array(maxTokens)].map((_, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-14 rounded-xl border flex items-center justify-center font-mono font-bold text-xs transition-all ${
                    idx < tokens
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 scale-105"
                      : "bg-slate-900 border-slate-800 text-slate-700"
                  }`}
                >
                  {idx < tokens ? "🪙" : "○"}
                </div>
              ))}
            </div>

            {rateLimitMessage && (
              <div className="text-xs font-mono font-bold text-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                {rateLimitMessage}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleConsumeToken}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/25 transition-all"
            >
              Send API Request (-1 Token)
            </button>
            <button
              onClick={handleRefillTokens}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              Simulate Time Refill (+2 Tokens)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default SystemDesignVisualizer;
