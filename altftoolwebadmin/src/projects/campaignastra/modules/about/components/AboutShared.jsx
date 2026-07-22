"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

export function AboutSectionHeader({ icon: Icon, title, description, active, onToggleActive }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/campaignastra/about"
          className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50"
          aria-label="Back to About hub"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {onToggleActive ? (
        <button
          type="button"
          onClick={onToggleActive}
          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-gray-200 bg-white text-gray-500"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </button>
      ) : null}
    </div>
  );
}

export function formatDate(value) {
  const date = value?.toDate?.() || null;
  if (!date) return "Not saved yet";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date);
}
