"use client";

import { Timer, AlertTriangle } from "lucide-react";

export default function TimerBar({ timeLeft, total, isRunning }) {
  const percent = total > 0 ? (timeLeft / total) * 100 : 0;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span className={`flex items-center gap-1.5 ${isLow ? "text-rose-500 animate-pulse" : "text-[var(--muted-foreground)]"}`}>
          {isCritical ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Timer className="h-4 w-4" />
          )}
          {timeLeft}s remaining
        </span>
        {isRunning && (
          <span className="text-[var(--foreground)]">
            {Math.round(percent)}%
          </span>
        )}
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className={`h-full transition-all duration-1000 ${
            isCritical
              ? "bg-rose-500 animate-pulse"
              : isLow
                ? "bg-rose-500"
                : "bg-[var(--primary)]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
