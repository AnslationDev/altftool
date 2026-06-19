"use client";

import { useEffect, useState } from "react";
import { RotateCw, RotateCcw, FlipHorizontal2, FlipVertical2 } from "lucide-react";
import ToolShell, { ToolLayout, Panel } from "../components/shared/ToolShell";
import Dropzone from "../components/shared/Dropzone";
import PreviewFrame, { StatBadge } from "../components/shared/PreviewFrame";
import { SelectField } from "../components/shared/Controls";
import { ErrorBanner } from "../components/shared/States";
import { useImage } from "../lib/useImage";
import { transform, MIME } from "../lib/imageProcessing";
import { downloadBlob, suffixName, formatBytes } from "../lib/utils";

export default function RotateClient() {
  const { image, error, setError, load, reset } = useImage();
  const [degrees, setDegrees] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [format, setFormat] = useState("png");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (image) setFormat(image.file.type === "image/jpeg" ? "jpg" : image.file.type === "image/webp" ? "webp" : "png");
  }, [image]);

  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    setBusy(true);
    (async () => {
      try {
        const { blob, width, height } = await transform(image.img, { degrees, flipH, flipV, type: MIME[format] });
        if (cancelled) return;
        setResult((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url);
          return { blob, url: URL.createObjectURL(blob), size: blob.size, width, height };
        });
      } catch (e) { setError(e.message); }
      finally { if (!cancelled) setBusy(false); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, degrees, flipH, flipV, format]);

  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  const rotate = (delta) => setDegrees((d) => (((d + delta) % 360) + 360) % 360);

  const download = () => {
    if (!result) return;
    const ext = format === "jpg" ? "jpg" : format;
    downloadBlob(result.blob, suffixName(image.file.name, "rotated", ext));
  };
  const handleReset = () => { setDegrees(0); setFlipH(false); setFlipV(false); setResult(null); reset(); };

  const sidebar = (
    <div className="flex flex-col gap-5">
      <div>
        <span className="mb-1.5 block text-sm font-medium">Rotate</span>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => rotate(-90)} className="ali-chip justify-center !rounded-xl py-2.5"><RotateCcw size={16} /> Left 90°</button>
          <button onClick={() => rotate(90)} className="ali-chip justify-center !rounded-xl py-2.5"><RotateCw size={16} /> Right 90°</button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[90, 180, 270].map((d) => (
            <button key={d} onClick={() => setDegrees(d)} data-active={degrees === d} className="ali-chip justify-center !rounded-xl py-2">{d}°</button>
          ))}
        </div>
      </div>
      <div>
        <span className="mb-1.5 block text-sm font-medium">Flip</span>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setFlipH((v) => !v)} data-active={flipH} className="ali-chip justify-center !rounded-xl py-2.5"><FlipHorizontal2 size={16} /> Horizontal</button>
          <button onClick={() => setFlipV((v) => !v)} data-active={flipV} className="ali-chip justify-center !rounded-xl py-2.5"><FlipVertical2 size={16} /> Vertical</button>
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
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <StatBadge label="Rotation" value={`${degrees}°`} accent />
          <StatBadge label="Output" value={`${result.width}×${result.height}`} />
        </div>
      )}
    </div>
  );

  return (
    <ToolShell slug="rotate">
      {!image ? (
        <>
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          <Dropzone onFiles={(f) => load(f[0])} slug="rotate" title="Drop an image to rotate or flip" />
        </>
      ) : (
        <ToolLayout sidebar={sidebar}>
          <div className="flex flex-col gap-4">
            <ErrorBanner message={error} onDismiss={() => setError("")} />
            <PreviewFrame
              title="Preview"
              onReset={handleReset}
              onDownload={download}
              busy={busy || !result}
              footer={result && (
                <span className="text-sm" style={{ color: "var(--ali-muted)" }}>
                  {result.width}×{result.height}px · {formatBytes(result.size)}
                </span>
              )}
            >
              <img src={result?.url || image.url} alt="preview" className="max-h-[460px] max-w-full transition-transform" />
            </PreviewFrame>
          </div>
        </ToolLayout>
      )}
    </ToolShell>
  );
}
