"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Edit3, Eye, EyeOff, Image as ImageIcon, Loader2, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import {
  DEFAULT_ABOUT_SECTIONS,
  createLeadCard,
  deleteAboutImage,
  deleteLeadCard,
  duplicateLeadCard,
  resetAboutSection,
  saveAboutSection,
  subscribeAboutSection,
  subscribeLeadCards,
  toggleLeadCardStatus,
  updateLeadCard,
  uploadAboutImage,
} from "../service/about.service";
import { ActionHeader, Field, formatDate, inputClass, textareaClass } from "../components/AboutAdminShared";

const SECTION_KEY = "lead-section";
const EMPTY_CARD = {
  title: "",
  description: "",
  imageUrl: "",
  imagePath: "",
  order: 0,
  active: true,
};

export default function AboutLeadSectionPage() {
  const [saved, setSaved] = useState(DEFAULT_ABOUT_SECTIONS[SECTION_KEY]);
  const [draft, setDraft] = useState(DEFAULT_ABOUT_SECTIONS[SECTION_KEY]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [autosaving, setAutosaving] = useState(false);

  useEffect(() => {
    return subscribeAboutSection(
      SECTION_KEY,
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load Lead Section." });
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
      await saveAboutSection(SECTION_KEY, draft);
      emitAlert({ type: "success", message: publish ? "Lead section published." : "Lead section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save lead section." });
    } finally {
      setSaving(false);
    }
  }

  async function resetSection() {
    setSaving(true);
    try {
      await resetAboutSection(SECTION_KEY);
      emitAlert({ type: "success", message: "Lead section reset." });
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
        title="About Us Lead Section"
        description="Edit the quality leads section and manage unlimited cards."
        lastUpdated={formatDate(saved.updatedAt)}
        active={draft.active !== false}
        dirty={dirty}
        autosaving={autosaving}
        saving={saving}
        onSave={() => save()}
        onPublish={() => save({ publish: true })}
        onPreview={() => document.getElementById("lead-preview")?.scrollIntoView({ behavior: "smooth" })}
        onReset={() => setConfirmReset(true)}
        onToggleActive={() => setField("active", draft.active === false)}
      />

      <div className="mx-auto mt-6 grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Lead Section Management</p>
          {loading ? (
            <div className="mt-5 space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label="Section Title" error={errors.title}>
                <input value={draft.title || ""} onChange={(event) => setField("title", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Section Description (optional)">
                <textarea value={draft.description || ""} onChange={(event) => setField("description", event.target.value)} rows={5} className={textareaClass} />
              </Field>
            </div>
          )}
        </section>

        <section id="lead-preview" className="space-y-4">
          <p className="text-sm font-bold text-gray-700">Live preview</p>
          <LeadPreview draft={draft} />
        </section>
      </div>

      <div className="mx-auto mt-5 max-w-7xl">
        <LeadCardManager />
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset lead section"
          message="Reset this section back to default content?"
          loading={saving}
          onConfirm={resetSection}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function LeadPreview({ draft }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    return subscribeLeadCards((items) => setCards(items.filter((item) => item.active !== false)), () => {});
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#050505] p-7 text-white shadow-sm">
      <h2 className="text-center text-4xl font-black tracking-normal">{draft.title || "Welcome to the World of Quality Leads"}</h2>
      {draft.description ? <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-6 text-white/70">{draft.description}</p> : null}
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.length ? cards.slice(0, 4).map((card) => (
          <article key={card.id} className="overflow-hidden rounded-2xl border border-white/55 bg-white/[0.055]">
            <div className="flex aspect-square items-center justify-center bg-white/[0.035]">
              {card.imageUrl ? <img src={card.imageUrl} alt="" className="h-full w-full object-contain p-5" /> : <ImageIcon className="h-12 w-12 text-white/30" />}
            </div>
            <div className="p-5 text-center">
              <h3 className="text-xl font-black uppercase">{card.title}</h3>
              {card.description ? <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-white/60">{card.description}</p> : null}
            </div>
          </article>
        )) : <div className="col-span-full rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/55">No active lead cards yet.</div>}
      </div>
    </div>
  );
}

function LeadCardManager() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeLeadCards(
      (items) => {
        setCards(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load lead cards." });
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

  const duplicateOrders = useMemo(() => {
    const counts = new Map();
    cards.forEach((card) => counts.set(Number(card.order) || 0, (counts.get(Number(card.order) || 0) || 0) + 1));
    return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([order]) => order));
  }, [cards]);

  async function toggleStatus(card) {
    try {
      await toggleLeadCardStatus(card.id, card.active === false);
      emitAlert({ type: "success", message: "Lead card status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function duplicate(card) {
    try {
      await duplicateLeadCard(card);
      emitAlert({ type: "success", message: "Lead card duplicated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to duplicate card." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteLeadCard(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deleteAboutImage(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Card deleted, but Storage cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: "Lead card deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete card." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Lead Card Management</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">{cards.length} cards</h2>
        </div>
        <button onClick={() => setModalState({ mode: "create", card: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
          <Plus className="h-4 w-4" /> Add New Card
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

      {duplicateOrders.size ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          Duplicate display order found: {[...duplicateOrders].join(", ")}.
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div>
      ) : filteredCards.length ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[80px_1.2fr_90px_90px_140px_180px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Preview</span><span>Card Title</span><span>Order</span><span>Status</span><span>Last Updated</span><span>Actions</span>
            </div>
            {filteredCards.map((card) => (
              <div key={card.id} className="grid grid-cols-[80px_1.2fr_90px_90px_140px_180px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  {card.imageUrl ? <img src={card.imageUrl} alt="" className="h-full w-full object-contain p-1" /> : <ImageIcon className="h-5 w-5 text-gray-300" />}
                </div>
                <p className="truncate font-bold text-gray-900">{card.title}</p>
                <span className={`font-bold ${duplicateOrders.has(Number(card.order) || 0) ? "text-amber-600" : "text-gray-600"}`}>{Number(card.order) || 0}</span>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${card.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{card.active === false ? "Inactive" : "Active"}</span>
                <span className="text-xs font-semibold text-gray-500">{formatDate(card.updatedAt)}</span>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(card)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{card.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                  <button onClick={() => duplicate(card)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => setModalState({ mode: "edit", card })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(card)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-500">
          No lead cards found. Add a card or adjust the search/filter.
        </div>
      )}

      {modalState ? <LeadCardModal mode={modalState.mode} card={modalState.card} cards={cards} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete lead card"
          message={`Delete "${deleteTarget.title}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </section>
  );
}

function LeadCardModal({ mode, card, cards, onClose }) {
  const nextOrder = useMemo(() => cards.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, [cards]);
  const [form, setForm] = useState(() => ({
    title: card?.title || "",
    description: card?.description || "",
    imageUrl: card?.imageUrl || "",
    imagePath: card?.imagePath || "",
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
      const uploaded = await uploadAboutImage({ file, sectionKey: SECTION_KEY, folder: "card", onProgress: setUploadProgress });
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
      await deleteAboutImage(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function save() {
    const nextErrors = {};
    if (!form.imageUrl) nextErrors.imageUrl = "Card image is required.";
    if (!form.title.trim()) nextErrors.title = "Card title is required.";
    const duplicateOrder = cards.some((item) => item.id !== card?.id && (Number(item.order) || 0) === (Number(form.order) || 0));
    if (duplicateOrder) nextErrors.order = "Display order already exists.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateLeadCard(card.id, form);
        emitAlert({ type: "success", message: "Lead card updated." });
      } else {
        await createLeadCard(form);
        emitAlert({ type: "success", message: "Lead card added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save lead card." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Lead Card" : "Add Lead Card"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Quality lead card content</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {form.imageUrl ? <img src={form.imageUrl} alt="Card preview" className="h-full w-full object-contain p-5" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
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
            <Field label="Card Title" error={errors.title}>
              <input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} placeholder="HIGH QUALITY" />
            </Field>
            <Field label="Card Short Description (optional)">
              <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Display Order" error={errors.order}>
                <input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} />
              </Field>
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
