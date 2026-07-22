"use client";

import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Target,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function Insights({ insights, checkIns }) {
  const trendIcon =
    insights.trend === "improving" ? TrendingUp : insights.trend === "declining" ? TrendingDown : Minus;
  const TrendIcon = trendIcon;

  const trendColor =
    insights.trend === "improving"
      ? "text-emerald-500"
      : insights.trend === "declining"
        ? "text-rose-500"
        : "text-[var(--muted-foreground)]";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            insights.trend === "improving"
              ? "bg-emerald-500/10 text-emerald-500"
              : insights.trend === "declining"
                ? "bg-rose-500/10 text-rose-500"
                : "bg-[var(--section-highlight)] text-[var(--primary)]"
          }`}>
            <TrendIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">Performance Trend</h3>
            <p className={`text-sm font-semibold capitalize ${trendColor}`}>
              {insights.trend === "insufficient" ? "Collecting data..." : insights.trend}
            </p>
          </div>
        </div>
      </div>

      {insights.strengths.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <h3 className="text-base font-bold text-[var(--foreground)]">Strengths</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {insights.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4">
                  <Sparkles className="h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {insights.improvements.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <h3 className="text-base font-bold text-[var(--foreground)]">Areas for Improvement</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {insights.improvements.map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-amber-500/10 p-4">
                  <Target className="h-5 w-5 shrink-0 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-600">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {insights.tips.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
            <Lightbulb className="h-5 w-5 shrink-0 text-blue-500" />
            <h3 className="text-base font-bold text-[var(--foreground)]">Recommendations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {insights.tips.map((t, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-blue-500/10 p-4">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {checkIns.length < 3 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center">
          <Lightbulb className="mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
          <h3 className="text-lg font-bold text-[var(--foreground)]">Not Enough Data</h3>
          <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
            Complete at least 3 daily check-ins to receive personalized cognitive performance insights and recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
