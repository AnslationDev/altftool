"use client";

import {
  Activity,
  Cpu,
  FileLock2,
  Gauge,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function HeaderHero({
  hasResult,
  onAutoDetect,
  onResetWorkspace,
}) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      {/* Background Subtle Gradient & Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[var(--primary-soft)] opacity-40 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Branding & Description */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)] shadow-xs">
              <Cpu className="size-3.5" aria-hidden="true" />
              Local AI Diagnostics Engine
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--success)] bg-[var(--success-soft)] px-3 py-1 text-xs font-bold text-[var(--success)]">
              <LockKeyhole className="size-3.5" aria-hidden="true" />
              100% Client-Side Assessment
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
              <FileLock2 className="size-3.5 text-[var(--primary)]" aria-hidden="true" />
              Zero Server Upload / No Tracking
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">
              <Gauge className="size-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Local AI Readiness Checker
            </h1>
          </div>

          <p className="max-w-2xl text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-sm">
            Evaluate your device&apos;s RAM, CPU, GPU acceleration, WebGPU capabilities, and Wasm support against local LLM workload profiles. Discover compatible open-weight models (Llama 3, DeepSeek, Qwen, Gemma) and execution runtimes (Ollama, LM Studio, WebLLM).
          </p>
        </div>

        {/* Right Hero Action Triggers */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onAutoDetect}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--primary-soft)] px-4 text-xs font-bold text-[var(--primary)] shadow-2xs transition-all hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
          >
            <Zap className="size-4" aria-hidden="true" />
            <span>Auto-Detect Browser &amp; Specs</span>
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
