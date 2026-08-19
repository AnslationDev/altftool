"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Gauge,
  HardDrive,
  Info,
  MemoryStick,
  XCircle,
} from "lucide-react";

const STATUS_META = {
  "meets-thresholds": {
    label: "Meets All Thresholds",
    icon: CheckCircle2,
    className: "border-[var(--success)]/40 bg-[var(--success-soft)]/20",
    badgeClass: "bg-[var(--success-soft)] text-[var(--success)]",
  },
  "close-to-thresholds": {
    label: "Close to Thresholds",
    icon: AlertTriangle,
    className: "border-[var(--warning)]/40 bg-[var(--warning-soft)]/20",
    badgeClass: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  "below-thresholds": {
    label: "Below Thresholds",
    icon: XCircle,
    className: "border-[var(--danger)]/40 bg-[var(--danger-soft)]/20",
    badgeClass: "bg-[var(--danger-soft)] text-[var(--danger)]",
  },
};

export default function WorkloadAssessmentCards({
  assessments = [],
}) {
  if (!assessments.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
            Workload Threshold Assessments
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Detailed breakdown comparing your specs against illustrative local AI profiles
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {assessments.map((item) => {
          const meta = STATUS_META[item.status] || STATUS_META["below-thresholds"];
          const StatusIcon = meta.icon;

          return (
            <article
              key={item.id}
              className={`flex flex-col justify-between rounded-3xl border p-6 shadow-sm transition-all ${meta.className}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3.5">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="size-5 shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="text-base font-bold text-[var(--foreground)]">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold shrink-0 ${meta.badgeClass}`}>
                    {meta.label}
                  </span>
                </div>

                {/* Gaps List */}
                {item.gaps.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <span className="block text-xs font-extrabold text-[var(--danger)]">
                      Input Shortfalls:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[var(--foreground)]">
                      {item.gaps.map((gap) => (
                        <li key={gap.field} className="flex items-start gap-2">
                          <span className="text-[var(--danger)]">•</span>
                          <span>
                            {gap.field === "acceleration"
                              ? `Hardware GPU acceleration was ${gap.available}.`
                              : `${gap.label}: ${gap.available} ${gap.unit} available; ${gap.required} ${gap.unit} required.`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[var(--success)]">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Every entered specification meets or exceeds this profile&apos;s planning thresholds.</span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
