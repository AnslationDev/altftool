"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LayoutTemplate, RotateCcw } from "lucide-react";
import {
  ELEMENT_PRESETS,
  RESOLUTION_PRESETS,
  computeOverlayLayout,
  rectToPercent,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  canvasW: "1920",
  canvasH: "1080",
  outW: "1280",
  outH: "720",
  widthPct: "25",
  aspectW: "16",
  aspectH: "9",
  margin: "5",
  assetW: "",
  anchor: "bottom-right",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return 0;
  return Number(text);
};

export default function ToolHome() {
  const [canvasW, setCanvasW] = useState(DEFAULTS.canvasW);
  const [canvasH, setCanvasH] = useState(DEFAULTS.canvasH);
  const [outW, setOutW] = useState(DEFAULTS.outW);
  const [outH, setOutH] = useState(DEFAULTS.outH);
  const [widthPct, setWidthPct] = useState(DEFAULTS.widthPct);
  const [aspectW, setAspectW] = useState(DEFAULTS.aspectW);
  const [aspectH, setAspectH] = useState(DEFAULTS.aspectH);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [assetW, setAssetW] = useState(DEFAULTS.assetW);
  const [anchor, setAnchor] = useState(DEFAULTS.anchor);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeOverlayLayout({
        canvasWidth: toNumber(canvasW),
        canvasHeight: toNumber(canvasH),
        outputWidth: toNumber(outW),
        outputHeight: toNumber(outH),
        elementWidthPct: toNumber(widthPct),
        aspectW: toNumber(aspectW),
        aspectH: toNumber(aspectH),
        safeMarginPct: toNumber(margin),
        sourceAssetWidth: toNumber(assetW),
      }),
    [canvasW, canvasH, outW, outH, widthPct, aspectW, aspectH, margin, assetW],
  );

  const hasError = Boolean(result.error);

  const chosen = useMemo(() => {
    if (hasError) return null;
    return result.positions.find((p) => p.id === anchor) || result.positions[0];
  }, [hasError, result, anchor]);

  const preview = useMemo(() => {
    if (hasError || !chosen) return null;
    return rectToPercent({
      x: chosen.x,
      y: chosen.y,
      width: result.elementCanvasWidth,
      height: result.elementCanvasHeight,
      canvasWidth: toNumber(canvasW),
      canvasHeight: toNumber(canvasH),
    });
  }, [hasError, chosen, result, canvasW, canvasH]);

  const safePreview = useMemo(() => {
    if (hasError) return null;
    return rectToPercent({
      x: result.margin,
      y: result.margin,
      width: result.freeWidth,
      height: result.freeHeight,
      canvasWidth: toNumber(canvasW),
      canvasHeight: toNumber(canvasH),
    });
  }, [hasError, result, canvasW, canvasH]);

  const summary = useMemo(() => {
    if (hasError || !chosen) return "";
    return [
      "Stream overlay size",
      `Canvas: ${NUM.format(toNumber(canvasW))} × ${NUM.format(toNumber(canvasH))} (${result.canvasAspectLabel})`,
      `Output: ${NUM.format(toNumber(outW))} × ${NUM.format(toNumber(outH))} (${result.outputAspectLabel}), scale ${NUM2.format(result.scaleX)}×`,
      `Element on canvas: ${result.elementCanvasWidth} × ${result.elementCanvasHeight} px`,
      `Element after output scaling: ${result.elementOutputWidth} × ${result.elementOutputHeight} px`,
      `Position (${chosen.label}): X ${chosen.x}, Y ${chosen.y}`,
      `Safe margin: ${result.margin} px`,
      `Export artwork at: ${result.exportWidth1x} × ${result.exportHeight1x} px (2× ${result.exportWidth2x} × ${result.exportHeight2x})`,
    ].join("\n");
  }, [hasError, chosen, result, canvasW, canvasH, outW, outH]);

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
    setCanvasW(DEFAULTS.canvasW);
    setCanvasH(DEFAULTS.canvasH);
    setOutW(DEFAULTS.outW);
    setOutH(DEFAULTS.outH);
    setWidthPct(DEFAULTS.widthPct);
    setAspectW(DEFAULTS.aspectW);
    setAspectH(DEFAULTS.aspectH);
    setMargin(DEFAULTS.margin);
    setAssetW(DEFAULTS.assetW);
    setAnchor(DEFAULTS.anchor);
    setCopied(false);
  };

  const applyResolution = (id, isCanvas) => {
    const preset = RESOLUTION_PRESETS.find((r) => r.id === id);
    if (!preset) return;
    if (isCanvas) {
      setCanvasW(String(preset.width));
      setCanvasH(String(preset.height));
    } else {
      setOutW(String(preset.width));
      setOutH(String(preset.height));
    }
  };

  const applyElement = (id) => {
    const preset = ELEMENT_PRESETS.find((e) => e.id === id);
    if (!preset) return;
    setWidthPct(String(preset.widthPct));
    setAspectW(String(preset.aspectW));
    setAspectH(String(preset.aspectH));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
          Live streaming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Stream Overlay Size Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Size a facecam, chat box or alert to a share of your canvas, get the exact X/Y transform
          values for a safe-area anchor, and see the pixel size after output scaling.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-canvas-preset">
              Canvas (base) resolution
            </label>
            <select
              id="ov-canvas-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value=""
              onChange={(event) => applyResolution(event.target.value, true)}
            >
              <option value="">Choose a preset…</option>
              {RESOLUTION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-output-preset">
              Output (scaled) resolution
            </label>
            <select
              id="ov-output-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value=""
              onChange={(event) => applyResolution(event.target.value, false)}
            >
              <option value="">Choose a preset…</option>
              {RESOLUTION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-canvas-w">
              Canvas width (px)
            </label>
            <input
              id="ov-canvas-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={canvasW}
              onChange={(event) => setCanvasW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-canvas-h">
              Canvas height (px)
            </label>
            <input
              id="ov-canvas-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={canvasH}
              onChange={(event) => setCanvasH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-out-w">
              Output width (px)
            </label>
            <input
              id="ov-out-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={outW}
              onChange={(event) => setOutW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-out-h">
              Output height (px)
            </label>
            <input
              id="ov-out-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={outH}
              onChange={(event) => setOutH(event.target.value)}
            />
          </div>
        </div>

        <hr className="my-5 border-[var(--border)]" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ov-element-preset">
              Overlay element
            </label>
            <select
              id="ov-element-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value=""
              onChange={(event) => applyElement(event.target.value)}
            >
              <option value="">Choose a typical element…</option>
              {ELEMENT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} — {preset.widthPct}% wide, {preset.aspectW}:{preset.aspectH}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-width-pct">
              Element width (% of canvas width)
            </label>
            <input
              id="ov-width-pct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={widthPct}
              onChange={(event) => setWidthPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-margin">
              Safe margin (% of short edge)
            </label>
            <input
              id="ov-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="49"
              step="1"
              value={margin}
              onChange={(event) => setMargin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-aspect-w">
              Element aspect — width part
            </label>
            <input
              id="ov-aspect-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={aspectW}
              onChange={(event) => setAspectW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-aspect-h">
              Element aspect — height part
            </label>
            <input
              id="ov-aspect-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={aspectH}
              onChange={(event) => setAspectH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-anchor">
              Anchor position
            </label>
            <select
              id="ov-anchor"
              className={`mt-2 ${INPUT_CLASS}`}
              value={anchor}
              onChange={(event) => setAnchor(event.target.value)}
            >
              {(result.positions || []).map((position) => (
                <option key={position.id} value={position.id}>
                  {position.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ov-asset">
              Artwork you already have (px wide, optional)
            </label>
            <input
              id="ov-asset"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={assetW}
              onChange={(event) => setAssetW(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Element size on the canvas
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : `${result.elementCanvasWidth} × ${result.elementCanvasHeight}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the layout."
                : `${NUM2.format(result.elementCanvasAreaPct)}% of the canvas area`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy overlay size result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Canvas → output scale",
              hasError ? DASH : `${NUM2.format(result.scaleX)}× wide, ${NUM2.format(result.scaleY)}× tall`,
            ],
            [
              "Aspect ratios",
              hasError ? DASH : `${result.canvasAspectLabel} canvas / ${result.outputAspectLabel} output`,
            ],
            [
              "Size after output scaling",
              hasError ? DASH : `${result.elementOutputWidth} × ${result.elementOutputHeight} px`,
            ],
            [
              `Position (${chosen ? chosen.label : "anchor"})`,
              hasError || !chosen ? DASH : `X ${chosen.x} px, Y ${chosen.y} px`,
            ],
            ["Safe margin", hasError ? DASH : `${result.margin} px on every edge`],
            [
              "Safe area",
              hasError ? DASH : `${result.freeWidth} × ${result.freeHeight} px`,
            ],
            [
              "Export artwork at",
              hasError
                ? DASH
                : `${result.exportWidth1x} × ${result.exportHeight1x} px (2× = ${result.exportWidth2x} × ${result.exportHeight2x})`,
            ],
            [
              "Scale for your existing artwork",
              hasError || result.assetScalePct === 0
                ? DASH
                : `${NUM.format(result.assetScalePct)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError &&
          result.warnings.map((warning) => (
            <p
              key={warning}
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </p>
          ))}
      </section>

      {!hasError && preview && safePreview && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Canvas preview</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Dashed line is the safe area, filled block is the element.
          </p>
          <div
            className="relative mt-3 w-full overflow-hidden rounded-md border border-[var(--border)] bg-[var(--muted)]"
            style={{ aspectRatio: `${toNumber(canvasW)} / ${toNumber(canvasH)}` }}
            role="img"
            aria-label={`Preview of the element placed at ${chosen ? chosen.label : "the chosen anchor"}`}
          >
            <span
              className="absolute rounded-sm border border-dashed border-[var(--muted-foreground)]"
              style={{
                left: `${safePreview.left}%`,
                top: `${safePreview.top}%`,
                width: `${safePreview.width}%`,
                height: `${safePreview.height}%`,
              }}
            />
            <span
              className="absolute rounded-sm bg-[var(--primary)] opacity-80"
              style={{
                left: `${preview.left}%`,
                top: `${preview.top}%`,
                width: `${preview.width}%`,
                height: `${preview.height}%`,
              }}
            />
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">X / Y for every anchor</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Anchor</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Position X</th>
                  <th scope="col" className="py-2 text-right font-semibold">Position Y</th>
                </tr>
              </thead>
              <tbody>
                {result.positions.map((position) => (
                  <tr key={position.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{position.label}</td>
                    <td className="py-2 pr-3 text-right">{position.x} px</td>
                    <td className="py-2 text-right">{position.y} px</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        X and Y are top-left coordinates on the base canvas, which is what OBS position fields
        expect when the source alignment is set to top-left.
      </p>
    </main>
  );
}
