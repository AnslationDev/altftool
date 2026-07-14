"use client";

import { History, Trash2 } from "lucide-react";

export default function EmotionHistory({ history, onSelect, onClear }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-base text-foreground flex items-center gap-2">
          <History size={18} className="text-primary" /> Recent Scans
        </h4>
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-red-500 font-semibold flex items-center gap-1 cursor-pointer transition"
          aria-label="Clear history"
        >
          <Trash2 size={13} /> Clear
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex items-center gap-3 p-2 bg-[var(--anslation-ds-soft)] border border-border hover:border-primary rounded-xl cursor-pointer text-left transition hover:scale-[1.02] active:scale-95 duration-100 group"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 border border-border/50">
              <img
                src={item.image}
                alt="Scan thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-foreground truncate capitalize group-hover:text-primary">
                {item.dominantEmotion}
              </span>
              <span className="block text-[10px] text-muted-foreground truncate">
                {item.faceCount} {item.faceCount === 1 ? "face" : "faces"} • {item.timestamp}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
