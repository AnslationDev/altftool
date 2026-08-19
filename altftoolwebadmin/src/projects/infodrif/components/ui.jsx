"use client";

import { Loader2 } from "lucide-react";

/**
 * Shared admin chrome for the Infodrif modules.
 *
 * Everything here is built on the semantic token layer (`var(--surface)`,
 * `var(--foreground)`, `var(--primary)`, …) exactly like the admin shell
 * (AdminLayout / AdminSidebar / super-admin), so every screen themes itself in
 * light and dark from the same names. Do not reintroduce hardcoded
 * gray/emerald palettes here.
 */

export function PageHeader({ icon: Icon, title, description, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-sm)]">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
          {description ? (
            <p className="text-sm text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
      </div>
      {actions}
    </div>
  );
}

export function Panel({ eyebrow, title, actions, children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm ${className}`}
    >
      {eyebrow || title || actions ? (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {eyebrow ? (
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-1 text-base font-bold text-[var(--foreground)]">{title}</h2>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({ label, value, tone = "neutral" }) {
  const toneClass = {
    neutral: "bg-[var(--surface-soft)] text-[var(--foreground)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  }[tone];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

export function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-[var(--success-soft)] text-[var(--success)]"
          : "bg-[var(--surface-soft)] text-[var(--muted)]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]";

export const textareaClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]";

export function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--muted)]">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-[var(--danger)]">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-[var(--muted)]">{hint}</span>
      ) : null}
    </label>
  );
}

export function PrimaryButton({ loading = false, icon: Icon, children, className = "", ...rest }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[13px] font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--primary)_85%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      ) : null}
      {children}
    </button>
  );
}

export function SecondaryButton({ icon: Icon, children, className = "", ...rest }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-[13px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] disabled:opacity-60 ${className}`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={1.75} /> : null}
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, tone = "neutral", ...rest }) {
  const toneClass = {
    neutral: "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]",
    primary:
      "text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]",
    danger: "text-[var(--danger)] hover:bg-[var(--danger-soft)]",
  }[tone];

  return (
    <button
      type="button"
      {...rest}
      className={`rounded-lg p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] ${toneClass}`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

export function ModalShell({ eyebrow, title, onClose, onSubmit, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,6,23,0.55)] px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-bold text-[var(--foreground)]">{title}</h2>
          </div>
          <SecondaryButton onClick={onClose} className="h-8 px-3 text-xs">
            Close
          </SecondaryButton>
        </div>

        <div className="mt-5 space-y-4">{children}</div>

        <div className="mt-6 flex justify-end gap-2">{footer}</div>
      </form>
    </div>
  );
}

export function TableEmptyState({ icon: Icon, title, description, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <Icon className="mx-auto h-8 w-8 text-[var(--muted)] opacity-50" strokeWidth={1.5} />
        <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">{title}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
      </td>
    </tr>
  );
}

export function TableSkeletonRows({ rows = 4, colSpan }) {
  return Array.from({ length: rows }).map((_, index) => (
    <tr key={index}>
      <td colSpan={colSpan} className="px-4 py-3">
        <div className="h-9 animate-pulse rounded-lg bg-[var(--surface-soft)]" />
      </td>
    </tr>
  ));
}

/** Shared URL rule: a relative path, or an absolute http(s) URL. */
export function isSafeUrl(value = "") {
  const url = String(value).trim();
  // A leading "//" is protocol-relative: browsers resolve it to an
  // arbitrary external origin, so it must NOT be treated as a safe
  // same-site relative path.
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
