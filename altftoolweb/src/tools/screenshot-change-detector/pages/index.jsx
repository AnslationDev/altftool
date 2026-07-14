"use client";

import { useState, useRef, useCallback } from "react";
import {
  ImagePlus,
  Upload,
  Trash2,
  Download,
  ScanEye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function UploadZone({ label, image, onImage, onClear, id }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => onImage(e.target.result);
      reader.readAsDataURL(file);
    },
    [onImage]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--foreground)]">
        {label}
      </label>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors focus:outline-none focus:ring-3 focus:ring-[var(--primary)] ${
          dragOver
            ? "border-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[var(--border)] bg-[var(--muted)]/30 hover:border-[var(--primary)]"
        }`}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
        {image ? (
          <img
            src={image}
            alt={`${label} preview`}
            className="max-h-[200px] max-w-full rounded-md object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <Upload className="h-8 w-8 text-[var(--muted-foreground)]" />
            <span className="text-sm text-[var(--muted-foreground)]">
              Drop an image or click to browse
            </span>
          </div>
        )}
      </div>
      {image && (
        <button
          type="button"
          onClick={onClear}
          className="btn-secondary flex items-center justify-center gap-2 text-sm"
          aria-label={`Clear ${label}`}
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  );
}

export default function ToolHome() {
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [diffDataUrl, setDiffDataUrl] = useState(null);
  const [stats, setStats] = useState(null);
  const [opacity, setOpacity] = useState(50);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);
  const [overlayMode, setOverlayMode] = useState(false);

  const beforeCanvasRef = useRef(null);
  const afterCanvasRef = useRef(null);
  const diffCanvasRef = useRef(null);

  const handleBeforeImage = useCallback((src) => {
    setBeforeImage(src);
    setDiffDataUrl(null);
    setStats(null);
    setError(null);
  }, []);

  const handleAfterImage = useCallback((src) => {
    setAfterImage(src);
    setDiffDataUrl(null);
    setStats(null);
    setError(null);
  }, []);

  const clearBefore = useCallback(() => {
    setBeforeImage(null);
    setDiffDataUrl(null);
    setStats(null);
    setError(null);
  }, []);

  const clearAfter = useCallback(() => {
    setAfterImage(null);
    setDiffDataUrl(null);
    setStats(null);
    setError(null);
  }, []);

  const clearAll = useCallback(() => {
    setBeforeImage(null);
    setAfterImage(null);
    setDiffDataUrl(null);
    setStats(null);
    setError(null);
    setOverlayMode(false);
  }, []);

  const compare = useCallback(() => {
    if (!beforeImage || !afterImage) {
      setError("Please upload both Before and After images.");
      return;
    }
    setError(null);
    setComparing(true);
    setOverlayMode(false);

    const beforeImg = new Image();
    const afterImg = new Image();
    let loaded = 0;

    const run = () => {
      loaded++;
      if (loaded < 2) return;

      const w = Math.max(beforeImg.naturalWidth, afterImg.naturalWidth);
      const h = Math.max(beforeImg.naturalHeight, afterImg.naturalHeight);

      const bc = beforeCanvasRef.current;
      const ac = afterCanvasRef.current;
      const dc = diffCanvasRef.current;
      if (!bc || !ac || !dc) { setComparing(false); return; }

      bc.width = w; bc.height = h;
      ac.width = w; ac.height = h;
      dc.width = w; dc.height = h;

      const bCtx = bc.getContext("2d");
      const aCtx = ac.getContext("2d");
      const dCtx = dc.getContext("2d");
      if (!bCtx || !aCtx || !dCtx) { setComparing(false); return; }

      bCtx.drawImage(beforeImg, 0, 0, w, h);
      aCtx.drawImage(afterImg, 0, 0, w, h);

      const bData = bCtx.getImageData(0, 0, w, h).data;
      const aData = aCtx.getImageData(0, 0, w, h).data;
      const dData = dCtx.createImageData(w, h);
      const pixels = dData.data;

      let changedPixels = 0;
      const totalPixels = w * h;

      for (let i = 0; i < totalPixels; i++) {
        const idx = i * 4;
        const dr = Math.abs(bData[idx] - aData[idx]);
        const dg = Math.abs(bData[idx + 1] - aData[idx + 1]);
        const db = Math.abs(bData[idx + 2] - aData[idx + 2]);
        const diff = dr + dg + db;

        if (diff > 30) {
          changedPixels++;
          pixels[idx] = 255;
          pixels[idx + 1] = 0;
          pixels[idx + 2] = 0;
          pixels[idx + 3] = 200;
        } else {
          pixels[idx] = bData[idx];
          pixels[idx + 1] = bData[idx + 1];
          pixels[idx + 2] = bData[idx + 2];
          pixels[idx + 3] = 255;
        }
      }

      dCtx.putImageData(dData, 0, 0);
      setDiffDataUrl(dc.toDataURL());

      const pct = totalPixels > 0 ? ((changedPixels / totalPixels) * 100) : 0;
      setStats({ totalPixels, changedPixels, unchangedPixels: totalPixels - changedPixels, percentage: pct });
      setComparing(false);
    };

    beforeImg.onload = run;
    afterImg.onload = run;
    beforeImg.onerror = () => { setError("Failed to load Before image."); setComparing(false); };
    afterImg.onerror = () => { setError("Failed to load After image."); setComparing(false); };
    beforeImg.src = beforeImage;
    afterImg.src = afterImage;
  }, [beforeImage, afterImage]);

  const downloadDiff = useCallback(() => {
    if (!diffDataUrl) return;
    const a = document.createElement("a");
    a.href = diffDataUrl;
    a.download = "screenshot-diff.png";
    a.click();
  }, [diffDataUrl]);

  const copyReport = useCallback(async () => {
    if (!stats) return;
    const lines = [
      "Screenshot Change Detection Report",
      "--------------------------------",
      `Total Pixels: ${stats.totalPixels.toLocaleString()}`,
      `Changed Pixels: ${stats.changedPixels.toLocaleString()}`,
      `Unchanged Pixels: ${stats.unchangedPixels.toLocaleString()}`,
      `Change: ${stats.percentage.toFixed(2)}%`,
      "",
      "Generated by ALTFTool Screenshot Change Detector",
    ];
    const ok = await safeCopyText(lines.join("\n"));
    if (ok) setError(null);
  }, [stats]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ScanEye className="h-4 w-4" />
            Developer Tool
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            Screenshot Change Detector
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Compare two screenshots and detect visual differences with pixel-level accuracy.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          <UploadZone
            label="Before"
            image={beforeImage}
            onImage={handleBeforeImage}
            onClear={clearBefore}
            id="before-upload"
          />
          <UploadZone
            label="After"
            image={afterImage}
            onImage={handleAfterImage}
            onClear={clearAfter}
            id="after-upload"
          />
        </section>

        {beforeImage && afterImage && (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={compare}
                disabled={comparing}
                className="btn-primary flex items-center gap-2"
              >
                {comparing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ScanEye className="h-4 w-4" />
                )}
                {comparing ? "Comparing..." : "Compare"}
              </button>
              <button
                type="button"
                onClick={() => setOverlayMode((p) => !p)}
                className="btn-secondary flex items-center gap-2"
              >
                {overlayMode ? "Side by Side" : "Overlay View"}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="btn-secondary flex items-center gap-2 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>

            {overlayMode ? (
              <div className="relative mx-auto" style={{ maxWidth: 600 }}>
                {beforeImage && (
                  <img
                    src={beforeImage}
                    alt="Before overlay"
                    className="w-full rounded-lg border border-[var(--border)]"
                  />
                )}
                {afterImage && (
                  <img
                    src={afterImage}
                    alt="After overlay"
                    className="absolute inset-0 w-full rounded-lg border border-[var(--border)]"
                    style={{ opacity: opacity / 100 }}
                  />
                )}
                <div className="mt-4 flex items-center gap-4">
                  <label htmlFor="opacity-slider" className="text-sm font-medium text-[var(--foreground)]">
                    Opacity: {opacity}%
                  </label>
                  <input
                    id="opacity-slider"
                    type="range"
                    min={0}
                    max={100}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="h-2 w-full max-w-xs cursor-pointer appearance-none rounded-full bg-[var(--muted)] accent-[var(--primary)] focus:outline-none focus:ring-3 focus:ring-[var(--primary)]"
                    aria-label="Overlay opacity"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-center gap-6">
                {beforeImage && (
                  <div className="flex-1 text-center">
                    <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Before</p>
                    <img src={beforeImage} alt="Before" className="mx-auto max-h-[300px] rounded-lg border border-[var(--border)] object-contain" />
                  </div>
                )}
                {afterImage && (
                  <div className="flex-1 text-center">
                    <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">After</p>
                    <img src={afterImage} alt="After" className="mx-auto max-h-[300px] rounded-lg border border-[var(--border)] object-contain" />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <canvas ref={beforeCanvasRef} className="hidden" />
        <canvas ref={afterCanvasRef} className="hidden" />
        <canvas ref={diffCanvasRef} className="hidden" />

        {diffDataUrl && stats && (
          <>
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-4 text-lg font-semibold">Diff Result</h2>
              <div className="flex flex-wrap items-start justify-center gap-6">
                <div className="flex-1 text-center">
                  <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Difference Map</p>
                  <img
                    src={diffDataUrl}
                    alt="Difference overlay"
                    className="mx-auto max-h-[400px] rounded-lg border border-[var(--border)] object-contain"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-4 text-lg font-semibold">Statistics</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ["Total Pixels", stats.totalPixels.toLocaleString(), "text-[var(--foreground)]"],
                  ["Changed", stats.changedPixels.toLocaleString(), "text-red-500"],
                  ["Unchanged", stats.unchangedPixels.toLocaleString(), "text-green-500"],
                  ["Change", `${stats.percentage.toFixed(2)}%`, "text-[var(--primary)]"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-center"
                  >
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={downloadDiff} className="btn-primary flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Diff PNG
              </button>
              <button type="button" onClick={copyReport} className="btn-secondary flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Copy Report
              </button>
              <button type="button" onClick={clearAll} className="btn-secondary flex items-center gap-2 text-red-600">
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
