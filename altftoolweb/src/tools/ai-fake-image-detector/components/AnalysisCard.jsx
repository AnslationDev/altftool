"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

function getScoreBarColor(score) {
  if (score <= 30) return "bg-green-500";
  if (score <= 55) return "bg-amber-500";
  return "bg-red-500";
}

function getConfidenceBadge(confidence) {
  if (confidence >= 70) return { label: "High", color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" };
  if (confidence >= 45) return { label: "Medium", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" };
  return { label: "Low", color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" };
}

export default function AnalysisCard({ check, icon: Icon }) {
  const [expanded, setExpanded] = useState(false);
  const { name, score, confidence, description, details } = check;
  const badge = getConfidenceBadge(confidence);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
            <Icon className="h-4.5 w-4.5 text-[var(--primary)]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">{name}</h3>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${getScoreBarColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-sm font-bold tabular-nums text-[var(--foreground)]">{score}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">{description}</p>
        </div>
      </div>

      {details && details.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex w-full items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Hide details" : "Show details"}
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1 rounded-lg bg-[var(--muted)]/50 p-3">
              {details.map((detail, i) => (
                <li key={i} className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
