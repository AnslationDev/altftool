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
import { HEX } from "../_shared/AdminSectionShared";
import {
  DEFAULT_NAVBAR_SETTINGS,
  createNavbarPrimary,
  createServicesMenuItem,
  deleteNavbarPrimary,
  deleteServicesMenuItem,
  saveNavbarSettings,
  subscribeNavbarPrimary,
  subscribeNavbarSettings,
  subscribeServicesMenuItems,
  toggleNavbarPrimaryStatus,
  toggleServicesMenuItemStatus,
  updateNavbarPrimary,
  updateServicesMenuItem,
} from "./service/navbar.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_PRIMARY = { label: "", href: "", megaMenu: false, order: 0, active: true };
const EMPTY_SERVICE_ITEM = { slug: "", title: "", description: "", icon: "", order: 0, active: true };

export default function OfferrisNavbarPage() {
  const [settings, setSettings] = useState(DEFAULT_NAVBAR_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_NAVBAR_SETTINGS);
  const [primary, setPrimary] = useState([]);
  const [servicesMenu, setServicesMenu] = useState([]);
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
    const unsubServices = subscribeServicesMenuItems(
      (items) => setServicesMenu(items),
      () => emitAlert({ type: "error", message: "Failed to load services menu items." }),
    );
    return () => {
      unsubSettings();
      unsubPrimary();
      unsubServices();
    };
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings]);

  function setSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function saveSettings() {
    const nextErrors = {};
    if (!settings.ctaLabel?.trim()) nextErrors.ctaLabel = "CTA label is required.";
    if (!settings.ctaHref?.trim()) nextErrors.ctaHref = "CTA href is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveNavbarSettings(settings);
      emitAlert({ type: "success", message: "Navbar settings saved." });
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

  async function toggleServiceItem(item) {
    try {
      await toggleServicesMenuItemStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Menu item status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.kind === "service") {
        await deleteServicesMenuItem(deleteTarget.item.id);
      } else {
        await deleteNavbarPrimary(deleteTarget.item.id);
      }
      emitAlert({ type: "success", message: "Item deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete item." });
    } finally {
      setDeleteLoading(false);
    }
  }

  const activePrimary = primary.filter((item) => item.active !== false).length;
  const activeServices = servicesMenu.filter((item) => item.active !== false).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <LayoutPanelTop className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Offerris Navbar</h1>
              <p className="text-sm text-gray-500">Manage the CTA button, primary links, and services mega-menu.</p>
            </div>
          </div>
          <button onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Primary Links" value={loading ? "-" : primary.length} />
          <StatCard label="Active Links" value={loading ? "-" : activePrimary} tone="green" />
          <StatCard label="Menu Items" value={loading ? "-" : servicesMenu.length} />
          <StatCard label="Active Menu Items" value={loading ? "-" : activeServices} tone="green" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Navbar</p>
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
                  <Field label="CTA Label" error={errors.ctaLabel}><input value={settings.ctaLabel || ""} onChange={(event) => setSetting("ctaLabel", event.target.value)} className={inputClass} placeholder="Start a Project" /></Field>
                  <Field label="CTA Href" error={errors.ctaHref}><input value={settings.ctaHref || ""} onChange={(event) => setSetting("ctaHref", event.target.value)} className={inputClass} placeholder="/contact" /></Field>
                </div>
              )}
            </div>

            <ManagedListCard
              eyebrow="Navigation"
              title="Primary link"
              count={primary.length}
              onAdd={() => setPrimaryModal({ mode: "create", item: null })}
              items={primary}
              emptyText="No primary links yet."
              gridClass="grid-cols-[1fr_1fr_110px_90px_130px]"
              minWidth="min-w-[720px]"
              headers={["Label", "Href", "Type", "Status", "Actions"]}
              renderRow={(item) => (
                <>
                  <p className="truncate font-bold text-gray-900">{item.label}</p>
                  <p className="truncate text-xs font-semibold text-gray-500">{item.href}</p>
                  <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${item.megaMenu ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>{item.megaMenu ? "Mega menu" : "Simple"}</span>
                  <StatusBadge active={item.active} />
                  <RowActions active={item.active} onToggle={() => togglePrimary(item)} onEdit={() => setPrimaryModal({ mode: "edit", item })} onDelete={() => setDeleteTarget({ kind: "primary", item })} />
                </>
              )}
            />

            <ManagedListCard
              eyebrow="Services Mega-Menu"
              title="Menu item"
              count={servicesMenu.length}
              onAdd={() => setServiceModal({ mode: "create", item: null })}
              items={servicesMenu}
              emptyText="No services menu items yet."
              gridClass="grid-cols-[1.2fr_1.4fr_90px_90px_130px]"
              minWidth="min-w-[760px]"
              headers={["Title", "Description", "Icon", "Status", "Actions"]}
              renderRow={(item) => (
                <>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900">{item.title}</p>
                    <p className="truncate text-xs font-semibold text-gray-500">/{item.slug}</p>
                  </div>
                  <p className="truncate text-xs font-semibold text-gray-500">{item.description}</p>
                  <span className="w-fit rounded-lg bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">{item.icon || "—"}</span>
                  <StatusBadge active={item.active} />
                  <RowActions active={item.active} onToggle={() => toggleServiceItem(item)} onEdit={() => setServiceModal({ mode: "edit", item })} onDelete={() => setDeleteTarget({ kind: "service", item })} />
                </>
              )}
            />
          </section>

          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-bold text-gray-900">Live preview</h2>
              </div>
              <NavbarPreview settings={settings} primary={primary} servicesMenu={servicesMenu} />
            </div>
          </section>
        </div>
      </div>

      {primaryModal ? <PrimaryModal mode={primaryModal.mode} item={primaryModal.item} items={primary} onClose={() => setPrimaryModal(null)} /> : null}
      {serviceModal ? <ServicesMenuModal mode={serviceModal.mode} item={serviceModal.item} items={servicesMenu} onClose={() => setServiceModal(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title={deleteTarget.kind === "service" ? "Delete menu item" : "Delete link"}
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

/* ----------------------- Offerris front-end live preview ---------------------- */

function NavbarPreview({ settings, primary, servicesMenu }) {
  const activePrimary = [...primary]
    .filter((item) => item.active !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  const activeServices = [...servicesMenu]
    .filter((item) => item.active !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: HEX.border, background: HEX.bg }}>
      <div className="flex items-center justify-between gap-4 border-b px-5 py-4" style={{ borderColor: HEX.border }}>
        <span className="text-lg font-bold tracking-tight" style={{ color: HEX.fg }}>Offerris</span>
        <div className="hidden items-center gap-5 md:flex">
          {activePrimary.length ? (
            activePrimary.map((item) => (
              <span key={item.id} className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: HEX.dim }}>
                {item.label}
                {item.megaMenu ? " ▾" : ""}
              </span>
            ))
          ) : (
            <span className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: HEX.dim }}>No active links</span>
          )}
        </div>
        <span className="rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ background: HEX.accent, color: HEX.bg }}>
          {settings.ctaLabel || "Start a Project"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        {activeServices.length ? (
          activeServices.map((item) => (
            <div key={item.id} className="rounded-lg border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
              <p className="truncate text-xs font-semibold" style={{ color: HEX.fg }}>{item.title || "Untitled"}</p>
              <p className="mt-1 truncate text-[11px]" style={{ color: HEX.dim }}>{item.description}</p>
            </div>
          ))
        ) : (
          <p className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: HEX.dim }}>No mega-menu items</p>
        )}
      </div>
    </div>
  );
}

