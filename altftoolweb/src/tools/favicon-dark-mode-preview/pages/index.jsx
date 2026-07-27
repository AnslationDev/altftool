"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppWindow, Check, Copy, RotateCcw, Upload } from "lucide-react";
import {
  MIN_GRAPHIC_CONTRAST,
  PREVIEW_SIZES,
  analyzeFavicon,
  formatReport,
  sampleFaviconPixels,
} from "../lib";

/**
 * Fixed browser-chrome colours are intentional here: the whole point of the tool is to show the
 * icon on a real light tab strip and a real dark tab strip at the same time, regardless of the
 * visitor's own theme. Tailwind palette utilities are used so no colour literal appears in source.
 */
const TABS = [
  {
    id: "light",
    title: "Light tab strip",
    shell: "bg-white",
    chrome: "bg-neutral-100 text-neutral-700",
    label: "text-neutral-800",
  },
  {
    id: "dark",
    title: "Dark tab strip",
    shell: "bg-neutral-900",
    chrome: "bg-neutral-800 text-neutral-300",
    label: "text-neutral-100",
  },
];

/** Analysis is capped at this raster size; favicons are far smaller and this keeps decoding cheap. */
const MAX_ANALYSIS_SIZE = 256;

const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function pixelsToDataUrl({ data, width, height }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  return canvas.toDataURL("image/png");
}

function decodeToPixels(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      if (!naturalW || !naturalH) {
        reject(
          new Error(
            "The browser could not work out this image's size. Give the SVG an explicit width and height, or upload a PNG.",
          ),
        );
        return;
      }
      const scale = Math.min(1, MAX_ANALYSIS_SIZE / Math.max(naturalW, naturalH));
      const width = Math.max(1, Math.round(naturalW * scale));
      const height = Math.max(1, Math.round(naturalH * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        reject(new Error("This browser did not provide a 2D canvas, so the icon cannot be measured."));
        return;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        resolve({ data: imageData.data, width, height });
      } catch {
        reject(new Error("The image could not be read back from the canvas."));
      }
    };
    img.onerror = () =>
      reject(
        new Error("That file could not be decoded as an image. PNG, SVG, WebP and ICO usually work."),
      );
    img.src = url;
  });
}

