"use client";

/**
 * Small shared UI atoms for the Transform shell. Styling matches the rest of
 * the developer tools (slate/blue palette, rounded, dark-mode aware).
 */

export function GhostButton({ icon: Icon, label, onClick, disabled, title, className = "" }) {
  return (
    <button
      type="button"
      title={title || label}
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 ${className}`}
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label ? <span className="whitespace-nowrap">{label}</span> : null}
    </button>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 ${className}`}
    >
      {children}
    </span>
  );
}
