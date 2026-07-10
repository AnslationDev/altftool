"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Image as ImageIcon, Loader2, Plus, Search, Trash2, Upload, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  createTrafficCard,
  deleteAdvertiserImage,
  deleteTrafficCard,
  resetAdvertiserSection,
  saveAdvertiserSection,
  subscribeAdvertiserSection,
  subscribeTrafficCards,
  toggleTrafficCardStatus,
  updateTrafficCard,
  uploadAdvertiserImage,
  DEFAULT_ADVERTISER_SECTIONS,
} from "../service/advertiser.service";
import { ActionHeader, Field, formatDate, inputClass, textareaClass } from "../components/AdvertiserAdminShared";

const SECTION_KEY = "traffic-types";

const EMPTY_CARD = {
  title: "",
  description: "",
  imageUrl: "",
  imagePath: "",
  order: 0,
  active: true,
};

export default function AdvertiserTrafficTypesPage() {
  const [saved, setSaved] = useState(DEFAULT_ADVERTISER_SECTIONS[SECTION_KEY]);
  const [draft, setDraft] = useState(DEFAULT_ADVERTISER_SECTIONS[SECTION_KEY]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [autosaving, setAutosaving] = useState(false);

  useEffect(() => {
    return subscribeAdvertiserSection(
      SECTION_KEY,
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load traffic types section." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  useEffect(() => {
    const handler = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    setAutosaving(true);
    const timer = setTimeout(() => setAutosaving(false), 700);
    return () => clearTimeout(timer);
  }, [draft, dirty]);

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save({ publish = false } = {}) {
    const nextErrors = {};
    if (!draft.title?.trim()) nextErrors.title = "Section title is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      await saveAdvertiserSection(SECTION_KEY, draft);
      emitAlert({ type: "success", message: publish ? "Traffic types published." : "Traffic types saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save traffic types." });
    } finally {
      setSaving(false);
    }
  }

  async function resetSection() {
    setSaving(true);
    try {
      await resetAdvertiserSection(SECTION_KEY);
      emitAlert({ type: "success", message: "Traffic types section reset." });
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
        title="Traffic Types"
        description="Manage the section title and the six traffic cards."
        lastUpdated={formatDate(saved.updatedAt)}
        active={draft.active !== false}
        dirty={dirty}
        autosaving={autosaving}
        saving={saving}
        onSave={() => save()}
        onPublish={() => save({ publish: true })}
        onPreview={() => document.getElementById("traffic-preview")?.scrollIntoView({ behavior: "smooth" })}
        onReset={() => setConfirmReset(true)}
        onToggleActive={() => setField("active", draft.active === false)}
      />

      <div className="mx-auto mt-6 grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Traffic Type Management</p>
          {loading ? (
            <div className="mt-5 space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label="Section Title" error={errors.title}>
                <input value={draft.title || ""} onChange={(event) => setField("title", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Section Subtitle">
                <input value={draft.subtitle || ""} onChange={(event) => setField("subtitle", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Section Description (optional)">
                <textarea value={draft.description || ""} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} />
              </Field>
              <button onClick={() => setField("active", draft.active === false)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active !== false ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                <span>{draft.active !== false ? "Section active" : "Section inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${draft.active !== false ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
            </div>
          )}
        </section>

        <section id="traffic-preview" className="space-y-4">
          <p className="text-sm font-bold text-gray-700">Live preview</p>
          <TrafficPreview draft={draft} />
        </section>
      </div>

      <div className="mx-auto mt-5 max-w-7xl">
        <TrafficCardManager />
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset traffic types"
          message="Reset this section back to default content?"
          loading={saving}
          onConfirm={resetSection}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function TrafficPreview({ draft }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    return subscribeTrafficCards((items) => setCards(items.filter((item) => item.active !== false)), () => {});
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#050505] shadow-sm">
      <div className="relative min-h-[560px] bg-[linear-gradient(115deg,#050505_0%,#050505_46%,#28135f_100%)] p-8 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.24)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-center">
            <h2 className="text-5xl font-black tracking-normal md:text-6xl">
              <span className="block">{draft.title || "Traffic"}</span>
              <span className="block font-light">{draft.subtitle || "Types"}</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm font-semibold leading-6 text-white/65">{draft.description}</p>
            <span className="mt-8 w-fit rounded-full border border-white/70 px-7 py-3 text-sm font-bold">{draft.buttonText || "Connect with us"}</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.length ? cards.slice(0, 6).map((card) => (
              <article key={card.id} className="relative rounded-2xl bg-[#181818] p-5 shadow-sm">
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt="" className="absolute right-0 top-0 h-20 w-20 object-contain p-3" />
                ) : (
                  <ImageIcon className="absolute right-4 top-4 h-8 w-8 text-white/25" />
                )}
                <h3 className="mt-20 text-3xl font-black">{card.title}</h3>
                {card.description ? <p className="mt-4 max-w-xs text-sm leading-6 text-white/78">{card.description}</p> : null}
              </article>
            )) : (
              <div className="col-span-full rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/55">No active traffic cards yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrafficCardManager() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeTrafficCards(
      (items) => {
        setCards(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load traffic cards." });
      },
    );
  }, []);

  const filteredCards = useMemo(() => {
    const search = query.trim().toLowerCase();
    return cards
      .filter((card) => {
        const matchesSearch = !search || card.title?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && card.active !== false) ||
          (statusFilter === "inactive" && card.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "updated") return (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0);
        return (Number(a.order) || 0) - (Number(b.order) || 0);
      });
  }, [cards, query, statusFilter, sortBy]);

  async function toggleStatus(card) {
    try {
      await toggleTrafficCardStatus(card.id, card.active === false);
      emitAlert({ type: "success", message: "Traffic card status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTrafficCard(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deleteAdvertiserImage(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Card deleted, but Storage cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: "Traffic card deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete traffic card." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Traffic Card Management</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">{cards.length} cards</h2>
        </div>
        <button onClick={() => setModalState({ mode: "create", card: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
          <Plus className="h-4 w-4" /> Add Card
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_220px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by card title" />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className={inputClass}>
          <option value="order">Sort by Display Order</option>
          <option value="updated">Sort by Recently Updated</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div>
      ) : filteredCards.length ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[80px_1.2fr_1.2fr_90px_90px_140px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Preview</span><span>Title</span><span>Description</span><span>Order</span><span>Status</span><span>Actions</span>
            </div>
            {filteredCards.map((card) => (
              <div key={card.id} className="grid grid-cols-[80px_1.2fr_1.2fr_90px_90px_140px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  {card.imageUrl ? <img src={card.imageUrl} alt="" className="h-full w-full object-contain p-1" /> : <ImageIcon className="h-5 w-5 text-gray-300" />}
                </div>
                <p className="truncate font-bold text-gray-900">{card.title}</p>
                <p className="truncate text-xs font-semibold text-gray-500">{card.description}</p>
                <span className="font-bold text-gray-600">{Number(card.order) || 0}</span>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${card.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{card.active === false ? "Inactive" : "Active"}</span>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(card)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{card.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                  <button onClick={() => setModalState({ mode: "edit", card })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(card)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-500">
          No cards found. Add a card or adjust search/filter.
        </div>
      )}

      {modalState ? <TrafficCardModal mode={modalState.mode} card={modalState.card} cards={cards} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete traffic card"
          message={`Delete "${deleteTarget.title}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </section>
  );
}

function TrafficCardModal({ mode, card, cards, onClose }) {
  const nextOrder = useMemo(() => cards.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, [cards]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_CARD,
    ...card,
    order: Number(card?.order) || nextOrder,
    active: card?.active !== false,
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
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Card image must be an image file." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Card image must be 8MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadAdvertiserImage({ file, sectionKey: SECTION_KEY, folder: "card", onProgress: setUploadProgress });
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
      emitAlert({ type: "success", message: "Card image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    const path = form.imagePath;
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deleteAdvertiserImage(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function save() {
    const nextErrors = {};
    if (!form.imageUrl) nextErrors.imageUrl = "Card image is required.";
    if (!form.title.trim()) nextErrors.title = "Card title is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateTrafficCard(card.id, form);
        emitAlert({ type: "success", message: "Traffic card updated." });
      } else {
        await createTrafficCard(form);
        emitAlert({ type: "success", message: "Traffic card added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save traffic card." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Traffic Card" : "Add Traffic Card"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Traffic type card</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {form.imageUrl ? <img src={form.imageUrl} alt="Card preview" className="h-full w-full object-contain p-6" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
            </div>
            {errors.imageUrl ? <p className="mt-2 text-xs font-medium text-red-500">{errors.imageUrl}</p> : null}
            {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
            <div className="mt-3 flex gap-2">
              <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
                <Upload className="h-3.5 w-3.5" /> Upload
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => uploadImage(event.target.files?.[0])} />
              </label>
              {form.imageUrl ? <button onClick={removeImage} className="rounded-xl border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button> : null}
            </div>
          </div>
          <div className="space-y-4">
            <Field label="Card Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} placeholder="Search" /></Field>
            <Field label="Card Description">
              <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} />
            </Field>
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
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {mode === "edit" ? "Update Card" : "Add Card"}
          </button>
        </div>
      </div>
    </div>
  );
}
