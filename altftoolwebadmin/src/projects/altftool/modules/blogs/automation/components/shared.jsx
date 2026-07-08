"use client";

// Small shared UI atoms for the Automation hub (tokens only — master.md).

export const STATUS_TONES = {
  pending: "bg-info-soft text-info",
  generating: "bg-warning-soft text-warning",
  done: "bg-success-soft text-success",
  applied: "bg-success-soft text-success",
  failed: "bg-danger-soft text-danger",
  error: "bg-danger-soft text-danger",
  rejected: "bg-danger-soft text-danger",
  suggested: "bg-primary-soft text-primary",
  running: "bg-warning-soft text-warning",
};

export function StatusChip({ status }) {
  const tone = STATUS_TONES[status] || "bg-surface-soft text-muted";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${tone}`}>
      {String(status || "—").replace(/_/g, " ")}
    </span>
  );
}

export function PanelCard({ title, caption, actions, children }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {caption ? <p className="mt-0.5 text-xs leading-5 text-muted">{caption}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-soft/60 px-4 py-8 text-center text-sm text-muted">
      {message}
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, disabled, tone = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold transition hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${tone || "text-foreground"}`}
    >
      {children}
    </button>
  );
}

export function formatWhen(value) {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
