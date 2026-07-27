"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Grid3x3, RotateCcw } from "lucide-react";

import {
  computeTileWastage,
  INSTALLERS,
  MAX_WASTAGE_PERCENT,
  PATTERNS,
  SHAPES,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const m2 = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} m²` : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM1.format(v)}%` : DASH);

const DEFAULTS = {
  length: "4",
  width: "3",
  tileW: "600",
  tileH: "600",
  pattern: "diagonal",
  shape: "lshaped",
  installer: "average",
  cutouts: "0",
  perBox: "4",
  price: "1600",
  spare: "1",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [tileW, setTileW] = useState(DEFAULTS.tileW);
  const [tileH, setTileH] = useState(DEFAULTS.tileH);
  const [pattern, setPattern] = useState(DEFAULTS.pattern);
  const [shape, setShape] = useState(DEFAULTS.shape);
  const [installer, setInstaller] = useState(DEFAULTS.installer);
  const [cutouts, setCutouts] = useState(DEFAULTS.cutouts);
  const [perBox, setPerBox] = useState(DEFAULTS.perBox);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [spare, setSpare] = useState(DEFAULTS.spare);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTileWastage({
        roomLengthM: toNum(length),
        roomWidthM: toNum(width),
        tileWidthMm: toNum(tileW),
        tileHeightMm: toNum(tileH),
        pattern,
        shape,
        installer,
        cutouts: toNum(cutouts),
        tilesPerBox: toNum(perBox),
        pricePerBox: toNum(price),
        spareBoxes: toNum(spare),
      }),
    [length, width, tileW, tileH, pattern, shape, installer, cutouts, perBox, price, spare],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Tile Wastage Calculator",
      `Floor area: ${m2(result.floorAreaM2)}`,
      `Recommended wastage: ${pct(result.wastagePercent)}`,
      ...result.breakdown.map(([label, value]) => `  ${label}: +${NUM1.format(value)}%`),
      `Area to buy for: ${m2(result.areaWithWastageM2)}`,
      `Tiles needed: ${result.tilesNeeded} (${result.tilesForFloor} would cover the bare floor)`,
      `Boxes: ${result.boxesNeeded} + ${result.spareBoxes} spare = ${result.totalBoxes}`,
      `Tiles delivered: ${result.tilesSupplied} in the working boxes`,
      `Effective wastage once boxed: ${pct(result.effectiveWastagePercent)}`,
      `Material cost: ${money(result.materialCost)}`,
    ].join("\n");
  }, [hasError, result]);

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
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setTileW(DEFAULTS.tileW);
    setTileH(DEFAULTS.tileH);
    setPattern(DEFAULTS.pattern);
    setShape(DEFAULTS.shape);
    setInstaller(DEFAULTS.installer);
    setCutouts(DEFAULTS.cutouts);
    setPerBox(DEFAULTS.perBox);
    setPrice(DEFAULTS.price);
    setSpare(DEFAULTS.spare);
    setCopied(false);
  };

  const labels = [
    "Floor area",
    "Area of one tile",
    "Area to buy for",
    "Tiles that would cover the bare floor",
    "Tiles needed with wastage",
    "Boxes for the job",
    "Spare boxes for future repairs",
    "Total boxes to order",
    "Tiles delivered in the working boxes",
    "Effective wastage once boxed",
    "Material cost",
  ];

  const values = hasError
    ? labels.map(() => DASH)
    : [
        m2(result.floorAreaM2),
        m2(result.tileAreaM2),
        m2(result.areaWithWastageM2),
        String(result.tilesForFloor),
        String(result.tilesNeeded),
        String(result.boxesNeeded),
        String(result.spareBoxes),
        String(result.totalBoxes),
        String(result.tilesSupplied),
        pct(result.effectiveWastagePercent),
        money(result.materialCost),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Grid3x3 className="h-4 w-4" aria-hidden="true" />
          Tiling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tile Wastage Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A single 10% rule of thumb over-orders for a straight grid and under-orders badly for
          herringbone. This builds the allowance from the pattern, the room outline, the tile
          format and who is cutting, then converts it into boxes.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-length">
              Room length (m)
            </label>
            <input
              id="tw-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-width">
              Room width (m)
            </label>
            <input
              id="tw-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-tilew">
              Tile width (mm)
            </label>
            <input
              id="tw-tilew"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={tileW}
              onChange={(e) => setTileW(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-tileh">
              Tile length (mm)
            </label>
            <input
              id="tw-tileh"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={tileH}
              onChange={(e) => setTileH(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-pattern">
              Laying pattern
            </label>
            <select
              id="tw-pattern"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            >
              {PATTERNS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} (+{option.percent}%)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-shape">
              Room outline
            </label>
            <select
              id="tw-shape"
              className={`mt-2 ${INPUT_CLASS}`}
              value={shape}
              onChange={(e) => setShape(e.target.value)}
            >
              {SHAPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} (+{option.percent}%)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-installer">
              Who is laying the tiles
            </label>
            <select
              id="tw-installer"
              className={`mt-2 ${INPUT_CLASS}`}
              value={installer}
              onChange={(e) => setInstaller(e.target.value)}
            >
              {INSTALLERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} (+{option.percent}%)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-cutouts">
              Cutouts (pillars, WC, traps, island)
            </label>
            <input
              id="tw-cutouts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={cutouts}
              onChange={(e) => setCutouts(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-perbox">
              Tiles per box
            </label>
            <input
              id="tw-perbox"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={perBox}
              onChange={(e) => setPerBox(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-spare">
              Spare boxes to store
            </label>
            <input
              id="tw-spare"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={spare}
              onChange={(e) => setSpare(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tw-price">
              Price per box (₹)
            </label>
            <input
              id="tw-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended wastage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : pct(result.wastagePercent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the recommendation."
                : `Order ${result.totalBoxes} boxes (${result.boxesNeeded} for the job + ${result.spareBoxes} spare)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy tile wastage result"
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.clamped && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            The individual allowances added up to {pct(result.rawPercent)}, capped at{" "}
            {MAX_WASTAGE_PERCENT}%. Above that it is usually cheaper to simplify the pattern or ask
            the supplier to hold stock from the same batch.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {labels.map((label, index) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{values[index]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Where the allowance comes from</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Factor
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Adds
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError
                ? [["Fix the input above", null]]
                : result.breakdown
              ).map(([label, value]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{label}</td>
                  <td className="py-2 text-right font-semibold">
                    {value === null ? DASH : `+${NUM1.format(value)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning estimate. Always keep the spare boxes from the same batch code — dye lots differ
        between production runs, so a replacement tile bought a year later rarely matches. Confirm
        the tiles-per-box figure printed on the carton before you place the order.
      </p>
    </main>
  );
}
