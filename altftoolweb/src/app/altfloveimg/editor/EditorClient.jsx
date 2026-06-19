"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import ToolShell, { ToolLayout, Panel } from "../components/shared/ToolShell";
import Dropzone from "../components/shared/Dropzone";
import PreviewFrame from "../components/shared/PreviewFrame";
import { RangeField, SelectField } from "../components/shared/Controls";
import { ErrorBanner } from "../components/shared/States";
import { useImage } from "../lib/useImage";
import { applyFilters, buildFilterString, MIME } from "../lib/imageProcessing";
import { downloadBlob, suffixName } from "../lib/utils";

const DEFAULTS = {
  brightness: 100, contrast: 100, saturation: 100, exposure: 100,
  blur: 0, sharpen: 0, grayscale: 0, sepia: 0,
};

export default function EditorClient() {
  const { image, error, setError, load, reset } = useImage();
  const [adj, setAdj] = useState(DEFAULTS);
  const [format, setFormat] = useState("png");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (image) setFormat(image.file.type === "image/jpeg" ? "jpg" : "png");
  }, [image]);

  const set = (k) => (v) => setAdj((p) => ({ ...p, [k]: v }));
  const cssFilter = useMemo(() => buildFilterString(adj), [adj]);

  const download = async () => {
    if (!image) return;
    setBusy(true);
    try {
      const { blob } = await applyFilters(image.img, adj, { type: MIME[format] });
      downloadBlob(blob, suffixName(image.file.name, "edited", format === "jpg" ? "jpg" : format));
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const isDirty = JSON.stringify(adj) !== JSON.stringify(DEFAULTS);
  const handleReset = () => { setAdj(DEFAULTS); reset(); };

  const sidebar = (
    <div className="flex flex-col gap-4">
      <RangeField label="Brightness" value={adj.brightness} min={0} max={200} unit="%" onChange={set("brightness")} />
      <RangeField label="Contrast" value={adj.contrast} min={0} max={200} unit="%" onChange={set("contrast")} />
      <RangeField label="Saturation" value={adj.saturation} min={0} max={200} unit="%" onChange={set("saturation")} />
      <RangeField label="Exposure" value={adj.exposure} min={50} max={150} unit="%" onChange={set("exposure")} />
      <RangeField label="Blur" value={adj.blur} min={0} max={20} unit="px" onChange={set("blur")} />
      <RangeField label="Sharpen" value={adj.sharpen} min={0} max={100} unit="%" onChange={set("sharpen")} />
      <RangeField label="Grayscale" value={adj.grayscale} min={0} max={100} unit="%" onChange={set("grayscale")} />
      <RangeField label="Sepia" value={adj.sepia} min={0} max={100} unit="%" onChange={set("sepia")} />
      <SelectField label="Output format" value={format} onChange={setFormat}
        options={[{ value: "png", label: "PNG" }, { value: "jpg", label: "JPG" }, { value: "webp", label: "WEBP" }]} />
      <button onClick={() => setAdj(DEFAULTS)} disabled={!isDirty} className="ali-btn ali-btn-ghost w-full">
        <RotateCcw size={15} /> Reset adjustments
      </button>
    </div>
  );

  return (
    <ToolShell slug="editor">
      {!image ? (
        <>
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          <Dropzone onFiles={(f) => load(f[0])} slug="editor" title="Drop an image to edit" />
        </>
      ) : (
        <ToolLayout sidebar={sidebar}>
          <div className="flex flex-col gap-4">
            <ErrorBanner message={error} onDismiss={() => setError("")} />
            <PreviewFrame title="Real-time preview" onReset={handleReset} onDownload={download} busy={busy}
              footer={<span className="text-sm" style={{ color: "var(--ali-muted)" }}>Adjustments apply instantly · sharpen is rendered on export.</span>}>
              <img src={image.url} alt="preview" className="max-h-[460px] max-w-full" style={{ filter: cssFilter }} />
            </PreviewFrame>
          </div>
        </ToolLayout>
      )}
    </ToolShell>
  );
}
