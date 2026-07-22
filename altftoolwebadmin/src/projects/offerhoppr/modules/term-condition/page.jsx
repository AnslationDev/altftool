"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, FileText, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { DEFAULT_TERMS, saveTerms, subscribeTerms } from "./service/terms.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

export default function TermConditionPage() {
  const [data, setData] = useState(DEFAULT_TERMS);
  const [savedData, setSavedData] = useState(DEFAULT_TERMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsub = subscribeTerms(
      (next) => {
        setData(next);
        setSavedData(next);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load terms & conditions." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(savedData), [data, savedData]);

  function setField(key, value) {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function addSection() {
    setData((prev) => ({ ...prev, sections: [...(prev.sections || []), { title: "", body: "" }] }));
  }

  function updateSection(index, key, value) {
    setData((prev) => {
      const next = [...(prev.sections || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, sections: next };
    });
  }

  function removeSection(index) {
    setData((prev) => ({ ...prev, sections: (prev.sections || []).filter((_, i) => i !== index) }));
  }

  function moveSection(index, direction) {
    setData((prev) => {
      const next = [...(prev.sections || [])];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, sections: next };
    });
  }

  async function save() {
    const nextErrors = {};
    if (!data.title?.trim()) nextErrors.title = "Title is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveTerms(data);
      emitAlert({ type: "success", message: "Terms & conditions saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save terms & conditions." });
    } finally {
      setSaving(false);
    }
  }

  const sections = data.sections || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Offerhoppr Terms & Conditions</h1>
              <p className="text-sm text-gray-500">Manage the terms badge, title, effective date, and sections.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{dirty ? "Unsaved" : "Saved"}</span>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
            ) : (
              <>
                <Card eyebrow="Header" title="Page header">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Badge"><input value={data.badge || ""} onChange={(event) => setField("badge", event.target.value)} className={inputClass} /></Field>
                      <Field label="Title" error={errors.title}><input value={data.title || ""} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
                    </div>
                    <Field label="Effective Date"><input value={data.effectiveDate || ""} onChange={(event) => setField("effectiveDate", event.target.value)} className={inputClass} /></Field>
                  </div>
                </Card>

                <Card eyebrow="Sections" title={`${sections.length} sections`}>
                  <div className="space-y-3">
                    {sections.length ? sections.map((section, index) => (
                      <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Section {index + 1}</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => moveSection(index, -1)} disabled={index === 0} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ArrowUp className="h-3.5 w-3.5" /></button>
                            <button onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ArrowDown className="h-3.5 w-3.5" /></button>
                            <button onClick={() => removeSection(index)} className="rounded-lg border border-red-200 bg-white p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Field label="Title"><input value={section.title || ""} onChange={(event) => updateSection(index, "title", event.target.value)} className={inputClass} /></Field>
                          <Field label="Body"><textarea value={section.body || ""} onChange={(event) => updateSection(index, "body", event.target.value)} rows={4} className={textareaClass} /></Field>
                        </div>
                      </div>
                    )) : (
                      <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm font-semibold text-gray-400">No sections yet.</p>
                    )}
                    <button onClick={addSection} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                      <Plus className="h-4 w-4" /> Add section
                    </button>
                  </div>
                </Card>
              </>
            )}
          </div>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-bold text-gray-900">Live preview</h2>
              </div>
              <TermsPreview data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const OH = {
  bg: "#ffffff",
  raised: "#f9fafb",
  text: "#111827",
  dim: "#6b7280",
  accent: "#111827",
  border: "#e5e7eb",
};

function TermsPreview({ data }) {
  const sections = data?.sections || [];

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: OH.border, background: OH.bg }}>
      {/* Header */}
      <div className="border-b p-6" style={{ borderColor: OH.border, background: OH.raised }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: OH.accent }}>
          {data?.badge || "Legal"}
        </p>
        <h3 className="mt-3 text-2xl font-bold leading-tight" style={{ color: OH.text }}>
          {data?.title || "Terms & Conditions"}
        </h3>
        {data?.effectiveDate ? (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: OH.dim }}>
            {data.effectiveDate}
          </p>
        ) : null}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-6 p-6">
        {sections.length ? (
          sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-base font-bold leading-snug" style={{ color: OH.text }}>
                {section.title || `Section ${index + 1}`}
              </h4>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: OH.dim }}>
                {section.body}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm" style={{ color: OH.dim }}>
            No sections yet.
          </p>
        )}
      </div>
    </div>
  );
}

function Card({ eyebrow, title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
        <h2 className="mt-1 text-base font-bold text-gray-900">{title}</h2>
      </div>
      {children}
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
