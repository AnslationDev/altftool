"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Code,
  Edit3,
  Eye,
  EyeOff,
  Grid3x3,
  Layers,
  LayoutPanelTop,
  Loader2,
  Mail,
  Plus,
  Save,
  Search,
  Share2,
  Smartphone,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_NAVBAR_SETTINGS,
  createNavbarPrimary,
  createNavbarService,
  deleteNavbarPrimary,
  deleteNavbarService,
  saveNavbarSettings,
  subscribeNavbarPrimary,
  subscribeNavbarServices,
  subscribeNavbarSettings,
  toggleNavbarPrimaryStatus,
  toggleNavbarServiceStatus,
  updateNavbarPrimary,
  updateNavbarService,
} from "./service/navbar.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const ICON_OPTIONS = ["code", "device", "search", "mail", "share", "terminal", "layers", "grid"];
const ICON_MAP = {
  code: Code,
  device: Smartphone,
  search: Search,
  mail: Mail,
  share: Share2,
  terminal: Terminal,
  layers: Layers,
  grid: Grid3x3,
};

const EMPTY_PRIMARY = { label: "", href: "", hasMegaMenu: false, order: 0, active: true };
const EMPTY_SERVICE = { slug: "", title: "", description: "", icon: "code", order: 0, active: true };

