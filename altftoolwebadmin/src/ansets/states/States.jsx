"use client";

import { useState } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@altftool/ui";

/**
 * The three states every data-backed admin screen needs, in one place.
 *
 * The audit found the same three bugs repeated across the console: fetches
 * whose failure branch rendered an EMPTY state (so a 401 looked like "no data"),
 * error screens with no retry affordance, and skeletons that looked nothing
 * like the layout they stood in for. Using these makes the right thing the
 * easy thing — an error can't silently render as "nothing here" because
 * ErrorState is a different component from EmptyState.
 */

/** Nothing to show, and that is a legitimate outcome. */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <Icon className="mb-3 h-8 w-8 text-[var(--muted)]" aria-hidden="true" />
      <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/**
 * Something failed. ALWAYS renders a way forward.
 *
 * @param {string}   [title]
 * @param {string}   [message]  Human-readable. Never pass a raw exception string.
 * @param {Function} [onRetry]  Omit only when a retry genuinely cannot help.
 * @param {ReactNode} [action]  Extra affordance beside Try again (e.g. Sign out).
 */
export function ErrorState({
  title = "Something went wrong",
  message = "This is usually temporary. Try again in a moment.",
  onRetry,
  action,
  className,
}) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-xl border border-[var(--danger)]/30 bg-[var(--surface)] px-6 py-10 text-center",
        className,
      )}
    >
      <AlertTriangle className="mb-3 h-8 w-8 text-[var(--danger)]" aria-hidden="true" />
      <p className="text-sm font-semibold text-[var(--danger-text)]">{title}</p>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--muted)]">{message}</p>

      {(onRetry || action) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {onRetry ? (
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <RefreshCw
                className={cn("h-4 w-4", retrying && "animate-spin motion-reduce:animate-none")}
                aria-hidden="true"
              />
              {retrying ? "Retrying…" : "Try again"}
            </button>
          ) : null}
          {action}
        </div>
      )}
    </div>
  );
}

/** A single shimmer bone. */
export function Bone({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-[var(--surface-soft)] motion-reduce:animate-none",
        className,
      )}
    />
  );
}

/**
 * Skeleton shaped like what is loading, so the page does not jump when data
 * lands. `variant` picks the shape; `rows` applies to table/list.
 *
 * @param {"table"|"cards"|"stats"|"detail"} [variant]
 */
export function LoadingState({ variant = "table", rows = 5, className }) {
  if (variant === "stats") {
    return (
      <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)} aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5"
          >
            <Bone className="h-3 w-20" />
            <Bone className="mt-2.5 h-7 w-14" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div
        className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
        aria-hidden="true"
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <Bone className="h-4 w-1/2" />
            <Bone className="mt-3 h-3 w-full" />
            <Bone className="mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("space-y-4", className)} aria-hidden="true">
        <Bone className="h-7 w-1/3" />
        <Bone className="h-4 w-2/3" />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <Bone className="h-4 w-full" />
          <Bone className="mt-3 h-4 w-5/6" />
          <Bone className="mt-3 h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]",
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Bone className="h-9 w-9 shrink-0 rounded-full" />
          <Bone className="h-4 flex-1" />
          <Bone className="hidden h-4 w-24 sm:block" />
          <Bone className="hidden h-4 w-16 sm:block" />
        </div>
      ))}
    </div>
  );
}

/**
 * Renders the right state for a resource, so callers stop re-deriving the
 * loading -> error -> empty -> data ladder (and stop getting it wrong).
 *
 * @param {string}    [errorTitle]  Forwarded to ErrorState's `title`. Without
 *   this, every screen's specific failure copy ("Couldn't load your tickets")
 *   collapsed to ErrorState's generic default the moment it went through
 *   DataState — which is what happened across the first ansets migration pass.
 * @param {ReactNode} [errorAction] Forwarded to ErrorState's `action` — e.g. a
 *   secondary "Back to X" link beside Try again.
 */
export function DataState({
  loading,
  error,
  isEmpty,
  onRetry,
  loadingVariant = "table",
  rows,
  empty,
  errorTitle,
  errorAction,
  children,
}) {
  if (loading) return <LoadingState variant={loadingVariant} rows={rows} />;
  if (error) {
    return (
      <ErrorState
        title={errorTitle}
        message={typeof error === "string" ? error : undefined}
        onRetry={onRetry}
        action={errorAction}
      />
    );
  }
  if (isEmpty) return empty ?? <EmptyState title="Nothing here yet" />;
  return children;
}
