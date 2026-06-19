"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileDown, Plus, Trash2 } from "lucide-react";
import ToolShell, { ToolLayout, Panel } from "./ToolShell";
import Dropzone from "./Dropzone";
import { RangeField } from "./Controls";
import { StatBadge } from "./PreviewFrame";
import { ErrorBanner } from "./States";
import { loadImage, convert, MIME } from "../../lib/imageProcessing";
import { formatBytes, downloadBlob, downloadZip, changeExtension, isImageFile } from "../../lib/utils";

let cid = 0;

/**
 * Generic format converter used by jpg-to-png, png-to-jpg, webp-to-jpg, jpg-to-webp.
 * config: { slug, to: "png"|"jpg"|"webp", lossy: bool }
 */
export default function ConverterClient({ slug, to, lossy = false }) {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const urls = useRef([]);
  const targetType = MIME[to];

  const addFiles = useCallback(async (files) => {
    setError("");
    const next = [];
    for (const file of files) {
      if (!isImageFile(file)) continue;
      try {
        const { img, url, width, height } = await loadImage(file);
        urls.current.push(url);
        next.push({ id: ++cid, file, img, url, size: file.size, dims: { width, height }, result: null });
      } catch {
        setError("Some files couldn't be read and were skipped.");
      }
    }
    setItems((prev) => [...prev, ...next]);
  }, []);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const run = useCallback(async () => {
    if (!items.length) return;
    setBusy(true);
    setError("");
    try {
      const updated = [];
      for (const it of items) {
        const { blob } = await convert(it.img, { type: targetType, quality: quality / 100 });
        if (it.result?.url) URL.revokeObjectURL(it.result.url);
        const url = URL.createObjectURL(blob);
        urls.current.push(url);
        updated.push({ ...it, result: { blob, url, size: blob.size } });
      }
      setItems(updated);
    } catch (e) {
      setError(e.message || "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }, [items, targetType, quality]);

  useEffect(() => {
    if (!items.length) return;
    const t = setTimeout(run, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, quality]);

  const reset = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    setItems([]);
  };
  const removeItem = (id) => setItems((p) => p.filter((i) => i.id !== id));

  const downloadOne = (it) => it.result && downloadBlob(it.result.blob, changeExtension(it.file.name, to));
  const downloadAll = async () => {
    const ready = items.filter((i) => i.result);
    if (ready.length === 1) return downloadOne(ready[0]);
    await downloadZip(ready.map((i) => ({ blob: i.result.blob, filename: changeExtension(i.file.name, to) })), `altf-${to}-converted.zip`);
  };

  const sidebar = (
    <div className="flex flex-col gap-5">
      {lossy && <RangeField label="Quality" value={quality} min={10} max={100} unit="%" onChange={setQuality} />}
      <div className="rounded-xl p-3 text-sm" style={{ background: "var(--ali-grad-soft)", color: "var(--ali-teal-700)" }}>
        Converting to <strong>.{to.toUpperCase()}</strong>
        {lossy ? " · adjust quality for size vs. fidelity." : " · lossless conversion."}
      </div>
      {items.length > 0 && (
        <>
          <StatBadge label="Images" value={items.length} />
          <button onClick={reset} className="ali-btn ali-btn-ghost w-full"><Trash2 size={15} /> Clear all</button>
        </>
      )}
    </div>
  );

  return (
    <ToolShell slug={slug}>
      <ToolLayout sidebar={sidebar}>
        <div className="flex flex-col gap-5">
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          {items.length === 0 ? (
            <Dropzone onFiles={addFiles} multiple slug={slug} title={`Drop images to convert to ${to.toUpperCase()}`} subtitle="Select multiple for batch conversion" />
          ) : (
            <Panel title={`Files (${items.length})`}>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 rounded-xl border p-2.5" style={{ borderColor: "var(--ali-border)" }}>
                    <img src={it.result?.url || it.url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover ali-checker" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{changeExtension(it.file.name, to)}</div>
                      <div className="text-xs" style={{ color: "var(--ali-muted)" }}>
                        {formatBytes(it.size)}{it.result && ` → ${formatBytes(it.result.size)}`}
                      </div>
                    </div>
                    <button onClick={() => downloadOne(it)} disabled={!it.result} className="shrink-0 rounded-lg p-2" style={{ color: "var(--ali-teal-700)" }} aria-label="Download">
                      <Download size={18} />
                    </button>
                    <button onClick={() => removeItem(it.id)} className="shrink-0 rounded-lg p-2 opacity-60 hover:opacity-100" aria-label="Remove">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <label className="ali-btn ali-btn-ghost cursor-pointer">
                  <Plus size={15} /> Add more
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => { addFiles(Array.from(e.target.files)); e.target.value = ""; }} />
                </label>
                <button onClick={downloadAll} disabled={busy || !items.some((i) => i.result)} className="ali-btn ali-btn-primary">
                  {items.length > 1 ? <FileDown size={16} /> : <Download size={16} />}
                  {items.length > 1 ? "Download all (ZIP)" : "Download"}
                </button>
                {busy && <span className="self-center text-sm" style={{ color: "var(--ali-muted)" }}>Converting…</span>}
              </div>
            </Panel>
          )}
        </div>
      </ToolLayout>
    </ToolShell>
  );
}
