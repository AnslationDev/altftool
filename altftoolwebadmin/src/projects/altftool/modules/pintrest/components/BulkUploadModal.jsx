"use client";

import { useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, UploadCloud, X, AlertCircle } from "lucide-react";

import { addPin, uploadPinImage } from "../services/pinterest.service";

const MAX_MB = 10;

function fileToItem(file) {
  return {
    id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
    file,
    preview: URL.createObjectURL(file),
    title: file.name.replace(/\.[^.]+$/, ""),
    status: "pending", // pending | uploading | done | error
    progress: 0,
    error: "",
  };
}

export default function BulkUploadModal({ categories, defaultCategory, onClose, onUploaded }) {
  const [category, setCategory] = useState(defaultCategory || categories[0]?.name || "Other");
  const [items, setItems] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    const valid = [];
    for (const f of incoming) {
      if (f.size > MAX_MB * 1024 * 1024) continue; // skip oversized
      valid.push(fileToItem(f));
    }
    setItems((prev) => [...prev, ...valid]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const updateItem = (id, patch) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const pendingCount = items.filter((it) => it.status !== "done").length;

  const handleUploadAll = async () => {
    if (!items.length || uploading) return;
    setUploading(true);
    let success = 0;

    for (const it of items) {
      if (it.status === "done") continue;
      try {
        updateItem(it.id, { status: "uploading", progress: 0, error: "" });
        const url = await uploadPinImage(it.file, (frac) =>
          updateItem(it.id, { progress: Math.round(frac * 100) })
        );
        await addPin({
          title: (it.title || "Untitled").trim(),
          image: url,
          category,
          likes: 0,
        });
        updateItem(it.id, { status: "done", progress: 100 });
        success += 1;
        setDoneCount((c) => c + 1);
      } catch (err) {
        updateItem(it.id, {
          status: "error",
          error: err?.code === "storage/unauthorized" ? "Permission denied" : err?.message || "Upload failed",
        });
      }
    }

    setUploading(false);
    if (success > 0) onUploaded?.(success);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)] backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">Bulk upload images</h3>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Add many pins to one category at once. Each image becomes a pin.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[var(--muted)] transition hover:text-[var(--foreground)]">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {/* Category selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--muted)]">Target category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:[box-shadow:var(--focus-ring)] disabled:opacity-60"
            >
              {categories.length === 0 && <option value="Other">Other</option>}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
              dragOver ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] bg-[var(--surface-soft)] hover:bg-[var(--border)]"
            } ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            <UploadCloud size={26} className="text-[var(--primary)]" />
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Drag &amp; drop images here, or click to choose
            </p>
            <p className="text-[11px] text-[var(--muted)]">PNG, JPG, WEBP, GIF · up to {MAX_MB}MB each · multiple allowed</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
            />
          </div>

          {/* Selected files list */}
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[var(--muted)]">{items.length} image{items.length > 1 ? "s" : ""} selected</p>
                {!uploading && (
                  <button onClick={() => setItems([])} className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--danger)]">
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.preview} alt="" className="h-12 w-12 flex-shrink-0 rounded-md border border-[var(--border)] object-cover" />
                    <div className="min-w-0 flex-1">
                      <input
                        value={it.title}
                        onChange={(e) => updateItem(it.id, { title: e.target.value })}
                        disabled={uploading}
                        placeholder="Pin title"
                        className="w-full rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:[box-shadow:var(--focus-ring)] disabled:bg-[var(--surface-soft)]"
                      />
                      {it.status === "uploading" && (
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-soft)]">
                          <div className="h-full bg-[var(--primary)] transition-all" style={{ width: `${it.progress}%` }} />
                        </div>
                      )}
                      {it.status === "error" && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--danger)]">
                          <AlertCircle size={11} /> {it.error}
                        </p>
                      )}
                    </div>
                    <div className="flex w-7 flex-shrink-0 justify-center">
                      {it.status === "done" ? (
                        <CheckCircle2 size={18} className="text-[var(--success)]" />
                      ) : it.status === "uploading" ? (
                        <Loader2 size={16} className="animate-spin text-[var(--primary)]" />
                      ) : !uploading ? (
                        <button onClick={() => removeItem(it.id)} className="text-[var(--muted)] transition hover:text-[var(--danger)]">
                          <X size={16} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-4">
          <p className="text-xs text-[var(--muted)]">
            {doneCount > 0 ? <span className="font-semibold text-[var(--success)]">{doneCount} uploaded</span> : "No uploads yet"}
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
            >
              {doneCount > 0 ? "Done" : "Cancel"}
            </button>
            <button
              onClick={handleUploadAll}
              disabled={uploading || pendingCount === 0}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
              {uploading ? "Uploading…" : `Upload ${pendingCount || ""} to "${category}"`.trim()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
