"use client";

import { toneForGrade, TONE_CLASSES } from "../../lib/uiTone";

export default function ScoreGauge({ score, grade, size = 176, strokeWidth = 14 }) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const tone = TONE_CLASSES[toneForGrade(grade)];

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Overall score ${Math.round(clamped)} out of 100, grade ${grade}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className="stroke-(--muted)" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={`${tone.stroke} transition-[stroke-dashoffset] duration-700 ease-out`}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums text-(--foreground)">{Math.round(clamped)}</span>
        <span className="text-xs font-medium text-(--muted-foreground)">/ 100</span>
      </div>
    </div>
  );
}
