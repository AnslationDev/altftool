"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SquareStack } from "lucide-react";

import {
  BACKSPLASH_TILE_SIZES,
  COUNTER_HEIGHT_IN,
  bandHeightFromCabinet,
  calculateBacksplash,
} from "../lib";

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
  run: "12",
  band: "24",
  cabinet: "60",
  hobW: "3",
  hobExtra: "18",
  winCount: "1",
  winW: "3",
  winH: "2",
  cutouts: "4",
  tileW: "300",
  tileH: "600",
  perBox: "8",
  wastage: "12",
  price: "1100",
  thickness: "8",
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
  const [run, setRun] = useState(DEFAULTS.run);
  const [band, setBand] = useState(DEFAULTS.band);
  const [cabinet, setCabinet] = useState(DEFAULTS.cabinet);
  const [hobW, setHobW] = useState(DEFAULTS.hobW);
  const [hobExtra, setHobExtra] = useState(DEFAULTS.hobExtra);
  const [winCount, setWinCount] = useState(DEFAULTS.winCount);
  const [winW, setWinW] = useState(DEFAULTS.winW);
  const [winH, setWinH] = useState(DEFAULTS.winH);
  const [cutouts, setCutouts] = useState(DEFAULTS.cutouts);
  const [tileW, setTileW] = useState(DEFAULTS.tileW);
  const [tileH, setTileH] = useState(DEFAULTS.tileH);
  const [perBox, setPerBox] = useState(DEFAULTS.perBox);
  const [wastage, setWastage] = useState(DEFAULTS.wastage);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [thickness, setThickness] = useState(DEFAULTS.thickness);
  const [joint, setJoint] = useState(DEFAULTS.joint);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateBacksplash({
        counterRunFt: toNumber(run),
        bandHeightIn: toNumber(band),
        hobWidthFt: toNumber(hobW),
        hobExtraHeightIn: toNumber(hobExtra),
        windowCount: toNumber(winCount),
        windowWidthFt: toNumber(winW),
        windowHeightFt: toNumber(winH),
        cutoutCount: toNumber(cutouts),
        tileWidthMm: toNumber(tileW),
        tileHeightMm: toNumber(tileH),
        tilesPerBox: toNumber(perBox),
        wastagePercent: toNumber(wastage),
        pricePerBox: toNumber(price),
        tileThicknessMm: toNumber(thickness),
        jointWidthMm: toNumber(joint),
      }),
    [
      run,
      band,
      hobW,
      hobExtra,
      winCount,
      winW,
      winH,
      cutouts,
      tileW,
      tileH,
      perBox,
      wastage,
      price,
      thickness,
      joint,
    ],
  );

  const failed = Boolean(result.error);

  const applyCabinetHeight = () => {
    const derived = bandHeightFromCabinet(toNumber(cabinet));
    if (!Number.isFinite(derived)) return;
    setBand(String(derived));
  };

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Kitchen backsplash take-off",
      `Backsplash band: ${num(result.bandAreaSqft)} sqft`,
      `Hob panel: ${num(result.hobPanelSqft)} sqft`,
      `Window deducted: ${num(result.windowAreaSqft)} sqft`,
      `Net tiled area: ${num(result.netAreaSqft)} sqft`,
      `Tile: ${tileW} x ${tileH} mm`,
      `Tiles required: ${result.tilesRequired} (incl. ${result.cutoutSpares} cutout spares)`,
      `Boxes to buy: ${result.boxes} (${result.tilesSupplied} tiles)`,
      `Tile cost: ${money(result.totalCost)} (${money2(result.costPerSqft)} per sqft)`,
      `Adhesive: ${result.adhesiveBags} bags of 20 kg · Grout: ${num(result.groutKg)} kg`,
    ].join("\n");
  }, [failed, result, tileW, tileH]);

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
    setRun(DEFAULTS.run);
    setBand(DEFAULTS.band);
    setCabinet(DEFAULTS.cabinet);
    setHobW(DEFAULTS.hobW);
    setHobExtra(DEFAULTS.hobExtra);
    setWinCount(DEFAULTS.winCount);
    setWinW(DEFAULTS.winW);
    setWinH(DEFAULTS.winH);
    setCutouts(DEFAULTS.cutouts);
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
    ["Backsplash band area", failed ? DASH : `${num(result.bandAreaSqft)} sqft`],
    ["Taller panel behind the hob", failed ? DASH : `${num(result.hobPanelSqft)} sqft`],
    ["Gross area", failed ? DASH : `${num(result.grossAreaSqft)} sqft`],
    ["Window openings deducted", failed ? DASH : `${num(result.windowAreaSqft)} sqft`],
    ["Net tiled area", failed ? DASH : `${num(result.netAreaSqft)} sqft / ${num(result.netAreaSqm)} sqm`],
    ["Area of one tile", failed ? DASH : `${num(result.tileAreaSqft)} sqft`],
    ["Coverage of one box", failed ? DASH : `${num(result.boxCoverageSqft)} sqft`],
    ["Tiles for bare area", failed ? DASH : `${num(result.tilesExact)} tiles`],
    ["Tiles after wastage", failed ? DASH : `${result.tilesWithWastage} tiles`],
    ["Spare tiles for socket cutouts", failed ? DASH : `${result.cutoutSpares} tiles`],
    ["Tiles required", failed ? DASH : `${result.tilesRequired} tiles`],
    ["Tiles supplied in those boxes", failed ? DASH : `${result.tilesSupplied} tiles`],
    ["Left over after the job", failed ? DASH : `${result.spareTiles} tiles`],
    ["Total tile cost", failed ? DASH : money(result.totalCost)],
    ["Cost per sqft of backsplash", failed ? DASH : money2(result.costPerSqft)],
    ["Tile adhesive", failed ? DASH : `${num(result.adhesiveKg)} kg · ${result.adhesiveBags} bags`],
    ["Grout", failed ? DASH : `${num(result.groutKg)} kg (${num(result.groutKgPerSqm)} kg/sqm)`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <SquareStack className="h-4 w-4" aria-hidden="true" />
          Tiling
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Kitchen Backsplash Tile Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Size the tile order for the band between your counter and overhead cabinets, including the
          taller panel behind the hob and spares for every socket cutout.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Counter and band</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="bs-run">
              Counter run to tile (running ft)
            </label>
            <input
              id="bs-run"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.25"
              value={run}
              onChange={(event) => setRun(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bs-band">
              Backsplash height (inches)
            </label>
            <input
              id="bs-band"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="6"
              max="96"
              step="1"
              value={band}
              onChange={(event) => setBand(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bs-cabinet">
              Overhead cabinet base above floor (inches)
            </label>
            <input
              id="bs-cabinet"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={cabinet}
              onChange={(event) => setCabinet(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={applyCabinetHeight} className={`${CHIP} w-full`}>
              Derive band height (counter at {COUNTER_HEIGHT_IN} in)
            </button>
          </div>
          <div>
            <label className={LABEL} htmlFor="bs-hobw">
              Hob panel width (ft)
            </label>
            <input
              id="bs-hobw"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={hobW}
              onChange={(event) => setHobW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bs-hobextra">
              Extra height above the band, up to the chimney (inches)
            </label>
            <input
              id="bs-hobextra"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={hobExtra}
              onChange={(event) => setHobExtra(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Openings and cutouts</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="bs-winc">
              Windows in the backsplash
            </label>
            <input
              id="bs-winc"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={winCount}
              onChange={(event) => setWinCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bs-cutouts">
              Socket and switchboard cutouts
            </label>
            <input
              id="bs-cutouts"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={cutouts}
              onChange={(event) => setCutouts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bs-winw">
              Window width (ft)
            </label>
            <input
              id="bs-winw"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={winW}
              onChange={(event) => setWinW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bs-winh">
              Window height (ft)
            </label>
            <input
              id="bs-winh"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={winH}
              onChange={(event) => setWinH(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Tile</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {BACKSPLASH_TILE_SIZES.map((size) => (
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
            <label className={LABEL} htmlFor="bs-tilew">
              Tile width (mm)
            </label>
            <input
              id="bs-tilew"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={tileW}
              onChange={(event) => setTileW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bs-tileh">
              Tile height (mm)
            </label>
            <input
              id="bs-tileh"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={tileH}
              onChange={(event) => setTileH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bs-perbox">
              Tiles per box
            </label>
            <input
              id="bs-perbox"
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
            <label className={LABEL} htmlFor="bs-price">
              Price per box (INR)
            </label>
            <input
              id="bs-price"
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
            <label className={LABEL} htmlFor="bs-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="bs-wastage"
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
            <label className={LABEL} htmlFor="bs-thickness">
              Tile thickness (mm)
            </label>
            <input
              id="bs-thickness"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={thickness}
              onChange={(event) => setThickness(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bs-joint">
              Grout joint width (mm)
            </label>
            <input
              id="bs-joint"
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
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
                : `${result.tilesRequired} tiles for ${num(result.netAreaSqft)} sqft of backsplash`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy backsplash tile take-off"
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
        Backsplash areas are small, so a single box either way changes the cost a lot. Order the spare
        box up front rather than after the tiler starts — matching the shade later is usually impossible.
      </p>
    </main>
  );
}
