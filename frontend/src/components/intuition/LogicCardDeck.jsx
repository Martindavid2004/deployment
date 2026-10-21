import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Code2, ArrowDown, Check, Sparkles, RefreshCw } from "lucide-react";

export default function LogicCardDeck({ logicCards, language = "python", onSyncCode }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (logicCards) {
      // Shuffle initial cards slightly so the user experiences the satisfaction of ordering
      setItems([...logicCards]);
    }
  }, [logicCards]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "init":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "loop":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "condition":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "return":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      default:
        return "bg-slate-700/40 text-slate-300 border-slate-600";
    }
  };

  const handleAssembleAndSync = () => {
    const codeSnippet = items
      .map((item) => {
        const langCode = item.code_template?.[language] || item.code_template?.python || `// ${item.label}`;
        return langCode;
      })
      .join("\n\n");

    if (onSyncCode) {
      onSyncCode(codeSnippet);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Stage 3: Scaffolded Logic
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">Algorithmic Card Deck</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Drag and organize the thought cards into logical order before writing syntax.
          </p>
        </div>

        <button
          onClick={handleAssembleAndSync}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 text-sm"
        >
          <Code2 className="w-4 h-4" /> Sync Structure into Editor
        </button>
      </div>

      {/* Drag Drop Deck */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="logic-cards">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80"
            >
              {items.map((card, index) => {
                const previewCode = card.code_template?.[language] || card.code_template?.python;
                return (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 ${
                          snapshot.isDragging
                            ? "border-indigo-500 bg-indigo-950/80 shadow-2xl shadow-indigo-500/40 scale-102"
                            : "border-slate-800 bg-slate-900/90 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div {...provided.dragHandleProps} className="cursor-grab text-slate-500 hover:text-slate-300">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${getCategoryColor(
                                  card.category
                                )}`}
                              >
                                {card.category}
                              </span>
                              <span className="text-sm font-semibold text-slate-200">{card.label}</span>
                            </div>
                            {previewCode && (
                              <pre className="text-xs font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-md mt-2 border border-slate-800/60 overflow-x-auto max-w-lg">
                                {previewCode}
                              </pre>
                            )}
                          </div>
                        </div>

                        <div className="text-xs font-mono text-slate-600 font-bold">Step {index + 1}</div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
