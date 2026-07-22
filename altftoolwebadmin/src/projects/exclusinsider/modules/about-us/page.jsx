"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  Gem,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  CollectionManager,
  Field,
  SectionFrame,
  SettingsCard,
  inputClass,
  textareaClass,
} from "../_shared/AdminSectionShared";
import {
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_STORY,
  createAboutStat,
  createAboutTimelineEntry,
  createAboutValue,
  deleteAboutStat,
  deleteAboutTimelineEntry,
  deleteAboutTimelineImage,
  deleteAboutValue,
  saveAboutHero,
  saveAboutStory,
  subscribeAboutHero,
  subscribeAboutStats,
  subscribeAboutStory,
  subscribeAboutTimeline,
  subscribeAboutValues,
  toggleAboutStatStatus,
  toggleAboutTimelineStatus,
  toggleAboutValueStatus,
  updateAboutStat,
  updateAboutTimelineEntry,
  updateAboutValue,
  uploadAboutTimelineImage,
} from "./service/aboutUs.service";

const EMPTY_TIMELINE_ENTRY = { year: "", title: "", description: "", image: "", imagePath: "", order: 0, active: true };

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ExclusInsider About</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the About page — edit on the left, see a live preview on the right where available. Each block saves on its own.
            </p>
          </div>
        </div>

        <HeroSection />
        <ValuesSection />
        <StorySection />
        <TimelineSection />
        <StatsSection />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1) Hero — doc about/hero                                                   */
