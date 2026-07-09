"use client";

import { Eye, Plus, Trash2 } from "lucide-react";
import { ABOUT_SECTION_TABS, ROOT_ARRAY_SECTIONS } from "../service/about.service";

export const SECTION_FIELDS = {
  heroSection: [["eyebrowText", "Eyebrow text"], ["headingText", "Heading text", "textarea"], ["descriptionOne", "Description one", "textarea"], ["descriptionTwo", "Description two", "textarea"], ["backgroundImageUrl", "Background image URL"], ["backgroundImageAltText", "Background image alt text"], ["buttonLabel", "Button label"], ["buttonUrl", "Button URL"]],
  whyChooseSection: [["eyebrowText", "Eyebrow text"], ["headingText", "Heading text"], ["badgeText", "Badge text"]],
  beliefsSection: [["eyebrowText", "Eyebrow text"], ["headingText", "Heading text", "textarea"], ["descriptionText", "Description", "textarea"]],
  workModelSection: [["eyebrowText", "Eyebrow text"], ["visualAltText", "Visual alt text", "textarea"], ["centerIconKey", "Center icon key"]],
  teamSection: [["eyebrowText", "Eyebrow text"], ["headingText", "Heading text", "textarea"], ["descriptionText", "Description", "textarea"], ["modalCompanyLabelSuffix", "Modal company label suffix"], ["focusLabel", "Focus label"], ["companyLabel", "Company label"]],
};

export const ARRAY_FIELDS = {
  whyChooseSection: { features: { label: "Features", fields: [["iconKey", "Icon key"], ["title", "Title"], ["descriptionText", "Description", "textarea"], ["details", "Details", "list"]] } },
  beliefsSection: { values: { label: "Values", fields: [["title", "Title"], ["descriptionText", "Description", "textarea"]] } },
  workModelSection: {
    visualNodes: { label: "Visual Nodes", fields: [["iconKey", "Icon key"], ["label", "Label"]] },
    items: { label: "Work Items", fields: [["iconKey", "Icon key"], ["title", "Title"], ["descriptionText", "Description", "textarea"]] },
  },
  teamSection: { members: { label: "Team Members", fields: [["name", "Name"], ["role", "Role"], ["focusText", "Focus text", "textarea"], ["imageUrl", "Image URL"], ["imageAltText", "Image alt text"], ["companyName", "Company name"], ["linkedinUrl", "LinkedIn URL"], ["bioText", "Bio", "textarea"]] } },
  proofMetrics: { proofMetrics: { label: "Proof Metrics", fields: [["value", "Value"], ["label", "Label"]] } },
};

export function SectionEditor({ sectionKey, section, errors, onFieldChange, onArrayAdd, onArrayRemove, onArrayUpdate }) {
  return (
    <div className="space-y-6">
      {!ROOT_ARRAY_SECTIONS.has(sectionKey) ? (
        <div className="grid gap-4 md:grid-cols-2">
          {(SECTION_FIELDS[sectionKey] || []).map(([field, label, type]) => (
            <Field key={field} label={label} error={errors[`${sectionKey}.${field}`]} wide={type === "textarea"}>
              <ValueInput value={section[field] || ""} type={type} onChange={(value) => onFieldChange(field, value)} />
            </Field>
          ))}
        </div>
      ) : null}

      {Object.entries(ARRAY_FIELDS[sectionKey] || {}).map(([arrayKey, config]) => (
        <ArrayEditor
          key={arrayKey}
          arrayKey={arrayKey}
          config={config}
          rows={ROOT_ARRAY_SECTIONS.has(sectionKey) ? section || [] : section[arrayKey] || []}
          errors={errors}
          sectionKey={sectionKey}
          onAdd={() => onArrayAdd(arrayKey)}
          onRemove={(index) => onArrayRemove(arrayKey, index)}
          onUpdate={(index, field, value) => onArrayUpdate(arrayKey, index, field, value)}
        />
      ))}
    </div>
  );
}

