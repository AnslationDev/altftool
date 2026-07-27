"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Image as ImageIcon, RotateCcw } from "lucide-react";

import { MAX_SCALE, MIN_SCALE, analyzeSvg, formatBytes } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120">
  <rect x="8" y="8" width="224" height="104" rx="16" fill="teal"/>
  <circle cx="72" cy="60" r="28" fill="cyan"/>
  <rect x="120" y="44" width="96" height="12" rx="6" fill="white"/>
  <rect x="120" y="66" width="64" height="12" rx="6" fill="white"/>
</svg>`;

const FORMATS = [
  { key: "image/png", label: "PNG (keeps transparency)", extension: "png" },
  { key: "image/jpeg", label: "JPEG (no transparency)", extension: "jpg" },
  { key: "image/webp", label: "WebP", extension: "webp" },
];

const BACKGROUNDS = [
  { key: "transparent", label: "Transparent" },
  { key: "white", label: "White" },
  { key: "black", label: "Black" },
];

const DASH = "—";
const num = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [markup, setMarkup] = useState(SAMPLE);
  const [scale, setScale] = useState("2");
  const [format, setFormat] = useState("image/png");
  const [background, setBackground] = useState("transparent");
  const [rasterUrl, setRasterUrl] = useState("");
  const [renderError, setRenderError] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const result = useMemo(() => analyzeSvg(markup, { scale: Number(scale) }), [markup, scale]);
  const hasError = Boolean(result.error);

  useEffect(() => {
    if (hasError) {
      setRasterUrl("");
      setRenderError("");
      return undefined;
    }
    let cancelled = false;
    const image = new window.Image();
    image.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = result.outputWidth;
      canvas.height = result.outputHeight;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      const opaque = background !== "transparent" || format === "image/jpeg";
      if (opaque) {
        context.fillStyle = background === "black" ? "black" : "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      try {
        setRasterUrl(canvas.toDataURL(format));
        setRenderError("");
      } catch {
        setRasterUrl("");
        setRenderError("The canvas is tainted, usually by an external image or font reference in the SVG.");
      }
    };
    image.onerror = () => {
      if (cancelled) return;
      setRasterUrl("");
      setRenderError("The browser could not parse this SVG. Check for malformed tags or unescaped & characters.");
    };
    image.src = result.dataUri;
    return () => {
      cancelled = true;
    };
  }, [hasError, result.dataUri, result.outputWidth, result.outputHeight, format, background]);

  const copyDataUri = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.dataUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    if (!rasterUrl) return;
    const chosen = FORMATS.find((item) => item.key === format) || FORMATS[0];
    const link = document.createElement("a");
    link.href = rasterUrl;
    link.download = `svg-export-${result.outputWidth}x${result.outputHeight}.${chosen.extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const reset = () => {
    setMarkup(SAMPLE);
    setScale("2");
    setFormat("image/png");
    setBackground("transparent");
    setCopied(false);
    setRenderError("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          Converter
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SVG to Image</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste SVG markup, pick a scale, and download a raster PNG, JPEG or WebP. The conversion
          runs on a canvas in your own browser — nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="svg-markup">
          SVG markup
        </label>
        <textarea
          id="svg-markup"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={10}
          spellCheck={false}
          value={markup}
          onChange={(event) => setMarkup(event.target.value)}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="svg-scale">
              Scale factor
            </label>
            <input
              id="svg-scale"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step="0.5"
              value={scale}
              onChange={(event) => setScale(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svg-format">
              Output format
            </label>
            <select
              id="svg-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {FORMATS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="svg-bg">
              Background
            </label>
            <select
              id="svg-bg"
              className={`mt-2 ${INPUT_CLASS}`}
              value={background}
              onChange={(event) => setBackground(event.target.value)}
            >
              {BACKGROUNDS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      {!hasError && renderError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {renderError}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Output size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
              {hasError ? DASH : `${num.format(result.outputWidth)}×${num.format(result.outputHeight)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${num.format(result.pixels)} pixels · ${formatBytes(result.canvasBytes)} in canvas memory`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={download}
              aria-label="Download the rasterised image"
              className={GHOST_BTN}
              disabled={hasError || !rasterUrl}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </button>
            <button
              type="button"
              onClick={copyDataUri}
              aria-label="Copy the SVG data URI"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy data URI"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample SVG" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Intrinsic size",
              hasError ? DASH : `${num.format(result.intrinsicWidth)}×${num.format(result.intrinsicHeight)} px`,
            ],
            ["Size taken from", hasError ? DASH : result.dimensionSource],
            ["Has viewBox", hasError ? DASH : result.hasViewBox ? "Yes" : "No"],
            ["Aspect ratio", hasError ? DASH : `${result.aspectRatio}:1`],
            ["Scale applied", hasError ? DASH : `${result.scale}×`],
            ["Markup length", hasError ? DASH : `${num.format(result.markupCharacters)} chars`],
            [
              "Stripped",
              hasError
                ? DASH
                : `${result.removedScripts} script(s), ${result.removedHandlers} handler(s)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Before you export</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Preview</h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          {rasterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rasterUrl}
              alt="Rasterised preview of the pasted SVG"
              className="mx-auto block h-auto max-w-full"
            />
          ) : (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              Nothing rendered yet.
            </p>
          )}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Text renders with whatever font the browser has installed. For an export that matches your
        design exactly, convert text to outlines in the source SVG before pasting it here.
      </p>
    </main>
  );
}
