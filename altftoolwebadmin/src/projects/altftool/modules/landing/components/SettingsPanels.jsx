"use client";

// Tab bodies for the editor: SEO (with a live Google-result preview) and
// Settings (theme, ads, scheduling). Fully controlled — they take the `meta`
// slice ({ seo, theme, schema, ads, publishAt, expireAt }) and emit
// `onChange(next)` so the edit page stays the single owner of save state.

import { Braces, Palette, Megaphone, CalendarClock, Share2 } from "lucide-react";
import { Field, Input, Textarea, Select, ImageField, Toggle, ColorField } from "./fields";

function Card({ icon: Icon, title, desc, children }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-4 flex items-center gap-3">
        {Icon ? <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]"><Icon className="h-4 w-4" /></span> : null}
        <div className="min-w-0">
          <h3 className="text-sm font-black text-[var(--foreground)]">{title}</h3>
          {desc ? <p className="truncate text-xs text-[var(--muted)]">{desc}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

// datetime-local <-> epoch millis
function toLocalInput(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const fromLocalInput = (s) => (s ? new Date(s).getTime() : null);

// Live "how this looks on Google" snippet. SERP colours intentionally mimic
// Google's own UI (not our brand) so the preview reads as authentic.
export function GooglePreview({ seo = {}, title = "", slug = "" }) {
  const t = seo.metaTitle || title || "Untitled landing page";
  const d = seo.metaDescription || "Add a meta description to control this snippet.";
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-sm)]">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Search preview</p>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] text-[10px] font-black text-[var(--primary)]">A</span>
          <span>altftool.com <span className="opacity-60">› lander › {slug || "slug"}</span></span>
        </div>
        <p className="mt-1.5 truncate text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8]">{t}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-[var(--muted)]">{d}</p>
      </div>
      {seo.noIndex ? <p className="mt-2 text-[11px] font-semibold text-[var(--warning,#F59E0B)]">This page is set to noindex — it won’t appear in search.</p> : null}
    </div>
  );
}

export function SeoSettings({ meta, onChange, landerId, title = "", slug = "" }) {
  const seo = meta.seo || {};
  const schema = meta.schema || {};
  const setSeo = (patch) => onChange({ ...meta, seo: { ...seo, ...patch } });
  const setSchema = (patch) => onChange({ ...meta, schema: { ...schema, ...patch } });
  const keywords = Array.isArray(seo.keywords) ? seo.keywords : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Card title="Meta tags" desc="Title, description & canonical">
          <div className="space-y-3">
            <Field label="Meta title" hint={`${(seo.metaTitle || "").length}/60 recommended`}>
              <Input value={seo.metaTitle} onChange={(v) => setSeo({ metaTitle: v })} placeholder="Page title for search engines" />
            </Field>
            <Field label="Meta description" hint={`${(seo.metaDescription || "").length}/160 recommended`}>
              <Textarea rows={2} value={seo.metaDescription} onChange={(v) => setSeo({ metaDescription: v })} placeholder="A concise summary shown in search results." />
            </Field>
            <Field label="Canonical URL" hint="Leave blank to use the page's own /lander/slug URL.">
              <Input value={seo.canonical} onChange={(v) => setSeo({ canonical: v })} placeholder="https://altftool.com/lander/…" />
            </Field>
            <Field label="Keywords" hint="Comma-separated.">
              <Input value={keywords.join(", ")} onChange={(v) => setSeo({ keywords: v.split(",").map((k) => k.trim()).filter(Boolean) })} placeholder="design, canva, templates" />
            </Field>
            <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-2">
              <Toggle checked={seo.noIndex} onChange={(v) => setSeo({ noIndex: v })} label="noindex" hint="Hide from search engines" />
              <Toggle checked={seo.noFollow} onChange={(v) => setSeo({ noFollow: v })} label="nofollow" hint="Don't pass link equity" />
            </div>
          </div>
        </Card>

        <Card icon={Share2} title="Social / Open Graph" desc="Preview image when shared">
          <ImageField value={seo.ogImage} onChange={(v) => setSeo({ ogImage: v })} landerId={landerId} label="OG image (1200×630)" />
        </Card>

        <Card icon={Braces} title="Structured data" desc="JSON-LD emitted for rich results">
          <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-2">
            <Toggle checked={schema.faq} onChange={(v) => setSchema({ faq: v })} label="FAQ schema" hint="From FAQ sections" />
            <Toggle checked={schema.breadcrumbs} onChange={(v) => setSchema({ breadcrumbs: v })} label="Breadcrumbs" hint="BreadcrumbList" />
            <Toggle checked={schema.article} onChange={(v) => setSchema({ article: v })} label="Article" hint="Treat as an article" />
            <Toggle checked={schema.organization} onChange={(v) => setSchema({ organization: v })} label="Organization" hint="Publisher info" />
          </div>
        </Card>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <GooglePreview seo={seo} title={title} slug={slug} />
      </div>
    </div>
  );
}

