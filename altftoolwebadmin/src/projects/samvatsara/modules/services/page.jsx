"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AppWindow,
  Code2,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  Layers,
  Loader2,
  Mail,
  PenTool,
  Plus,
  Save,
  Search,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_SERVICES_SETTINGS,
  SERVICE_ICONS,
  createService,
  createSlug,
  deleteService,
  saveServicesSettings,
  subscribeServices,
  subscribeServicesSettings,
  toggleServiceStatus,
  updateService,
} from "./service/services.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const ICON_COMPONENTS = {
  web: Globe,
  app: AppWindow,
  seo: Search,
  email: Mail,
  social: Share2,
  webapp: Code2,
  wordpress: Layers,
  uiux: PenTool,
};

const EMPTY_SERVICE = {
  slug: "",
  title: "",
  shortDescription: "",
  icon: "web",
  heroHeadline: "",
  heroHeadlineItalic: "",
  heroSubcopy: "",
  benefits: [],
  features: "",
  workflow: [],
  technologies: "",
  pricingCta: { heading: "", body: "", cta: "" },
  faq: [],
  relatedSlugs: "",
  order: 0,
  active: true,
};

function linesToText(value) {
  return Array.isArray(value) ? value.join("\n") : String(value || "");
}

export default function ServicesPage() {
  const [settings, setSettings] = useState(DEFAULT_SERVICES_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_SERVICES_SETTINGS);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeServicesSettings(
      (data) => {
        setSettings(data);
        setSettingsDraft(data);
      },
      () => emitAlert({ type: "error", message: "Failed to load services settings." }),
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
      unsubSettings();
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

  function updateSettingsDraft(key, value) {
    setSettingsDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveSettings() {
    setSettingsSaving(true);
    try {
      await saveServicesSettings(settingsDraft);
      emitAlert({ type: "success", message: "Services settings saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save settings." });
    } finally {
      setSettingsSaving(false);
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
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Samvatsara Services</h1>
              <p className="text-sm text-gray-500">Manage the services page copy and the individual service items.</p>
            </div>
          </div>
          <button onClick={() => setModalState({ mode: "create", service: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Service
          </button>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Page copy</p>
            <h2 className="mt-1 text-base font-bold text-gray-900">Services section content</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Badge"><input value={settingsDraft.badge || ""} onChange={(event) => updateSettingsDraft("badge", event.target.value)} className={inputClass} placeholder="What we make" /></Field>
            <Field label="Heading Lead"><input value={settingsDraft.headingLead || ""} onChange={(event) => updateSettingsDraft("headingLead", event.target.value)} className={inputClass} placeholder="Services built like" /></Field>
            <Field label="Heading Italic"><input value={settingsDraft.headingItalic || ""} onChange={(event) => updateSettingsDraft("headingItalic", event.target.value)} className={inputClass} placeholder="good furniture." /></Field>
          </div>
          <div className="mt-4">
            <Field label="Subcopy"><textarea value={settingsDraft.subcopy || ""} onChange={(event) => updateSettingsDraft("subcopy", event.target.value)} rows={2} className={textareaClass} /></Field>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="SEO Title"><input value={settingsDraft.seoTitle || ""} onChange={(event) => updateSettingsDraft("seoTitle", event.target.value)} className={inputClass} /></Field>
            <Field label="SEO Description"><input value={settingsDraft.seoDescription || ""} onChange={(event) => updateSettingsDraft("seoDescription", event.target.value)} className={inputClass} /></Field>
          </div>
          <button onClick={handleSaveSettings} disabled={settingsSaving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60 md:w-auto">
            {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Services Settings
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
              ) : filteredServices.length ? filteredServices.map((item) => {
                const ItemIcon = ICON_COMPONENTS[item.icon] || Globe;
                return (
                  <div key={item.id} className="grid grid-cols-[1fr_1fr_110px_100px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                    <p className="truncate font-mono text-xs font-semibold text-gray-500">{item.slug}</p>
                    <p className="truncate font-bold text-gray-900">{item.title}</p>
                    <span className="flex w-fit items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600"><ItemIcon className="h-3.5 w-3.5" />{item.icon}</span>
                    <button type="button" onClick={() => toggleService(item)} className="w-fit">
                      <StatusBadge active={item.active !== false} />
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => toggleService(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                      <button onClick={() => setModalState({ mode: "edit", service: item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                );
              }) : (
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
    pricingCta: { ...EMPTY_SERVICE.pricingCta, ...(service?.pricingCta || {}) },
    benefits: Array.isArray(service?.benefits) ? service.benefits : [],
    workflow: Array.isArray(service?.workflow) ? service.workflow : [],
    faq: Array.isArray(service?.faq) ? service.faq : [],
    features: linesToText(service?.features),
    technologies: linesToText(service?.technologies),
    relatedSlugs: linesToText(service?.relatedSlugs),
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

  function setPricing(key, value) {
    setForm((prev) => ({ ...prev, pricingCta: { ...prev.pricingCta, [key]: value } }));
  }

  function addRow(key, blank) {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], blank] }));
  }

  function updateRow(key, index, patch) {
    setForm((prev) => ({ ...prev, [key]: prev[key].map((row, i) => (i === index ? { ...row, ...patch } : row)) }));
  }

  function removeRow(key, index) {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
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
            <Field label="Slug" error={errors.slug}><input value={form.slug} onChange={(event) => setSlug(event.target.value)} className={inputClass} placeholder="website-design-development" /></Field>
            <Field label="Icon">
              <select value={form.icon} onChange={(event) => setField("icon", event.target.value)} className={inputClass}>
                {SERVICE_ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </Field>
            <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
          </div>

          <Field label="Short Description"><textarea value={form.shortDescription} onChange={(event) => setField("shortDescription", event.target.value)} rows={2} className={textareaClass} /></Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero Headline"><input value={form.heroHeadline} onChange={(event) => setField("heroHeadline", event.target.value)} className={inputClass} /></Field>
            <Field label="Hero Headline Italic"><input value={form.heroHeadlineItalic} onChange={(event) => setField("heroHeadlineItalic", event.target.value)} className={inputClass} placeholder="handmade." /></Field>
          </div>
          <Field label="Hero Subcopy"><textarea value={form.heroSubcopy} onChange={(event) => setField("heroSubcopy", event.target.value)} rows={2} className={textareaClass} /></Field>

          <Repeater
            label="Benefits"
            rows={form.benefits}
            onAdd={() => addRow("benefits", { title: "", description: "" })}
            onRemove={(index) => removeRow("benefits", index)}
            render={(row, index) => (
              <div className="grid gap-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
                <input value={row.title || ""} onChange={(event) => updateRow("benefits", index, { title: event.target.value })} className={inputClass} placeholder="Title" />
                <input value={row.description || ""} onChange={(event) => updateRow("benefits", index, { description: event.target.value })} className={inputClass} placeholder="Description" />
              </div>
            )}
          />

          <Repeater
            label="Workflow Steps"
            rows={form.workflow}
            onAdd={() => addRow("workflow", { title: "", description: "" })}
            onRemove={(index) => removeRow("workflow", index)}
            render={(row, index) => (
              <div className="grid gap-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
                <input value={row.title || ""} onChange={(event) => updateRow("workflow", index, { title: event.target.value })} className={inputClass} placeholder="Title" />
                <input value={row.description || ""} onChange={(event) => updateRow("workflow", index, { description: event.target.value })} className={inputClass} placeholder="Description" />
              </div>
            )}
          />

          <Repeater
            label="FAQ"
            rows={form.faq}
            onAdd={() => addRow("faq", { question: "", answer: "" })}
            onRemove={(index) => removeRow("faq", index)}
            render={(row, index) => (
              <div className="grid gap-2">
                <input value={row.question || ""} onChange={(event) => updateRow("faq", index, { question: event.target.value })} className={inputClass} placeholder="Question" />
                <textarea value={row.answer || ""} onChange={(event) => updateRow("faq", index, { answer: event.target.value })} rows={2} className={textareaClass} placeholder="Answer" />
              </div>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Features (one per line)"><textarea value={form.features} onChange={(event) => setField("features", event.target.value)} rows={5} className={textareaClass} /></Field>
            <Field label="Technologies (one per line)"><textarea value={form.technologies} onChange={(event) => setField("technologies", event.target.value)} rows={5} className={textareaClass} /></Field>
            <Field label="Related Slugs (one per line)"><textarea value={form.relatedSlugs} onChange={(event) => setField("relatedSlugs", event.target.value)} rows={5} className={textareaClass} /></Field>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Pricing CTA</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Heading"><input value={form.pricingCta.heading} onChange={(event) => setPricing("heading", event.target.value)} className={inputClass} /></Field>
              <Field label="Body"><input value={form.pricingCta.body} onChange={(event) => setPricing("body", event.target.value)} className={inputClass} /></Field>
              <Field label="CTA Label"><input value={form.pricingCta.cta} onChange={(event) => setPricing("cta", event.target.value)} className={inputClass} placeholder="Get a Project Estimate" /></Field>
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

function Repeater({ label, rows, onAdd, onRemove, render }) {
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
            <div className="flex-1">{render(row, index)}</div>
            <button onClick={() => onRemove(index)} className="mt-0.5 rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
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
