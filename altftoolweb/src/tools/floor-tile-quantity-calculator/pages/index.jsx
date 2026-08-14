"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Grid2x2, RotateCcw } from "lucide-react";

import { COMMON_TILE_SIZES, calculateFloorTiles } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const DEFAULTS = {
  length: "12",
  width: "10",
  extra: "0",
  tileW: "600",
  tileH: "600",
  perBox: "4",
  wastage: "10",
  price: "1200",
  thickness: "9",
  joint: "2",
};

const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [extra, setExtra] = useState(DEFAULTS.extra);
  const [tileW, setTileW] = useState(DEFAULTS.tileW);
  const [tileH, setTileH] = useState(DEFAULTS.tileH);
  const [perBox, setPerBox] = useState(DEFAULTS.perBox);
  const [wastage, setWastage] = useState(DEFAULTS.wastage);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [thickness, setThickness] = useState(DEFAULTS.thickness);
  const [joint, setJoint] = useState(DEFAULTS.joint);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  const result = useMemo(
    () =>
      calculateFloorTiles({
        lengthFt: toNumber(length),
        widthFt: toNumber(width),
        extraAreaSqft: toNumber(extra),
        tileWidthMm: toNumber(tileW),
        tileHeightMm: toNumber(tileH),
        tilesPerBox: toNumber(perBox),
        wastagePercent: toNumber(wastage),
        pricePerBox: toNumber(price),
        tileThicknessMm: toNumber(thickness),
        jointWidthMm: toNumber(joint),
      }),
    [length, width, extra, tileW, tileH, perBox, wastage, price, thickness, joint],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Floor tile take-off",
      `Floor area: ${num(result.floorAreaSqft)} sqft (${num(result.areaSqm)} sqm)`,
      `Tile: ${tileW} x ${tileH} mm, ${num(result.tileAreaSqft)} sqft each`,
      `Tiles required (incl. ${wastage}% wastage): ${num(result.tilesRequired)}`,
      `Boxes to buy: ${result.boxes} (${num(result.tilesSupplied)} tiles)`,
      `Spare tiles left over: ${num(result.spareTiles)}`,
      `Tile cost: ${money(result.totalCost)} (${money2(result.costPerSqft)} per sqft)`,
      `Adhesive: ${num(result.adhesiveKg)} kg (${result.adhesiveBags} bags of 20 kg)`,
      `Grout: ${num(result.groutKg)} kg`,
    ].join("\n");
  }, [failed, result, tileW, tileH, wastage]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setExtra(DEFAULTS.extra);
    setTileW(DEFAULTS.tileW);
    setTileH(DEFAULTS.tileH);
    setPerBox(DEFAULTS.perBox);
    setWastage(DEFAULTS.wastage);
    setPrice(DEFAULTS.price);
    setThickness(DEFAULTS.thickness);
    setJoint(DEFAULTS.joint);
    setCopied(false);
  };

  const rows = [
    ["Floor area", failed ? DASH : `${num(result.floorAreaSqft)} sqft / ${num(result.areaSqm)} sqm`],
    ["Area of one tile", failed ? DASH : `${num(result.tileAreaSqft)} sqft`],
    ["Coverage of one box", failed ? DASH : `${num(result.boxCoverageSqft)} sqft`],
    ["Tiles for bare area", failed ? DASH : `${num(result.tilesExact)} tiles`],
    ["Extra tiles for cuts and breakage", failed ? DASH : `${num(result.wastageTiles)} tiles`],
    ["Tiles required", failed ? DASH : `${num(result.tilesRequired)} tiles`],
    ["Tiles supplied in those boxes", failed ? DASH : `${num(result.tilesSupplied)} tiles`],
    ["Spare tiles left over", failed ? DASH : `${num(result.spareTiles)} tiles`],
    ["Total tile cost", failed ? DASH : money(result.totalCost)],
    ["Tile cost per sqft of floor", failed ? DASH : money2(result.costPerSqft)],
    ["Tile adhesive (3 mm bed)", failed ? DASH : `${num(result.adhesiveKg)} kg · ${result.adhesiveBags} bags`],
    ["Grout", failed ? DASH : `${num(result.groutKg)} kg (${num(result.groutKgPerSqm)} kg/sqm)`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Grid2x2 className="h-4 w-4" aria-hidden="true" />
          Tiling
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Floor Tile Quantity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a room measurement into the exact number of boxes to order, with a wastage allowance
          for cuts and breakage, plus the adhesive and grout you will need alongside.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Room</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ft-length">
              Room length (ft)
            </label>
            <input
              id="ft-length"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.25"
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ft-width">
              Room width (ft)
            </label>
            <input
              id="ft-width"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.25"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ft-extra">
              Additional area — alcoves, balcony, second room (sqft)
            </label>
            <input
              id="ft-extra"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={extra}
              onChange={(event) => setExtra(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Tile</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {COMMON_TILE_SIZES.map((size) => (
            <button
              key={size.label}
              type="button"
              className={CHIP}
              onClick={() => {
                setTileW(String(size.widthMm));
                setTileH(String(size.heightMm));
                setPerBox(String(size.tilesPerBox));
              }}
            >
              {size.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ft-tilew">
              Tile width (mm)
            </label>
            <input
              id="ft-tilew"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={tileW}
              onChange={(event) => setTileW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ft-tileh">
              Tile height (mm)
            </label>
            <input
              id="ft-tileh"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={tileH}
              onChange={(event) => setTileH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ft-perbox">
              Tiles per box
            </label>
            <input
              id="ft-perbox"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={perBox}
              onChange={(event) => setPerBox(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ft-price">
              Price per box (INR)
            </label>
            <input
              id="ft-price"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ft-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="ft-wastage"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={wastage}
              onChange={(event) => setWastage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ft-thickness">
              Tile thickness (mm)
            </label>
            <input
              id="ft-thickness"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={thickness}
              onChange={(event) => setThickness(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ft-joint">
              Grout joint width (mm)
            </label>
            <input
              id="ft-joint"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={joint}
              onChange={(event) => setJoint(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Boxes to order
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.boxes}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a take-off."
                : `${num(result.tilesSupplied)} tiles covering ${num(result.areaCoveredSqft)} sqft`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy floor tile take-off"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Buy all boxes from the same production batch — shade and calibration vary between batches, and
        a top-up box bought later rarely matches. Keep the spare tiles: replacing a cracked tile years
        later is far easier than finding the same design again.
      </p>
    </main>
  );
}
