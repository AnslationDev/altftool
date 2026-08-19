"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ruler, RotateCcw } from "lucide-react";

import {
  computeSkirting,
  DEFAULT_WASTAGE_PERCENT,
  FIXING_SPACING_M,
  PIECE_LENGTHS,
  SKIRTING_HEIGHTS,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const m = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} m` : DASH);
const ft = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} ft` : DASH);
const m2 = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} m²` : DASH);

const DEFAULTS = {
  length: "4",
  width: "3.5",
  doors: "1",
  doorWidth: "0.9",
  openings: "0",
  extra: "0",
  wastage: String(DEFAULT_WASTAGE_PERCENT),
  piece: "2.44",
  height: "100",
  price: "220",
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
  const [doors, setDoors] = useState(DEFAULTS.doors);
  const [doorWidth, setDoorWidth] = useState(DEFAULTS.doorWidth);
  const [openings, setOpenings] = useState(DEFAULTS.openings);
  const [extra, setExtra] = useState(DEFAULTS.extra);
  const [wastage, setWastage] = useState(DEFAULTS.wastage);
  const [piece, setPiece] = useState(DEFAULTS.piece);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSkirting({
        roomLengthM: toNum(length),
        roomWidthM: toNum(width),
        doorCount: toNum(doors),
        doorWidthM: toNum(doorWidth),
        otherOpeningsM: toNum(openings),
        extraRunM: toNum(extra),
        wastagePercent: toNum(wastage),
        pieceLengthM: toNum(piece),
        skirtingHeightMm: toNum(height),
        pricePerMetre: toNum(price),
      }),
    [length, width, doors, doorWidth, openings, extra, wastage, piece, height, price],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Skirting Length Calculator",
      `Room perimeter: ${m(result.perimeterM)}`,
      `Deducted for doorways and openings: ${m(result.deductionM)}`,
      `Net skirting run: ${m(result.netRunM)} (${ft(result.netRunFt)})`,
      `With cutting allowance: ${m(result.withWastageM)}`,
      `Pieces to buy: ${result.pieces} × ${NUM2.format(toNum(piece))} m = ${m(result.purchasedLengthM)}`,
      `Spare left over: ${m(result.spareM)}`,
      `Internal corners: ${result.internalCorners}, exposed door ends: ${result.externalEnds}`,
      `Surface area to paint or polish: ${m2(result.surfaceAreaM2)}`,
      `Fixings at ${FIXING_SPACING_M * 1000} mm centres: ${result.fixings}`,
      `Material cost: ${money(result.materialCost)}`,
    ].join("\n");
  }, [hasError, result, piece]);

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
    setDoors(DEFAULTS.doors);
    setDoorWidth(DEFAULTS.doorWidth);
    setOpenings(DEFAULTS.openings);
    setExtra(DEFAULTS.extra);
    setWastage(DEFAULTS.wastage);
    setPiece(DEFAULTS.piece);
    setHeight(DEFAULTS.height);
    setPrice(DEFAULTS.price);
    setCopied(false);
  };

  const labels = [
    "Room perimeter",
    "Deducted for doorways and openings",
    "Net skirting run",
    "In running feet",
    "With cutting allowance",
    "Pieces to buy",
    "Total length purchased",
    "Spare left over",
    "Internal corners to mitre",
    "Exposed door ends to return",
    "Surface area to paint or polish",
    `Fixings at ${FIXING_SPACING_M * 1000} mm centres`,
    "Material cost",
    "Equivalent cost per running foot",
  ];

  const values = hasError
    ? labels.map(() => DASH)
    : [
        m(result.perimeterM),
        m(result.deductionM),
        m(result.netRunM),
        ft(result.netRunFt),
        m(result.withWastageM),
        `${result.pieces} × ${NUM2.format(toNum(piece))} m`,
        m(result.purchasedLengthM),
        m(result.spareM),
        String(result.internalCorners),
        String(result.externalEnds),
        m2(result.surfaceAreaM2),
        String(result.fixings),
        money(result.materialCost),
        money(result.costPerRunningFoot),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Interiors
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Skirting Length Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Room perimeter minus doorways, plus a mitre-cutting allowance, converted into whole
          factory lengths — with corner counts, fixings and cost.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-length">
              Room length (m)
            </label>
            <input
              id="sk-length"
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
            <label className={LABEL_CLASS} htmlFor="sk-width">
              Room width (m)
            </label>
            <input
              id="sk-width"
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
            <label className={LABEL_CLASS} htmlFor="sk-doors">
              Number of doorways
            </label>
            <input
              id="sk-doors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={doors}
              onChange={(e) => setDoors(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-doorwidth">
              Width of each doorway (m)
            </label>
            <input
              id="sk-doorwidth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={doorWidth}
              onChange={(e) => setDoorWidth(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-openings">
              Other runs with no skirting (m)
            </label>
            <input
              id="sk-openings"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={openings}
              onChange={(e) => setOpenings(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-extra">
              Extra run for alcoves or an L-shape (m)
            </label>
            <input
              id="sk-extra"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-wastage">
              Cutting allowance (%)
            </label>
            <input
              id="sk-wastage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={wastage}
              onChange={(e) => setWastage(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-piece">
              Length of one piece
            </label>
            <select
              id="sk-piece"
              className={`mt-2 ${INPUT_CLASS}`}
              value={piece}
              onChange={(e) => setPiece(e.target.value)}
            >
              {PIECE_LENGTHS.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-height">
              Skirting height (mm)
            </label>
            <select
              id="sk-height"
              className={`mt-2 ${INPUT_CLASS}`}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            >
              {SKIRTING_HEIGHTS.map((value) => (
                <option key={value} value={String(value)}>
                  {value} mm
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-price">
              Price (₹ per running metre)
            </label>
            <input
              id="sk-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
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
              Skirting to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.pieces} pieces`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the quantity."
                : `${m(result.purchasedLengthM)} total for a ${m(result.netRunM)} run`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy skirting length result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {labels.map((label, index) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{values[index]}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.cornerCountAssumesRectangle ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            The corner count above still assumes a plain rectangular room. You&apos;ve added extra
            run for an alcove or an L-shape, and the actual number of mitred corners for that kind
            of layout depends on the shape — a boxed-in alcove and an L-shaped room don&apos;t add
            the same number of corners. Count corners on your own floor plan for cutting purposes.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates for a rectangular room. Measure the actual wall lengths on site before ordering —
        rooms are rarely square, and sliding wardrobes, floor-level ducts and staircases change the
        run. Buy all pieces from the same batch so the profile and finish match.
      </p>
    </main>
  );
}
