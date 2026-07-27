"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScanText } from "lucide-react";

import {
  COMFORTABLE_STROKE_PX,
  FAVICON_SIZES,
  MIN_LEGIBLE_GLYPH_PX,
  REFERENCE_SIZE,
  detailRetention,
  evaluateFavicon,
  imageStats,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const PX = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  sourceWidth: "512",
  sourceHeight: "512",
  thinnestStroke: "18",
  smallestText: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const VERDICT_CLASS = {
  reads: "bg-[var(--success-soft)] text-[var(--success)]",
  "at risk": "bg-[var(--warning-soft)] text-[var(--warning)]",
  lost: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

/** Draw an image contained inside a size x size transparent square. */
function renderSquare(image, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const longEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const drawWidth = (image.naturalWidth / longEdge) * size;
  const drawHeight = (image.naturalHeight / longEdge) * size;
  ctx.drawImage(image, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);
  return {
    dataUrl: canvas.toDataURL("image/png"),
    pixels: ctx.getImageData(0, 0, size, size),
  };
}

export default function ToolHome() {
  const [sourceWidth, setSourceWidth] = useState(DEFAULTS.sourceWidth);
  const [sourceHeight, setSourceHeight] = useState(DEFAULTS.sourceHeight);
  const [thinnestStroke, setThinnestStroke] = useState(DEFAULTS.thinnestStroke);
  const [smallestText, setSmallestText] = useState(DEFAULTS.smallestText);
  const [fileUrl, setFileUrl] = useState("");
  const [previews, setPreviews] = useState([]);
  const [retentionBySize, setRetentionBySize] = useState(null);
  const [imageError, setImageError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!fileUrl) return undefined;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      try {
        setSourceWidth(String(image.naturalWidth));
        setSourceHeight(String(image.naturalHeight));
        const reference = renderSquare(image, REFERENCE_SIZE);
        const referenceStats = reference ? imageStats(reference.pixels) : { error: "canvas" };
        const nextPreviews = [];
        const nextRetention = {};
        for (const size of FAVICON_SIZES) {
          const render = renderSquare(image, size);
          if (!render) continue;
          nextPreviews.push({ size, dataUrl: render.dataUrl });
          const stats = imageStats(render.pixels);
          if (!stats.error && !referenceStats.error) {
            const { ratio, comparable } = detailRetention(referenceStats, stats);
            if (comparable) nextRetention[size] = ratio;
          }
        }
        setPreviews(nextPreviews);
        setRetentionBySize(Object.keys(nextRetention).length > 0 ? nextRetention : null);
        setImageError("");
      } catch {
        setImageError("This image could not be read in the browser. Try a PNG, JPEG or SVG export.");
      }
    };
    image.onerror = () => {
      if (!cancelled) setImageError("That file could not be decoded as an image.");
    };
    image.src = fileUrl;
    return () => {
      cancelled = true;
      URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const report = useMemo(
    () =>
      evaluateFavicon({
        sourceWidth: Number(sourceWidth),
        sourceHeight: Number(sourceHeight),
        thinnestStrokePx: Number(thinnestStroke),
        smallestTextHeightPx: Number(smallestText),
        sizes: FAVICON_SIZES,
        retentionBySize,
      }),
    [sourceWidth, sourceHeight, thinnestStroke, smallestText, retentionBySize],
  );

  const summary = useMemo(() => {
    if (report.error) return "";
    return [
      "Logo Favicon Legibility Check",
      `Artwork: ${NUM.format(Number(sourceWidth))} x ${NUM.format(Number(sourceHeight))}px`,
      `Thinnest stroke: ${NUM.format(Number(thinnestStroke))}px`,
      ...report.rows.map(
        (row) =>
          `${row.size}px -> stroke ${PX.format(row.renderedStroke)}px (${row.strokeVerdict})${row.textVerdict ? `, text ${PX.format(row.renderedText)}px (${row.textVerdict})` : ""}${row.retention === null ? "" : `, detail kept ${PCT.format(row.retention * 100)}%`} => ${row.verdict}`,
      ),
      `Smallest size that reads: ${report.smallestReadable === null ? "none" : `${report.smallestReadable}px`}`,
      `Stroke needed for a clean 16px render: ${PX.format(report.requiredStrokeAtSource)}px in the artwork`,
      ...report.issues.map((issue) => `- ${issue.message}`),
    ].join("\n");
  }, [report, sourceWidth, sourceHeight, thinnestStroke]);

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
    setSourceWidth(DEFAULTS.sourceWidth);
    setSourceHeight(DEFAULTS.sourceHeight);
    setThinnestStroke(DEFAULTS.thinnestStroke);
    setSmallestText(DEFAULTS.smallestText);
    setFileUrl("");
    setPreviews([]);
    setRetentionBySize(null);
    setImageError("");
    setCopied(false);
  };

  const pickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileUrl(URL.createObjectURL(file));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanText className="h-4 w-4" aria-hidden="true" />
          Small-size legibility
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Logo Favicon Legibility Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how thick your thinnest stroke and shortest letters become once the mark is
          squeezed into a 16, 32, 48 or 180 pixel square, and compare real downscaled previews.
          Images are processed in your browser and never uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fav-w">
              Artwork width (px)
            </label>
            <input
              id="fav-w"
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
            <label className={LABEL_CLASS} htmlFor="fav-h">
              Artwork height (px)
            </label>
            <input
              id="fav-h"
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
            <label className={LABEL_CLASS} htmlFor="fav-stroke">
              Thinnest stroke or gap (px)
            </label>
            <input
              id="fav-stroke"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={thinnestStroke}
              onChange={(event) => setThinnestStroke(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fav-text">
              Smallest cap height (px, 0 if no text)
            </label>
            <input
              id="fav-text"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={smallestText}
              onChange={(event) => setSmallestText(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="fav-file">
            Optional: open the logo to measure real detail loss
          </label>
          <input
            id="fav-file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={pickFile}
            className={`mt-2 ${INPUT_CLASS} py-2 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--muted)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--foreground)]`}
          />
        </div>

        {imageError ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {imageError}
          </p>
        ) : null}
      </section>

      {report.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Smallest size that still reads
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {report.error ? DASH : report.smallestReadable === null ? "None" : `${report.smallestReadable}px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.error
                ? "Fix the measurements above"
                : `Needs a ${PX.format(report.requiredStrokeAtSource)}px stroke in the artwork for a clean 16px render`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the favicon legibility report"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tool" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Size</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Stroke</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Text</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Detail kept</th>
                <th scope="col" className="py-2 text-right font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {report.error
                ? FAVICON_SIZES.map((size) => (
                    <tr key={size} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{size}px</td>
                      <td className="py-2 pr-3 text-right">{DASH}</td>
                      <td className="py-2 pr-3 text-right">{DASH}</td>
                      <td className="py-2 pr-3 text-right">{DASH}</td>
                      <td className="py-2 text-right">{DASH}</td>
                    </tr>
                  ))
                : report.rows.map((row) => (
                    <tr key={row.size} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.size}px</td>
                      <td className="py-2 pr-3 text-right">{PX.format(row.renderedStroke)}px</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {row.textVerdict ? `${PX.format(row.renderedText)}px` : "no text"}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {row.retention === null ? DASH : `${PCT.format(row.retention * 100)}%`}
                      </td>
                      <td className="py-2 text-right">
                        <span className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${VERDICT_CLASS[row.verdict]}`}>
                          {row.verdict}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!report.error && report.issues.length > 0 && (
          <ul className="mt-5 space-y-2">
            {report.issues.map((issue) => (
              <li
                key={issue.message}
                role={issue.level === "error" ? "alert" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium ${LEVEL_CLASS[issue.level]}`}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      {previews.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Actual downscaled renders</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Left column is true size, right column is the same pixels magnified so you can see what
            the rasteriser threw away.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {previews.map((preview) => (
              <div
                key={preview.size}
                className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <img
                  src={preview.dataUrl}
                  width={preview.size}
                  height={preview.size}
                  alt={`Logo rendered at ${preview.size} by ${preview.size} pixels`}
                  className="shrink-0"
                />
                <img
                  src={preview.dataUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-16 w-16 shrink-0"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="text-sm font-semibold">{preview.size}px</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Thresholds used: a stroke needs {COMFORTABLE_STROKE_PX} device pixels to look solid and at
        least 1 to exist at all; letterforms need about {MIN_LEGIBLE_GLYPH_PX} pixels of cap height to
        stay distinguishable. Detail retention compares edge energy against a {REFERENCE_SIZE} pixel
        reference render of the same artwork.
      </p>
    </main>
  );
}
