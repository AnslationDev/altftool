"use client";

import { useEffect, useState } from "react";

function getScoreColor(score) {
  if (score <= 30) return { ring: "#16A34A", text: "#16A34A", label: "Authentic" };
  if (score <= 55) return { ring: "#D97706", text: "#D97706", label: "Uncertain" };
  return { ring: "#EF4444", text: "#EF4444", label: "AI-Likely" };
}

function getGradientOffset(score) {
  return Math.min(Math.max(score / 100, 0), 1);
}

export default function ConfidenceMeter({ score = 50, riskLevel, confidence }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 1200;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * score));
      if (t < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (getGradientOffset(animatedScore) * circumference);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex flex-col items-center">
        <div className="relative h-48 w-48">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="var(--border)"
              strokeWidth="10"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={colors.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tabular-nums" style={{ color: colors.text }}>
              {animatedScore}
            </span>
            <span className="text-xs font-medium text-[var(--muted-foreground)]">out of 100</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          {riskLevel && (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${riskLevel.bg} ${riskLevel.color}`}>
              {riskLevel.label}
            </span>
          )}
          {confidence !== undefined && (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Confidence: {confidence}%
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
          Authentic
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
          Uncertain
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
          AI-Likely
        </span>
      </div>
    </div>
  );
}
