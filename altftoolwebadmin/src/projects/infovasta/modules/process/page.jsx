"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, ListOrdered, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  createProcess,
  deleteProcess,
  subscribeProcess,
  toggleProcessStatus,
  updateProcess,
} from "./service/process.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_ITEM = {
  step: "",
  title: "",
  text: "",
  order: 0,
  active: true,
};

function StatCard({ label, value, tone = "gray" }) {
  const toneClass = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function ProcessPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeProcess(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load process steps." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items
      .filter((item) => {
        const matchesSearch =
          !search ||
          item.title?.toLowerCase().includes(search) ||
          item.step?.toLowerCase().includes(search) ||
          item.text?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.active !== false) ||
          (statusFilter === "inactive" && item.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [items, query, statusFilter]);

  const activeCount = items.filter((item) => item.active !== false).length;
  const inactiveCount = items.length - activeCount;

  async function toggleItem(item) {
    try {
      await toggleProcessStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteProcess(deleteTarget.id);
      emitAlert({ type: "success", message: "Step deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete step." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <ListOrdered className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Infovasta Process</h1>
              <p className="text-sm text-gray-500">Manage the process/how-it-works steps shown on the Infovasta site.</p>
            </div>
          </div>
          <button onClick={() => setModalState({ mode: "create", item: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Step
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Steps" value={loading ? "-" : items.length} />
          <StatCard label="Active" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive" value={loading ? "-" : inactiveCount} tone="amber" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Step Management</p>
                <h2 className="mt-1 text-base font-bold text-gray-900">{items.length} steps</h2>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_170px]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by step, title, or text" />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-[80px_1fr_100px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Step</span><span>Title</span><span>Status</span><span>Actions</span>
                </div>
                {loading ? (
                  <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">Loading steps…</div>
                ) : filtered.length ? filtered.map((item) => (
                  <div key={item.id} className="grid grid-cols-[80px_1fr_100px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                    <p className="truncate font-bold text-gray-900">{item.step}</p>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-900">{item.title}</p>
                      <p className="truncate text-xs font-semibold text-gray-500">{item.text}</p>
                    </div>
                    <button type="button" onClick={() => toggleItem(item)} className="w-fit"><StatusBadge active={item.active !== false} /></button>
                    <div className="flex gap-2">
                      <button onClick={() => toggleItem(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                      <button onClick={() => setModalState({ mode: "edit", item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                )) : (
                  <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No steps found.</div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <h2 className="text-base font-bold text-gray-900">Live preview</h2>
            </div>
            <ProcessPreview items={items} />
          </section>
        </div>
      </div>

      {modalState ? <ProcessModal mode={modalState.mode} item={modalState.item} items={items} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete step"
          message={`Delete step "${deleteTarget.step} - ${deleteTarget.title}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function ProcessPreview({ items }) {
  const activeItems = items
    .filter((item) => item.active !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    .slice(0, 6);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7e5e4] bg-[#faf8f4]">
      <div className="p-6">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#78716c]">Our process</p>
          <h3 className="mx-auto mt-3 max-w-md text-2xl font-semibold leading-tight text-[#1c1917]">
            How we work.
          </h3>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeItems.length ? activeItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-[#e7e5e4] bg-white p-5">
              <span className="text-3xl font-bold text-[#d6d3d1]">{item.step}</span>
              <h4 className="text-base font-semibold text-[#1c1917]">{item.title}</h4>
              <p className="text-sm leading-relaxed text-[#78716c]">{item.text}</p>
            </div>
          )) : (
            <div className="col-span-full rounded-lg border border-[#e7e5e4] bg-white p-8 text-center text-sm text-[#78716c]">
              No active steps yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProcessModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_ITEM,
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
    if (!form.step.trim()) nextErrors.step = "Step label is required.";
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.text.trim()) nextErrors.text = "Text is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateProcess(item.id, form);
        emitAlert({ type: "success", message: "Step updated." });
      } else {
        await createProcess(form);
        emitAlert({ type: "success", message: "Step added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save step." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Step" : "Add Step"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Process step details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Step" error={errors.step}><input value={form.step} onChange={(event) => setField("step", event.target.value)} className={inputClass} placeholder="e.g. 01" /></Field>
            <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
          </div>
          <Field label="Text" error={errors.text}><textarea value={form.text} onChange={(event) => setField("text", event.target.value)} rows={4} className={textareaClass} /></Field>
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
            {mode === "edit" ? "Update Step" : "Add Step"}
          </button>
        </div>
      </div>
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
