// components/ChessClock.jsx
"use client";

import { Clock } from "lucide-react";
import { formatClock } from "../utils/game-utils";

export default function ChessClock({ color, seconds, active, flagged }) {
  const low = seconds <= 10 && seconds > 0;
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
        active
          ? "border-(--primary) bg-(--primary)/10"
          : "border-(--border) bg-(--card)"
      }`}
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            color === "w" ? "bg-(--background) text-(--foreground)" : "bg-(--foreground) text-(--background)"
          }`}
          style={{ boxShadow: "inset 0 0 0 2px var(--border)" }}
        >
          {color === "w" ? "W" : "B"}
        </span>
        <span className="text-sm font-semibold text-(--muted-foreground)">
          {color === "w" ? "White" : "Black"}
        </span>
      </div>
      <div
        className={`flex items-center gap-1.5 font-mono text-2xl font-bold tabular-nums ${
          flagged || low ? "text-red-600" : "text-(--foreground)"
        }`}
      >
        <Clock size={18} className="text-(--muted-foreground)" />
        {formatClock(seconds)}
      </div>
    </div>
  );
}
