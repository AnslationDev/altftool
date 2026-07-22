"use client";

/**
 * Infovasta — Home admin shared primitives.
 *
 * The Infovasta home page is a single admin page composed of many sections.
 * Every section is a singleton settings document (`home/<key>`). To keep the
 * page DRY we drive every editor from a small config array, mirroring the
 * config-driven `SettingsCard` pattern the samvatsara home module uses.
 *
 * Field types supported:
 *   text | textarea | cta | lines (string[] repeatable rows) | objectList (array of {key} objects, repeatable rows)
 */

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

export const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
export const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

/* -------------------------------------------------------------------------- */
/* Infovasta preview theme (indigo accent — preview only)                     */
/* -------------------------------------------------------------------------- */
export const HEX = {
  bg: "#f5f4ff",
  raised: "#ffffff",
  fg: "#1f1147",
  dim: "#6b647f",
  accent: "#5B4BE8",
  border: "#e3e0fb",
};

export function PreviewShell({ children, raised }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{ borderColor: HEX.border, background: raised ? HEX.raised : HEX.bg, color: HEX.fg }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: HEX.accent }}>
      {children || "EYEBROW"}
    </p>
  );
}

/** Renders a lead + highlighted heading pair the way the Infovasta frontend does. */
export function PreviewHeading({ before, highlight, className = "" }) {
  return (
    <h3 className={`font-semibold leading-tight ${className}`} style={{ color: HEX.fg }}>
      {before || "Heading goes here "}
      {highlight ? <span style={{ color: HEX.accent }}>{highlight}</span> : null}
    </h3>
  );
}

export function PrimaryBtn({ children }) {
  return (
    <span className="inline-flex rounded-full px-4 py-2 text-xs font-semibold" style={{ background: HEX.accent, color: "#ffffff" }}>
      {children}
    </span>
  );
}

export function SecondaryBtn({ children }) {
  return (
    <span className="inline-flex rounded-full border px-4 py-2 text-xs font-semibold" style={{ borderColor: HEX.border, color: HEX.fg }}>
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Section frame — numbered heading + LEFT management / RIGHT live preview     */
/* -------------------------------------------------------------------------- */
export function SectionFrame({ index, icon: Icon, title, subtitle, children, preview }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
          {index}
        </span>
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 text-gray-400" /> : null}
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">{children}</div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">Live preview</div>
          <div className="xl:sticky xl:top-6">{preview}</div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Field primitives                                                           */
/* -------------------------------------------------------------------------- */
export function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-gray-400">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}

function CtaField({ label, value, onChange }) {
  const cta = value || { label: "", href: "" };
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={cta.label || ""} onChange={(event) => onChange({ ...cta, label: event.target.value })} className={inputClass} placeholder="Button label" />
        <input value={cta.href || ""} onChange={(event) => onChange({ ...cta, href: event.target.value })} className={inputClass} placeholder="/link-or-url" />
      </div>
    </div>
  );
}

/** Repeatable list of plain strings (add/remove rows). */
function LinesField({ label, value, onChange, placeholder }) {
  const items = Array.isArray(value) ? value : [];
  function setItem(index, next) {
    const copy = [...items];
    copy[index] = next;
    onChange(copy);
  }
  function addItem() {
    onChange([...items, ""]);
  }
  function removeItem(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input value={item} onChange={(event) => setItem(index, event.target.value)} className={inputClass} placeholder={placeholder} />
            <button type="button" onClick={() => removeItem(index)} className="shrink-0 rounded-xl border border-red-200 px-3 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50">
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>
    </div>
  );
}

/** Repeatable list of small objects (add/remove rows), e.g. { icon, label }. */
function ObjectListField({ label, value, onChange, columns }) {
  const rows = Array.isArray(value) ? value : [];
  function setRow(index, key, next) {
    const copy = [...rows];
    copy[index] = { ...copy[index], [key]: next };
    onChange(copy);
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
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
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
          <Plus className="h-4 w-4" /> Add row
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Settings card — config-driven singleton doc editor                         */
/* -------------------------------------------------------------------------- */
function hydrate(fields, data) {
  const form = { ...data };
  fields.forEach((field) => {
    if (field.type === "cta") {
      form[field.key] = { label: data[field.key]?.label || "", href: data[field.key]?.href || "" };
    } else if (field.type === "lines" || field.type === "objectList") {
      form[field.key] = Array.isArray(data[field.key]) ? data[field.key] : [];
    } else {
      form[field.key] = data[field.key] ?? "";
    }
  });
  return form;
}

export function SettingsCard({ eyebrow, title, defaults, subscribe, save, fields, errorLabel, onChange }) {
  const [form, setForm] = useState(() => hydrate(fields, defaults));
  const [saved, setSaved] = useState(() => hydrate(fields, defaults));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsub = subscribe(
      (data) => {
        const next = hydrate(fields, data);
        setForm(next);
        setSaved(next);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: `Failed to load ${errorLabel} content.` });
        setLoading(false);
      },
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onChange?.(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  function setValue(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleSave() {
    const nextErrors = {};
    fields.forEach((field) => {
      if (!field.required) return;
      if (field.type === "cta" || field.type === "lines" || field.type === "objectList") return;
      if (!String(form[field.key] || "").trim()) nextErrors[field.key] = `${field.label} is required.`;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await save(form);
      emitAlert({ type: "success", message: `${title} saved.` });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || `Failed to save ${errorLabel}.` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h3 className="mt-1 text-base font-bold text-gray-900">{title}</h3>
        </div>
        <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
          {dirty ? "Unsaved" : "Saved"}
        </span>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {fields.map((field) => {
            if (field.type === "cta") {
              return <CtaField key={field.key} label={field.label} value={form[field.key]} onChange={(value) => setValue(field.key, value)} />;
            }
            if (field.type === "lines") {
              return <LinesField key={field.key} label={field.label} value={form[field.key]} onChange={(value) => setValue(field.key, value)} placeholder={field.placeholder} />;
            }
            if (field.type === "objectList") {
              return <ObjectListField key={field.key} label={field.label} value={form[field.key]} onChange={(value) => setValue(field.key, value)} columns={field.columns} />;
            }
            if (field.type === "textarea") {
              return (
                <Field key={field.key} label={field.label} error={errors[field.key]} hint={field.hint}>
                  <textarea value={form[field.key] || ""} onChange={(event) => setValue(field.key, event.target.value)} rows={field.rows || 3} className={textareaClass} placeholder={field.placeholder} />
                </Field>
              );
            }
            return (
              <Field key={field.key} label={field.label} error={errors[field.key]} hint={field.hint}>
                <input value={form[field.key] || ""} onChange={(event) => setValue(field.key, event.target.value)} className={inputClass} placeholder={field.placeholder} />
              </Field>
            );
          })}

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
