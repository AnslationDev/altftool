"use client";

import { useEffect, useState } from "react";

export function ProgressBar({
  value = 0, // 0–100
  max = 100,
  showLabel = true,
  showPercent = true,
  label = "",
  height = "md",
  animated = true,
  className = "",
}) {
  // Animate from 0 to value on mount
  const [displayValue, setDisplayValue] = useState(() => (animated ? 0 : value));

  useEffect(() => {
    if (!animated) return;
    // 
    const timer = setTimeout(() => setDisplayValue(value), 300);
    return () => clearTimeout(timer);
  }, [value, animated]);

  const currentValue = animated ? displayValue : value;
  const percent = Math.min(Math.max((currentValue / max) * 100, 0), 100);

  // Color changes dynamically based on score
  const getBarColor = (pct) => {
    if (pct < 30) return "bg-emerald-500";
    if (pct < 70) return "bg-amber-400";
    return "bg-rose-500";
  };

  const getGlowColor = (pct) => {
    if (pct < 30) return "shadow-emerald-500/40";
    if (pct < 70) return "shadow-amber-400/40";
    return "shadow-rose-500/40";
  };

  const heightClasses = {
    sm: "h-1.5",
    md: "h-3",
    lg: "h-5",
  };

  const barColor = getBarColor(percent);
  const glowColor = getGlowColor(percent);

  return (
    <div className={`w-full ${className}`}>
      {/* Label row */}
      {(showLabel || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {showLabel && label && (
            <span className="text-xs text-[(--muted-foreground)] font-secondary">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold text-[(--foreground)] tabular-nums ml-auto">
              {Math.round(currentValue)}/{max}
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={`
          w-full ${heightClasses[height] || heightClasses.md}
          bg-[(--muted)] rounded-full overflow-hidden
        `}
      >
        {/* Fill */}
        <div
          className={`
            h-full rounded-full
            ${barColor}
            ${percent >= 70 ? `shadow-lg ${glowColor} animate-pulse-soft` : ""}
            transition-all duration-1000 ease-out
          `}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function SegmentedBar({ segments = [] }) {
  return (
    <div className="space-y-2.5">
      {segments.map((seg, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-md text-[(--muted-foreground)] w-36 shrink-0 truncate">
            {seg.label}
          </span>
          <div className="flex-1 h-1.5 bg-[(--muted)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${seg.color || "bg-[(--primary)]"}`}
              style={{
                width: `${Math.min((seg.value / seg.max) * 100, 100)}%`,
              }}
            />
          </div>
          <span className="text-xs text-[(--foreground)] tabular-nums w-10 text-right">
            {seg.value}/{seg.max}
          </span>
        </div>
      ))}
    </div>
  );
}
