"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, PanelBottom, Plus, Save, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_FOOTER_SETTINGS,
  saveFooterSettings,
  subscribeFooterSettings,
} from "./service/footer.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

export default function InfovastaFooterPage() {
  const [form, setForm] = useState(DEFAULT_FOOTER_SETTINGS);
  const [saved, setSaved] = useState(DEFAULT_FOOTER_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsub = subscribeFooterSettings(
      (data) => {
        setForm(data);
        setSaved(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load footer settings." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }
  function setAbout(key, value) {
    setForm((prev) => ({ ...prev, about: { ...prev.about, [key]: value } }));
  }
  function setQuickLinksHeading(value) {
    setForm((prev) => ({ ...prev, quickLinks: { ...prev.quickLinks, heading: value } }));
  }
  function setQuickLinks(rows) {
    setForm((prev) => ({ ...prev, quickLinks: { ...prev.quickLinks, links: rows } }));
  }
  function setNewsletter(key, value) {
    setForm((prev) => ({ ...prev, newsletter: { ...prev.newsletter, [key]: value } }));
  }

  async function save() {
    const nextErrors = {};
    if (!form.copyright?.trim()) nextErrors.copyright = "Copyright text is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveFooterSettings(form);
      emitAlert({ type: "success", message: "Footer settings saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save footer settings." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <PanelBottom className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Infovasta Footer</h1>
              <p className="text-sm text-gray-500">Manage the about blurb, socials, quick links, newsletter, and copyright.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
              {dirty ? "Unsaved" : "Saved"}
            </span>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section className="space-y-5">
              <SectionCard eyebrow="Footer" title="About">
                <Field label="Heading"><input value={form.about?.heading || ""} onChange={(event) => setAbout("heading", event.target.value)} className={inputClass} /></Field>
                <Field label="Text"><textarea value={form.about?.text || ""} onChange={(event) => setAbout("text", event.target.value)} rows={3} className={textareaClass} /></Field>
              </SectionCard>

              <SectionCard eyebrow="Footer" title="Social links">
                <ObjectRowsField
                  rows={form.socials || []}
                  onChange={(rows) => setField("socials", rows)}
                  columns={[
                    { key: "icon", label: "Icon", placeholder: "logo-twitter" },
                    { key: "href", label: "Href", placeholder: "https://twitter.com/..." },
                  ]}
                  addLabel="Add social"
                />
              </SectionCard>

              <SectionCard eyebrow="Footer" title="Quick links">
                <Field label="Heading"><input value={form.quickLinks?.heading || ""} onChange={(event) => setQuickLinksHeading(event.target.value)} className={inputClass} /></Field>
                <ObjectRowsField
                  rows={form.quickLinks?.links || []}
                  onChange={setQuickLinks}
                  columns={[
                    { key: "label", label: "Label", placeholder: "About Us" },
                    { key: "href", label: "Href", placeholder: "/about-us" },
                  ]}
                  addLabel="Add link"
                />
              </SectionCard>

              <SectionCard eyebrow="Footer" title="Services & Newsletter">
                <Field label="Services Heading"><input value={form.servicesHeading || ""} onChange={(event) => setField("servicesHeading", event.target.value)} className={inputClass} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Newsletter Heading"><input value={form.newsletter?.heading || ""} onChange={(event) => setNewsletter("heading", event.target.value)} className={inputClass} /></Field>
                  <Field label="Newsletter Placeholder"><input value={form.newsletter?.placeholder || ""} onChange={(event) => setNewsletter("placeholder", event.target.value)} className={inputClass} /></Field>
                </div>
                <Field label="Newsletter Text"><textarea value={form.newsletter?.text || ""} onChange={(event) => setNewsletter("text", event.target.value)} rows={2} className={textareaClass} /></Field>
                <Field label="Newsletter Success Text"><input value={form.newsletter?.successText || ""} onChange={(event) => setNewsletter("successText", event.target.value)} className={inputClass} /></Field>
              </SectionCard>

              <SectionCard eyebrow="Footer" title="Bottom bar">
                <Field label="Copyright" error={errors.copyright}><input value={form.copyright || ""} onChange={(event) => setField("copyright", event.target.value)} className={inputClass} /></Field>
                <ObjectRowsField
                  rows={form.bottomLinks || []}
                  onChange={(rows) => setField("bottomLinks", rows)}
                  columns={[
                    { key: "label", label: "Label", placeholder: "Privacy policy" },
                    { key: "href", label: "Href", placeholder: "#" },
                  ]}
                  addLabel="Add bottom link"
                />
              </SectionCard>
            </section>

            <section className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <h2 className="text-base font-bold text-gray-900">Live preview</h2>
                </div>
                <FooterPreview form={form} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------- Infovasta front-end live preview ------------------- */

function FooterPreview({ form }) {
  return (
    <div className="overflow-hidden rounded-xl border border-indigo-200 bg-indigo-50 p-6">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{form.about?.heading || "About"}</h3>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-gray-600">{form.about?.text}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(form.socials || []).map((social, index) => (
              <span key={index} className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-700">{social.icon || "social"}</span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-600">{form.quickLinks?.heading || "Quick Links"}</h3>
          <ul className="mt-3 space-y-2">
            {(form.quickLinks?.links || []).length ? (
              form.quickLinks.links.map((link, index) => <li key={index} className="truncate text-xs text-gray-700">{link.label}</li>)
            ) : (
              <li className="text-xs text-gray-400">No links</li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-600">{form.newsletter?.heading || "Newsletter"}</h3>
          <p className="mt-3 text-xs leading-relaxed text-gray-600">{form.newsletter?.text}</p>
          <div className="mt-3 flex items-stretch gap-2">
            <div className="flex flex-1 items-center rounded-full border border-indigo-200 bg-white px-3 py-2 text-left text-xs text-gray-400">
              {form.newsletter?.placeholder || "Your email"}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-indigo-200 pt-4">
        <p className="text-[10px] text-gray-500">{form.copyright}</p>
        <div className="flex flex-wrap gap-3">
          {(form.bottomLinks || []).map((link, index) => (
            <span key={index} className="text-[10px] text-gray-500">{link.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ eyebrow, title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
      <h2 className="mt-1 text-base font-bold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}

function ObjectRowsField({ rows, onChange, columns, addLabel }) {
  function setRow(index, key, value) {
    const next = [...rows];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }
  function addRow() {
    const blank = {};
    columns.forEach((col) => { blank[col.key] = ""; });
    onChange([...rows, blank]);
  }
  function removeRow(index) {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2">
          {columns.map((col) => (
            <input
              key={col.key}
              value={row[col.key] || ""}
              onChange={(event) => setRow(index, col.key, event.target.value)}
              className={inputClass}
              placeholder={col.placeholder}
            />
          ))}
          <button type="button" onClick={() => removeRow(index)} className="shrink-0 rounded-xl border border-red-200 px-3 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={addRow} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50">
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
