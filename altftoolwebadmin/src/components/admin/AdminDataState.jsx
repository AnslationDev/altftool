"use client";

import { AlertTriangle, CheckCircle2, Database, Info, Loader2, RefreshCw } from "lucide-react";

const stateStyles = {
  loading: {
    icon: Loader2,
    iconClassName: "animate-spin text-gray-500",
    border: "border-gray-200",
    background: "bg-white",
    title: "text-gray-900",
    message: "text-gray-600",
  },
  empty: {
    icon: Database,
    iconClassName: "text-gray-500",
    border: "border-dashed border-gray-300",
    background: "bg-white",
    title: "text-gray-900",
    message: "text-gray-600",
  },
  error: {
    icon: AlertTriangle,
    iconClassName: "text-amber-600",
    border: "border-amber-200",
    background: "bg-amber-50",
    title: "text-amber-950",
    message: "text-amber-800",
  },
  success: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-600",
    border: "border-emerald-200",
    background: "bg-emerald-50",
    title: "text-emerald-950",
    message: "text-emerald-800",
  },
  info: {
    icon: Info,
    iconClassName: "text-sky-600",
    border: "border-sky-200",
    background: "bg-sky-50",
    title: "text-sky-950",
    message: "text-sky-800",
  },
};

export default function AdminDataState({
  type = "loading",
  tone,
  title,
  message,
  meta,
  actionLabel = "Retry",
  onRetry,
  actions = [],
  icon: CustomIcon,
  compact = false,
  className = "",
  ariaLive,
  children,
}) {
  const state = stateStyles[tone] || stateStyles[type] || stateStyles.loading;
  const Icon = CustomIcon || state.icon;
  const visibleActions = [
    ...actions,
    ...(onRetry
      ? [
          {
            label: actionLabel,
            onClick: onRetry,
            icon: RefreshCw,
          },
        ]
      : []),
  ];

  return (
    <div
      className={`rounded-2xl ${state.border} ${state.background} border shadow-sm ${
        compact ? "p-4" : "p-6"
      } ${className}`}
      aria-live={ariaLive || (type === "error" ? "assertive" : "polite")}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`grid shrink-0 place-items-center rounded-xl border border-white/70 bg-white shadow-sm ${
              compact ? "h-9 w-9" : "h-11 w-11"
            }`}
          >
            <Icon className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${state.iconClassName}`} />
          </div>
          <div className="min-w-0">
            {meta ? (
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{meta}</p>
            ) : null}
            <h2 className={`text-base font-semibold ${state.title}`}>{title}</h2>
            {message ? (
              <p className={`mt-1 max-w-2xl text-sm leading-6 ${state.message}`}>{message}</p>
            ) : null}
          </div>
        </div>

        {visibleActions.length ? (
          <div className="flex flex-wrap gap-2 md:justify-end">
            {visibleActions.map((action) => {
              const ActionIcon = action.icon;

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    action.variant === "primary"
                      ? "border-gray-950 bg-gray-950 text-white hover:bg-gray-800"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
                  {action.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

export function AdminDataSkeleton({ rows = 5, columns = 1, showHeader = false, compact = false }) {
  const columnClass = columns >= 3 ? "sm:grid-cols-2 xl:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "";

  return (
    <div className="grid gap-3">
      {showHeader ? (
        <div className="mb-1 flex items-center justify-between gap-4">
          <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
        </div>
      ) : null}
      <div className={`grid gap-3 ${columnClass}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className={`${compact ? "h-9" : "h-12"} animate-pulse rounded-xl bg-gray-100`} />
        ))}
      </div>
    </div>
  );
}
