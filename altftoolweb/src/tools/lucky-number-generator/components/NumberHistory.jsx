"use client";

import { Clock, RotateCcw, Trash2 } from "lucide-react";

function formatTimestamp(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function formatNumbers(nums) {
  if (!nums) return "";
  if (Array.isArray(nums)) return nums.join(", ");
  if (nums.main) return `${nums.main.join(", ")} + ${nums.extra?.join(", ") || nums.power}`;
  return String(nums);
}

function modeLabel(mode) {
  const labels = {
    random: "Random",
    lottery: "Lottery",
    horoscope: "Horoscope",
    numerology: "Numerology",
    custom: "Custom",
  };
  return labels[mode] || mode;
}

export default function NumberHistory({ history, onClear, onUse }) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-10 text-center shadow-md">
        <Clock className="w-10 h-10 text-(--muted-foreground) mx-auto mb-3" />
        <p className="text-(--muted-foreground) font-medium">No history yet</p>
        <p className="text-sm text-(--muted-foreground) mt-1">Generate some lucky numbers to see them here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-(--muted-foreground) uppercase tracking-wide flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent History
        </h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-(--border) hover:text-red-500 hover:border-red-300 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-(--page) border border-(--border) hover:border-(--primary)/30 transition group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-(--primary)/10 text-(--primary)">
                  {modeLabel(entry.mode)}
                </span>
                <span className="text-xs text-(--muted-foreground)">{formatTimestamp(entry.timestamp)}</span>
              </div>
              <p className="text-sm font-medium truncate">{formatNumbers(entry.numbers)}</p>
            </div>
            <button
              onClick={() => onUse(entry)}
              className="flex-shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-(--primary)/10 transition"
              title="Use these numbers"
            >
              <RotateCcw className="w-4 h-4 text-(--muted-foreground)" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
