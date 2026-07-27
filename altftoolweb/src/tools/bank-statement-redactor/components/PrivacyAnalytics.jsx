"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function PrivacyAnalytics({
  privacyScore,
  onApplyAdvice,
}) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
              Privacy &amp; Document Risk Dashboard
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Real-time local privacy scoring and vulnerability evaluation
            </p>
          </div>
        </div>

        {/* Score Gauge Display */}
        <div className="flex items-center gap-3.5">
          <div className="text-right">
            <span className="block text-xs font-bold text-[var(--muted-foreground)]">
              Privacy Score
            </span>
            <span
              className={`text-2xl font-black ${
                privacyScore.score >= 90
                  ? "text-[var(--success)]"
                  : privacyScore.score >= 60
                  ? "text-[var(--warning)]"
                  : "text-[var(--danger)]"
              }`}
            >
              {privacyScore.score}%
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
                className={`stroke-current transition-all duration-500 ${
                  privacyScore.score >= 90
                    ? "text-[var(--success)]"
                    : privacyScore.score >= 60
                    ? "text-[var(--warning)]"
                    : "text-[var(--danger)]"
                }`}
                strokeDasharray={`${privacyScore.score}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Risk Metrics Cards */}
      <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger-soft)]/20 p-4">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--danger)]">
            <Flame className="size-4" /> High Risk Exposed
          </span>
          <span className="mt-2 block text-2xl font-black text-[var(--foreground)]">
            {privacyScore.highRiskCount}
          </span>
          <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
            Account #, Cards, PAN, Aadhaar
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning-soft)]/20 p-4">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--warning)]">
            <AlertTriangle className="size-4" /> Medium Risk
          </span>
          <span className="mt-2 block text-2xl font-black text-[var(--foreground)]">
            {privacyScore.medRiskCount}
          </span>
          <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
            Balances, UPI, Phone, DOB
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted-foreground)]">
            <Info className="size-4 text-[var(--primary)]" /> Low Risk
          </span>
          <span className="mt-2 block text-2xl font-black text-[var(--foreground)]">
            {privacyScore.lowRiskCount}
          </span>
          <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
            Email, Addresses, Dates
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--success)]/30 bg-[var(--success-soft)]/20 p-4">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--success)]">
            <CheckCircle2 className="size-4" /> Masks Applied
          </span>
          <span className="mt-2 block text-2xl font-black text-[var(--foreground)]">
            {privacyScore.totalRedacted}
          </span>
          <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
            Total active redaction masks
          </span>
        </div>
      </div>

      {/* AI Assistant Security Recommendations */}
      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4.5 text-[var(--primary)]" />
          <h3 className="text-xs font-extrabold text-[var(--foreground)]">
            AI Assistant Risk Recommendations
          </h3>
        </div>

        <div className="mt-3 space-y-2">
          {privacyScore.advice.map((msg, idx) => (
            <p key={`advice-${idx}`} className="text-xs font-medium leading-relaxed text-[var(--foreground)]">
              {msg}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
