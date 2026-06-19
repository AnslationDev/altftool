"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Trash2, Plus, FileDown } from "lucide-react";
import ToolShell, { ToolLayout, Panel } from "../components/shared/ToolShell";
import Dropzone from "../components/shared/Dropzone";
import BeforeAfter from "../components/shared/BeforeAfter";
import { RangeField, SelectField, NumberField, ToggleRow } from "../components/shared/Controls";
import { ErrorBanner, EmptyState } from "../components/shared/States";
import { StatBadge } from "../components/shared/PreviewFrame";
import { loadImage, compress, MIME } from "../lib/imageProcessing";
import { formatBytes, percentChange, downloadBlob, downloadZip, suffixName, isImageFile } from "../lib/utils";
import { takeHandoffFiles } from "../lib/handoff";

let uid = 0;

export default function CompressClient() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quality, setQuality] = useState(70);
  const [format, setFormat] = useState("auto");
  const [limitWidth, setLimitWidth] = useState(false);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const urls = useRef([]);

  const addFiles = useCallback(async (files) => {
    setError("");
    const next = [];
    for (const file of files) {
      if (!isImageFile(file)) continue;
      try {
        const { img, url, width, height } = await loadImage(file);
        urls.current.push(url);
        next.push({
          id: ++uid,
          file,
          img,
          url,
          originalSize: file.size,
          dims: { width, height },
          result: null,
        });
      } catch {
        setError("One or more files couldn't be read and were skipped.");
      }
    }
    setItems((prev) => {
      const merged = [...prev, ...next];
      if (selected == null && merged.length) setSelected(merged[0].id);
      return merged;
    });
  }, [selected]);

  // consume handoff from homepage
  useEffect(() => {
    const f = takeHandoffFiles();
    if (f && f.length) addFiles(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const targetType = useCallback(
    (file) => {
      if (format === "auto") {
        return file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
      }
      return MIME[format];
    },
    [format]
  );

  const process = useCallback(async () => {
    if (!items.length) return;
    setBusy(true);
    setError("");
    try {
      const updated = [];
      for (const it of items) {
        const type = targetType(it.file);
        const { blob, width, height } = await compress(it.img, {
          quality: quality / 100,
          type,
          maxWidth: limitWidth ? Number(maxWidth) : null,
        });
        if (it.result?.url) URL.revokeObjectURL(it.result.url);
        const rUrl = URL.createObjectURL(blob);
        urls.current.push(rUrl);
        updated.push({
          ...it,
          result: { blob, url: rUrl, size: blob.size, type, dims: { width, height } },
        });
      }
      setItems(updated);
    } catch (e) {
      setError(e.message || "Compression failed.");
    } finally {
      setBusy(false);
    }
  }, [items, quality, targetType, limitWidth, maxWidth]);

  // auto-process when settings change (debounced) once images exist
  useEffect(() => {
    if (!items.length) return;
    const t = setTimeout(() => process(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, format, limitWidth, maxWidth, items.length]);

  const removeItem = (id) => {
    setItems((prev) => {
      const left = prev.filter((i) => i.id !== id);
      if (selected === id) setSelected(left[0]?.id ?? null);
      return left;
    });
  };

  const reset = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    setItems([]);
    setSelected(null);
  };

  const ext = (type) => (type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg");

  const downloadOne = (it) => {
    if (!it.result) return;
    downloadBlob(it.result.blob, suffixName(it.file.name, "compressed", ext(it.result.type)));
  };

  const downloadAll = async () => {
    const ready = items.filter((i) => i.result);
    if (!ready.length) return;
    if (ready.length === 1) return downloadOne(ready[0]);
    await downloadZip(
      ready.map((i) => ({ blob: i.result.blob, filename: suffixName(i.file.name, "compressed", ext(i.result.type)) })),
      "altf-compressed-images.zip"
    );
  };

  const current = items.find((i) => i.id === selected);
  const totalOriginal = items.reduce((s, i) => s + i.originalSize, 0);
  const totalResult = items.reduce((s, i) => s + (i.result?.size || 0), 0);
  const totalSaved = totalOriginal && totalResult ? percentChange(totalOriginal, totalResult) : 0;

  const sidebar = (
    <div className="flex flex-col gap-5">
      <SelectField
        label="Output format"
        value={format}
        onChange={setFormat}
        hint="Auto keeps PNG/WEBP, compresses photos as JPG."
        options={[
          { value: "auto", label: "Auto (recommended)" },
          { value: "jpg", label: "JPG" },
          { value: "png", label: "PNG" },
          { value: "webp", label: "WEBP" },
        ]}
      />
      <RangeField label="Quality" value={quality} min={10} max={100} unit="%" onChange={setQuality} />
      <ToggleRow label="Limit max width" checked={limitWidth} onChange={setLimitWidth} />
      {limitWidth && (
        <NumberField label="Max width (px)" value={maxWidth} min={64} max={10000} onChange={setMaxWidth} />
      )}
      {items.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <StatBadge label="Images" value={items.length} />
            <StatBadge label="Saved" value={`${totalSaved}%`} accent />
          </div>
          <button onClick={reset} className="ali-btn ali-btn-ghost w-full">
            <Trash2 size={15} /> Clear all
          </button>
        </>
      )}
    </div>
  );

  return (
    <ToolShell slug="compress">
      <ToolLayout sidebar={sidebar}>
        <div className="flex flex-col gap-5">
          <ErrorBanner message={error} onDismiss={() => setError("")} />

          {items.length === 0 ? (
            <Dropzone onFiles={addFiles} multiple slug="compress" title="Drop images to compress" subtitle="JPG, PNG or WEBP · select multiple for batch" />
          ) : (
            <>
              {/* preview */}
              {current && (
                <Panel>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate max-w-[60%]">{current.file.name}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => downloadOne(current)} disabled={!current.result} className="ali-btn ali-btn-primary" style={{ padding: "0.45rem 0.9rem", fontSize: "0.82rem" }}>
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </div>
                  {current.result ? (
                    <BeforeAfter before={current.url} after={current.result.url} />
                  ) : (
                    <div className="grid place-items-center rounded-2xl ali-checker" style={{ minHeight: 280 }}>
                      <img src={current.url} alt="" className="max-h-[360px] max-w-full" />
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatBadge label="Original" value={formatBytes(current.originalSize)} />
                    <StatBadge label="Compressed" value={current.result ? formatBytes(current.result.size) : "—"} accent />
                    <StatBadge label="Reduction" value={current.result ? `${percentChange(current.originalSize, current.result.size)}%` : "—"} accent />
                    <StatBadge label="Dimensions" value={`${current.dims.width}×${current.dims.height}`} />
                  </div>
                </Panel>
              )}

              {/* batch list */}
              <Panel title={`Queue (${items.length})`}>
                <div className="flex flex-col gap-2">
                  {items.map((it) => {
                    const red = it.result ? percentChange(it.originalSize, it.result.size) : null;
                    return (
                      <button
                        key={it.id}
                        onClick={() => setSelected(it.id)}
                        className="flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors"
                        style={{
                          borderColor: selected === it.id ? "var(--ali-teal)" : "var(--ali-border)",
                          background: selected === it.id ? "var(--ali-grad-soft)" : "var(--ali-surface)",
                        }}
                      >
                        <img src={it.url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover ali-checker" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{it.file.name}</span>
                          <span className="block text-xs" style={{ color: "var(--ali-muted)" }}>
                            {formatBytes(it.originalSize)}
                            {it.result && ` → ${formatBytes(it.result.size)}`}
                          </span>
                        </span>
                        {red != null && (
                          <span className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold"
                            style={{ background: "var(--anslation-ds-success-soft,#dcf4e3)", color: "var(--anslation-ds-success,#14783e)" }}>
                            −{red}%
                          </span>
                        )}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); removeItem(it.id); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); removeItem(it.id); } }}
                          className="shrink-0 rounded-lg p-1.5 opacity-60 hover:opacity-100"
                          aria-label="Remove"
                        >
                          <Trash2 size={16} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <label className="ali-btn ali-btn-ghost cursor-pointer">
                    <Plus size={15} /> Add more
                    <input type="file" multiple accept="image/*" className="hidden"
                      onChange={(e) => { addFiles(Array.from(e.target.files)); e.target.value = ""; }} />
                  </label>
                  <button onClick={downloadAll} disabled={busy || !items.some((i) => i.result)} className="ali-btn ali-btn-primary">
                    {items.length > 1 ? <FileDown size={16} /> : <Download size={16} />}
                    {items.length > 1 ? "Download all (ZIP)" : "Download"}
                  </button>
                  {busy && <span className="self-center text-sm" style={{ color: "var(--ali-muted)" }}>Compressing…</span>}
                </div>
              </Panel>
            </>
          )}
        </div>
      </ToolLayout>
    </ToolShell>
  );
}
