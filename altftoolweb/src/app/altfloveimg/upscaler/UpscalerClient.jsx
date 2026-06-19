"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, Cpu, Maximize2 } from "lucide-react";
import ToolShell, { ToolLayout, Panel } from "../components/shared/ToolShell";
import Dropzone from "../components/shared/Dropzone";
import BeforeAfter from "../components/shared/BeforeAfter";
import { RangeField, SegMenu } from "../components/shared/Controls";
import { StatBadge } from "../components/shared/PreviewFrame";
import { ErrorBanner, Spinner } from "../components/shared/States";
import { useImage } from "../lib/useImage";
import { enhanceImage, UPSCALE_ENGINE } from "../lib/aiEngines";
import { downloadBlob, suffixName, formatBytes } from "../lib/utils";

export default function UpscalerClient() {
  const { image, error, setError, load, reset } = useImage();
  const [factor, setFactor] = useState(2);
  const [sharpen, setSharpen] = useState(25);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!image) return;
    setRunning(true);
    setError("");
    try {
      const { blob, width, height } = await enhanceImage(image.file, { factor, sharpen });
      setResult((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return { blob, url: URL.createObjectURL(blob), size: blob.size, width, height };
      });
    } catch (e) {
      setError(e.message || "Enhancement failed. Very large images may exceed browser limits.");
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  const download = () => result && downloadBlob(result.blob, suffixName(image.file.name, `${factor}x`, "png"));
  const handleReset = () => { setResult(null); reset(); };

  const sidebar = (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl p-4" style={{ background: "var(--ali-grad)", color: "#fff" }}>
        <div className="flex items-center gap-2 font-semibold"><Sparkles size={18} /> Enhance & enlarge</div>
        <p className="mt-1.5 text-sm text-white/90">Upscale up to 4× with detail-preserving sharpening.</p>
      </div>
      <div>
        <span className="mb-1.5 block text-sm font-medium">Scale factor</span>
        <SegMenu
          columns={3}
          value={factor}
          onChange={setFactor}
          options={[
            { value: 2, label: "2×" },
            { value: 3, label: "3×" },
            { value: 4, label: "4×" },
          ]}
        />
      </div>
      <RangeField label="Detail / sharpen" value={sharpen} min={0} max={80} unit="%" onChange={setSharpen} />
      <button onClick={run} disabled={!image || running} className="ali-btn ali-btn-primary w-full">
        <Maximize2 size={16} /> {running ? "Enhancing…" : "Upscale image"}
      </button>
      {image && (
        <div className="grid grid-cols-2 gap-2">
          <StatBadge label="Original" value={`${image.width}×${image.height}`} />
          <StatBadge label="Target" value={`${image.width * factor}×${image.height * factor}`} accent />
        </div>
      )}
      <ul className="flex flex-col gap-2.5 text-sm" style={{ color: "var(--ali-muted)" }}>
        <li className="flex items-center gap-2"><ShieldCheck size={15} style={{ color: "var(--ali-teal)" }} /> No uploads — on-device</li>
        <li className="flex items-center gap-2"><Cpu size={15} style={{ color: "var(--ali-teal)" }} /> Engine: {UPSCALE_ENGINE}</li>
      </ul>
    </div>
  );

  return (
    <ToolShell slug="upscaler">
      {!image ? (
        <>
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          <Dropzone onFiles={(f) => load(f[0])} slug="upscaler" title="Drop an image to upscale" subtitle="Smaller source images see the biggest improvement" />
        </>
      ) : (
        <ToolLayout sidebar={sidebar}>
          <div className="flex flex-col gap-4">
            <ErrorBanner message={error} onDismiss={() => setError("")} />
            <Panel>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">{result ? "Drag to compare" : "Preview"}</span>
                <div className="flex gap-2">
                  <button onClick={handleReset} className="ali-btn ali-btn-ghost" style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem" }}>New image</button>
                  {result && <button onClick={download} className="ali-btn ali-btn-primary" style={{ padding: "0.45rem 0.9rem", fontSize: "0.82rem" }}>Download</button>}
                </div>
              </div>
              {running ? (
                <div className="grid place-items-center rounded-2xl ali-checker" style={{ minHeight: 360 }}>
                  <Spinner label="Enhancing on your device…" />
                </div>
              ) : result ? (
                <>
                  <BeforeAfter before={image.url} after={result.url} beforeLabel="Original" afterLabel={`${factor}× enhanced`} />
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <StatBadge label="New dimensions" value={`${result.width}×${result.height}`} accent />
                    <StatBadge label="File size" value={formatBytes(result.size)} />
                    <StatBadge label="Scale" value={`${factor}×`} />
                  </div>
                </>
              ) : (
                <div className="grid place-items-center rounded-2xl ali-checker p-4" style={{ minHeight: 360 }}>
                  <img src={image.url} alt="" className="max-h-[420px] max-w-full" />
                </div>
              )}
            </Panel>
          </div>
        </ToolLayout>
      )}
    </ToolShell>
  );
}
