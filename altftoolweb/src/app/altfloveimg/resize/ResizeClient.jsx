"use client";

import { useEffect, useState } from "react";
import ToolShell, { ToolLayout } from "../components/shared/ToolShell";
import Dropzone from "../components/shared/Dropzone";
import PreviewFrame, { StatBadge } from "../components/shared/PreviewFrame";
import { NumberField, SelectField, RangeField, ToggleRow } from "../components/shared/Controls";
import { ErrorBanner } from "../components/shared/States";
import { useImage } from "../lib/useImage";
import { resize, MIME } from "../lib/imageProcessing";
import { formatBytes, downloadBlob, suffixName } from "../lib/utils";

export default function ResizeClient() {
  const { image, error, setError, load, reset } = useImage();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [percent, setPercent] = useState(100);
  const [format, setFormat] = useState("png");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const ratio = image ? image.width / image.height : 1;

  useEffect(() => {
    if (image) {
      setWidth(image.width);
      setHeight(image.height);
      setPercent(100);
      setFormat(image.file.type === "image/jpeg" ? "jpg" : image.file.type === "image/webp" ? "webp" : "png");
    }
  }, [image]);

  const onWidth = (w) => {
    setWidth(w);
    if (lock && w) setHeight(Math.round(w / ratio));
    if (image) setPercent(Math.round((w / image.width) * 100));
  };
  const onHeight = (h) => {
    setHeight(h);
    if (lock && h) setWidth(Math.round(h * ratio));
    if (image) setPercent(Math.round(((h * ratio) / image.width) * 100));
  };
  const onPercent = (p) => {
    setPercent(p);
    if (image) {
      setWidth(Math.round((image.width * p) / 100));
      setHeight(Math.round((image.height * p) / 100));
    }
  };

  // live preview
  useEffect(() => {
    if (!image || !width || !height) return;
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const { blob } = await resize(image.img, { width, height, type: MIME[format] });
        if (cancelled) return;
        setResult((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url);
          const url = URL.createObjectURL(blob);
          return { blob, url, size: blob.size, width, height };
        });
      } catch (e) {
        setError(e.message);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, width, height, format]);

  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  const download = () => {
    if (!result) return;
    const ext = format === "jpg" ? "jpg" : format;
    downloadBlob(result.blob, suffixName(image.file.name, `${width}x${height}`, ext));
  };

  const handleReset = () => { setResult(null); reset(); };

  const sidebar = (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Width" value={width} min={1} max={20000} onChange={onWidth} />
        <NumberField label="Height" value={height} min={1} max={20000} onChange={onHeight} />
      </div>
      <ToggleRow label={lock ? "Aspect ratio locked" : "Aspect ratio unlocked"} checked={lock} onChange={setLock} />
      <RangeField label="Scale" value={percent} min={1} max={300} unit="%" onChange={onPercent} />
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
      {image && (
        <div className="grid grid-cols-2 gap-2">
          <StatBadge label="Original" value={`${image.width}×${image.height}`} />
          <StatBadge label="New size" value={`${width}×${height}`} accent />
        </div>
      )}
    </div>
  );

  return (
    <ToolShell slug="resize">
      {!image ? (
        <>
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          <Dropzone onFiles={(f) => load(f[0])} slug="resize" title="Drop an image to resize" />
        </>
      ) : (
        <ToolLayout sidebar={sidebar}>
          <div className="flex flex-col gap-4">
            <ErrorBanner message={error} onDismiss={() => setError("")} />
            <PreviewFrame
              title="Live preview"
              onReset={handleReset}
              onDownload={download}
              busy={busy || !result}
              footer={
                result && (
                  <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--ali-muted)" }}>
                    <span>Output: <strong style={{ color: "var(--ali-text)" }}>{result.width}×{result.height}px</strong></span>
                    <span>Size: <strong style={{ color: "var(--ali-text)" }}>{formatBytes(result.size)}</strong></span>
                  </div>
                )
              }
            >
              <img src={result?.url || image.url} alt="preview" className="max-h-[460px] max-w-full" />
            </PreviewFrame>
          </div>
        </ToolLayout>
      )}
    </ToolShell>
  );
}
