"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Image as ImageIcon, Loader2, RefreshCw, Save, Upload } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

/**
 * Shared primitives for the Infodrif partners module.
 *
 * Everything here is built on the semantic design tokens from master.md
 * (`--surface`, `--border`, `bg-primary`, `text-foreground`, …) so the pages
 * theme correctly in light *and* dark. Do not reintroduce hardcoded
 * `bg-white` / `bg-gray-50` / `text-gray-900` values.
 */

export const inputClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";

export const textareaClass =
  "w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";

export const selectClass =
  "h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:shadow-[var(--focus-ring)]";

export const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:opacity-90 disabled:opacity-60";

export const outlineButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground disabled:opacity-60";

export const cardClass =
  "rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]";

export const eyebrowClass =
  "text-xs font-semibold uppercase tracking-widest text-muted";

export function Field({ label, required, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}

export function Panel({ title, description, action, children }) {
  return (
    <section className={`${cardClass} p-5`}>
      {title || action ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={eyebrowClass}>{title}</p>
            {description ? (
              <p className="mt-1 text-sm text-muted">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function ActionHeader({
  title,
  description,
  lastUpdated,
  dirty,
  saving,
  onSave,
  onReset,
  backHref = "/infodrif/partners",
}) {
  return (
    <div className="sticky top-0 z-20 -mx-6 border-b border-border bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-muted transition hover:bg-surface-soft hover:text-foreground"
            aria-label="Back to partners"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted">{description}</p>
            {lastUpdated ? (
              <p className="mt-1 text-xs font-medium text-muted">Last updated: {lastUpdated}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onSave ? (
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                dirty ? "bg-warning-soft text-warning" : "bg-success-soft text-success"
              }`}
            >
              {dirty ? "Unsaved changes" : "Saved"}
            </span>
          ) : null}
          {onReset ? (
            <button type="button" onClick={onReset} className={outlineButtonClass}>
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
          ) : null}
          {onSave ? (
            <button type="button" onClick={onSave} disabled={saving} className={primaryButtonClass}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save"}
            </button>
          ) : null}
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
          ? "bg-success-soft text-success ring-1 ring-[color-mix(in_srgb,var(--success)_35%,transparent)]"
          : "bg-surface-soft text-muted ring-1 ring-border"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-[var(--muted)]"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function StatusToggle({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm font-semibold transition ${
        active
          ? "border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-success-soft text-success"
          : "border-border bg-surface-soft text-muted"
      }`}
    >
      <span>{active ? "Active" : "Inactive"}</span>
      <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-success" : "bg-[var(--muted)]"}`} />
    </button>
  );
}

export function StatCard({ label, value, tone = "muted" }) {
  const toneClass = {
    muted: "bg-surface-soft text-foreground",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    info: "bg-info-soft text-info",
  }[tone];

  return (
    <div className={`${cardClass} p-4`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xl font-bold ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

export function ModalShell({ eyebrow, title, onClose, onSubmit, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={eyebrowClass}>{eyebrow}</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-surface-soft hover:text-foreground"
          >
            Close
          </button>
        </div>
        <div className="mt-5 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end gap-2">{footer}</div>
      </form>
    </div>
  );
}

/**
 * Image field. Every image on the public site is a PAIR — the rendered
 * `imageUrl` plus the `imagePath` we need to clean the blob up later — so this
 * always reports both back through `onChange`.
 */
export function ImageUploadField({
  label = "Image",
  imageUrl,
  imagePath,
  alt,
  upload,
  remove,
  onChange,
  onUploadingChange,
  round = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const setUploadingState = (next) => {
    setUploading(next);
    onUploadingChange?.(next);
  };

  async function handleUpload(file) {
    if (!file) return;
    setUploadingState(true);
    setProgress(0);
    try {
      const uploaded = await upload({ file, onProgress: setProgress });
      // Do not delete the previous blob here: the form may still be
      // discarded (unsaved-changes back navigation, etc.) before the outer
      // Save runs, and the Firestore document still points at it until
      // then. Only an explicit "Remove" click (handleRemove below) or
      // deleting the parent record should ever delete Storage blobs.
      onChange({ imageUrl: uploaded.url, imagePath: uploaded.path });
      emitAlert({ type: "success", message: "Image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploadingState(false);
    }
  }

  async function handleRemove() {
    const path = imagePath;
    onChange({ imageUrl: "", imagePath: "" });
    if (!path) return;
    try {
      await remove(path);
      emitAlert({ type: "success", message: "Image removed." });
    } catch {
      emitAlert({
        type: "warning",
        message: "Image cleared from the form, but Storage cleanup failed.",
      });
    }
  }

  return (
    <Field label={label} hint="PNG, JPG, or WebP — 5MB max.">
      <div className="rounded-md border border-dashed border-border bg-surface-soft p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-border bg-surface ${
              round ? "rounded-full" : "rounded-md"
            }`}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={alt || "Preview"} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {uploading ? (
              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : (
              <p className="truncate text-xs text-muted">
                {imagePath || (imageUrl ? "External image URL" : "No image uploaded yet.")}
              </p>
            )}
          </div>
          <label className={`${primaryButtonClass} cursor-pointer`}>
            <Upload className="h-4 w-4" />
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) => handleUpload(event.target.files?.[0])}
            />
          </label>
          {imageUrl ? (
            <button type="button" onClick={handleRemove} className={outlineButtonClass}>
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </Field>
  );
}

export function TableSkeletonRows({ columns, rows = 3 }) {
  return Array.from({ length: rows }).map((_, index) => (
    <tr key={index}>
      <td colSpan={columns} className="px-4 py-3">
        <div className="h-9 animate-pulse rounded-md bg-surface-soft" />
      </td>
    </tr>
  ));
}

export function formatDate(value) {
  const date = value?.toDate?.() || null;
  if (!date) return "Not saved yet";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}
