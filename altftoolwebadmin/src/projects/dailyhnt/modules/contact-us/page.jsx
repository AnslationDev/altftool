"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, Mail, Plus, Save, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_CONTACT_SETTINGS,
  saveContactSettings,
  subscribeContactSettings,
} from "./service/contact.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  function setOffice(key, value) {
    setSettings((prev) => ({ ...prev, office: { ...prev.office, [key]: value } }));
  }

  function setSocial(key, value) {
    setSettings((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }

  function addRow(key, empty) {
    setSettings((prev) => ({ ...prev, [key]: [...(prev[key] || []), empty] }));
  }

  function updateRow(key, index, field, value) {
    setSettings((prev) => {
      const next = [...(prev[key] || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [key]: next };
    });
  }

  function removeRow(key, index) {
    setSettings((prev) => ({ ...prev, [key]: (prev[key] || []).filter((_, i) => i !== index) }));
  }

  async function save() {
    const nextErrors = {};
    if (settings.email && !EMAIL_REGEX.test(settings.email)) nextErrors.email = "Enter a valid email.";
    if (settings.supportEmail && !EMAIL_REGEX.test(settings.supportEmail)) nextErrors.supportEmail = "Enter a valid email.";
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

  const addressText = (settings.office?.addressLines || []).join("\n");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DailyHnt Contact</h1>
              <p className="text-sm text-gray-500">Manage office details, hours, departments, and social links.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{dirty ? "Unsaved" : "Saved"}</span>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
        ) : (
          <>
            <Card eyebrow="Office" title="Office details">
              <div className="space-y-4">
                <Field label="Office Name"><input value={settings.office?.name || ""} onChange={(event) => setOffice("name", event.target.value)} className={inputClass} /></Field>
                <Field label="Address Lines (one per line)">
                  <textarea
                    value={addressText}
                    onChange={(event) => setOffice("addressLines", event.target.value.split("\n"))}
                    rows={4}
                    className={textareaClass}
                    placeholder={"221B Baker Street\nLondon\nUK"}
                  />
                </Field>
              </div>
            </Card>

            <Card eyebrow="Contact" title="Contact details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone"><input value={settings.phone || ""} onChange={(event) => setField("phone", event.target.value)} className={inputClass} /></Field>
                <Field label="Response Time"><input value={settings.responseTime || ""} onChange={(event) => setField("responseTime", event.target.value)} className={inputClass} placeholder="Within 24 hours" /></Field>
                <Field label="Email" error={errors.email}><input value={settings.email || ""} onChange={(event) => setField("email", event.target.value)} className={inputClass} /></Field>
                <Field label="Support Email" error={errors.supportEmail}><input value={settings.supportEmail || ""} onChange={(event) => setField("supportEmail", event.target.value)} className={inputClass} /></Field>
                <div className="sm:col-span-2">
                  <Field label="Map Embed Placeholder"><input value={settings.mapEmbedPlaceholder || ""} onChange={(event) => setField("mapEmbedPlaceholder", event.target.value)} className={inputClass} /></Field>
                </div>
              </div>
            </Card>

            <Card eyebrow="Business Hours" title="Opening hours">
              <Repeater
                rows={settings.businessHours || []}
                onAdd={() => addRow("businessHours", { days: "", hours: "" })}
                onRemove={(index) => removeRow("businessHours", index)}
                addLabel="Add hours row"
                empty="No business hours yet."
                render={(row, index) => (
                  <>
                    <Field label="Days"><input value={row.days || ""} onChange={(event) => updateRow("businessHours", index, "days", event.target.value)} className={inputClass} placeholder="Mon - Fri" /></Field>
                    <Field label="Hours"><input value={row.hours || ""} onChange={(event) => updateRow("businessHours", index, "hours", event.target.value)} className={inputClass} placeholder="9:00 - 18:00" /></Field>
                  </>
                )}
              />
            </Card>

            <Card eyebrow="Departments" title="Department contacts">
              <Repeater
                rows={settings.departments || []}
                onAdd={() => addRow("departments", { label: "", email: "" })}
                onRemove={(index) => removeRow("departments", index)}
                addLabel="Add department"
                empty="No departments yet."
                render={(row, index) => (
                  <>
                    <Field label="Label"><input value={row.label || ""} onChange={(event) => updateRow("departments", index, "label", event.target.value)} className={inputClass} placeholder="Sales" /></Field>
                    <Field label="Email"><input value={row.email || ""} onChange={(event) => updateRow("departments", index, "email", event.target.value)} className={inputClass} /></Field>
                  </>
                )}
              />
            </Card>

            <Card eyebrow="Social" title="Social links">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Twitter"><input value={settings.social?.twitter || ""} onChange={(event) => setSocial("twitter", event.target.value)} className={inputClass} placeholder="https://twitter.com/..." /></Field>
                <Field label="GitHub"><input value={settings.social?.github || ""} onChange={(event) => setSocial("github", event.target.value)} className={inputClass} placeholder="https://github.com/..." /></Field>
                <Field label="LinkedIn"><input value={settings.social?.linkedin || ""} onChange={(event) => setSocial("linkedin", event.target.value)} className={inputClass} placeholder="https://linkedin.com/..." /></Field>
                <Field label="Dribbble"><input value={settings.social?.dribbble || ""} onChange={(event) => setSocial("dribbble", event.target.value)} className={inputClass} placeholder="https://dribbble.com/..." /></Field>
              </div>
            </Card>
          </>
        )}
          </div>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-bold text-gray-900">Live preview</h2>
              </div>
              <ContactPreview settings={settings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DH = {
  bg: "#0a0a0a",
  raised: "#111111",
  text: "#ededed",
  dim: "#8a8a8a",
  accent: "#c6f135",
  border: "#262626",
};

function PreviewLabel({ children }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: DH.accent }}>
      {children}
    </span>
  );
}

