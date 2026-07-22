"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  EyeOff,
  Layers3,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_SERVICE_PAGE_CONTENT,
  createService,
  createSlug,
  deleteService,
  saveServicePageContent,
  subscribeServicePageContent,
  subscribeServices,
  toggleServiceStatus,
  updateService,
} from "./service/services.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_SERVICE = {
  slug: "",
  title: "",
  shortDescription: "",
  description: "",
  icon: "",
  color: "",
  features: [],
  techStack: [],
  faq: [],
  order: 0,
  active: true,
};

function hslPreviewStyle(color) {
  const value = String(color || "").trim();
  if (!value) return null;
  return { backgroundColor: `hsl(${value})` };
}

export default function ServicesPage() {
  const [pageContent, setPageContent] = useState(DEFAULT_SERVICE_PAGE_CONTENT);
  const [pageDraft, setPageDraft] = useState(DEFAULT_SERVICE_PAGE_CONTENT);
  const [pageSaving, setPageSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubPage = subscribeServicePageContent(
      (data) => {
        setPageContent(data);
        setPageDraft(data);
      },
      () => emitAlert({ type: "error", message: "Failed to load services page content." }),
    );
    const unsubServices = subscribeServices(
      (items) => {
        setServices(items);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load services." });
        setLoading(false);
      },
    );
    return () => {
      unsubPage();
      unsubServices();
    };
  }, []);

  const filteredServices = useMemo(() => {
    const search = query.trim().toLowerCase();
    return services
      .filter((item) => {
        const matchesSearch = !search || item.title?.toLowerCase().includes(search) || item.slug?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.active !== false) ||
          (statusFilter === "inactive" && item.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [services, query, statusFilter]);

  const activeCount = services.filter((item) => item.active !== false).length;

  function updatePageDraft(section, key, value) {
    setPageDraft((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  async function handleSavePageContent() {
    setPageSaving(true);
    try {
      await saveServicePageContent(pageDraft);
      emitAlert({ type: "success", message: "Services page content saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save page content." });
    } finally {
      setPageSaving(false);
    }
  }

  async function toggleService(item) {
    try {
      await toggleServiceStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Service status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteService(deleteTarget.id);
      emitAlert({ type: "success", message: "Service deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete service." });
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
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Infovasta Services</h1>
              <p className="text-sm text-gray-500">Manage the services list page copy, detail-page template, and individual service items.</p>
            </div>
          </div>
          <button onClick={() => setModalState({ mode: "create", service: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Service
          </button>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Page copy</p>
            <h2 className="mt-1 text-base font-bold text-gray-900">Services list &amp; detail page content</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Meta Title"><input value={pageDraft.meta?.title || ""} onChange={(event) => updatePageDraft("meta", "title", event.target.value)} className={inputClass} /></Field>
            <Field label="Meta Description"><input value={pageDraft.meta?.description || ""} onChange={(event) => updatePageDraft("meta", "description", event.target.value)} className={inputClass} /></Field>
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Hero</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Eyebrow"><input value={pageDraft.hero?.eyebrow || ""} onChange={(event) => updatePageDraft("hero", "eyebrow", event.target.value)} className={inputClass} /></Field>
              <Field label="Title"><input value={pageDraft.hero?.title || ""} onChange={(event) => updatePageDraft("hero", "title", event.target.value)} className={inputClass} /></Field>
              <Field label="Highlight"><input value={pageDraft.hero?.highlight || ""} onChange={(event) => updatePageDraft("hero", "highlight", event.target.value)} className={inputClass} /></Field>
            </div>
            <div className="mt-4">
              <Field label="Description"><textarea value={pageDraft.hero?.description || ""} onChange={(event) => updatePageDraft("hero", "description", event.target.value)} rows={2} className={textareaClass} /></Field>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Detail page template</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Breadcrumb"><input value={pageDraft.detail?.breadcrumb || ""} onChange={(event) => updatePageDraft("detail", "breadcrumb", event.target.value)} className={inputClass} /></Field>
              <Field label="Quote Label"><input value={pageDraft.detail?.quoteLabel || ""} onChange={(event) => updatePageDraft("detail", "quoteLabel", event.target.value)} className={inputClass} /></Field>
              <Field label="Tech Heading"><input value={pageDraft.detail?.techHeading || ""} onChange={(event) => updatePageDraft("detail", "techHeading", event.target.value)} className={inputClass} /></Field>
              <Field label="Why Heading"><input value={pageDraft.detail?.whyHeading || ""} onChange={(event) => updatePageDraft("detail", "whyHeading", event.target.value)} className={inputClass} /></Field>
              <Field label="Process Heading"><input value={pageDraft.detail?.processHeading || ""} onChange={(event) => updatePageDraft("detail", "processHeading", event.target.value)} className={inputClass} /></Field>
              <Field label="Pricing Heading Prefix"><input value={pageDraft.detail?.pricingHeadingPrefix || ""} onChange={(event) => updatePageDraft("detail", "pricingHeadingPrefix", event.target.value)} className={inputClass} /></Field>
              <Field label="Pricing Label"><input value={pageDraft.detail?.pricingLabel || ""} onChange={(event) => updatePageDraft("detail", "pricingLabel", event.target.value)} className={inputClass} /></Field>
              <Field label="FAQ Heading"><input value={pageDraft.detail?.faqHeading || ""} onChange={(event) => updatePageDraft("detail", "faqHeading", event.target.value)} className={inputClass} /></Field>
              <Field label="Contact Heading"><input value={pageDraft.detail?.contactHeading || ""} onChange={(event) => updatePageDraft("detail", "contactHeading", event.target.value)} className={inputClass} /></Field>
              <Field label="Related Heading"><input value={pageDraft.detail?.relatedHeading || ""} onChange={(event) => updatePageDraft("detail", "relatedHeading", event.target.value)} className={inputClass} /></Field>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Why Text"><textarea value={pageDraft.detail?.whyText || ""} onChange={(event) => updatePageDraft("detail", "whyText", event.target.value)} rows={2} className={textareaClass} /></Field>
              <Field label="Pricing Text"><textarea value={pageDraft.detail?.pricingText || ""} onChange={(event) => updatePageDraft("detail", "pricingText", event.target.value)} rows={2} className={textareaClass} /></Field>
            </div>
          </div>

          <button onClick={handleSavePageContent} disabled={pageSaving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60 md:w-auto">
            {pageSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Page Content
          </button>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Services" value={loading ? "-" : services.length} />
          <StatCard label="Active" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive" value={loading ? "-" : services.length - activeCount} tone="amber" />
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Service Management</p>
              <h2 className="mt-1 text-base font-bold text-gray-900">{services.length} services</h2>
            </div>
            <span className="text-xs font-medium text-gray-400">{filteredServices.length} shown</span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_170px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by title or slug" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[1fr_1fr_110px_100px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Slug</span><span>Title</span><span>Icon</span><span>Status</span><span>Actions</span>
              </div>
              {loading ? (
                <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : filteredServices.length ? filteredServices.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_1fr_110px_100px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                  <p className="truncate font-mono text-xs font-semibold text-gray-500">{item.slug}</p>
                  <p className="truncate font-bold text-gray-900">{item.title}</p>
                  <span className="flex w-fit items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                    {item.color ? <span className="h-3 w-3 rounded-full border border-gray-200" style={hslPreviewStyle(item.color) || {}} /> : null}
                    {item.icon}
                  </span>
                  <button type="button" onClick={() => toggleService(item)} className="w-fit">
                    <StatusBadge active={item.active !== false} />
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => toggleService(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button onClick={() => setModalState({ mode: "edit", service: item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )) : (
                <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No services found.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {modalState ? <ServiceModal mode={modalState.mode} service={modalState.service} services={services} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete service"
          message={`Delete "${deleteTarget.title || deleteTarget.slug}"?`}
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

function ServiceModal({ mode, service, services, onClose }) {
  const nextOrder = useMemo(() => services.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, [services]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_SERVICE,
    ...service,
    features: Array.isArray(service?.features) ? service.features : [],
    techStack: Array.isArray(service?.techStack) ? service.techStack : [],
    faq: Array.isArray(service?.faq) ? service.faq : [],
    order: Number(service?.order) || nextOrder,
    active: service?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(service?.slug));

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

  function addStringRow(key) {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  }

  function updateStringRow(key, index, value) {
    setForm((prev) => ({ ...prev, [key]: prev[key].map((row, i) => (i === index ? value : row)) }));
  }

  function removeStringRow(key, index) {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  }

  function addFaqRow() {
    setForm((prev) => ({ ...prev, faq: [...prev.faq, { q: "", a: "" }] }));
  }

  function updateFaqRow(index, patch) {
    setForm((prev) => ({ ...prev, faq: prev.faq.map((row, i) => (i === index ? { ...row, ...patch } : row)) }));
  }

  function removeFaqRow(index) {
    setForm((prev) => ({ ...prev, faq: prev.faq.filter((_, i) => i !== index) }));
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
        await updateService(service.id, form);
        emitAlert({ type: "success", message: "Service updated." });
      } else {
        await createService(form);
        emitAlert({ type: "success", message: "Service added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save service." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Service" : "Add Service"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Service details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
            <Field label="Slug" error={errors.slug}><input value={form.slug} onChange={(event) => setSlug(event.target.value)} className={inputClass} placeholder="web-development" /></Field>
            <Field label="Icon (Ionicons name)"><input value={form.icon} onChange={(event) => setField("icon", event.target.value)} className={inputClass} placeholder="globe-outline" /></Field>
            <Field label="Color (H, S%, L%)">
              <div className="flex items-center gap-2">
                {form.color ? <span className="h-9 w-9 flex-none rounded-lg border border-gray-200" style={hslPreviewStyle(form.color) || {}} /> : null}
                <input value={form.color} onChange={(event) => setField("color", event.target.value)} className={inputClass} placeholder="174, 77%, 50%" />
              </div>
            </Field>
            <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
          </div>

          <Field label="Short Description"><textarea value={form.shortDescription} onChange={(event) => setField("shortDescription", event.target.value)} rows={2} className={textareaClass} /></Field>
          <Field label="Description"><textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} /></Field>

          <StringRepeater
            label="Features"
            rows={form.features}
            onAdd={() => addStringRow("features")}
            onRemove={(index) => removeStringRow("features", index)}
            onChange={(index, value) => updateStringRow("features", index, value)}
            placeholder="Custom feature"
          />

          <StringRepeater
            label="Tech Stack"
            rows={form.techStack}
            onAdd={() => addStringRow("techStack")}
            onRemove={(index) => removeStringRow("techStack", index)}
            onChange={(index, value) => updateStringRow("techStack", index, value)}
            placeholder="Next.js"
          />

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">FAQ</p>
              <button onClick={addFaqRow} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                <Plus className="h-3.5 w-3.5" /> Add Row
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {form.faq.length ? form.faq.map((row, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1 grid gap-2">
                    <input value={row.q || ""} onChange={(event) => updateFaqRow(index, { q: event.target.value })} className={inputClass} placeholder="Question" />
                    <textarea value={row.a || ""} onChange={(event) => updateFaqRow(index, { a: event.target.value })} rows={2} className={textareaClass} placeholder="Answer" />
                  </div>
                  <button onClick={() => removeFaqRow(index)} className="mt-0.5 rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              )) : (
                <p className="text-xs font-medium text-gray-400">No rows yet.</p>
              )}
            </div>
          </div>

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
            {mode === "edit" ? "Update Service" : "Add Service"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StringRepeater({ label, rows, onAdd, onRemove, onChange, placeholder }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <button onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          <Plus className="h-3.5 w-3.5" /> Add Row
        </button>
      </div>
      <div className="mt-3 space-y-3">
        {rows.length ? rows.map((row, index) => (
          <div key={index} className="flex items-start gap-2">
            <input value={row} onChange={(event) => onChange(index, event.target.value)} className={`${inputClass} flex-1`} placeholder={placeholder} />
            <button onClick={() => onRemove(index)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        )) : (
          <p className="text-xs font-medium text-gray-400">No rows yet.</p>
        )}
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
