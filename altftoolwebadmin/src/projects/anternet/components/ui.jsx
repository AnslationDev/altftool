"use client";

import { useState } from "react";
import { uploadImage, uploadVideoFile, uploadThumbnail } from "../lib/firebase";
import { videoRowType } from "../lib/schemas";

/** Recognizes YouTube / Vimeo links and returns an embeddable iframe src, or null for direct file URLs. */
function embedUrlFor(url) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

// Kept intentionally permissive so it matches lib/schemas.js's validateVideoList —
// any well-formed http(s) URL is accepted as a video source (YouTube/Vimeo links,
// direct mp4/mov/webm files, and CDN/Drive/Dropbox/signed URLs alike). This field's
// error only warns about malformed input; it must never disagree with the rule
// that actually gates Save, or a valid link could get blocked from saving.
function isValidVideoUrl(url) {
  return /^https?:\/\/\S+\.\S+/i.test(String(url || "").trim());
}

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

function ThumbnailUploadInput({ value, onChange, folder }) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const pick = async (file) => {
    if (!file) return;
    if (!/image\/(png|jpe?g|webp)/.test(file.type)) return setErr("PNG / JPG / WEBP only");
    if (file.size > 2 * 1024 * 1024) return setErr("Max 2 MB");
    setErr(""); setBusy(true); setPct(0);
    try { onChange(await uploadThumbnail(file, folder, undefined, setPct)); }
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
      {busy && <div className="mla-progress"><span style={{ width: `${pct}%` }} /></div>}
      <div className="mla-img-ctl">
        <input type="text" value={value || ""} placeholder="https://… (or upload)" onChange={(e) => onChange(e.target.value)} disabled={busy} />
        <label className="mla-btn mla-btn-ghost mla-btn-sm">
          {busy ? `${pct}%` : "Upload"}
          <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} disabled={busy} />
        </label>
        {value && <Button small kind="ghost" onClick={() => onChange("")} disabled={busy}>Clear</Button>}
      </div>
      <p className="mla-hint" style={{ margin: 0 }}>PNG / JPG / WEBP · max 2 MB</p>
      {err && <p className="mla-err">{err}</p>}
    </div>
  );
}

function VideoUploadInput({ value, onChange, folder }) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const pick = async (file) => {
    if (!file) return;
    if (!/video\/(mp4|quicktime|webm)/.test(file.type)) return setErr("MP4 / MOV / WebM only");
    if (file.size > 100 * 1024 * 1024) return setErr("Max 100 MB");
    setErr(""); setBusy(true); setPct(0);
    try { onChange(await uploadVideoFile(file, folder, undefined, setPct)); }
    catch (e) { setErr(e.message || "Upload failed — check Storage rules"); }
    finally { setBusy(false); }
  };
  return (
    <div className="mla-video-field">
      <div className="mla-video-box">
        {value ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={value} controls />
        ) : (
          <span className="mla-video-empty">🎬 No video uploaded yet</span>
        )}
      </div>
      {busy && <div className="mla-progress"><span style={{ width: `${pct}%` }} /></div>}
      <div className="mla-img-ctl">
        <label className="mla-btn mla-btn-ghost mla-btn-sm">
          {busy ? `Uploading… ${pct}%` : value ? "Replace video" : "Choose video file"}
          <input type="file" accept="video/mp4,video/quicktime,video/webm" hidden onChange={(e) => pick(e.target.files?.[0])} disabled={busy} />
        </label>
        {value && !busy && <Button small kind="ghost" onClick={() => onChange("")}>Remove</Button>}
      </div>
      <p className="mla-hint" style={{ margin: 0 }}>MP4, MOV or WebM · max 100 MB</p>
      {err && <p className="mla-err">{err}</p>}
    </div>
  );
}

function VideoUrlInput({ value, onChange }) {
  const [err, setErr] = useState("");
  const embed = value ? embedUrlFor(value) : null;
  const valid = Boolean(value) && !err;
  const handleChange = (v) => {
    onChange(v);
    if (!v) return setErr("");
    setErr(isValidVideoUrl(v) ? "" : "Enter a valid video URL (starting with http:// or https://)");
  };
  return (
    <div className="mla-video-field">
      <input type="text" value={value || ""} placeholder="https://youtube.com/watch?v=… or a direct .mp4 link"
        onChange={(e) => handleChange(e.target.value)} />
      <div className="mla-video-box">
        {valid ? (
          embed ? (
            <iframe src={embed} allow="encrypted-media" title="Video preview" />
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={value} controls />
          )
        ) : (
          <span className="mla-video-empty">🔗 Paste a link above to preview it here</span>
        )}
      </div>
      <div className="mla-img-ctl">
        <p className="mla-hint" style={{ margin: 0 }}>YouTube, Vimeo, or a direct video link</p>
        {value && <Button small kind="ghost" onClick={() => handleChange("")}>Clear</Button>}
      </div>
      {err && <p className="mla-err">{err}</p>}
    </div>
  );
}

