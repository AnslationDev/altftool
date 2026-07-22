"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Contact,
  Eye,
  Globe,
  Loader2,
  Save,
  Search,
  Settings,
  Share2,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_SITE_SETTINGS,
  saveSiteSettings,
  subscribeSiteSettings,
} from "./service/siteSettings.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function keywordsToText(keywords) {
  return Array.isArray(keywords) ? keywords.join("\n") : String(keywords || "");
}

export default function SiteSettingsPage() {
  const [form, setForm] = useState(DEFAULT_SITE_SETTINGS);
  const [saved, setSaved] = useState(DEFAULT_SITE_SETTINGS);
  const [keywordsText, setKeywordsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsub = subscribeSiteSettings(
      (data) => {
        setForm(data);
        setSaved(data);
        setKeywordsText(keywordsToText(data.seo?.keywords));
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load site settings." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const dirty = useMemo(() => {
    const current = { ...form, seo: { ...form.seo, keywords: splitKeywords(keywordsText) } };
    const original = { ...saved, seo: { ...saved.seo, keywords: saved.seo?.keywords || [] } };
    return JSON.stringify(current) !== JSON.stringify(original);
  }, [form, saved, keywordsText]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function setSocial(key, value) {
    setForm((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }

  function setSeo(key, value) {
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
    setErrors((prev) => ({ ...prev, [`seo.${key}`]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!form.name?.trim()) nextErrors.name = "Site name is required.";
    if (!form.url?.trim()) nextErrors.url = "Site URL is required.";
    if (form.contactEmail && !EMAIL_RE.test(form.contactEmail)) nextErrors.contactEmail = "Enter a valid email.";
    if (!form.seo?.defaultTitle?.trim()) nextErrors["seo.defaultTitle"] = "Default title is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      const payload = { ...form, seo: { ...form.seo, keywords: splitKeywords(keywordsText) } };
      await saveSiteSettings(payload);
      emitAlert({ type: "success", message: "Site settings saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save site settings." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DailyHnt Site Settings</h1>
              <p className="text-sm text-gray-500">Global brand, contact, social, and SEO configuration.</p>
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
                  <Field label="Name" error={errors.name}><input value={form.name || ""} onChange={(event) => setField("name", event.target.value)} className={inputClass} placeholder="DailyHNT" /></Field>
                  <Field label="Site URL" error={errors.url}><input value={form.url || ""} onChange={(event) => setField("url", event.target.value)} className={inputClass} placeholder="https://dailyhnt.com" /></Field>
                  <Field label="Logo Text"><input value={form.logoText || ""} onChange={(event) => setField("logoText", event.target.value)} className={inputClass} /></Field>
                  <Field label="Logo Short"><input value={form.logoShort || ""} onChange={(event) => setField("logoShort", event.target.value)} className={inputClass} placeholder="DH" /></Field>
                </div>
                <Field label="Tagline"><input value={form.tagline || ""} onChange={(event) => setField("tagline", event.target.value)} className={inputClass} /></Field>
                <Field label="Description"><textarea value={form.description || ""} onChange={(event) => setField("description", event.target.value)} rows={3} className={textareaClass} /></Field>
              </SectionCard>

              <SectionCard icon={Contact} eyebrow="Contact" title="Reach us">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact Email" error={errors.contactEmail}><input value={form.contactEmail || ""} onChange={(event) => setField("contactEmail", event.target.value)} className={inputClass} placeholder="hello@dailyhnt.com" /></Field>
                  <Field label="Contact Phone"><input value={form.contactPhone || ""} onChange={(event) => setField("contactPhone", event.target.value)} className={inputClass} /></Field>
                </div>
              </SectionCard>

              <SectionCard icon={Share2} eyebrow="Social" title="Profiles">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Twitter"><input value={form.social?.twitter || ""} onChange={(event) => setSocial("twitter", event.target.value)} className={inputClass} placeholder="https://twitter.com/..." /></Field>
                  <Field label="GitHub"><input value={form.social?.github || ""} onChange={(event) => setSocial("github", event.target.value)} className={inputClass} placeholder="https://github.com/..." /></Field>
                  <Field label="LinkedIn"><input value={form.social?.linkedin || ""} onChange={(event) => setSocial("linkedin", event.target.value)} className={inputClass} placeholder="https://linkedin.com/..." /></Field>
                  <Field label="Dribbble"><input value={form.social?.dribbble || ""} onChange={(event) => setSocial("dribbble", event.target.value)} className={inputClass} placeholder="https://dribbble.com/..." /></Field>
                </div>
              </SectionCard>

              <SectionCard icon={Search} eyebrow="SEO" title="Search metadata">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Title Template"><input value={form.seo?.titleTemplate || ""} onChange={(event) => setSeo("titleTemplate", event.target.value)} className={inputClass} placeholder="%s | DailyHNT" /></Field>
                  <Field label="Default Title" error={errors["seo.defaultTitle"]}><input value={form.seo?.defaultTitle || ""} onChange={(event) => setSeo("defaultTitle", event.target.value)} className={inputClass} /></Field>
                </div>
                <Field label="Meta Description"><textarea value={form.seo?.description || ""} onChange={(event) => setSeo("description", event.target.value)} rows={3} className={textareaClass} /></Field>
                <Field label="Keywords (one per line or comma-separated)">
                  <textarea value={keywordsText} onChange={(event) => setKeywordsText(event.target.value)} rows={4} className={textareaClass} placeholder={"news\ntechnology\nstartups"} />
                </Field>
              </SectionCard>
            </section>

            <section className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <h2 className="text-base font-bold text-gray-900">Live preview</h2>
                </div>
                <SettingsPreview form={form} keywordsText={keywordsText} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------- DailyHnt front-end live preview -------------------- */

function SettingsPreview({ form, keywordsText }) {
  const socials = Object.entries(form.social || {}).filter(([, value]) => value?.trim());
  const seoTitle = form.seo?.defaultTitle?.trim() || form.name || "DailyHnt";
  const seoDesc = form.seo?.description?.trim() || form.description || "Add a meta description to preview the search snippet.";
  const url = form.url?.trim() || "https://dailyhnt.com";
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const logoText = (form.logoText || form.name || "DAILYHNT").toUpperCase();
  const keywords = String(keywordsText || "")
    .split(/[\n,]/)
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <div className="space-y-4">
      {/* brand card */}
      <div className="overflow-hidden rounded-xl border border-[#262626] bg-[#0a0a0a] p-6">
        <span className="font-mono text-sm font-medium uppercase tracking-[0.15em] text-[#ededed]">
          <span className="text-[#c6f135]">&gt;</span> {logoText}
        </span>
        {form.tagline ? (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[#ffb020]">{form.tagline}</p>
        ) : null}
        <p className="mt-4 max-w-md text-xs leading-relaxed text-[#8a8a8a]">
          {form.description || "Add a brand description to preview it here."}
        </p>
        {socials.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {socials.map(([key]) => (
              <span
                key={key}
                className="border border-[#3a3a3a] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#ededed]"
              >
                {key}
              </span>
            ))}
          </div>
        ) : null}
        {keywords.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {keywords.map((word) => (
              <span key={word} className="bg-[#111111] px-2 py-0.5 font-mono text-[10px] text-[#8a8a8a]">
                {word}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* SEO snippet card */}
      <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">Search result preview</p>
        <div className="rounded-lg bg-white p-4">
          <p className="truncate text-xs text-[#202124]">{displayUrl}</p>
          <p className="mt-1 truncate text-base font-medium leading-snug text-[#1a0dab]">{seoTitle}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4d5156]">{seoDesc}</p>
        </div>
      </div>
    </div>
  );
}

function splitKeywords(text) {
  return String(text || "")
    .split(/[\n,]/)
    .map((word) => word.trim())
    .filter(Boolean);
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

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
