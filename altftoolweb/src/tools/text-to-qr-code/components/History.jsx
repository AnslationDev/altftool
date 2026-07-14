"use client";

import { Clock, Trash2 } from "lucide-react";

export default function History({ history, onSelect, onClear }) {
  if (history.length === 0) return null;

  return (
    <div className="bg-(--card) border border-(--border) rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2 text-(--primary)">
          <Clock size={18} /> Recent QR Codes
        </h2>
        <button
          onClick={onClear}
          className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect(item)}
            className="w-full text-left px-4 py-3 rounded-xl border border-(--border) bg-(--background) hover:border-(--primary) transition-all flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-(--muted) flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-(--muted-foreground) uppercase">
                {item.type}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-(--foreground) truncate group-hover:text-(--primary)">
                {item.label}
              </p>
              <p className="text-xs text-(--muted-foreground) truncate">
                {item.preview}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
