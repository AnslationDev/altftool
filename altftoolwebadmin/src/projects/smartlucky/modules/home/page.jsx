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

export default function HomePage() {
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
  const sectionSetter = (section) => (key, value) => set([section, key], value);

  const handleSave = async () => {
    setSaving(true);
    try {
      await siteSettingsService.save(settings);
      setDirty(false);
      emitAlert({ type: "success", title: "Saved", message: "Home page updated." });
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message || "Could not save." });
    } finally {
      setSaving(false);
    }
  };
  const handleReset = () => {
    if (confirm("Reset all homepage content to defaults?")) {
      setSettings(clone(DEFAULT_SETTINGS));
      setDirty(true);
    }
  };

  if (loading || !settings) {
    return <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]"><Loader2 size={18} className="animate-spin" /> Loading home page…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">Home Page</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Edit all homepage content in one place.</p>
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
      <Section title="Hero" desc="Main headline area at the top of the site.">
        <Field label="Heading" value={settings.hero.heading} onChange={(v) => sectionSetter("hero")("heading", v)} />
        <TextArea label="Subheading" value={settings.hero.subheading} onChange={(v) => sectionSetter("hero")("subheading", v)} />
        <Grid>
          <Field label="Primary CTA" value={settings.hero.primaryCta} onChange={(v) => sectionSetter("hero")("primaryCta", v)} />
          <Field label="Secondary CTA" value={settings.hero.secondaryCta} onChange={(v) => sectionSetter("hero")("secondaryCta", v)} />
        </Grid>
      </Section>

      {/* ── Stats ── */}
      <Section title="Stats" desc="Headline numbers in the stats band.">
        <ListEditor items={settings.stats || []} onChange={(v) => set(["stats"], v)} makeEmpty={() => ({ value: "", suffix: "", label: "", sublabel: "" })} itemLabel="Stat"
          renderItem={(row, on) => (
            <Grid>
              <Field label="Value" value={row.value} onChange={(v) => on({ ...row, value: v })} />
              <Field label="Prefix" value={row.prefix} onChange={(v) => on({ ...row, prefix: v })} />
              <Field label="Suffix" value={row.suffix} onChange={(v) => on({ ...row, suffix: v })} />
              <Field label="Label" value={row.label} onChange={(v) => on({ ...row, label: v })} />
              <Field label="Sublabel" value={row.sublabel} onChange={(v) => on({ ...row, sublabel: v })} />
            </Grid>
          )} />
      </Section>

      {/* ── Client Logos ── */}
      <Section title="Client Logos" desc="Brand marks in the trust strip.">
        <ListEditor items={settings.clientLogos || []} onChange={(v) => set(["clientLogos"], v)} makeEmpty={() => ({ name: "", src: "", width: 110 })} itemLabel="Logo"
          renderItem={(row, on) => (
            <Grid>
              <Field label="Name" value={row.name} onChange={(v) => on({ ...row, name: v })} />
              <FieldWithImage label="Image URL" value={row.src} onChange={(v) => on({ ...row, src: v })} />
              <Field label="Width (px)" value={row.width} onChange={(v) => on({ ...row, width: v })} />
            </Grid>
          )} />
      </Section>

      {/* ── Testimonials ── */}
      <Section title="Testimonials" desc="Customer quotes on the home page.">
        <ListEditor items={settings.testimonials || []} onChange={(v) => set(["testimonials"], v)} makeEmpty={() => ({ name: "", role: "", company: "", quote: "", avatar: "", metric: "", metricLabel: "", location: "", rating: 5 })} itemLabel="Testimonial"
          renderItem={(row, on) => (
            <>
              <Grid>
                <Field label="Name" value={row.name} onChange={(v) => on({ ...row, name: v })} />
                <Field label="Role" value={row.role} onChange={(v) => on({ ...row, role: v })} />
                <Field label="Company" value={row.company} onChange={(v) => on({ ...row, company: v })} />
                <Field label="Rating" value={row.rating} onChange={(v) => on({ ...row, rating: Number(v) || 0 })} />
              </Grid>
              <TextArea label="Quote" value={row.quote} onChange={(v) => on({ ...row, quote: v })} />
              <Grid>
                <FieldWithImage label="Avatar URL" value={row.avatar} onChange={(v) => on({ ...row, avatar: v })} />
                <Field label="Metric" value={row.metric} onChange={(v) => on({ ...row, metric: v })} />
                <Field label="Metric Label" value={row.metricLabel} onChange={(v) => on({ ...row, metricLabel: v })} />
                <Field label="Location" value={row.location} onChange={(v) => on({ ...row, location: v })} />
              </Grid>
            </>
          )} />
      </Section>

      {/* ── Services Grid ── */}
      <Section title="Services Grid" desc="Cards in the homepage Services section.">
        <ListEditor items={settings.servicesGrid || []} onChange={(v) => set(["servicesGrid"], v)} makeEmpty={() => ({ icon: "Sparkles", title: "", description: "", badge: "", badgeColor: "bg-primary/85", image: "" })} itemLabel="Service"
          renderItem={(row, on) => (
            <>
              <Grid>
                <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
                <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
              </Grid>
              <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
              <Grid>
                <Field label="Badge" value={row.badge} onChange={(v) => on({ ...row, badge: v })} />
                <Field label="Badge color class" value={row.badgeColor} onChange={(v) => on({ ...row, badgeColor: v })} />
              </Grid>
              <FieldWithImage label="Image URL" value={row.image} onChange={(v) => on({ ...row, image: v })} />
            </>
          )} />
      </Section>

      {/* ── Industries ── */}
      <Section title="Industries" desc="Industry cards on the homepage.">
        <ListEditor items={settings.industries || []} onChange={(v) => set(["industries"], v)} makeEmpty={() => ({ name: "", tagline: "", description: "", stat: "", statLabel: "", tags: [], image: "" })} itemLabel="Industry"
          renderItem={(row, on) => (
            <>
              <Grid>
                <Field label="Name" value={row.name} onChange={(v) => on({ ...row, name: v })} />
                <Field label="Tagline" value={row.tagline} onChange={(v) => on({ ...row, tagline: v })} />
                <Field label="Stat" value={row.stat} onChange={(v) => on({ ...row, stat: v })} />
                <Field label="Stat Label" value={row.statLabel} onChange={(v) => on({ ...row, statLabel: v })} />
              </Grid>
              <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
              <Field label="Tags (comma separated)" value={(row.tags || []).join(", ")} onChange={(v) => on({ ...row, tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <FieldWithImage label="Image URL" value={row.image} onChange={(v) => on({ ...row, image: v })} />
            </>
          )} />
      </Section>

      {/* ── Portfolio ── */}
      <Section title="Portfolio" desc="Case-study cards in the Results section.">
        <ListEditor items={settings.portfolio || []} onChange={(v) => set(["portfolio"], v)} makeEmpty={() => ({ industry: "", metric: "", metricLabel: "", timeframe: "", person: "", role: "", image: "", badge: "", badgeVariant: "emerald", description: "" })} itemLabel="Case Study"
          renderItem={(row, on) => (
            <>
              <Grid>
                <Field label="Industry" value={row.industry} onChange={(v) => on({ ...row, industry: v })} />
                <Field label="Person" value={row.person} onChange={(v) => on({ ...row, person: v })} />
                <Field label="Role" value={row.role} onChange={(v) => on({ ...row, role: v })} />
                <Field label="Badge" value={row.badge} onChange={(v) => on({ ...row, badge: v })} />
              </Grid>
              <Grid>
                <Field label="Metric" value={row.metric} onChange={(v) => on({ ...row, metric: v })} />
                <Field label="Metric Label" value={row.metricLabel} onChange={(v) => on({ ...row, metricLabel: v })} />
                <Field label="Timeframe" value={row.timeframe} onChange={(v) => on({ ...row, timeframe: v })} />
                <Field label="Badge Variant" value={row.badgeVariant} onChange={(v) => on({ ...row, badgeVariant: v })} />
              </Grid>
              <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
              <FieldWithImage label="Image URL" value={row.image} onChange={(v) => on({ ...row, image: v })} />
            </>
          )} />
      </Section>

      {/* ── FAQ ── */}
      <Section title="FAQ" desc="Frequently asked questions on the home page.">
        <ListEditor items={settings.faqs || []} onChange={(v) => set(["faqs"], v)} makeEmpty={() => ({ question: "", answer: "", category: "General" })} itemLabel="FAQ"
          renderItem={(row, on) => (
            <>
              <Field label="Question" value={row.question} onChange={(v) => on({ ...row, question: v })} />
              <TextArea label="Answer" value={row.answer} onChange={(v) => on({ ...row, answer: v })} />
              <Field label="Category" value={row.category} onChange={(v) => on({ ...row, category: v })} />
            </>
          )} />
      </Section>

      {/* ── Team ── */}
      <Section title="Team" desc="People highlighted in the team section.">
        <ListEditor items={settings.team || []} onChange={(v) => set(["team"], v)} makeEmpty={() => ({ name: "", role: "", avatar: "", bio: "" })} itemLabel="Member"
          renderItem={(row, on) => (
            <>
              <Grid>
                <Field label="Name" value={row.name} onChange={(v) => on({ ...row, name: v })} />
                <Field label="Role" value={row.role} onChange={(v) => on({ ...row, role: v })} />
              </Grid>
              <FieldWithImage label="Avatar URL" value={row.avatar} onChange={(v) => on({ ...row, avatar: v })} />
              <TextArea label="Bio" value={row.bio} onChange={(v) => on({ ...row, bio: v })} />
            </>
          )} />
      </Section>

      {/* ── Footer ── */}
      <Section title="Footer" desc="Site-wide footer copy and link columns.">
        <TextArea label="About" value={settings.footer.about} onChange={(v) => sectionSetter("footer")("about", v)} />
        <Field label="Copyright line" value={settings.footer.copyright} onChange={(v) => sectionSetter("footer")("copyright", v)} />
      </Section>
      <Section title="Footer Columns" desc="Link columns at the bottom of the page.">
        <ListEditor title="Columns" itemLabel="Column" items={settings.footer.columns || []} onChange={(v) => set(["footer", "columns"], v)} makeEmpty={() => ({ title: "", links: [] })}
          renderItem={(col, onCol) => (
            <>
              <Field label="Column title" value={col.title} onChange={(v) => onCol({ ...col, title: v })} />
              <ListEditor title="Links" itemLabel="Link" items={col.links} onChange={(v) => onCol({ ...col, links: v })} makeEmpty={() => ({ label: "", href: "/" })}
                renderItem={(link, onLink) => (
                  <Grid>
                    <Field label="Label" value={link.label} onChange={(v) => onLink({ ...link, label: v })} />
                    <Field label="Link (href)" value={link.href} onChange={(v) => onLink({ ...link, href: v })} />
                  </Grid>
                )} />
            </>
          )} />
      </Section>
      <Section title="Social Links">
        <ListEditor itemLabel="Social" items={settings.footer.social || []} onChange={(v) => set(["footer", "social"], v)} makeEmpty={() => ({ label: "", href: "#" })}
          renderItem={(s, on) => (
            <Grid>
              <Field label="Label" value={s.label} onChange={(v) => on({ ...s, label: v })} />
              <Field label="URL" value={s.href} onChange={(v) => on({ ...s, href: v })} />
            </Grid>
          )} />
      </Section>

      {/* ── Navigation ── */}
      <Section title="Navigation — Services Mega-menu" desc="Grouped links under the Platform mega-menu.">
        <ListEditor title="Groups" itemLabel="Group" items={settings.nav.services || []} onChange={(v) => set(["nav", "services"], v)} makeEmpty={() => ({ category: "", items: [] })}
          renderItem={(group, onGroup) => (
            <>
              <Field label="Category" value={group.category} onChange={(v) => onGroup({ ...group, category: v })} />
              <ListEditor title="Links" itemLabel="Link" items={group.items} onChange={(v) => onGroup({ ...group, items: v })} makeEmpty={() => ({ name: "", href: "/" })}
                renderItem={(link, onLink) => (
                  <Grid>
                    <Field label="Name" value={link.name} onChange={(v) => onLink({ ...link, name: v })} />
                    <Field label="Href" value={link.href} onChange={(v) => onLink({ ...link, href: v })} />
                  </Grid>
                )} />
            </>
          )} />
      </Section>
      <Section title="Navigation — Solutions Dropdown" desc="Links under the Solutions dropdown.">
        <ListEditor itemLabel="Solution" items={settings.nav.solutions || []} onChange={(v) => set(["nav", "solutions"], v)} makeEmpty={() => ({ name: "", href: "/" })}
          renderItem={(s, on) => (
            <Grid>
              <Field label="Name" value={s.name} onChange={(v) => on({ ...s, name: v })} />
              <Field label="Href" value={s.href} onChange={(v) => on({ ...s, href: v })} />
            </Grid>
          )} />
      </Section>

      {/* ── Newsletter ── */}
      <Section title="Newsletter" desc="Newsletter signup band above the footer.">
        <Field label="Title" value={settings.newsletter.title} onChange={(v) => set(["newsletter", "title"], v)} />
        <TextArea label="Subtitle" value={settings.newsletter.subtitle} onChange={(v) => set(["newsletter", "subtitle"], v)} />
        <Grid>
          <Field label="Button text" value={settings.newsletter.buttonText} onChange={(v) => set(["newsletter", "buttonText"], v)} />
          <Field label="Social proof" value={settings.newsletter.socialProof} onChange={(v) => set(["newsletter", "socialProof"], v)} />
        </Grid>
      </Section>

      {/* ── Why Choose Us ── */}
      <Section title="Why Choose Us — Features" desc="Feature cards in the dark 'Why Leaders Choose' section.">
        <ListEditor items={settings.whyChooseUs?.features || []} onChange={(v) => set(["whyChooseUs", "features"], v)} makeEmpty={() => ({ icon: "Sparkles", title: "", description: "", badge: "", stat: "", statLabel: "", image: "", badgeColor: "bg-primary/85" })} itemLabel="Feature"
          renderItem={(row, on) => (
            <>
              <Grid>
                <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
                <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
              </Grid>
              <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
              <Grid>
                <Field label="Badge" value={row.badge} onChange={(v) => on({ ...row, badge: v })} />
                <Field label="Badge color class" value={row.badgeColor} onChange={(v) => on({ ...row, badgeColor: v })} />
              </Grid>
              <Grid>
                <Field label="Stat" value={row.stat} onChange={(v) => on({ ...row, stat: v })} />
                <Field label="Stat Label" value={row.statLabel} onChange={(v) => on({ ...row, statLabel: v })} />
              </Grid>
              <FieldWithImage label="Image URL" value={row.image} onChange={(v) => on({ ...row, image: v })} />
            </>
          )} />
      </Section>
      <Section title="Why Choose Us — Comparison Table" desc="Rows in the comparison table.">
        <ListEditor items={settings.whyChooseUs?.comparisonData || []} onChange={(v) => set(["whyChooseUs", "comparisonData"], v)} makeEmpty={() => ({ feature: "", traditional: "", advantage: "" })} itemLabel="Comparison Row"
          renderItem={(row, on) => (
            <>
              <Field label="Feature" value={row.feature} onChange={(v) => on({ ...row, feature: v })} />
              <Field label="Traditional" value={row.traditional} onChange={(v) => on({ ...row, traditional: v })} />
              <Field label="Advantage" value={row.advantage} onChange={(v) => on({ ...row, advantage: v })} />
            </>
          )} />
      </Section>

      {/* ── Process ── */}
      <Section title="Process Steps" desc="Timeline steps in the 'Our Process' carousel.">
        <ListEditor items={settings.process?.steps || []} onChange={(v) => set(["process", "steps"], v)} makeEmpty={() => ({ number: "", title: "", description: "", icon: "Sparkles", accentColor: "bg-primary", softBg: "bg-primary/5", iconBg: "bg-primary/10", iconText: "text-primary", borderColor: "border-primary/10" })} itemLabel="Step"
          renderItem={(row, on) => (
            <>
              <Grid>
                <Field label="Number" value={row.number} onChange={(v) => on({ ...row, number: v })} />
                <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
                <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
              </Grid>
              <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
              <Grid>
                <Field label="Accent color class" value={row.accentColor} onChange={(v) => on({ ...row, accentColor: v })} />
                <Field label="Soft bg class" value={row.softBg} onChange={(v) => on({ ...row, softBg: v })} />
                <Field label="Icon bg class" value={row.iconBg} onChange={(v) => on({ ...row, iconBg: v })} />
                <Field label="Icon text class" value={row.iconText} onChange={(v) => on({ ...row, iconText: v })} />
                <Field label="Border class" value={row.borderColor} onChange={(v) => on({ ...row, borderColor: v })} />
              </Grid>
            </>
          )} />
      </Section>

      {/* ── CTA ── */}
      <Section title="CTA Band" desc="Call-to-action band (used on the home page and sub-pages).">
        <Field label="Title" value={settings.cta.title} onChange={(v) => set(["cta", "title"], v)} />
        <TextArea label="Subtitle" value={settings.cta.subtitle} onChange={(v) => set(["cta", "subtitle"], v)} />
        <Grid>
          <Field label="Primary CTA" value={settings.cta.primaryCta} onChange={(v) => set(["cta", "primaryCta"], v)} />
          <Field label="Secondary CTA" value={settings.cta.secondaryCta} onChange={(v) => set(["cta", "secondaryCta"], v)} />
        </Grid>
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
