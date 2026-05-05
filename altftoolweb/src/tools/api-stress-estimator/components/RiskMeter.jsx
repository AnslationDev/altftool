"use client";

import { ShieldAlert } from "lucide-react";

function Bar({ label, value, max = 100, tone }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barColor = tone === "danger" ? "bg-red-500" : "bg-sky-600";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span className="font-mono-display font-bold text-foreground">
          {typeof value === "number" ? value.toFixed(1) : value}
          {typeof value === "number" ? "%" : ""}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function RiskMeter({ timeoutRisk, crashProbability, errorRate }) {
  const errorTone = errorRate > 8 ? "danger" : "ok";
  const crashTone =
    crashProbability > 60 ? "danger" : "ok";

  const timeoutPct =
    timeoutRisk === "High" ? 92 : timeoutRisk === "Medium" ? 55 : 18;
  const timeoutTone =
    timeoutRisk === "High" ? "danger" : "ok";

  return (
    <div className="soft-card p-5">
      {/* Decorative gradient line */}
      <div className="card-glow-line" />

      <div className="relative flex items-center gap-3">
        <div className="icon-badge">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Risk Meter</h3>
          <p className="text-xs text-muted-foreground">Live failure indicators</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <Bar label="Error Rate" value={errorRate} tone={errorTone} />
        <Bar
          label="Crash Probability"
          value={crashProbability}
          tone={crashTone}
        />
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">Timeout Risk</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                timeoutTone === "danger"
                  ? "bg-red-500/20 text-red-600 dark:text-red-400"
                  : "bg-sky-500/20 text-sky-700"
              }`}
            >
              {timeoutRisk}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                timeoutTone === "danger"
                  ? "bg-red-500"
                  : "bg-sky-600"
              }`}
              style={{ width: `${timeoutPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
