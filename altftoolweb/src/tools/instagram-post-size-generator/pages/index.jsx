"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Instagram, RotateCcw, Upload } from "lucide-react";

import { FIT_MODES, INSTAGRAM_PRESETS, MAX_FEED_WIDTH, planBatch } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULT_SELECTED = ["square", "portrait", "landscape", "story"];
/** Stand-in dimensions so the page shows a real plan before an upload. */
const DEMO_SOURCE = { width: 2000, height: 1500, name: "example-2000x1500" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [source, setSource] = useState(DEMO_SOURCE);
  const [imageUrl, setImageUrl] = useState("");
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [mode, setMode] = useState("cover");
  const [focusX, setFocusX] = useState(50);
  const [focusY, setFocusY] = useState(50);
  const [format, setFormat] = useState("image/jpeg");
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState("");

  const imageRef = useRef(null);

  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    },
    [imageUrl],
  );

  const plan = useMemo(
    () =>
      planBatch({
        sourceWidth: source.width,
        sourceHeight: source.height,
        presetIds: selected,
        mode,
        focusX: focusX / 100,
        focusY: focusY / 100,
      }),
    [source, selected, mode, focusX, focusY],
  );

  const hasError = Boolean(plan.error);

  const onFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setLoadError("That file is not an image.");
        return;
      }
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        imageRef.current = image;
        setSource({ width: image.naturalWidth, height: image.naturalHeight, name: file.name });
        setImageUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return url;
        });
        setLoadError("");
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        setLoadError("That image could not be decoded.");
      };
      image.src = url;
    },
    [],
  );

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageRef.current = null;
    setImageUrl("");
    setSource(DEMO_SOURCE);
    setSelected(DEFAULT_SELECTED);
    setMode("cover");
    setFocusX(50);
    setFocusY(50);
    setFormat("image/jpeg");
    setCopied(false);
    setLoadError("");
  };

  const exportOne = (item) => {
    const image = imageRef.current;
    if (!image) return;
    const { preset, fit } = item;
    const canvas = document.createElement("canvas");
    canvas.width = preset.width;
    canvas.height = preset.height;
    const context = canvas.getContext("2d");
    if (!context) return;

    if (format === "image/jpeg") {
      // JPEG has no alpha channel, so letterbox bars need an explicit fill.
      // This is exported pixel data, not page chrome, so it stays a fixed white.
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.imageSmoothingQuality = "high";
    context.drawImage(image, fit.offsetX, fit.offsetY, fit.drawWidth, fit.drawHeight);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `instagram-${preset.id}-${preset.width}x${preset.height}.${
          format === "image/png" ? "png" : "jpg"
        }`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      format,
      0.92,
    );
  };

  const exportAll = () => {
    if (hasError || !imageRef.current) return;
    plan.items.forEach(exportOne);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Instagram export plan",
      `Source: ${source.width} x ${source.height} px (${NUM2.format(plan.sourceMegapixels)} MP)`,
      `Fit: ${mode === "cover" ? "fill and crop" : "fit with bars"}, anchor ${focusX}% / ${focusY}%`,
      "",
      ...plan.items.map(
        (item) =>
          `${item.preset.label} — ${item.preset.width} x ${item.preset.height} (${item.preset.ratio}), ${Math.round(item.fit.croppedAreaPercent)}% cropped, ${Math.round(item.fit.effectiveResolutionPercent)}% of needed resolution`,
      ),
    ].join("\n");
  }, [hasError, plan, source, mode, focusX, focusY]);

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

  const rows = [
    [
      "Source image",
      hasError
        ? DASH
        : `${NUM.format(source.width)} × ${NUM.format(source.height)} px (${NUM2.format(plan.sourceMegapixels)} MP)`,
    ],
    ["Sizes selected", hasError ? DASH : NUM.format(plan.items.length)],
    ["Total output", hasError ? DASH : `${NUM2.format(plan.totalMegapixels)} MP`],
    ["Worst crop at this anchor", hasError ? DASH : `${Math.round(plan.worstCropPercent)}%`],
    [
      "Any size needing upscaling",
      hasError ? DASH : plan.anyUpscaled ? "Yes — quality will drop" : "No",
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Instagram className="h-4 w-4" aria-hidden="true" />
          Platform export presets
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Instagram Post Size Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fit one image to every Instagram canvas — 1:1 square, 4:5 portrait, 1.91:1 landscape and
          the 9:16 story frame — and see exactly how much of the original each ratio throws away
          before you export. Everything runs in your browser; the image is never uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="ig-file">
          Your artwork
        </label>
        <input
          id="ig-file"
          className={`mt-2 ${INPUT_CLASS} py-2.5 file:mr-3 file:rounded file:border-0 file:bg-[var(--muted)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--foreground)]`}
          type="file"
          accept="image/*"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {imageUrl
            ? `Loaded ${source.name} at ${NUM.format(source.width)} × ${NUM.format(source.height)} px.`
            : `No image yet — the plan below uses an example ${DEMO_SOURCE.width} × ${DEMO_SOURCE.height} source so you can see the crops.`}
        </p>

        {loadError && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {loadError}
          </p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ig-mode">
              How should it fit?
            </label>
            <select
              id="ig-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setCopied(false);
              }}
            >
              {FIT_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ig-format">
              Export format
            </label>
            <select
              id="ig-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              <option value="image/jpeg">JPEG (photos)</option>
              <option value="image/png">PNG (flat colour, text)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ig-focus-x">
              Crop anchor — horizontal ({focusX}%)
            </label>
            <input
              id="ig-focus-x"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="0"
              max="100"
              step="1"
              value={focusX}
              onChange={(event) => {
                setFocusX(Number(event.target.value));
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ig-focus-y">
              Crop anchor — vertical ({focusY}%)
            </label>
            <input
              id="ig-focus-y"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="0"
              max="100"
              step="1"
              value={focusY}
              onChange={(event) => {
                setFocusY(Number(event.target.value));
                setCopied(false);
              }}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Sizes to export</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {INSTAGRAM_PRESETS.map((preset) => (
              <label
                key={preset.id}
                className="flex min-h-11 items-center gap-2 text-sm"
                htmlFor={`ig-${preset.id}`}
              >
                <input
                  id={`ig-${preset.id}`}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={selected.includes(preset.id)}
                  onChange={() => toggle(preset.id)}
                />
                <span>
                  {preset.label}{" "}
                  <span className="text-[var(--muted-foreground)]">
                    {preset.width} × {preset.height}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError && (
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
              Worst crop across selected sizes
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${Math.round(plan.worstCropPercent)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Select at least one size to see the plan."
                : `of the original image is lost at the tightest of the ${plan.items.length} selected ratios`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the export plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the image and all options"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              onClick={exportAll}
              disabled={hasError || !imageUrl}
              aria-label="Download every selected size"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export all
            </button>
          </div>
        </div>

        {!imageUrl && (
          <p className="mt-4 flex items-center gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
            Choose an image above to enable the export buttons.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 grid gap-5 sm:grid-cols-2">
          {plan.items.map((item) => {
            const { preset, fit } = item;
            return (
              <article
                key={preset.id}
                className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-sm font-semibold">{preset.label}</h2>
                  <span className="text-xs text-[var(--muted-foreground)]">{preset.ratio}</span>
                </div>

                <div
                  className="relative mx-auto mt-3 w-full max-w-[220px] overflow-hidden rounded-md bg-[var(--muted)]"
                  style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`${preset.label} preview`}
                      className="absolute origin-top-left"
                      style={{
                        width: `${fit.drawWidthRatio * 100}%`,
                        height: `${fit.drawHeightRatio * 100}%`,
                        left: `${fit.offsetXRatio * 100}%`,
                        top: `${fit.offsetYRatio * 100}%`,
                        maxWidth: "none",
                      }}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-[var(--muted-foreground)]">
                      {preset.width} × {preset.height}
                    </span>
                  )}
                  {preset.safeTop && (
                    <span
                      className="pointer-events-none absolute inset-x-0 top-0 border-b border-dashed border-[var(--warning)]"
                      style={{ height: `${(preset.safeTop / preset.height) * 100}%` }}
                      aria-hidden="true"
                    />
                  )}
                  {preset.safeBottom && (
                    <span
                      className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-dashed border-[var(--warning)]"
                      style={{ height: `${(preset.safeBottom / preset.height) * 100}%` }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <dl className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted-foreground)]">Output</dt>
                    <dd className="font-semibold">
                      {preset.width} × {preset.height} px
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted-foreground)]">Cropped away</dt>
                    <dd className="font-semibold">{Math.round(fit.croppedAreaPercent)}%</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted-foreground)]">Resolution available</dt>
                    <dd
                      className={`font-semibold ${
                        fit.effectiveResolutionPercent < 100
                          ? "text-[var(--danger)]"
                          : "text-[var(--success)]"
                      }`}
                    >
                      {Math.round(fit.effectiveResolutionPercent)}%
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => exportOne(item)}
                  disabled={!imageUrl}
                  aria-label={`Download the ${preset.label} export`}
                  className={`mt-3 w-full ${GHOST_BTN} disabled:opacity-50`}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </button>

                <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{preset.note}</p>
              </article>
            );
          })}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Instagram serves feed images at up to {MAX_FEED_WIDTH} pixels wide, so exporting larger than
        that gains nothing and only costs upload time. A resolution figure under 100% means the
        source does not have enough pixels for that canvas and is being enlarged. Platform layouts
        change, so confirm the story and Reel safe areas in the app before a big campaign.
      </p>
    </main>
  );
}
