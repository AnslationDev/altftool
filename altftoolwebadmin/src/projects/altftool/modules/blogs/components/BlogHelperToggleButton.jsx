"use client";

import { Check, CheckCircle2, X } from "lucide-react";

export default function BlogHelperToggleButton({
  icon: Icon,
  label,
  caption,
  attached = false,
  onToggle,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={attached}
      aria-label={attached ? `Remove ${label}` : `Add ${label}`}
      title={attached ? `Remove "${label}" from this post` : `Add "${label}" to this post`}
      className={`group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        attached
          ? "border-primary bg-primary-soft shadow-sm"
          : "border-border bg-surface-soft/70 hover:border-primary hover:bg-primary-soft"
      } ${className}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition-colors duration-200 ${
          attached ? "bg-primary text-white" : "bg-surface text-primary"
        }`}
      >
        {attached ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`block truncate text-sm font-semibold transition-colors duration-200 ${
              attached ? "text-primary" : "text-foreground group-hover:text-primary"
            }`}
          >
            {label}
          </span>
          {attached && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              <CheckCircle2 className="h-3 w-3" />
              Added
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-muted">{caption}</span>
        {attached && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-danger opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            <X className="h-3 w-3" />
            Click to remove
          </span>
        )}
      </span>
    </button>
  );
}
