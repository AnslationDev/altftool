"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import {
  COMMON_PLANK_SIZES,
  WASTAGE_GUIDE,
  calculateLaminateFlooring,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  roomLengthFt: "12",
  roomWidthFt: "10",
  plankLengthMm: "1215",
  plankWidthMm: "195",
  planksPerPack: "8",
  wastagePercent: "8",
  pricePerPack: "1800",
  underlayRollSqm: "15",
  underlayRollPrice: "900",
  doorOpeningsFt: "3",
  beadingPieceFt: "8",
  beadingPiecePrice: "220",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [roomLengthFt, setRoomLengthFt] = useState(DEFAULTS.roomLengthFt);
  const [roomWidthFt, setRoomWidthFt] = useState(DEFAULTS.roomWidthFt);
  const [plankLengthMm, setPlankLengthMm] = useState(DEFAULTS.plankLengthMm);
  const [plankWidthMm, setPlankWidthMm] = useState(DEFAULTS.plankWidthMm);
  const [planksPerPack, setPlanksPerPack] = useState(DEFAULTS.planksPerPack);
  const [wastagePercent, setWastagePercent] = useState(DEFAULTS.wastagePercent);
  const [pricePerPack, setPricePerPack] = useState(DEFAULTS.pricePerPack);
  const [underlayRollSqm, setUnderlayRollSqm] = useState(DEFAULTS.underlayRollSqm);
  const [underlayRollPrice, setUnderlayRollPrice] = useState(DEFAULTS.underlayRollPrice);
  const [doorOpeningsFt, setDoorOpeningsFt] = useState(DEFAULTS.doorOpeningsFt);
  const [beadingPieceFt, setBeadingPieceFt] = useState(DEFAULTS.beadingPieceFt);
  const [beadingPiecePrice, setBeadingPiecePrice] = useState(DEFAULTS.beadingPiecePrice);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateLaminateFlooring({
        roomLengthFt: toNumber(roomLengthFt),
        roomWidthFt: toNumber(roomWidthFt),
        plankLengthMm: toNumber(plankLengthMm),
        plankWidthMm: toNumber(plankWidthMm),
        planksPerPack: toNumber(planksPerPack),
        wastagePercent: toNumber(wastagePercent),
        pricePerPack: toNumber(pricePerPack),
        underlayRollSqm: toNumber(underlayRollSqm),
        underlayRollPrice: toNumber(underlayRollPrice),
        doorOpeningsFt: toNumber(doorOpeningsFt),
        beadingPieceFt: toNumber(beadingPieceFt),
        beadingPiecePrice: toNumber(beadingPiecePrice),
      }),
    [
      roomLengthFt,
      roomWidthFt,
      plankLengthMm,
      plankWidthMm,
      planksPerPack,
      wastagePercent,
      pricePerPack,
      underlayRollSqm,
      underlayRollPrice,
      doorOpeningsFt,
      beadingPieceFt,
      beadingPiecePrice,
    ],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Laminate Flooring Calculator",
      `Room: ${roomLengthFt} × ${roomWidthFt} ft = ${num(result.areaSqft)} sq ft (${num(result.areaSqm)} sqm)`,
      `Plank: ${plankLengthMm} × ${plankWidthMm} mm, ${planksPerPack} per pack`,
      `Packs to buy: ${result.packs} (${result.planksSupplied} planks, ${num(result.areaCoveredSqft)} sq ft)`,
      `Wastage allowed: ${wastagePercent}% — ${result.sparePlanks} spare plank(s)`,
      `Underlay: ${result.underlayRolls} roll(s) for ${num(result.underlaySqm)} sqm`,
      `Beading: ${result.beadingPieces} piece(s) for a ${num(result.beadingRunFt)} ft run`,
      `Expansion gap: ${result.expansionGapMm} mm all round`,
      `Cost: planks ${money(result.plankCost)} + underlay ${money(result.underlayCost)} + beading ${money(result.beadingCost)} = ${money(result.totalCost)} (${money(result.costPerSqft)} per sq ft)`,
    ].join("\n");
  }, [
    hasError,
    result,
    roomLengthFt,
    roomWidthFt,
    plankLengthMm,
    plankWidthMm,
    planksPerPack,
    wastagePercent,
  ]);

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

  const applyPlank = (plank) => {
    setPlankLengthMm(String(plank.lengthMm));
    setPlankWidthMm(String(plank.widthMm));
    setPlanksPerPack(String(plank.planksPerPack));
  };

  const reset = () => {
    setRoomLengthFt(DEFAULTS.roomLengthFt);
    setRoomWidthFt(DEFAULTS.roomWidthFt);
    setPlankLengthMm(DEFAULTS.plankLengthMm);
    setPlankWidthMm(DEFAULTS.plankWidthMm);
    setPlanksPerPack(DEFAULTS.planksPerPack);
    setWastagePercent(DEFAULTS.wastagePercent);
    setPricePerPack(DEFAULTS.pricePerPack);
    setUnderlayRollSqm(DEFAULTS.underlayRollSqm);
    setUnderlayRollPrice(DEFAULTS.underlayRollPrice);
    setDoorOpeningsFt(DEFAULTS.doorOpeningsFt);
    setBeadingPieceFt(DEFAULTS.beadingPieceFt);
    setBeadingPiecePrice(DEFAULTS.beadingPiecePrice);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Tiling &amp; flooring
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Laminate Flooring Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Packs of planks, rolls of underlay and lengths of beading for one room — sized from your
          plank dimensions with a wastage allowance, so nothing stalls the fitter halfway through.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Room</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-length">
              Room length (ft)
            </label>
            <input
              id="lf-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={roomLengthFt}
              onChange={(event) => setRoomLengthFt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-width">
              Room width (ft)
            </label>
            <input
              id="lf-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={roomWidthFt}
              onChange={(event) => setRoomWidthFt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-waste">
              Wastage allowance (%)
            </label>
            <input
              id="lf-waste"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={wastagePercent}
              onChange={(event) => setWastagePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-doors">
              Doorway width, no beading (ft)
            </label>
            <input
              id="lf-doors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={doorOpeningsFt}
              onChange={(event) => setDoorOpeningsFt(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {WASTAGE_GUIDE.map((item) => (
            <button
              key={item.percent}
              type="button"
              title={item.label}
              onClick={() => setWastagePercent(String(item.percent))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {item.percent}% · {item.label.split(",")[0]}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Plank</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {COMMON_PLANK_SIZES.map((plank) => (
            <button
              key={plank.label}
              type="button"
              onClick={() => applyPlank(plank)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {plank.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-plank-l">
              Plank length (mm)
            </label>
            <input
              id="lf-plank-l"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={plankLengthMm}
              onChange={(event) => setPlankLengthMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-plank-w">
              Plank width (mm)
            </label>
            <input
              id="lf-plank-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={plankWidthMm}
              onChange={(event) => setPlankWidthMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-per-pack">
              Planks per pack
            </label>
            <input
              id="lf-per-pack"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={planksPerPack}
              onChange={(event) => setPlanksPerPack(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-pack-price">
              Price per pack (INR)
            </label>
            <input
              id="lf-pack-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={pricePerPack}
              onChange={(event) => setPricePerPack(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Underlay and beading</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-roll">
              Underlay roll covers (sqm)
            </label>
            <input
              id="lf-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="1"
              value={underlayRollSqm}
              onChange={(event) => setUnderlayRollSqm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-roll-price">
              Price per underlay roll (INR)
            </label>
            <input
              id="lf-roll-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={underlayRollPrice}
              onChange={(event) => setUnderlayRollPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-bead">
              Beading piece length (ft)
            </label>
            <input
              id="lf-bead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={beadingPieceFt}
              onChange={(event) => setBeadingPieceFt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-bead-price">
              Price per beading piece (INR)
            </label>
            <input
              id="lf-bead-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={beadingPiecePrice}
              onChange={(event) => setBeadingPiecePrice(event.target.value)}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Packs of laminate to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : result.packs}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${result.planksSupplied} planks covering ${num(result.areaCoveredSqft)} sq ft of a ${num(result.areaSqft)} sq ft floor`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the laminate flooring take-off"
              className={GHOST_BTN}
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
            ["Floor area", hasError ? dash : `${num(result.areaSqft)} sq ft · ${num(result.areaSqm)} sqm`],
            ["One pack covers", hasError ? dash : `${num(result.packCoverageSqft)} sq ft (${num(result.packCoverageSqm)} sqm)`],
            ["Planks needed with wastage", hasError ? dash : String(result.planksRequired)],
            ["Spare planks left over", hasError ? dash : String(result.sparePlanks)],
            ["Underlay", hasError ? dash : `${result.underlayRolls} roll(s) for ${num(result.underlaySqm)} sqm`],
            ["Beading run", hasError ? dash : `${num(result.beadingRunFt)} ft (perimeter ${num(result.perimeterFt)} ft less doorways)`],
            ["Beading pieces", hasError ? dash : `${result.beadingPieces} × giving ${num(result.beadingSuppliedFt)} ft`],
            ["Expansion gap all round", hasError ? dash : `${result.expansionGapMm} mm`],
            ["Rows across the room", hasError ? dash : `${result.fullRows} full + a ${num(result.lastRowWidthMm)} mm strip`],
            ["Plank cost", hasError ? dash : money(result.plankCost)],
            ["Underlay cost", hasError ? dash : money(result.underlayCost)],
            ["Beading cost", hasError ? dash : money(result.beadingCost)],
            ["Total material cost", hasError ? dash : `${money(result.totalCost)} (${money(result.costPerSqft)}/sq ft)`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.lastRowWidthMm > 0 && result.lastRowWidthMm < 60 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The last row works out to only {num(result.lastRowWidthMm)} mm. Fitters usually trim the
            first row instead so the strips at both walls are of a similar, more stable width.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates for a single rectangular room. Alcoves, bay windows, staircases and pillars all add
        cuts, so measure each area separately and add its own wastage. Leave the expansion gap at every
        wall, pipe and threshold — a floating floor that is pinched will lift at the joints.
      </p>
    </main>
  );
}
