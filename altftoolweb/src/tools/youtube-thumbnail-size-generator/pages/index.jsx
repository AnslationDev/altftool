"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, Upload, Youtube } from "lucide-react";

import {
  EXPORT_FORMATS,
  MAX_BYTES,
  PRESETS,
  checkAgainstSpec,
  formatBytes,
  overlayGuides,
  planExport,
  ratioLabel,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

/** Refuse absurd uploads before they reach the decoder. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const STATUS_STYLE = {
  pass: "bg-[var(--success-soft)] text-[var(--success)]",
  warn: "bg-[var(--warning-soft)] text-[var(--warning)]",
  fail: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export default function ToolHome() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [presetId, setPresetId] = useState("hd");
  const [mode, setMode] = useState("cover");
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState("0.9");
  const [padColor, setPadColor] = useState("black");
  const [showGuides, setShowGuides] = useState(true);
  const [exportBytes, setExportBytes] = useState(null);
  const [copied, setCopied] = useState(false);

  const activeFormat = EXPORT_FORMATS.find((item) => item.id === format) ?? EXPORT_FORMATS[0];

  const plan = useMemo(
    () =>
      planExport({
        sourceWidth: meta?.width,
        sourceHeight: meta?.height,
        presetId,
        mode,
      }),
    [meta, presetId, mode]
  );

  const hasPlan = Boolean(meta) && !plan.error;

  const spec = useMemo(() => {
    if (!hasPlan) return null;
    return checkAgainstSpec({
      width: plan.target.width,
      height: plan.target.height,
      bytes: exportBytes,
    });
  }, [hasPlan, plan, exportBytes]);

  const sourceSpec = useMemo(() => {
    if (!meta) return null;
    return checkAgainstSpec({ width: meta.width, height: meta.height, bytes: meta.bytes });
  }, [meta]);

  const guides = useMemo(
    () => (hasPlan ? overlayGuides(plan.target.width, plan.target.height) : null),
    [hasPlan, plan]
  );

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLoadError("That file is not an image. Choose a JPG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setLoadError(`Images must be under ${formatBytes(MAX_UPLOAD_BYTES)}.`);
      return;
    }
    const url = URL.createObjectURL(file);
    const nextImage = new Image();
    nextImage.onload = () => {
      setImage(nextImage);
      setMeta({
        name: file.name,
        bytes: file.size,
        type: file.type,
        width: nextImage.naturalWidth,
        height: nextImage.naturalHeight,
      });
      setLoadError("");
      setCopied(false);
    };
    nextImage.onerror = () => {
      URL.revokeObjectURL(url);
      setLoadError("That image could not be decoded. Try a different file.");
    };
    nextImage.src = url;
  }, []);

  useEffect(() => {
    return () => {
      if (image?.src?.startsWith("blob:")) URL.revokeObjectURL(image.src);
    };
  }, [image]);

  // Draw the export frame, then measure what it encodes to.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image || !hasPlan) return undefined;
    const { width, height } = plan.target;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    ctx.clearRect(0, 0, width, height);
    if (plan.mode === "contain") {
      ctx.fillStyle = padColor;
      ctx.fillRect(0, 0, width, height);
      const { dx, dy, dw, dh } = plan.geometry;
      ctx.drawImage(image, dx, dy, dw, dh);
    } else {
      const { sx, sy, sw, sh } = plan.geometry;
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
    }

    let cancelled = false;
    canvas.toBlob(
      (blob) => {
        if (!cancelled) setExportBytes(blob ? blob.size : null);
      },
      activeFormat.id,
      activeFormat.lossy ? Number(quality) : undefined
    );

    if (showGuides && guides && !guides.error) {
      const { badge } = guides;
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "black";
      ctx.fillRect(badge.x, badge.y, badge.width, badge.height);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "white";
      ctx.lineWidth = Math.max(2, width / 400);
      ctx.setLineDash([width / 60, width / 90]);
      ctx.strokeRect(badge.x, badge.y, badge.width, badge.height);
      ctx.restore();
    }

    return () => {
      cancelled = true;
    };
  }, [image, hasPlan, plan, activeFormat, quality, padColor, showGuides, guides]);

  const download = () => {
    if (!hasPlan || !image) return;
    const output = document.createElement("canvas");
    output.width = plan.target.width;
    output.height = plan.target.height;
    const ctx = output.getContext("2d");
    if (!ctx) return;
    if (plan.mode === "contain") {
      ctx.fillStyle = padColor;
      ctx.fillRect(0, 0, output.width, output.height);
      const { dx, dy, dw, dh } = plan.geometry;
      ctx.drawImage(image, dx, dy, dw, dh);
    } else {
      const { sx, sy, sw, sh } = plan.geometry;
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, output.width, output.height);
    }
    output.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${plan.filename}.${activeFormat.extension}`;
        link.click();
        URL.revokeObjectURL(url);
      },
      activeFormat.id,
      activeFormat.lossy ? Number(quality) : undefined
    );
  };

  const reset = () => {
    setImage(null);
    setMeta(null);
    setLoadError("");
    setPresetId("hd");
    setMode("cover");
    setFormat("image/jpeg");
    setQuality("0.9");
    setPadColor("black");
    setShowGuides(true);
    setExportBytes(null);
    setCopied(false);
  };

  const summaryText = useMemo(() => {
    if (!hasPlan) return "";
    return [
      "YouTube Thumbnail Size Generator",
      `Source: ${meta.name} — ${meta.width} x ${meta.height} (${ratioLabel(meta.width, meta.height)}), ${formatBytes(meta.bytes)}`,
      `Export: ${plan.target.width} x ${plan.target.height} ${activeFormat.label}, ${plan.mode === "cover" ? "centre crop" : "fit with padding"}`,
      `Encoded size: ${exportBytes == null ? "measuring" : formatBytes(exportBytes)} of the ${formatBytes(MAX_BYTES)} limit`,
      ...(spec?.checks ?? []).map((check) => `${check.label}: ${check.value} (${check.status})`),
    ].join("\n");
  }, [hasPlan, meta, plan, activeFormat, exportBytes, spec]);

  const copyResult = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const breakdown = [
    [
      "Source image",
      meta
        ? `${NUM.format(meta.width)} x ${NUM.format(meta.height)} (${ratioLabel(meta.width, meta.height)})`
        : DASH,
    ],
    ["Source file size", meta ? formatBytes(meta.bytes) : DASH],
    [
      "Export size",
      hasPlan ? `${NUM.format(plan.target.width)} x ${NUM.format(plan.target.height)}` : DASH,
    ],
    ["Encoded file", exportBytes == null ? DASH : formatBytes(exportBytes)],
    [
      "Resampling",
      hasPlan
        ? plan.upscale >= 1
          ? `Enlarged ${plan.upscale.toFixed(2)}x`
          : `Reduced to ${Math.round(plan.upscale * 100)}%`
        : DASH,
    ],
    [
      "Feed preview width",
      guides && !guides.error
        ? `${NUM.format(guides.smallRender.width)} x ${NUM.format(guides.smallRender.height)} px`
        : DASH,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Youtube className="h-4 w-4" aria-hidden="true" />
          YouTube export
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          YouTube Thumbnail Size Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Crop any image to YouTube&apos;s 1280 x 720 16:9 thumbnail frame, see exactly how much gets
          cut, and confirm the file clears the 640 px minimum width and the 2 MB upload limit.
          Everything is processed in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="ytt-file">
          Source image
        </label>
        <input
          id="ytt-file"
          className="mt-2 block w-full text-sm file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-4 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
          type="file"
          accept="image/*"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {meta ? `Loaded ${meta.name}` : "JPG, PNG or WebP up to 25 MB. Nothing leaves this device."}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ytt-preset">
              Export size
            </label>
            <select
              id="ytt-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => setPresetId(event.target.value)}
            >
              {PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ytt-mode">
              How to fit the frame
            </label>
            <select
              id="ytt-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="cover">Fill the frame (centre crop)</option>
              <option value="contain">Fit the whole image (pad the edges)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ytt-format">
              File format
            </label>
            <select
              id="ytt-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {EXPORT_FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                  {item.lossy ? " (adjustable quality)" : " (lossless, larger)"}
                </option>
              ))}
            </select>
          </div>
          {activeFormat.lossy && (
            <div>
              <label className={LABEL_CLASS} htmlFor="ytt-quality">
                Quality — {Math.round(Number(quality) * 100)}%
              </label>
              <input
                id="ytt-quality"
                className="mt-4 h-3 w-full accent-[var(--primary)]"
                type="range"
                min="0.4"
                max="1"
                step="0.05"
                value={quality}
                onChange={(event) => setQuality(event.target.value)}
              />
            </div>
          )}
          {mode === "contain" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="ytt-pad">
                Padding colour
              </label>
              <select
                id="ytt-pad"
                className={`mt-2 ${INPUT_CLASS}`}
                value={padColor}
                onChange={(event) => setPadColor(event.target.value)}
              >
                <option value="black">Black</option>
                <option value="white">White</option>
              </select>
            </div>
          )}
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          htmlFor="ytt-guides"
        >
          <input
            id="ytt-guides"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={showGuides}
            onChange={(event) => setShowGuides(event.target.checked)}
          />
          <span>Show the duration-badge keep-clear zone in the preview</span>
        </label>
      </section>

      {loadError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {loadError}
        </p>
      )}

      {!loadError && meta && plan.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Export dimensions
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasPlan ? `${plan.target.width} x ${plan.target.height}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasPlan ? plan.preset.note : "Load an image to build a thumbnail"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the export summary"
              className={GHOST_BTN}
              disabled={!hasPlan}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={download} className={PRIMARY_BTN} disabled={!hasPlan}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tool" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <canvas
            ref={canvasRef}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)]"
            aria-label="Thumbnail preview"
          />
          {!meta && (
            <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose an image above to see the 16:9 crop.
            </p>
          )}
        </div>

        {hasPlan &&
          plan.warnings.map((warning) => (
            <p
              key={warning}
              className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
            >
              {warning}
            </p>
          ))}
      </section>

      {spec && !spec.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">YouTube spec check</h2>
          <ul className="mt-3 space-y-3">
            {spec.checks.map((check) => (
              <li key={check.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-bold uppercase ${STATUS_STYLE[check.status]}`}
                >
                  {check.status}
                </span>
                <span className="font-semibold">{check.label}</span>
                <span className="text-[var(--muted-foreground)]">{check.value}</span>
                <span className="w-full text-xs text-[var(--muted-foreground)]">{check.detail}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sourceSpec && !sourceSpec.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your original file</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Check</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Value</th>
                  <th scope="col" className="py-2 text-right font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {sourceSpec.checks.map((check) => (
                  <tr key={check.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{check.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {check.value}
                    </td>
                    <td className="py-2 text-right font-semibold uppercase">{check.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes follow YouTube&apos;s published thumbnail guidance: 1280 x 720 recommended, 640 px
        minimum width, 16:9 and a 2 MB upload limit. The duration-badge zone is an approximation of
        where player chrome sits and can change without notice.
      </p>
    </main>
  );
}