export default function NavbarPage() {
  const [settings, setSettings] = useState(DEFAULT_NAVBAR_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_NAVBAR_SETTINGS);
  const [primary, setPrimary] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [primaryModal, setPrimaryModal] = useState(null);
  const [serviceModal, setServiceModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeNavbarSettings(
      (data) => {
        setSettings(data);
        setSavedSettings(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load navbar settings." });
        setLoading(false);
      },
    );
    const unsubPrimary = subscribeNavbarPrimary(
      (items) => setPrimary(items),
      () => emitAlert({ type: "error", message: "Failed to load primary links." }),
    );
    const unsubServices = subscribeNavbarServices(
      (items) => setServices(items),
      () => emitAlert({ type: "error", message: "Failed to load services." }),
    );
    return () => {
      unsubSettings();
      unsubPrimary();
      unsubServices();
    };
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings]);

  function setCta(key, value) {
    setSettings((prev) => ({ ...prev, cta: { ...prev.cta, [key]: value } }));
    setErrors((prev) => ({ ...prev, [`cta.${key}`]: "" }));
  }

  async function saveSettings() {
    const nextErrors = {};
    if (!settings.cta?.label?.trim()) nextErrors["cta.label"] = "CTA label is required.";
    if (!settings.cta?.href?.trim()) nextErrors["cta.href"] = "CTA link is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveNavbarSettings(settings);
      emitAlert({ type: "success", message: "Navbar CTA saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save navbar settings." });
    } finally {
      setSaving(false);
    }
  }

  async function togglePrimary(item) {
    try {
      await toggleNavbarPrimaryStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Link status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function toggleService(item) {
    try {
      await toggleNavbarServiceStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Service status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.kind === "primary") await deleteNavbarPrimary(deleteTarget.item.id);
      else await deleteNavbarService(deleteTarget.item.id);
      emitAlert({ type: "success", message: "Item deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete item." });
    } finally {
      setDeleteLoading(false);
    }
  }

  const activePrimary = primary.filter((item) => item.active !== false).length;
  const inactivePrimary = primary.length - activePrimary;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <LayoutPanelTop className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DailyHnt Navbar</h1>
              <p className="text-sm text-gray-500">Manage the header CTA, primary links, and the services mega-menu.</p>
            </div>
          </div>
          <button onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save CTA
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Primary Links" value={loading ? "-" : primary.length} />
          <StatCard label="Active Links" value={loading ? "-" : activePrimary} tone="green" />
          <StatCard label="Inactive Links" value={loading ? "-" : inactivePrimary} tone="amber" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Header Call-to-action</p>
                  <h2 className="mt-1 text-base font-bold text-gray-900">CTA button</h2>
                </div>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {dirty ? "Unsaved" : "Saved"}
                </span>
              </div>
              {loading ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">{Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="CTA Label" error={errors["cta.label"]}>
                    <input value={settings.cta?.label || ""} onChange={(event) => setCta("label", event.target.value)} className={inputClass} placeholder="Get Started" />
                  </Field>
                  <Field label="CTA Link" error={errors["cta.href"]}>
                    <input value={settings.cta?.href || ""} onChange={(event) => setCta("href", event.target.value)} className={inputClass} placeholder="/contact-us" />
                  </Field>
                </div>
              )}
            </div>

            <ManagedListCard
              eyebrow="Navigation"
              title="Primary links"
              count={primary.length}
              onAdd={() => setPrimaryModal({ mode: "create", item: null })}
              columns="grid-cols-[1fr_1fr_120px_90px_130px]"
              headers={["Label", "Href", "Mega Menu", "Status", "Actions"]}
              items={primary}
              emptyText="No primary links yet."
              renderRow={(item) => (
                <>
                  <p className="truncate font-bold text-gray-900">{item.label}</p>
                  <p className="truncate text-xs font-semibold text-gray-500">{item.href}</p>
                  <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${item.hasMegaMenu ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>{item.hasMegaMenu ? "Yes" : "No"}</span>
                  <StatusBadge active={item.active} />
                  <RowActions active={item.active} onToggle={() => togglePrimary(item)} onEdit={() => setPrimaryModal({ mode: "edit", item })} onDelete={() => setDeleteTarget({ kind: "primary", item })} />
                </>
              )}
            />

            <ManagedListCard
              eyebrow="Mega Menu"
              title="Services"
              count={services.length}
              onAdd={() => setServiceModal({ mode: "create", item: null })}
              columns="grid-cols-[60px_1fr_1fr_90px_130px]"
              headers={["Icon", "Title", "Slug", "Status", "Actions"]}
              items={services}
              emptyText="No services yet."
              renderRow={(item) => {
                const Icon = ICON_MAP[item.icon] || Code;
                return (
                  <>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600"><Icon className="h-4 w-4" /></div>
                    <p className="truncate font-bold text-gray-900">{item.title}</p>
                    <p className="truncate text-xs font-semibold text-gray-500">{item.slug}</p>
                    <StatusBadge active={item.active} />
                    <RowActions active={item.active} onToggle={() => toggleService(item)} onEdit={() => setServiceModal({ mode: "edit", item })} onDelete={() => setDeleteTarget({ kind: "service", item })} />
                  </>
                );
              }}
            />
          </section>

          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-bold text-gray-900">Live preview</h2>
              </div>
              <NavbarPreview cta={settings.cta} primary={primary} services={services} />
            </div>
          </section>
        </div>
      </div>

      {primaryModal ? <PrimaryModal mode={primaryModal.mode} item={primaryModal.item} items={primary} onClose={() => setPrimaryModal(null)} /> : null}
      {serviceModal ? <ServiceModal mode={serviceModal.mode} item={serviceModal.item} items={services} onClose={() => setServiceModal(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete item"
          message={`Delete "${deleteTarget.item.label || deleteTarget.item.title}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------ shared bits ------------------------------ */

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

/* --------------------- DailyHnt front-end live preview -------------------- */

function NavbarPreview({ cta, primary, services }) {
  const activePrimary = [...primary]
    .filter((item) => item.active !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  const activeServices = [...services]
    .filter((item) => item.active !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    .slice(0, 4);

  return (
    <div className="overflow-hidden rounded-xl border border-[#262626] bg-[#0a0a0a]">
      {/* header bar */}
      <div className="flex items-center justify-between gap-4 border-b border-[#262626] px-5 py-4">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-[#ededed]">
          <span className="text-[#c6f135]">&gt;</span> DAILYHNT
        </span>
        <div className="hidden items-center gap-5 md:flex">
          {activePrimary.length ? (
            activePrimary.map((item) => (
              <span key={item.id} className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#ededed]">
                {item.label}
              </span>
            ))
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#8a8a8a]">No active links</span>
          )}
        </div>
        <span className="rounded-none bg-[#c6f135] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0a0a0a]">
          {cta?.label || "Get Started"}
        </span>
      </div>

      {/* services mega-menu grid */}
      <div className="px-5 py-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">Services mega-menu</p>
        <div className="grid grid-cols-2 gap-0.5 bg-[#262626] p-0.5">
          {activeServices.length ? (
            activeServices.map((service) => {
              const Icon = ICON_MAP[service.icon] || Code;
              return (
                <div key={service.id} className="flex gap-3 bg-[#0a0a0a] p-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#c6f135]" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs text-[#ededed]">{service.title}</span>
                    {service.description ? (
                      <span className="mt-0.5 block truncate text-[10px] text-[#8a8a8a]">{service.description}</span>
                    ) : null}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 bg-[#0a0a0a] p-4 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-[#8a8a8a]">
              No active services
            </div>
          )}
        </div>
        <div className="mt-0.5 flex items-center justify-center border-t border-[#262626] bg-[#0a0a0a] py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[#c6f135]">
          View all services &gt;
        </div>
      </div>
    </div>
  );
}

function ManagedListCard({ eyebrow, title, count, onAdd, columns, headers, items, emptyText, renderRow }) {
  const sorted = useMemo(() => [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)), [items]);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">{count} {count === 1 ? "item" : "items"}</h2>
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
          <Plus className="h-4 w-4" /> Add {title}
        </button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <div className="min-w-[720px]">
          <div className={`grid ${columns} bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400`}>
            {headers.map((head) => <span key={head}>{head}</span>)}
          </div>
          {sorted.length ? sorted.map((item) => (
            <div key={item.id} className={`grid ${columns} items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm`}>
              {renderRow(item)}
            </div>
          )) : (
            <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">{emptyText}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{active === false ? "Inactive" : "Active"}</span>;
}

function RowActions({ active, onToggle, onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <button onClick={onToggle} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
      <button onClick={onEdit} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
      <button onClick={onDelete} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

function ModalShell({ eyebrow, heading, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">{heading}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-4">{children}</div>
        <div className="mt-5 flex justify-end gap-3">{footer}</div>
      </div>
    </div>
  );
}

function StatusToggle({ active, onChange }) {
  return (
    <button type="button" onClick={onChange} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
      <span>{active ? "Active" : "Inactive"}</span>
      <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
    </button>
  );
}

function SaveButton({ mode, saving, onClick }) {
  return (
    <button onClick={onClick} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      {mode === "edit" ? "Update" : "Add"}
    </button>
  );
}

/* -------------------------------- modals --------------------------------- */

function PrimaryModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({ ...EMPTY_PRIMARY, ...item, order: Number(item?.order) || nextOrder, active: item?.active !== false, hasMegaMenu: item?.hasMegaMenu === true }));
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
        await updateNavbarPrimary(item.id, form);
        emitAlert({ type: "success", message: "Link updated." });
      } else {
        await createNavbarPrimary(form);
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
    <ModalShell
      eyebrow={mode === "edit" ? "Edit Link" : "Add Link"}
      heading="Primary link"
      onClose={onClose}
      footer={<>
        <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
        <SaveButton mode={mode} saving={saving} onClick={save} />
      </>}
    >
      <Field label="Label" error={errors.label}><input value={form.label} onChange={(event) => setField("label", event.target.value)} className={inputClass} /></Field>
      <Field label="Href" error={errors.href}><input value={form.href} onChange={(event) => setField("href", event.target.value)} className={inputClass} placeholder="/services" /></Field>
      <button type="button" onClick={() => setField("hasMegaMenu", !form.hasMegaMenu)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${form.hasMegaMenu ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
        <span>Has mega-menu</span>
        <span className={`h-2.5 w-2.5 rounded-full ${form.hasMegaMenu ? "bg-indigo-500" : "bg-gray-400"}`} />
      </button>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
        <Field label="Status"><StatusToggle active={form.active} onChange={() => setField("active", !form.active)} /></Field>
      </div>
    </ModalShell>
  );
}

function ServiceModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({ ...EMPTY_SERVICE, ...item, order: Number(item?.order) || nextOrder, active: item?.active !== false, icon: item?.icon || "code" }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
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
        await updateNavbarService(item.id, form);
        emitAlert({ type: "success", message: "Service updated." });
      } else {
        await createNavbarService(form);
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
    <ModalShell
      eyebrow={mode === "edit" ? "Edit Service" : "Add Service"}
      heading="Mega-menu service"
      onClose={onClose}
      footer={<>
        <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
        <SaveButton mode={mode} saving={saving} onClick={save} />
      </>}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Slug" error={errors.slug}><input value={form.slug} onChange={(event) => setField("slug", event.target.value)} className={inputClass} placeholder="web-development" /></Field>
        <Field label="Icon">
          <select value={form.icon} onChange={(event) => setField("icon", event.target.value)} className={inputClass}>
            {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
      <Field label="Description"><textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={3} className={textareaClass} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
        <Field label="Status"><StatusToggle active={form.active} onChange={() => setField("active", !form.active)} /></Field>
      </div>
    </ModalShell>
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
