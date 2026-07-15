import React from "react";
import { Sparkles, Activity, CheckCircle2 } from "lucide-react";

export default function ScoreResult({ result }) {
  if (!result) return null;

  const { score, breakdown } = result;

  const getScoreMessage = (s) => {
    if (s >= 95) return "Absolutely Flawless ✨";
    if (s >= 85) return "Stunning Proportions 🌟";
    if (s >= 75) return "Naturally Beautiful 💫";
    return "Uniquely Gorgeous ✨";
  };

  const getScoreColor = (s) => {
    if (s >= 90) return "text-purple-500";
    if (s >= 80) return "text-blue-500";
    if (s >= 70) return "text-emerald-500";
    return "text-amber-500";
  };

  return (
    <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm mt-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="text-center mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">
          Final Beauty Score
        </h3>
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-[6px] border-purple-100 dark:border-purple-900/30">
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
                strokeDasharray="339.292"
                strokeDashoffset={339.292 - (339.292 * score) / 100}
                style={{ strokeLinecap: "round", transformOrigin: "center" }}
              />
            </svg>
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-lg font-medium text-[var(--foreground)]">
            <Sparkles size={20} className="text-yellow-500" />
            {getScoreMessage(score)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between rounded-lg bg-[var(--background)] p-4 border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Facial Symmetry</p>
              <p className="text-xs text-[var(--muted-foreground)]">Left vs Right balance</p>
            </div>
          </div>
          <span className="text-lg font-bold text-[var(--foreground)]">{breakdown.symmetry}%</span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[var(--background)] p-4 border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Golden Ratio</p>
              <p className="text-xs text-[var(--muted-foreground)]">Geometric proportions</p>
            </div>
          </div>
          <span className="text-lg font-bold text-[var(--foreground)]">{breakdown.goldenRatio}%</span>
        </div>
      </div>
      
      <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
        Disclaimer: This score is calculated using geometric AI heuristics and is meant for entertainment purposes only!
      </p>
    </div>
  );
}
