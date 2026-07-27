"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function HistoryPanel({ history, onClear }) {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-(--muted) border border-(--border) text-center">
        <Clock size="20" className="mx-auto mb-1 text-(--muted-foreground)" />
        <p className="text-xs text-(--muted-foreground)">No spins yet</p>
      </div>
    );
  }

  const display = expanded ? history : history.slice(0, 5);

  return (
    <div className="rounded-xl bg-(--muted) border border-(--border) overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Clock size="14" className="text-(--muted-foreground)" />
          <span className="text-xs font-semibold text-(--foreground)">History</span>
          <span className="text-xs text-(--muted-foreground)">({history.length})</span>
        </div>
        <div className="flex gap-1">
          {history.length > 5 && (
            <button onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Collapse history" : "Expand history"} className="p-1 rounded hover:bg-(--card) text-(--muted-foreground) transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)">
              {expanded ? <ChevronUp size="14" /> : <ChevronDown size="14" />}
            </button>
          )}
          <button onClick={onClear} aria-label="Clear history" className="p-1 rounded hover:bg-(--card) text-(--muted-foreground) hover:text-(--danger) transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)">
            <Trash2 size="14" />
          </button>
        </div>
      </div>
      <div className="px-3 pb-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {display.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-(--card) text-sm"
            >
              <span className="font-medium text-(--foreground) truncate">{h.winner}</span>
              <span className="text-xs text-(--muted-foreground) shrink-0">
                {new Date(h.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
