"use client";

// ALTF Engine — Global (Root-Level) SEO Settings.
// Form-driven editor for site-wide defaults persisted into seo/runtime.global.

import { useEffect, useMemo, useState } from "react";
import {
  Globe2,
  Save,
  Type,
  FileText,
  ShieldCheck,
  Share2,
  Twitter,
  BadgeCheck,
  Image as ImageIcon,
  Code2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { fetchSeoConfig, saveSeoConfig } from "../services/seoService";
import { getErrorMessage } from "@/lib/apiClient";
import SeoNav from "../components/SeoNav";
import SeoPreviews from "../components/SeoPreviews";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  Toggle,
  KeywordsInput,
  CharCount,
  SectionCard,
  Banner,
  BTN_PRIMARY,
} from "../components/ui";
import { TWITTER_CARD_OPTIONS, buildAbsoluteUrl } from "../lib/seoModel";

function readGlobalForm(global = {}) {
  return {
    siteName: global.siteName || "",
    siteTitle: global.siteTitle || "",
    baseUrl: global.baseUrl || "",
    titleTemplate: global.titleTemplate || "",
    title: global.title || "",
    description: global.description || "",
    keywords: Array.isArray(global.keywords) ? global.keywords : [],
    favicon: global.favicon || "",
    image: global.image || "",
    robotsIndex: global?.robots?.index !== false,
    robotsFollow: global?.robots?.follow !== false,
    og: {
      type: global.og?.type || "website",
      siteName: global.og?.siteName || "",
      title: global.og?.title || "",
      description: global.og?.description || "",
      image: global.og?.image || "",
    },
    twitter: {
      card: global.twitter?.card || "summary_large_image",
      site: global.twitter?.site || "",
      creator: global.twitter?.creator || "",
      image: global.twitter?.image || "",
    },
    verification: {
      google: global.verification?.google || "",
      bing: global.verification?.bing || "",
      yandex: global.verification?.yandex || "",
      pinterest: global.verification?.pinterest || "",
      facebook: global.verification?.facebook || "",
    },
    code: {
      head: global.code?.head || "",
      bodyStart: global.code?.bodyStart || "",
      bodyEnd: global.code?.bodyEnd || "",
    },
  };
}

function buildGlobal(form) {
  const clean = (s) => (typeof s === "string" && s.trim() ? s.trim() : undefined);
  const cleanObj = (obj) => {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const c = clean(v);
      if (c !== undefined) out[k] = c;
    }
    return Object.keys(out).length ? out : undefined;
  };
  return {
    siteName: clean(form.siteName),
    siteTitle: clean(form.siteTitle),
    baseUrl: clean(form.baseUrl),
    titleTemplate: clean(form.titleTemplate),
    title: clean(form.title),
    description: clean(form.description),
    keywords: (form.keywords || []).filter(Boolean),
    favicon: clean(form.favicon),
    image: clean(form.image),
    robots: { index: !!form.robotsIndex, follow: !!form.robotsFollow },
    og: cleanObj(form.og),
    twitter: cleanObj(form.twitter),
    verification: cleanObj(form.verification),
    code: cleanObj(form.code),
  };
}