/** Read-only preview for YouTube rows — mirrors the thumbnail + player box
 * that Upload/URL rows already get from their own field inputs, so every
 * video type shows the same at-a-glance preview in the admin panel. */
function YoutubePreview({ videoId }) {
  const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  return (
    <div className="mla-video-field">
      <div className="mla-video-box">
        {videoId ? (
          <iframe src={`https://www.youtube.com/embed/${videoId}`} allow="encrypted-media" title="YouTube preview" />
        ) : (
          <span className="mla-video-empty">▶️ Enter a YouTube ID below to preview it here</span>
        )}
      </div>
      {thumb && (
        <div className="mla-img-ctl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" className="mla-img-preview" />
          <p className="mla-hint" style={{ margin: 0 }}>Thumbnail (auto-generated by YouTube)</p>
        </div>
      )}
    </div>
  );
}

/** "Add Video" source picker — YouTube ID / Upload Video / Video URL. */
function VideoTypePicker({ onPick }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 8, flex: 1 }}>
      <Button kind="ghost" onClick={() => onPick("youtube")}>▶️ YouTube ID</Button>
      <Button kind="ghost" onClick={() => onPick("upload")}>⬆️ Upload Video</Button>
      <Button kind="ghost" onClick={() => onPick("url")}>🔗 Video URL</Button>
    </div>
  );
}

/**
 * Video Sections' "Videos" field. Each row starts empty (picker shown);
 * once a source is chosen, only that mode's fields render. Legacy rows
 * (no videoType, just a videoId) resolve straight to "youtube" — never
 * the picker — so existing records open exactly as before.
 */
const VIDEO_WIDE_FIELD_TYPES = ["videoupload", "videourl", "thumbnailupload", "textarea"];

function VideoListInput({ value = [], onChange, modes, rowErrors = {} }) {
  const setRow = (i, patch) => onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const pickType = (i, type) => setRow(i, { videoType: type });
  const changeSource = (i) => {
    const row = value[i];
    const { title, channel, views, duration, reward } = row;
    onChange(value.map((r, j) => (j === i ? { title, channel, views, duration, reward } : r)));
  };

  return (
    <div className="mla-objlist">
      {value.map((row, i) => {
        const type = videoRowType(row);
        const mode = type ? modes[type] : null;
        return (
          <div key={i} className="mla-objrow">
            {!mode ? (
              <VideoTypePicker onPick={(t) => pickType(i, t)} />
            ) : (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <span className="mla-hint" style={{ margin: 0 }}>{mode.icon} {mode.label}</span>
                  <Button small kind="ghost" onClick={() => changeSource(i)}>Change source</Button>
                </div>
                {type === "youtube" && (
                  <div style={{ marginBottom: 10 }}><YoutubePreview videoId={row.videoId} /></div>
                )}
                <div className="mla-objfields">
                  {mode.fields.map((f) => (
                    <div key={f.key} className={`mla-field${VIDEO_WIDE_FIELD_TYPES.includes(f.type) ? " mla-field-full" : ""}`}>
                      <label>{f.label}</label>
                      <Field field={f} value={row[f.key]}
                        onChange={(v) => setRow(i, { [f.key]: v, videoType: type })} />
                    </div>
                  ))}
                </div>
                {rowErrors[i] && <p className="mla-err" style={{ marginTop: 8 }}>⚠ {rowErrors[i]}</p>}
              </div>
            )}
            <div className="mla-list-ctl">
              <button disabled={i === 0} onClick={() => { const c = [...value]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; onChange(c); }}>↑</button>
              <button disabled={i === value.length - 1} onClick={() => { const c = [...value]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; onChange(c); }}>↓</button>
              <button onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
            </div>
          </div>
        );
      })}
      <Button small kind="ghost" onClick={() => onChange([...value, {}])}>+ Add Video</Button>
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
export function Field({ field, value, onChange, lookups = {}, rowErrors }) {
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
    case "thumbnailupload": return <ThumbnailUploadInput value={value} onChange={onChange} folder={f.folder || "misc"} />;
    case "videoupload": return <VideoUploadInput value={value} onChange={onChange} folder={f.folder || "misc"} />;
    case "videourl": return <VideoUrlInput value={value} onChange={onChange} />;
    case "objectlist": return <ObjectListInput value={value || []} onChange={onChange} item={f.item} lookups={lookups} />;
    case "videolist": return <VideoListInput value={value || []} onChange={onChange} modes={f.modes} rowErrors={rowErrors || {}} />;
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
