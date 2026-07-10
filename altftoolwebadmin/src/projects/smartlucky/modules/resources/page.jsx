"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, Plus } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { siteSettingsService } from "../shared/siteSettingsService";
import { DEFAULT_SETTINGS } from "../shared/defaults";
import { Field, TextArea, Grid, ListEditor, IconSelect } from "../shared/fields";
import ImagePreview from "../shared/ImagePreview";

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

export default function ResourcesPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await siteSettingsService.subscribeOnce();
        if (active) setSettings(deepMerge(DEFAULT_SETTINGS, stored || {}));
      } catch {
        if (active) setSettings(clone(DEFAULT_SETTINGS));
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
      setDirty(false);
      emitAlert({ type: "success", title: "Saved", message: "Resources page updated." });
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message || "Could not save." });
    } finally { setSaving(false); }
  };
  const handleReset = () => {
    if (confirm("Reset resources page content to defaults?")) { setSettings(clone(DEFAULT_SETTINGS)); setDirty(true); }
  };

  if (loading || !settings) {
    return <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]"><Loader2 size={18} className="animate-spin" /> Loading resources page…</div>;
  }

  const rp = settings.resourcesPage || {};

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">Resources Page</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Edit all Resources page content. Changes appear live on the site.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]">
              <RotateCcw size={14} /> Reset
            </button>
            <button type="button" onClick={handleSave} disabled={saving || !dirty} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <Section title="Hero" desc="The hero section at the top of the Resources page.">
        <TextArea label="Heading" value={rp.heading} onChange={(v) => set(["resourcesPage", "heading"], v)} />
        <TextArea label="Subheading" value={rp.subheading} onChange={(v) => set(["resourcesPage", "subheading"], v)} />
      </Section>

      {/* ── Hero Service Pills ── */}
      <Section title="Hero Service Pills" desc="Six topic pills under the hero copy.">
        <ListEditor itemLabel="Pill" items={rp.heroPills || []} onChange={(v) => set(["resourcesPage", "heroPills"], v)} makeEmpty={() => ({ label: "", icon: "Globe" })}
          renderItem={(row, on) => (
            <Grid>
              <Field label="Label" value={row.label} onChange={(v) => on({ ...row, label: v })} />
              <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
            </Grid>
          )} />
      </Section>

      {/* ── Search Placeholder ── */}
      <Section title="Search Placeholder" desc="Placeholder text in the hero search input.">
        <Field label="Search placeholder" value={rp.searchPlaceholder} onChange={(v) => set(["resourcesPage", "searchPlaceholder"], v)} />
      </Section>

      {/* ── Featured Cards ── */}
      <Section title="Featured — Main Card" desc="Large featured card (left side).">
        <FieldWithImage label="Background image" value={rp.featured?.main?.image} onChange={(v) => set(["resourcesPage", "featured", "main", "image"], v)} />
        <Field label="Badge" value={rp.featured?.main?.badge} onChange={(v) => set(["resourcesPage", "featured", "main", "badge"], v)} />
        <Field label="Badge text" value={rp.featured?.main?.badgeText} onChange={(v) => set(["resourcesPage", "featured", "main", "badgeText"], v)} />
        <Field label="Topic" value={rp.featured?.main?.topic} onChange={(v) => set(["resourcesPage", "featured", "main", "topic"], v)} />
        <Field label="Title" value={rp.featured?.main?.title} onChange={(v) => set(["resourcesPage", "featured", "main", "title"], v)} />
        <TextArea label="Description" value={rp.featured?.main?.description} onChange={(v) => set(["resourcesPage", "featured", "main", "description"], v)} />
        <Grid>
          <Field label="Primary button" value={rp.featured?.main?.primaryLabel} onChange={(v) => set(["resourcesPage", "featured", "main", "primaryLabel"], v)} />
          <Field label="Secondary button" value={rp.featured?.main?.secondaryLabel} onChange={(v) => set(["resourcesPage", "featured", "main", "secondaryLabel"], v)} />
        </Grid>
      </Section>

      <Section title="Featured — Sub Card 1 (top right)" desc="Upper right featured sub-card.">
        <FieldWithImage label="Background image" value={rp.featured?.sub1?.image} onChange={(v) => set(["resourcesPage", "featured", "sub1", "image"], v)} />
        <Field label="Topic" value={rp.featured?.sub1?.topic} onChange={(v) => set(["resourcesPage", "featured", "sub1", "topic"], v)} />
        <Field label="Title" value={rp.featured?.sub1?.title} onChange={(v) => set(["resourcesPage", "featured", "sub1", "title"], v)} />
        <TextArea label="Description" value={rp.featured?.sub1?.description} onChange={(v) => set(["resourcesPage", "featured", "sub1", "description"], v)} />
        <Field label="Button label" value={rp.featured?.sub1?.buttonLabel} onChange={(v) => set(["resourcesPage", "featured", "sub1", "buttonLabel"], v)} />
      </Section>

      <Section title="Featured — Sub Card 2 (bottom right)" desc="Lower right featured sub-card.">
        <FieldWithImage label="Background image" value={rp.featured?.sub2?.image} onChange={(v) => set(["resourcesPage", "featured", "sub2", "image"], v)} />
        <Field label="Topic" value={rp.featured?.sub2?.topic} onChange={(v) => set(["resourcesPage", "featured", "sub2", "topic"], v)} />
        <Field label="Title" value={rp.featured?.sub2?.title} onChange={(v) => set(["resourcesPage", "featured", "sub2", "title"], v)} />
        <Field label="Button label" value={rp.featured?.sub2?.buttonLabel} onChange={(v) => set(["resourcesPage", "featured", "sub2", "buttonLabel"], v)} />
      </Section>

      {/* ── Categories ── */}
      <Section title="Resource Categories" desc="Filter tabs above the resource library grid.">
        <ListEditor itemLabel="Category" items={rp.categories || []} onChange={(v) => set(["resourcesPage", "categories"], v)} makeEmpty={() => ({ id: "", label: "" })}
          renderItem={(row, on) => (
            <Grid>
              <Field label="ID (slug)" value={row.id} onChange={(v) => on({ ...row, id: v })} />
              <Field label="Label" value={row.label} onChange={(v) => on({ ...row, label: v })} />
            </Grid>
          )} />
      </Section>

      {/* ── Resource Library Cards ── */}
      <Section title="Resource Library Cards" desc="The main resource cards in the grid.">
        <ListEditor itemLabel="Resource" items={rp.resources || []} onChange={(v) => set(["resourcesPage", "resources"], v)} makeEmpty={() => ({ id: "", cat: "ebooks", type: "Guide", typeColor: "text-blue-700", typeBg: "bg-blue-100", icon: "BookOpen", title: "", description: "", topic: "Digital Marketing", topicColor: "text-blue-600", image: "", imageAlt: "", readTime: "20 min read", tags: [], isFree: true })}
          renderItem={(row, on) => (
            <>
              <Grid>
                <Field label="ID" value={row.id} onChange={(v) => on({ ...row, id: v })} />
                <Field label="Category (cat)" value={row.cat} onChange={(v) => on({ ...row, cat: v })} />
              </Grid>
              <Grid>
                <Field label="Type" value={row.type} onChange={(v) => on({ ...row, type: v })} />
                <Field label="Type color class" value={row.typeColor} onChange={(v) => on({ ...row, typeColor: v })} />
              </Grid>
              <Grid>
                <Field label="Type bg class" value={row.typeBg} onChange={(v) => on({ ...row, typeBg: v })} />
                <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
              </Grid>
              <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
              <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
              <Grid>
                <Field label="Topic" value={row.topic} onChange={(v) => on({ ...row, topic: v })} />
                <Field label="Topic color class" value={row.topicColor} onChange={(v) => on({ ...row, topicColor: v })} />
              </Grid>
              <FieldWithImage label="Image URL" value={row.image} onChange={(v) => on({ ...row, image: v })} />
              <Field label="Image alt" value={row.imageAlt} onChange={(v) => on({ ...row, imageAlt: v })} />
              <Grid>
                <Field label="Read time" value={row.readTime} onChange={(v) => on({ ...row, readTime: v })} />
                <Field label="isFree" value={String(row.isFree)} onChange={(v) => on({ ...row, isFree: v === "true" })} />
              </Grid>
              <Field label="Tags (comma separated)" value={(row.tags || []).join(", ")} onChange={(v) => on({ ...row, tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </>
          )} />
      </Section>

      {/* ── Most Popular Articles ── */}
      <Section title="Most Popular Articles" desc="4 articles in the sidebar 'Most Popular' list.">
        <ListEditor itemLabel="Article" items={rp.popular || []} onChange={(v) => set(["resourcesPage", "popular"], v)} makeEmpty={() => ({ category: "", categoryColor: "text-gray-600", title: "" })}
          renderItem={(row, on) => (
            <Grid>
              <Field label="Category" value={row.category} onChange={(v) => on({ ...row, category: v })} />
              <Field label="Category color class" value={row.categoryColor} onChange={(v) => on({ ...row, categoryColor: v })} />
              <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
            </Grid>
          )} />
      </Section>

      {/* ── Proven Growth Patterns ── */}
      <Section title="Proven Growth Patterns" desc="3 case study cards in the sidebar.">
        <ListEditor itemLabel="Pattern" items={rp.patterns || []} onChange={(v) => set(["resourcesPage", "patterns"], v)} makeEmpty={() => ({ metric: "", metricLabel: "", tag: "", tagColor: "text-gray-600", tagBg: "bg-gray-50", title: "", desc: "", img: "", alt: "" })}
          renderItem={(row, on) => (
            <>
              <Grid>
                <Field label="Metric" value={row.metric} onChange={(v) => on({ ...row, metric: v })} />
                <Field label="Metric label" value={row.metricLabel} onChange={(v) => on({ ...row, metricLabel: v })} />
              </Grid>
              <Grid>
                <Field label="Tag" value={row.tag} onChange={(v) => on({ ...row, tag: v })} />
                <Field label="Tag color class" value={row.tagColor} onChange={(v) => on({ ...row, tagColor: v })} />
              </Grid>
              <Grid>
                <Field label="Tag bg class" value={row.tagBg} onChange={(v) => on({ ...row, tagBg: v })} />
                <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
              </Grid>
              <TextArea label="Description" value={row.desc} onChange={(v) => on({ ...row, desc: v })} />
              <FieldWithImage label="Image URL" value={row.img} onChange={(v) => on({ ...row, img: v })} />
              <Field label="Alt text" value={row.alt} onChange={(v) => on({ ...row, alt: v })} />
            </>
          )} />
      </Section>

      {/* ── Patterns Banner ── */}
      <Section title="Patterns Banner" desc="The 'Browse all' banner at the bottom of growth patterns.">
        <Field label="Title" value={rp.patternsBanner?.title} onChange={(v) => set(["resourcesPage", "patternsBanner", "title"], v)} />
        <Field label="Subtitle" value={rp.patternsBanner?.subtitle} onChange={(v) => set(["resourcesPage", "patternsBanner", "subtitle"], v)} />
      </Section>

      {/* ── Services Highlight Strip ── */}
      <Section title="Services Highlight Strip" desc="6 service links at the bottom of the page.">
        <ListEditor itemLabel="Service" items={rp.services || []} onChange={(v) => set(["resourcesPage", "services"], v)} makeEmpty={() => ({ icon: "Globe", label: "", href: "" })}
          renderItem={(row, on) => (
            <Grid>
              <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
              <Field label="Label" value={row.label} onChange={(v) => on({ ...row, label: v })} />
              <Field label="Href" value={row.href} onChange={(v) => on({ ...row, href: v })} />
            </Grid>
          )} />
      </Section>

      {/* ── Newsletter CTA Strip ── */}
      <Section title="Newsletter CTA Strip" desc="Dark newsletter signup strip at the very bottom.">
        <Field label="Heading" value={rp.newsletter?.heading} onChange={(v) => set(["resourcesPage", "newsletter", "heading"], v)} />
        <TextArea label="Description" value={rp.newsletter?.description} onChange={(v) => set(["resourcesPage", "newsletter", "description"], v)} />
      </Section>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <section className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <header className="mb-4">
        <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
        {desc ? <p className="mt-0.5 text-xs text-[var(--muted)]">{desc}</p> : null}
      </header>
      {children}
    </section>
  );
}