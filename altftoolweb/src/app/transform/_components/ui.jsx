"use client";

/**
 * Small shared UI atoms for the Transform shell. Styling follows master.md:
 * semantic tokens only, so light and dark come from the same class names.
 */

export function GhostButton({ icon: Icon, label, onClick, disabled, title, className = "" }) {
  return (
    <button
      type="button"
      title={title || label}
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--card) px-3.5 py-2 text-sm font-medium text-(--foreground) shadow-sm transition hover:border-(--border-strong) hover:bg-(--muted) disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label ? <span className="whitespace-nowrap">{label}</span> : null}
    </button>
  );
}

export function PrimaryButton({ icon: Icon, label, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-sm font-semibold text-(--primary-foreground) shadow-lg shadow-(--primary)/30 transition hover:bg-(--primary-hover) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label ? <span className="whitespace-nowrap">{label}</span> : null}
    </button>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--muted) px-2.5 py-0.5 text-xs font-semibold text-(--muted-foreground) ${className}`}
    >
      {children}
    </span>
  );
}
