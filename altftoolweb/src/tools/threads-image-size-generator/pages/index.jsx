"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AtSign, Check, Copy, Download, RotateCcw, Upload } from "lucide-react";

import {
  EXPORT_FORMATS,
  FIT_MODES,
  MAX_CAROUSEL_ITEMS,
  PRESETS,
  RECOMMENDED_WIDTH_PX,
  carouselPlan,
  formatBytes,
  planExport,
  simplifyRatio,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const MP = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

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
  { id: "white", label: "White" },
  { id: "black", label: "Black" },
  { id: "transparent", label: "Transparent" },
];

const DEFAULT_SOURCE = { width: "4000", height: "3000" };

export default function ToolHome() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [fit, setFit] = useState("cover");
  const [format, setFormat] = useState(EXPORT_FORMATS[0].id);
  const [quality, setQuality] = useState("88");
  const [background, setBackground] = useState("white");
  const [sourceWidth, setSourceWidth] = useState(DEFAULT_SOURCE.width);
  const [sourceHeight, setSourceHeight] = useState(DEFAULT_SOURCE.height);
  const [slides, setSlides] = useState("3");
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [exported, setExported] = useState(null);
  const [exportError, setExportError] = useState("");
  const [copied, setCopied] = useState(false);

  const imageRef = useRef(null);

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

  const carousel = useMemo(
    () => carouselPlan({ slides: Number(slides), width: preset.width, height: preset.height }),
    [slides, preset],
  );

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      `Threads image spec — ${preset.label}`,
      `Export size: ${plan.target.width} x ${plan.target.height} px (${plan.target.ratio})`,
      `Source: ${plan.source.width} x ${plan.source.height} px (${plan.source.ratio})`,
      `Fit mode: ${FIT_MODES.find((mode) => mode.id === plan.fit)?.label ?? plan.fit}`,
      `Scale applied: ${NUM.format(plan.scalePercent)}%`,
      `Cropped away: ${NUM.format(plan.croppedPercent)}%`,
      `Feed behaviour: ${plan.compliance.message}`,
      `Quality note: ${plan.quality.message}`,
      carousel.error ? `Carousel: ${carousel.error}` : `Carousel: ${carousel.slides} of ${MAX_CAROUSEL_ITEMS} slots used`,
    ].join("\n");
  }, [plan, preset, carousel]);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setExportError("");
    setExported(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageUrl(url);
      setImageName(file.name.replace(/\.[^.]+$/, ""));
      setSourceWidth(String(img.naturalWidth));
      setSourceHeight(String(img.naturalHeight));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
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

      const filename = `${imageName || "threads"}-${plan.target.width}x${plan.target.height}.${chosen.extension}`;
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
    setPresetId(PRESETS[0].id);
    setFit("cover");
    setFormat(EXPORT_FORMATS[0].id);
    setQuality("88");
    setBackground("white");
    setSourceWidth(DEFAULT_SOURCE.width);
    setSourceHeight(DEFAULT_SOURCE.height);
    setSlides("3");
    setImageUrl("");
    setImageName("");
    imageRef.current = null;
    setExported(null);
    setExportError("");
    setCopied(false);
  };

  const dash = "—";
  const lossy = EXPORT_FORMATS.find((item) => item.id === format)?.lossy;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AtSign className="h-4 w-4" aria-hidden="true" />
          Threads posts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Threads Image Size Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Export Threads posts and carousel slides at the {RECOMMENDED_WIDTH_PX} px width the feed
          serves, and check whether your shape falls inside the supported 1.91:1 to 4:5 range before
          the feed crops it for you. Everything runs locally in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Choose the post shape</h2>
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
        <h2 className="text-base font-semibold">2. Add your image</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="threads-image-file">
            Image file (PNG, JPEG, WebP)
          </label>
          <input
            id="threads-image-file"
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="mt-2 block w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Without a file the figures still work from the source dimensions you type.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="threads-src-width">
              Source width (px)
            </label>
            <input
              id="threads-src-width"
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
            <label className={LABEL_CLASS} htmlFor="threads-src-height">
              Source height (px)
            </label>
            <input
              id="threads-src-height"
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
            <label className={LABEL_CLASS} htmlFor="threads-fit">
              Fit mode
            </label>
            <select
              id="threads-fit"
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
            <label className={LABEL_CLASS} htmlFor="threads-slides">
              Carousel slides (1–{MAX_CAROUSEL_ITEMS})
            </label>
            <input
              id="threads-slides"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_CAROUSEL_ITEMS}
              step="1"
              value={slides}
              onChange={(event) => setSlides(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="threads-background">
              Bar background
            </label>
            <select
              id="threads-background"
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
            <label className={LABEL_CLASS} htmlFor="threads-format">
              Export format
            </label>
            <select
              id="threads-format"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="threads-quality">
              Encoder quality ({quality}%)
            </label>
            <input
              id="threads-quality"
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
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? dash : `${plan.target.width} × ${plan.target.height}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error ? dash : `${plan.target.ratio} · ${MP.format(plan.target.megapixels)} MP`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Threads image specification"
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
              aria-label="Export and download the resized image"
              className={PRIMARY_BTN}
              disabled={!imageUrl || Boolean(plan.error)}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Source image", plan.error ? dash : `${plan.source.width} × ${plan.source.height} px (${plan.source.ratio})`],
            ["Scale applied", plan.error ? dash : `${NUM.format(plan.scalePercent)}%`],
            ["Cropped away", plan.error ? dash : `${NUM.format(plan.croppedPercent)}% of the scaled image`],
            [
              "Background bars",
              plan.error
                ? dash
                : `${plan.bars.vertical} px left/right · ${plan.bars.horizontal} px top/bottom`,
            ],
            [
              "Shown in full by the feed",
              plan.error || plan.compliance.error
                ? dash
                : `${NUM.format(plan.compliance.visiblePercent)}%`,
            ],
            [
              "Carousel pixels",
              carousel.error ? dash : `${MP.format(carousel.totalMegapixels)} MP across ${carousel.slides} slides`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {carousel.error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {carousel.error}
          </p>
        )}

        {!plan.error && !plan.compliance.error && (
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm ${
              plan.compliance.supported
                ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {plan.compliance.message}
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

        {exportError && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {exportError}
          </p>
        )}

        {exported && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Saved {exported.filename} — {formatBytes(exported.bytes)}.
          </p>
        )}
      </section>

      {!plan.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Crop preview</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            The frame below is the exact {plan.target.ratio} export shape.
          </p>
          <div className="mt-3 flex justify-center">
            <div
              className="relative w-full max-w-[280px] overflow-hidden rounded-lg ring-1 ring-[var(--border)]"
              style={{
                aspectRatio: `${plan.target.width} / ${plan.target.height}`,
                backgroundColor: background === "transparent" ? "transparent" : background,
              }}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Preview of how your image sits inside the Threads post frame"
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
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every Threads image size</h2>
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
        Threads follows Instagram&apos;s media handling closely, but both change without notice.
        Check a test post on your own account before scheduling a large batch.
      </p>
    </main>
  );
}
