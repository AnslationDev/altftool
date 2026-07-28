"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, Check } from "lucide-react";

import { LoadingState } from "@/ansets";
import { emitAlert } from "@/lib/alertBus";
import { DEFAULT_MOCKLY_CONTENT, fetchMocklyHome, saveMocklyHome, ALL_TEMPLATES } from "./service/mockly.service";
import { Field, Grid, IconSelect, ImageField, ListEditor, TextArea } from "./components/fields";

const TABS = [
  { key: "hero", label: "Hero" },
  { key: "templates", label: "Templates" },
  { key: "templateVisibility", label: "Manage Templates" },
  { key: "features", label: "Features" },
  { key: "benefits", label: "Benefits" },
  { key: "howItWorks", label: "How It Works" },
  { key: "faq", label: "FAQ" },
  { key: "seo", label: "SEO" },
  { key: "editorDefaults", label: "Editor Defaults" },
];

function deepMerge(base, override) {
  if (Array.isArray(base)) return Array.isArray(override) ? override : base;
  if (base && typeof base === "object") {
    const out = { ...base };
    const src = override && typeof override === "object" ? override : {};
    for (const key of Object.keys(base)) out[key] = deepMerge(base[key], src[key]);
    return out;
  }
  return override === undefined || override === null ? base : override;
}

const clone = (value) => JSON.parse(JSON.stringify(value));

export default function PrankSocialMediaModule() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState("hero");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await fetchMocklyHome();
        if (active) setContent(deepMerge(DEFAULT_MOCKLY_CONTENT, stored || {}));
      } catch (err) {
        if (active) {
          setContent(clone(DEFAULT_MOCKLY_CONTENT));
          emitAlert({ type: "error", title: "Load failed", message: err?.message || "Showing defaults." });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const set = (path, value) => {
    setDirty(true);
    setContent((prev) => {
      const next = clone(prev);
      let node = next;
      for (let i = 0; i < path.length - 1; i += 1) node = node[path[i]];
      node[path[path.length - 1]] = value;
      return next;
    });
  };

  const sectionSetter = (section) => (key, value) => set([section, key], value);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveMocklyHome(content);
      setDirty(false);
      emitAlert({ type: "success", title: "Saved", message: "Changes go live on the next refresh." });
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message || "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all fields to the original defaults? (Nothing is saved until you click Save.)")) {
      setContent(clone(DEFAULT_MOCKLY_CONTENT));
      setDirty(true);
    }
  };

  if (loading || !content) {
    return <LoadingState variant="detail" />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">
              Prank Social Media · Home Page
            </h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Edit every section of <code className="rounded bg-[var(--surface-soft)] px-1 py-0.5">/prank-socialmedia</code>. Changes go live on the next refresh.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
            >
              <RotateCcw size={14} /> <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 -mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-t-lg border-b-2 px-3.5 py-2 text-sm font-semibold transition ${tab === t.key
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === "hero" && <HeroTab content={content} set={set} setField={sectionSetter("hero")} />}
      {tab === "templates" && (
        <TemplatesTab content={content} set={set} setField={sectionSetter("templates")} />
      )}
      {tab === "templateVisibility" && (
        <TemplateVisibilityTab content={content} set={set} />
      )}
      {tab === "features" && <FeaturesTab content={content} set={set} />}
      {tab === "benefits" && <BenefitsTab content={content} set={set} setField={sectionSetter("benefits")} />}
      {tab === "howItWorks" && <HowItWorksTab content={content} set={set} />}
      {tab === "faq" && <FaqTab content={content} set={set} />}
      {tab === "seo" && <SeoTab content={content} set={set} setField={sectionSetter("seo")} />}
      {tab === "editorDefaults" && (
        <EditorDefaultsTab content={content} set={set} />
      )}
    </div>
  );
}

