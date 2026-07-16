"use client";

import {
  Shield,
  MapPin,
  User,
  Copyright,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
} from "lucide-react";

const RISK_STYLES = {
  high: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-500",
    badge: "bg-red-100 text-red-700",
    darkBg: "dark:bg-red-950/30",
    darkBorder: "dark:border-red-800/40",
    darkBadge: "dark:bg-red-900/40 dark:text-red-300",
  },
  medium: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
    darkBg: "dark:bg-amber-950/30",
    darkBorder: "dark:border-amber-800/40",
    darkBadge: "dark:bg-amber-900/40 dark:text-amber-300",
  },
  low: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-500",
    badge: "bg-blue-100 text-blue-700",
    darkBg: "dark:bg-blue-950/30",
    darkBorder: "dark:border-blue-800/40",
    darkBadge: "dark:bg-blue-900/40 dark:text-blue-300",
  },
  info: {
    bg: "bg-[var(--muted)]",
    border: "border-[var(--border)]",
    icon: "text-[var(--muted-foreground)]",
    badge: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    darkBg: "",
    darkBorder: "",
    darkBadge: "",
  },
};

const CONCERN_ICONS = {
  "GPS Location": MapPin,
  "Author Name": User,
  "Copyright Notice": Copyright,
  "Software Info": Monitor,
  "Combined Personal Info": AlertTriangle,
};

export default function PrivacyAnalysis({ analysis }) {
  if (!analysis) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center text-sm text-[var(--muted-foreground)]">
        Upload an image to analyze its privacy exposure.
      </div>
    );
  }

  const hasRisks = analysis.risks && analysis.risks.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--muted)]">
          <Shield className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Privacy Summary
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            {hasRisks
              ? `${analysis.risks.length} potential concern${analysis.risks.length > 1 ? "s" : ""} detected`
              : "No privacy concerns detected"}
          </p>
        </div>
      </div>

      {hasRisks ? (
        <div className="space-y-3">
          {analysis.risks.map((risk, index) => {
            const styles = RISK_STYLES[risk.level] || RISK_STYLES.info;
            const ConcernIcon = CONCERN_ICONS[risk.label] || AlertTriangle;

            return (
              <div
                key={`${risk.label}-${index}`}
                className={`rounded-lg border p-4 ${styles.bg} ${styles.border} ${styles.darkBg} ${styles.darkBorder}`}
              >
                <div className="flex items-start gap-3">
                  <ConcernIcon className={`h-5 w-5 shrink-0 mt-0.5 ${styles.icon}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {risk.label}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles.badge} ${styles.darkBadge}`}
                      >
                        {risk.level.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                      {risk.detail}
                    </p>
                  </div>
                  {risk.level === "high" ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  ) : risk.level === "low" || risk.level === "info" ? (
                    <Info className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800/40 dark:bg-green-950/30">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
            This image appears safe to share with minimal metadata exposure.
          </p>
        </div>
      )}

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 shrink-0 text-[var(--primary)]" />
            <span className="text-sm font-semibold text-[var(--foreground)]">
              Recommendations
            </span>
          </div>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted-foreground)]"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
