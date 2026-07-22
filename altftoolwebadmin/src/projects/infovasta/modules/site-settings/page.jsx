"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Eye,
  Globe,
  Loader2,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_SITE_SETTINGS,
  saveSiteSettings,
  subscribeSiteSettings,
} from "./service/siteSettings.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const TWITTER_CARD_OPTIONS = ["summary", "summary_large_image"];

export default function InfovastaSiteSettingsPage() {
  const [form, setForm] = useState(DEFAULT_SITE_SETTINGS);
  const [saved, setSaved] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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

  function setBrand(key, value) {
    setForm((prev) => ({ ...prev, brand: { ...prev.brand, [key]: value } }));
    setErrors((prev) => ({ ...prev, [`brand.${key}`]: "" }));
  }

  function setSeo(key, value) {
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
    setErrors((prev) => ({ ...prev, [`seo.${key}`]: "" }));
  }

  function setSameAs(list) {
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, sameAs: list } }));
  }

  async function save() {
    const nextErrors = {};
    if (!form.brand?.logoText?.trim()) nextErrors["brand.logoText"] = "Logo text is required.";
    if (!form.seo?.siteName?.trim()) nextErrors["seo.siteName"] = "Site name is required.";
    if (!form.seo?.baseUrl?.trim()) nextErrors["seo.baseUrl"] = "Base URL is required.";
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Infovasta Site Settings</h1>
              <p className="text-sm text-gray-500">Global brand and SEO configuration.</p>
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
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                  {[
                    { key: "text", label: "Text logo" },
                    { key: "image", label: "Image logo" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setBrand("logoType", key)}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${form.brand?.logoType === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Field label="Logo Text" error={errors["brand.logoText"]}>
                  <input value={form.brand?.logoText || ""} onChange={(event) => setBrand("logoText", event.target.value)} className={inputClass} placeholder="InfoVsta" />
                </Field>
                <Field label="Logo Image URL" hint="Path or URL to the logo image (used when logo type is Image).">
                  <input value={form.brand?.logoImage || ""} onChange={(event) => setBrand("logoImage", event.target.value)} className={inputClass} placeholder="/assets/images/logo.svg" />
                </Field>
              </SectionCard>

              <SectionCard icon={Search} eyebrow="SEO" title="Search metadata">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Site Name" error={errors["seo.siteName"]}><input value={form.seo?.siteName || ""} onChange={(event) => setSeo("siteName", event.target.value)} className={inputClass} /></Field>
                  <Field label="Base URL" error={errors["seo.baseUrl"]}><input value={form.seo?.baseUrl || ""} onChange={(event) => setSeo("baseUrl", event.target.value)} className={inputClass} placeholder="https://www.infovsta.com" /></Field>
                </div>
                <Field label="Title Template"><input value={form.seo?.titleTemplate || ""} onChange={(event) => setSeo("titleTemplate", event.target.value)} className={inputClass} placeholder="%s | InfoVsta" /></Field>
                <Field label="Meta Description"><textarea value={form.seo?.description || ""} onChange={(event) => setSeo("description", event.target.value)} rows={3} className={textareaClass} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Favicon"><input value={form.seo?.favicon || ""} onChange={(event) => setSeo("favicon", event.target.value)} className={inputClass} placeholder="/favicon.svg" /></Field>
                  <Field label="OG Image"><input value={form.seo?.ogImage || ""} onChange={(event) => setSeo("ogImage", event.target.value)} className={inputClass} placeholder="/assets/images/hero-banner.png" /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Twitter Card">
                    <select value={form.seo?.twitterCard || ""} onChange={(event) => setSeo("twitterCard", event.target.value)} className={inputClass}>
                      {TWITTER_CARD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </Field>
                  <Field label="Organization Name"><input value={form.seo?.organizationName || ""} onChange={(event) => setSeo("organizationName", event.target.value)} className={inputClass} /></Field>
                </div>
                <TextListField label="Same As (social/profile URLs)" items={form.seo?.sameAs || []} onChange={setSameAs} placeholder="https://twitter.com/infovsta" />
              </SectionCard>
            </section>

            <section className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <h2 className="text-base font-bold text-gray-900">Live preview</h2>
                </div>
                <SettingsPreview form={form} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------- Infovasta front-end live preview ------------------- */

function SettingsPreview({ form }) {
  const seoTitle = form.seo?.siteName?.trim() || "InfoVsta";
  const seoDesc = form.seo?.description?.trim() || "Add a meta description to preview the search snippet.";
  const url = form.seo?.baseUrl?.trim() || "https://infovsta.example.com";
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const logoText = form.brand?.logoText || "InfoVsta";
  const sameAs = (form.seo?.sameAs || []).slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-indigo-200 bg-indigo-50 p-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-indigo-600" />
          {form.brand?.logoType === "image" && form.brand?.logoImage ? (
            <img src={form.brand.logoImage} alt={logoText} className="h-7 max-w-40 object-contain" />
          ) : (
            <span className="text-lg font-bold tracking-tight text-gray-900">{logoText}</span>
          )}
        </div>
        <p className="mt-4 max-w-md text-xs leading-relaxed text-gray-600">
          {form.seo?.organizationName || "Add an organization name to preview it here."}
        </p>
        {sameAs.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {sameAs.map((url2) => (
              <span key={url2} className="max-w-[180px] truncate rounded-full border border-indigo-200 px-2.5 py-1 text-[10px] font-semibold text-gray-700">
                {url2}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Search result preview</p>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="truncate text-xs text-[#202124]">{displayUrl}</p>
          <p className="mt-1 truncate text-base font-medium leading-snug text-[#1a0dab]">{seoTitle}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4d5156]">{seoDesc}</p>
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

function TextListField({ label, items, onChange, placeholder }) {
  function setItem(index, value) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }
  function addItem() {
    onChange([...items, ""]);
  }
  function removeItem(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input value={item} onChange={(event) => setItem(index, event.target.value)} className={inputClass} placeholder={placeholder} />
            <button type="button" onClick={() => removeItem(index)} className="rounded-xl border border-red-200 px-3 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50">
          <Plus className="h-4 w-4" /> Add link
        </button>
      </div>
    </div>
  );
}
