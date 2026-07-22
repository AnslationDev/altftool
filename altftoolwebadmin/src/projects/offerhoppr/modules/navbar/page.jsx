"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LayoutPanelTop,
  Loader2,
  Plus,
  Save,
  Text,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_NAVBAR_SETTINGS,
  createNavbarPrimary,
  deleteNavbarLogo,
  deleteNavbarPrimary,
  saveNavbarSettings,
  subscribeNavbarPrimary,
  subscribeNavbarSettings,
  toggleNavbarPrimaryStatus,
  updateNavbarPrimary,
  uploadNavbarLogo,
} from "./service/navbar.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_PRIMARY = { label: "", href: "", order: 0, active: true };

export default function OfferhopprNavbarPage() {
  const [settings, setSettings] = useState(DEFAULT_NAVBAR_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_NAVBAR_SETTINGS);
  const [primary, setPrimary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});

  const [primaryModal, setPrimaryModal] = useState(null);
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
    return () => {
      unsubSettings();
      unsubPrimary();
    };
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings]);

  function setSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleLogoUpload(file) {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadNavbarLogo({ file, onProgress: setUploadProgress });
      setSettings((prev) => ({
        ...prev,
        logoType: "image",
        logoImageUrl: uploaded.url,
        logoImagePath: uploaded.path,
      }));
      emitAlert({ type: "success", message: "Logo image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Logo upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveLogo() {
    const path = settings.logoImagePath;
    setSettings((prev) => ({ ...prev, logoType: "text", logoImageUrl: "", logoImagePath: "" }));
    try {
      await deleteNavbarLogo(path);
      emitAlert({ type: "success", message: "Logo image removed." });
    } catch {
      emitAlert({ type: "warning", message: "Logo removed from form, but Storage cleanup failed." });
    }
  }

  async function saveSettings() {
    const nextErrors = {};
    if (!settings.logoText?.trim()) nextErrors.logoText = "Logo text is required.";
    if (settings.logoType === "image" && !settings.logoImageUrl) nextErrors.logoImageUrl = "Upload a logo image or switch to text.";
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteNavbarPrimary(deleteTarget.item.id);
      emitAlert({ type: "success", message: "Link deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete link." });
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
              <h1 className="text-xl font-bold text-gray-900">Offerhoppr Navbar</h1>
              <p className="text-sm text-gray-500">Manage the logo, mobile CTA override, and primary navigation links.</p>
            </div>
          </div>
          <button onClick={saveSettings} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
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
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Brand & Mobile CTA</p>
                  <h2 className="mt-1 text-base font-bold text-gray-900">Logo & CTA override</h2>
                </div>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {dirty ? "Unsaved" : "Saved"}
                </span>
              </div>
              {loading ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">{Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                    {[
                      { key: "text", label: "Text logo", icon: Text },
                      { key: "image", label: "Image logo", icon: ImageIcon },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSetting("logoType", key)}
                        className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${settings.logoType === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <Field label="Logo Text" error={errors.logoText}>
                    <input value={settings.logoText || ""} onChange={(event) => setSetting("logoText", event.target.value)} className={inputClass} placeholder="Offerhoppr" />
                  </Field>

                  <Field label="Logo Image" error={errors.logoImageUrl}>
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-gray-200 bg-white">
                          {settings.logoImageUrl ? (
                            <img src={settings.logoImageUrl} alt="Uploaded logo preview" className="max-h-12 max-w-24 object-contain" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800">Upload a PNG, JPG, or WebP logo</p>
                          <p className="mt-0.5 text-xs text-gray-400">Recommended transparent image, max 5MB.</p>
                          {uploading ? (
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                              <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          ) : null}
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
                          <Upload className="h-4 w-4" />
                          Upload
                          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => handleLogoUpload(event.target.files?.[0])} />
                        </label>
                        {settings.logoImageUrl ? (
                          <button type="button" onClick={handleRemoveLogo} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Remove</button>
                        ) : null}
                      </div>
                    </div>
                  </Field>

                  <Field label="Mobile CTA Label (optional override)">
                    <input value={settings.mobileCtaLabel || ""} onChange={(event) => setSetting("mobileCtaLabel", event.target.value)} className={inputClass} placeholder="Leave blank to use the site's primary CTA" />
                    <p className="mt-1.5 text-xs text-gray-400">If left empty, the frontend falls back to the site settings&apos; Primary CTA label.</p>
                  </Field>
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
              renderRow={(item) => (
                <>
                  <p className="truncate font-bold text-gray-900">{item.label}</p>
                  <p className="truncate text-xs font-semibold text-gray-500">{item.href}</p>
                  <StatusBadge active={item.active} />
                  <RowActions active={item.active} onToggle={() => togglePrimary(item)} onEdit={() => setPrimaryModal({ mode: "edit", item })} onDelete={() => setDeleteTarget({ item })} />
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
              <NavbarPreview settings={settings} primary={primary} />
            </div>
          </section>
        </div>
      </div>

      {primaryModal ? <PrimaryModal mode={primaryModal.mode} item={primaryModal.item} items={primary} onClose={() => setPrimaryModal(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete link"
          message={`Delete "${deleteTarget.item.label}"?`}
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

/* --------------------- Offerhoppr front-end live preview ------------------ */

function NavbarPreview({ settings, primary }) {
  const activePrimary = [...primary]
    .filter((item) => item.active !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  return (
    <div className="overflow-hidden rounded-xl border border-teal-100 bg-teal-50/60">
      <div className="flex items-center justify-between gap-4 border-b border-teal-100 px-5 py-4">
        {settings.logoType === "image" && settings.logoImageUrl ? (
          <img src={settings.logoImageUrl} alt={settings.logoText || "Offerhoppr logo"} className="h-8 max-w-40 object-contain" />
        ) : (
          <span className="text-lg font-bold tracking-tight text-gray-900">{settings.logoText || "Offerhoppr"}</span>
        )}
        <div className="hidden items-center gap-5 md:flex">
          {activePrimary.length ? (
            activePrimary.map((item) => (
              <span key={item.id} className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-700">
                {item.label}
              </span>
            ))
          ) : (
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400">No active links</span>
          )}
        </div>
        <span className="rounded-full bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white">
          {settings.mobileCtaLabel || "Get Started"}
        </span>
      </div>
    </div>
  );
}

function ManagedListCard({ eyebrow, title, count, onAdd, items, emptyText, renderRow }) {
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
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[1fr_1fr_90px_130px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span>Label</span><span>Href</span><span>Status</span><span>Actions</span>
          </div>
          {sorted.length ? sorted.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_1fr_90px_130px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
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
  const [form, setForm] = useState(() => ({ ...EMPTY_PRIMARY, ...item, order: Number(item?.order) || nextOrder, active: item?.active !== false }));
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
          <Field label="Href" error={errors.href}><input value={form.href} onChange={(event) => setField("href", event.target.value)} className={inputClass} placeholder="/deals" /></Field>
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
