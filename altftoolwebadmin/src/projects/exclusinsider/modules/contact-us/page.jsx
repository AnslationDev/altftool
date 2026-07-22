"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Loader2, Mail, Plus, Save, Trash2, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_CONTACT_SETTINGS,
  createContactOffice,
  deleteContactOffice,
  saveContactSettings,
  subscribeContactOffices,
  subscribeContactSettings,
  toggleContactOfficeStatus,
  updateContactOffice,
} from "./service/contact.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_OFFICE = { city: "", address: "", order: 0, active: true };

export default function ContactUsPage() {
  const [settings, setSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [offices, setOffices] = useState([]);
  const [officeModal, setOfficeModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeContactSettings(
      (data) => {
        setSettings(data);
        setSavedSettings(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load contact settings." });
        setLoading(false);
      },
    );
    const unsubOffices = subscribeContactOffices(
      (items) => setOffices(items),
      () => emitAlert({ type: "error", message: "Failed to load offices." }),
    );
    return () => {
      unsubSettings();
      unsubOffices();
    };
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings]);

  const sortedOffices = useMemo(
    () => [...offices].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [offices],
  );

  function setField(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  const budgetOptionsText = (settings.budgetOptions || []).join("\n");

  async function save() {
    const nextErrors = {};
    if (!settings.heading?.trim()) nextErrors.heading = "Heading is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveContactSettings(settings);
      emitAlert({ type: "success", message: "Contact settings saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save contact settings." });
    } finally {
      setSaving(false);
    }
  }

  async function toggleOffice(item) {
    try {
      await toggleContactOfficeStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Office status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDeleteOffice() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteContactOffice(deleteTarget.id);
      emitAlert({ type: "success", message: "Office deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete office." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ExclusInsider Contact</h1>
              <p className="text-sm text-gray-500">Manage the contact page copy, form labels, direct line, and office locations.</p>
            </div>
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
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
        ) : (
          <>
            <Card eyebrow="Header" title="Page hero">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Eyebrow"><input value={settings.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} /></Field>
                  <Field label="Heading" error={errors.heading}><input value={settings.heading || ""} onChange={(event) => setField("heading", event.target.value)} className={inputClass} /></Field>
                </div>
                <Field label="Subcopy"><textarea value={settings.subcopy || ""} onChange={(event) => setField("subcopy", event.target.value)} rows={3} className={textareaClass} /></Field>
              </div>
            </Card>

            <Card eyebrow="Form" title="Intake form labels">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name Label"><input value={settings.nameLabel || ""} onChange={(event) => setField("nameLabel", event.target.value)} className={inputClass} /></Field>
                <Field label="Email Label"><input value={settings.emailLabel || ""} onChange={(event) => setField("emailLabel", event.target.value)} className={inputClass} /></Field>
                <Field label="Company Label"><input value={settings.companyLabel || ""} onChange={(event) => setField("companyLabel", event.target.value)} className={inputClass} /></Field>
                <Field label="Budget Label"><input value={settings.budgetLabel || ""} onChange={(event) => setField("budgetLabel", event.target.value)} className={inputClass} /></Field>
                <Field label="Service Label"><input value={settings.serviceLabel || ""} onChange={(event) => setField("serviceLabel", event.target.value)} className={inputClass} /></Field>
                <Field label="Message Label"><input value={settings.messageLabel || ""} onChange={(event) => setField("messageLabel", event.target.value)} className={inputClass} /></Field>
              </div>
              <div className="mt-4">
                <Field label="Budget Options (one per line)" hint="Rendered as the dropdown choices for the budget field.">
                  <textarea
                    value={budgetOptionsText}
                    onChange={(event) => setField("budgetOptions", event.target.value.split("\n"))}
                    rows={4}
                    className={textareaClass}
                    placeholder={"Under $5,000\n$5,000 – $15,000"}
                  />
                </Field>
              </div>
            </Card>

            <Card eyebrow="Direct Line" title="Direct contact block">
              <div className="space-y-4">
                <Field label="Heading"><input value={settings.directLineHeading || ""} onChange={(event) => setField("directLineHeading", event.target.value)} className={inputClass} /></Field>
                <Field label="Body"><textarea value={settings.directLineBody || ""} onChange={(event) => setField("directLineBody", event.target.value)} rows={2} className={textareaClass} /></Field>
              </div>
            </Card>

            <OfficesCard
              offices={sortedOffices}
              onAdd={() => setOfficeModal({ mode: "create", item: null })}
              onEdit={(item) => setOfficeModal({ mode: "edit", item })}
              onToggle={toggleOffice}
              onDelete={(item) => setDeleteTarget(item)}
            />
          </>
        )}
      </div>

      {officeModal ? (
        <OfficeModal
          mode={officeModal.mode}
          item={officeModal.item}
          items={offices}
          onClose={() => setOfficeModal(null)}
        />
      ) : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete office"
          message={`Delete "${deleteTarget.city}"?`}
          loading={deleteLoading}
          onConfirm={confirmDeleteOffice}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

/* -------------------------------- offices -------------------------------- */

function OfficesCard({ offices, onAdd, onEdit, onToggle, onDelete }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Locations On File</p>
          <h3 className="mt-1 text-base font-bold text-gray-900">{offices.length} offices</h3>
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
          <Plus className="h-4 w-4" /> Add Office
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[1fr_1.6fr_90px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span>City</span><span>Address</span><span>Status</span><span>Actions</span>
          </div>
          {offices.length ? offices.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_1.6fr_90px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
              <p className="truncate font-bold text-gray-900">{item.city}</p>
              <p className="truncate text-xs font-semibold text-gray-500">{item.address}</p>
              <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${item.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{item.active === false ? "Inactive" : "Active"}</span>
              <div className="flex gap-2">
                <button onClick={() => onToggle(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                <button onClick={() => onEdit(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => onDelete(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          )) : (
            <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No offices yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function OfficeModal({ mode, item, items, onClose }) {
  const nextOrder = useMemo(() => items.reduce((max, i) => Math.max(max, Number(i.order) || 0), 0) + 1, [items]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_OFFICE,
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
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (!form.address.trim()) nextErrors.address = "Address is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateContactOffice(item.id, form);
        emitAlert({ type: "success", message: "Office updated." });
      } else {
        await createContactOffice(form);
        emitAlert({ type: "success", message: "Office added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save office." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Office" : "Add Office"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Office details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-4">
          <Field label="City" error={errors.city}><input value={form.city} onChange={(event) => setField("city", event.target.value)} className={inputClass} placeholder="New York (HQ)" /></Field>
          <Field label="Address" error={errors.address}><textarea value={form.address} onChange={(event) => setField("address", event.target.value)} rows={3} className={textareaClass} placeholder="1 Vault Street, Floor 41, New York, NY 10005" /></Field>
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
            {mode === "edit" ? "Update Office" : "Add Office"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- shared --------------------------------- */

function Card({ eyebrow, title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
        <h2 className="mt-1 text-base font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-gray-400">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
