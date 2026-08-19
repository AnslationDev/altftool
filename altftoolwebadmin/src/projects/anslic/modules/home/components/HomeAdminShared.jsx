"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";

export const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus-visible:[box-shadow:var(--focus-ring)]";
export const textareaClass =
  "w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus-visible:[box-shadow:var(--focus-ring)]";

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-[var(--danger)]">{error}</span> : null}
    </label>
  );
}

export function ActionHeader({
  title,
  description,
  lastUpdated,
  active,
  dirty,
  saving,
  onSave,
  onReset,
  onToggleActive,
}) {
  return (
    <div className="sticky top-0 z-20 -mx-6 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/anslic/home"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)] hover:bg-[var(--surface-soft)]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
            <p className="text-sm text-[var(--muted)]">{description}</p>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Last updated: {lastUpdated}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
              dirty ? "bg-[var(--warning-soft)] text-[var(--warning)]" : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {dirty ? "Unsaved changes" : "Saved"}
          </span>
          {onToggleActive ? (
            <button
              type="button"
              onClick={onToggleActive}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                active
                  ? "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
              }`}
            >
              {active ? "Active" : "Inactive"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-soft)]"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Changes
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-[var(--success-soft)] text-[var(--success)] ring-1 ring-[var(--success)]/30"
          : "bg-[var(--surface-soft)] text-[var(--muted)] ring-1 ring-[var(--border)]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[var(--success)]" : "bg-[var(--muted)]"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function SimplePreview({ icon: Icon, eyebrow, title, subtitle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--surface-soft)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {eyebrow || "Eyebrow"}
      </span>
      <h2 className="mt-4 max-w-xl text-3xl font-black tracking-normal text-[var(--foreground)]">{title || "Title"}</h2>
      <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[var(--muted)]">{subtitle || "Subtitle copy"}</p>
    </div>
  );
}

export function formatDate(value) {
  const date = value?.toDate?.() || null;
  if (!date) return "Not saved yet";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date);
}
