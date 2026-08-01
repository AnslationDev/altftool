"use client";

export function Header({ progress = 0, currentStep = "", loading = false }) {
  if (!loading) return null;

  const pct = Math.min(100, Math.max(0, Number(progress) || 0));

  return (
    <header
      role="status"
      aria-live="polite"
      className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]/95 px-4 py-3 backdrop-blur"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="truncate text-xs font-medium text-[var(--muted-foreground)] font-secondary">
            {currentStep || "Collecting fingerprint..."}
          </span>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-[var(--foreground)]">
            {Math.round(pct)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </header>
  );
}
