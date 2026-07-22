"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Save } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_LOADING,
  DEFAULT_NOT_FOUND,
  saveLoading,
  saveNotFound,
  subscribeLoading,
  subscribeNotFound,
} from "./service/misc.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

export default function MiscPagesPage() {
  const [notFound, setNotFound] = useState(DEFAULT_NOT_FOUND);
  const [loadingCopy, setLoadingCopy] = useState(DEFAULT_LOADING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubNotFound = subscribeNotFound(
      (data) => {
        setNotFound(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load Not Found page copy." });
        setLoading(false);
      },
    );
    const unsubLoading = subscribeLoading(
      (data) => setLoadingCopy(data),
      () => emitAlert({ type: "error", message: "Failed to load Loading page copy." }),
    );
    return () => {
      unsubNotFound();
      unsubLoading();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Offerhoppr Misc Pages</h1>
            <p className="text-sm text-gray-500">
              Manage copy for the Not Found (404) and Loading states. Note: these fields are edited here for
              consistency with the rest of the admin, but the live frontend&apos;s not-found and loading pages
              currently read only from the bundled JSON file (Next.js special render-boundary pages), not from
              Firestore — so this module is forward-looking/optional to wire up later, not yet consumed live.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
        ) : (
          <>
            <NotFoundCard notFound={notFound} setNotFound={setNotFound} />
            <LoadingCard loadingCopy={loadingCopy} setLoadingCopy={setLoadingCopy} />
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- not found -------------------------------- */

function NotFoundCard({ notFound, setNotFound }) {
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setNotFound((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!notFound.heading?.trim()) nextErrors.heading = "Heading is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveNotFound(notFound);
      emitAlert({ type: "success", message: "Not Found page copy saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save Not Found copy." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="404 Page" title="Not found" onSave={save} saving={saving}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Digits"><input value={notFound.digits || ""} onChange={(event) => setField("digits", event.target.value)} className={inputClass} placeholder="404" /></Field>
          <Field label="Sticker"><input value={notFound.sticker || ""} onChange={(event) => setField("sticker", event.target.value)} className={inputClass} /></Field>
        </div>
        <Field label="Heading" error={errors.heading}><input value={notFound.heading || ""} onChange={(event) => setField("heading", event.target.value)} className={inputClass} /></Field>
        <Field label="Body"><textarea value={notFound.body || ""} onChange={(event) => setField("body", event.target.value)} rows={3} className={textareaClass} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary Button Label"><input value={notFound.buttonLabel || ""} onChange={(event) => setField("buttonLabel", event.target.value)} className={inputClass} /></Field>
          <Field label="Primary Button Href"><input value={notFound.buttonHref || ""} onChange={(event) => setField("buttonHref", event.target.value)} className={inputClass} placeholder="/" /></Field>
          <Field label="Secondary Button Label"><input value={notFound.secondaryLabel || ""} onChange={(event) => setField("secondaryLabel", event.target.value)} className={inputClass} /></Field>
          <Field label="Secondary Button Href"><input value={notFound.secondaryHref || ""} onChange={(event) => setField("secondaryHref", event.target.value)} className={inputClass} placeholder="/offers" /></Field>
        </div>
      </div>
    </SectionCard>
  );
}

/* --------------------------------- loading -------------------------------- */

function LoadingCard({ loadingCopy, setLoadingCopy }) {
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setLoadingCopy((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveLoading(loadingCopy);
      emitAlert({ type: "success", message: "Loading page copy saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save loading copy." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Loading State" title="Loading" onSave={save} saving={saving}>
      <Field label="Message"><input value={loadingCopy.message || ""} onChange={(event) => setField("message", event.target.value)} className={inputClass} /></Field>
    </SectionCard>
  );
}

/* -------------------------------- shared --------------------------------- */

function SectionCard({ eyebrow, title, onSave, saving, disabled, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">{title}</h2>
        </div>
        <button onClick={onSave} disabled={saving || disabled} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
