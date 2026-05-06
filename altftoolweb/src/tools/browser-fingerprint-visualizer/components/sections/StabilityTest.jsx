"use client";


import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";
import { InfoRow } from "../ui/InfoRow";
import { ProgressBar } from "../ui/ProgressBar";

export function StabilityTest({ stability, loading }) {
  // Config per status type
  const statusConfig = {
    "first-visit": {
      icon: "💾",
      title: "Fingerprint Saved",
      color: "text-[var(--primary)]",
      bg: "bg-[var(--primary)]/10 border-[var(--primary)]/20",
    },
    stable: {
      icon: "🔒",
      title: "Stable — You Are Reliably Trackable",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
    unstable: {
      icon: "🔀",
      title: "Unstable — Fingerprint Is Changing",
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    blocked: {
      icon: "⛔",
      title: "Session Storage Blocked",
      color: "text-[var(--muted-foreground)]",
      bg: "bg-[var(--muted)] border-[var(--border)]",
    },
    pending: {
      icon: "⏳",
      title: "Collecting Fingerprint...",
      color: "text-[var(--muted-foreground)]",
      bg: "bg-[var(--muted)] border-[var(--border)]",
    },
  };

  const config = statusConfig[stability?.status] || statusConfig.pending;

  return (
    <Card>
      <SectionHeader
        icon="🔄"
        title="Fingerprint Stability"
        description="Does your fingerprint stay the same across page reloads?"
      />

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-20 bg-[var(--muted)] rounded-xl animate-pulse" />
          <div className="h-9 bg-[var(--muted)] rounded-lg animate-pulse" />
        </div>

      ) : (
        <div>
          {/* Status card */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} mb-4`}>
            <span className="text-2xl flex-shrink-0 mt-0.5">{config.icon}</span>
            <div>
              <p className={`text-sm font-semibold font-primary ${config.color}`}>
                {config.title}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] font-secondary mt-1 leading-relaxed">
                {stability?.message}
              </p>
            </div>
          </div>

          {/* Stats — only show after first reload */}
          {stability?.totalChecks > 1 && (
            <div className="mb-4">
              <InfoRow label="Reload Checks"   value={stability.totalChecks} />
              <InfoRow label="Stable Matches"  value={stability.matchCount} />
              <InfoRow
                label="Stability Score"
                value={`${stability.stabilityScore}%`}
                highlight
              />
              <div className="mt-2">
                <ProgressBar
                  value={stability.stabilityScore}
                  max={100}
                  height="md"
                  colorMode="risk"
                  animated
                />
              </div>
            </div>
          )}

          {/* How to test instruction */}
          <div className="p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
            <p className="text-[10px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
              💡 <strong className="text-[var(--foreground)]">How to test:</strong> Reload
              this page (Ctrl+R / Cmd+R) and come back to this card. We&apos;ll compare your
              fingerprint hash between visits and tell you if you&apos;re consistently trackable.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}