function TemplateVisibilityTab({ content, set }) {
  const disabledList = content.disabledTemplates || [];

  const handleToggle = (slug, isEnabled) => {
    let next;
    if (isEnabled) {
      next = disabledList.filter((s) => s !== slug);
    } else {
      if (!disabledList.includes(slug)) {
        next = [...disabledList, slug];
      } else {
        next = disabledList;
      }
    }
    set(["disabledTemplates"], next);
  };

  return (
    <Card title="Manage Templates" hint="Enable or disable templates. Disabled templates immediately disappear from the frontend page, listings, and editor routes.">
      <div className="grid gap-4 sm:grid-cols-2">
        {ALL_TEMPLATES.map((t) => {
          const isEnabled = !disabledList.includes(t.slug);
          return (
            <div
              key={t.slug}
              className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:border-[color:var(--primary)]/30"
            >
              <div>
                <h4 className="text-sm font-bold text-[var(--foreground)]">{t.name}</h4>
                <p className="text-xs text-[var(--muted)]">{t.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(t.slug, !isEnabled)}
                className="flex items-center"
                aria-label={isEnabled ? `Disable ${t.name}` : `Enable ${t.name}`}
              >
                <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all ${isEnabled ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] group-hover:border-[var(--border-strong)] bg-[var(--surface)]"}`}>
                  {isEnabled && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Card({ title, hint, children }) {
  return (
    <section className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      {title ? (
        <header className="mb-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
          {hint ? <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

function HeroTab({ content, set, setField }) {
  const hero = content.hero;
  return (
    <Card title="Hero" hint="The main headline area at the top of the page.">
      <Field label="Eyebrow" value={hero.eyebrow} onChange={(v) => setField("eyebrow", v)} />
      <Field label="Title" value={hero.title} onChange={(v) => setField("title", v)} />
      <TextArea label="Subtitle" value={hero.subtitle} onChange={(v) => setField("subtitle", v)} rows={3} />
      <Grid>
        <Field label="Primary CTA" value={hero.ctaPrimary} onChange={(v) => setField("ctaPrimary", v)} />
        <Field label="Secondary CTA" value={hero.ctaSecondary} onChange={(v) => setField("ctaSecondary", v)} />
      </Grid>
      <ListEditor
        title="Trust badges"
        itemLabel="Badge"
        items={hero.trustBadges}
        onChange={(v) => set(["hero", "trustBadges"], v)}
        makeEmpty={() => ""}
        renderItem={(item, on) => <Field label="" value={item} onChange={on} />}
      />
      <ImageField
        label="Hero background image (optional)"
        value={hero.backgroundImage}
        onChange={(v) => setField("backgroundImage", v)}
      />
    </Card>
  );
}

function TemplatesTab({ content, set, setField }) {
  const t = content.templates;
  return (
    <Card title="Templates section" hint="Heading and which templates to display.">
      <Field label="Section title" value={t.sectionTitle} onChange={(v) => setField("sectionTitle", v)} />
      <TextArea
        label="Section subtitle"
        value={t.sectionSubtitle}
        onChange={(v) => setField("sectionSubtitle", v)}
        rows={2}
      />
      <ListEditor
        title="Featured template slugs (order matters)"
        itemLabel="Slug"
        items={t.featured}
        onChange={(v) => set(["templates", "featured"], v)}
        makeEmpty={() => ""}
        renderItem={(item, on) => (
          <Field label="" value={item} onChange={on} placeholder="e.g. whatsapp" />
        )}
      />
    </Card>
  );
}

function FeaturesTab({ content, set }) {
  return (
    <Card title="Features" hint="List of feature cards (icon, title, description).">
      <ListEditor
        itemLabel="Feature"
        items={content.features.items}
        onChange={(v) => set(["features", "items"], v)}
        makeEmpty={() => ({ icon: "Sparkles", title: "", desc: "" })}
        renderItem={(item, on) => (
          <>
            <Grid>
              <IconSelect label="Icon" value={item.icon} onChange={(v) => on({ ...item, icon: v })} />
              <Field label="Title" value={item.title} onChange={(v) => on({ ...item, title: v })} />
            </Grid>
            <TextArea label="Description" value={item.desc} onChange={(v) => on({ ...item, desc: v })} rows={2} />
          </>
        )}
      />
    </Card>
  );
}

function BenefitsTab({ content, set, setField }) {
  const b = content.benefits || { sectionTitle: "", items: [] };
  return (
    <Card title="Benefits" hint="List of benefits (title, description, and image/illustration).">
      <Field label="Section title" value={b.sectionTitle} onChange={(v) => setField("sectionTitle", v)} />
      <ListEditor
        itemLabel="Benefit Card"
        items={b.items}
        onChange={(v) => set(["benefits", "items"], v)}
        makeEmpty={() => ({ title: "", desc: "", image: "" })}
        renderItem={(item, on) => (
          <>
            <Grid>
              <Field label="Title" value={item.title} onChange={(v) => on({ ...item, title: v })} />
              <ImageField label="Image URL / Upload" value={item.image} onChange={(v) => on({ ...item, image: v })} />
            </Grid>
            <TextArea label="Description" value={item.desc} onChange={(v) => on({ ...item, desc: v })} rows={2} />
          </>
        )}
      />
    </Card>
  );
}

function HowItWorksTab({ content, set }) {
  return (
    <Card title="How It Works" hint="The steps shown on the landing page.">
      <ListEditor
        itemLabel="Step"
        items={content.howItWorks.steps}
        onChange={(v) => set(["howItWorks", "steps"], v)}
        makeEmpty={() => ({ number: "", title: "", desc: "" })}
        renderItem={(item, on) => (
          <>
            <Grid>
              <Field label="Number" value={item.number} onChange={(v) => on({ ...item, number: v })} />
              <Field label="Title" value={item.title} onChange={(v) => on({ ...item, title: v })} />
            </Grid>
            <TextArea label="Description" value={item.desc} onChange={(v) => on({ ...item, desc: v })} rows={2} />
          </>
        )}
      />
    </Card>
  );
}

function FaqTab({ content, set }) {
  return (
    <Card title="FAQ" hint="Frequently asked questions and answers.">
      <ListEditor
        itemLabel="Q&A"
        items={content.faq.items}
        onChange={(v) => set(["faq", "items"], v)}
        makeEmpty={() => ({ question: "", answer: "" })}
        renderItem={(item, on) => (
          <>
            <Field label="Question" value={item.question} onChange={(v) => on({ ...item, question: v })} />
            <TextArea label="Answer" value={item.answer} onChange={(v) => on({ ...item, answer: v })} rows={3} />
          </>
        )}
      />
    </Card>
  );
}

function SeoTab({ content, set, setField }) {
  const seo = content.seo || { metaTitle: "", metaDescription: "", keywords: "", ogImage: "" };
  return (
    <Card title="SEO Settings" hint="Meta tag information for search engines and social sharing.">
      <Field label="Meta Title" value={seo.metaTitle} onChange={(v) => setField("metaTitle", v)} />
      <TextArea label="Meta Description" value={seo.metaDescription} onChange={(v) => setField("metaDescription", v)} rows={3} />
      <Field label="Keywords (comma separated)" value={seo.keywords} onChange={(v) => setField("keywords", v)} />
      <ImageField label="OpenGraph Share Image" value={seo.ogImage} onChange={(v) => setField("ogImage", v)} />
    </Card>
  );
}

function EditorDefaultsTab({ content, set }) {
  const defaults = content.editorDefaults || {};
  const templateSlugs = [
    "whatsapp",
    "instagram-dm",
    "twitter",
    "notification",
    "instagram-post",
    "facebook-post",
    "youtube",
    "messenger",
    "telegram",
    "snapchat",
    "low-battery",
    "search-results",
    "error-popup",
    "fake-call",
  ];

  const updateDefault = (slug, json) => {
    try {
      const parsed = JSON.parse(json);
      set(["editorDefaults", slug], parsed);
    } catch {
      // ignore invalid json during typing
    }
  };

  return (
    <Card title="Editor Defaults" hint="Default state for each template (JSON).">
      <p className="mb-4 text-xs text-[var(--muted)]">
        Edit the initial messages, usernames, etc. for each template. Must be valid JSON.
      </p>
      {templateSlugs.map((slug) => {
        const current = defaults[slug] || {};
        const jsonString = JSON.stringify(current, null, 2);
        return (
          <div key={slug} className="mb-4 border-b border-[var(--border)] pb-4 last:border-0">
            <h4 className="text-sm font-bold capitalize mb-1">{slug.replace("-", " ")}</h4>
            <TextArea
              label=""
              value={jsonString}
              onChange={(v) => updateDefault(slug, v)}
              rows={6}
              placeholder="{}"
            />
          </div>
        );
      })}
    </Card>
  );
}
