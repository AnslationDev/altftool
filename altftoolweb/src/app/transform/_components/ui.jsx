"use client";

/**
 * Small shared UI atoms for the Transform shell. Styled with the platform's
 * semantic tokens (primary/surface/border/muted) so the section follows the
 * same teal/cyan theme and light+dark contract as the rest of AltFTool.
 */

export function GhostButton({ icon: Icon, label, onClick, disabled, title, className = "" }) {
  return (
    <button
      type="button"
      title={title || label}
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-border-strong hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label ? <span className="whitespace-nowrap">{label}</span> : null}
    </button>
  );
}
