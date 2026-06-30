"use client";

// ALTF Engine — per-page SEO editor (tabbed) used inside the Pages workspace.

import { useMemo, useState } from "react";
import {
  Save,
  Trash2,
  FileText,
  ShieldCheck,
  Share2,
  Braces,
  Languages,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import SeoPreviews from "../../components/SeoPreviews";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  Toggle,
  KeywordsInput,
  CharCount,
  Banner,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_DANGER,
} from "../../components/ui";
import {
  CHANGE_FREQ_OPTIONS,
  TWITTER_CARD_OPTIONS,
  effectivePreview,
} from "../../lib/seoModel";

const TABS = [
  { key: "basic", label: "Basic", icon: FileText },
  { key: "robots", label: "Robots & Sitemap", icon: ShieldCheck },
  { key: "social", label: "Social", icon: Share2 },
  { key: "schema", label: "Structured Data", icon: Braces },
  { key: "hreflang", label: "Hreflang", icon: Languages },
];

export default function PageEditor({ config, path, form, onChange, onSave, onDelete, saving, message, isError }) {
  const [tab, setTab] = useState("basic");
  const [schemaText, setSchemaText] = useState(() =>
    form.schema?.length ? JSON.stringify(form.schema, null, 2) : "",
  );
  const [schemaError, setSchemaError] = useState("");

  const set = (patch) => onChange({ ...form, ...patch });
  const setSitemap = (patch) => onChange({ ...form, sitemap: { ...form.sitemap, ...patch } });
  const setOg = (patch) => onChange({ ...form, og: { ...form.og, ...patch } });
  const setTw = (patch) => onChange({ ...form, twitter: { ...form.twitter, ...patch } });

  const preview = useMemo(() => effectivePreview(config, path, form), [config, path, form]);

  function commitSchema(text) {
    setSchemaText(text);
    if (!text.trim()) {
      setSchemaError("");
      onChange({ ...form, schema: [] });
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      setSchemaError("");
      onChange({ ...form, schema: arr });
    } catch (e) {
      setSchemaError(`Invalid JSON: ${e.message}`);
    }
  }

  function addHreflang() {
    onChange({ ...form, hreflang: [...(form.hreflang || []), { lang: "", href: "" }] });
  }
  function setHreflang(idx, patch) {
    const next = (form.hreflang || []).map((h, i) => (i === idx ? { ...h, ...patch } : h));
    onChange({ ...form, hreflang: next });
  }
  function removeHreflang(idx) {
    onChange({ ...form, hreflang: (form.hreflang || []).filter((_, i) => i !== idx) });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted">Editing page</div>
          <div className="truncate font-mono text-sm font-semibold text-foreground" title={path}>
            {path}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={onDelete} disabled={saving} className={BTN_DANGER} title="Remove this page override">
            <Trash2 className="h-4 w-4" /> Clear override
          </button>
          <button type="button" onClick={() => onSave(schemaError)} disabled={saving || !!schemaError} className={BTN_PRIMARY}>
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </div>

      {message && (
        <Banner tone={isError ? "danger" : "success"}>
          <span className="inline-flex items-center gap-1.5">
            {isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {message}
          </span>
        </Banner>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border pb-3">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  tab === key ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface-soft hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {tab === "basic" && (
            <div className="space-y-4">
              <Field label="Meta Title" right={<CharCount value={form.title} min={30} max={60} />}>
                <TextInput value={form.title} onChange={(v) => set({ title: v })} placeholder="Page title for search results" maxLength={200} />
              </Field>
              <Field label="Meta Description" right={<CharCount value={form.description} min={120} max={160} />}>
                <TextArea value={form.description} onChange={(v) => set({ description: v })} rows={3} maxLength={320} placeholder="Concise summary shown in search results" />
              </Field>
              <Field label="Meta Keywords">
                <KeywordsInput value={form.keywords} onChange={(v) => set({ keywords: v })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Canonical URL" hint="Absolute URL or path. Defaults to the page path.">
                  <TextInput value={form.canonical} onChange={(v) => set({ canonical: v })} placeholder="/tools/all/json-formatter" maxLength={500} />
                </Field>
                <Field label="Slug" hint="Optional slug metadata for this page.">
                  <TextInput value={form.slug} onChange={(v) => set({ slug: v })} placeholder="json-formatter" maxLength={200} />
                </Field>
              </div>
            </div>
          )}

          {tab === "robots" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle label="Index" hint="Allow search engines to index this page." checked={!form.noindex} onChange={(v) => set({ noindex: !v })} />
                <Toggle label="Follow" hint="Allow crawlers to follow links on this page." checked={form.follow} onChange={(v) => set({ follow: v })} />
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="mb-3 text-sm font-semibold text-foreground">Sitemap</h4>
                <Toggle
                  label="Include in sitemap"
                  hint="Override whether this URL appears in sitemap.xml."
                  checked={form.sitemap?.include !== false}
                  onChange={(v) => setSitemap({ include: v })}
                />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Priority" hint="0.0 – 1.0">
                    <TextInput
                      type="number"
                      value={form.sitemap?.priority ?? ""}
                      onChange={(v) => setSitemap({ priority: v === "" ? undefined : v })}
                      placeholder="0.5"
                    />
                  </Field>
                  <Field label="Change Frequency">
                    <Select
                      value={form.sitemap?.changeFreq || ""}
                      onChange={(v) => setSitemap({ changeFreq: v || undefined })}
                      options={[{ value: "", label: "— default —" }, ...CHANGE_FREQ_OPTIONS]}
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {tab === "social" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Open Graph</h4>
                <Field label="OG Title">
                  <TextInput value={form.og?.title} onChange={(v) => setOg({ title: v })} placeholder="Defaults to meta title" maxLength={200} />
                </Field>
                <Field label="OG Description">
                  <TextArea value={form.og?.description} onChange={(v) => setOg({ description: v })} rows={2} maxLength={320} placeholder="Defaults to meta description" />
                </Field>
                <Field label="OG Image">
                  <TextInput value={form.og?.image} onChange={(v) => setOg({ image: v })} placeholder="Defaults to global social image" maxLength={500} />
                </Field>
              </div>
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground">Twitter Card</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Card Type">
                    <Select
                      value={form.twitter?.card || ""}
                      onChange={(v) => setTw({ card: v || undefined })}
                      options={[{ value: "", label: "— global default —" }, ...TWITTER_CARD_OPTIONS]}
                    />
                  </Field>
                  <Field label="Twitter Image">
                    <TextInput value={form.twitter?.image} onChange={(v) => setTw({ image: v })} placeholder="Defaults to OG image" maxLength={500} />
                  </Field>
                </div>
                <Field label="Twitter Title">
                  <TextInput value={form.twitter?.title} onChange={(v) => setTw({ title: v })} placeholder="Defaults to OG/meta title" maxLength={200} />
                </Field>
                <Field label="Twitter Description">
                  <TextArea value={form.twitter?.description} onChange={(v) => setTw({ description: v })} rows={2} maxLength={320} placeholder="Defaults to OG/meta description" />
                </Field>
              </div>
            </div>
          )}

          {tab === "schema" && (
            <div className="space-y-3">
              <Field label="Structured Data (JSON-LD)" hint="One object or an array of schema.org objects. Rendered as <script type=application/ld+json>.">
                <TextArea
                  value={schemaText}
                  onChange={commitSchema}
                  rows={14}
                  mono
                  maxLength={20000}
                  placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "SoftwareApplication",\n  "name": "JSON Formatter"\n}'}
                />
              </Field>
              {schemaError ? (
                <Banner tone="danger">{schemaError}</Banner>
              ) : form.schema?.length ? (
                <Banner tone="success">{form.schema.length} valid JSON-LD block(s).</Banner>
              ) : null}
            </div>
          )}

          {tab === "hreflang" && (
            <div className="space-y-3">
              <p className="text-xs text-muted">Map language/region codes (e.g. en, en-US, x-default) to URLs for international targeting.</p>
              {(form.hreflang || []).map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={h.lang}
                    onChange={(e) => setHreflang(i, { lang: e.target.value })}
                    placeholder="en-US"
                    className="w-28 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    value={h.href}
                    onChange={(e) => setHreflang(i, { href: e.target.value })}
                    placeholder="https://altftool.com/… or /path"
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button type="button" onClick={() => removeHreflang(i)} className="rounded-md p-2 text-muted hover:bg-danger-soft hover:text-danger" aria-label="Remove">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addHreflang} className={BTN_SECONDARY}>
                <Plus className="h-4 w-4" /> Add hreflang
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Live preview</h4>
            <SeoPreviews {...preview} />
          </div>
        </div>
      </div>
    </div>
  );
}
