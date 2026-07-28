"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Grid3x3, RotateCcw } from "lucide-react";

import { calculateTiles, TROWELS } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const n0 = (v) => (Number.isFinite(v) ? NUM.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  length: "4",
  width: "3",
  roomUnit: "m",
  deduct: "0",
  tileWidth: "600",
  tileHeight: "600",
  tileUnit: "mm",
  thickness: "9",
  joint: "3",
  wastage: "10",
  perBox: "4",
  price: "1600",
  trowel: "10",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/[,\s]/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [roomUnit, setRoomUnit] = useState(DEFAULTS.roomUnit);
  const [deduct, setDeduct] = useState(DEFAULTS.deduct);
  const [tileWidth, setTileWidth] = useState(DEFAULTS.tileWidth);
  const [tileHeight, setTileHeight] = useState(DEFAULTS.tileHeight);
  const [tileUnit, setTileUnit] = useState(DEFAULTS.tileUnit);
  const [thickness, setThickness] = useState(DEFAULTS.thickness);
  const [joint, setJoint] = useState(DEFAULTS.joint);
  const [wastage, setWastage] = useState(DEFAULTS.wastage);
  const [perBox, setPerBox] = useState(DEFAULTS.perBox);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [trowel, setTrowel] = useState(DEFAULTS.trowel);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateTiles({
        length: toNum(length),
        width: toNum(width),
        roomUnit,
        deductArea: toNum(deduct) || 0,
        tileWidth: toNum(tileWidth),
        tileHeight: toNum(tileHeight),
        tileUnit,
        tileThickness: toNum(thickness) || 9,
        jointMm: toNum(joint) || 0,
        wastagePercent: toNum(wastage) || 0,
        tilesPerBox: toNum(perBox) || 1,
        pricePerBox: toNum(price) || 0,
        trowel,
      }),
    [
      length,
      width,
      roomUnit,
      deduct,
      tileWidth,
      tileHeight,
      tileUnit,
      thickness,
      joint,
      wastage,
      perBox,
      price,
      trowel,
    ],
  );

  const error = result.error ? result.error : null;
  const ok = !error;

  const reset = () => {
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setRoomUnit(DEFAULTS.roomUnit);
    setDeduct(DEFAULTS.deduct);
    setTileWidth(DEFAULTS.tileWidth);
    setTileHeight(DEFAULTS.tileHeight);
    setTileUnit(DEFAULTS.tileUnit);
    setThickness(DEFAULTS.thickness);
    setJoint(DEFAULTS.joint);
    setWastage(DEFAULTS.wastage);
    setPerBox(DEFAULTS.perBox);
    setPrice(DEFAULTS.price);
    setTrowel(DEFAULTS.trowel);
    setCopied(false);
  };

  const copy = async () => {
    if (!ok) return;
    const lines = [
      "Tile take-off",
      `Area to tile: ${n2(result.netAreaM2)} m² (${n2(result.netAreaFt2)} sq ft)`,
      `Tile: ${tileWidth} × ${tileHeight} ${tileUnit}, ${result.jointMm} mm joint`,
      `Tiles needed with ${n1(result.wastagePercent)}% wastage: ${n0(result.tilesNeeded)}`,
      `Boxes to order: ${n0(result.boxes)} (${n0(result.tilesPerBox)} per box = ${n0(result.tilesSupplied)} tiles)`,
      `Spare tiles left over: ${n0(result.spareTiles)}`,
      `Grout: ${n2(result.groutKg)} kg (${n2(result.groutKgPerM2)} kg/m²)`,
      `Adhesive: ${n2(result.adhesiveKg)} kg — about ${n0(result.adhesiveBags)} × 20 kg bags`,
      `Tile cost: ${money(result.tileCost)} (${money(result.costPerM2)} per m²)`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const areaUnit = roomUnit === "ft" ? "sq ft" : "m²";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <Grid3x3 className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tile Calculator</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Work out tiles, boxes, grout and adhesive for a floor or wall. Grout joints are
            counted in the tile module, so the count matches what actually gets laid.
          </p>
        </div>
      </header>

      <h2 className="text-lg font-semibold text-[var(--foreground)]">The area</h2>
      <section className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-length">
            Length
          </label>
          <input
            id="tc-length"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-width">
            Width or wall height
          </label>
          <input
            id="tc-width"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-runit">
            Room units
          </label>
          <select
            id="tc-runit"
            className={`${INPUT_CLASS} mt-1`}
            value={roomUnit}
            onChange={(e) => setRoomUnit(e.target.value)}
          >
            <option value="m">Metres</option>
            <option value="ft">Feet</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-deduct">
            Area to deduct ({areaUnit})
          </label>
          <input
            id="tc-deduct"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={deduct}
            onChange={(e) => setDeduct(e.target.value)}
          />
          <p className={HINT_CLASS}>Doorways, a shower tray, kitchen units — anything not tiled.</p>
        </div>
      </section>

      <h2 className="mt-6 text-lg font-semibold text-[var(--foreground)]">The tile</h2>
      <section className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-tw">
            Tile width
          </label>
          <input
            id="tc-tw"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={tileWidth}
            onChange={(e) => setTileWidth(e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-th">
            Tile height
          </label>
          <input
            id="tc-th"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={tileHeight}
            onChange={(e) => setTileHeight(e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-tunit">
            Tile units
          </label>
          <select
            id="tc-tunit"
            className={`${INPUT_CLASS} mt-1`}
            value={tileUnit}
            onChange={(e) => setTileUnit(e.target.value)}
          >
            <option value="mm">Millimetres</option>
            <option value="in">Inches</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-joint">
            Grout joint (mm)
          </label>
          <input
            id="tc-joint"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={joint}
            onChange={(e) => setJoint(e.target.value)}
          />
          <p className={HINT_CLASS}>2–3 mm for rectified porcelain, 3–5 mm for pressed ceramic.</p>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-thick">
            Tile thickness (mm)
          </label>
          <input
            id="tc-thick"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
          />
          <p className={HINT_CLASS}>Used for the grout quantity — the joint is as deep as the tile.</p>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-waste">
            Wastage allowance (%)
          </label>
          <input
            id="tc-waste"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={wastage}
            onChange={(e) => setWastage(e.target.value)}
          />
          <p className={HINT_CLASS}>5% for a straight grid, 10% typical, 15%+ for diagonal or herringbone.</p>
        </div>
      </section>

      <h2 className="mt-6 text-lg font-semibold text-[var(--foreground)]">Ordering</h2>
      <section className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-perbox">
            Tiles per box
          </label>
          <input
            id="tc-perbox"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="numeric"
            value={perBox}
            onChange={(e) => setPerBox(e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tc-price">
            Price per box
          </label>
          <input
            id="tc-price"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor="tc-trowel">
            Notched trowel
          </label>
          <select
            id="tc-trowel"
            className={`${INPUT_CLASS} mt-1`}
            value={trowel}
            onChange={(e) => setTrowel(e.target.value)}
          >
            {TROWELS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <p className={HINT_CLASS}>Sets the adhesive bed depth, which sets how many bags you need.</p>
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </div>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Boxes to order</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--primary)]">
          {ok ? n0(result.boxes) : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok
            ? `${n0(result.tilesNeeded)} tiles needed for ${n2(result.netAreaM2)} m², supplied as ${n0(result.tilesSupplied)} tiles`
            : "Fix the input above to see a result."}
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Area to tile</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? `${n2(result.netAreaM2)} m² / ${n2(result.netAreaFt2)} sq ft` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Tiles without wastage</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? n2(result.tilesExact) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Tiles with wastage</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? n0(result.tilesNeeded) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Spare tiles after the job</dt>
            <dd className="text-sm font-semibold text-[var(--success)]">
              {ok ? n0(result.spareTiles) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Real wastage once boxed</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? `${n1(result.deliveredWastePercent)}%` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Covering module per tile</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? `${n1(result.moduleAreaCm2)} cm²` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Grout needed</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? `${n2(result.groutKg)} kg (${n2(result.groutKgPerM2)} kg/m²)` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Adhesive needed</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? `${n2(result.adhesiveKg)} kg — ${n0(result.adhesiveBags)} × 20 kg bags` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2 sm:col-span-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Tile cost</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? `${money(result.tileCost)} — ${money(result.costPerM2)} per m²` : DASH}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className={PRIMARY_BTN} onClick={copy} aria-label="Copy the tile take-off to the clipboard">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all inputs to their defaults">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--foreground)]">The rules behind the numbers</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="py-2 pr-3 text-left font-medium text-[var(--muted-foreground)]">Tile count</th>
                <td className="py-2 text-[var(--foreground)]">
                  area ÷ ((tile width + joint) × (tile height + joint)) × (1 + wastage)
                </td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="py-2 pr-3 text-left font-medium text-[var(--muted-foreground)]">Grout</th>
                <td className="py-2 text-[var(--foreground)]">
                  ((A + B) ÷ (A × B)) × joint × thickness × 1.6 kg per m², all in mm
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-medium text-[var(--muted-foreground)]">Adhesive</th>
                <td className="py-2 text-[var(--foreground)]">
                  1.5 kg per m² for every mm of bed depth ({ok ? `${result.bedMm} mm here` : DASH})
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Buy every box from the same shade and calibre batch, and keep the spares — a box
          bought later rarely matches.
        </p>
      </section>
    </div>
  );
}
