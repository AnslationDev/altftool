"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, Plus } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { siteSettingsService } from "../shared/siteSettingsService";
import { DEFAULT_SETTINGS } from "../shared/defaults";
import { Field, TextArea, Grid, ListEditor, IconSelect } from "../shared/fields";
import ImagePreview from "../shared/ImagePreview";
import { getModuleDocRef } from "../shared/collectionService";
import { getDoc, setDoc } from "firebase/firestore";

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
const clone = (v) => JSON.parse(JSON.stringify(v));

function FieldWithImage({ label, value, onChange }) {
  return (
    <div className="mb-4">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-[var(--muted)]">{label}</span>
      <input className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20"
        value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      {value && typeof value === "string" && (value.startsWith("http") || value.startsWith("/")) && (
        <div className="mt-2"><ImagePreview src={value} /></div>
      )}
    </div>
  );
}

function ChecklistEditor({ items, onChange, label = "Items" }) {
  return (
    <ListEditor itemLabel="Item" items={items || []} onChange={onChange} makeEmpty={() => ""}
      renderItem={(row, on) => (
        <Field label="Value" value={row} onChange={on} />
      )} />
  );
}

function TagsEditor({ items, onChange }) {
  return (
    <ListEditor itemLabel="Tag" items={items || []} onChange={onChange} makeEmpty={() => ""}
      renderItem={(row, on) => (
        <Field label="Tag" value={row} onChange={on} />
      )} />
  );
}

function Section({ title, desc, children, nested }) {
  const cls = nested
    ? "mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
    : "mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6";
  return (
    <section className={cls}>
      <header className="mb-4">
        <h4 className="text-sm font-bold text-[var(--foreground)]">{title}</h4>
        {desc ? <p className="mt-0.5 text-xs text-[var(--muted)]">{desc}</p> : null}
      </header>
      {children}
    </section>
  );
}