function ManagedListCard({ eyebrow, title, count, onAdd, items, emptyText, gridClass, minWidth, headers, renderRow }) {
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
        <div className={minWidth}>
          <div className={`grid ${gridClass} bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400`}>
            {headers.map((header) => <span key={header}>{header}</span>)}
          </div>
          {sorted.length ? sorted.map((item) => (
            <div key={item.id} className={`grid ${gridClass} items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm`}>
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

function StatusToggle({ active, onChange }) {
  return (
    <button type="button" onClick={onChange} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
      <span>{active ? "Active" : "Inactive"}</span>
      <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
    </button>
  );
}

/* -------------------------------- modals --------------------------------- */

function PrimaryModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({ ...EMPTY_PRIMARY, ...item, order: Number(item?.order) || nextOrder, active: item?.active !== false, megaMenu: item?.megaMenu === true }));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Link" : "Add Link"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Primary link</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-4">
          <Field label="Label" error={errors.label}><input value={form.label} onChange={(event) => setField("label", event.target.value)} className={inputClass} /></Field>
          <Field label="Href" error={errors.href}><input value={form.href} onChange={(event) => setField("href", event.target.value)} className={inputClass} placeholder="/services" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
            <Field label="Status"><StatusToggle active={form.active} onChange={() => setField("active", !form.active)} /></Field>
          </div>
          <Field label="Mega Menu">
            <button type="button" onClick={() => setField("megaMenu", !form.megaMenu)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.megaMenu ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
              <span>{form.megaMenu ? "Enabled" : "Disabled"}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${form.megaMenu ? "bg-blue-500" : "bg-gray-400"}`} />
            </button>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {mode === "edit" ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServicesMenuModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({ ...EMPTY_SERVICE_ITEM, ...item, order: Number(item?.order) || nextOrder, active: item?.active !== false }));
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
        await updateServicesMenuItem(item.id, form);
        emitAlert({ type: "success", message: "Menu item updated." });
      } else {
        await createServicesMenuItem(form);
        emitAlert({ type: "success", message: "Menu item added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save menu item." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Menu Item" : "Add Menu Item"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Services mega-menu item</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-4">
          <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} placeholder="Website Design & Development" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Slug" error={errors.slug}><input value={form.slug} onChange={(event) => setField("slug", event.target.value)} className={inputClass} placeholder="website-design-development" /></Field>
            <Field label="Icon"><input value={form.icon} onChange={(event) => setField("icon", event.target.value)} className={inputClass} placeholder="web" /></Field>
          </div>
          <Field label="Description"><textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={3} className={textareaClass} placeholder="Kinetic, conversion-built websites." /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
            <Field label="Status"><StatusToggle active={form.active} onChange={() => setField("active", !form.active)} /></Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {mode === "edit" ? "Update" : "Add"}
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
