"use client";

import { useEffect, useState } from "react";
import { Wand2, Sparkles, ShieldCheck, Cpu } from "lucide-react";
import ToolShell, { ToolLayout, Panel } from "../components/shared/ToolShell";
import Dropzone from "../components/shared/Dropzone";
import BeforeAfter from "../components/shared/BeforeAfter";
import { ErrorBanner, ProgressBar } from "../components/shared/States";
import { useImage } from "../lib/useImage";
import { removeBackground, BACKGROUND_ENGINE } from "../lib/aiEngines";
import { downloadBlob, suffixName } from "../lib/utils";

export default function BackgroundRemoverClient() {
  const { image, error, setError, load, reset } = useImage();
  const [status, setStatus] = useState("idle"); // idle | running | done | error
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!image) return;
    setStatus("running");
    setProgress(0);
    setError("");
    try {
      const { blob } = await removeBackground(image.file, {
        onProgress: (p) => setProgress(p),
      });
      setResult((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return { blob, url: URL.createObjectURL(blob) };
      });
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(
        "Background removal couldn't run in this browser. The on-device model needs a modern browser and a one-time download. Please try again or use a desktop browser."
      );
    }
  };

  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  const download = () => result && downloadBlob(result.blob, suffixName(image.file.name, "no-bg", "png"));
  const handleReset = () => { setResult(null); setStatus("idle"); reset(); };

  const sidebar = (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl p-4" style={{ background: "var(--ali-grad)", color: "#fff" }}>
        <div className="flex items-center gap-2 font-semibold"><Sparkles size={18} /> Smart cutout</div>
        <p className="mt-1.5 text-sm text-white/90">
          Removes the background automatically and gives you a transparent PNG.
        </p>
      </div>
      <button onClick={run} disabled={!image || status === "running"} className="ali-btn ali-btn-primary w-full">
        <Wand2 size={16} /> {status === "running" ? "Removing…" : status === "done" ? "Run again" : "Remove background"}
      </button>
      {status === "running" && <ProgressBar value={progress} label="Processing on your device" />}
      <ul className="flex flex-col gap-2.5 text-sm" style={{ color: "var(--ali-muted)" }}>
        <li className="flex items-center gap-2"><ShieldCheck size={15} style={{ color: "var(--ali-teal)" }} /> Runs entirely on your device</li>
        <li className="flex items-center gap-2"><Cpu size={15} style={{ color: "var(--ali-teal)" }} /> Engine: {BACKGROUND_ENGINE}</li>
        <li className="flex items-center gap-2"><Sparkles size={15} style={{ color: "var(--ali-teal)" }} /> Exports transparent PNG</li>
      </ul>
    </div>
  );

  return (
    <ToolShell slug="background-remover">
      {!image ? (
        <>
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          <Dropzone onFiles={(f) => load(f[0])} slug="background-remover" title="Drop an image to remove its background" subtitle="Photos of people, products and objects work best" />
        </>
      ) : (
        <ToolLayout sidebar={sidebar}>
          <div className="flex flex-col gap-4">
            <ErrorBanner message={error} onDismiss={() => setError("")} />
            <Panel>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">{status === "done" ? "Drag to compare" : "Original"}</span>
                <div className="flex gap-2">
                  <button onClick={handleReset} className="ali-btn ali-btn-ghost" style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem" }}>New image</button>
                  {result && <button onClick={download} className="ali-btn ali-btn-primary" style={{ padding: "0.45rem 0.9rem", fontSize: "0.82rem" }}>Download PNG</button>}
                </div>
              </div>
              {result ? (
                <BeforeAfter before={image.url} after={result.url} beforeLabel="Original" afterLabel="Removed" />
              ) : (
                <div className="grid place-items-center rounded-2xl ali-checker p-4" style={{ minHeight: 360 }}>
                  <img src={image.url} alt="" className="max-h-[420px] max-w-full" style={{ opacity: status === "running" ? 0.5 : 1 }} />
                </div>
              )}
            </Panel>
          </div>
        </ToolLayout>
      )}
    </ToolShell>
  );
}
