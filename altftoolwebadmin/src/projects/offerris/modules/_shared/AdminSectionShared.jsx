"use client";

/**
 * Offerris — shared admin section primitives.
 *
 * Several Offerris admin pages (home, about-us) are single pages
 * composed of multiple sections, each either a singleton settings document
 * or a settings document paired with an ordered collection. This file
 * centralizes the config-driven `SettingsCard` / `CollectionManager` pattern
 * so those pages don't each hand-roll the same table/modal code — mirrors
 * Dealnbook's `home/components/HomeAdminShared.jsx`.
 *
 * Field types supported by SettingsCard and CollectionManager's modal:
 *   text | textarea | list | number | image
 *
 * `list` renders a lightweight repeatable-text-input editor (add/remove
 * rows) for simple `string[]` fields — not a Firestore sub-collection.
 *
 * `image` renders a direct-to-Storage image uploader (preview + upload +
 * remove) backed by an `upload` function supplied per-field (built from
 * `createImageUploader` in the service layer). Only the resulting download
 * URL is written back onto the form value.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";

export const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
export const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

/** Accept either a string[] or a newline-joined string. */
export function asLines(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Offerris preview theme (dark, neon violet/cyan — mirrors the live site's    */
/* #08080C background + violet/cyan tokens; preview only, no real styling)     */
/* -------------------------------------------------------------------------- */
export const HEX = {
  bg: "#08080C",
  raised: "#12131c",
  fg: "#ffffff",
  dim: "#9ca3b8",
  accent: "#22d3ee",
  accentAlt: "#8b5cf6",
  border: "#23243a",
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

/** Renders a heading the way the Offerris frontend does. */
export function PreviewHeading({ lead, className = "" }) {
  return (
    <h3 className={`font-semibold leading-tight ${className}`} style={{ color: HEX.fg }}>
      {lead || "Heading goes here"}
    </h3>
  );
}

export function PrimaryBtn({ children }) {
  return (
    <span
      className="inline-flex rounded-full px-4 py-2 text-xs font-semibold"
      style={{ background: HEX.accent, color: "#08080C" }}
    >
      {children}
    </span>
  );
}

export function SecondaryBtn({ children }) {
  return (
    <span
      className="inline-flex rounded-full border px-4 py-2 text-xs font-semibold"
      style={{ borderColor: HEX.border, color: HEX.fg }}
    >
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
        {preview ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Eye className="h-4 w-4 text-gray-400" /> Live preview
            </div>
            <div className="xl:sticky xl:top-6">{preview}</div>
          </div>
        ) : null}
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

/** Lightweight repeatable-text-input editor for simple string[] fields. */
export function ListEditor({ label, value, onChange, placeholder, error, hint }) {
  const rows = Array.isArray(value) ? value : [];

  function setRow(index, next) {
    const nextRows = rows.slice();
    nextRows[index] = next;
    onChange(nextRows);
  }

  function addRow() {
    onChange([...rows, ""]);
  }

  function removeRow(index) {
    onChange(rows.filter((_, i) => i !== index));
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={row}
              onChange={(event) => setRow(index, event.target.value)}
              className={inputClass}
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="shrink-0 rounded-lg border border-red-200 p-2.5 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add row
        </button>
      </div>
      {hint ? <span className="mt-1 block text-xs text-gray-400">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </div>
  );
}

/** Direct-to-Storage image uploader — preview + upload + remove. */
export function ImageField({ label, value, onChange, upload, hint, error }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(file) {
    if (!file || !upload) return;
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = await upload({ file, onProgress: setProgress });
      onChange(uploaded.url);
      emitAlert({ type: "success", message: "Image uploaded." });
    } catch (uploadError) {
      emitAlert({ type: "error", message: uploadError?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-gray-300" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-xl border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          {uploading ? (
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-gray-900 transition-all" style={{ width: `${progress}%` }} />
            </div>
          ) : null}
        </div>
      </div>
      {hint ? <span className="mt-1 block text-xs text-gray-400">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Settings card — config-driven singleton doc editor                         */
/* -------------------------------------------------------------------------- */
function hydrate(fields, data) {
  const form = { ...data };
  fields.forEach((field) => {
    if (field.type === "list") {
      form[field.key] = Array.isArray(data[field.key]) ? data[field.key] : asLines(data[field.key]);
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

  // Report the live form up so the section can mirror it in the preview.
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
      const value = form[field.key];
      const empty = field.type === "list" ? !(value || []).length : !String(value || "").trim();
      if (empty) nextErrors[field.key] = `${field.label} is required.`;
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
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {fields.map((field) => {
            if (field.type === "image") {
              return (
                <ImageField
                  key={field.key}
                  label={field.label}
                  value={form[field.key]}
                  onChange={(value) => setValue(field.key, value)}
                  upload={field.upload}
                  hint={field.hint}
                  error={errors[field.key]}
                />
              );
            }
            if (field.type === "list") {
              return (
                <ListEditor
                  key={field.key}
                  label={field.label}
                  value={form[field.key]}
                  onChange={(value) => setValue(field.key, value)}
                  placeholder={field.placeholder}
                  error={errors[field.key]}
                  hint={field.hint}
                />
              );
            }
            if (field.type === "textarea") {
              return (
                <Field key={field.key} label={field.label} error={errors[field.key]} hint={field.hint}>
                  <textarea
                    value={form[field.key] || ""}
                    onChange={(event) => setValue(field.key, event.target.value)}
                    rows={field.rows || 3}
                    className={textareaClass}
                    placeholder={field.placeholder}
                  />
                </Field>
              );
            }
            return (
              <Field key={field.key} label={field.label} error={errors[field.key]} hint={field.hint}>
                <input
                  type={field.inputType || "text"}
                  value={form[field.key] ?? ""}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  className={inputClass}
                  placeholder={field.placeholder}
                />
              </Field>
            );
          })}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Collection manager — config-driven list + add/edit modal                   */
/* -------------------------------------------------------------------------- */
export function CollectionManager({
  eyebrow,
  title,
  itemNoun,
  subscribe,
  create,
  update,
  remove,
  toggle,
  fields,
  columns,
  itemLabel,
  onItems,
  imageColumnLabel = "Image",
}) {
  const [items, setItems] = useState([]);
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribe(
      (list) => setItems(list),
      () => emitAlert({ type: "error", message: `Failed to load ${itemNoun}s.` }),
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [items],
  );

  // Report the live list up so the section can mirror it in the preview.
  useEffect(() => {
    onItems?.(sorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted]);

  async function toggleItem(item) {
    try {
      await toggle(item.id, item.active === false);
      emitAlert({ type: "success", message: "Status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await remove(deleteTarget.id);
      emitAlert({ type: "success", message: `${itemNoun} deleted.` });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || `Failed to delete ${itemNoun}.` });
    } finally {
      setDeleteLoading(false);
    }
  }

  const imageColumn = columns.find((col) => col.image);
  const hasImageColumn = Boolean(imageColumn);
  const gridCols = hasImageColumn ? "grid-cols-[64px_1fr_90px_120px]" : "grid-cols-[1fr_90px_120px]";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h3 className="mt-1 text-base font-bold text-gray-900">{items.length} {title.toLowerCase()}</h3>
        </div>
        <button
          onClick={() => setModalState({ mode: "create", item: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" /> Add {itemNoun}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <div className="min-w-[560px]">
          <div className={`grid ${gridCols} bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400`}>
            {hasImageColumn ? <span>{imageColumnLabel}</span> : null}
            <span>{columns.find((col) => !col.image)?.label}</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {sorted.length ? (
            sorted.map((item) => (
              <div key={item.id} className={`grid ${gridCols} items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm`}>
                {hasImageColumn ? (
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {item[imageColumn.key] ? (
                      <img src={item[imageColumn.key]} alt="" className="h-full w-full object-contain p-1.5" />
                    ) : (
                      <ImageIcon className="m-3.5 h-5 w-5 text-gray-300" />
                    )}
                  </div>
                ) : null}
                <div className="min-w-0">
                  {columns
                    .filter((col) => !col.image)
                    .map((col, colIndex) => (
                      <p
                        key={col.key}
                        className={`truncate ${colIndex === 0 ? "font-bold text-gray-900" : "text-xs font-semibold text-gray-500"}`}
                      >
                        {col.render ? col.render(item) : item[col.key]}
                      </p>
                    ))}
                </div>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${item.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>
                  {item.active === false ? "Inactive" : "Active"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => toggleItem(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                    {item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setModalState({ mode: "edit", item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">
              No {itemNoun}s yet.
            </div>
          )}
        </div>
      </div>

      {modalState ? (
        <CollectionModal
          mode={modalState.mode}
          item={modalState.item}
          items={items}
          fields={fields}
          title={title}
          itemNoun={itemNoun}
          create={create}
          update={update}
          onClose={() => setModalState(null)}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title={`Delete ${itemNoun}`}
          message={`Delete "${itemLabel(deleteTarget) || "this item"}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function CollectionModal({ mode, item, items, fields, title, itemNoun, create, update, onClose }) {
  const nextOrder = useMemo(
    () => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1,
    [items],
  );

  const [form, setForm] = useState(() => {
    const base = { order: Number(item?.order) || nextOrder, active: item?.active !== false };
    fields.forEach((field) => {
      base[field.key] = item?.[field.key] ?? "";
    });
    return base;
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    fields.forEach((field) => {
      if (field.required && !String(form[field.key] ?? "").trim()) {
        nextErrors[field.key] = `${field.label} is required.`;
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await update(item.id, form);
        emitAlert({ type: "success", message: `${itemNoun} updated.` });
      } else {
        await create(form);
        emitAlert({ type: "success", message: `${itemNoun} added.` });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || `Failed to save ${itemNoun}.` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {mode === "edit" ? `Edit ${itemNoun}` : `Add ${itemNoun}`}
            </p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">{title} details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={field.half ? "" : "sm:col-span-2"}>
                {field.type === "image" ? (
                  <ImageField
                    label={field.label}
                    value={form[field.key]}
                    onChange={(value) => setField(field.key, value)}
                    upload={field.upload}
                    hint={field.hint}
                    error={errors[field.key]}
                  />
                ) : (
                  <Field label={field.label} error={errors[field.key]} hint={field.hint}>
                    {field.type === "textarea" ? (
                      <textarea
                        value={form[field.key] || ""}
                        onChange={(event) => setField(field.key, event.target.value)}
                        rows={field.rows || 3}
                        className={textareaClass}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        value={form[field.key] ?? ""}
                        onChange={(event) => setField(field.key, event.target.value)}
                        className={inputClass}
                        placeholder={field.placeholder}
                      />
                    )}
                  </Field>
                )}
              </div>
            ))}

            <Field label="Display Order">
              <input
                type="number"
                value={form.order}
                onChange={(event) => setField("order", event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Status">
              <button
                type="button"
                onClick={() => setField("active", !form.active)}
                className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}
              >
                <span>{form.active ? "Active" : "Inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
            </Field>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {mode === "edit" ? `Update ${itemNoun}` : `Add ${itemNoun}`}
          </button>
        </div>
      </div>
    </div>
  );
}
