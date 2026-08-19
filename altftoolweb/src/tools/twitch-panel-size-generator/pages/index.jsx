"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, Twitch, Upload } from "lucide-react";

import {
  EXPORT_FORMATS,
  FIT_MODES,
  PANEL_MAX_HEIGHT_PX,
  PANEL_WIDTH_PX,
  PRESETS,
  formatBytes,
  panelHeight,
  planExport,
  requiredSizeSet,
  simplifyRatio,
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
  { id: "transparent", label: "Transparent" },
  { id: "black", label: "Black" },
  { id: "white", label: "White" },
];

const DEFAULT_SOURCE = { width: "1280", height: "400" };

export default function ToolHome() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [fit, setFit] = useState("cover");
  const [format, setFormat] = useState(EXPORT_FORMATS[0].id);
  const [quality, setQuality] = useState("92");
  const [background, setBackground] = useState("transparent");
  const [sourceWidth, setSourceWidth] = useState(DEFAULT_SOURCE.width);
  const [sourceHeight, setSourceHeight] = useState(DEFAULT_SOURCE.height);
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [exported, setExported] = useState(null);
  const [exportError, setExportError] = useState("");
  const [copied, setCopied] = useState(false);

  const imageRef = useRef(null);
  const selectionRef = useRef(0);

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

  const panel = useMemo(
    () => panelHeight({ sourceWidth: Number(sourceWidth), sourceHeight: Number(sourceHeight) }),
    [sourceWidth, sourceHeight],
  );

  const sizeSet = useMemo(() => requiredSizeSet(preset.id), [preset]);

  const exportedWeight = useMemo(
    () => (exported ? weightCheck({ bytes: exported.bytes, maxBytes: exported.maxBytes }) : null),
    [exported],
  );

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      `Twitch asset spec — ${preset.label}`,
      `Export size: ${plan.target.width} x ${plan.target.height} px (${plan.target.ratio})`,
      `Source: ${plan.source.width} x ${plan.source.height} px (${plan.source.ratio})`,
      `Fit mode: ${FIT_MODES.find((mode) => mode.id === plan.fit)?.label ?? plan.fit}`,
      `Scale applied: ${NUM.format(plan.scalePercent)}%`,
      `Cropped away: ${NUM.format(plan.croppedPercent)}%`,
      `Quality note: ${plan.quality.message}`,
      `File ceiling: ${formatBytes(preset.maxBytes)}`,
      sizeSet.length
        ? `Full set required: ${sizeSet.map((size) => `${size.width}x${size.height}`).join(", ")} px`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [plan, preset, sizeSet]);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const mySelection = ++selectionRef.current;
    setExportError("");
    setExported(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (selectionRef.current !== mySelection) return;
      imageRef.current = img;
      setImageUrl(url);
      setImageName(file.name.replace(/\.[^.]+$/, ""));
      setSourceWidth(String(img.naturalWidth));
      setSourceHeight(String(img.naturalHeight));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      if (selectionRef.current !== mySelection) return;
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
      const chosen = EXPORT_FORMATS.find((item) => item.id === format) ?? EXPORT_FORMATS[0];
      // JPEG has no alpha channel — a "transparent" fill would silently flatten to
      // opaque black, so fall back to a white backing fill for that combination.
      const effectiveBackground =
        chosen.id === "image/jpeg" && background === "transparent" ? "white" : background;
      if (effectiveBackground !== "transparent") {
        ctx.fillStyle = effectiveBackground;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, plan.draw.x, plan.draw.y, plan.draw.width, plan.draw.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, chosen.id, Number(quality) / 100),
      );
      if (!blob) throw new Error("no-blob");

      const filename = `${imageName || "twitch"}-${plan.target.width}x${plan.target.height}.${chosen.extension}`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setExported({ bytes: blob.size, filename, maxBytes: preset.maxBytes });
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
    setQuality("92");
    setBackground("transparent");
    setSourceWidth(DEFAULT_SOURCE.width);
    setSourceHeight(DEFAULT_SOURCE.height);
    setImageUrl("");
    setImageName("");
    imageRef.current = null;
    setExported(null);
    setExportError("");
    setCopied(false);
  };

  const dash = "—";
  const lossy = EXPORT_FORMATS.find((item) => item.id === format)?.lossy;
  const isPanel = preset.id === "panel" || preset.id === "panel-tall";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Twitch className="h-4 w-4" aria-hidden="true" />
          Channel art
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Twitch Panel Size Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Export channel panels, sub badges, emotes, profile art and the offline banner at the exact
          pixel sizes Twitch accepts, with each asset&apos;s file-size ceiling checked after export.
          The resize runs in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Choose the asset</h2>
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
        {sizeSet.length > 0 && (
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Twitch expects the whole set:{" "}
            {sizeSet.map((size) => `${size.width}×${size.height}`).join(", ")} px.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">2. Add your artwork</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="twitch-image-file">
            Image file (PNG, JPEG, WebP)
          </label>
          <input
            id="twitch-image-file"
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="mt-2 block w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            PNG keeps transparency, which badges and emotes need.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="twitch-src-width">
              Source width (px)
            </label>
            <input
              id="twitch-src-width"
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
            <label className={LABEL_CLASS} htmlFor="twitch-src-height">
              Source height (px)
            </label>
            <input
              id="twitch-src-height"
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
            <label className={LABEL_CLASS} htmlFor="twitch-fit">
              Fit mode
            </label>
            <select
              id="twitch-fit"
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
            <label className={LABEL_CLASS} htmlFor="twitch-background">
              Bar background
            </label>
            <select
              id="twitch-background"
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
            {background === "transparent" && format === "image/jpeg" && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                JPEG has no transparency — a white background will be used instead.
              </p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="twitch-format">
              Export format
            </label>
            <select
              id="twitch-format"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="twitch-quality">
              Encoder quality ({quality}%)
            </label>
            <input
              id="twitch-quality"
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
              {plan.error ? dash : `${plan.target.ratio} · ceiling ${formatBytes(preset.maxBytes)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Twitch asset specification"
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
              aria-label="Export and download the resized asset"
              className={PRIMARY_BTN}
              disabled={!imageUrl || Boolean(plan.error)}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
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
            ["Natural panel height at 320 px wide", panel.error ? dash : `${panel.naturalHeight} px`],
            ["File ceiling", formatBytes(preset.maxBytes)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {isPanel && !panel.error && panel.clamped && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            At 320 px wide your artwork would be {panel.naturalHeight} px tall, past the{" "}
            {PANEL_MAX_HEIGHT_PX} px panel ceiling — about {NUM.format(panel.lostPercent)}% would be
            cut. Split it into two panels or crop it shorter.
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

        {exported && exportedWeight && !exportedWeight.error && (
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm ${
              exportedWeight.ok
                ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            Saved {exported.filename} — {exportedWeight.label}
            {exportedWeight.ok ? "." : ". Reduce colours or switch to JPEG to get under the limit."}
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
              className="relative w-full max-w-[320px] overflow-hidden rounded-lg ring-1 ring-[var(--border)]"
              style={{
                aspectRatio: `${plan.target.width} / ${plan.target.height}`,
                backgroundColor: background === "transparent" ? "transparent" : background,
              }}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Preview of how your artwork sits inside the Twitch asset frame"
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
        <h2 className="text-base font-semibold">Every Twitch asset size</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Asset</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Pixels</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Ratio</th>
                <th scope="col" className="py-2 text-right font-semibold">Max file</th>
              </tr>
            </thead>
            <tbody>
              {PRESETS.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.label}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {item.width} × {item.height}
                  </td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {simplifyRatio(item.width, item.height)}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                    {formatBytes(item.maxBytes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Panels are always drawn {PANEL_WIDTH_PX} px wide and trimmed past {PANEL_MAX_HEIGHT_PX} px
          tall.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Twitch updates its creator asset requirements from time to time. Confirm the current limits
        in your Creator Dashboard before uploading a full badge or emote set.
      </p>
    </main>
  );
}