function ArrayEditor({ arrayKey, config, rows, errors, sectionKey, onAdd, onRemove, onUpdate }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-soft)_45%,var(--surface))] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">{config.label}</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Add, edit, delete, reorder, and hide repeated items.</p>
        </div>
        <button type="button" onClick={onAdd} className={buttonClass("secondary")}><Plus className="h-4 w-4" /> Add Item</button>
      </div>
      <div className="mt-4 space-y-4">
        {rows.length ? rows.map((row, index) => (
          <div key={index} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Item {index + 1}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => onUpdate(index, "isActive", row.isActive === false)} className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs font-bold text-[var(--muted)]">{row.isActive === false ? "Hidden" : "Active"}</button>
                <button type="button" onClick={() => onRemove(index)} className="rounded-md border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] p-1.5 text-[var(--danger)]"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {config.fields.map(([field, label, type]) => (
                <Field key={field} label={label} error={errors[`${sectionKey}.${arrayKey}.${index}.${field}`]} wide={type === "textarea" || type === "list"}>
                  <ValueInput value={row[field] || ""} type={type} onChange={(value) => onUpdate(index, field, value)} />
                </Field>
              ))}
              <Field label="Sort order" error={errors[`${sectionKey}.${arrayKey}.${index}.sortOrder`]}>
                <input type="number" min="0" value={row.sortOrder ?? index + 1} onChange={(event) => onUpdate(index, "sortOrder", event.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>
        )) : <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">No items yet.</div>}
      </div>
    </section>
  );
}

function ValueInput({ value, type, onChange }) {
  if (type === "textarea" || type === "list") {
    return <textarea rows={type === "list" ? 3 : 4} value={Array.isArray(value) ? value.join("\n") : value} onChange={(event) => onChange(type === "list" ? event.target.value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) : event.target.value)} className={textareaClass} />;
  }
  return <input value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />;
}

export function Field({ label, error, children, wide = false }) {
  return <label className={`block ${wide ? "md:col-span-2" : ""}`}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</span>{children}{error ? <span className="mt-1 block text-xs font-semibold text-[var(--danger)]">{error}</span> : null}</label>;
}

export function PreviewPanel({ label, section, errorCount, content }) {
  const activeSections = ABOUT_SECTION_TABS.filter((tab) => ROOT_ARRAY_SECTIONS.has(tab.key) ? (content[tab.key] || []).some((row) => row.isActive !== false) : content[tab.key]?.isActive !== false).length;
  const repeatedCount = Array.isArray(section) ? section.length : Object.values(section || {}).reduce((count, value) => Array.isArray(value) ? count + value.length : count, 0);
  return <aside><section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"><div className="flex items-center gap-2"><Eye className="h-4 w-4 text-[var(--primary)]" /><p className="text-sm font-bold text-[var(--foreground)]">Backend Summary</p></div><div className="mt-4 grid gap-3"><SummaryRow label="Current section" value={label} /><SummaryRow label="Repeated items" value={repeatedCount} /><SummaryRow label="Active sections" value={`${activeSections} / ${ABOUT_SECTION_TABS.length}`} /><SummaryRow label="Validation issues" value={errorCount} tone={errorCount ? "danger" : "success"} /></div></section></aside>;
}

function SummaryRow({ label, value, tone = "default" }) {
  const toneClass = tone === "danger" ? "text-[var(--danger)]" : tone === "success" ? "text-[var(--success)]" : "text-[var(--foreground)]";
  return <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] px-3 py-2"><span className="text-xs font-semibold text-[var(--muted)]">{label}</span><span className={`text-sm font-bold ${toneClass}`}>{value}</span></div>;
}

export function LoadingFields() {
  return <div className="h-40 animate-pulse rounded-lg bg-[var(--surface-soft)]" />;
}

export function buttonClass(variant) {
  if (variant === "primary") return "inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] transition disabled:opacity-60";
  return "inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-soft)] disabled:opacity-60";
}

const inputClass = "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]";
const textareaClass = "w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]";
