"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { DEFAULT_HOME_SECTIONS, resetHomeSection, saveHomeSection, subscribeHomeSection } from "../service/home.service";
import { ActionHeader, Field, formatDate, inputClass, textareaClass } from "../components/HomeAdminShared";

const SECTION_KEY = "about-preview";
const ROUTE = "/anslic/home/about-preview";

export default function AnslicHomeAboutPreviewPage() {
  const [saved, setSaved] = useState(DEFAULT_HOME_SECTIONS[SECTION_KEY]);
  const [draft, setDraft] = useState(DEFAULT_HOME_SECTIONS[SECTION_KEY]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    return subscribeHomeSection(
      SECTION_KEY,
      (data) => {
        const normalized = { ...data, items: Array.isArray(data.items) ? data.items : [] };
        setSaved(normalized);
        setDraft(normalized);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load about preview section." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function setItem(index, value) {
    setDraft((prev) => {
      const items = [...(prev.items || [])];
      items[index] = value;
      return { ...prev, items };
    });
  }

  function addItem() {
    setDraft((prev) => ({ ...prev, items: [...(prev.items || []), ""] }));
  }

  function removeItem(index) {
    setDraft((prev) => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
  }

  async function save() {
    const cleanDraft = { ...draft, items: (draft.items || []).map((item) => String(item).trim()).filter(Boolean) };
    const nextErrors = validate(cleanDraft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      await saveHomeSection(SECTION_KEY, cleanDraft);
      setDraft(cleanDraft);
      emitAlert({ type: "success", message: "About preview section saved." });
      logAuditEvent({
        module: "home",
        action: "HOME_ABOUT_PREVIEW_UPDATE",
        entityType: "homeAboutPreview",
        entityId: "about-preview",
        summary: "Updated Anslic home about preview section",
        changes: cleanDraft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save about preview section." });
    } finally {
      setSaving(false);
    }
  }

  async function resetSection() {
    setSaving(true);
    try {
      await resetHomeSection(SECTION_KEY);
      emitAlert({ type: "success", message: "About preview section reset." });
      setConfirmReset(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 pb-6">
      <ActionHeader
        title="Home — About Preview"
        description="Edit the “why choose Anslic” summary and bullet points."
        lastUpdated={formatDate(saved.updatedAt)}
        active={draft.active !== false}
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={() => setConfirmReset(true)}
        onToggleActive={() => setField("active", draft.active === false)}
      />

      <div className="mx-auto mt-6 grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">About Preview Management</p>
          {loading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label="Eyebrow" error={errors.eyebrow}>
                <input value={draft.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Title" error={errors.title}>
                <textarea value={draft.title || ""} onChange={(event) => setField("title", event.target.value)} rows={2} className={textareaClass} />
              </Field>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Bullet points
                  </span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add row
                  </button>
                </div>
                <div className="space-y-2">
                  {(draft.items || []).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={item}
                        onChange={(event) => setItem(index, event.target.value)}
                        className={inputClass}
                        placeholder={`Bullet point ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        aria-label={`Remove bullet point ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {!(draft.items || []).length ? (
                    <p className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center text-xs font-medium text-gray-400">
                      No bullet points yet. Add one above.
                    </p>
                  ) : null}
                </div>
                {errors.items ? <span className="mt-1 block text-xs font-medium text-red-500">{errors.items}</span> : null}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <p className="text-sm font-bold text-gray-700">Live preview</p>
          <AboutPreview draft={draft} />
        </section>
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset about preview section"
          message="Reset this section back to default content?"
          loading={saving}
          onConfirm={resetSection}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function AboutPreview({ draft }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-500">
        {draft.eyebrow || "Eyebrow"}
      </span>
      <h2 className="mt-4 max-w-xl text-3xl font-black tracking-normal text-gray-900">
        {draft.title || "Title"}
      </h2>
      <ul className="mt-6 space-y-3">
        {(draft.items || []).length ? (
          draft.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-700">{item}</span>
            </li>
          ))
        ) : (
          <li className="text-sm font-medium text-gray-400">No bullet points yet.</li>
        )}
      </ul>
    </div>
  );
}

function validate(values) {
  const errors = {};
  if (!values.eyebrow?.trim()) errors.eyebrow = "Eyebrow is required.";
  if (!values.title?.trim()) errors.title = "Title is required.";
  if (!values.items?.length) errors.items = "Add at least one bullet point.";
  return errors;
}
