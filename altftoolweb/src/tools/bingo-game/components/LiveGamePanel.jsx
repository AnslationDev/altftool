"use client";

import { Timer } from "lucide-react";
import { getLetterForNumber } from "../utils/bingoLogic";

function MetricRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-pink-500/20 last:border-b-0 text-xs font-bold">
      <span className="text-[var(--muted-foreground)] dark:text-pink-200">{label}</span>
      <span className={`font-black ${highlight ? "text-amber-600 dark:text-yellow-300" : "text-[var(--foreground)] dark:text-white"}`}>
        {value}
      </span>
    </div>
  );
}

export default function LiveGamePanel({
  gameStarted,
  currentNumber,
  calledNumbers,
  timer,
  markedCount,
  nextNumber,
}) {
  const totalNumbers = 75;
  const progress = calledNumbers.length > 0 ? (calledNumbers.length / totalNumbers) * 100 : 0;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="rounded-3xl border-4 border-pink-400/60 bg-[var(--card)] p-5 shadow-xl text-[var(--foreground)] dark:bg-gradient-to-b dark:from-[#3d134d] dark:via-[#2a0e36] dark:to-[#180521] dark:border-pink-400/80 dark:shadow-[0_0_35px_rgba(236,72,153,0.3)]">
      <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-300">
        Live Telemetry
      </span>
      <h2 className="text-xl font-black text-[var(--foreground)] dark:text-white">Game Status</h2>

      {/* Timer & Progress Card */}
      <div className="mt-4 rounded-2xl border border-pink-400/30 bg-[var(--muted)]/50 dark:bg-[#250831] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-amber-500 dark:text-yellow-300 animate-pulse" />
            <span className="text-xs font-black text-[var(--muted-foreground)] dark:text-pink-200 uppercase tracking-wider">
              Elapsed Time
            </span>
          </div>
          <span className="text-base font-black text-amber-700 dark:text-yellow-300 font-mono bg-[var(--card)] dark:bg-[#14021d] px-2.5 py-1 rounded-lg border border-pink-400/30">
            {formatTime(timer)}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-black text-[var(--muted-foreground)] dark:text-pink-200">
            <span>Progress ({calledNumbers.length}/{totalNumbers})</span>
            <span className="text-amber-600 dark:text-yellow-300">{Math.round(progress)}%</span>
          </div>
          <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-[var(--border)] dark:bg-[#14021d] border border-pink-400/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Details */}
      <div className="mt-4 space-y-0.5 rounded-2xl border border-pink-400/30 bg-[var(--card)] dark:bg-[#250831] p-3">
        <MetricRow
          label="Session Status"
          value={gameStarted ? "Active Game" : "Awaiting Start"}
          highlight={gameStarted}
        />
        <MetricRow label="Numbers Called" value={calledNumbers.length} />
        <MetricRow label="Numbers Remaining" value={totalNumbers - calledNumbers.length} />
        <MetricRow label="Board Tiles Marked" value={markedCount} highlight={markedCount > 0} />
        {currentNumber && (
          <MetricRow
            label="Last Called Ball"
            value={`${getLetterForNumber(currentNumber)}-${currentNumber}`}
            highlight
          />
        )}
      </div>
    </div>
  );
}
