"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SquareDashed } from "lucide-react";

import {
  barDepthPresets,
  computeCanvasWrap,
  DEFAULT_BACK_TUCK_IN,
  DEFAULT_SAFE_MARGIN_IN,
  fromMillimetres,
  MM_PER_INCH,
  TARGET_DPI,
  UNITS,
  wrapPreview,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const UNIT_LABELS = { mm: "Millimetres", cm: "Centimetres", in: "Inches" };

const DEFAULT_UNIT = "cm";

/** Render a lib.js inch constant in DEFAULT_UNIT, same rounding barDepthPresets uses. */
const formatInchesAsDefaultUnit = (inches) => {
  const converted = fromMillimetres(inches * MM_PER_INCH, DEFAULT_UNIT);
  return converted === null ? "" : String(Math.round(converted * 100) / 100);
};

const DEFAULTS = {
  faceWidth: "40",
  faceHeight: "50",
  unit: DEFAULT_UNIT,
  barDepth: "3.81",
  backTuck: formatInchesAsDefaultUnit(DEFAULT_BACK_TUCK_IN),
  safeMargin: formatInchesAsDefaultUnit(DEFAULT_SAFE_MARGIN_IN),
  pixels: "6000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [faceWidth, setFaceWidth] = useState(DEFAULTS.faceWidth);
  const [faceHeight, setFaceHeight] = useState(DEFAULTS.faceHeight);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [barDepth, setBarDepth] = useState(DEFAULTS.barDepth);
  const [backTuck, setBackTuck] = useState(DEFAULTS.backTuck);
  const [safeMargin, setSafeMargin] = useState(DEFAULTS.safeMargin);
  const [pixels, setPixels] = useState(DEFAULTS.pixels);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCanvasWrap({
        faceWidth,
        faceHeight,
        unit,
        barDepth,
        backTuck,
        safeMargin,
        imagePixelWidth: pixels,
      }),
    [faceWidth, faceHeight, unit, barDepth, backTuck, safeMargin, pixels],
  );

  const error = result.error || null;
  const preview = error ? null : wrapPreview(result);
  const presets = useMemo(() => barDepthPresets(unit), [unit]);

  const inUnit = (valueMm) => {
    if (error || !Number.isFinite(valueMm)) return "—";
    const converted = fromMillimetres(valueMm, unit);
    if (converted === null) return "—";
    return `${(unit === "in" ? NUM2 : NUM1).format(converted)} ${unit}`;
  };

  const pair = (a, b) => (error ? "—" : `${inUnit(a)} × ${inUnit(b)}`);
  const pctText = (value) => (error || !Number.isFinite(value) ? "—" : `${NUM1.format(value)}%`);

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Canvas Wrap Bleed Calculator",
      `Visible face: ${NUM1.format(result.faceWmm)} × ${NUM1.format(result.faceHmm)} mm`,
      `Bar depth: ${NUM1.format(result.depthMm)} mm · back tuck: ${NUM1.format(result.tuckMm)} mm`,
      `Bleed per side: ${NUM1.format(result.bleedPerSideMm)} mm`,
      `Total print size: ${NUM1.format(result.printWmm)} × ${NUM1.format(result.printHmm)} mm`,
      `Safe zone on the face: ${NUM1.format(result.safeWmm)} × ${NUM1.format(result.safeHmm)} mm`,
      `Image hidden by the wrap: ${NUM1.format(result.hiddenAreaPct)}%`,
      `Extra material versus a flat print: ${NUM1.format(result.extraMaterialPct)}%`,
      `Pixels needed at ${TARGET_DPI} DPI: ${result.requiredPixels.widthPx} × ${result.requiredPixels.heightPx}`,
    ].join("\n");
  }, [error, result]);

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
    setFaceWidth(DEFAULTS.faceWidth);
    setFaceHeight(DEFAULTS.faceHeight);
    setUnit(DEFAULTS.unit);
    setBarDepth(DEFAULTS.barDepth);
    setBackTuck(DEFAULTS.backTuck);
    setSafeMargin(DEFAULTS.safeMargin);
    setPixels(DEFAULTS.pixels);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SquareDashed className="h-4 w-4" aria-hidden="true" />
          Gallery wrap
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Canvas Wrap Bleed Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give the finished face size and the stretcher bar depth, and get the full print size,
          the bleed on every edge and the safe zone your subject must stay inside.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cwb-face-w">
              Visible face width
            </label>
            <input
              id="cwb-face-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={faceWidth}
              onChange={(event) => setFaceWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cwb-face-h">
              Visible face height
            </label>
            <input
              id="cwb-face-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={faceHeight}
              onChange={(event) => setFaceHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cwb-unit">
              Working unit
            </label>
            <select
              id="cwb-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((value) => (
                <option key={value} value={value}>
                  {UNIT_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cwb-depth">
              Stretcher bar depth
            </label>
            <input
              id="cwb-depth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={barDepth}
              onChange={(event) => setBarDepth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cwb-tuck">
              Back tuck (stapling allowance)
            </label>
            <input
              id="cwb-tuck"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={backTuck}
              onChange={(event) => setBackTuck(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cwb-safe">
              Safe margin inside the face
            </label>
            <input
              id="cwb-safe"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={safeMargin}
              onChange={(event) => setSafeMargin(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cwb-pixels">
              Source file width (pixels, optional)
            </label>
            <input
              id="cwb-pixels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={pixels}
              onChange={(event) => setPixels(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setBarDepth(preset.value)}
              className={CHIP_BTN}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total print size (with bleed)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : pair(result.printWmm, result.printHmm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the input above to see the wrap geometry."
                : `${inUnit(result.bleedPerSideMm)} of bleed on every edge`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy canvas wrap result"
              className={GHOST_BTN}
              disabled={!summary}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
            ["Visible face", error ? "—" : pair(result.faceWmm, result.faceHmm)],
            ["Bleed per edge (depth + tuck)", error ? "—" : inUnit(result.bleedPerSideMm)],
            ["Safe zone on the face", error ? "—" : pair(result.safeWmm, result.safeHmm)],
            ["Sheet edge to safe zone", error ? "—" : inUnit(result.edgeToSafeMm)],
            ["Image area hidden by the wrap", pctText(error ? null : result.hiddenAreaPct)],
            ["Extra material vs a flat print", pctText(error ? null : result.extraMaterialPct)],
            ["Safe zone as share of the sheet", pctText(error ? null : result.safeSharePct)],
            [
              `Pixels needed at ${TARGET_DPI} DPI`,
              error ? "—" : `${NUM0.format(result.requiredPixels.widthPx)} × ${NUM0.format(result.requiredPixels.heightPx)} px`,
            ],
            [
              "Resolution of your file at print size",
              error || result.printDpi === null ? "—" : `${NUM0.format(result.printDpi)} DPI`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        {preview ? (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Where each band sits on the printed sheet
            </p>
            <div
              className="relative mx-auto w-full max-w-[260px] rounded-sm bg-[var(--muted)]"
              style={{ paddingBottom: `${preview.aspectPct}%` }}
              role="img"
              aria-label={`Printed sheet with a back tuck band, a visible side band and a safe zone that starts ${NUM1.format(result.edgeToSafeMm)} millimetres in from every edge`}
            >
              <span
                className="absolute block bg-[var(--border)]"
                style={{
                  left: `${preview.tuckInsetXPct}%`,
                  right: `${preview.tuckInsetXPct}%`,
                  top: `${preview.tuckInsetYPct}%`,
                  bottom: `${preview.tuckInsetYPct}%`,
                }}
              />
              <span
                className="absolute block bg-[var(--primary)]/25"
                style={{
                  left: `${preview.faceInsetXPct}%`,
                  right: `${preview.faceInsetXPct}%`,
                  top: `${preview.faceInsetYPct}%`,
                  bottom: `${preview.faceInsetYPct}%`,
                }}
              />
              <span
                className="absolute block border-2 border-dashed border-[var(--primary)]"
                style={{
                  left: `${preview.safeInsetXPct}%`,
                  right: `${preview.safeInsetXPct}%`,
                  top: `${preview.safeInsetYPct}%`,
                  bottom: `${preview.safeInsetYPct}%`,
                }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Outer grey is the back tuck · mid band is the visible side · dashed line is the safe zone
            </p>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Bar depths and tuck allowances vary between printers. Confirm the bleed your lab wants
        before exporting, and add a mirrored or extended edge if you do not want image content on
        the sides.
      </p>
    </main>
  );
}
