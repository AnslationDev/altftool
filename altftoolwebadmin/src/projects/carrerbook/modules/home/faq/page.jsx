"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Edit3, Eye, EyeOff, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  createFaqItem,
  deleteFaqItem,
  subscribeFaqItems,
  toggleFaqItemStatus,
  updateFaqItem,
} from "../service/home.service";
import { Field, inputClass, textareaClass } from "../components/HomeSectionShared";

const EMPTY_FAQ = {
  question: "",
  answer: "",
  order: 0,
  active: true,
};

export default function FaqTab(props) {
  return {
    editor: <FaqSectionSettings {...props} />,
    preview: (
      <div className="space-y-4">
        <FaqPreview draft={props.draft} />
        <FaqManagement />
      </div>
    ),
  };
}

function FaqSectionSettings({ draft, setField, errors }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Section settings</p>
        <div className="mt-4 space-y-4">
          <Field label="Section label" error={errors.label}>
            <input value={draft.label || ""} onChange={(event) => setField("label", event.target.value)} className={inputClass} placeholder="FAQ" />
          </Field>
          <Field label="Section title" error={errors.title}>
            <textarea value={draft.title || ""} onChange={(event) => setField("title", event.target.value)} rows={3} className={textareaClass} placeholder="Here you can find Frequently Asked Questions." />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">FAQ management</p>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Add and edit FAQ questions from the right-side table. Use display order to manually control sorting.
        </p>
      </div>
    </div>
  );
}

function FaqPreview({ draft }) {
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState("");

  useEffect(() => {
    return subscribeFaqItems((faqs) => {
      const activeFaqs = faqs.filter((faq) => faq.active !== false);
      setItems(activeFaqs);
      setOpenId((prev) => prev || activeFaqs[0]?.id || "");
    }, () => {});
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#050505] p-6 text-white shadow-sm">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-5xl font-black tracking-normal">{draft.label || "FAQ"}</h2>
        <p className="mt-5 text-xl text-white/82">{draft.title || "Here you can find Frequently Asked Questions."}</p>
      </div>
      <div className="mx-auto mt-10 max-w-5xl space-y-4">
        {items.length ? items.slice(0, 5).map((faq, index) => {
          const open = openId === faq.id;
          return (
            <button
              key={faq.id}
              onClick={() => setOpenId(open ? "" : faq.id)}
              className="w-full rounded-lg border border-white/12 bg-white/[0.075] p-5 text-left transition hover:border-violet-400/45"
            >
              <span className="flex items-center justify-between gap-4">
                <span className="text-base font-black">{faq.question}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
              </span>
              {open ? <span className="mt-5 block max-w-3xl text-sm font-medium leading-6 text-white/78">{faq.answer}</span> : null}
            </button>
          );
        }) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/55">No active FAQs yet.</div>
        )}
      </div>
    </div>
  );
}

function FaqManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeFaqItems(
      (faqs) => {
        setItems(faqs);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load FAQs." });
      },
    );
  }, []);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items
      .filter((item) => {
        const matchesSearch = !search || item.question?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.active !== false) ||
          (statusFilter === "inactive" && item.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [items, query, statusFilter]);

  async function toggleStatus(item) {
    try {
      await toggleFaqItemStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "FAQ status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update FAQ status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteFaqItem(deleteTarget.id);
      emitAlert({ type: "success", message: "FAQ deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete FAQ." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">FAQ Management</p>
          <h3 className="mt-1 text-sm font-bold text-gray-900">{items.length} FAQ items</h3>
        </div>
        <button onClick={() => setModalState({ mode: "create", item: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
          <Plus className="h-4 w-4" /> Add FAQ
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_190px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by question" />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      ) : filteredItems.length ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[1.2fr_1.4fr_80px_90px_130px_130px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Question</span><span>Answer Preview</span><span>Order</span><span>Status</span><span>Created</span><span>Actions</span>
            </div>
            {filteredItems.map((item) => (
              <div key={item.id} className="grid grid-cols-[1.2fr_1.4fr_80px_90px_130px_130px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                <p className="truncate font-bold text-gray-900">{item.question}</p>
                <p className="truncate text-xs font-medium text-gray-500">{item.answer}</p>
                <span className="font-bold text-gray-600">{Number(item.order) || 0}</span>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${item.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>
                  {item.active === false ? "Inactive" : "Active"}
                </span>
                <span className="text-xs font-semibold text-gray-500">{formatDate(item.createdAt)}</span>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title={item.active === false ? "Enable" : "Disable"}>
                    {item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setModalState({ mode: "edit", item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-500">
          No FAQs found. Add a question or adjust the search/filter.
        </div>
      )}

      {modalState ? <FaqModal mode={modalState.mode} item={modalState.item} items={items} onClose={() => setModalState(null)} /> : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete FAQ"
          message={`Delete "${deleteTarget.question}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function FaqModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, faq) => Math.max(max, Number(faq.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({
    question: item?.question || "",
    answer: item?.answer || "",
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
    if (!form.question.trim()) nextErrors.question = "Question is required.";
    if (!form.answer.trim()) nextErrors.answer = "Answer is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateFaqItem(item.id, form);
        emitAlert({ type: "success", message: "FAQ updated." });
      } else {
        await createFaqItem(form);
        emitAlert({ type: "success", message: "FAQ added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save FAQ." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit FAQ" : "Add FAQ"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">{mode === "edit" ? "Update question and answer" : "Create a new FAQ item"}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <Field label="Question" error={errors.question}>
            <input value={form.question} onChange={(event) => setField("question", event.target.value)} className={inputClass} placeholder="What is affiliate marketing?" />
          </Field>
          <Field label="Answer" error={errors.answer}>
            <textarea value={form.answer} onChange={(event) => setField("answer", event.target.value)} rows={6} className={textareaClass} placeholder="Write the full answer..." />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
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
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {mode === "edit" ? "Update FAQ" : "Add FAQ"}
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
