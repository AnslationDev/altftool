"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LayoutGrid, RotateCcw } from "lucide-react";

import { COMMON_WALL_TILE_SIZES, calculateWallTiles, roomPerimeterFt } from "../lib";

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
  roomLength: "8",
  roomWidth: "6",
  wallRun: "28",
  height: "9",
  doorCount: "1",
  doorW: "3",
  doorH: "7",
  windowCount: "1",
  windowW: "4",
  windowH: "3",
  tileW: "300",
  tileH: "600",
  perBox: "8",
  wastage: "10",
  price: "900",
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
  const [roomLength, setRoomLength] = useState(DEFAULTS.roomLength);
  const [roomWidth, setRoomWidth] = useState(DEFAULTS.roomWidth);
  const [wallRun, setWallRun] = useState(DEFAULTS.wallRun);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [doorCount, setDoorCount] = useState(DEFAULTS.doorCount);
  const [doorW, setDoorW] = useState(DEFAULTS.doorW);
  const [doorH, setDoorH] = useState(DEFAULTS.doorH);
  const [windowCount, setWindowCount] = useState(DEFAULTS.windowCount);
  const [windowW, setWindowW] = useState(DEFAULTS.windowW);
  const [windowH, setWindowH] = useState(DEFAULTS.windowH);
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
      calculateWallTiles({
        wallRunFt: toNumber(wallRun),
        tilingHeightFt: toNumber(height),
        doorCount: toNumber(doorCount),
        doorWidthFt: toNumber(doorW),
        doorHeightFt: toNumber(doorH),
        windowCount: toNumber(windowCount),
        windowWidthFt: toNumber(windowW),
        windowHeightFt: toNumber(windowH),
        tileWidthMm: toNumber(tileW),
        tileHeightMm: toNumber(tileH),
        tilesPerBox: toNumber(perBox),
        wastagePercent: toNumber(wastage),
        pricePerBox: toNumber(price),
        tileThicknessMm: toNumber(thickness),
        jointWidthMm: toNumber(joint),
      }),
    [
      wallRun,
      height,
      doorCount,
      doorW,
      doorH,
      windowCount,
      windowW,
      windowH,
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

  const applyPerimeter = () => {
    const perimeter = roomPerimeterFt(toNumber(roomLength), toNumber(roomWidth));
    if (!Number.isFinite(perimeter)) return;
    setWallRun(String(perimeter));
  };

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Wall tile take-off",
      `Gross wall area: ${num(result.grossAreaSqft)} sqft`,
      `Openings deducted: ${num(result.openingAreaSqft)} sqft`,
      `Net tiled area: ${num(result.netAreaSqft)} sqft`,
      `Tile: ${tileW} x ${tileH} mm`,
      `Tiles required (incl. ${wastage}% wastage): ${result.tilesRequired}`,
      `Boxes to buy: ${result.boxes} (${result.tilesSupplied} tiles)`,
      `Tile cost: ${money(result.totalCost)} (${money2(result.costPerSqft)} per sqft)`,
      `Courses up the wall: ${result.fullCourses} full + ${num(result.partCourseMm)} mm cut course`,
      `Adhesive: ${result.adhesiveBags} bags of 20 kg · Grout: ${num(result.groutKg)} kg`,
    ].join("\n");
  }, [failed, result, tileW, tileH, wastage]);

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
    setRoomLength(DEFAULTS.roomLength);
    setRoomWidth(DEFAULTS.roomWidth);
    setWallRun(DEFAULTS.wallRun);
    setHeight(DEFAULTS.height);
    setDoorCount(DEFAULTS.doorCount);
    setDoorW(DEFAULTS.doorW);
    setDoorH(DEFAULTS.doorH);
    setWindowCount(DEFAULTS.windowCount);
    setWindowW(DEFAULTS.windowW);
    setWindowH(DEFAULTS.windowH);
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
    ["Gross wall area", failed ? DASH : `${num(result.grossAreaSqft)} sqft`],
    ["Doors deducted", failed ? DASH : `${num(result.doorAreaSqft)} sqft`],
    ["Windows deducted", failed ? DASH : `${num(result.windowAreaSqft)} sqft`],
    ["Net tiled area", failed ? DASH : `${num(result.netAreaSqft)} sqft / ${num(result.netAreaSqm)} sqm`],
    ["Area of one tile", failed ? DASH : `${num(result.tileAreaSqft)} sqft`],
    ["Coverage of one box", failed ? DASH : `${num(result.boxCoverageSqft)} sqft`],
    ["Tiles for bare area", failed ? DASH : `${num(result.tilesExact)} tiles`],
    ["Tiles required with wastage", failed ? DASH : `${result.tilesRequired} tiles`],
    ["Tiles supplied in those boxes", failed ? DASH : `${result.tilesSupplied} tiles`],
    ["Spare tiles left over", failed ? DASH : `${result.spareTiles} tiles`],
    ["Total tile cost", failed ? DASH : money(result.totalCost)],
    ["Cost per sqft of wall", failed ? DASH : money2(result.costPerSqft)],
    [
      "Courses up the wall",
      failed ? DASH : `${result.fullCourses} full + ${num(result.partCourseMm)} mm cut`,
    ],
    ["Tile adhesive", failed ? DASH : `${num(result.adhesiveKg)} kg · ${result.adhesiveBags} bags`],
    ["Grout", failed ? DASH : `${num(result.groutKg)} kg (${num(result.groutKgPerSqm)} kg/sqm)`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          Tiling
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Wall Tile Quantity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Measure the wall run and tiling height, deduct every door and window, and get the box count,
          course layout and cost for a bathroom or kitchen wall.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Wall</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="wt-run">
              Total wall run to tile (ft)
            </label>
            <input
              id="wt-run"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.25"
              value={wallRun}
              onChange={(event) => setWallRun(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wt-height">
              Tiling height (ft)
            </label>
            <input
              id="wt-height"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.25"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wt-rlen">
              Room length (ft) — for the perimeter helper
            </label>
            <input
              id="wt-rlen"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.25"
              value={roomLength}
              onChange={(event) => setRoomLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wt-rwid">
              Room width (ft) — for the perimeter helper
            </label>
            <input
              id="wt-rwid"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.25"
              value={roomWidth}
              onChange={(event) => setRoomWidth(event.target.value)}
            />
          </div>
        </div>
        <button type="button" onClick={applyPerimeter} className={`${CHIP} mt-3 w-full sm:w-auto`}>
          Use all four walls of that room
        </button>

        <h2 className="mt-6 text-base font-semibold">Openings to deduct</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL} htmlFor="wt-doorn">
              Doors
            </label>
            <input
              id="wt-doorn"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={doorCount}
              onChange={(event) => setDoorCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wt-doorw">
              Door width (ft)
            </label>
            <input
              id="wt-doorw"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={doorW}
              onChange={(event) => setDoorW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wt-doorh">
              Door height (ft)
            </label>
            <input
              id="wt-doorh"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={doorH}
              onChange={(event) => setDoorH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wt-winn">
              Windows
            </label>
            <input
              id="wt-winn"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={windowCount}
              onChange={(event) => setWindowCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wt-winw">
              Window width (ft)
            </label>
            <input
              id="wt-winw"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={windowW}
              onChange={(event) => setWindowW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wt-winh">
              Window height (ft)
            </label>
            <input
              id="wt-winh"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={windowH}
              onChange={(event) => setWindowH(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Tile</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {COMMON_WALL_TILE_SIZES.map((size) => (
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
            <label className={LABEL} htmlFor="wt-tilew">
              Tile width (mm)
            </label>
            <input
              id="wt-tilew"
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
            <label className={LABEL} htmlFor="wt-tileh">
              Tile height (mm)
            </label>
            <input
              id="wt-tileh"
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
            <label className={LABEL} htmlFor="wt-perbox">
              Tiles per box
            </label>
            <input
              id="wt-perbox"
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
            <label className={LABEL} htmlFor="wt-price">
              Price per box (INR)
            </label>
            <input
              id="wt-price"
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
            <label className={LABEL} htmlFor="wt-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="wt-wastage"
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
            <label className={LABEL} htmlFor="wt-thickness">
              Tile thickness (mm)
            </label>
            <input
              id="wt-thickness"
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
            <label className={LABEL} htmlFor="wt-joint">
              Grout joint width (mm)
            </label>
            <input
              id="wt-joint"
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
                : `${result.tilesRequired} tiles for ${num(result.netAreaSqft)} sqft of wall`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy wall tile take-off"
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
        If the top course comes out as a thin sliver, ask the tiler to start the first course a little
        higher so the cut lands at the bottom behind the skirting or the counter, where nobody sees it.
      </p>
    </main>
  );
}
