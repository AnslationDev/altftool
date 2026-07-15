"use client";

import { Heart, RotateCcw, Trash2 } from "lucide-react";

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

export default function SavedNumbers({ saved, onRemove, onUse }) {
  if (saved.length === 0) {
    return (
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-10 text-center shadow-md">
        <Heart className="w-10 h-10 text-(--muted-foreground) mx-auto mb-3" />
        <p className="text-(--muted-foreground) font-medium">No saved numbers</p>
        <p className="text-sm text-(--muted-foreground) mt-1">Save your favorite lucky numbers to access them anytime.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md">
      <h3 className="font-semibold text-sm text-(--muted-foreground) uppercase tracking-wide flex items-center gap-2 mb-4">
        <Heart className="w-4 h-4 text-red-500" />
        Saved Numbers ({saved.length})
      </h3>

      <div className="space-y-2">
        {saved.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-(--page) border border-(--border) hover:border-(--primary)/30 transition group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500">
                  {modeLabel(entry.mode)}
                </span>
              </div>
              <p className="text-sm font-medium truncate">{formatNumbers(entry.numbers)}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onUse(entry)}
                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-(--primary)/10 transition"
                title="Use these numbers"
              >
                <RotateCcw className="w-4 h-4 text-(--muted-foreground)" />
              </button>
              <button
                onClick={() => onRemove(entry.id)}
                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                title="Remove"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
