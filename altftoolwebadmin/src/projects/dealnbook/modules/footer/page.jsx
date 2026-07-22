"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  PanelBottom,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_FOOTER_SETTINGS,
  createFooterQuickLink,
  createFooterResource,
  deleteFooterQuickLink,
  deleteFooterResource,
  saveFooterSettings,
  subscribeFooterQuickLinks,
  subscribeFooterResources,
  subscribeFooterSettings,
  toggleFooterQuickLinkStatus,
  toggleFooterResourceStatus,
  updateFooterQuickLink,
  updateFooterResource,
} from "./service/footer.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_LINK = { label: "", href: "", order: 0, active: true };

export default function DealnbookFooterPage() {
  const [settings, setSettings] = useState(DEFAULT_FOOTER_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_FOOTER_SETTINGS);
  const [quickLinks, setQuickLinks] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [quickModal, setQuickModal] = useState(null);
  const [resourceModal, setResourceModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeFooterSettings(
      (data) => {
        setSettings(data);
        setSavedSettings(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load footer settings." });
        setLoading(false);
      },
    );
    const unsubQuick = subscribeFooterQuickLinks(
      (items) => setQuickLinks(items),
      () => emitAlert({ type: "error", message: "Failed to load quick links." }),
    );
    const unsubResources = subscribeFooterResources(
      (items) => setResources(items),
      () => emitAlert({ type: "error", message: "Failed to load resources." }),
    );
    return () => {
      unsubSettings();
      unsubQuick();
      unsubResources();
    };
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings]);

  function setSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function saveSettings() {
    const nextErrors = {};
    if (!settings.copyrightSuffix?.trim()) nextErrors.copyrightSuffix = "Copyright text is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveFooterSettings(settings);
      emitAlert({ type: "success", message: "Footer settings saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save footer settings." });
    } finally {
      setSaving(false);
    }
  }

  async function toggleQuick(item) {
    try {
      await toggleFooterQuickLinkStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Link status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function toggleResource(item) {
    try {
      await toggleFooterResourceStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Link status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.kind === "quick") {
        await deleteFooterQuickLink(deleteTarget.item.id);
      } else {
        await deleteFooterResource(deleteTarget.item.id);
      }
      emitAlert({ type: "success", message: "Link deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete link." });
    } finally {
      setDeleteLoading(false);
    }
  }

  const activeResources = resources.filter((item) => item.active !== false).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <PanelBottom className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dealnbook Footer</h1>
              <p className="text-sm text-gray-500">Manage the newsletter copy, quick links, resource links, and legal labels.</p>
            </div>
          </div>
          <button onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Quick Links" value={loading ? "-" : quickLinks.length} />
          <StatCard label="Resource Links" value={loading ? "-" : resources.length} />
          <StatCard label="Active Resources" value={loading ? "-" : activeResources} tone="green" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Footer Content</p>
                  <h2 className="mt-1 text-base font-bold text-gray-900">Newsletter & legal labels</h2>
                </div>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {dirty ? "Unsaved" : "Saved"}
                </span>
              </div>
              {loading ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Newsletter Heading"><input value={settings.newsletterHeading || ""} onChange={(event) => setSetting("newsletterHeading", event.target.value)} className={inputClass} placeholder="Newsletter" /></Field>
                    <Field label="Newsletter Input Placeholder"><input value={settings.newsletterPlaceholder || ""} onChange={(event) => setSetting("newsletterPlaceholder", event.target.value)} className={inputClass} placeholder="Enter your email" /></Field>
                    <Field label="Newsletter CTA Label"><input value={settings.newsletterCtaLabel || ""} onChange={(event) => setSetting("newsletterCtaLabel", event.target.value)} className={inputClass} placeholder="Subscribe" /></Field>
                    <Field label="Copyright Suffix" error={errors.copyrightSuffix}><input value={settings.copyrightSuffix || ""} onChange={(event) => setSetting("copyrightSuffix", event.target.value)} className={inputClass} placeholder="All rights reserved." /></Field>
                    <Field label="Privacy Link Label"><input value={settings.legalPrivacyLabel || ""} onChange={(event) => setSetting("legalPrivacyLabel", event.target.value)} className={inputClass} placeholder="Privacy Policy" /></Field>
                    <Field label="Terms Link Label"><input value={settings.legalTermsLabel || ""} onChange={(event) => setSetting("legalTermsLabel", event.target.value)} className={inputClass} placeholder="Terms & Conditions" /></Field>
                  </div>
                </div>
              )}
            </div>

            <ManagedListCard
              eyebrow="Footer"
              singular="Quick Link"
              count={quickLinks.length}
              items={quickLinks}
              emptyText="No quick links yet."
              onAdd={() => setQuickModal({ mode: "create", item: null })}
              onToggle={toggleQuick}
              onEdit={(item) => setQuickModal({ mode: "edit", item })}
              onDelete={(item) => setDeleteTarget({ kind: "quick", item })}
            />

            <ManagedListCard
              eyebrow="Footer"
              singular="Resource"
              count={resources.length}
              items={resources}
              emptyText="No resource links yet."
              onAdd={() => setResourceModal({ mode: "create", item: null })}
              onToggle={toggleResource}
              onEdit={(item) => setResourceModal({ mode: "edit", item })}
              onDelete={(item) => setDeleteTarget({ kind: "resource", item })}
            />
          </section>

          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-bold text-gray-900">Live preview</h2>
              </div>
              <FooterPreview settings={settings} quickLinks={quickLinks} resources={resources} />
            </div>
          </section>
        </div>
      </div>

      {quickModal ? (
        <LinkModal
          mode={quickModal.mode}
          item={quickModal.item}
          items={quickLinks}
          title="Quick Link"
          onCreate={createFooterQuickLink}
          onUpdate={updateFooterQuickLink}
          onClose={() => setQuickModal(null)}
        />
      ) : null}
      {resourceModal ? (
        <LinkModal
          mode={resourceModal.mode}
          item={resourceModal.item}
          items={resources}
          title="Resource"
          onCreate={createFooterResource}
          onUpdate={updateFooterResource}
          onClose={() => setResourceModal(null)}
        />
      ) : null}
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

