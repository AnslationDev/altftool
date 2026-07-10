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

function StatCardsEditor({ items, onChange }) {
  return (
    <ListEditor itemLabel="Stat" items={items || []} onChange={onChange} makeEmpty={() => ({ value: "", label: "" })}
      renderItem={(row, on) => (
        <Grid>
          <Field label="Value" value={row.value} onChange={(v) => on({ ...row, value: v })} />
          <Field label="Label" value={row.label} onChange={(v) => on({ ...row, label: v })} />
        </Grid>
      )} />
  );
}

function ChecklistEditor({ items, onChange, label = "Checklist Items" }) {
  return (
    <ListEditor itemLabel="Item" items={items || []} onChange={onChange} makeEmpty={() => ""}
      renderItem={(row, on) => (
        <Field label="Item" value={row} onChange={on} />
      )} />
  );
}

function ServiceItemEditor({ items, onChange }) {
  const list = items || [];
  const update = (i, v) => { const n = list.slice(); n[i] = v; onChange(n); };
  const remove = (i) => onChange(list.filter((_, j) => j !== i));
  const add = () => onChange([...list, { slug: "", title: "", subtitle: "", category: "", heroImage: "", overview: "" }]);
  return (
    <div>
      {list.map((item, i) => (
        <div key={i} className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-[var(--muted)]">Service {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
          </div>
          <Field label="Title" value={item.title} onChange={(v) => update(i, { ...item, title: v })} />
          <Field label="Slug" value={item.slug} onChange={(v) => update(i, { ...item, slug: v })} />
          <TextArea label="Overview" value={item.overview} onChange={(v) => update(i, { ...item, overview: v })} />
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--primary)]/40 bg-[color:var(--primary)]/5 px-3.5 py-2 text-sm font-semibold text-[var(--primary)] transition hover:bg-[color:var(--primary)]/10">
        <Plus size={15} /> Add service
      </button>
    </div>
  );
}

export default function ServicesPage() {
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
        const docSnap = await getDoc(getModuleDocRef("services"));
        const serviceItems = docSnap.exists() ? (docSnap.data().items || []) : [];
        if (active) {
          setSettings(deepMerge(DEFAULT_SETTINGS, stored || {}));
          setItems(serviceItems);
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
      await setDoc(getModuleDocRef("services"), { items, updatedAt: new Date() }, { merge: true });
      setDirty(false);
      emitAlert({ type: "success", title: "Saved", message: "Services page updated." });
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message });
    } finally { setSaving(false); }
  };
  const handleReset = () => {
    if (confirm("Reset services page content to defaults?")) { setSettings(clone(DEFAULT_SETTINGS)); setDirty(true); }
  };

  if (loading || !settings) {
    return <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]"><Loader2 size={18} className="animate-spin" /> Loading services page…</div>;
  }

  const sp = settings.servicesPage || {};

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">Services Page</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Edit all Services page content. Changes appear live on the site.</p>
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

      {/* ── Hero ── */}
      <Section title="Hero" desc="Services landing page hero section.">
        <TextArea label="Heading" value={sp.heading} onChange={(v) => set(["servicesPage", "heading"], v)} />
        <TextArea label="Subheading" value={sp.subheading} onChange={(v) => set(["servicesPage", "subheading"], v)} />
      </Section>

      {/* ── SEO Section ── */}
      <Section title="SEO Section" desc="Precision Search Engine Optimization — first content block.">
        <FieldWithImage label="Image" value={sp.seoSection?.image} onChange={(v) => set(["servicesPage", "seoSection", "image"], v)} />
        <Field label="Heading" value={sp.seoSection?.heading} onChange={(v) => set(["servicesPage", "seoSection", "heading"], v)} />
        <TextArea label="Description" value={sp.seoSection?.description} onChange={(v) => set(["servicesPage", "seoSection", "description"], v)} />
        <Section title="Metric Badge" desc="Overlay badge on the SEO image." nested>
          <Grid>
            <IconSelect label="Icon" value={sp.seoSection?.metricBadge?.icon} onChange={(v) => set(["servicesPage", "seoSection", "metricBadge", "icon"], v)} />
            <Field label="Value" value={sp.seoSection?.metricBadge?.value} onChange={(v) => set(["servicesPage", "seoSection", "metricBadge", "value"], v)} />
          </Grid>
          <Grid>
            <Field label="Label" value={sp.seoSection?.metricBadge?.label} onChange={(v) => set(["servicesPage", "seoSection", "metricBadge", "label"], v)} />
            <Field label="Metric Label" value={sp.seoSection?.metricBadge?.metricLabel} onChange={(v) => set(["servicesPage", "seoSection", "metricBadge", "metricLabel"], v)} />
          </Grid>
        </Section>
        <StatCardsEditor items={sp.seoSection?.statCards} onChange={(v) => set(["servicesPage", "seoSection", "statCards"], v)} />
        <ChecklistEditor items={sp.seoSection?.checklist} onChange={(v) => set(["servicesPage", "seoSection", "checklist"], v)} />
      </Section>

      {/* ── Paid Performance ── */}
      <Section title="Paid Performance" desc="Paid Performance & Acquisition section.">
        <Field label="Heading" value={sp.paidPerformance?.heading} onChange={(v) => set(["servicesPage", "paidPerformance", "heading"], v)} />
        <TextArea label="Description" value={sp.paidPerformance?.description} onChange={(v) => set(["servicesPage", "paidPerformance", "description"], v)} />
        <FieldWithImage label="Image" value={sp.paidPerformance?.image} onChange={(v) => set(["servicesPage", "paidPerformance", "image"], v)} />
        <Grid>
          <Field label="ROAS Target" value={sp.paidPerformance?.roasTarget} onChange={(v) => set(["servicesPage", "paidPerformance", "roasTarget"], v)} />
          <Field label="ROAS Current" value={sp.paidPerformance?.roasCurrent} onChange={(v) => set(["servicesPage", "paidPerformance", "roasCurrent"], v)} />
        </Grid>
        <ChecklistEditor items={sp.paidPerformance?.checklist} onChange={(v) => set(["servicesPage", "paidPerformance", "checklist"], v)} />
        <Section title="Overlay Card" desc="Dark overlay card on the right image." nested>
          <Field label="Title" value={sp.paidPerformance?.overlayTitle} onChange={(v) => set(["servicesPage", "paidPerformance", "overlayTitle"], v)} />
          <StatCardsEditor items={sp.paidPerformance?.overlayStats} onChange={(v) => set(["servicesPage", "paidPerformance", "overlayStats"], v)} />
        </Section>
      </Section>

      {/* ── Affiliate Section ── */}
      <Section title="Affiliate & Partner Ecosystems" desc="Affiliate section with 3 feature cards and expert spotlight.">
        <Field label="Heading" value={sp.affiliateSection?.heading} onChange={(v) => set(["servicesPage", "affiliateSection", "heading"], v)} />
        <TextArea label="Description" value={sp.affiliateSection?.description} onChange={(v) => set(["servicesPage", "affiliateSection", "description"], v)} />
        <ListEditor itemLabel="Card" items={sp.affiliateSection?.cards || []} onChange={(v) => set(["servicesPage", "affiliateSection", "cards"], v)} makeEmpty={() => ({ icon: "Users", title: "", desc: "", stat: "", popular: false })}
          renderItem={(row, on) => (
            <>
              <Grid>
                <IconSelect label="Icon" value={row.icon} onChange={(v) => on({ ...row, icon: v })} />
                <Field label="Title" value={row.title} onChange={(v) => on({ ...row, title: v })} />
              </Grid>
              <TextArea label="Description" value={row.desc} onChange={(v) => on({ ...row, desc: v })} />
              <Grid>
                <Field label="Stat" value={row.stat} onChange={(v) => on({ ...row, stat: v })} />
                <Field label="Popular (true/false)" value={String(row.popular)} onChange={(v) => on({ ...row, popular: v === "true" })} />
              </Grid>
            </>
          )} />
        <Section title="Expert Spotlight" desc="Spotlight card at the bottom of the affiliate section." nested>
          <FieldWithImage label="Image" value={sp.affiliateSection?.expertSpotlight?.image} onChange={(v) => set(["servicesPage", "affiliateSection", "expertSpotlight", "image"], v)} />
          <TextArea label="Quote" value={sp.affiliateSection?.expertSpotlight?.quote} onChange={(v) => set(["servicesPage", "affiliateSection", "expertSpotlight", "quote"], v)} />
          <Grid>
            <Field label="Name" value={sp.affiliateSection?.expertSpotlight?.name} onChange={(v) => set(["servicesPage", "affiliateSection", "expertSpotlight", "name"], v)} />
            <Field label="Title" value={sp.affiliateSection?.expertSpotlight?.title} onChange={(v) => set(["servicesPage", "affiliateSection", "expertSpotlight", "title"], v)} />
          </Grid>
        </Section>
      </Section>

      {/* ── AI Automation ── */}
      <Section title="AI-Driven Growth Automation" desc="AI-driven growth automation section with overlay and CTA.">
        <FieldWithImage label="Image" value={sp.aiAutomation?.image} onChange={(v) => set(["servicesPage", "aiAutomation", "image"], v)} />
        <Field label="Heading" value={sp.aiAutomation?.heading} onChange={(v) => set(["servicesPage", "aiAutomation", "heading"], v)} />
        <TextArea label="Description" value={sp.aiAutomation?.description} onChange={(v) => set(["servicesPage", "aiAutomation", "description"], v)} />
        <ChecklistEditor items={sp.aiAutomation?.overlayItems} label="Overlay Items" onChange={(v) => set(["servicesPage", "aiAutomation", "overlayItems"], v)} />
        <ChecklistEditor items={sp.aiAutomation?.checklist} onChange={(v) => set(["servicesPage", "aiAutomation", "checklist"], v)} />
        <Grid>
          <Field label="CTA Text" value={sp.aiAutomation?.ctaText} onChange={(v) => set(["servicesPage", "aiAutomation", "ctaText"], v)} />
          <Field label="CTA Href" value={sp.aiAutomation?.ctaHref} onChange={(v) => set(["servicesPage", "aiAutomation", "ctaHref"], v)} />
        </Grid>
      </Section>

      {/* ── Solution Finder ── */}
      <Section title="Solution Finder" desc="Industry selector with tailored solutions.">
        <Field label="Heading" value={sp.solutionFinder?.heading} onChange={(v) => set(["servicesPage", "solutionFinder", "heading"], v)} />
        <Field label="Description" value={sp.solutionFinder?.description} onChange={(v) => set(["servicesPage", "solutionFinder", "description"], v)} />
        <ListEditor itemLabel="Industry" items={sp.solutionFinder?.industries || []} onChange={(v) => set(["servicesPage", "solutionFinder", "industries"], v)} makeEmpty={() => ({ name: "", description: "", features: [""], image: "" })}
          renderItem={(row, on) => (
            <>
              <Field label="Name" value={row.name} onChange={(v) => on({ ...row, name: v })} />
              <TextArea label="Description" value={row.description} onChange={(v) => on({ ...row, description: v })} />
              <FieldWithImage label="Image URL" value={row.image} onChange={(v) => on({ ...row, image: v })} />
              <ChecklistEditor items={row.features} label="Features" onChange={(v) => on({ ...row, features: v })} />
            </>
          )} />
      </Section>

      {/* ── Service Items ── */}
      <Section title="Service Items" desc="Manage individual service pages (e.g. /services/seo-optimization).">
        <ServiceItemEditor items={items} onChange={setItems} />
      </Section>
    </div>
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
