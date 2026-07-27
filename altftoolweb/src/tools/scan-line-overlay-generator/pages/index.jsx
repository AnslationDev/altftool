"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, ScanLine } from "lucide-react";

import {
  ALIASING_PERIOD_PX,
  CRT_STANDARDS,
  MAX_PERIOD,
  MAX_SIZE,
  MIN_PERIOD,
  MIN_SIZE,
  STYLES,
  TONES,
  buildOverlayCss,
  buildOverlaySvg,
  computeOverlay,
  formatOverlayText,
  periodForStandard,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  width: "1920",
  height: "1080",
  style: "horizontal",
  period: "4",
  thickness: "2",
  opacity: "0.35",
  tone: "dark",
};

const DASH = "—";

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const { value } = event.target;
    setFields((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const spec = useMemo(
    () =>
      computeOverlay({
        width: Number(fields.width),
        height: Number(fields.height),
        style: fields.style,
        period: Number(fields.period),
        thickness: Number(fields.thickness),
        opacity: Number(fields.opacity),
        tone: fields.tone,
      }),
    [fields],
  );

  const hasError = Boolean(spec.error);
  const svg = useMemo(() => (hasError ? "" : buildOverlaySvg(spec)), [spec, hasError]);
  const css = useMemo(() => (hasError ? "" : buildOverlayCss(spec)), [spec, hasError]);
  const summary = useMemo(() => (hasError ? "" : formatOverlayText(spec)), [spec, hasError]);

  const applyStandard = (standardId) => {
    const result = periodForStandard(Number(fields.height), standardId);
    if (result.error) return;
    setFields((prev) => ({
      ...prev,
      period: String(result.period),
      thickness: String(Math.max(0.5, Math.round((result.period / 2) * 100) / 100)),
    }));
    setCopied("");
  };

  const copy = async (kind, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const downloadFile = (contents, type, extension) => {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scanlines-${spec.style}-${spec.period}px.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = spec.width;
      canvas.height = spec.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, spec.width, spec.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `scanlines-${spec.style}-${spec.period}px.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  };

  const reset = () => {
    setFields(DEFAULTS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanLine className="h-4 w-4" aria-hidden="true" />
          Backgrounds and textures
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Scan Line Overlay Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build CRT scan lines, aperture grille stripes or an RGB shadow mask, see how much light the
          overlay actually removes, and export it as a transparent SVG or PNG.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="scan-width">
              Width (px)
            </label>
            <input
              id="scan-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_SIZE}
              max={MAX_SIZE}
              step="10"
              value={fields.width}
              onChange={set("width")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scan-height">
              Height (px)
            </label>
            <input
              id="scan-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_SIZE}
              max={MAX_SIZE}
              step="10"
              value={fields.height}
              onChange={set("height")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="scan-style">
              Pattern style
            </label>
            <select id="scan-style" className={`mt-2 ${INPUT_CLASS}`} value={fields.style} onChange={set("style")}>
              {Object.values(STYLES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scan-period">
              Line period (px)
            </label>
            <input
              id="scan-period"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_PERIOD}
              max={MAX_PERIOD}
              step="0.5"
              value={fields.period}
              onChange={set("period")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scan-thickness">
              Line thickness (px)
            </label>
            <input
              id="scan-thickness"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={fields.thickness}
              onChange={set("thickness")}
              disabled={fields.style === "triad"}
            />
            {fields.style === "triad" ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                The RGB mask fills the whole period with three equal stripes.
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scan-opacity">
              Opacity (0-1)
            </label>
            <input
              id="scan-opacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="1"
              step="0.05"
              value={fields.opacity}
              onChange={set("opacity")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scan-tone">
              Line tone
            </label>
            <select id="scan-tone" className={`mt-2 ${INPUT_CLASS}`} value={fields.tone} onChange={set("tone")}>
              {Object.values(TONES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Match a CRT standard at this height
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.values(CRT_STANDARDS).map((standard) => (
              <button
                key={standard.id}
                type="button"
                onClick={() => applyStandard(standard.id)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {standard.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {spec.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Perceived brightness change
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${spec.brightnessChangePercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above"
                : `${spec.lineCount} lines · ${spec.coveragePercent}% coverage at ${spec.opacity} alpha`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("css", css)}
              disabled={hasError}
              aria-label="Copy the CSS overlay"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "css" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "css" ? "Copied!" : "Copy CSS"}
            </button>
            <button
              type="button"
              onClick={() => copy("text", summary)}
              disabled={hasError}
              aria-label="Copy the overlay settings"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "text" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "text" ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={() => downloadFile(svg, "image/svg+xml", "svg")}
              disabled={hasError}
              aria-label="Download the overlay as SVG"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              SVG
            </button>
            <button
              type="button"
              onClick={downloadPng}
              disabled={hasError}
              aria-label="Download the overlay as a transparent PNG"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              PNG
            </button>
            <button type="button" onClick={reset} aria-label="Reset all settings" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Pattern", hasError ? DASH : spec.styleLabel],
            ["Line / gap", hasError ? DASH : `${spec.thickness} px line, ${spec.gap} px gap`],
            ["Surface coverage", hasError ? DASH : `${spec.coveragePercent}%`],
            ["Average alpha over the whole overlay", hasError ? DASH : `${spec.averageAlphaPercent}%`],
            ["Line density", hasError ? DASH : `${spec.linesPerThousandPx} lines per 1000 px`],
            ["Output size", hasError ? DASH : `${spec.width} × ${spec.height} px`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && spec.aliasingRisk ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            A {spec.period} px period is under the {ALIASING_PERIOD_PX} px moiré threshold. It will
            shimmer once the overlay is scaled or viewed on a non-integer zoom.
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Preview</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border)]">
              <div
                className="flex h-48 items-center justify-center bg-[var(--muted)] text-lg font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
                  backgroundRepeat: "repeat",
                }}
              >
                Insert coin
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              The preview tiles the generated SVG over a flat surface, so the stripe rhythm is real
              even though the colours underneath are not your artwork.
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">CSS-only version</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5">
              {css}
            </pre>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Fine repeating patterns can trigger discomfort for some viewers and interfere with screen
        readers when used behind text. Keep the overlay decorative, mark it aria-hidden, and avoid
        animating it for anyone who has asked for reduced motion.
      </p>
    </main>
  );
}
