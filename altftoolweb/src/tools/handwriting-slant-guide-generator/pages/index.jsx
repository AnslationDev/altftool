"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Italic, Printer, RotateCcw } from "lucide-react";

import {
  MAX_ANGLE_DEG,
  MAX_SPACING_MM,
  MAX_X_HEIGHT_MM,
  MIN_ANGLE_DEG,
  MIN_SPACING_MM,
  MIN_X_HEIGHT_MM,
  PAGE_SIZES,
  SLANT_PRESETS,
  buildSlantGuide,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const MM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const mm = (value) => `${MM.format(value)} mm`;
const deg = (value) => `${MM.format(value)}°`;

const DEFAULTS = {
  pageSize: "a4",
  angleDeg: "55",
  spacingMm: "10",
  xHeightMm: "6",
  ascenderMm: "5",
  descenderMm: "5",
  rowGapMm: "6",
  marginMm: "15",
  showXHeightLines: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #slant-print-area, #slant-print-area * { visibility: visible !important; }
  #slant-print-area { position: absolute; inset: 0 auto auto 0; width: 100%; }
}
`;

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
  const [angleDeg, setAngleDeg] = useState(DEFAULTS.angleDeg);
  const [spacingMm, setSpacingMm] = useState(DEFAULTS.spacingMm);
  const [xHeightMm, setXHeightMm] = useState(DEFAULTS.xHeightMm);
  const [ascenderMm, setAscenderMm] = useState(DEFAULTS.ascenderMm);
  const [descenderMm, setDescenderMm] = useState(DEFAULTS.descenderMm);
  const [rowGapMm, setRowGapMm] = useState(DEFAULTS.rowGapMm);
  const [marginMm, setMarginMm] = useState(DEFAULTS.marginMm);
  const [showXHeightLines, setShowXHeightLines] = useState(DEFAULTS.showXHeightLines);
  const [copied, setCopied] = useState(false);

  const guide = useMemo(
    () =>
      buildSlantGuide({
        pageSize,
        angleDeg: toNumber(angleDeg),
        spacingMm: toNumber(spacingMm),
        xHeightMm: toNumber(xHeightMm),
        ascenderMm: toNumber(ascenderMm),
        descenderMm: toNumber(descenderMm),
        rowGapMm: toNumber(rowGapMm),
        marginMm: toNumber(marginMm),
        showXHeightLines,
      }),
    [pageSize, angleDeg, spacingMm, xHeightMm, ascenderMm, descenderMm, rowGapMm, marginMm, showXHeightLines],
  );

  const hasError = Boolean(guide.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Handwriting Slant Guide",
      `Paper: ${guide.page.label}, ${mm(guide.marginMm)} margin`,
      `Slant: ${deg(guide.angleDeg)} from the baseline (${deg(guide.angleFromVerticalDeg)} off vertical)`,
      `Slant line spacing: ${mm(guide.spacingMm)} — ${guide.slantLineCount} lines`,
      `Writing line: ${mm(guide.xHeightMm)} x-height, ${mm(guide.ascenderMm)} ascender, ${mm(guide.descenderMm)} descender`,
      `Rows on the sheet: ${guide.rowCount}`,
      `Sideways travel per x-height: ${mm(guide.driftPerXHeightMm)}`,
    ].join("\n");
  }, [guide, hasError]);

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
    setPageSize(DEFAULTS.pageSize);
    setAngleDeg(DEFAULTS.angleDeg);
    setSpacingMm(DEFAULTS.spacingMm);
    setXHeightMm(DEFAULTS.xHeightMm);
    setAscenderMm(DEFAULTS.ascenderMm);
    setDescenderMm(DEFAULTS.descenderMm);
    setRowGapMm(DEFAULTS.rowGapMm);
    setMarginMm(DEFAULTS.marginMm);
    setShowXHeightLines(DEFAULTS.showXHeightLines);
    setCopied(false);
  };

  const print = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <style>{PRINT_CSS}</style>

      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Italic className="h-4 w-4" aria-hidden="true" />
          Handwriting worksheets
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Handwriting Slant Guide Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Print a sheet of parallel slant lines at a chosen angle, slip it under your writing paper,
          and match every downstroke to the same slope. Presets cover Copperplate at 55°, Spencerian
          at 52° and upright print at 90°.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="slant-preset">
              Script preset
            </label>
            <select
              id="slant-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={angleDeg}
              onChange={(event) => setAngleDeg(event.target.value)}
            >
              {SLANT_PRESETS.map((preset) => (
                <option key={preset.id} value={String(preset.angleDeg)}>
                  {preset.label} — {preset.angleDeg}°
                </option>
              ))}
              {SLANT_PRESETS.every((preset) => String(preset.angleDeg) !== angleDeg) ? (
                <option value={angleDeg}>Custom — {angleDeg}°</option>
              ) : null}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slant-angle">
              Slant angle from baseline (degrees)
            </label>
            <input
              id="slant-angle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_ANGLE_DEG}
              max={MAX_ANGLE_DEG}
              step="1"
              value={angleDeg}
              onChange={(event) => setAngleDeg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slant-spacing">
              Gap between slant lines (mm)
            </label>
            <input
              id="slant-spacing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_SPACING_MM}
              max={MAX_SPACING_MM}
              step="1"
              value={spacingMm}
              onChange={(event) => setSpacingMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slant-x">
              x-height (mm)
            </label>
            <input
              id="slant-x"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_X_HEIGHT_MM}
              max={MAX_X_HEIGHT_MM}
              step="0.5"
              value={xHeightMm}
              onChange={(event) => setXHeightMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slant-asc">
              Ascender space (mm)
            </label>
            <input
              id="slant-asc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={ascenderMm}
              onChange={(event) => setAscenderMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slant-desc">
              Descender space (mm)
            </label>
            <input
              id="slant-desc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={descenderMm}
              onChange={(event) => setDescenderMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slant-gap">
              Gap between writing rows (mm)
            </label>
            <input
              id="slant-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={rowGapMm}
              onChange={(event) => setRowGapMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slant-margin">
              Page margin (mm)
            </label>
            <input
              id="slant-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              max="40"
              step="1"
              value={marginMm}
              onChange={(event) => setMarginMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slant-paper">
              Paper size
            </label>
            <select
              id="slant-paper"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pageSize}
              onChange={(event) => setPageSize(event.target.value)}
            >
              {Object.values(PAGE_SIZES).map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label
              className="inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-semibold"
              htmlFor="slant-xlines"
            >
              <input
                id="slant-xlines"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={showXHeightLines}
                onChange={(event) => setShowXHeightLines(event.target.checked)}
              />
              Show waist and ascender lines
            </label>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {guide.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Slant from the baseline
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : deg(guide.angleDeg)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the settings above to see the guide"
                : `${deg(guide.angleFromVerticalDeg)} off vertical · ${NUM.format(guide.rowCount)} writing rows`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy slant guide specification"
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
              onClick={print}
              disabled={hasError}
              aria-label="Print the slant guide"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
            <button type="button" onClick={reset} aria-label="Reset all settings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Slant lines on the sheet", hasError ? dash : NUM.format(guide.slantLineCount)],
            ["Spacing between slant lines", hasError ? dash : mm(guide.spacingMm)],
            ["Sideways travel per x-height", hasError ? dash : mm(guide.driftPerXHeightMm)],
            ["Sideways travel over the block", hasError ? dash : mm(guide.driftMm)],
            ["Writing line height", hasError ? dash : mm(guide.lineHeightMm)],
            ["Ascender to x-height ratio", hasError ? dash : `${MM.format(guide.ascenderRatio)}x`],
            ["Writing rows per sheet", hasError ? dash : NUM.format(guide.rowCount)],
            ["Printable area", hasError ? dash : `${mm(guide.usableWidthMm)} x ${mm(guide.usableHeightMm)}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6">
          <h2 className="text-base font-semibold">Underlay preview</h2>
          <p className="mt-1 mb-3 text-sm text-[var(--muted-foreground)]">
            Printed at true size. Choose 100% scale in the print dialog, then slide the sheet under
            plain paper or behind a light-coloured pad.
          </p>
          <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
            <div id="slant-print-area" className="bg-[var(--card)]">
              <svg
                role="img"
                aria-label={`Slant guide at ${guide.angleDeg} degrees with ${guide.rowCount} writing rows`}
                width={`${guide.page.widthMm}mm`}
                height={`${guide.page.heightMm}mm`}
                viewBox={`0 0 ${guide.page.widthMm} ${guide.page.heightMm}`}
                className="block text-[var(--foreground)]"
              >
                <defs>
                  <clipPath id="slant-block-clip">
                    <rect x="0" y="0" width={guide.usableWidthMm} height={guide.blockHeightMm} />
                  </clipPath>
                </defs>
                <g transform={`translate(${guide.marginMm} ${guide.marginMm})`}>
                  <g clipPath="url(#slant-block-clip)">
                    {guide.slantLines.map((line) => (
                      <line
                        key={`${line.xBottomMm}-${line.xTopMm}`}
                        x1={line.xBottomMm}
                        y1={line.yBottomMm}
                        x2={line.xTopMm}
                        y2={line.yTopMm}
                        stroke="currentColor"
                        strokeWidth="0.25"
                        opacity="0.45"
                      />
                    ))}
                  </g>
                  {guide.rows.map((row) => (
                    <g key={row.index}>
                      <line
                        x1="0"
                        y1={row.baselineMm}
                        x2={guide.usableWidthMm}
                        y2={row.baselineMm}
                        stroke="currentColor"
                        strokeWidth="0.4"
                        opacity="0.85"
                      />
                      {guide.showXHeightLines ? (
                        <>
                          <line
                            x1="0"
                            y1={row.waistMm}
                            x2={guide.usableWidthMm}
                            y2={row.waistMm}
                            stroke="currentColor"
                            strokeWidth="0.2"
                            strokeDasharray="1.5 1.5"
                            opacity="0.5"
                          />
                          <line
                            x1="0"
                            y1={row.ascenderMm}
                            x2={guide.usableWidthMm}
                            y2={row.ascenderMm}
                            stroke="currentColor"
                            strokeWidth="0.2"
                            opacity="0.3"
                          />
                          <line
                            x1="0"
                            y1={row.descenderMm}
                            x2={guide.usableWidthMm}
                            y2={row.descenderMm}
                            stroke="currentColor"
                            strokeWidth="0.2"
                            opacity="0.3"
                          />
                        </>
                      ) : null}
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Slant angles quoted for historic hands vary slightly between manuals. Treat the presets as
        starting points and adjust the angle until it matches the exemplar you are copying.
      </p>
    </main>
  );
}
