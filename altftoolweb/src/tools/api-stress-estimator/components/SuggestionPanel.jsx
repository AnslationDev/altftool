"use client";

import { Lightbulb, CheckCircle2, AlertCircle } from "lucide-react";

export default function SuggestionPanel({ suggestions, safeTrafficLimit, bottleneck }) {
  return (
    <div className="soft-card p-5 h-full">
      {/* Decorative gradient line */}
      <div className="card-glow-line" />

      <div className="relative flex items-center gap-3">
        <div className="icon-badge">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">
            AI Suggestions
          </h3>
          <p className="text-xs text-muted-foreground">
            Smart, rule-based recommendations
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-3">
        <p className="text-xs font-semibold text-primary">Safe Traffic Limit</p>
        <p className="font-mono-display text-2xl font-extrabold text-primary">
          ~ {safeTrafficLimit.toLocaleString()} req/s
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Stable until bottleneck:{" "}
          <span className="font-semibold text-foreground">{bottleneck}</span>
        </p>
      </div>

      <ul className="mt-4 space-y-2.5">
        {suggestions.length === 0 ? (
          <li className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            Configuration looks healthy. No critical changes needed.
          </li>
        ) : (
          suggestions.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm text-foreground"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{s}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
