"use client";

import { useCallback, useState } from "react";
import { Download } from "lucide-react";
import ToolShell, { ToolLayout, Panel } from "../components/shared/ToolShell";
import Dropzone from "../components/shared/Dropzone";
import { StatBadge } from "../components/shared/PreviewFrame";
import { SelectField } from "../components/shared/Controls";
import { ErrorBanner } from "../components/shared/States";
import Cropper from "./Cropper";
import { useImage } from "../lib/useImage";
import { crop, MIME } from "../lib/imageProcessing";
import { CROP_PRESETS } from "../data/tools";
import { downloadBlob, suffixName } from "../lib/utils";

export default function CropClient() {
  const { image, error, setError, load, reset } = useImage();
  const [presetId, setPresetId] = useState("free");
  const [region, setRegion] = useState(null);
  const [format, setFormat] = useState("png");
  const [busy, setBusy] = useState(false);

  const preset = CROP_PRESETS.find((p) => p.id === presetId);
  const onChange = useCallback((r) => setRegion(r), []);

  const apply = async () => {
    if (!image || !region) return;
    setBusy(true);
    setError("");
    try {
      const { blob } = await crop(image.img, { ...region, type: MIME[format] });
      const ext = format === "jpg" ? "jpg" : format;
      downloadBlob(blob, suffixName(image.file.name, "cropped", ext));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const sidebar = (
    <div className="flex flex-col gap-5">
      <div>
        <span className="mb-1.5 block text-sm font-medium">Aspect ratio</span>
        <div className="grid grid-cols-2 gap-2">
          {CROP_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPresetId(p.id)}
              data-active={presetId === p.id}
              className="ali-chip flex-col items-start !rounded-xl py-2"
              style={{ alignItems: "flex-start" }}
            >
              <span className="text-sm font-semibold">{p.label}</span>
              <span className="text-[11px]" style={{ color: presetId === p.id ? "rgba(255,255,255,0.85)" : "var(--ali-muted)" }}>{p.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <SelectField
        label="Output format"
        value={format}
        onChange={setFormat}
        options={[
          { value: "png", label: "PNG" },
          { value: "jpg", label: "JPG" },
          { value: "webp", label: "WEBP" },
        ]}
      />
      {region && (
        <div className="grid grid-cols-2 gap-2">
          <StatBadge label="Crop size" value={`${region.width}×${region.height}`} accent />
          <StatBadge label="Position" value={`${region.x},${region.y}`} />
        </div>
      )}
      <button onClick={apply} disabled={busy || !region} className="ali-btn ali-btn-primary w-full">
        <Download size={16} /> Crop & download
      </button>
    </div>
  );

  return (
    <ToolShell slug="crop">
      {!image ? (
        <>
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          <Dropzone onFiles={(f) => load(f[0])} slug="crop" title="Drop an image to crop" />
        </>
      ) : (
        <ToolLayout sidebar={sidebar}>
          <div className="flex flex-col gap-4">
            <ErrorBanner message={error} onDismiss={() => setError("")} />
            <Panel>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Drag to crop · resize with the handles</span>
                <button onClick={reset} className="ali-btn ali-btn-ghost" style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem" }}>
                  New image
                </button>
              </div>
              <div className="grid place-items-center rounded-2xl ali-checker p-4" style={{ minHeight: 360 }}>
                <Cropper
                  key={`${image.url}-${presetId}`}
                  src={image.url}
                  naturalW={image.width}
                  naturalH={image.height}
                  ratio={preset?.ratio || null}
                  onChange={onChange}
                />
              </div>
            </Panel>
          </div>
        </ToolLayout>
      )}
    </ToolShell>
  );
}
