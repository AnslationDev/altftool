"use client";

import {
  Activity,
  Coins,
  FileCode,
  FileLock2,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function HeaderHero({
  hasResult,
  privacySignalCount = 0,
  onLoadSample,
  onResetWorkspace,
}) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      {/* Background Glow Effect */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[var(--primary-soft)] opacity-40 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Branding & Hero Details */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)] shadow-xs">
              <Coins className="size-3.5" aria-hidden="true" />
              LLM Cost &amp; Token Intelligence
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--success)] bg-[var(--success-soft)] px-3 py-1 text-xs font-bold text-[var(--success)]">
              <LockKeyhole className="size-3.5" aria-hidden="true" />
              100% Browser Processing
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
              <FileLock2 className="size-3.5 text-[var(--primary)]" aria-hidden="true" />
              Zero Telemetry / No Upload
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">
              <Sparkles className="size-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
              LLM Cost &amp; Privacy Analyzer
            </h1>
          </div>

          <p className="max-w-2xl text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-sm">
            Analyze AI model token logs locally with user-defined rate tables. Instantly calculate model costs, audit token efficiency, and detect sensitive data or API key leakage without sending data to any external server.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">Supported Log Formats:</span>
            <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 font-mono text-[11px]">JSON Array</span>
            <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 font-mono text-[11px]">JSONL</span>
            <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 font-mono text-[11px]">CSV</span>
            <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 font-mono text-[11px]">TSV</span>
          </div>
        </div>

        {/* Right Hero Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--primary-soft)] px-4 text-xs font-bold text-[var(--primary)] shadow-2xs transition-all hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
          >
            <FileCode className="size-4" aria-hidden="true" />
            <span>Load Safe Example Log</span>
          </button>

          {hasResult && (
            <button
              type="button"
              onClick={onResetWorkspace}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 text-xs font-bold text-[var(--foreground)] shadow-2xs transition-all hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] hover:border-[var(--danger)]"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