export default function GlobalSeoPage() {
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [savedPopup, setSavedPopup] = useState("");
  const [isError, setIsError] = useState(false);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cfg = await fetchSeoConfig();
        if (!active) return;
        setConfig(cfg || {});
        setForm(readGlobalForm(cfg?.global));
        setEnabled(Boolean(cfg?.enabled));
        setStatus("ready");
      } catch (e) {
        if (!active) return;
        setStatus("ready");
        setIsError(true);
        setMessage(getErrorMessage(e));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setOg = (patch) => setForm((f) => ({ ...f, og: { ...f.og, ...patch } }));
  const setTw = (patch) => setForm((f) => ({ ...f, twitter: { ...f.twitter, ...patch } }));
  const setVer = (patch) => setForm((f) => ({ ...f, verification: { ...f.verification, ...patch } }));
  const setCode = (patch) => setForm((f) => ({ ...f, code: { ...f.code, ...patch } }));

  const preview = useMemo(() => {
    if (!form) return null;
    return {
      url: buildAbsoluteUrl(config, "/"),
      title: form.og.title || form.title || form.siteName || "AltFTool",
      description: form.og.description || form.description,
      image: form.og.image || form.image ? buildAbsoluteUrl(config, form.og.image || form.image) : "",
      siteName: form.og.siteName || form.siteName || "AltFTool",
      twitterCard: form.twitter.card,
    };
  }, [form, config]);

  async function handleSave() {
    setMessage("");
    setWarnings([]);
    setIsError(false);
    setStatus("saving");
    const next = { ...config, enabled, global: buildGlobal(form) };
    try {
      const res = await saveSeoConfig(next, {});
      setConfig(next);
      setStatus("ready");
      setMessage(`Saved global SEO settings (v${res.version}). Live within a few seconds.`);
      setSavedPopup(`Saved global SEO settings (v${res.version}). Live within a few seconds.`);
      setWarnings(res.warnings || []);
    } catch (e) {
      setStatus("ready");
      setIsError(true);
      setMessage(getErrorMessage(e));
      setWarnings(e?.payload?.errors || []);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12 animate-slide-in">
      <SuccessDialog
        open={Boolean(savedPopup)}
        title="Changes applied successfully"
        message={savedPopup}
        onClose={() => setSavedPopup("")}
      />
      <SeoNav active="global" />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Globe2 className="h-6 w-6 text-primary" /> Global SEO Settings
          </h1>
          <p className="mt-1 text-sm text-muted">
            Root-level defaults applied site-wide. Page-level overrides always win over these values.
          </p>
        </div>
        <label className="inline-flex cursor-pointer select-none items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          Engine enabled
        </label>
      </header>

      {status === "loading" || !form ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted">Loading settings…</div>
      ) : (
        <>
          {message && (
            <Banner tone={isError ? "danger" : "success"}>
              <span className="inline-flex items-center gap-1.5">
                {isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {message}
              </span>
            </Banner>
          )}
          {warnings.length > 0 && (
            <Banner tone="warning">
              <ul className="list-disc space-y-0.5 pl-4">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </Banner>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Site identity" icon={Type} description="Brand name, canonical base URL and title template.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Site Title" hint="Brand/site name (used as OG site name fallback).">
                  <TextInput value={form.siteName} onChange={(v) => set({ siteName: v })} placeholder="AltFTool" maxLength={120} />
                </Field>
                <Field label="Canonical Base URL" hint="Used to build absolute canonical & OG URLs.">
                  <TextInput value={form.baseUrl} onChange={(v) => set({ baseUrl: v })} placeholder="https://altftool.com" maxLength={300} />
                </Field>
              </div>
              <Field label="Title Template" hint="Use %s for the page title, e.g. “%s | AltFTool”.">
                <TextInput value={form.titleTemplate} onChange={(v) => set({ titleTemplate: v })} placeholder="%s | AltFTool" maxLength={120} />
              </Field>
            </SectionCard>

            <SectionCard title="Default meta" icon={FileText} description="Fallback meta title, description and keywords.">
              <Field
                label="Default Meta Title"
                hint="Recommended 50–60 characters."
                right={<CharCount value={form.title} min={30} max={60} />}
              >
                <TextInput value={form.title} onChange={(v) => set({ title: v })} placeholder="AltFTool — free online tools" maxLength={200} />
              </Field>
              <Field
                label="Default Meta Description"
                hint="Recommended 120–160 characters."
                right={<CharCount value={form.description} min={120} max={160} />}
              >
                <TextArea value={form.description} onChange={(v) => set({ description: v })} rows={3} maxLength={320} placeholder="Describe the site for search engines." />
              </Field>
              <Field label="Default Meta Keywords">
                <KeywordsInput value={form.keywords} onChange={(v) => set({ keywords: v })} />
              </Field>
            </SectionCard>

            <SectionCard title="Default robots" icon={ShieldCheck} description="Site-wide indexing default. Disabling index noindexes everything — use with care.">
              <Toggle label="Allow indexing (index)" hint="Search engines may index pages by default." checked={form.robotsIndex} onChange={(v) => set({ robotsIndex: v })} />
              <Toggle label="Follow links (follow)" hint="Search engines may follow links by default." checked={form.robotsFollow} onChange={(v) => set({ robotsFollow: v })} />
              {!form.robotsIndex && (
                <Banner tone="danger">Warning: index is OFF globally — this will noindex the entire site.</Banner>
              )}
            </SectionCard>

            <SectionCard title="Branding & social image" icon={ImageIcon} description="Favicon and default social share image.">
              <Field label="Favicon URL" hint="Path or absolute URL, e.g. /favicon.ico">
                <TextInput value={form.favicon} onChange={(v) => set({ favicon: v })} placeholder="/favicon.ico" maxLength={500} />
              </Field>
              <Field label="Default Social Share Image" hint="Fallback OG/Twitter image (1200×630 recommended).">
                <TextInput value={form.image} onChange={(v) => set({ image: v })} placeholder="/assets/og-default.png" maxLength={500} />
              </Field>
            </SectionCard>

            <SectionCard title="Open Graph defaults" icon={Share2} description="Defaults for Facebook / LinkedIn sharing.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="OG Type">
                  <Select value={form.og.type} onChange={(v) => setOg({ type: v })} options={["website", "article", "product", "profile"]} />
                </Field>
                <Field label="OG Site Name">
                  <TextInput value={form.og.siteName} onChange={(v) => setOg({ siteName: v })} placeholder="AltFTool" maxLength={120} />
                </Field>
              </div>
              <Field label="OG Title (fallback)">
                <TextInput value={form.og.title} onChange={(v) => setOg({ title: v })} placeholder="Defaults to meta title" maxLength={200} />
              </Field>
              <Field label="OG Description (fallback)">
                <TextArea value={form.og.description} onChange={(v) => setOg({ description: v })} rows={2} maxLength={320} placeholder="Defaults to meta description" />
              </Field>
              <Field label="OG Image (fallback)">
                <TextInput value={form.og.image} onChange={(v) => setOg({ image: v })} placeholder="Defaults to social share image" maxLength={500} />
              </Field>
            </SectionCard>

            <SectionCard title="Twitter Card defaults" icon={Twitter} description="Defaults for X / Twitter sharing.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Card Type">
                  <Select value={form.twitter.card} onChange={(v) => setTw({ card: v })} options={TWITTER_CARD_OPTIONS} />
                </Field>
                <Field label="Site @handle">
                  <TextInput value={form.twitter.site} onChange={(v) => setTw({ site: v })} placeholder="@altftool" maxLength={60} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Creator @handle">
                  <TextInput value={form.twitter.creator} onChange={(v) => setTw({ creator: v })} placeholder="@altftool" maxLength={60} />
                </Field>
                <Field label="Twitter Image (fallback)">
                  <TextInput value={form.twitter.image} onChange={(v) => setTw({ image: v })} placeholder="Defaults to social share image" maxLength={500} />
                </Field>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Verification tags" icon={BadgeCheck} description="Search-engine and platform ownership verification tokens.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Google" hint="google-site-verification content">
                <TextInput value={form.verification.google} onChange={(v) => setVer({ google: v })} placeholder="token" maxLength={200} />
              </Field>
              <Field label="Bing" hint="msvalidate.01 content">
                <TextInput value={form.verification.bing} onChange={(v) => setVer({ bing: v })} placeholder="token" maxLength={200} />
              </Field>
              <Field label="Yandex" hint="yandex-verification content">
                <TextInput value={form.verification.yandex} onChange={(v) => setVer({ yandex: v })} placeholder="token" maxLength={200} />
              </Field>
              <Field label="Pinterest" hint="p:domain_verify content">
                <TextInput value={form.verification.pinterest} onChange={(v) => setVer({ pinterest: v })} placeholder="token" maxLength={200} />
              </Field>
              <Field label="Facebook" hint="facebook-domain-verification content">
                <TextInput value={form.verification.facebook} onChange={(v) => setVer({ facebook: v })} placeholder="token" maxLength={200} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="Custom Head & Body Code"
            icon={Code2}
            description="Site-wide raw HTML/scripts — analytics, GTM, pixels, custom CSS, chat widgets. Applied on every page."
          >
            <Banner tone="warning">
              Advanced: this injects raw code into every page. Only paste code from sources you trust. For search-engine verification, prefer the Verification tags above.
            </Banner>
            <Field label="Head code" hint="Loaded early on every page (analytics, GTM, <style>, meta pixels).">
              <TextArea value={form.code.head} onChange={(v) => setCode({ head: v })} rows={5} mono maxLength={50000} placeholder="<!-- e.g. Google Tag Manager, analytics, <style>… -->" />
            </Field>
            <Field label="Body start code" hint="Injected right after <body> opens (e.g. GTM noscript).">
              <TextArea value={form.code.bodyStart} onChange={(v) => setCode({ bodyStart: v })} rows={4} mono maxLength={50000} placeholder="<!-- injected at the top of <body> -->" />
            </Field>
            <Field label="Body end code" hint="Injected before </body> (chat widgets, deferred tracking scripts).">
              <TextArea value={form.code.bodyEnd} onChange={(v) => setCode({ bodyEnd: v })} rows={4} mono maxLength={50000} placeholder="<!-- injected at the end of <body> -->" />
            </Field>
          </SectionCard>

          <SectionCard title="Homepage preview" icon={Globe2} description="How the homepage defaults appear on Google and social platforms.">
            {preview && <SeoPreviews {...preview} />}
          </SectionCard>

          <div className="sticky bottom-4 flex justify-end">
            <button type="button" onClick={handleSave} disabled={status === "saving"} className={`${BTN_PRIMARY} shadow-lg`}>
              <Save className="h-4 w-4" />
              {status === "saving" ? "Saving…" : "Save global settings"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
