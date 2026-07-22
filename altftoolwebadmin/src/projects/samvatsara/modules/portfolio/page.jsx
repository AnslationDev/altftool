"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, Edit3, Eye, EyeOff, Loader2, Plus, Save, Search, Trash2, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  createPortfolioItem,
  createSlug,
  deletePortfolioItem,
  subscribePortfolio,
  togglePortfolioStatus,
  updatePortfolioItem,
} from "./service/portfolio.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_ITEM = {
  slug: "",
  title: "",
  category: "",
  summary: "",
  results: "",
  order: 0,
  active: true,
};

function linesToText(value) {
  return Array.isArray(value) ? value.join("\n") : String(value || "");
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

export default function PortfolioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribePortfolio(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load portfolio." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items
      .filter((item) => {
        const matchesSearch =
          !search ||
          item.title?.toLowerCase().includes(search) ||
          item.slug?.toLowerCase().includes(search) ||
          item.category?.toLowerCase().includes(search);
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
      await togglePortfolioStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Project status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deletePortfolioItem(deleteTarget.id);
      emitAlert({ type: "success", message: "Project deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete project." });
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
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Samvatsara Portfolio</h1>
              <p className="text-sm text-gray-500">Manage the selected work shown across the site.</p>
            </div>
          </div>
          <button onClick={() => setModalState({ mode: "create", item: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Project
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Projects" value={loading ? "-" : items.length} />
          <StatCard label="Active" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive" value={loading ? "-" : inactiveCount} tone="amber" />
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Project Management</p>
              <h2 className="mt-1 text-base font-bold text-gray-900">{items.length} projects</h2>
            </div>
            <span className="text-xs font-medium text-gray-400">{filteredItems.length} shown</span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_170px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by title, slug, or category" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[1fr_1fr_1fr_100px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Slug</span><span>Title</span><span>Category</span><span>Status</span><span>Actions</span>
              </div>
              {loading ? (
                <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : filteredItems.length ? filteredItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_1fr_1fr_100px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                  <p className="truncate font-mono text-xs font-semibold text-gray-500">{item.slug}</p>
                  <p className="truncate font-bold text-gray-900">{item.title}</p>
                  <p className="truncate text-xs font-semibold text-gray-500">{item.category}</p>
                  <button type="button" onClick={() => toggleItem(item)} className="w-fit"><StatusBadge active={item.active !== false} /></button>
                  <div className="flex gap-2">
                    <button onClick={() => toggleItem(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button onClick={() => setModalState({ mode: "edit", item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )) : (
                <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No projects found.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {modalState ? <PortfolioModal mode={modalState.mode} item={modalState.item} items={items} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete project"
          message={`Delete "${deleteTarget.title || deleteTarget.slug}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function PortfolioModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_ITEM,
    ...item,
    results: linesToText(item?.results),
    order: Number(item?.order) || nextOrder,
    active: item?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(item?.slug));

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugEdited) next.slug = createSlug(value);
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function setSlug(value) {
    setSlugEdited(true);
    setField("slug", createSlug(value));
  }

  async function save() {
    const nextErrors = {};
    if (!form.slug.trim()) nextErrors.slug = "Slug is required.";
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updatePortfolioItem(item.id, form);
        emitAlert({ type: "success", message: "Project updated." });
      } else {
        await createPortfolioItem(form);
        emitAlert({ type: "success", message: "Project added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save project." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Project" : "Add Project"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Project details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
            <Field label="Slug" error={errors.slug}><input value={form.slug} onChange={(event) => setSlug(event.target.value)} className={inputClass} placeholder="hearth-goods-co" /></Field>
            <Field label="Category"><input value={form.category} onChange={(event) => setField("category", event.target.value)} className={inputClass} placeholder="Brand & Website" /></Field>
            <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
          </div>

          <Field label="Summary"><textarea value={form.summary} onChange={(event) => setField("summary", event.target.value)} rows={3} className={textareaClass} /></Field>

          <Field label="Results (one per line)"><textarea value={form.results} onChange={(event) => setField("results", event.target.value)} rows={5} className={textareaClass} placeholder={"112% increase in online revenue within 6 months\n48% lower bounce rate on product pages"} /></Field>

          <Field label="Status">
            <button onClick={() => setField("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
              <span>{form.active ? "Active" : "Inactive"}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
            </button>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "edit" ? "Update Project" : "Add Project"}
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
