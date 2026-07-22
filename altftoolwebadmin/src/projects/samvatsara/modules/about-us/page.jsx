"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Info, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_ABOUT_CLOSING,
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_SELECTED_WORK,
  DEFAULT_ABOUT_STORY,
  DEFAULT_ABOUT_VALUES,
  VALUE_ICONS,
  createAboutValue,
  deleteAboutValue,
  saveAboutClosing,
  saveAboutHero,
  saveAboutSelectedWork,
  saveAboutStory,
  saveAboutValuesDoc,
  subscribeAboutClosing,
  subscribeAboutHero,
  subscribeAboutSelectedWork,
  subscribeAboutStory,
  subscribeAboutValues,
  subscribeAboutValuesDoc,
  toggleAboutValueStatus,
  updateAboutValue,
} from "./service/about.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_VALUE = { title: "", description: "", icon: "hand", order: 0, active: true };

function paragraphsToText(value) {
  return Array.isArray(value) ? value.join("\n\n") : String(value || "");
}

export default function AboutUsPage() {
  const [hero, setHero] = useState(DEFAULT_ABOUT_HERO);
  const [story, setStory] = useState(DEFAULT_ABOUT_STORY);
  const [valuesDoc, setValuesDoc] = useState(DEFAULT_ABOUT_VALUES);
  const [selectedWork, setSelectedWork] = useState(DEFAULT_ABOUT_SELECTED_WORK);
  const [closing, setClosing] = useState(DEFAULT_ABOUT_CLOSING);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubHero = subscribeAboutHero(
      (data) => {
        setHero(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load about hero." });
        setLoading(false);
      },
    );
    const unsubStory = subscribeAboutStory(
      (data) => setStory(data),
      () => emitAlert({ type: "error", message: "Failed to load story section." }),
    );
    const unsubValuesDoc = subscribeAboutValuesDoc(
      (data) => setValuesDoc(data),
      () => emitAlert({ type: "error", message: "Failed to load values section." }),
    );
    const unsubSelected = subscribeAboutSelectedWork(
      (data) => setSelectedWork(data),
      () => emitAlert({ type: "error", message: "Failed to load selected work section." }),
    );
    const unsubClosing = subscribeAboutClosing(
      (data) => setClosing(data),
      () => emitAlert({ type: "error", message: "Failed to load closing section." }),
    );
    const unsubValues = subscribeAboutValues(
      (items) => setValues(items),
      () => emitAlert({ type: "error", message: "Failed to load values." }),
    );
    return () => {
      unsubHero();
      unsubStory();
      unsubValuesDoc();
      unsubSelected();
      unsubClosing();
      unsubValues();
    };
  }, []);

  const sortedValues = useMemo(
    () => [...values].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [values],
  );

  async function toggleValue(item) {
    try {
      await toggleAboutValueStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Value status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAboutValue(deleteTarget.id);
      emitAlert({ type: "success", message: "Value deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete value." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Samvatsara About</h1>
            <p className="text-sm text-gray-500">Manage the about page hero, story, values, selected work, and closing.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
        ) : (
          <>
            <HeroCard hero={hero} setHero={setHero} />
            <StoryCard story={story} setStory={setStory} />
            <ValuesCard
              valuesDoc={valuesDoc}
              setValuesDoc={setValuesDoc}
              values={sortedValues}
              onAdd={() => setModalState({ mode: "create", item: null })}
              onEdit={(item) => setModalState({ mode: "edit", item })}
              onToggle={toggleValue}
              onDelete={(item) => setDeleteTarget(item)}
            />
            <SelectedWorkCard selectedWork={selectedWork} setSelectedWork={setSelectedWork} />
            <ClosingCard closing={closing} setClosing={setClosing} />
          </>
        )}
      </div>

      {modalState ? <ValueModal mode={modalState.mode} item={modalState.item} items={values} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete value"
          message={`Delete "${deleteTarget.title}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

/* --------------------------------- hero ---------------------------------- */

function HeroCard({ hero, setHero }) {
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setHero((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!hero.headingLead?.trim()) nextErrors.headingLead = "Heading lead is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveAboutHero(hero);
      emitAlert({ type: "success", message: "Hero section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save hero." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Hero Section" title="About hero" onSave={save} saving={saving}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Badge"><input value={hero.badge || ""} onChange={(event) => setField("badge", event.target.value)} className={inputClass} /></Field>
          <Field label="Heading Lead" error={errors.headingLead}><input value={hero.headingLead || ""} onChange={(event) => setField("headingLead", event.target.value)} className={inputClass} /></Field>
          <Field label="Heading Italic"><input value={hero.headingItalic || ""} onChange={(event) => setField("headingItalic", event.target.value)} className={inputClass} /></Field>
          <Field label="Heading Tail"><input value={hero.headingTail || ""} onChange={(event) => setField("headingTail", event.target.value)} className={inputClass} /></Field>
        </div>
        <Field label="Intro"><textarea value={hero.intro || ""} onChange={(event) => setField("intro", event.target.value)} rows={3} className={textareaClass} /></Field>
      </div>
    </SectionCard>
  );
}

/* --------------------------------- story --------------------------------- */

function StoryCard({ story, setStory }) {
  const [saving, setSaving] = useState(false);
  const text = paragraphsToText(story.paragraphs);

  function setText(value) {
    setStory((prev) => ({ ...prev, paragraphs: value.split(/\n\s*\n/) }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveAboutStory(story);
      emitAlert({ type: "success", message: "Story section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save story." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Story Section" title="Our story" onSave={save} saving={saving}>
      <Field label="Paragraphs (separate each with a blank line)">
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={10} className={textareaClass} placeholder={"First paragraph...\n\nSecond paragraph..."} />
      </Field>
    </SectionCard>
  );
}

/* --------------------------------- values -------------------------------- */

function ValuesCard({ valuesDoc, setValuesDoc, values, onAdd, onEdit, onToggle, onDelete }) {
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setValuesDoc((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!valuesDoc.heading?.trim()) nextErrors.heading = "Heading is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveAboutValuesDoc(valuesDoc);
      emitAlert({ type: "success", message: "Values section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save values section." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Values Section" title="Values" onSave={save} saving={saving}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Eyebrow"><input value={valuesDoc.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} /></Field>
        <Field label="Heading" error={errors.heading}><input value={valuesDoc.heading || ""} onChange={(event) => setField("heading", event.target.value)} className={inputClass} /></Field>
        <Field label="Heading Italic"><input value={valuesDoc.headingItalic || ""} onChange={(event) => setField("headingItalic", event.target.value)} className={inputClass} /></Field>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Value Cards</p>
            <h3 className="mt-1 text-base font-bold text-gray-900">{values.length} values</h3>
          </div>
          <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Value
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[1fr_1.4fr_90px_90px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Title</span><span>Description</span><span>Icon</span><span>Status</span><span>Actions</span>
            </div>
            {values.length ? values.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_1.4fr_90px_90px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                <p className="truncate font-bold text-gray-900">{item.title}</p>
                <p className="truncate text-xs font-semibold text-gray-500">{item.description}</p>
                <span className="truncate text-xs font-semibold text-gray-500">{item.icon}</span>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${item.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{item.active === false ? "Inactive" : "Active"}</span>
                <div className="flex gap-2">
                  <button onClick={() => onToggle(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                  <button onClick={() => onEdit(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )) : (
              <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No values yet.</div>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function ValueModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, i) => Math.max(max, Number(i.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_VALUE,
    ...item,
    icon: VALUE_ICONS.includes(item?.icon) ? item.icon : "hand",
    order: Number(item?.order) || nextOrder,
    active: item?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateAboutValue(item.id, form);
        emitAlert({ type: "success", message: "Value updated." });
      } else {
        await createAboutValue(form);
        emitAlert({ type: "success", message: "Value added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save value." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Value" : "Add Value"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Value details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-4">
          <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
          <Field label="Description" error={errors.description}><textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} /></Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Icon">
              <select value={form.icon} onChange={(event) => setField("icon", event.target.value)} className={inputClass}>
                {VALUE_ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </Field>
            <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
            <Field label="Status">
              <button onClick={() => setField("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                <span>{form.active ? "Active" : "Inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
            </Field>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {mode === "edit" ? "Update Value" : "Add Value"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- selected work ----------------------------- */

function SelectedWorkCard({ selectedWork, setSelectedWork }) {
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setSelectedWork((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveAboutSelectedWork(selectedWork);
      emitAlert({ type: "success", message: "Selected work section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save selected work." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Selected Work" title="Selected work heading" onSave={save} saving={saving}>
      <p className="mb-4 text-xs text-gray-400">Cards come from the shared portfolio collection — this section controls only the heading.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Eyebrow"><input value={selectedWork.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} /></Field>
        <Field label="Heading"><input value={selectedWork.heading || ""} onChange={(event) => setField("heading", event.target.value)} className={inputClass} /></Field>
        <Field label="Heading Italic"><input value={selectedWork.headingItalic || ""} onChange={(event) => setField("headingItalic", event.target.value)} className={inputClass} /></Field>
      </div>
    </SectionCard>
  );
}

/* -------------------------------- closing -------------------------------- */

function ClosingCard({ closing, setClosing }) {
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setClosing((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveAboutClosing(closing);
      emitAlert({ type: "success", message: "Closing section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save closing." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Closing Section" title="Closing call to action" onSave={save} saving={saving}>
      <div className="space-y-4">
        <Field label="Quote"><textarea value={closing.quote || ""} onChange={(event) => setField("quote", event.target.value)} rows={3} className={textareaClass} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CTA Label"><input value={closing.ctaLabel || ""} onChange={(event) => setField("ctaLabel", event.target.value)} className={inputClass} /></Field>
          <Field label="CTA Href"><input value={closing.ctaHref || ""} onChange={(event) => setField("ctaHref", event.target.value)} className={inputClass} placeholder="/contact" /></Field>
        </div>
      </div>
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
