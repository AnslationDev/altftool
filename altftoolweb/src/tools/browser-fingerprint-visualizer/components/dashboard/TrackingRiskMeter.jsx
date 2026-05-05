"use client";

/**
 * TrackingRiskMeter.jsx
 * Visual risk score meter — one of the most impactful UI elements.
 *
 * Design:
 * - Large animated progress bar (green → yellow → red)
 * - Score number counts up on mount
 * - Risk level badge
 * - Score breakdown per signal
 */

import { useEffect, useState } from "react";
import { SegmentedBar, ProgressBar } from "../ui/ProgressBar";
import { RiskBadge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";

export function TrackingRiskMeter({ riskScore, loading }) {
  // Animate the score number counting up
  const [displayScore, setDisplayScore] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (!riskScore) return;
    const target = riskScore.score;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplayScore(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [riskScore]);

  const getRiskColor = (score) => {
    if (score < 30) return "text-emerald-500";
    if (score < 70) return "text-amber-400";
    return "text-rose-500";
  };

  // Map breakdown for segmented bar
  const breakdownSegments =
    riskScore?.breakdown?.map((b) => ({
      label: b.name,
      value: b.score,
      max: b.max,
      color:
        b.score === 0
          ? "bg-[var(--muted-foreground)]/30"
          : b.score >= b.max * 0.7
            ? "bg-rose-500"
            : b.score >= b.max * 0.4
              ? "bg-amber-400"
              : "bg-emerald-500",
    })) || [];

  return (
    <Card
      accent={
        riskScore?.level === "High"
          ? "red"
          : riskScore?.level === "Medium"
            ? "yellow"
            : "green"
      }
      loading={loading}
    >
      <SectionHeader
        icon="🎯"
        title="Tracking Risk Score"
        subtitle="How uniquely identifiable is your browser?"
        action={riskScore && <RiskBadge level={riskScore.level} />}
      />

      {/* Main score display */}
      <div className="flex items-end gap-4 mb-5">
        <div
          className={`font-primary font-black tabular-nums leading-none ${getRiskColor(displayScore)}`}
          style={{ fontSize: "clamp(3rem, 8vw, 5rem)" }}
        >
          {displayScore}
        </div>
        <div className="pb-2">
          <span className="text-2xl font-bold text-[var(--muted-foreground)]">
            /100
          </span>
        </div>
      </div>

      {/* Animated progress bar */}
      <ProgressBar
        value={riskScore?.score || 0}
        height="lg"
        showLabel={false}
        showPercent={false}
        className="mb-4"
      />

      {/* Risk zones legend */}
      <div className="flex items-center gap-1 mb-4 text-[10px] text-[var(--muted-foreground)]">
        <span className="flex-1 text-center text-emerald-500 font-medium">
          Low (0–30)
        </span>
        <span className="flex-1 text-center text-amber-400 font-medium">
          Medium (30–70)
        </span>
        <span className="flex-1 text-center text-rose-500 font-medium">
          High (70–100)
        </span>
      </div>

      {/* Description */}
      {riskScore?.description && (
        <p className="text-xs text-[var(--muted-foreground)] font-secondary leading-relaxed mb-4 p-3 bg-[var(--muted)]/60 rounded-xl">
          {riskScore.description}
        </p>
      )}

      {/* Breakdown toggle */}
      <button
        onClick={() => setShowBreakdown((p) => !p)}
        className="
          w-full text-xs text-[var(--primary)] font-medium
          flex items-center gap-1.5 justify-center py-2
          hover:underline transition-colors duration-200
        "
      >
        {showBreakdown ? "Hide" : "Show"} score breakdown
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-300 ${showBreakdown ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Segmented breakdown */}
      <div
        className={`overflow-hidden transition-all duration-300 ${showBreakdown ? "max-h-96 mt-4" : "max-h-0"}`}
      >
        <SegmentedBar segments={breakdownSegments} />
      </div>
    </Card>
  );
}
