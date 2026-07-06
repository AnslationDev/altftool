"use client";

import { useState } from "react";
import { uploadImage } from "../lib/firebase";

/* ------------------------------- Primitives ------------------------------- */
export function Button({ children, onClick, kind = "primary", disabled, type = "button", small }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`mla-btn mla-btn-${kind}${small ? " mla-btn-sm" : ""}`}>
      {children}
    </button>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`mla-toast ${toast.type === "error" ? "mla-toast-err" : "mla-toast-ok"}`} role="status">
      <span aria-hidden="true">{toast.type === "error" ? "⚠" : "✓"}</span>
      {toast.msg}
    </div>
  );
}

export function Modal({ title, children, onClose, wide }) {
  return (
    <div className="mla-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`mla-modal${wide ? " mla-modal-wide" : ""}`}>
        <div className="mla-modal-head">
          <h3>{title}</h3>
          <button className="mla-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="mla-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------ Field inputs ------------------------------ */
function TagsInput({ value = [], onChange }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className="mla-tags">
      {value.map((t) => (
        <span key={t} className="mla-chip">
          {t}
          <button onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}>✕</button>
        </span>
      ))}
      <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type + Enter"
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} onBlur={add} />
    </div>
  );
}

function ListInput({ value = [], onChange, rows = 2 }) {
  return (
    <div className="mla-list">
      {value.map((item, i) => (
        <div key={i} className="mla-list-row">
          <textarea rows={rows} value={item}
            onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          <div className="mla-list-ctl">
            <button disabled={i === 0} onClick={() => { const c = [...value]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; onChange(c); }}>↑</button>
            <button disabled={i === value.length - 1} onClick={() => { const c = [...value]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; onChange(c); }}>↓</button>
            <button onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
          </div>
        </div>
      ))}
      <Button small kind="ghost" onClick={() => onChange([...value, ""])}>+ Add item</Button>
    </div>
  );
}

function KeyValueInput({ value = {}, onChange }) {
  const entries = Object.entries(value);
  const set = (list) => onChange(Object.fromEntries(list.filter(([k]) => k.trim())));
  return (
    <div className="mla-list">
      {entries.map(([k, v], i) => (
        <div key={i} className="mla-kv">
          <input value={k} placeholder="Key" onChange={(e) => set(entries.map((p, j) => (j === i ? [e.target.value, p[1]] : p)))} />
          <input value={v} placeholder="Value" onChange={(e) => set(entries.map((p, j) => (j === i ? [p[0], e.target.value] : p)))} />
          <button onClick={() => set(entries.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <Button small kind="ghost" onClick={() => onChange({ ...value, [`Key ${entries.length + 1}`]: "" })}>+ Add row</Button>
    </div>
  );
}

function ImageInput({ value, onChange, folder }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (file) => {
    if (!file) return;
    if (!/image\/(png|jpe?g|webp)/.test(file.type)) return setErr("PNG / JPG / WEBP only");
    if (file.size > 2 * 1024 * 1024) return setErr("Max 2 MB");
    setErr(""); setBusy(true);
    try { onChange(await uploadImage(file, folder)); }
    catch (e) { setErr(e.message || "Upload failed — check Storage rules"); }
    finally { setBusy(false); }
  };
  return (
    <div className="mla-img">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mla-img-preview" />
      ) : (
        <span className="mla-img-empty">No image</span>
      )}
      <div className="mla-img-ctl">
        <input type="text" value={value || ""} placeholder="https://… (or upload)" onChange={(e) => onChange(e.target.value)} />
        <label className="mla-btn mla-btn-ghost mla-btn-sm">
          {busy ? "Uploading…" : "Upload"}
          <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        {value && <Button small kind="ghost" onClick={() => onChange("")}>Clear</Button>}
      </div>
      {err && <p className="mla-err">{err}</p>}
    </div>
  );
}

function ObjectListInput({ value = [], onChange, item, lookups }) {
  return (
    <div className="mla-objlist">
      {value.map((row, i) => (
        <div key={i} className="mla-objrow">
          <div className="mla-objfields">
            {item.map((f) => (
              <div key={f.key} className="mla-field mla-field-inline">
                <label>{f.label}</label>
                <Field field={f} value={row[f.key]} lookups={lookups}
                  onChange={(v) => onChange(value.map((r, j) => (j === i ? { ...r, [f.key]: v } : r)))} />
              </div>
            ))}
          </div>
          <div className="mla-list-ctl">
            <button disabled={i === 0} onClick={() => { const c = [...value]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; onChange(c); }}>↑</button>
            <button disabled={i === value.length - 1} onClick={() => { const c = [...value]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; onChange(c); }}>↓</button>
            <button onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
          </div>
        </div>
      ))}
      <Button small kind="ghost" onClick={() => onChange([...value, Object.fromEntries(item.map((f) => [f.key, f.type === "boolean" ? true : f.type === "tags" || f.type === "objectlist" ? [] : ""]))])}>
        + Add row
      </Button>
    </div>
  );
}

/** Renders any schema field. */
export function Field({ field, value, onChange, lookups = {} }) {
  const f = field;
  switch (f.type) {
    case "textarea":
      return <textarea rows={f.rows || 3} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return <input type="number" value={value ?? ""} min={f.min} max={f.max} step={f.step || 1}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />;
    case "boolean":
      return (
        <label className="mla-switch">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span>{value ? "Yes" : "No"}</span>
        </label>
      );
    case "select": {
      const opts = typeof f.options === "string" ? (lookups[f.options.split(":")[1]] || []) : f.options;
      return (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">— select —</option>
          {opts.map((o) => {
            const val = typeof o === "object" ? o.value : o;
            const lab = typeof o === "object" ? o.label : o;
            return <option key={val} value={val}>{lab}</option>;
          })}
        </select>
      );
    }
    case "tags": return <TagsInput value={value || []} onChange={onChange} />;
    case "list": return <ListInput value={value || []} onChange={onChange} rows={f.rows} />;
    case "keyvalue": return <KeyValueInput value={value || {}} onChange={onChange} />;
    case "image": return <ImageInput value={value} onChange={onChange} folder={f.folder || "misc"} />;
    case "objectlist": return <ObjectListInput value={value || []} onChange={onChange} item={f.item} lookups={lookups} />;
    case "group":
      return (
        <div className="mla-group">
          {f.item.map((sub) => (
            <div key={sub.key} className="mla-field">
              <label>{sub.label}</label>
              <Field field={sub} value={(value || {})[sub.key]} lookups={lookups}
                onChange={(v) => onChange({ ...(value || {}), [sub.key]: v })} />
            </div>
          ))}
        </div>
      );
    default:
      return <input type="text" value={value || ""}
        onChange={(e) => onChange(f.transform === "uppercase" ? e.target.value.toUpperCase() : e.target.value)} />;
  }
}
