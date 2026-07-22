"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_PORTFOLIO_PAGE,
  createPortfolioItem,
  createSlug,
  deletePortfolioCover,
  deletePortfolioItem,
  savePortfolioPage,
  subscribePortfolio,
  subscribePortfolioPage,
  togglePortfolioStatus,
  updatePortfolioItem,
  uploadPortfolioCover,
} from "./service/portfolio.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_ITEM = {
  slug: "",
  title: "",
  client: "",
  industry: "",
  category: "",
  image: "",
  imagePath: "",
  width: 0,
  height: 0,
  color: "",
  summary: "",
  challenge: "",
  solution: "",
  techUsed: [],
  results: [],
  order: 0,
  active: true,
};

function linesToText(value) {
  return Array.isArray(value) ? value.join("\n") : String(value || "");
}

function setPath(obj, path, value) {
  const keys = path.split(".");
  const next = { ...obj };
  let cursor = next;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    cursor[key] = { ...cursor[key] };
    cursor = cursor[key];
  }
  cursor[keys[keys.length - 1]] = value;
  return next;
}

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function StatCard({ label, value, tone = "gray" }) {
  const toneClass = {
    gray: "text-gray-900",
    green: "text-emerald-600",
    amber: "text-amber-600",
  }[tone];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-2 text-2xl font-black ${toneClass}`}>{value}</p>
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

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
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
          item.category?.toLowerCase().includes(search) ||
          item.client?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.active !== false) ||
          (statusFilter === "inactive" && item.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [items, query, statusFilter]);

  const activeCount = items.filter((item) => item.active !== false).length;

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
      if (deleteTarget.imagePath) {
        try {
          await deletePortfolioCover(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Project deleted, but image cleanup failed." });
        }
      }
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
              <h1 className="text-xl font-bold text-gray-900">Infovasta Portfolio</h1>
              <p className="text-sm text-gray-500">Manage the selected work shown across the site.</p>
            </div>
          </div>
          <button onClick={() => setModalState({ mode: "create", item: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Project
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Projects" value={loading ? "-" : items.length} />
          <StatCard label="Active" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive" value={loading ? "-" : items.length - activeCount} tone="amber" />
        </div>

        <PortfolioPageSettingsCard />

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
              <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by title, slug, client, or category" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[60px_1fr_1fr_1fr_100px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Cover</span><span>Title</span><span>Slug</span><span>Category</span><span>Status</span><span>Actions</span>
              </div>
              {loading ? (
                <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : filteredItems.length ? filteredItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[60px_1fr_1fr_1fr_100px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                  <div className="h-11 w-11 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="m-3 h-5 w-5 text-gray-300" />}
                  </div>
                  <p className="truncate font-bold text-gray-900">{item.title}</p>
                  <p className="truncate font-mono text-xs font-semibold text-gray-500">{item.slug}</p>
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

function PortfolioPageSettingsCard() {
  const [settings, setSettings] = useState(DEFAULT_PORTFOLIO_PAGE);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_PORTFOLIO_PAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribePortfolioPage(
      (data) => {
        setSettings(data);
        setSavedSettings(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load portfolio page settings." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings]);

  function setField(path, value) {
    setSettings((prev) => setPath(prev, path, value));
  }

  async function save() {
    setSaving(true);
    try {
      await savePortfolioPage(settings);
      emitAlert({ type: "success", message: "Portfolio page settings saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save portfolio page settings." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">List Page</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">Portfolio page hero, meta &amp; detail copy</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{dirty ? "Unsaved" : "Saved"}</span>
          <button onClick={save} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <div className="mt-5 space-y-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">SEO Meta</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Meta Title"><input value={getPath(settings, "meta.title") || ""} onChange={(event) => setField("meta.title", event.target.value)} className={inputClass} /></Field>
              <Field label="Meta Description"><input value={getPath(settings, "meta.description") || ""} onChange={(event) => setField("meta.description", event.target.value)} className={inputClass} /></Field>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Hero</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Eyebrow"><input value={getPath(settings, "hero.eyebrow") || ""} onChange={(event) => setField("hero.eyebrow", event.target.value)} className={inputClass} /></Field>
              <Field label="Title"><input value={getPath(settings, "hero.title") || ""} onChange={(event) => setField("hero.title", event.target.value)} className={inputClass} /></Field>
              <Field label="Highlight"><input value={getPath(settings, "hero.highlight") || ""} onChange={(event) => setField("hero.highlight", event.target.value)} className={inputClass} /></Field>
            </div>
            <div className="mt-4">
              <Field label="Description"><textarea value={getPath(settings, "hero.description") || ""} onChange={(event) => setField("hero.description", event.target.value)} rows={3} className={textareaClass} /></Field>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Detail Page</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Breadcrumb"><input value={getPath(settings, "detail.breadcrumb") || ""} onChange={(event) => setField("detail.breadcrumb", event.target.value)} className={inputClass} /></Field>
              <Field label="Challenge Heading"><input value={getPath(settings, "detail.challengeHeading") || ""} onChange={(event) => setField("detail.challengeHeading", event.target.value)} className={inputClass} /></Field>
              <Field label="Solution Heading"><input value={getPath(settings, "detail.solutionHeading") || ""} onChange={(event) => setField("detail.solutionHeading", event.target.value)} className={inputClass} /></Field>
              <Field label="Tech Heading"><input value={getPath(settings, "detail.techHeading") || ""} onChange={(event) => setField("detail.techHeading", event.target.value)} className={inputClass} /></Field>
              <Field label="Results Heading"><input value={getPath(settings, "detail.resultsHeading") || ""} onChange={(event) => setField("detail.resultsHeading", event.target.value)} className={inputClass} /></Field>
              <Field label="More Projects Heading"><input value={getPath(settings, "detail.moreHeading") || ""} onChange={(event) => setField("detail.moreHeading", event.target.value)} className={inputClass} /></Field>
              <Field label="CTA Label"><input value={getPath(settings, "detail.ctaLabel") || ""} onChange={(event) => setField("detail.ctaLabel", event.target.value)} className={inputClass} /></Field>
              <Field label="CTA Href"><input value={getPath(settings, "detail.ctaHref") || ""} onChange={(event) => setField("detail.ctaHref", event.target.value)} className={inputClass} placeholder="/contact-us" /></Field>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PortfolioModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_ITEM,
    ...item,
    techUsed: Array.isArray(item?.techUsed) ? item.techUsed : [],
    results: Array.isArray(item?.results) && item.results.length ? item.results : [{ label: "", value: "" }],
    order: Number(item?.order) || nextOrder,
    width: Number(item?.width) || 0,
    height: Number(item?.height) || 0,
    active: item?.active !== false,
  }));
  const [techUsedText, setTechUsedText] = useState(linesToText(item?.techUsed));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  function setTechUsed(value) {
    setTechUsedText(value);
    setField(
      "techUsed",
      value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    );
  }

  function addResultRow() {
    setForm((prev) => ({ ...prev, results: [...prev.results, { label: "", value: "" }] }));
  }

  function removeResultRow(index) {
    setForm((prev) => ({ ...prev, results: prev.results.filter((_, i) => i !== index) }));
  }

  function updateResultRow(index, key, value) {
    setForm((prev) => ({
      ...prev,
      results: prev.results.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    }));
  }

  async function uploadImage(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Cover must be an image file." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadPortfolioCover({ file, onProgress: setUploadProgress });
      setForm((prev) => ({ ...prev, image: uploaded.url, imagePath: uploaded.path }));
      emitAlert({ type: "success", message: "Cover uploaded." });
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
      await deletePortfolioCover(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
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
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Project" : "Add Project"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Project details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
          <div>
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {form.image ? <img src={form.image} alt="Cover preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
            </div>
            {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
            <div className="mt-3 flex gap-2">
              <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
                <Upload className="h-3.5 w-3.5" /> Upload Cover
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => uploadImage(event.target.files?.[0])} />
              </label>
              {form.image ? <button onClick={removeImage} className="rounded-xl border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button> : null}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Field label="Width"><input type="number" value={form.width} onChange={(event) => setField("width", event.target.value)} className={inputClass} /></Field>
              <Field label="Height"><input type="number" value={form.height} onChange={(event) => setField("height", event.target.value)} className={inputClass} /></Field>
            </div>
            <div className="mt-3">
              <Field label="Color (HSL triplet)"><input value={form.color} onChange={(event) => setField("color", event.target.value)} className={inputClass} placeholder="210, 100%, 56%" /></Field>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
              <Field label="Slug" error={errors.slug}><input value={form.slug} onChange={(event) => setSlug(event.target.value)} className={inputClass} placeholder="auto-generated-from-title" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Client"><input value={form.client} onChange={(event) => setField("client", event.target.value)} className={inputClass} /></Field>
              <Field label="Industry"><input value={form.industry} onChange={(event) => setField("industry", event.target.value)} className={inputClass} /></Field>
              <Field label="Category"><input value={form.category} onChange={(event) => setField("category", event.target.value)} className={inputClass} placeholder="Brand & Website" /></Field>
            </div>
            <Field label="Summary"><textarea value={form.summary} onChange={(event) => setField("summary", event.target.value)} rows={2} className={textareaClass} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Challenge"><textarea value={form.challenge} onChange={(event) => setField("challenge", event.target.value)} rows={4} className={textareaClass} /></Field>
              <Field label="Solution"><textarea value={form.solution} onChange={(event) => setField("solution", event.target.value)} rows={4} className={textareaClass} /></Field>
            </div>
            <Field label="Technology Used (one per line)"><textarea value={techUsedText} onChange={(event) => setTechUsed(event.target.value)} rows={4} className={textareaClass} placeholder={"Next.js\nFirebase\nTailwind CSS"} /></Field>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Results</span>
            <button onClick={addResultRow} type="button" className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
              <Plus className="h-3.5 w-3.5" /> Add Result
            </button>
          </div>
          <div className="space-y-2">
            {form.results.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_40px] gap-2">
                <input value={row.label} onChange={(event) => updateResultRow(index, "label", event.target.value)} className={inputClass} placeholder="Label (e.g. Revenue Growth)" />
                <input value={row.value} onChange={(event) => updateResultRow(index, "value", event.target.value)} className={inputClass} placeholder="Value (e.g. 112%)" />
                <button onClick={() => removeResultRow(index)} type="button" className="flex items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={`${inputClass} sm:w-40`} /></Field>
        </div>

        <div className="mt-5">
          <Field label="Status">
            <button onClick={() => setField("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold sm:w-64 ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
              <span>{form.active ? "Active" : "Inactive"}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
            </button>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "edit" ? "Update Project" : "Add Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