export default function ToolHome() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [pixels, setPixels] = useState(null);
  const [fileName, setFileName] = useState("Built-in sample icon");
  const [loadError, setLoadError] = useState("");
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState("6");

  const loadSample = useCallback(() => {
    const sample = sampleFaviconPixels(32);
    setPixels(sample);
    setPreviewUrl(pixelsToDataUrl(sample));
    setFileName("Built-in sample icon");
    setLoadError("");
    setCopied(false);
  }, []);

  useEffect(() => {
    loadSample();
  }, [loadSample]);

  const result = useMemo(() => {
    if (!pixels) return { error: "Preparing the sample icon…" };
    return analyzeFavicon(pixels);
  }, [pixels]);

  const failed = Boolean(result.error) || Boolean(loadError);
  const message = loadError || result.error || "";
  const zoomedPx = `${Number(zoom) * 16}px`;

  const onFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const decoded = await decodeToPixels(url);
      setPixels(decoded);
      setPreviewUrl(url);
      setFileName(file.name);
      setLoadError("");
    } catch (err) {
      URL.revokeObjectURL(url);
      setLoadError(err.message);
    }
  };

  const report = useMemo(() => formatReport(result), [result]);

  const copyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AppWindow className="h-4 w-4" aria-hidden="true" />
          Browser tab check
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Favicon Dark Mode Preview</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See your favicon on a light and a dark tab strip at once, and get the WCAG contrast ratio
          of the artwork against each one. Files are decoded in your browser and never uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="favicon-file">
          Favicon file (PNG, SVG, WebP or ICO)
        </label>
        <input
          id="favicon-file"
          className={`mt-2 ${INPUT_CLASS} py-2.5 file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]`}
          type="file"
          accept="image/png,image/svg+xml,image/webp,image/x-icon,image/vnd.microsoft.icon,.ico"
          onChange={onFile}
        />
        <p className="mt-2 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          Currently showing: {fileName}
          {failed ? "" : ` · ${result.width} × ${result.height} px analysed in your browser`}
        </p>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="favicon-zoom">
            Zoom the tab preview ({zoom}×)
          </label>
          <input
            id="favicon-zoom"
            className="mt-3 h-11 w-full accent-[var(--primary)]"
            type="range"
            min="2"
            max="12"
            step="1"
            value={zoom}
            onChange={(event) => setZoom(event.target.value)}
          />
        </div>
      </section>

      {message && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {message}
        </p>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {TABS.map((tab) => {
          const bg = failed ? null : result.backgrounds.find((item) => item.id === tab.id);
          return (
            <div
              key={tab.id}
              className="overflow-hidden rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)]"
            >
              <div className={`${tab.shell} p-4`}>
                <div className={`${tab.chrome} flex items-center gap-2 rounded-t-lg px-3 py-2 text-xs`}>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={`Favicon shown on the ${tab.title.toLowerCase()}`}
                      style={{ width: zoomedPx, height: zoomedPx }}
                      className="shrink-0"
                    />
                  ) : null}
                  <span className={`${tab.label} truncate font-medium`}>Your site — Home</span>
                </div>
                <div className="flex items-end gap-3 rounded-b-lg px-3 pb-1 pt-3">
                  {PREVIEW_SIZES.map((size) =>
                    previewUrl ? (
                      <img
                        key={size}
                        src={previewUrl}
                        alt={`Favicon at its true ${size} pixel size`}
                        style={{ width: `${size}px`, height: `${size}px` }}
                      />
                    ) : null,
                  )}
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {tab.title}
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                  {bg ? `${NUM.format(bg.contrast)}:1` : DASH}
                </p>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    bg && bg.pass ? "text-[var(--success)]" : "text-[var(--danger)]"
                  }`}
                >
                  {bg
                    ? bg.pass
                      ? `Legible — clears the ${MIN_GRAPHIC_CONTRAST}:1 minimum`
                      : `${PCT.format(bg.lowContrastShare)} of pixels under ${MIN_GRAPHIC_CONTRAST}:1`
                    : DASH}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Overall verdict
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.verdict === "pass" ? "Ready to ship" : "Needs a look"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "No measurable artwork yet."
                : `${PCT.format(result.coverage)} of the canvas carries visible pixels`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the favicon contrast report"
              onClick={copyReport}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              className={PRIMARY_BTN}
              aria-label="Reset back to the sample icon"
              onClick={loadSample}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Transparent area", failed ? DASH : PCT.format(result.transparentShare)],
            [
              "Average artwork colour (sRGB)",
              failed
                ? DASH
                : `${result.averageColor.r}, ${result.averageColor.g}, ${result.averageColor.b}`,
            ],
            ["Average relative luminance", failed ? DASH : NUM.format(result.averageLuminance)],
            ["Brightness spread across the mark", failed ? DASH : NUM.format(result.luminanceSpread)],
            ["Average saturation", failed ? DASH : PCT.format(result.saturation)],
            ["Smallest edge padding", failed ? DASH : PCT.format(result.padding.min)],
            [
              "Safari pinned-tab (single colour) safe",
              failed ? DASH : result.monochromeFriendly ? "Yes" : "Risky",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && result.notes.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to fix</h2>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="border-l-2 border-[var(--primary)] pl-3">
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Tab-strip colours approximate the default Chrome themes; individual browsers, themes and
        operating systems vary. Contrast ratios follow the WCAG 2.x formula and the{" "}
        {MIN_GRAPHIC_CONTRAST}:1 threshold from SC 1.4.11 Non-text Contrast.
      </p>
    </main>
  );
}
