"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Image as ImageIcon, Info, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_ORIGIN,
  DEFAULT_ABOUT_PRINCIPLES,
  DEFAULT_ABOUT_STAT_BLOCK,
  createAboutPrinciple,
  deleteAboutHeroImage,
  deleteAboutPrinciple,
  saveAboutHero,
  saveAboutOrigin,
  saveAboutPrinciplesDoc,
  saveAboutStatBlock,
  subscribeAboutHero,
  subscribeAboutOrigin,
  subscribeAboutPrinciples,
  subscribeAboutPrinciplesDoc,
  subscribeAboutStatBlock,
  toggleAboutPrincipleStatus,
  updateAboutPrinciple,
  uploadAboutHeroImage,
} from "./service/about.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_PRINCIPLE = { title: "", description: "", order: 0, active: true };

export default function AboutUsPage() {
  const [hero, setHero] = useState(DEFAULT_ABOUT_HERO);
  const [origin, setOrigin] = useState(DEFAULT_ABOUT_ORIGIN);
  const [statBlock, setStatBlock] = useState(DEFAULT_ABOUT_STAT_BLOCK);
  const [principlesDoc, setPrinciplesDoc] = useState(DEFAULT_ABOUT_PRINCIPLES);
  const [principles, setPrinciples] = useState([]);
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
    const unsubOrigin = subscribeAboutOrigin(
      (data) => setOrigin(data),
      () => emitAlert({ type: "error", message: "Failed to load origin section." }),
    );
    const unsubStat = subscribeAboutStatBlock(
      (data) => setStatBlock(data),
      () => emitAlert({ type: "error", message: "Failed to load stat block." }),
    );
    const unsubPrinDoc = subscribeAboutPrinciplesDoc(
      (data) => setPrinciplesDoc(data),
      () => emitAlert({ type: "error", message: "Failed to load principles section." }),
    );
    const unsubPrinciples = subscribeAboutPrinciples(
      (items) => setPrinciples(items),
      () => emitAlert({ type: "error", message: "Failed to load principles." }),
    );
    return () => {
      unsubHero();
      unsubOrigin();
      unsubStat();
      unsubPrinDoc();
      unsubPrinciples();
    };
  }, []);

  const sortedPrinciples = useMemo(
    () => [...principles].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [principles],
  );

  async function togglePrinciple(item) {
    try {
      await toggleAboutPrincipleStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Principle status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAboutPrinciple(deleteTarget.id);
      emitAlert({ type: "success", message: "Principle deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete principle." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DailyHnt About</h1>
            <p className="text-sm text-gray-500">Manage the about page hero, origin, stat block, and principles.</p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
            ) : (
              <>
                <HeroCard hero={hero} setHero={setHero} />
                <OriginCard origin={origin} setOrigin={setOrigin} />
                <StatBlockCard statBlock={statBlock} setStatBlock={setStatBlock} />
                <PrinciplesCard
                  principlesDoc={principlesDoc}
                  setPrinciplesDoc={setPrinciplesDoc}
                  principles={sortedPrinciples}
                  onAdd={() => setModalState({ mode: "create", item: null })}
                  onEdit={(item) => setModalState({ mode: "edit", item })}
                  onToggle={togglePrinciple}
                  onDelete={(item) => setDeleteTarget(item)}
                />
              </>
            )}
          </div>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-bold text-gray-900">Live preview</h2>
              </div>
              <AboutPreview
                hero={hero}
                origin={origin}
                statBlock={statBlock}
                principlesDoc={principlesDoc}
                principles={sortedPrinciples}
              />
            </div>
          </div>
        </div>
      </div>

      {modalState ? <PrincipleModal mode={modalState.mode} item={modalState.item} items={principles} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete principle"
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function setField(key, value) {
    setHero((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function uploadImage(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Hero image must be an image file." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Hero image must be 8MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadAboutHeroImage({ file, onProgress: setUploadProgress });
      setHero((prev) => ({ ...prev, image: uploaded.url, imagePath: uploaded.path }));
      emitAlert({ type: "success", message: "Hero image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    const path = hero.imagePath;
    setHero((prev) => ({ ...prev, image: "", imagePath: "" }));
    try {
      await deleteAboutHeroImage(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function save() {
    const nextErrors = {};
    if (!hero.title?.trim()) nextErrors.title = "Title is required.";
    if (!hero.body?.trim()) nextErrors.body = "Body is required.";
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
    <SectionCard eyebrow="Hero Section" title="About hero" onSave={save} saving={saving} disabled={uploading}>
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div>
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            {hero.image ? <img src={hero.image} alt="Hero preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
          </div>
          {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
          <div className="mt-3 flex gap-2">
            <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
              <Upload className="h-3.5 w-3.5" /> Upload
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => uploadImage(event.target.files?.[0])} />
            </label>
            {hero.image ? <button onClick={removeImage} className="rounded-xl border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button> : null}
          </div>
        </div>
        <div className="space-y-4">
          <Field label="Eyebrow"><input value={hero.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} /></Field>
          <Field label="Title" error={errors.title}><input value={hero.title || ""} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
          <Field label="Body" error={errors.body}><textarea value={hero.body || ""} onChange={(event) => setField("body", event.target.value)} rows={4} className={textareaClass} /></Field>
        </div>
      </div>
    </SectionCard>
  );
}

/* -------------------------------- origin --------------------------------- */

function OriginCard({ origin, setOrigin }) {
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setOrigin((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!origin.title?.trim()) nextErrors.title = "Title is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveAboutOrigin(origin);
      emitAlert({ type: "success", message: "Origin section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save origin." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Origin Section" title="Origin story" onSave={save} saving={saving}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Eyebrow"><input value={origin.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} /></Field>
          <Field label="Terminal Label"><input value={origin.terminalLabel || ""} onChange={(event) => setField("terminalLabel", event.target.value)} className={inputClass} /></Field>
        </div>
        <Field label="Title" error={errors.title}><input value={origin.title || ""} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
        <Field label="Body"><textarea value={origin.body || ""} onChange={(event) => setField("body", event.target.value)} rows={4} className={textareaClass} /></Field>
      </div>
    </SectionCard>
  );
}

/* ------------------------------- stat block ------------------------------ */

function StatBlockCard({ statBlock, setStatBlock }) {
  const [saving, setSaving] = useState(false);
  const items = Array.isArray(statBlock.items) ? statBlock.items : [];

  function updateItem(index, key, value) {
    setStatBlock((prev) => {
      const next = [...(prev.items || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, items: next };
    });
  }

  function addItem() {
    setStatBlock((prev) => ({ ...prev, items: [...(prev.items || []), { value: "", label: "" }] }));
  }

  function removeItem(index) {
    setStatBlock((prev) => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveAboutStatBlock(statBlock);
      emitAlert({ type: "success", message: "Stat block saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save stat block." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Stat Block" title="Statistics" onSave={save} saving={saving}>
      <div className="space-y-3">
        {items.length ? items.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-[1fr_1fr_44px]">
            <Field label="Value"><input value={item.value || ""} onChange={(event) => updateItem(index, "value", event.target.value)} className={inputClass} placeholder="10K+" /></Field>
            <Field label="Label"><input value={item.label || ""} onChange={(event) => updateItem(index, "label", event.target.value)} className={inputClass} placeholder="Daily readers" /></Field>
            <button onClick={() => removeItem(index)} className="mt-6 flex h-11 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        )) : (
          <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm font-semibold text-gray-400">No stats yet.</p>
        )}
        <button onClick={addItem} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <Plus className="h-4 w-4" /> Add stat
        </button>
      </div>
    </SectionCard>
  );
}

/* ------------------------------ principles ------------------------------- */

function PrinciplesCard({ principlesDoc, setPrinciplesDoc, principles, onAdd, onEdit, onToggle, onDelete }) {
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setPrinciplesDoc((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!principlesDoc.title?.trim()) nextErrors.title = "Title is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveAboutPrinciplesDoc(principlesDoc);
      emitAlert({ type: "success", message: "Principles section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save principles section." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Principles Section" title="Principles" onSave={save} saving={saving}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Eyebrow"><input value={principlesDoc.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} /></Field>
          <Field label="Brand"><input value={principlesDoc.brand || ""} onChange={(event) => setField("brand", event.target.value)} className={inputClass} /></Field>
          <Field label="Title" error={errors.title}><input value={principlesDoc.title || ""} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
          <Field label="Center Title"><input value={principlesDoc.centerTitle || ""} onChange={(event) => setField("centerTitle", event.target.value)} className={inputClass} /></Field>
        </div>
        <Field label="Center Body"><textarea value={principlesDoc.centerBody || ""} onChange={(event) => setField("centerBody", event.target.value)} rows={3} className={textareaClass} /></Field>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Principle Cards</p>
            <h3 className="mt-1 text-base font-bold text-gray-900">{principles.length} principles</h3>
          </div>
          <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Principle
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[1fr_1.4fr_90px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Title</span><span>Description</span><span>Status</span><span>Actions</span>
            </div>
            {principles.length ? principles.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_1.4fr_90px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                <p className="truncate font-bold text-gray-900">{item.title}</p>
                <p className="truncate text-xs font-semibold text-gray-500">{item.description}</p>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${item.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{item.active === false ? "Inactive" : "Active"}</span>
                <div className="flex gap-2">
                  <button onClick={() => onToggle(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                  <button onClick={() => onEdit(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )) : (
              <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No principles yet.</div>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function PrincipleModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, i) => Math.max(max, Number(i.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_PRINCIPLE,
    ...item,
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
        await updateAboutPrinciple(item.id, form);
        emitAlert({ type: "success", message: "Principle updated." });
      } else {
        await createAboutPrinciple(form);
        emitAlert({ type: "success", message: "Principle added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save principle." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Principle" : "Add Principle"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Principle details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-4">
          <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
          <Field label="Description" error={errors.description}><textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
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
            {mode === "edit" ? "Update Principle" : "Add Principle"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ live preview ----------------------------- */

const DH = {
  bg: "#0a0a0a",
  raised: "#111111",
  text: "#ededed",
  dim: "#8a8a8a",
  accent: "#c6f135",
  border: "#262626",
};

function PrinciplePreviewCard({ index, item }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: DH.border, background: DH.raised }}>
      <span className="font-mono text-[11px]" style={{ color: DH.accent }}>
        {String(index).padStart(2, "0")}
      </span>
      <h5 className="mt-2 text-sm font-bold leading-snug" style={{ color: DH.text }}>
        {item.title || "Principle title"}
      </h5>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: DH.dim }}>
        {item.description || "Principle description."}
      </p>
    </div>
  );
}

function AboutPreview({ hero, origin, statBlock, principlesDoc, principles }) {
  const stats = Array.isArray(statBlock?.items) ? statBlock.items : [];
  const activePrinciples = (principles || []).filter((item) => item.active !== false);
  const left = activePrinciples.slice(0, 2);
  const right = activePrinciples.slice(2, 4);

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: DH.border, background: DH.bg }}>
      {/* Hero */}
      <div className="border-b p-6" style={{ borderColor: DH.border }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: DH.accent }}>
          {hero?.eyebrow || "$ whoami"}
        </p>
        <h3 className="mt-3 text-2xl font-bold leading-tight" style={{ color: DH.text }}>
          {hero?.title || "About DailyHnt"}
        </h3>
        {hero?.body ? (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: DH.dim }}>
            {hero.body}
          </p>
        ) : null}
      </div>

      {/* Origin + stat block */}
      <div className="border-b p-6" style={{ borderColor: DH.border }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: DH.accent }}>
          {origin?.eyebrow || "Origin"}
        </p>
        <h4 className="mt-2 text-lg font-bold leading-snug" style={{ color: DH.text }}>
          {origin?.title || "Origin story"}
        </h4>
        <div className="mt-4 rounded-lg border p-5" style={{ borderColor: DH.border, background: DH.raised }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: DH.dim }}>
            {origin?.terminalLabel || "~/about"}
          </span>
          {origin?.body ? (
            <p className="mt-3 text-xs leading-relaxed" style={{ color: DH.dim }}>
              {origin.body}
            </p>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4" style={{ borderColor: DH.border }}>
            {stats.length ? (
              stats.map((stat, index) => (
                <div key={index}>
                  <p className="text-xl font-bold" style={{ color: DH.accent }}>
                    {stat.value || "—"}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: DH.dim }}>
                    {stat.label || "Label"}
                  </p>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-xs" style={{ color: DH.dim }}>
                No stats yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Principles */}
      <div className="p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: DH.accent }}>
          {principlesDoc?.eyebrow || "Principles"}
        </p>
        <h4 className="mt-2 text-lg font-bold leading-snug" style={{ color: DH.text }}>
          {principlesDoc?.title || "How we make decisions."}
        </h4>

        <div className="relative mt-6 grid items-center gap-4 sm:grid-cols-3">
          <div className="space-y-4">
            {left.length ? (
              left.map((item, index) => <PrinciplePreviewCard key={item.id || index} index={index + 1} item={item} />)
            ) : (
              <div className="rounded-xl border p-4 text-xs" style={{ borderColor: DH.border, color: DH.dim }}>
                No principles yet.
              </div>
            )}
          </div>

          <div
            className="rounded-2xl border px-5 py-8 text-center"
            style={{
              borderColor: "rgba(198,241,53,0.4)",
              background: DH.bg,
              boxShadow: "0 0 60px rgba(198,241,53,0.14)",
            }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: DH.accent }}>
              {principlesDoc?.brand || "DailyHnt"}
            </span>
            <h3 className="mt-4 text-2xl font-bold leading-tight" style={{ color: DH.text }}>
              {principlesDoc?.centerTitle || "Our Principles"}
            </h3>
            {principlesDoc?.centerBody ? (
              <p className="mt-3 text-xs leading-relaxed" style={{ color: DH.dim }}>
                {principlesDoc.centerBody}
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            {right.map((item, index) => (
              <PrinciplePreviewCard key={item.id || index} index={index + 3} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
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
