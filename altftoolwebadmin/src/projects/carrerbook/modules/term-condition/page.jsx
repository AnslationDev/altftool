"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  FileText,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  ToggleLeft,
  Trash2,
  Users,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_TERMS_PAGE,
  resetTermsPage,
  saveTermsPage,
  subscribeTermsPage,
} from "./service/terms.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const TABS = [
  { key: "header", label: "Page Header", icon: FileText },
  { key: "advertiser", label: "Advertiser Terms", icon: ShieldCheck },
  { key: "publisher", label: "Publisher Terms", icon: Users },
  { key: "preview", label: "Preview / Status", icon: BadgeCheck },
];

export default function CareerBookTermsConditionsAdminPage() {
  const [activeTab, setActiveTab] = useState("header");
  const [draft, setDraft] = useState(DEFAULT_TERMS_PAGE);
  const [saved, setSaved] = useState(DEFAULT_TERMS_PAGE);
  const [previewTab, setPreviewTab] = useState("advertiser");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetOpen, setResetOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeTermsPage(
      (data) => {
        setDraft(data);
        setSaved(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load Terms & Conditions content." });
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const activeLabel = TABS.find((tab) => tab.key === activeTab)?.label || "Terms Section";

  function setHeaderField(key, value) {
    setDraft((prev) => ({ ...prev, header: { ...prev.header, [key]: value } }));
    setErrors((prev) => ({ ...prev, [`header.${key}`]: "" }));
  }

  function setSectionField(sectionKey, key, value) {
    setDraft((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [key]: value },
    }));
    setErrors((prev) => ({ ...prev, [`${sectionKey}.${key}`]: "" }));
  }

  function updateTerm(sectionKey, id, key, value) {
    setDraft((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        terms: prev[sectionKey].terms.map((term) =>
          term.id === id ? { ...term, [key]: key === "sortOrder" ? Number(value) || 0 : value } : term,
        ),
      },
    }));
    setErrors((prev) => ({ ...prev, [`${sectionKey}.${id}.${key}`]: "" }));
  }

  function addTerm(sectionKey) {
    setDraft((prev) => {
      const nextOrder = (prev[sectionKey].terms || []).reduce((max, term) => Math.max(max, Number(term.sortOrder) || 0), 0) + 1;
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          terms: [
            ...(prev[sectionKey].terms || []),
            {
              id: `${sectionKey}-term-${Date.now()}`,
              title: "",
              description: "",
              active: true,
              sortOrder: nextOrder,
            },
          ],
        },
      };
    });
  }

  function deleteTerm(sectionKey, id) {
    setDraft((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        terms: prev[sectionKey].terms.filter((term) => term.id !== id),
      },
    }));
  }

  function resetForm() {
    setDraft(saved);
    setErrors({});
  }

  async function handleSave() {
    const nextErrors = validateTermsPage(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      emitAlert({ type: "error", message: "Please fix the highlighted Terms fields." });
      return;
    }
    setSaving(true);
    try {
      await saveTermsPage(draft);
      emitAlert({ type: "success", message: "Terms & Conditions page saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save Terms & Conditions." });
    } finally {
      setSaving(false);
    }
  }

  async function handleResetDefaults() {
    setResetLoading(true);
    try {
      await resetTermsPage();
      emitAlert({ type: "success", message: "Terms & Conditions reset to defaults." });
      setResetOpen(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setResetLoading(false);
    }
  }

  const editor =
    activeTab === "header" ? (
      <HeaderEditor draft={draft} errors={errors} setHeaderField={setHeaderField} setDraft={setDraft} />
    ) : activeTab === "advertiser" || activeTab === "publisher" ? (
      <TermsSectionEditor
        sectionKey={activeTab}
        section={draft[activeTab]}
        errors={errors}
        setSectionField={setSectionField}
        updateTerm={updateTerm}
        addTerm={addTerm}
        deleteTerm={deleteTerm}
      />
    ) : (
      <StatusEditor draft={draft} setDraft={setDraft} dirty={dirty} />
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CareerBook Terms & Conditions Page</h1>
              <p className="text-sm text-gray-500">Manage the public Terms & Conditions page content.</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Section
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  isActive ? "border-teal-700 bg-teal-700 text-white" : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? "bg-white/10" : "bg-gray-100"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="block text-sm font-bold">{tab.label}</span>
                <span className={`mt-3 inline-flex rounded-lg px-2 py-1 text-xs font-bold ${draft.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {draft.active ? "Active" : "Inactive"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Status</p>
              <p className="mt-1 text-sm font-semibold text-gray-700">{dirty ? "Unsaved changes" : "All changes saved"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={resetForm} disabled={!dirty} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw className="h-4 w-4" /> Reset Form
              </button>
              <button onClick={() => setResetOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Reset Defaults
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{activeLabel}</p>
              <h2 className="mt-1 text-base font-bold text-gray-900">Section edit form</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}
              </div>
            ) : (
              editor
            )}
          </section>

          <section className="space-y-4">
            <p className="text-sm font-bold text-gray-700">Live preview</p>
            <TermsLivePreview data={draft} previewTab={previewTab} setPreviewTab={setPreviewTab} />
          </section>
        </div>
      </div>

      {resetOpen ? (
        <DeleteConfirmModal
          title="Reset Terms & Conditions"
          message="Reset the Terms & Conditions page back to default content?"
          loading={resetLoading}
          onConfirm={handleResetDefaults}
          onCancel={() => setResetOpen(false)}
        />
      ) : null}
    </div>
  );
}

function HeaderEditor({ draft, errors, setHeaderField, setDraft }) {
  return (
    <div className="space-y-4">
      <Field label="Heading" error={errors["header.heading"]}>
        <input value={draft.header.heading} onChange={(event) => setHeaderField("heading", event.target.value)} className={inputClass} placeholder="Terms & Conditions" />
      </Field>
      <Field label="Description" error={errors["header.description"]}>
        <textarea value={draft.header.description} onChange={(event) => setHeaderField("description", event.target.value)} rows={5} className={textareaClass} placeholder="Public page intro text" />
      </Field>
      <button onClick={() => setDraft((prev) => ({ ...prev, active: !prev.active }))} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
        <span>{draft.active ? "Terms page active" : "Terms page inactive"}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${draft.active ? "bg-emerald-500" : "bg-gray-400"}`} />
      </button>
    </div>
  );
}

