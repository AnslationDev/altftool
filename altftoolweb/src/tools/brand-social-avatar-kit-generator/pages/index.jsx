"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, CircleUserRound, Copy, RotateCcw, Upload } from "lucide-react";

import { AVATAR_SPECS, DEFAULT_SELECTION, computeCrop, computeSafeZone, planAvatarKit } from "../lib";

const PREVIEW_SIZE = 320;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

export default function ToolHome() {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [selected, setSelected] = useState(DEFAULT_SELECTION);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const plan = useMemo(
    () =>
      planAvatarKit({
        sourceWidth: image?.width ?? 0,
        sourceHeight: image?.height ?? 0,
        selected,
        zoom,
      }),
    [image, selected, zoom],
  );

  const hasError = Boolean(plan.error) || Boolean(loadError);
  const errorMessage = loadError || plan.error;
  const dash = "—";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    if (!image) return;

    const crop = computeCrop({
      sourceWidth: image.width,
      sourceHeight: image.height,
      zoom,
      offsetX,
      offsetY,
    });
    if (crop.error) return;

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image.element,
      crop.sx,
      crop.sy,
      crop.size,
      crop.size,
      0,
      0,
      PREVIEW_SIZE,
      PREVIEW_SIZE,
    );
  }, [image, zoom, offsetX, offsetY]);

  const onFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLoadError("That file is not an image. Use a PNG, JPEG, WebP or SVG.");
      return;
    }
    const url = URL.createObjectURL(file);
    const element = new Image();
    element.onload = () => {
      setImage({ element, width: element.naturalWidth, height: element.naturalHeight, url });
      setFileName(file.name);
      setLoadError("");
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      setLoadError("The browser could not decode that image.");
    };
    element.src = url;
  }, []);

  const toggleSpec = (key) => {
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const exportOne = useCallback(
    (spec) => {
      if (!image) return;
      const crop = computeCrop({
        sourceWidth: image.width,
        sourceHeight: image.height,
        zoom,
        offsetX,
        offsetY,
      });
      if (crop.error) return;
      const out = document.createElement("canvas");
      out.width = spec.size;
      out.height = spec.size;
      const ctx = out.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image.element, crop.sx, crop.sy, crop.size, crop.size, 0, 0, spec.size, spec.size);
      out.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = spec.filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }, "image/png");
    },
    [image, zoom, offsetX, offsetY],
  );

  const exportAll = useCallback(() => {
    if (hasError || !plan.rows) return;
    plan.rows.forEach((spec, index) => {
      setTimeout(() => exportOne(spec), index * 250);
    });
  }, [exportOne, hasError, plan]);

  const copySpecs = async () => {
    if (hasError) return;
    const text = [
      "Social avatar kit",
      `Source: ${fileName || "untitled"} ${plan.sourceWidth}x${plan.sourceHeight}`,
      `Square crop used: ${plan.cropSide} px`,
      `Circle-safe centre square: ${plan.safeSidePercent.toFixed(2)}% of width (inset ${plan.safeInsetPercent.toFixed(2)}%)`,
      "",
      ...plan.rows.map(
        (row) => `${row.label}: ${row.size}x${row.size} -> ${row.filename} (${row.quality})`,
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setSelected(DEFAULT_SELECTION);
    setShowSafeZone(true);
    setCopied(false);
    setLoadError("");
  };

  const previewSafe = computeSafeZone(PREVIEW_SIZE);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CircleUserRound className="h-4 w-4" aria-hidden="true" />
          Avatar kit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Brand Social Avatar Kit Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Load one square master, position it once, and export a PNG at each platform&apos;s
          recommended profile-picture size. Everything runs in your browser — no upload.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="avatar-file">
          Source image (square works best)
        </label>
        <input
          id="avatar-file"
          className={`mt-2 ${INPUT_CLASS} py-2`}
          type="file"
          accept="image/*"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {image ? `${fileName} · ${image.width} × ${image.height} px` : "Nothing loaded yet."}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="avatar-zoom">
              Zoom ({zoom.toFixed(2)}×)
            </label>
            <input
              id="avatar-zoom"
              className="mt-3 h-11 w-full cursor-pointer accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              type="range"
              min="1"
              max="4"
              step="0.05"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="avatar-offsetx">
              Horizontal position
            </label>
            <input
              id="avatar-offsetx"
              className="mt-3 h-11 w-full cursor-pointer accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              type="range"
              min="-1"
              max="1"
              step="0.02"
              value={offsetX}
              onChange={(event) => setOffsetX(Number(event.target.value))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="avatar-offsety">
              Vertical position
            </label>
            <input
              id="avatar-offsety"
              className="mt-3 h-11 w-full cursor-pointer accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              type="range"
              min="-1"
              max="1"
              step="0.02"
              value={offsetY}
              onChange={(event) => setOffsetY(Number(event.target.value))}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="avatar-safezone"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={showSafeZone}
              onChange={(event) => setShowSafeZone(event.target.checked)}
            />
            <label className="text-sm font-semibold" htmlFor="avatar-safezone">
              Show circle crop and safe square
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Preview</h2>
        <div className="mt-4 flex justify-center">
          <div className="relative w-full" style={{ maxWidth: `${PREVIEW_SIZE}px` }}>
            <canvas
              ref={canvasRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              aria-label="Cropped avatar preview"
              className="h-auto w-full rounded-md bg-[var(--muted)] ring-1 ring-[var(--border)]"
            />
            {showSafeZone && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[var(--primary)]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute border-2 border-dashed border-[var(--success)]"
                  style={{
                    left: `${(previewSafe.inset / PREVIEW_SIZE) * 100}%`,
                    top: `${(previewSafe.inset / PREVIEW_SIZE) * 100}%`,
                    width: `${(previewSafe.side / PREVIEW_SIZE) * 100}%`,
                    height: `${(previewSafe.side / PREVIEW_SIZE) * 100}%`,
                  }}
                />
              </>
            )}
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
          The circle is what every platform shows. The dashed square is the 70.71% centre area that
          always survives the crop — keep the wordmark inside it.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Platforms</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {AVATAR_SPECS.map((spec) => (
            <label
              key={spec.key}
              className="flex items-start gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              htmlFor={`spec-${spec.key}`}
            >
              <input
                id={`spec-${spec.key}`}
                type="checkbox"
                className="mt-1 h-5 w-5 accent-[var(--primary)]"
                checked={selected.includes(spec.key)}
                onChange={() => toggleSpec(spec.key)}
              />
              <span>
                <span className="font-semibold">{spec.label}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">{spec.note}</span>
              </span>
            </label>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Exports ready
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : plan.rows.length}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : plan.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySpecs}
              aria-label="Copy the export list"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={exportAll}
              aria-label="Download every selected avatar size"
              className={PRIMARY_BTN}
              disabled={hasError}
            >
              <Upload className="h-4 w-4 rotate-180" aria-hidden="true" />
              Download all
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset crop and selection"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Source", dash],
                ["Square crop used", dash],
                ["Recommended master", dash],
                ["Circle-safe centre square", dash],
              ]
            : [
                [
                  "Source",
                  `${plan.sourceWidth} × ${plan.sourceHeight} px${
                    plan.isSquareSource ? " (square)" : " (not square — sides will be cropped)"
                  }`,
                ],
                ["Square crop used", `${plan.cropSide} px`],
                [
                  "Recommended master",
                  `${plan.recommendedSource} × ${plan.recommendedSource} px (2× the largest target)`,
                ],
                ["Circle-safe centre square", `${plan.safeSidePercent.toFixed(2)}% of width`],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Export plan</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Platform
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Size
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Quality
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    PNG
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{row.size}px</td>
                    <td
                      className={`py-2 pr-3 ${
                        row.upscaled ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {row.quality}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => exportOne(row)}
                        aria-label={`Download the ${row.label} avatar at ${row.size} pixels`}
                        className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes are the square upload dimensions each platform currently recommends; platforms change
        them without notice, so keep an oversized square master and re-export when they do.
      </p>
    </main>
  );
}