export function DesignSettings({ meta, onChange, landerId }) {
  const theme = meta.theme || {};
  const ads = meta.ads || {};
  const placements = ads.placements || {};
  const setTheme = (patch) => onChange({ ...meta, theme: { ...theme, ...patch } });
  const setPlacement = (key, on) => onChange({ ...meta, ads: { ...ads, placements: { ...placements, [key]: on } } });

  const AD_SLOTS = [
    { key: "top", label: "Top of page", hint: "Above the first section" },
    { key: "inContent", label: "Between sections", hint: "Auto-injected mid-page" },
    { key: "bottom", label: "Bottom of page", hint: "Below the last section" },
    { key: "sidebar", label: "Sidebar", hint: "Wide layouts only" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card icon={Palette} title="Theme" desc="Colour, radius & width for this page">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Colour mode">
              <Select value={theme.mode || "auto"} onChange={(v) => setTheme({ mode: v })} options={[
                { value: "auto", label: "Auto (follow site)" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" },
              ]} />
            </Field>
            <Field label="Container width">
              <Select value={theme.containerWidth || "normal"} onChange={(v) => setTheme({ containerWidth: v })} options={[
                { value: "narrow", label: "Narrow" }, { value: "normal", label: "Normal" }, { value: "wide", label: "Wide" }, { value: "full", label: "Full-bleed" },
              ]} />
            </Field>
            <ColorField value={theme.brandColor} onChange={(v) => setTheme({ brandColor: v })} label="Brand colour" fallback="#14B8A6" />
            <ColorField value={theme.accent} onChange={(v) => setTheme({ accent: v })} label="Accent colour" fallback="#22D3EE" />
            <Field label="Corner radius">
              <Select value={theme.radius || "lg"} onChange={(v) => setTheme({ radius: v })} options={[
                { value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "Extra large" },
              ]} />
            </Field>
          </div>
          <p className="text-[11px] text-[var(--muted)]">Leave colours blank to inherit the ALTFTool teal/cyan defaults.</p>
        </div>
      </Card>

      <div className="space-y-4">
        <Card icon={Megaphone} title="Ads" desc="Auto ad placements for this page">
          <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-2">
            {AD_SLOTS.map((s) => (
              <Toggle key={s.key} checked={!!placements[s.key]} onChange={(v) => setPlacement(s.key, v)} label={s.label} hint={s.hint} />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-[var(--muted)]">Uses the existing Ads module. Add an inline “Ad Slot” section for precise placement.</p>
        </Card>

        <Card icon={CalendarClock} title="Scheduling" desc="Auto publish / expire windows">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Publish at" hint="Set status to Scheduled to use this.">
              <Input type="datetime-local" value={toLocalInput(meta.publishAt)} onChange={(v) => onChange({ ...meta, publishAt: fromLocalInput(v) })} />
            </Field>
            <Field label="Expire at" hint="Auto-archive after this time.">
              <Input type="datetime-local" value={toLocalInput(meta.expireAt)} onChange={(v) => onChange({ ...meta, expireAt: fromLocalInput(v) })} />
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}
