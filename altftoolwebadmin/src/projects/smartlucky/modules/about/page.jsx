"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
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

export default function AboutPage() {
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
      emitAlert({ type: "success", title: "Saved", message: "About page updated." });
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message || "Could not save." });
    } finally { setSaving(false); }
  };
  const handleReset = () => {
    if (confirm("Reset about page content to defaults?")) {
      setSettings(clone(DEFAULT_SETTINGS));
      setDirty(true);
    }
  };

  if (loading || !settings) {
    return <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]"><Loader2 size={18} className="animate-spin" /> Loading about page…</div>;
  }

  const about = settings.aboutPage || {};

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">About Page</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Edit all About page content. Changes appear live on the site.</p>
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
      <Section title="Hero" desc="The hero section at the top of the About page.">
        <Field label="Mission badge" value={about.mission} onChange={(v) => set(["aboutPage", "mission"], v)} />
        <TextArea label="Heading" value={about.heading} onChange={(v) => set(["aboutPage", "heading"], v)} />
        <TextArea label="Description" value={about.description} onChange={(v) => set(["aboutPage", "description"], v)} />
        <Grid>
          <Field label="Primary CTA" value={about.primaryCta} onChange={(v) => set(["aboutPage", "primaryCta"], v)} />
          <Field label="Secondary CTA" value={about.secondaryCta} onChange={(v) => set(["aboutPage", "secondaryCta"], v)} />
        </Grid>
      </Section>

      {/* ── Hero Images ── */}
      <Section title="Hero Images" desc="Four images in the hero collage (left tall, left short, right short, right tall).">
        <ListEditor itemLabel="Image" items={about.heroImages || []} onChange={(v) => set(["aboutPage", "heroImages"], v)} makeEmpty={() => ""}
          renderItem={(src, on) => (
            <FieldWithImage label="Image URL" value={src} onChange={(v) => on(v)} />
          )} />
      </Section>

      {/* ── Hero Stats ── */}
      <Section title="Hero Stats" desc="Four stat counters under the hero copy.">
        <ListEditor itemLabel="Stat" items={about.stats || []} onChange={(v) => set(["aboutPage", "stats"], v)} makeEmpty={() => ({ value: "", label: "" })}
          renderItem={(row, on) => (
            <Grid>
              <Field label="Value" value={row.value} onChange={(v) => on({ ...row, value: v })} />
              <Field label="Label" value={row.label} onChange={(v) => on({ ...row, label: v })} />
            </Grid>
          )} />
      </Section>

      {/* ── Story Timeline ── */}
      <Section title="Story Timeline" desc="Milestone entries in the 'Our Story' section.">
        <ListEditor itemLabel="Milestone" items={about.timeline || []} onChange={(v) => set(["aboutPage", "timeline"], v)} makeEmpty={() => ({ year: "", title: "", description: "", image: "", alt: "" })}
          renderItem={(row, on) => (
            <>
              <Grid>
                <Field label="Year" value={row.year} onChange={(v) => on({ ...row, year: v })} />
                <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
              </Grid>
              <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
              <FieldWithImage label="Image URL" value={row.image} onChange={(v) => on({ ...row, image: v })} />
              <Field label="Alt text" value={row.alt} onChange={(v) => on({ ...row, alt: v })} />
            </>
          )} />
      </Section>

      {/* ── Values ── */}
      <Section title="Values" desc="Cards in the 'Our Values' section.">
        <ListEditor itemLabel="Value" items={about.values || []} onChange={(v) => set(["aboutPage", "values"], v)} makeEmpty={() => ({ icon: "Shield", title: "", description: "", image: "", alt: "", tags: [] })}
          renderItem={(row, on) => (
            <>
              <Grid>
                <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
                <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
              </Grid>
              <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
              <FieldWithImage label="Image URL" value={row.image} onChange={(v) => on({ ...row, image: v })} />
              <Field label="Alt text" value={row.alt} onChange={(v) => on({ ...row, alt: v })} />
              <Field label="Tags (comma separated)" value={(row.tags || []).join(", ")} onChange={(v) => on({ ...row, tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </>
          )} />
      </Section>

      {/* ── Vision ── */}
      <Section title="Vision" desc="The 'Growth Platform Vision' bento section.">
        <Field label="Heading" value={about.vision?.heading} onChange={(v) => set(["aboutPage", "vision", "heading"], v)} />
        <TextArea label="Subheading" value={about.vision?.subheading} onChange={(v) => set(["aboutPage", "vision", "subheading"], v)} />
        <TextArea label="Sustainable Scaling — tag" value={about.vision?.sustainableScaling?.tag} onChange={(v) => set(["aboutPage", "vision", "sustainableScaling", "tag"], v)} />
        <TextArea label="Sustainable Scaling — title" value={about.vision?.sustainableScaling?.title} onChange={(v) => set(["aboutPage", "vision", "sustainableScaling", "title"], v)} />
        <TextArea label="Sustainable Scaling — description" value={about.vision?.sustainableScaling?.description} onChange={(v) => set(["aboutPage", "vision", "sustainableScaling", "description"], v)} />
        <FieldWithImage label="Sustainable Scaling — image" value={about.vision?.sustainableScaling?.image} onChange={(v) => set(["aboutPage", "vision", "sustainableScaling", "image"], v)} />
        <Field label="Autonomous Growth — title" value={about.vision?.autonomousGrowth?.title} onChange={(v) => set(["aboutPage", "vision", "autonomousGrowth", "title"], v)} />
        <TextArea label="Autonomous Growth — description" value={about.vision?.autonomousGrowth?.description} onChange={(v) => set(["aboutPage", "vision", "autonomousGrowth", "description"], v)} />
        <Field label="AI-First — title" value={about.vision?.aiFirst?.title} onChange={(v) => set(["aboutPage", "vision", "aiFirst", "title"], v)} />
        <Field label="AI-First — subtitle" value={about.vision?.aiFirst?.subtitle} onChange={(v) => set(["aboutPage", "vision", "aiFirst", "subtitle"], v)} />
        <FieldWithImage label="AI-First — image" value={about.vision?.aiFirst?.image} onChange={(v) => set(["aboutPage", "vision", "aiFirst", "image"], v)} />
      </Section>

      {/* ── Team ── */}
      <Section title="Team" desc="Team member profiles on the About page.">
        <ListEditor items={settings.team || []} onChange={(v) => set(["team"], v)} makeEmpty={() => ({ name: "", role: "", avatar: "", bio: "" })} itemLabel="Member"
          renderItem={(row, on) => (
            <>
              <Grid>
                <Field label="Name" value={row.name} onChange={(v) => on({ ...row, name: v })} />
                <Field label="Role" value={row.role} onChange={(v) => on({ ...row, role: v })} />
              </Grid>
              <FieldWithImage label="Photo URL" value={row.avatar} onChange={(v) => on({ ...row, avatar: v })} />
              <TextArea label="Bio" value={row.bio} onChange={(v) => on({ ...row, bio: v })} />
            </>
          )} />
      </Section>

      {/* ── Global Network ── */}
      <Section title="Global Network" desc="Headquarters, stats overlay, and office chips.">
        <Grid>
          <Field label="City (heading highlight)" value={about.global?.city} onChange={(v) => set(["aboutPage", "global", "city"], v)} />
          <Field label="Heading" value={about.global?.heading} onChange={(v) => set(["aboutPage", "global", "heading"], v)} />
        </Grid>
        <Field label="Hubs text" value={about.global?.hubsText} onChange={(v) => set(["aboutPage", "global", "hubsText"], v)} />
        <TextArea label="Description" value={about.global?.description} onChange={(v) => set(["aboutPage", "global", "description"], v)} />
        <FieldWithImage label="Background image" value={about.global?.image} onChange={(v) => set(["aboutPage", "global", "image"], v)} />
        <ListEditor itemLabel="Stat" items={about.global?.stats || []} onChange={(v) => set(["aboutPage", "global", "stats"], v)} makeEmpty={() => ({ value: "", label: "" })}
          renderItem={(row, on) => (
            <Grid>
              <Field label="Value" value={row.value} onChange={(v) => on({ ...row, value: v })} />
              <Field label="Label" value={row.label} onChange={(v) => on({ ...row, label: v })} />
            </Grid>
          )} />
        <ListEditor itemLabel="City" items={about.global?.cities || []} onChange={(v) => set(["aboutPage", "global", "cities"], v)} makeEmpty={() => ""}
          renderItem={(city, on) => (
            <Field label="City chip" value={city} onChange={(v) => on(v)} />
          )} />
      </Section>

      {/* ── Careers ── */}
      <Section title="Careers" desc="The 'Build the Future of Growth' section.">
        <Field label="Heading" value={about.careers?.heading} onChange={(v) => set(["aboutPage", "careers", "heading"], v)} />
        <Field label="Subheading" value={about.careers?.subheading} onChange={(v) => set(["aboutPage", "careers", "subheading"], v)} />
        <TextArea label="Description" value={about.careers?.description} onChange={(v) => set(["aboutPage", "careers", "description"], v)} />
        <ListEditor itemLabel="Perk" items={about.careers?.perks || []} onChange={(v) => set(["aboutPage", "careers", "perks"], v)} makeEmpty={() => ""}
          renderItem={(perk, on) => (
            <Field label="Perk" value={perk} onChange={(v) => on(v)} />
          )} />
        <ListEditor itemLabel="Image" items={about.careers?.images || []} onChange={(v) => set(["aboutPage", "careers", "images"], v)} makeEmpty={() => ""}
          renderItem={(src, on) => (
            <FieldWithImage label="Image URL" value={src} onChange={(v) => on(v)} />
          )} />
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
