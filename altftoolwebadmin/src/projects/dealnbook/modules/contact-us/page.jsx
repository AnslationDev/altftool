"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Plus, Save, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_CONTACT_SETTINGS,
  saveContactSettings,
  subscribeContactSettings,
} from "./service/contact.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

export default function ContactUsPage() {
  const [settings, setSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsub = subscribeContactSettings(
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
    return () => unsub();
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings]);

  function setField(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function setSocial(key, value) {
    setSettings((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }

  function addBusinessHours() {
    setSettings((prev) => ({ ...prev, businessHours: [...(prev.businessHours || []), { days: "", hours: "" }] }));
  }

  function updateBusinessHours(index, key, value) {
    setSettings((prev) => {
      const next = [...(prev.businessHours || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, businessHours: next };
    });
  }

  function removeBusinessHours(index) {
    setSettings((prev) => ({ ...prev, businessHours: (prev.businessHours || []).filter((_, i) => i !== index) }));
  }

  function addDepartment() {
    setSettings((prev) => ({ ...prev, departments: [...(prev.departments || []), { label: "", email: "" }] }));
  }

  function updateDepartment(index, key, value) {
    setSettings((prev) => {
      const next = [...(prev.departments || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, departments: next };
    });
  }

  function removeDepartment(index) {
    setSettings((prev) => ({ ...prev, departments: (prev.departments || []).filter((_, i) => i !== index) }));
  }

  async function save() {
    const nextErrors = {};
    if (!settings.heroHeadline?.trim()) nextErrors.heroHeadline = "Headline is required.";
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

  const addressText = (settings.addressLines || []).join("\n");
  const businessHours = settings.businessHours || [];
  const departments = settings.departments || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dealnbook Contact</h1>
              <p className="text-sm text-gray-500">Manage the contact page hero, office details, hours, and departments.</p>
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
                <Field label="Headline" error={errors.heroHeadline}><input value={settings.heroHeadline || ""} onChange={(event) => setField("heroHeadline", event.target.value)} className={inputClass} /></Field>
                <Field label="Subcopy"><textarea value={settings.heroSubcopy || ""} onChange={(event) => setField("heroSubcopy", event.target.value)} rows={2} className={textareaClass} /></Field>
              </div>
            </Card>

            <Card eyebrow="Office" title="Office details">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Office Name"><input value={settings.officeName || ""} onChange={(event) => setField("officeName", event.target.value)} className={inputClass} /></Field>
                  <Field label="Phone"><input value={settings.phone || ""} onChange={(event) => setField("phone", event.target.value)} className={inputClass} /></Field>
                  <Field label="Email"><input value={settings.email || ""} onChange={(event) => setField("email", event.target.value)} className={inputClass} /></Field>
                  <Field label="Map Embed Placeholder"><input value={settings.mapEmbedPlaceholder || ""} onChange={(event) => setField("mapEmbedPlaceholder", event.target.value)} className={inputClass} /></Field>
                </div>
                <Field label="Address Lines (one per line)"><textarea value={addressText} onChange={(event) => setField("addressLines", event.target.value.split("\n"))} rows={3} className={textareaClass} /></Field>
              </div>
            </Card>

            <Card eyebrow="Availability" title={`Business hours · ${businessHours.length}`}>
              <div className="space-y-3">
                {businessHours.length ? businessHours.map((row, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                      <input value={row.days || ""} onChange={(event) => updateBusinessHours(index, "days", event.target.value)} className={inputClass} placeholder="Monday – Friday" />
                      <input value={row.hours || ""} onChange={(event) => updateBusinessHours(index, "hours", event.target.value)} className={inputClass} placeholder="9:00 AM – 6:00 PM EST" />
                    </div>
                    <button onClick={() => removeBusinessHours(index)} className="mt-0.5 rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                )) : (
                  <p className="text-xs font-medium text-gray-400">No hours yet.</p>
                )}
                <button onClick={addBusinessHours} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  <Plus className="h-3.5 w-3.5" /> Add row
                </button>
              </div>
            </Card>

            <Card eyebrow="Social" title="Profiles">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Instagram"><input value={settings.social?.instagram || ""} onChange={(event) => setSocial("instagram", event.target.value)} className={inputClass} /></Field>
                <Field label="LinkedIn"><input value={settings.social?.linkedin || ""} onChange={(event) => setSocial("linkedin", event.target.value)} className={inputClass} /></Field>
                <Field label="Twitter / X"><input value={settings.social?.twitter || ""} onChange={(event) => setSocial("twitter", event.target.value)} className={inputClass} /></Field>
                <Field label="Behance"><input value={settings.social?.behance || ""} onChange={(event) => setSocial("behance", event.target.value)} className={inputClass} /></Field>
              </div>
            </Card>

            <Card eyebrow="Routing" title={`Departments · ${departments.length}`}>
              <div className="space-y-3">
                {departments.length ? departments.map((row, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                      <input value={row.label || ""} onChange={(event) => updateDepartment(index, "label", event.target.value)} className={inputClass} placeholder="Support" />
                      <input value={row.email || ""} onChange={(event) => updateDepartment(index, "email", event.target.value)} className={inputClass} placeholder="support@dealnbook.com" />
                    </div>
                    <button onClick={() => removeDepartment(index)} className="mt-0.5 rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                )) : (
                  <p className="text-xs font-medium text-gray-400">No departments yet.</p>
                )}
                <button onClick={addDepartment} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  <Plus className="h-3.5 w-3.5" /> Add row
                </button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

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

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
