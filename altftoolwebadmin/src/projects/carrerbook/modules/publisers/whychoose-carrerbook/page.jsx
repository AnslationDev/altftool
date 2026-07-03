"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Image as ImageIcon, Loader2, Plus, Search, Trash2, Upload, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { Field, inputClass } from "../../home/components/HomeSectionShared";
import {
  createWhyCareerBookCard,
  deletePublisherImage,
  deleteWhyCareerBookCard,
  subscribeWhyCareerBookCards,
  toggleWhyCareerBookCardStatus,
  updateWhyCareerBookCard,
  uploadPublisherImage,
} from "../service/publisher.service";

const EMPTY_CARD = {
  title: "",
  imageUrl: "",
  imagePath: "",
  order: 0,
  active: true,
};

export default function WhyChooseCareerBookTab({ draft, setField, errors }) {
  return {
    editor: <WhySectionSettings draft={draft} setField={setField} errors={errors} />,
    preview: (
      <div className="space-y-4">
        <WhyCareerBookPreview draft={draft} />
        <WhyCardManagement />
      </div>
    ),
  };
}

function WhySectionSettings({ draft, setField, errors }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Section title</p>
        <div className="mt-4 space-y-4">
          <Field label="Title prefix" error={errors.titlePrefix}>
            <input value={draft.titlePrefix || ""} onChange={(event) => setField("titlePrefix", event.target.value)} className={inputClass} placeholder="Why" />
          </Field>
          <Field label="Highlighted title" error={errors.highlightedTitle}>
            <input value={draft.highlightedTitle || ""} onChange={(event) => setField("highlightedTitle", event.target.value)} className={inputClass} placeholder="CareerBook" />
          </Field>
          <Field label="Title suffix" error={errors.titleSuffix}>
            <input value={draft.titleSuffix || ""} onChange={(event) => setField("titleSuffix", event.target.value)} className={inputClass} placeholder="Is Publisher's No. 1 Choice" />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Card management</p>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Add publisher benefit cards from the right-side table. Each card supports an image, title, manual order, and active state.
        </p>
      </div>
    </div>
  );
}

function WhyCareerBookPreview({ draft }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    return subscribeWhyCareerBookCards((items) => setCards(items.filter((item) => item.active !== false)), () => {});
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#040404] p-6 text-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <h2 className="max-w-xl text-4xl font-light leading-tight tracking-normal">
          {draft.titlePrefix || "Why"} <span className="font-black">{draft.highlightedTitle || "CareerBook"}</span>
          <span className="block">{draft.titleSuffix || "Is Publisher's No. 1 Choice"}</span>
        </h2>
        <div className="h-2 w-80 max-w-full overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/4 rounded-full bg-amber-400" />
        </div>
      </div>
      <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.length ? cards.slice(0, 4).map((card) => (
          <div key={card.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.075]">
            <div className="flex aspect-[1.25] items-center justify-center bg-white/[0.04]">
              {card.imageUrl ? <img src={card.imageUrl} alt="" className="h-full w-full object-contain p-5" /> : <ImageIcon className="h-12 w-12 text-white/30" />}
            </div>
            <div className="border-b-8 border-violet-700 p-5">
              <h3 className="text-2xl font-black leading-tight">{card.title}</h3>
            </div>
          </div>
        )) : (
          <div className="col-span-full rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/55">No active cards yet.</div>
        )}
      </div>
    </div>
  );
}

function WhyCardManagement() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeWhyCareerBookCards(
      (items) => {
        setCards(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load publisher cards." });
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
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [cards, query, statusFilter]);

  async function toggleStatus(card) {
    try {
      await toggleWhyCareerBookCardStatus(card.id, card.active === false);
      emitAlert({ type: "success", message: "Card status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update card status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteWhyCareerBookCard(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deletePublisherImage(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Card deleted, but Storage cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: "Card deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete card." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Why CareerBook cards</p>
          <h3 className="mt-1 text-sm font-bold text-gray-900">{cards.length} cards</h3>
        </div>
        <button onClick={() => setModalState({ mode: "create", card: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
          <Plus className="h-4 w-4" /> Add New Card
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_190px_150px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by card title" />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-500">Sorted by order</div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div>
      ) : filteredCards.length ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[80px_1.4fr_90px_90px_130px_130px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Image</span><span>Card Title</span><span>Order</span><span>Status</span><span>Created</span><span>Actions</span>
            </div>
            {filteredCards.map((card) => (
              <div key={card.id} className="grid grid-cols-[80px_1.4fr_90px_90px_130px_130px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  {card.imageUrl ? <img src={card.imageUrl} alt="" className="h-full w-full object-contain p-1" /> : <ImageIcon className="h-5 w-5 text-gray-300" />}
                </div>
                <p className="truncate font-bold text-gray-900">{card.title}</p>
                <span className="font-bold text-gray-600">{Number(card.order) || 0}</span>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${card.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>
                  {card.active === false ? "Inactive" : "Active"}
                </span>
                <span className="text-xs font-semibold text-gray-500">{formatDate(card.createdAt)}</span>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(card)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title={card.active === false ? "Enable" : "Disable"}>
                    {card.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setModalState({ mode: "edit", card })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(card)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-500">
          No cards found. Add a new card or adjust search/filter.
        </div>
      )}

      {modalState ? <CardModal mode={modalState.mode} card={modalState.card} cards={cards} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete publisher card"
          message={`Delete "${deleteTarget.title}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function CardModal({ mode, card, cards, onClose }) {
  const nextOrder = useMemo(() => cards.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, [cards]);
  const [form, setForm] = useState(() => ({
    title: card?.title || "",
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
      emitAlert({ type: "error", message: "Please upload an image file." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Image must be 8MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadPublisherImage({ file, sectionKey: "whychoose-carrerbook", folder: "card", onProgress: setUploadProgress });
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
      await deletePublisherImage(path);
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
        await updateWhyCareerBookCard(card.id, form);
        emitAlert({ type: "success", message: "Card updated." });
      } else {
        await createWhyCareerBookCard(form);
        emitAlert({ type: "success", message: "Card added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save card." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Card" : "Add Card"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Publisher benefit card</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-[190px_1fr]">
          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {form.imageUrl ? <img src={form.imageUrl} alt="Card preview" className="h-full w-full object-contain p-4" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
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
            <Field label="Card title" error={errors.title}>
              <input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} placeholder="Industry Leading Payouts" />
            </Field>
            <Field label="Display order">
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

function formatDate(value) {
  const date = value?.toDate?.() || null;
  if (!date) return "-";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date);
}
