"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  EyeOff,
  LayoutPanelTop,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  createNavItem,
  deleteNavItem,
  subscribeNavItems,
  toggleNavItemStatus,
  updateNavItem,
} from "./service/navbar.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_ITEM = { href: "", label: "", order: 0, active: true };

export default function InfovastaNavbarPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode, item }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeNavItems(
      (list) => {
        setItems(list);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load navigation items." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const sorted = useMemo(() => [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)), [items]);
  const activeCount = items.filter((item) => item.active !== false).length;

  async function toggle(item) {
    try {
      await toggleNavItemStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Link status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteNavItem(deleteTarget.id);
      emitAlert({ type: "success", message: "Link deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete link." });
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
              <LayoutPanelTop className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Infovasta Navbar</h1>
              <p className="text-sm text-gray-500">Manage the primary navigation links.</p>
            </div>
          </div>
          <button onClick={() => setModal({ mode: "create", item: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Link
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Nav Links" value={loading ? "-" : items.length} />
          <StatCard label="Active Links" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive Links" value={loading ? "-" : items.length - activeCount} tone="amber" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[1fr_1fr_90px_130px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Label</span><span>Href</span><span>Status</span><span>Actions</span>
              </div>
              {loading ? (
                <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-10 animate-pulse rounded-lg bg-gray-100" />)}</div>
              ) : sorted.length ? sorted.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_1fr_90px_130px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                  <p className="truncate font-bold text-gray-900">{item.label}</p>
                  <p className="truncate text-xs font-semibold text-gray-500">{item.href}</p>
                  <StatusBadge active={item.active} />
                  <div className="flex gap-2">
                    <button onClick={() => toggle(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button onClick={() => setModal({ mode: "edit", item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )) : (
                <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No navigation links yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modal ? <NavItemModal mode={modal.mode} item={modal.item} items={items} onClose={() => setModal(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete link"
          message={`Delete "${deleteTarget.label}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

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
  return <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{active === false ? "Inactive" : "Active"}</span>;
}

function NavItemModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({ ...EMPTY_ITEM, ...item, order: Number(item?.order) || nextOrder, active: item?.active !== false }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!form.label.trim()) nextErrors.label = "Label is required.";
    if (!form.href.trim()) nextErrors.href = "Href is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateNavItem(item.id, form);
        emitAlert({ type: "success", message: "Link updated." });
      } else {
        await createNavItem(form);
        emitAlert({ type: "success", message: "Link added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save link." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Link" : "Add Link"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Navigation link</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-4">
          <Field label="Label" error={errors.label}><input value={form.label} onChange={(event) => setField("label", event.target.value)} className={inputClass} /></Field>
          <Field label="Href" error={errors.href}><input value={form.href} onChange={(event) => setField("href", event.target.value)} className={inputClass} placeholder="/about-us" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
            <Field label="Status">
              <button type="button" onClick={() => setField("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                <span>{form.active ? "Active" : "Inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "edit" ? "Update Link" : "Add Link"}
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