/* -------------------------------------------------------------------------- */
function HeroSection() {
  return (
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Top-of-page headline shown on the About page.">
      <SettingsCard
        eyebrow="Hero Section"
        title="About hero"
        defaults={DEFAULT_ABOUT_HERO}
        subscribe={subscribeAboutHero}
        save={saveAboutHero}
        errorLabel="about hero"
        fields={[
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subheading", label: "Subheading", type: "textarea", rows: 3 },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* 2) Values — collection aboutValues                                        */
/* -------------------------------------------------------------------------- */
function ValuesSection() {
  return (
    <SectionFrame index={2} icon={Gem} title="Values" subtitle="The operating-principle cards shown under 'What We Won't Compromise On'.">
      <CollectionManager
        eyebrow="Values"
        title="Values"
        itemNoun="value"
        subscribe={subscribeAboutValues}
        create={createAboutValue}
        update={updateAboutValue}
        remove={deleteAboutValue}
        toggle={toggleAboutValueStatus}
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3, required: true },
        ]}
        columns={[{ key: "title", label: "Title", primary: true }]}
        itemLabel={(item) => item.title}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* 3) Story — doc about/story                                                 */
/* -------------------------------------------------------------------------- */
function StorySection() {
  return (
    <SectionFrame index={3} icon={BookOpen} title="Story Headings" subtitle="Eyebrow/heading copy for the story and journey blocks.">
      <SettingsCard
        eyebrow="Story Section"
        title="Story & journey headings"
        defaults={DEFAULT_ABOUT_STORY}
        subscribe={subscribeAboutStory}
        save={saveAboutStory}
        errorLabel="about story"
        fields={[
          { key: "eyebrowStory", label: "Story Eyebrow", type: "text", half: true },
          { key: "headingStory", label: "Story Heading", type: "text", half: true, required: true },
          { key: "eyebrowJourney", label: "Journey Eyebrow", type: "text", half: true },
          { key: "headingJourney", label: "Journey Heading", type: "text", half: true, required: true },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* 4) Timeline — collection aboutTimeline (image upload)                     */
/* -------------------------------------------------------------------------- */
function TimelineSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeAboutTimeline(
      (list) => {
        setItems(list);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load timeline entries." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [items],
  );

  async function toggleEntry(item) {
    try {
      await toggleAboutTimelineStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Timeline entry status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAboutTimelineEntry(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deleteAboutTimelineImage(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Entry deleted, but image cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: "Timeline entry deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete entry." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <SectionFrame index={4} icon={Clock} title="Timeline" subtitle="Year-by-year story entries, each with a photo.">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Timeline</p>
            <h3 className="mt-1 text-base font-bold text-gray-900">{items.length} entries</h3>
          </div>
          <button
            onClick={() => setModalState({ mode: "create", item: null })}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" /> Add Entry
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[64px_90px_1fr_90px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Image</span><span>Year</span><span>Title</span><span>Status</span><span>Actions</span>
            </div>
            {loading ? (
              <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">Loading timeline…</div>
            ) : sorted.length ? sorted.map((item) => (
              <div key={item.id} className="grid grid-cols-[64px_90px_1fr_90px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="m-3.5 h-5 w-5 text-gray-300" />}
                </div>
                <p className="truncate text-xs font-bold text-gray-900">{item.year}</p>
                <p className="truncate font-bold text-gray-900">{item.title}</p>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${item.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{item.active === false ? "Inactive" : "Active"}</span>
                <div className="flex gap-2">
                  <button onClick={() => toggleEntry(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                  <button onClick={() => setModalState({ mode: "edit", item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )) : (
              <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No timeline entries yet.</div>
            )}
          </div>
        </div>
      </div>

      {modalState ? (
        <TimelineModal mode={modalState.mode} item={modalState.item} items={items} onClose={() => setModalState(null)} />
      ) : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete timeline entry"
          message={`Delete "${deleteTarget.title || deleteTarget.year}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </SectionFrame>
  );
}

function TimelineModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, i) => Math.max(max, Number(i.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_TIMELINE_ENTRY,
    ...item,
    order: Number(item?.order) || nextOrder,
    active: item?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function uploadImage(file) {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadAboutTimelineImage({ file, onProgress: setUploadProgress });
      setForm((prev) => ({ ...prev, image: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, image: "" }));
      emitAlert({ type: "success", message: "Timeline image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    const path = form.imagePath;
    setForm((prev) => ({ ...prev, image: "", imagePath: "" }));
    try {
      await deleteAboutTimelineImage(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function save() {
    const nextErrors = {};
    if (!form.year.trim()) nextErrors.year = "Year is required.";
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateAboutTimelineEntry(item.id, form);
        emitAlert({ type: "success", message: "Timeline entry updated." });
      } else {
        await createAboutTimelineEntry(form);
        emitAlert({ type: "success", message: "Timeline entry added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save entry." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Entry" : "Add Entry"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Timeline entry details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {form.image ? <img src={form.image} alt="Timeline preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
            </div>
            {errors.image ? <p className="mt-2 text-xs font-medium text-red-500">{errors.image}</p> : null}
            {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
            <div className="mt-3 flex gap-2">
              <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
                <Upload className="h-3.5 w-3.5" /> Upload
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => uploadImage(event.target.files?.[0])} />
              </label>
              {form.image ? <button onClick={removeImage} className="rounded-xl border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button> : null}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Year" error={errors.year}><input value={form.year} onChange={(event) => setField("year", event.target.value)} className={inputClass} placeholder="2026" /></Field>
              <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
            </div>
            <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
            <Field label="Description" error={errors.description}><textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} /></Field>
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
          <button onClick={save} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {mode === "edit" ? "Update Entry" : "Add Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5) Stats — collection aboutStats                                          */
/* -------------------------------------------------------------------------- */
function StatsSection() {
  return (
    <SectionFrame index={5} icon={Sparkles} title="Stats" subtitle="The stat counters shown at the bottom of the story section.">
      <CollectionManager
        eyebrow="Stats"
        title="Stat counters"
        itemNoun="stat"
        subscribe={subscribeAboutStats}
        create={createAboutStat}
        update={updateAboutStat}
        remove={deleteAboutStat}
        toggle={toggleAboutStatStatus}
        fields={[
          { key: "value", label: "Value", type: "text", required: true, half: true, placeholder: "10+" },
          { key: "label", label: "Label", type: "text", required: true, half: true },
        ]}
        columns={[
          { key: "value", label: "Value", primary: true },
          { key: "label", label: "Label" },
        ]}
        itemLabel={(item) => item.label}
      />
    </SectionFrame>
  );
}
