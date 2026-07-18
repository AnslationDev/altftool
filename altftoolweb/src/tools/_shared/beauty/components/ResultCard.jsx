"use client";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function ScoreBar({ label, score, color = "var(--primary)" }) {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-(--muted-foreground)">{label}</span>
        <span className="font-bold text-(--foreground)">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-(--border) overflow-hidden w-full">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ConfidenceBadge({ confidence }) {
  const isHigh = confidence >= 70;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isHigh
          ? "bg-green-50 dark:bg-green-900/25 text-green-600 dark:text-green-400"
          : "bg-amber-50 dark:bg-amber-900/25 text-amber-600 dark:text-amber-400"
      }`}
    >
      {isHigh ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      {confidence}% Confidence
    </span>
  );
}

export function MetricGrid({ metrics }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-(--border) bg-(--card)/50 text-center space-y-1"
        >
          <span className="text-xs text-(--muted-foreground) uppercase tracking-wider block">
            {m.label}
          </span>
          <span className="text-xl font-bold text-(--foreground) block">
            {m.value}
          </span>
          {m.sub && (
            <span className="text-[10px] text-(--muted-foreground) block">
              {m.sub}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function DetailRow({ label, value, color }) {
  return (
    <div className="flex justify-between py-2 border-b border-(--border)/30 last:border-0 text-sm">
      <span className="text-(--muted-foreground)">{label}</span>
      <span
        className="font-semibold text-(--foreground)"
        style={color ? { color } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export function ColorSwatch({ label, name, hex, percent, size }) {
  const displayName = name || label;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-(--border) bg-(--card)">
      <div
        className="w-10 h-10 rounded-full border border-black/10 flex-shrink-0 shadow-sm"
        style={{ backgroundColor: hex }}
      />
      <div className="min-w-0 flex-1">
        <span className="text-xs font-semibold text-(--foreground) block truncate">
          {displayName}
        </span>
        <span className="text-[10px] text-(--muted-foreground) font-mono block">
          {hex}
        </span>
      </div>
      {percent !== undefined && (
        <span className="text-xs font-bold text-(--foreground)">
          {percent}
        </span>
      )}
    </div>
  );
}
