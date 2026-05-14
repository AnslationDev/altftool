"use client";

import { AlertTriangle, CheckCircle2, CloudOff, RefreshCcw } from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const toneStyles = {
  info: "border-(--primary)/20 bg-(--primary)/8 text-(--foreground)",
  success: "border-emerald-500/20 bg-emerald-500/10 text-(--foreground)",
  warning: "border-amber-500/25 bg-amber-500/10 text-(--foreground)",
  danger: "border-red-500/25 bg-red-500/10 text-(--foreground)",
};

const toneIcons = {
  info: CloudOff,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
};

export default function DataStateNotice({
  title,
  message,
  tone = "warning",
  actionLabel,
  onAction,
  compact = false,
  className = "",
}) {
  if (!title && !message) return null;

  const Icon = toneIcons[tone] || AlertTriangle;

  return (
    <div
      className={cx(
        "flex flex-col gap-3 rounded-[var(--anslation-ds-radius-lg)] border px-4 py-3 shadow-[var(--anslation-ds-shadow-sm)] sm:flex-row sm:items-center sm:justify-between",
        toneStyles[tone] || toneStyles.warning,
        compact ? "text-sm" : "",
        className,
      )}
      role={tone === "danger" ? "alert" : "status"}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-(--background)/75 text-(--primary)">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          {title ? <p className="font-semibold leading-5">{title}</p> : null}
          {message ? (
            <p className="mt-1 text-sm leading-6 text-(--muted-foreground)">
              {message}
            </p>
          ) : null}
        </div>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
