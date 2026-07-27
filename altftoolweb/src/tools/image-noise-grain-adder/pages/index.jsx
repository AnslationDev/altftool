"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, ImagePlus, RotateCcw } from "lucide-react";

import {
  GRAIN_PRESETS,
  MAX_GRAIN_SIZE,
  MAX_WORKING_EDGE,
  applyGrain,
  createSamplePixels,
  describeGrain,
  fitWithin,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const RANGE_CLASS = "mt-2 h-11 w-full accent-[var(--primary)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DEFAULTS = {
  presetId: "tri-x-400",
  intensity: 34,
  size: 2,
  monochrome: true,
  midtoneBias: 0.85,
  shadowLift: 0,
  seed: 11,
};

export default function ToolHome() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [source, setSource] = useState(null);
  const [settings, setSettings] = useState(DEFAULTS);
  const [loadError, setLoadError] = useState("");
  const [copied, setCopied] = useState(false);

  // A generated test image so a real result is on screen before anything is uploaded.
  useEffect(() => {
    const sample = createSamplePixels(560, 340);
    if (sample.error) {
      setLoadError(sample.error);
      return;
    }
    setSource({
      pixels: sample.pixels,
      width: sample.width,
      height: sample.height,
      name: "sample",
      originalWidth: sample.width,
      originalHeight: sample.height,
      scaled: false,
    });
  }, []);

  const result = useMemo(() => {
    if (!source) return null;
    return applyGrain(source.pixels, {
      width: source.width,
      height: source.height,
      intensity: settings.intensity,
      size: settings.size,
      monochrome: settings.monochrome,
      midtoneBias: settings.midtoneBias,
      shadowLift: settings.shadowLift,
      seed: settings.seed,
    });
  }, [source, settings]);

  const summaryStats = useMemo(() => {
    if (!source) return null;
    return describeGrain({
      width: source.width,
      height: source.height,
      intensity: settings.intensity,
      size: settings.size,
      monochrome: settings.monochrome,
    });
  }, [source, settings]);

  const errorMessage = loadError || result?.error || summaryStats?.error || "";
  const hasError = Boolean(errorMessage);

  // Paint the processed pixels onto the visible canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source || !result || result.error) return;
    canvas.width = source.width;
    canvas.height = source.height;
    const context = canvas.getContext("2d");
    if (!context) return;
    const imageData = context.createImageData(source.width, source.height);
    imageData.data.set(result.pixels);
    context.putImageData(imageData, 0, 0);
  }, [source, result]);

  const setField = (key, value) =>
    setSettings((current) => ({ ...current, presetId: "custom", [key]: value }));

  const applyPreset = (presetId) => {
    const preset = GRAIN_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setSettings({
      presetId,
      intensity: preset.intensity,
      size: preset.size,
      monochrome: preset.monochrome,
      midtoneBias: preset.midtoneBias,
      shadowLift: preset.shadowLift,
      seed: DEFAULTS.seed,
    });
  };

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLoadError("That file is not an image. Choose a JPEG, PNG or WebP.");
      return;
    }
    setLoadError("");
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const fitted = fitWithin(image.naturalWidth, image.naturalHeight, MAX_WORKING_EDGE);
      if (fitted.error) {
        setLoadError(fitted.error);
        URL.revokeObjectURL(url);
        return;
      }
      const work = document.createElement("canvas");
      work.width = fitted.width;
      work.height = fitted.height;
      const context = work.getContext("2d", { willReadFrequently: true });
      if (!context) {
        setLoadError("This browser blocked canvas access, so the image cannot be processed.");
        URL.revokeObjectURL(url);
        return;
      }
      context.drawImage(image, 0, 0, fitted.width, fitted.height);
      let data;
      try {
        data = context.getImageData(0, 0, fitted.width, fitted.height);
      } catch {
        setLoadError("The image could not be read back from the canvas. Try a different file.");
        URL.revokeObjectURL(url);
        return;
      }
      setSource({
        pixels: data.data,
        width: fitted.width,
        height: fitted.height,
        name: file.name.replace(/\.[^.]+$/, ""),
        originalWidth: image.naturalWidth,
        originalHeight: image.naturalHeight,
        scaled: fitted.scaled,
      });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      setLoadError("That image could not be decoded. Try a JPEG, PNG or WebP.");
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }, []);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || hasError) return;
    const link = document.createElement("a");
    link.download = `${source?.name || "image"}-grain.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const summaryText = useMemo(() => {
    if (hasError || !source || !summaryStats) return "";
    return [
      "Film grain settings",
      `Working size: ${source.width} x ${source.height} px`,
      `Intensity: ${settings.intensity}/100 (sigma ${summaryStats.sigma} code values)`,
      `Grain size: ${settings.size} px clusters`,
      `Colour: ${settings.monochrome ? "monochrome" : "chromatic"}`,
      `Midtone bias: ${settings.midtoneBias}`,
      `Shadow lift: ${settings.shadowLift} code values`,
      `Seed: ${settings.seed}`,
    ].join("\n");
  }, [hasError, source, summaryStats, settings]);

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

  const reset = () => {
    setSettings(DEFAULTS);
    setLoadError("");
    setCopied(false);
    const sample = createSamplePixels(560, 340);
    if (!sample.error) {
      setSource({
        pixels: sample.pixels,
        width: sample.width,
        height: sample.height,
        name: "sample",
        originalWidth: sample.width,
        originalHeight: sample.height,
        scaled: false,
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Film grain
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Image Noise &amp; Grain Adder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Adds seeded Gaussian grain weighted towards the midtones with 4L(1&nbsp;&minus;&nbsp;L), the
          way real emulsion behaves. Everything happens in your browser — no upload.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="image-file">
          Your photo (JPEG, PNG or WebP)
        </label>
        <input
          id="image-file"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={`mt-2 ${INPUT_CLASS} py-2 file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]`}
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Images larger than {MAX_WORKING_EDGE} px on the long edge are scaled down first so the
          preview stays interactive. Start with the built-in test ramp below.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="preset">
              Look
            </label>
            <select
              id="preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={settings.presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {settings.presetId === "custom" && <option value="custom">Custom</option>}
              {GRAIN_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="intensity">
              Intensity: {settings.intensity}/100
            </label>
            <input
              id="intensity"
              className={RANGE_CLASS}
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.intensity}
              onChange={(event) => setField("intensity", Number(event.target.value))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="grain-size">
              Grain size: {settings.size} px
            </label>
            <input
              id="grain-size"
              className={RANGE_CLASS}
              type="range"
              min="1"
              max={MAX_GRAIN_SIZE}
              step="1"
              value={settings.size}
              onChange={(event) => setField("size", Number(event.target.value))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="midtone-bias">
              Midtone bias: {NUM.format(settings.midtoneBias)}
            </label>
            <input
              id="midtone-bias"
              className={RANGE_CLASS}
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.midtoneBias}
              onChange={(event) => setField("midtoneBias", Number(event.target.value))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shadow-lift">
              Shadow lift: {settings.shadowLift}
            </label>
            <input
              id="shadow-lift"
              className={RANGE_CLASS}
              type="range"
              min="0"
              max="40"
              step="1"
              value={settings.shadowLift}
              onChange={(event) => setField("shadowLift", Number(event.target.value))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="seed">
              Grain seed
            </label>
            <input
              id="seed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="999999"
              step="1"
              value={settings.seed}
              onChange={(event) => setField("seed", Number(event.target.value))}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="monochrome"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="monochrome"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={settings.monochrome}
                onChange={(event) => setField("monochrome", event.target.checked)}
              />
              Monochrome grain
            </label>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Grain standard deviation
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !summaryStats ? DASH : `${NUM.format(summaryStats.sigma)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError || !summaryStats
                ? "Load an image to see the result."
                : `${summaryStats.description} Peak amplitude in code values out of 255.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the grain settings to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy settings"}
            </button>
            <button
              type="button"
              onClick={download}
              aria-label="Download the grained image as PNG"
              className={GHOST_BTN}
              disabled={hasError}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download PNG
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the default look" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Working size",
              hasError || !source ? DASH : `${source.width} x ${source.height} px`,
            ],
            [
              "Original size",
              hasError || !source
                ? DASH
                : `${source.originalWidth} x ${source.originalHeight} px${source.scaled ? " (scaled down)" : ""}`,
            ],
            [
              "Megapixels processed",
              hasError || !summaryStats ? DASH : NUM.format(summaryStats.megapixels),
            ],
            [
              "Grain clusters",
              hasError || !summaryStats ? DASH : NUM.format(summaryStats.grainCells),
            ],
            ["Colour model", hasError ? DASH : settings.monochrome ? "Monochrome" : "Chromatic"],
            [
              "Pixels changed",
              hasError || !result ? DASH : NUM.format(result.changedPixels),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <canvas
            ref={canvasRef}
            className="mx-auto block h-auto max-w-full rounded"
            aria-label="Preview of the image with grain applied"
            role="img"
          />
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Grain is added with a seeded generator, so the same seed and settings always produce the
        same texture — useful when you need a matching look across a set of frames. Export is PNG,
        which is lossless and will not smear the grain the way heavy JPEG compression does.
      </p>
    </main>
  );
}
