"use client";

// Shared, token-styled form primitives for the section editors. Kept tiny and
// dependency-free so every section editor composes the same look & a11y.

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { uploadLanderImage } from "../services/landersService";

const inputCls =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]";

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">{label}</span> : null}
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function Input({ value, onChange, ...rest }) {
  return <input className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

export function Textarea({ value, onChange, rows = 3, ...rest }) {
  return (
    <textarea
      rows={rows}
      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}

export function Select({ value, onChange, options = [], ...rest }) {
  return (
    <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// Image field: URL input + upload button (Firebase Storage via the landers
// service). Shows a preview when a URL is present.
export function ImageField({ value, onChange, landerId, label = "Image" }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true); setErr(""); setPct(0);
    try {
      const url = await uploadLanderImage({ file, landerId, onProgress: setPct });
      onChange(url);
    } catch {
      setErr("Upload failed. Try again or paste a URL.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label}>
      <div className="flex items-start gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-[var(--muted)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Input value={value} onChange={onChange} placeholder="https://… or upload" />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface,var(--card))] px-3 text-xs font-bold text-[var(--foreground)] hover:border-[var(--primary)] disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              {busy ? `Uploading ${pct}%` : "Upload"}
            </button>
            {value ? (
              <button type="button" onClick={() => onChange("")} className="text-xs font-bold text-[var(--muted)] hover:text-[var(--danger,#EF4444)]">Remove</button>
            ) : null}
          </div>
          {err ? <p className="mt-1 text-[11px] font-semibold text-[var(--danger,#EF4444)]">{err}</p> : null}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
        </div>
      </div>
    </Field>
  );
}

// Generic repeater for list-based sections (features, faq, stats…). Renders
// `renderItem(item, patch)` per row with add / remove / move-up / move-down.
export function ListEditor({ items = [], onChange, renderItem, addLabel = "Add item", newItem }) {
  const list = Array.isArray(items) ? items : [];

  const patchAt = (i, patch) => {
    const next = list.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const removeAt = (i) => onChange(list.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = list.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...list, typeof newItem === "function" ? newItem() : { ...(newItem || {}) }]);

  return (
    <div className="space-y-2.5">
      {list.map((item, i) => (
        <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">#{i + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move up" className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} title="Move down" className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => removeAt(i)} title="Remove" className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:text-[var(--danger,#EF4444)]"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          {renderItem(item, (patch) => patchAt(i, patch), i)}
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-3 text-xs font-bold text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]">
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}
