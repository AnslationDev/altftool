"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, MessageCircle, RotateCcw, Upload } from "lucide-react";

import {
  EXPORT_FORMATS,
  FIT_MODES,
  MAX_MEDIA_BYTES,
  PRESETS,
  STATUS_VIDEO_MAX_SECONDS,
  formatBytes,
  planExport,
  simplifyRatio,
  statusVideoClips,
  weightCheck,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_OFF =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const BACKGROUNDS = [
  { id: "black", label: "Black" },
  { id: "white", label: "White" },
  { id: "transparent", label: "Transparent" },
];

const DEFAULT_SOURCE = { width: "3000", height: "2000" };

export default function ToolHome() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [fit, setFit] = useState("cover");
  const [format, setFormat] = useState(EXPORT_FORMATS[0].id);
  const [quality, setQuality] = useState("90");
  const [background, setBackground] = useState("black");
  const [sourceWidth, setSourceWidth] = useState(DEFAULT_SOURCE.width);
  const [sourceHeight, setSourceHeight] = useState(DEFAULT_SOURCE.height);
  const [videoSeconds, setVideoSeconds] = useState("150");
  const [showSafe, setShowSafe] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [exported, setExported] = useState(null);
  const [exportError, setExportError] = useState("");
  const [copied, setCopied] = useState(false);

  const imageRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!imageUrl) return undefined;
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const preset = useMemo(
    () => PRESETS.find((item) => item.id === presetId) ?? PRESETS[0],
    [presetId],
  );

  const plan = useMemo(
    () =>
      planExport({
        sourceWidth: Number(sourceWidth),
        sourceHeight: Number(sourceHeight),
        targetWidth: preset.width,
        targetHeight: preset.height,
        fit,
      }),
    [sourceWidth, sourceHeight, preset, fit],
  );

  const clips = useMemo(
    () => statusVideoClips({ durationSeconds: Number(videoSeconds) }),
    [videoSeconds],
  );

  const exportedWeight = useMemo(
    () => (exported ? weightCheck({ bytes: exported.bytes }) : null),
    [exported],
  );

  const summary = useMemo(() => {
    if (plan.error) return "";
    const screenLine = plan.screen.error
      ? plan.screen.error
      : plan.screen.fullBleed
        ? "Fills the status screen edge to edge"
        : `${plan.screen.barVertical} px side bars, ${plan.screen.barHorizontal} px top/bottom bars on screen`;
    return [
      `WhatsApp Status spec — ${preset.label}`,
      `Export size: ${plan.target.width} x ${plan.target.height} px (${plan.target.ratio})`,
      `Source: ${plan.source.width} x ${plan.source.height} px (${plan.source.ratio})`,
      `Fit mode: ${FIT_MODES.find((mode) => mode.id === plan.fit)?.label ?? plan.fit}`,
      `Scale applied: ${NUM.format(plan.scalePercent)}%`,
      `Cropped away: ${NUM.format(plan.croppedPercent)}%`,
      `On the status screen: ${screenLine}`,
      preset.safeZone && !plan.safe.error
        ? `Text-safe area: ${plan.safe.width} x ${plan.safe.height} px`
        : "",
      clips.error
        ? `Video: ${clips.error}`
        : `Video: ${clips.clips} status clip(s) at ${STATUS_VIDEO_MAX_SECONDS}s each`,
      `Media ceiling: ${formatBytes(MAX_MEDIA_BYTES)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [plan, preset, clips]);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setExportError("");
    setExported(null);
    const requestId = ++requestIdRef.current;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (requestIdRef.current !== requestId) {
        URL.revokeObjectURL(url);
        return;
      }
      imageRef.current = img;
      setImageUrl(url);
      setImageName(file.name.replace(/\.[^.]+$/, ""));
      setSourceWidth(String(img.naturalWidth));
      setSourceHeight(String(img.naturalHeight));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      if (requestIdRef.current !== requestId) return;
      setExportError("That file could not be read as an image. Try a PNG, JPEG or WebP.");
    };
    img.src = url;
  };

  const handleExport = async () => {
    const img = imageRef.current;
    if (!img || plan.error) return;
    setExportError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = plan.target.width;
      canvas.height = plan.target.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no-context");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (background !== "transparent") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, plan.draw.x, plan.draw.y, plan.draw.width, plan.draw.height);

      const chosen = EXPORT_FORMATS.find((item) => item.id === format) ?? EXPORT_FORMATS[0];
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, chosen.id, Number(quality) / 100),
      );
      if (!blob) throw new Error("no-blob");

      const filename = `${imageName || "status"}-${plan.target.width}x${plan.target.height}.${chosen.extension}`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setExported({ bytes: blob.size, filename });
    } catch {
      setExportError("The browser could not render that export. Try a smaller source image.");
    }
  };

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    requestIdRef.current += 1;
    setPresetId(PRESETS[0].id);
    setFit("cover");
    setFormat(EXPORT_FORMATS[0].id);
    setQuality("90");
    setBackground("black");
    setSourceWidth(DEFAULT_SOURCE.width);
    setSourceHeight(DEFAULT_SOURCE.height);
    setVideoSeconds("150");
    setShowSafe(true);
    setImageUrl("");
    setImageName("");
    imageRef.current = null;
    setExported(null);
    setExportError("");
    setCopied(false);
  };

  const dash = "—";
  const lossy = EXPORT_FORMATS.find((item) => item.id === format)?.lossy;
  const showSafeOverlay = preset.safeZone && !plan.error && !plan.safe.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Status media
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">WhatsApp Status Size Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Export status images at the 1080 × 1920 shape that fills the screen edge to edge, see the
          bars any other ratio picks up, and work out how many {STATUS_VIDEO_MAX_SECONDS} second
          clips a longer video has to be split into. Nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Choose the status shape</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPresetId(item.id)}
              aria-pressed={presetId === item.id}
              className={presetId === item.id ? CHIP_ON : CHIP_OFF}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{preset.note}</p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">2. Add your media</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="wa-image-file">
            Image file (PNG, JPEG, WebP)
          </label>
          <input
            id="wa-image-file"
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="mt-2 block w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            The figures work from the dimensions you type, so you can plan before the file exists.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-src-width">
              Source width (px)
            </label>
            <input
              id="wa-src-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={sourceWidth}
              onChange={(event) => setSourceWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-src-height">
              Source height (px)
            </label>
            <input
              id="wa-src-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={sourceHeight}
              onChange={(event) => setSourceHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-fit">
              Fit mode
            </label>
            <select
              id="wa-fit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fit}
              onChange={(event) => setFit(event.target.value)}
            >
              {FIT_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-video-seconds">
              Video length (seconds)
            </label>
            <input
              id="wa-video-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={videoSeconds}
              onChange={(event) => setVideoSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-background">
              Bar background
            </label>
            <select
              id="wa-background"
              className={`mt-2 ${INPUT_CLASS}`}
              value={background}
              onChange={(event) => setBackground(event.target.value)}
            >
              {BACKGROUNDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-format">
              Export format
            </label>
            <select
              id="wa-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {EXPORT_FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {background === "transparent" && format === "image/jpeg" && (
            <p
              role="alert"
              className="sm:col-span-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              JPEG does not support transparency — the bars will render solid black instead. Switch
              the export format to PNG or WebP to keep them transparent.
            </p>
          )}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wa-quality">
              Encoder quality ({quality}%)
            </label>
            <input
              id="wa-quality"
              className="mt-4 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="40"
              max="100"
              step="1"
              value={quality}
              disabled={!lossy}
              onChange={(event) => setQuality(event.target.value)}
            />
            {!lossy && (
              <p className="text-xs text-[var(--muted-foreground)]">PNG is lossless — quality is ignored.</p>
            )}
          </div>
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Export size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
              {plan.error ? dash : `${plan.target.width} × ${plan.target.height}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error ? dash : `${plan.target.ratio} · ${NUM.format(plan.target.megapixels)} MP`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the WhatsApp Status specification"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy spec"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every option" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleExport}
              aria-label="Export and download the resized status image"
              className={PRIMARY_BTN}
              disabled={!imageUrl || Boolean(plan.error)}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite">
          {[
            ["Source image", plan.error ? dash : `${plan.source.width} × ${plan.source.height} px (${plan.source.ratio})`],
            ["Scale applied", plan.error ? dash : `${NUM.format(plan.scalePercent)}%`],
            ["Cropped away", plan.error ? dash : `${NUM.format(plan.croppedPercent)}% of the scaled image`],
            preset.onStatusScreen
              ? [
                  "Screen coverage",
                  plan.error || plan.screen.error
                    ? dash
                    : `${NUM.format(plan.screen.coveragePercent)}% of the status screen`,
                ]
              : null,
            preset.onStatusScreen
              ? [
                  "Bars on screen",
                  plan.error || plan.screen.error
                    ? dash
                    : `${plan.screen.barVertical} px sides · ${plan.screen.barHorizontal} px top/bottom`,
                ]
              : null,
            plan.fit === "contain"
              ? [
                  "Bars baked into export",
                  plan.error ? dash : `${plan.bars.vertical} px sides · ${plan.bars.horizontal} px top/bottom`,
                ]
              : null,
            [
              "Text-safe area",
              plan.error || !preset.safeZone || plan.safe.error
                ? dash
                : `${plan.safe.width} × ${plan.safe.height} px (${NUM.format(plan.safe.coveragePercent)}%)`,
            ],
            [
              "Video split",
              clips.error ? dash : `${clips.clips} clip(s), last one ${NUM.format(clips.lastClipSeconds)}s`,
            ],
            ["Media ceiling", formatBytes(MAX_MEDIA_BYTES)],
          ]
            .filter(Boolean)
            .map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {clips.error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {clips.error}
          </p>
        )}

        {!plan.error && !plan.screen.error && !plan.screen.fullBleed && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            This shape fills {NUM.format(plan.screen.coveragePercent)}% of the status screen. Export
            at 1080 × 1920 instead if you want no bars at all.
          </p>
        )}

        {!plan.error && (
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm ${
              plan.quality.level === "warn"
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {plan.quality.message}
          </p>
        )}

        {!plan.error && plan.distorted && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Stretch fit scales width and height by different amounts, so the exported image will look
            squashed or stretched. Switch to Fill or Fit if the source shape doesn&apos;t need to
            change.
          </p>
        )}

        {exportError && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {exportError}
          </p>
        )}

        {exported && exportedWeight && !exportedWeight.error && (
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm ${
              exportedWeight.ok
                ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            Saved {exported.filename} — {exportedWeight.label}
            {exportedWeight.ok ? "." : ". Lower the encoder quality before sending."}
          </p>
        )}
      </section>

      {!plan.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Crop and safe-zone preview</h2>
            {showSafeOverlay && (
              <button
                type="button"
                onClick={() => setShowSafe((value) => !value)}
                aria-pressed={showSafe}
                className={showSafe ? CHIP_ON : CHIP_OFF}
              >
                {showSafe ? "Hide safe zone" : "Show safe zone"}
              </button>
            )}
          </div>
          <div className="mt-3 flex justify-center">
            <div
              className="relative w-full max-w-[240px] overflow-hidden rounded-lg ring-1 ring-[var(--border)]"
              style={{
                aspectRatio: `${plan.target.width} / ${plan.target.height}`,
                backgroundColor: background === "transparent" ? "transparent" : background,
              }}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Preview of how your image sits inside the WhatsApp Status frame"
                  className="absolute max-w-none"
                  style={{
                    left: `${plan.preview.leftPercent}%`,
                    top: `${plan.preview.topPercent}%`,
                    width: `${plan.preview.widthPercent}%`,
                    height: `${plan.preview.heightPercent}%`,
                  }}
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center gap-2 px-3 text-center text-sm font-semibold text-[var(--muted-foreground)]">
                  <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Add an image
                </span>
              )}
              {showSafeOverlay && showSafe && (
                <div
                  className="pointer-events-none absolute inset-x-0 border-y-2 border-dashed border-[var(--primary)]"
                  style={{
                    top: `${plan.safe.topPercent}%`,
                    bottom: `${plan.safe.bottomPercent}%`,
                  }}
                  role="img"
                  aria-label={`Safe zone: ${plan.safe.width} by ${plan.safe.height} pixels`}
                />
              )}
            </div>
          </div>
          {showSafeOverlay && (
            <p className="mt-3 text-center text-xs leading-5 text-[var(--muted-foreground)]">
              The contact name sits over the top {plan.safe.top} px and the reply field over the
              bottom {plan.safe.bottom} px — keep headlines between the dashed lines. These margins
              are measured from the app, not published by WhatsApp.
            </p>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every status size</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Pixels</th>
                <th scope="col" className="py-2 text-right font-semibold">Ratio</th>
              </tr>
            </thead>
            <tbody>
              {PRESETS.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.label}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {item.width} × {item.height}
                  </td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {simplifyRatio(item.width, item.height)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        WhatsApp re-compresses media on upload and its limits change between app versions. Post one
        test status before sending a whole campaign.
      </p>
    </main>
  );
}
