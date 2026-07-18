"use client";

import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, RefreshCw, Save, Search, Upload } from "lucide-react";
import {
  Field,
  IconButton,
  ModalShell,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  StatusBadge,
  TableEmptyState,
  TableSkeletonRows,
  inputClass,
  isSafeUrl,
  textareaClass,
} from "../../../components/ui";

/**
 * Intra-module chrome for the Infodrif About admin pages.
 *
 * The generic pieces (Panel, StatCard, StatusBadge, ModalShell, Field,
 * inputClass, …) live in `src/projects/infodrif/components/ui.jsx` and are
 * re-exported here so a section page has a single import. Everything is built
 * on the semantic token layer (`var(--surface)`, `var(--foreground)`,
 * `var(--primary)`, …) like the admin shell, so light and dark both theme from
 * the same names. Never reintroduce hardcoded gray/white palettes.
 */

export {
  Field,
  IconButton,
  ModalShell,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  StatusBadge,
  TableEmptyState,
  TableSkeletonRows,
  inputClass,
  isSafeUrl,
  textareaClass,
};

const ABOUT_HUB_ROUTE = "/infodrif/about";

/** Sticky save/reset bar shown at the top of every About section page. */
export function ActionHeader({
  title,
  description,
  lastUpdated,
  dirty,
  saving,
  disabled = false,
  onSave,
  onReset,
}) {
  return (
    <div className="sticky top-0 z-20 -mx-6 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={ABOUT_HUB_ROUTE}
            aria-label="Back to the About hub"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
            <p className="text-sm text-[var(--muted)]">{description}</p>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
              dirty
                ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {dirty ? "Unsaved changes" : "Saved"}
          </span>
          <SecondaryButton icon={RefreshCw} onClick={onReset} disabled={saving}>
            Reset to defaults
          </SecondaryButton>
          <PrimaryButton icon={Save} onClick={onSave} loading={saving} disabled={saving || disabled}>
            {saving ? "Saving…" : "Save"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/** Search box + status filter + count + primary action, above an items table. */
export function ItemsToolbar({
  search,
  onSearchChange,
  searchLabel = "Search items",
  statusFilter,
  onStatusFilterChange,
  shownCount,
  totalCount,
  countNoun = "items",
  actions,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchLabel}
          aria-label={searchLabel}
          className={`${inputClass} w-56 pl-8`}
        />
      </div>
      <select
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value)}
        aria-label="Filter by status"
        className={`${inputClass} w-auto`}
      >
        <option value="all">All status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <span className="ml-auto text-xs font-medium text-[var(--muted)]">
        {shownCount} of {totalCount} {countNoun}
      </span>
      {actions}
    </div>
  );
}

/** Toggle rendered as a full-width control, for use inside a `Field`. */
export function ActiveToggle({ active, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      aria-pressed={active}
      className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] ${
        active
          ? "border-[color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[var(--success-soft)] text-[var(--success)]"
          : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]"
      }`}
    >
      <span>{active ? "Active" : "Inactive"}</span>
      <span className="h-2.5 w-2.5 rounded-full bg-current" />
    </button>
  );
}

/**
 * Select over a closed list of literal values (icon names, Tailwind class
 * strings, enum-ish layout tokens). Used wherever the site only understands a
 * fixed vocabulary, so free text would silently render nothing. Options may be
 * plain strings or `{ value, label }` pairs.
 */
export function OptionSelect({ value, options, onChange, allowEmpty = false }) {
  return (
    <select
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    >
      {allowEmpty ? <option value="">None</option> : null}
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;
        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
}

/**
 * Select over the lucide icon NAMES a site component understands. Icons are
 * persisted as strings and mapped back to components by that component's own
 * `ICONS` object — the service names the owning file for each list. Keep the
 * two in sync: a name outside the list renders nothing, with no error.
 */
export function IconSelect({ value, options, onChange, allowEmpty = false }) {
  return (
    <OptionSelect value={value} options={options} onChange={onChange} allowEmpty={allowEmpty} />
  );
}

/**
 * Image picker for an `imageUrl` + `imagePath` PAIR. Both must be persisted:
 * `imagePath` is the Storage path required to delete the blob later, and is
 * empty for images referenced by plain URL (the JSON fallbacks do this).
 * `onChange({ imageUrl, imagePath })` replaces both at once.
 */
export function ImagePairField({
  label,
  hint,
  error,
  imageUrl,
  imagePath,
  onChange,
  onUpload,
  onRemove,
  uploading,
  uploadProgress,
  round = false,
  previewClass = "h-16 w-28",
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <div className="rounded-xl border border-dashed border-[var(--border-strong,var(--border))] bg-[var(--surface-soft)] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div
            className={`grid shrink-0 place-items-center overflow-hidden border border-[var(--border)] bg-[var(--surface)] ${previewClass} ${
              round ? "rounded-full" : "rounded-lg"
            }`}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className={round ? "h-full w-full object-cover" : "max-h-full max-w-full object-contain"}
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-[var(--muted)] opacity-60" strokeWidth={1.5} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Upload a PNG, JPG, or WebP
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Max 5MB.</p>
            {uploading ? (
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--border)]"
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            ) : null}
          </div>

          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[13px] font-semibold text-[var(--primary-foreground)] transition hover:bg-[color-mix(in_srgb,var(--primary)_85%,black)]">
            <Upload className="h-4 w-4" strokeWidth={1.75} />
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) => onUpload(event.target.files?.[0])}
            />
          </label>
          {imageUrl ? <SecondaryButton onClick={onRemove}>Remove</SecondaryButton> : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--muted)]">
              Image URL
            </span>
            <input
              value={imageUrl || ""}
              onChange={(event) => onChange({ imageUrl: event.target.value, imagePath })}
              className={inputClass}
              placeholder="/assets/about1.png"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--muted)]">
              Storage path
            </span>
            <input
              value={imagePath || ""}
              readOnly
              aria-readonly="true"
              className={`${inputClass} cursor-not-allowed opacity-70`}
              placeholder="Set automatically on upload"
            />
          </label>
        </div>
      </div>
    </Field>
  );
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

/** Sorts by `order`, then applies the toolbar's search text and status filter. */
export function filterItems(items, search, statusFilter, searchKeys) {
  const queryText = search.trim().toLowerCase();
  return [...items]
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .filter((item) => {
      const matchesSearch =
        !queryText ||
        searchKeys.some((key) => String(item[key] ?? "").toLowerCase().includes(queryText));
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? item.active : !item.active);
      return matchesSearch && matchesStatus;
    });
}

/** Next free `order` value, so a new item lands at the end of the list. */
export function nextOrderFor(items) {
  return items.length ? Math.max(...items.map((item) => Number(item.order || 0))) + 1 : 0;
}

export function isValidOrder(value) {
  return !Number.isNaN(Number(value)) && Number(value) >= 0;
}