/* --------------------- Dealnbook front-end live preview -------------------- */

function FooterPreview({ settings, quickLinks, resources }) {
  const quick = [...quickLinks].filter((item) => item.active !== false).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  const res = [...resources].filter((item) => item.active !== false).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  const Column = ({ title, links }) => (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-700">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.length ? (
          links.map((link) => (
            <li key={link.id} className="truncate text-xs text-gray-700">{link.label}</li>
          ))
        ) : (
          <li className="text-xs text-gray-400">No links</li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-orange-100 bg-orange-50/60 p-6">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <span className="text-lg font-bold tracking-tight text-gray-900">Dealnbook</span>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-gray-600">
            {settings.newsletterHeading || "Newsletter"}
          </p>
          <div className="mt-3 flex max-w-xs items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
            <span className="flex-1 truncate text-xs text-gray-400">{settings.newsletterPlaceholder || "Enter your email"}</span>
            <span className="rounded-md bg-gray-900 px-2.5 py-1 text-[10px] font-semibold text-white">{settings.newsletterCtaLabel || "Subscribe"}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Column title="Quick Links" links={quick} />
          <Column title="Resources" links={res} />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 pt-4">
        <p className="text-[10px] text-gray-500">© {new Date().getFullYear()} Dealnbook. {settings.copyrightSuffix || "All rights reserved."}</p>
        <div className="flex gap-3 text-[10px] font-medium text-gray-600">
          <span>{settings.legalPrivacyLabel || "Privacy Policy"}</span>
          <span>{settings.legalTermsLabel || "Terms & Conditions"}</span>
        </div>
      </div>
    </div>
  );
}

function ManagedListCard({ eyebrow, singular, count, items, emptyText, onAdd, onToggle, onEdit, onDelete }) {
  const sorted = useMemo(() => [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)), [items]);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">{singular}s · {count}</h2>
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
          <Plus className="h-4 w-4" /> Add {singular}
        </button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[1fr_1fr_90px_130px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span>Label</span><span>Href</span><span>Status</span><span>Actions</span>
          </div>
          {sorted.length ? sorted.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_1fr_90px_130px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
              <p className="truncate font-bold text-gray-900">{item.label}</p>
              <p className="truncate text-xs font-semibold text-gray-500">{item.href}</p>
              <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${item.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{item.active === false ? "Inactive" : "Active"}</span>
              <div className="flex gap-2">
                <button onClick={() => onToggle(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                <button onClick={() => onEdit(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => onDelete(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          )) : (
            <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">{emptyText}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function LinkModal({ mode, item, items, title, onCreate, onUpdate, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({ ...EMPTY_LINK, ...item, order: Number(item?.order) || nextOrder, active: item?.active !== false }));
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
        await onUpdate(item.id, form);
        emitAlert({ type: "success", message: `${title} updated.` });
      } else {
        await onCreate(form);
        emitAlert({ type: "success", message: `${title} added.` });
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
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? `Edit ${title}` : `Add ${title}`}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Footer link</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-4">
          <Field label="Label" error={errors.label}><input value={form.label} onChange={(event) => setField("label", event.target.value)} className={inputClass} /></Field>
          <Field label="Href" error={errors.href}><input value={form.href} onChange={(event) => setField("href", event.target.value)} className={inputClass} placeholder="/blog" /></Field>
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
