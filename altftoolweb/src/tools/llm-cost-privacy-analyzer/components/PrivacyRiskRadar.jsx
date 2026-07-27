"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Info,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function PrivacyRiskRadar({
  result,
}) {
  if (!result) return null;

  const totalSignals = result.privacySignalCount;
  const isHighRisk = totalSignals >= 10;
  const isMedRisk = totalSignals > 0 && totalSignals < 10;

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
              Privacy Signal &amp; Credential Leak Audit
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Scanned prompt and message content for personal data and secret patterns locally
            </p>
          </div>
        </div>

        {/* Risk Badge */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black shadow-xs ${
              totalSignals === 0
                ? "border border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]"
                : isHighRisk
                ? "border border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
                : "border border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            {totalSignals === 0 ? (
              <>
                <CheckCircle2 className="size-4" /> 0 Signals Detected (Clean)
              </>
            ) : (
              <>
                <ShieldAlert className="size-4" /> {totalSignals} Signal(s) Detected ({isHighRisk ? "High Risk" : "Medium Risk"})
              </>
            )}
          </span>
        </div>
      </div>

      {/* Signal Types Grid */}
      <div className="mt-5">
        {result.privacySignals.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.privacySignals.map((signal) => (
              <div
                key={signal.type}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 shadow-2xs transition-all hover:border-[var(--border-strong)]"
              >
                <div>
                  <span className="block text-xs font-extrabold text-[var(--foreground)]">
                    {signal.label}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                    Pattern: {signal.type}
                  </span>
                </div>

                <span className="inline-flex size-8 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xs font-black text-[var(--primary)]">
                  {signal.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--success)]/40 bg-[var(--success-soft)]/20 p-6 text-center text-xs font-semibold text-[var(--foreground)]">
            <CheckCircle2 className="mx-auto size-8 text-[var(--success)] opacity-90" />
            <p className="mt-2 text-sm font-bold">Zero Privacy Signals Detected</p>
            <p className="mt-0.5 text-[var(--muted-foreground)]">
              No configured PII or secret patterns matched the scanned prompt-like fields in this usage log.
            </p>
          </div>
        )}
      </div>

      {/* Security Checklist & Caution */}
      <div className="mt-5 rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning-soft)]/20 p-4 text-xs font-semibold leading-relaxed text-[var(--foreground)]">
        🔒 <strong>Local Privacy Guarantee:</strong> All signal scans occur strictly in your browser memory. Signal counts indicate pattern matches and do not prove data loss or leak. Treat matches as audit cues.
      </div>
    </section>
  );
}
