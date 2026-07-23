"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Globe,
  Loader2,
  MapPin,
  Save,
  Settings,
  Share2,
  Tags,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { CollectionManager, HEX, inputClass, textareaClass } from "../_shared/AdminSectionShared";
import {
  DEFAULT_SITE_SETTINGS,
  createSocial,
  deleteSocial,
  saveSiteSettings,
  subscribeSiteSettings,
  subscribeSocial,
  toggleSocialStatus,
  updateSocial,
} from "./service/siteSettings.service";

export default function ThestylelifeSiteSettingsPage() {
  const [form, setForm] = useState(DEFAULT_SITE_SETTINGS);
  const [saved, setSaved] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [social, setSocial] = useState([]);

  useEffect(() => {
    const unsub = subscribeSiteSettings(
      (data) => {
        setForm(data);
        setSaved(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load site settings." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function setKeywords(value) {
    setForm((prev) => ({ ...prev, keywords: value.split("\n") }));
  }

  async function save() {
    const nextErrors = {};
    if (!form.name?.trim()) nextErrors.name = "Site name is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveSiteSettings(form);
      emitAlert({ type: "success", message: "Site settings saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save site settings." });
    } finally {
      setSaving(false);
    }
  }

  const keywordsText = Array.isArray(form.keywords) ? form.keywords.join("\n") : (form.keywords || "");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TheStyleLife Site Settings</h1>
              <p className="text-sm text-gray-500">Global brand, contact, social, and SEO defaults.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
              {dirty ? "Unsaved" : "Saved"}
            </span>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section className="space-y-5">
              <SectionCard icon={Globe} eyebrow="Brand" title="Identity">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" error={errors.name}><input value={form.name || ""} onChange={(event) => setField("name", event.target.value)} className={inputClass} placeholder="TheStyleLife" /></Field>
                  <Field label="Legal Name"><input value={form.legalName || ""} onChange={(event) => setField("legalName", event.target.value)} className={inputClass} placeholder="TheStyleLife Studio" /></Field>
                  <Field label="Founded Year"><input type="number" value={form.foundedYear ?? ""} onChange={(event) => setField("foundedYear", event.target.value)} className={inputClass} placeholder="2016" /></Field>
                  <Field label="Site URL"><input value={form.url || ""} onChange={(event) => setField("url", event.target.value)} className={inputClass} placeholder="https://www.thestylife.studio" /></Field>
                </div>
                <Field label="Tagline"><input value={form.tagline || ""} onChange={(event) => setField("tagline", event.target.value)} className={inputClass} /></Field>
                <Field label="Description"><textarea value={form.description || ""} onChange={(event) => setField("description", event.target.value)} rows={3} className={textareaClass} /></Field>
              </SectionCard>

              <SectionCard icon={MapPin} eyebrow="Contact" title="Reach">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email"><input value={form.email || ""} onChange={(event) => setField("email", event.target.value)} className={inputClass} placeholder="hello@thestylife.studio" /></Field>
                  <Field label="Phone"><input value={form.phone || ""} onChange={(event) => setField("phone", event.target.value)} className={inputClass} placeholder="+1 (212) 555-0192" /></Field>
                </div>
                <Field label="Address"><input value={form.address || ""} onChange={(event) => setField("address", event.target.value)} className={inputClass} placeholder="212 Mercer Street, Suite 5A, New York, NY 10012" /></Field>
              </SectionCard>

              <SectionCard icon={Tags} eyebrow="SEO" title="Meta defaults">
                <Field label="Keywords (one per line)" hint="Title & description derive from the brand name, tagline, and description above.">
                  <textarea value={keywordsText} onChange={(event) => setKeywords(event.target.value)} rows={4} className={textareaClass} />
                </Field>
              </SectionCard>

              <div className="flex items-center gap-2 pt-1 text-sm font-bold text-gray-700">
                <Share2 className="h-4 w-4 text-gray-400" /> Social profiles
              </div>
              <CollectionManager
                eyebrow="Social"
                title="Profiles"
                itemNoun="profile"
                subscribe={subscribeSocial}
                create={createSocial}
                update={updateSocial}
                remove={deleteSocial}
                toggle={toggleSocialStatus}
                onItems={setSocial}
                fields={[
                  { key: "label", label: "Label", type: "text", required: true, half: true, placeholder: "Instagram" },
                  { key: "href", label: "Href", type: "text", required: true, half: true, placeholder: "https://instagram.com" },
                ]}
                columns={[{ key: "label", label: "Profile" }, { key: "href", label: "Href", render: (item) => item.href }]}
                itemLabel={(item) => item.label}
              />
            </section>

            <section className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <h2 className="text-base font-bold text-gray-900">Live preview</h2>
                </div>
                <SettingsPreview form={form} social={social} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------- TheStyleLife front-end live preview ------------------ */

function SettingsPreview({ form, social }) {
  const socials = (social || []).filter((item) => item.active !== false && item?.label);
  const displayUrl = (form.url || "https://www.thestylife.studio").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const keywords = Array.isArray(form.keywords) ? form.keywords.filter(Boolean) : [];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border p-6" style={{ borderColor: HEX.border, background: HEX.bg, color: HEX.fg }}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" style={{ color: HEX.accent }} />
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              background: `linear-gradient(90deg, ${HEX.accentAlt}, ${HEX.violet}, ${HEX.accent})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {form.name || "TheStyleLife"}
          </span>
        </div>
        {form.tagline ? (
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: HEX.accent }}>{form.tagline}</p>
        ) : null}
        <p className="mt-4 max-w-md text-xs leading-relaxed" style={{ color: HEX.dim }}>
          {form.description || "Add a description to preview it here."}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: HEX.dim }}>
          {form.foundedYear ? <span>Est. {form.foundedYear}</span> : null}
        </div>
        {socials.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {socials.map((item) => (
              <span key={item.id} className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ borderColor: HEX.border, color: HEX.fg }}>
                {item.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Contact preview</p>
        <div className="space-y-1 rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">{displayUrl}</p>
          <p className="text-sm font-semibold text-gray-900">{form.email || "No email set."}</p>
          <p className="text-xs text-gray-600">{form.phone || ""}</p>
          <p className="text-xs text-gray-600">{form.address || ""}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">SEO preview</p>
        <div className="space-y-1 rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">{form.name ? `${form.name} — ${form.tagline || ""}` : "No title yet."}</p>
          <p className="text-xs text-gray-600">{form.description || "No description set."}</p>
          {keywords.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {keywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{keyword}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, eyebrow, title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600"><Icon className="h-4 w-4" /></div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
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
