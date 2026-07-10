"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { siteSettingsService } from "../shared/siteSettingsService";
import { DEFAULT_SETTINGS } from "../shared/defaults";
import { Field, TextArea, Grid, ListEditor } from "../shared/fields";

const clone = (v) => JSON.parse(JSON.stringify(v));

export default function ContactPage() {
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
      emitAlert({ type: "success", title: "Saved", message: "Contact page updated." });
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message || "Could not save." });
    } finally { setSaving(false); }
  };
  const handleReset = () => {
    if (confirm("Reset contact page content to defaults?")) { setSettings(clone(DEFAULT_SETTINGS)); setDirty(true); }
  };

  if (loading || !settings) {
    return <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]"><Loader2 size={18} className="animate-spin" /> Loading contact page…</div>;
  }

  const cp = settings.contactPage || {};

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">Contact Page</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Edit all contact page content. Changes appear live on the site.</p>
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
      <Section title="Hero" desc="The top section of the Contact page.">
        <Field label="Heading" value={cp.heading} onChange={(v) => set(["contactPage", "heading"], v)} />
        <TextArea label="Subheading / Description" value={cp.subheading} onChange={(v) => set(["contactPage", "subheading"], v)} />
      </Section>

      {/* ── Contact Info ── */}
      <Section title="Contact Information" desc="Office address, email, phone, and working hours (support <br /> for line breaks).">
        <TextArea label="Address" value={cp.address} onChange={(v) => set(["contactPage", "address"], v)} />
        <TextArea label="Email(s)" value={cp.email} onChange={(v) => set(["contactPage", "email"], v)} />
        <TextArea label="Phone" value={cp.phone} onChange={(v) => set(["contactPage", "phone"], v)} />
        <TextArea label="Working Hours" value={cp.hours} onChange={(v) => set(["contactPage", "hours"], v)} />
      </Section>

      {/* ── Success Message ── */}
      <Section title="Form Success Message" desc="Shown after the user submits the contact form.">
        <Field label="Success Heading" value={cp.successHeading} onChange={(v) => set(["contactPage", "successHeading"], v)} />
        <TextArea label="Success Description" value={cp.successDescription} onChange={(v) => set(["contactPage", "successDescription"], v)} />
      </Section>

      {/* ── Form Dropdown Options ── */}
      <Section title="Service Dropdown Options" desc="Options in the 'Service Interested In' select field.">
        <ListEditor itemLabel="Service" items={cp.services || []} onChange={(v) => set(["contactPage", "services"], v)} makeEmpty={() => ""}
          renderItem={(val, on) => (
            <Field label="Service name" value={val} onChange={(v) => on(v)} />
          )} />
      </Section>
    </div>
  );
}

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