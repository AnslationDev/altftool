"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";

import { ICON_OPTIONS, uploadHomeImage } from "../service/sketchflow.service";

const labelCls = "mb-1.5 block text-xs font-semibold tracking-wide text-[var(--muted)]";
const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20";

export function Grid({ children }) {
  return <div className="grid gap-x-4 sm:grid-cols-2">{children}</div>;
}

export function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="mb-4 block">
      <span className={labelCls}>{label}</span>
      <input
        className={inputCls}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <label className="mb-4 block">
      <span className={labelCls}>{label}</span>
      <textarea
        className={`${inputCls} resize-y leading-relaxed`}
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function IconSelect({ label, value, onChange }) {
  return (
    <label className="mb-4 block">
      <span className={labelCls}>{label}</span>
      <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        {!ICON_OPTIONS.includes(value) && value ? <option value={value}>{value}</option> : null}
        {ICON_OPTIONS.map((icon) => (
          <option key={icon} value={icon}>{icon}</option>
        ))}
      </select>
    </label>
  );
}

export function ImageField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadHomeImage(file);
      onChange(url);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert("Image upload failed: " + (err?.message || "unknown error"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="mb-4">
      <span className={labelCls}>{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="preview"
            className="h-20 w-28 flex-shrink-0 rounded-lg border border-[var(--border)] object-cover"
          />
        ) : (
          <div className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-[var(--muted)]">
            <ImagePlus size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <input
            className={inputCls}
            value={value ?? ""}
            placeholder="Image URL or upload a file"
            onChange={(e) => onChange(e.target.value)}
          />
          <label
            className={`mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--primary)]/30 bg-[color:var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition hover:bg-[color:var(--primary)]/15 ${
              uploading ? "cursor-wait opacity-70" : "cursor-pointer"
            }`}
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            {uploading ? "Uploading…" : "Upload image"}
            <input type="file" accept="image/*" hidden onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}

// Generic list editor. `renderItem(item, onItemChange)` returns the editor for a
// single item; `makeEmpty()` returns a new blank item when "Add" is clicked.
export function ListEditor({ title, items, onChange, renderItem, makeEmpty, itemLabel = "Item" }) {
  const list = items || [];

  const updateItem = (index, nextItem) => {
    const next = list.slice();
    next[index] = nextItem;
    onChange(next);
  };
  const removeItem = (index) => onChange(list.filter((_, i) => i !== index));
  const addItem = () => onChange([...list, makeEmpty()]);

  return (
    <div className="mb-2">
      {title ? (
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-bold text-[var(--foreground)]">{title}</h4>
          <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
            {list.length}
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {list.map((item, index) => (
          <div
            key={index}
            className="relative rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {itemLabel} {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                title="Remove"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {renderItem(item, (nextItem) => updateItem(index, nextItem))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--primary)]/40 bg-[color:var(--primary)]/5 px-3.5 py-2 text-sm font-semibold text-[var(--primary)] transition hover:bg-[color:var(--primary)]/10"
      >
        <Plus size={15} /> Add {itemLabel.toLowerCase()}
      </button>
    </div>
  );
}