function ContactPreview({ settings }) {
  const office = settings?.office || {};
  const addressLines = (office.addressLines || []).filter((line) => line?.trim());
  const businessHours = settings?.businessHours || [];
  const departments = settings?.departments || [];

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-5" style={{ borderColor: DH.border, background: DH.bg }}>
      <div className="border p-5" style={{ borderColor: DH.border }}>
        <PreviewLabel>Office</PreviewLabel>
        <p className="mt-4 text-base font-bold" style={{ color: DH.text }}>
          {office.name || "Office name"}
        </p>
        {addressLines.length ? (
          addressLines.map((line, index) => (
            <p key={index} className="text-sm" style={{ color: DH.dim }}>
              {line}
            </p>
          ))
        ) : (
          <p className="text-sm" style={{ color: DH.dim }}>
            No address lines yet.
          </p>
        )}
        <div
          className="mt-4 flex h-24 items-center justify-center border border-dashed"
          style={{ borderColor: DH.border, background: DH.raised }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: DH.dim }}>
            {settings?.mapEmbedPlaceholder || "Map embed"}
          </span>
        </div>
      </div>

      <div className="border p-5" style={{ borderColor: DH.border }}>
        <PreviewLabel>Reach Us</PreviewLabel>
        <ul className="mt-4 flex flex-col gap-2 text-sm" style={{ color: DH.dim }}>
          <li>
            Email: <span style={{ color: DH.text }}>{settings?.email || "hello@dailyhnt.com"}</span>
          </li>
          <li>
            Phone: <span style={{ color: DH.text }}>{settings?.phone || "+1 000 000 0000"}</span>
          </li>
        </ul>
      </div>

      <div className="border p-5" style={{ borderColor: DH.border }}>
        <PreviewLabel>Business Hours</PreviewLabel>
        <ul className="mt-4 flex flex-col gap-2 text-sm" style={{ color: DH.dim }}>
          {businessHours.length ? (
            businessHours.map((row, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span>{row.days || "Days"}</span>
                <span style={{ color: DH.text }}>{row.hours || "Hours"}</span>
              </li>
            ))
          ) : (
            <li>No business hours yet.</li>
          )}
        </ul>
      </div>

      <div className="border p-5" style={{ borderColor: DH.border }}>
        <PreviewLabel>Departments</PreviewLabel>
        <ul className="mt-4 flex flex-col gap-2 text-sm" style={{ color: DH.dim }}>
          {departments.length ? (
            departments.map((row, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span>{row.label || "Label"}</span>
                <span style={{ color: DH.text }}>{row.email || "email@dailyhnt.com"}</span>
              </li>
            ))
          ) : (
            <li>No departments yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Repeater({ rows, onAdd, onRemove, render, addLabel, empty }) {
  return (
    <div className="space-y-3">
      {rows.length ? rows.map((row, index) => (
        <div key={index} className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-[1fr_1fr_44px]">
          {render(row, index)}
          <button onClick={() => onRemove(index)} className="mt-6 flex h-11 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      )) : (
        <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm font-semibold text-gray-400">{empty}</p>
      )}
      <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
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