function TermsSectionEditor({ sectionKey, section, errors, setSectionField, updateTerm, addTerm, deleteTerm }) {
  const label = sectionKey === "advertiser" ? "Advertiser" : "Publisher";
  const sortedTerms = [...(section.terms || [])].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${label} Tab Label`} error={errors[`${sectionKey}.tabLabel`]}>
          <input value={section.tabLabel} onChange={(event) => setSectionField(sectionKey, "tabLabel", event.target.value)} className={inputClass} />
        </Field>
        <Field label={`${label} Badge Text`} error={errors[`${sectionKey}.badgeText`]}>
          <input value={section.badgeText} onChange={(event) => setSectionField(sectionKey, "badgeText", event.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label={`${label} Heading`} error={errors[`${sectionKey}.heading`]}>
        <input value={section.heading} onChange={(event) => setSectionField(sectionKey, "heading", event.target.value)} className={inputClass} />
      </Field>
      <Field label={`${label} Description`} error={errors[`${sectionKey}.description`]}>
        <textarea value={section.description} onChange={(event) => setSectionField(sectionKey, "description", event.target.value)} rows={4} className={textareaClass} />
      </Field>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label} Terms</p>
            <h3 className="mt-1 text-sm font-bold text-gray-900">{sortedTerms.length} items</h3>
          </div>
          <button onClick={() => addTerm(sectionKey)} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
            <Plus className="h-4 w-4" /> Add {label} Term
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {sortedTerms.map((term, index) => (
            <div key={term.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <GripVertical className="h-4 w-4 text-gray-300" />
                  Term {index + 1}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateTerm(sectionKey, term.id, "active", !term.active)} className={`rounded-lg px-2.5 py-1 text-xs font-bold ${term.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {term.active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => deleteTerm(sectionKey, term.id)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
                <Field label="Term Title" error={errors[`${sectionKey}.${term.id}.title`]}>
                  <input value={term.title} onChange={(event) => updateTerm(sectionKey, term.id, "title", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Sort Order">
                  <input type="number" value={term.sortOrder} onChange={(event) => updateTerm(sectionKey, term.id, "sortOrder", event.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Term Description" error={errors[`${sectionKey}.${term.id}.description`]}>
                <textarea value={term.description} onChange={(event) => updateTerm(sectionKey, term.id, "description", event.target.value)} rows={4} className={textareaClass} />
              </Field>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusEditor({ draft, setDraft, dirty }) {
  return (
    <div className="space-y-4">
      <button onClick={() => setDraft((prev) => ({ ...prev, active: !prev.active }))} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
        <span>{draft.active ? "Terms page active" : "Terms page inactive"}</span>
        <ToggleLeft className="h-5 w-5" />
      </button>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-bold text-gray-900">Content health</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <MiniMetric label="Advertiser terms" value={draft.advertiser.terms.length} />
          <MiniMetric label="Publisher terms" value={draft.publisher.terms.length} />
          <MiniMetric label="Unsaved" value={dirty ? "Yes" : "No"} />
        </div>
      </div>
    </div>
  );
}

function TermsLivePreview({ data, previewTab, setPreviewTab }) {
  const section = data[previewTab];
  const activeTerms = [...(section.terms || [])]
    .filter((term) => term.active !== false)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#090716] shadow-sm">
      <div className="relative min-h-[680px] bg-[radial-gradient(circle_at_top,#35215f_0%,#090716_42%,#05040c_100%)] p-8 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:68px_68px]" />
        <div className="relative z-10">
          <div className="text-center">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${data.active ? "bg-emerald-400/15 text-emerald-200" : "bg-gray-400/15 text-gray-200"}`}>
              {data.active ? "Active" : "Inactive"}
            </span>
            <h2 className="mt-4 text-4xl font-black tracking-normal">{data.header.heading || "Terms & Conditions"}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-white/72">{data.header.description}</p>
          </div>

          <div className="mx-auto mt-8 flex w-fit rounded-full border border-white/10 bg-white/5 p-1">
            {["advertiser", "publisher"].map((key) => (
              <button
                key={key}
                onClick={() => setPreviewTab(key)}
                className={`rounded-full px-5 py-2 text-xs font-black transition ${
                  previewTab === key ? "bg-[#f4c542] text-gray-950" : "text-white/65 hover:text-white"
                }`}
              >
                {data[key].tabLabel}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/35 p-6 shadow-2xl">
            <span className="inline-flex rounded-full bg-[#f4c542]/15 px-3 py-1 text-xs font-black text-[#f4c542]">{section.badgeText}</span>
            <h3 className="mt-4 text-2xl font-black">{section.heading}</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-white/68">{section.description}</p>
            <div className="mt-6 grid gap-4">
              {activeTerms.length ? activeTerms.map((term) => (
                <article key={term.id} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <h4 className="text-base font-black text-[#f4c542]">{term.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-white/72">{term.description}</p>
                </article>
              )) : (
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6 text-center text-sm text-white/55">No active terms yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function validateTermsPage(values) {
  const errors = {};
  if (!values.header.heading?.trim()) errors["header.heading"] = "Heading is required.";
  if (!values.header.description?.trim()) errors["header.description"] = "Description is required.";

  ["advertiser", "publisher"].forEach((sectionKey) => {
    const section = values[sectionKey];
    if (!section.tabLabel?.trim()) errors[`${sectionKey}.tabLabel`] = "Tab label is required.";
    if (!section.heading?.trim()) errors[`${sectionKey}.heading`] = "Section heading is required.";
    if (!section.description?.trim()) errors[`${sectionKey}.description`] = "Section description is required.";
    if (!section.badgeText?.trim()) errors[`${sectionKey}.badgeText`] = "Badge text is required.";
    (section.terms || []).forEach((term) => {
      if (!term.title?.trim()) errors[`${sectionKey}.${term.id}.title`] = "Term title is required.";
      if (!term.description?.trim()) errors[`${sectionKey}.${term.id}.description`] = "Term description is required.";
    });
  });
  return errors;
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

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-black text-gray-900">{value}</p>
    </div>
  );
}