// ── Platform Item Editor ──────────────────────────────────────────────
function PlatformItemEditor({ items, onChange }) {
  const list = items || [];
  const update = (i, v) => { const n = list.slice(); n[i] = v; onChange(n); };
  const remove = (i) => onChange(list.filter((_, j) => j !== i));
  const add = () => onChange([...list, {
    slug: "", title: "", subtitle: "", heroImage: "", heroImageAlt: "", overview: "",
    features: [
      { icon: "BarChart3", title: "", description: "", tags: ["", "", ""], image: "" },
      { icon: "Users", title: "", description: "", tags: ["", "", ""], image: "" },
      { icon: "Target", title: "", description: "", tags: ["", "", ""], image: "" },
    ],
    layers: [
      { icon: "Zap", title: "", color: "bg-blue-500", width: "w-full" },
      { icon: "Database", title: "", color: "bg-primary", width: "w-[92%]" },
      { icon: "Layers", title: "", color: "bg-purple-500", width: "w-[84%]" },
      { icon: "Globe", title: "", color: "bg-indigo-500", width: "w-[76%]" },
      { icon: "Shield", title: "", color: "bg-gray-600", width: "w-[68%]" },
    ],
    coreEngines: [
      { icon: "BarChart3", title: "", description: "", tags: ["", "", ""] },
      { icon: "Users", title: "", description: "", tags: ["", "", ""] },
      { icon: "Target", title: "", description: "", tags: ["", "", ""] },
    ],
    faqs: [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
    ],
  }]);

  return (
    <div className="flex flex-col gap-4">
      {list.map((item, i) => (
        <Section key={i} title={`Platform ${i + 1}: ${item.title || "(untitled)"}`} nested>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--muted)]">{item.slug || "no slug"}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
          </div>

          <Grid>
            <Field label="Slug" value={item.slug} onChange={(v) => update(i, { ...item, slug: v })} />
            <Field label="Title" value={item.title} onChange={(v) => update(i, { ...item, title: v })} />
          </Grid>
          <Field label="Subtitle" value={item.subtitle} onChange={(v) => update(i, { ...item, subtitle: v })} />
          <Grid>
            <FieldWithImage label="Hero Image URL" value={item.heroImage} onChange={(v) => update(i, { ...item, heroImage: v })} />
            <Field label="Hero Image Alt" value={item.heroImageAlt} onChange={(v) => update(i, { ...item, heroImageAlt: v })} />
          </Grid>
          <TextArea label="Overview" value={item.overview} onChange={(v) => update(i, { ...item, overview: v })} />

          {/* Features */}
          <Section title="Features" desc="3 feature cards." nested>
            <ListEditor itemLabel="Feature" items={item.features || []} onChange={(v) => update(i, { ...item, features: v })} makeEmpty={() => ({ icon: "BarChart3", title: "", description: "", tags: [""], image: "" })}
              renderItem={(row, on) => (
                <>
                  <Grid>
                    <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
                    <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
                  </Grid>
                  <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
                  <FieldWithImage label="Image URL" value={row.image} onChange={(v) => on({ ...row, image: v })} />
                  <TagsEditor items={row.tags} onChange={(v) => on({ ...row, tags: v })} />
                </>
              )} />
          </Section>

          {/* Layers */}
          <Section title="Resilient Layers" desc="5 infrastructure layers." nested>
            <ListEditor itemLabel="Layer" items={item.layers || []} onChange={(v) => update(i, { ...item, layers: v })} makeEmpty={() => ({ icon: "Zap", title: "", color: "bg-blue-500", width: "w-full" })}
              renderItem={(row, on) => (
                <Grid>
                  <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
                  <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
                  <Field label="Color class" value={row.color} onChange={(v) => on({ ...row, color: v })} />
                  <Field label="Width class" value={row.width} onChange={(v) => on({ ...row, width: v })} />
                </Grid>
              )} />
          </Section>

          {/* Core Engines */}
          <Section title="Core Engines" desc="3 engine cards." nested>
            <ListEditor itemLabel="Engine" items={item.coreEngines || []} onChange={(v) => update(i, { ...item, coreEngines: v })} makeEmpty={() => ({ icon: "BarChart3", title: "", description: "", tags: [""] })}
              renderItem={(row, on) => (
                <>
                  <Grid>
                    <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
                    <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
                  </Grid>
                  <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
                  <TagsEditor items={row.tags} onChange={(v) => on({ ...row, tags: v })} />
                </>
              )} />
          </Section>

          {/* FAQs */}
          <Section title="FAQs" desc="4 frequently asked questions." nested>
            <ListEditor itemLabel="FAQ" items={item.faqs || []} onChange={(v) => update(i, { ...item, faqs: v })} makeEmpty={() => ({ question: "", answer: "" })}
              renderItem={(row, on) => (
                <>
                  <Field label="Question" value={row.question} onChange={(v) => on({ ...row, question: v })} />
                  <TextArea label="Answer" value={row.answer} onChange={(v) => on({ ...row, answer: v })} />
                </>
              )} />
          </Section>
        </Section>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--primary)]/40 bg-[color:var(--primary)]/5 px-3.5 py-2 text-sm font-semibold text-[var(--primary)] transition hover:bg-[color:var(--primary)]/10">
        <Plus size={15} /> Add platform
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function PlatformsPage() {
  const [settings, setSettings] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await siteSettingsService.subscribeOnce();
        const snap = await getDoc(getModuleDocRef("platforms"));
        if (active) {
          setSettings(deepMerge(DEFAULT_SETTINGS, stored || {}));
          setItems(snap.exists() ? (snap.data().items || []) : []);
        }
      } catch {
        if (active) { setSettings(clone(DEFAULT_SETTINGS)); setItems([]); }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const set = (path, value) => {
    setDirty(true);
    setSettings((prev) => {
      const next = clone(prev);
      let node = next;
      for (let i = 0; i < path.length - 1; i += 1) node = node[path[i]];
      node[path[path.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await siteSettingsService.save(settings);
      await setDoc(getModuleDocRef("platforms"), { items, updatedAt: new Date() }, { merge: true });
      setDirty(false);
      emitAlert({ type: "success", title: "Saved", message: "Platforms page updated." });
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message });
    } finally { setSaving(false); }
  };
  const handleReset = () => {
    if (confirm("Reset platforms page content to defaults?")) { setSettings(clone(DEFAULT_SETTINGS)); setDirty(true); }
  };

  if (loading || !settings) {
    return <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]"><Loader2 size={18} className="animate-spin" /> Loading platforms…</div>;
  }

  const pp = settings.platformsPage || {};

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">Platforms</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Edit all Platforms page content. Changes appear live on the site.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"><RotateCcw size={14} /> Reset</button>
            <button type="button" onClick={handleSave} disabled={saving || !dirty} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Platforms Page Settings ── */}
      <Section title="Platforms Page Settings" desc="Hero section of the platforms listing page.">
        <Field label="Badge" value={pp.badge} onChange={(v) => set(["platformsPage", "badge"], v)} />
        <Field label="Heading" value={pp.heading} onChange={(v) => set(["platformsPage", "heading"], v)} />
        <TextArea label="Subheading" value={pp.subheading} onChange={(v) => set(["platformsPage", "subheading"], v)} />
        <TagsEditor items={pp.cardTags} label="Card Tags" onChange={(v) => set(["platformsPage", "cardTags"], v)} />
        <ListEditor itemLabel="Icon" items={pp.icons || []} onChange={(v) => set(["platformsPage", "icons"], v)} makeEmpty={() => "Target"}
          renderItem={(row, on) => (
            <IconSelect label="Icon" value={row} onChange={on} />
          )} />
      </Section>

      {/* ── Listing CTA ── */}
      <Section title="Listing CTA" desc="Call-to-action strip at the bottom of the platforms listing page.">
        <Field label="Title" value={pp.cta?.title} onChange={(v) => set(["platformsPage", "cta", "title"], v)} />
        <TextArea label="Subtitle" value={pp.cta?.subtitle} onChange={(v) => set(["platformsPage", "cta", "subtitle"], v)} />
      </Section>

      {/* ── Detail CTA ── */}
      <Section title="Detail CTA" desc='Call-to-action strip at the bottom of each platform detail page. Use {"{title}"} as placeholder for the platform name.'>
        <Field label="Title" value={pp.detailCta?.title} onChange={(v) => set(["platformsPage", "detailCta", "title"], v)} />
        <TextArea label="Description" value={pp.detailCta?.description} onChange={(v) => set(["platformsPage", "detailCta", "description"], v)} />
        <Grid>
          <Field label="Primary CTA" value={pp.detailCta?.primaryCta} onChange={(v) => set(["platformsPage", "detailCta", "primaryCta"], v)} />
          <Field label="Primary Href" value={pp.detailCta?.primaryHref} onChange={(v) => set(["platformsPage", "detailCta", "primaryHref"], v)} />
        </Grid>
        <Grid>
          <Field label="Secondary CTA" value={pp.detailCta?.secondaryCta} onChange={(v) => set(["platformsPage", "detailCta", "secondaryCta"], v)} />
          <Field label="Secondary Href" value={pp.detailCta?.secondaryHref} onChange={(v) => set(["platformsPage", "detailCta", "secondaryHref"], v)} />
        </Grid>
      </Section>

      {/* ── Platform Items ── */}
      <Section title="Platform Items" desc="Managed individual platform detail pages (e.g. /platforms/marketing-dashboard). Each item includes features, layers, core engines, and FAQs.">
        <PlatformItemEditor items={items} onChange={(v) => { setItems(v); setDirty(true); }} />
      </Section>
    </div>
  );
}
