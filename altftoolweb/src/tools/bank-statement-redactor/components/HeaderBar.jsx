"use client";

import {
  Activity,
  FileLock2,
  Landmark,
  LockKeyhole,
  Redo2,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Undo2,
} from "lucide-react";

export default function HeaderBar({
  sourceInfo,
  privacyScore,
  totalRedactions,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenSearch,
  onOpenAssistant,
  onResetWorkspace,
}) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      {/* Background Subtle Gradient & Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[var(--primary-soft)] opacity-40 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Branding & Hero Description */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)] shadow-xs">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Enterprise Document Privacy
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--success)] bg-[var(--success-soft)] px-3 py-1 text-xs font-bold text-[var(--success)]">
              <LockKeyhole className="size-3.5" aria-hidden="true" />
              100% Client-Side Processing
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
              <FileLock2 className="size-3.5 text-[var(--primary)]" aria-hidden="true" />
              Zero Network Activity
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">
              <Landmark className="size-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Bank Statement Redactor
            </h1>
          </div>

          <p className="max-w-2xl text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-sm">
            Best-in-class local document privacy studio. Automatically identify and permanently flatten account numbers, IBANs, IFSC codes, card numbers, UPI references, transactions, and balances before sharing.
          </p>
        </div>

        {/* Right Quick Controls & Privacy Meter */}
        <div className="flex flex-wrap items-center gap-3">
          {sourceInfo && (
            <>
              {/* Privacy Score Gauge Badge */}
              <div
                className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2 text-xs font-extrabold shadow-xs transition-all ${
                  privacyScore.score >= 90
                    ? "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]"
                    : privacyScore.score >= 60
                    ? "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--warning)]"
                    : "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                <Activity className="size-4 animate-pulse" aria-hidden="true" />
                <span>Privacy Score: {privacyScore.score}%</span>
              </div>

              {/* Undo / Redo Control Segment */}
              <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={onUndo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                  aria-label="Undo action"
                  className="rounded-lg p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-30"
                >
                  <Undo2 className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onRedo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                  aria-label="Redo action"
                  className="rounded-lg p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-30"
                >
                  <Redo2 className="size-4" aria-hidden="true" />
                </button>
              </div>

              {/* Search Toggle Button */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 text-xs font-bold text-[var(--foreground)] shadow-2xs transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
              >
                <Search className="size-4 text-[var(--primary)]" aria-hidden="true" />
                <span>Search Text</span>
              </button>

              {/* AI Assistant Button */}
              <button
                type="button"
                onClick={onOpenAssistant}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--primary-soft)] px-4 text-xs font-bold text-[var(--primary)] shadow-2xs transition-all hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                <span>AI Risk Radar</span>
              </button>

              {/* Start Over */}
              <button
                type="button"
                onClick={onResetWorkspace}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 text-xs font-bold text-[var(--foreground)] shadow-2xs transition-all hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] hover:border-[var(--danger)]"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
