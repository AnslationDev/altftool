"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";

export const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
export const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
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
    <div className="sticky top-0 z-20 -mx-6 border-b border-gray-200 bg-gray-50/92 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/anslic/home"
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">{description}</p>
            <p className="mt-1 text-xs font-semibold text-gray-400">Last updated: {lastUpdated}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
              dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
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
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-500"
              }`}
            >
              {active ? "Active" : "Inactive"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Changes
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
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
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function SimplePreview({ icon: Icon, eyebrow, title, subtitle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-500">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {eyebrow || "Eyebrow"}
      </span>
      <h2 className="mt-4 max-w-xl text-3xl font-black tracking-normal text-gray-900">{title || "Title"}</h2>
      <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-gray-500">{subtitle || "Subtitle copy"}</p>
    </div>
  );
}

export function formatDate(value) {
  const date = value?.toDate?.() || null;
  if (!date) return "Not saved yet";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date);
}
