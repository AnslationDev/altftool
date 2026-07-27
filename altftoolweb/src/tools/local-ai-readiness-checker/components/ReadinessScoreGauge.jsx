"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";

export default function ReadinessScoreGauge({
  result,
}) {
  if (!result || !result.ok) return null;

  const { counts } = result;
  const total = counts.assessed || 1;
  const score = Math.round(
    ((counts.meetsThresholds * 100 + counts.closeToThresholds * 50) / (total * 100)) * 100,
  );

  let ratingLabel = "Excellent";
  let ratingColor = "text-[var(--success)]";
  let ratingBg = "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]";

  if (score < 40 || counts.belowThresholds > counts.meetsThresholds) {
    ratingLabel = "Limited";
    ratingColor = "text-[var(--danger)]";
    ratingBg = "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]";
  } else if (score < 75) {
    ratingLabel = "Average / Good";
    ratingColor = "text-[var(--warning)]";
    ratingBg = "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--warning)]";
  }

  const statCards = [
    {
      label: "Workload Profiles Checked",
      value: counts.assessed,
      icon: Gauge,
      color: "text-[var(--primary)]",
      bg: "bg-[var(--primary-soft)]",
    },
    {
      label: "Meets Thresholds",
      value: counts.meetsThresholds,
      icon: CheckCircle2,
      color: "text-[var(--success)]",
      bg: "bg-[var(--success-soft)]",
    },
    {
      label: "Close to Thresholds",
      value: counts.closeToThresholds,
      icon: AlertTriangle,
      color: "text-[var(--warning)]",
      bg: "bg-[var(--warning-soft)]",
    },
    {
      label: "Below Thresholds",
      value: counts.belowThresholds,
      icon: XCircle,
      color: counts.belowThresholds > 0 ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]",
      bg: counts.belowThresholds > 0 ? "bg-[var(--danger-soft)]" : "bg-[var(--surface-soft)]",
    },
  ];

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <Gauge className="size-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
              Local AI Hardware Readiness Index
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Overall calculated compatibility rating based on entered hardware parameters
            </p>
          </div>
        </div>

        {/* Readiness Rating & Score */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-xs font-bold text-[var(--muted-foreground)]">
              Readiness Rating
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-black shadow-xs ${ratingBg}`}>
              <ShieldCheck className="size-3.5" />
              {ratingLabel}
            </span>
          </div>

          <div className="relative size-14">
            <svg className="size-14 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[var(--surface-soft)] stroke-current"
                strokeWidth="4"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`stroke-current transition-all duration-500 ${ratingColor}`}
                strokeDasharray={`${score}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 shadow-2xs transition-all hover:border-[var(--border-strong)]"
            >
              <div>
                <span className="block text-xs font-bold uppercase text-[var(--muted-foreground)]">
                  {card.label}
                </span>
                <span className="mt-1 block text-2xl font-black text-[var(--foreground)]">
                  {card.value}
                </span>
              </div>

              <div className={`flex size-10 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="size-5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
