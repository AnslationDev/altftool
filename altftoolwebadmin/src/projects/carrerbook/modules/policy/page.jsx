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
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_POLICY_PAGE,
  resetPolicyPage,
  savePolicyPage,
  subscribePolicyPage,
} from "./service/policy.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const TABS = [
  { key: "header", label: "Page Header", icon: FileText },
  { key: "items", label: "Policy Q&A", icon: ShieldCheck },
  { key: "status", label: "Preview / Status", icon: BadgeCheck },
];

export default function CareerBookPolicyAdminPage() {
  const [activeTab, setActiveTab] = useState("header");
  const [draft, setDraft] = useState(DEFAULT_POLICY_PAGE);
  const [saved, setSaved] = useState(DEFAULT_POLICY_PAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetOpen, setResetOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribePolicyPage(
      (data) => {
        setDraft(data);
        setSaved(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load Privacy Policy content." });
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const activeLabel = TABS.find((tab) => tab.key === activeTab)?.label || "Policy Section";

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function updateItem(id, key, value) {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [key]: key === "sortOrder" ? Number(value) || 0 : value } : item,
      ),
    }));
    setErrors((prev) => ({ ...prev, [`${id}.${key}`]: "" }));
  }

  function addItem() {
    setDraft((prev) => {
      const nextOrder = prev.items.reduce((max, item) => Math.max(max, Number(item.sortOrder) || 0), 0) + 1;
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id: `policy-item-${Date.now()}`,
            question: "",
            answer: "",
            active: true,
            sortOrder: nextOrder,
          },
        ],
      };
    });
  }

  function deleteItem(id) {
    setDraft((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
  }

  function resetForm() {
    setDraft(saved);
    setErrors({});
  }

  async function handleSave() {
    const nextErrors = validatePolicyPage(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      emitAlert({ type: "error", message: "Please fix the highlighted Policy fields." });
      return;
    }
    setSaving(true);
    try {
      await savePolicyPage(draft);
      emitAlert({ type: "success", message: "Privacy Policy page saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save Privacy Policy." });
    } finally {
      setSaving(false);
    }
  }

  async function handleResetDefaults() {
    setResetLoading(true);
    try {
      await resetPolicyPage();
      emitAlert({ type: "success", message: "Privacy Policy reset to defaults." });
      setResetOpen(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setResetLoading(false);
    }
  }

  const editor =
    activeTab === "header" ? (
      <HeaderEditor draft={draft} errors={errors} setField={setField} />
    ) : activeTab === "items" ? (
      <PolicyItemsEditor
        items={draft.items}
        errors={errors}
        updateItem={updateItem}
        addItem={addItem}
        deleteItem={deleteItem}
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
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CareerBook Privacy Policy Page</h1>
              <p className="text-sm text-gray-500">Manage the public Privacy Policy page content.</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Section
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
            <PolicyLivePreview data={draft} />
          </section>
        </div>
      </div>

      {resetOpen ? (
        <DeleteConfirmModal
          title="Reset Privacy Policy"
          message="Reset the Privacy Policy page back to default content?"
          loading={resetLoading}
          onConfirm={handleResetDefaults}
          onCancel={() => setResetOpen(false)}
        />
      ) : null}
    </div>
  );
}

function HeaderEditor({ draft, errors, setField }) {
  return (
    <div className="space-y-4">
      <Field label="Heading" error={errors.heading}>
        <input value={draft.heading} onChange={(event) => setField("heading", event.target.value)} className={inputClass} placeholder="Privacy Policy" />
      </Field>
      <Field label="Subtitle" error={errors.subtitle}>
        <textarea value={draft.subtitle} onChange={(event) => setField("subtitle", event.target.value)} rows={5} className={textareaClass} placeholder="Public page subtitle text" />
      </Field>
      <button onClick={() => setField("active", !draft.active)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
        <span>{draft.active ? "Policy page active" : "Policy page inactive"}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${draft.active ? "bg-emerald-500" : "bg-gray-400"}`} />
      </button>
    </div>
  );
}

function PolicyItemsEditor({ items, errors, updateItem, addItem, deleteItem }) {
  const sortedItems = [...(items || [])].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Policy Question & Answer</p>
          <h3 className="mt-1 text-sm font-bold text-gray-900">{sortedItems.length} items</h3>
        </div>
        <button onClick={addItem} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
          <Plus className="h-4 w-4" /> Add Policy Q&A
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {sortedItems.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <GripVertical className="h-4 w-4 text-gray-300" />
                Policy Item {index + 1}
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateItem(item.id, "active", !item.active)} className={`rounded-lg px-2.5 py-1 text-xs font-bold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {item.active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => deleteItem(item.id)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
              <Field label="Policy Question / Title" error={errors[`${item.id}.question`]}>
                <input value={item.question} onChange={(event) => updateItem(item.id, "question", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Sort Order">
                <input type="number" value={item.sortOrder} onChange={(event) => updateItem(item.id, "sortOrder", event.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Policy Answer / Description" error={errors[`${item.id}.answer`]}>
              <textarea value={item.answer} onChange={(event) => updateItem(item.id, "answer", event.target.value)} rows={4} className={textareaClass} />
            </Field>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusEditor({ draft, setDraft, dirty }) {
  return (
    <div className="space-y-4">
      <button onClick={() => setDraft((prev) => ({ ...prev, active: !prev.active }))} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
        <span>{draft.active ? "Policy page active" : "Policy page inactive"}</span>
        <ToggleLeft className="h-5 w-5" />
      </button>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-bold text-gray-900">Content health</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <MiniMetric label="Policy items" value={draft.items.length} />
          <MiniMetric label="Active items" value={draft.items.filter((item) => item.active !== false).length} />
          <MiniMetric label="Unsaved" value={dirty ? "Yes" : "No"} />
        </div>
      </div>
    </div>
  );
}

function PolicyLivePreview({ data }) {
  const activeItems = [...(data.items || [])]
    .filter((item) => item.active !== false)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#090716] shadow-sm">
      <div className="relative min-h-[680px] bg-[radial-gradient(circle_at_top,#35215f_0%,#090716_42%,#05040c_100%)] p-8 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:68px_68px]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${data.active ? "bg-emerald-400/15 text-emerald-200" : "bg-gray-400/15 text-gray-200"}`}>
            {data.active ? "Active" : "Inactive"}
          </span>
          <h2 className="mt-5 text-5xl font-black tracking-normal">{data.heading || "Privacy Policy"}</h2>
          <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-white/85">{data.subtitle}</p>

          <div className="mt-12 rounded-xl border border-white/10 bg-black/35 p-6 shadow-2xl">
            <div className="space-y-7">
              {activeItems.length ? activeItems.map((item) => (
                <article key={item.id}>
                  <h3 className="text-xl font-black text-[#f4c542]">{item.question}</h3>
                  <p className="mt-2 text-sm font-medium leading-7 text-white/80">{item.answer}</p>
                </article>
              )) : (
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6 text-center text-sm text-white/55">No active policy items yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function validatePolicyPage(values) {
  const errors = {};
  if (!values.heading?.trim()) errors.heading = "Heading is required.";
  if (!values.subtitle?.trim()) errors.subtitle = "Subtitle is required.";
  (values.items || []).forEach((item) => {
    if (!item.question?.trim()) errors[`${item.id}.question`] = "Policy question/title is required.";
    if (!item.answer?.trim()) errors[`${item.id}.answer`] = "Policy answer/description is required.";
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
