"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Info, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_PHILOSOPHY,
  createAboutPrinciple,
  deleteAboutPrinciple,
  saveAboutHero,
  saveAboutPhilosophy,
  subscribeAboutHero,
  subscribeAboutPhilosophy,
  subscribeAboutPrinciples,
  toggleAboutPrincipleStatus,
  updateAboutPrinciple,
} from "./service/about.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_PRINCIPLE = { title: "", description: "", order: 0, active: true };

export default function AboutUsPage() {
  const [hero, setHero] = useState(DEFAULT_ABOUT_HERO);
  const [philosophy, setPhilosophy] = useState(DEFAULT_ABOUT_PHILOSOPHY);
  const [principles, setPrinciples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [principleModal, setPrincipleModal] = useState(null);
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
    const unsubPhilosophy = subscribeAboutPhilosophy(
      (data) => setPhilosophy(data),
      () => emitAlert({ type: "error", message: "Failed to load philosophy section." }),
    );
    const unsubPrinciples = subscribeAboutPrinciples(
      (items) => setPrinciples(items),
      () => emitAlert({ type: "error", message: "Failed to load principles." }),
    );
    return () => {
      unsubHero();
      unsubPhilosophy();
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

  async function confirmDeletePrinciple() {
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
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dealnbook About</h1>
            <p className="text-sm text-gray-500">Manage the about page hero, philosophy quote, and principle cards.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
        ) : (
          <>
            <HeroCard hero={hero} setHero={setHero} />
            <PhilosophyCard philosophy={philosophy} setPhilosophy={setPhilosophy} />
            <PrinciplesCard
              principles={sortedPrinciples}
              onAdd={() => setPrincipleModal({ mode: "create", item: null })}
              onEdit={(item) => setPrincipleModal({ mode: "edit", item })}
              onToggle={togglePrinciple}
              onDelete={(item) => setDeleteTarget(item)}
            />
          </>
        )}
      </div>

      {principleModal ? <PrincipleModal mode={principleModal.mode} item={principleModal.item} items={principles} onClose={() => setPrincipleModal(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete principle"
          message={`Delete "${deleteTarget.title}"?`}
          loading={deleteLoading}
          onConfirm={confirmDeletePrinciple}
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
    if (!hero.heading?.trim()) nextErrors.heading = "Heading is required.";
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Eyebrow"><input value={hero.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} /></Field>
        <Field label="Heading" error={errors.heading}><input value={hero.heading || ""} onChange={(event) => setField("heading", event.target.value)} className={inputClass} /></Field>
      </div>
      <Field label="Image URL"><input value={hero.imageUrl || ""} onChange={(event) => setField("imageUrl", event.target.value)} className={inputClass} placeholder="https://..." /></Field>
    </SectionCard>
  );
}

/* ------------------------------ philosophy -------------------------------- */

function PhilosophyCard({ philosophy, setPhilosophy }) {
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setPhilosophy((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveAboutPhilosophy(philosophy);
      emitAlert({ type: "success", message: "Philosophy section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save philosophy." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Philosophy Section" title="Quote" onSave={save} saving={saving}>
      <Field label="Quote"><textarea value={philosophy.quote || ""} onChange={(event) => setField("quote", event.target.value)} rows={3} className={textareaClass} /></Field>
    </SectionCard>
  );
}

/* -------------------------------- principles ------------------------------- */

function PrinciplesCard({ principles, onAdd, onEdit, onToggle, onDelete }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Principles</p>
          <h3 className="mt-1 text-base font-bold text-gray-900">{principles.length} principles</h3>
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
          <Plus className="h-4 w-4" /> Add Principle
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[1fr_1.6fr_90px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span>Title</span><span>Description</span><span>Status</span><span>Actions</span>
          </div>
          {principles.length ? principles.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_1.6fr_90px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
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

/* -------------------------------- shared --------------------------------- */

function SectionCard({ eyebrow, title, onSave, saving, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">{title}</h2>
        </div>
        <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
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
