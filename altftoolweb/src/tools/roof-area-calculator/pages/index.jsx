"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Home, RotateCcw } from "lucide-react";

import { COMMON_PITCHES, MATERIAL_PRESETS, ROOF_TYPES, calculateRoofArea } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const PITCH_MODES = [
  { id: "ratio", label: "Rise in 12" },
  { id: "degrees", label: "Degrees" },
  { id: "percent", label: "Percent" },
];

const DEFAULTS = {
  roofType: "gable",
  length: "40",
  width: "30",
  overhang: "1.5",
  pitchMode: "ratio",
  pitch: "6",
  coverage: "27",
  wastage: "10",
  price: "850",
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
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [roofType, setRoofType] = useState(DEFAULTS.roofType);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [overhang, setOverhang] = useState(DEFAULTS.overhang);
  const [pitchMode, setPitchMode] = useState(DEFAULTS.pitchMode);
  const [pitch, setPitch] = useState(DEFAULTS.pitch);
  const [coverage, setCoverage] = useState(DEFAULTS.coverage);
  const [wastage, setWastage] = useState(DEFAULTS.wastage);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateRoofArea({
        buildingLengthFt: toNumber(length),
        buildingWidthFt: toNumber(width),
        overhangFt: toNumber(overhang),
        pitchValue: toNumber(pitch),
        pitchMode,
        roofType,
        coverageSqft: toNumber(coverage),
        wastagePercent: toNumber(wastage),
        pricePerUnit: toNumber(price),
      }),
    [length, width, overhang, pitch, pitchMode, roofType, coverage, wastage, price],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Roof area take-off",
      `Roof: ${result.roofTypeLabel}`,
      `Footprint: ${num(result.footprintSqft)} sqft; with overhang ${num(result.planLengthFt)} x ${num(result.planWidthFt)} ft = ${num(result.planAreaSqft)} sqft`,
      `Pitch: ${num(result.riseIn12)} in 12 = ${num(result.pitchAngleDeg)} degrees = ${num(result.pitchPercent)}%`,
      `Slope factor: ${num(result.slopeFactor)} (hip/valley ${num(result.hipValleyFactor)})`,
      `True roof area: ${num(result.roofAreaSqft)} sqft (${num(result.roofAreaSqm)} sqm)`,
      `Common rafter: ${num(result.commonRafterFt)} ft over a ${num(result.commonRunFt)} ft run`,
      `Ridge: ${num(result.ridgeLengthFt)} ft · Gutter: ${num(result.gutterLengthFt)} ft`,
      `Material: ${result.unitsRequired} units at ${num(result.coveragePerUnitSqft)} sqft each = ${money(result.materialCost)}`,
    ].join("\n");
  }, [failed, result]);

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
    setRoofType(DEFAULTS.roofType);
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setOverhang(DEFAULTS.overhang);
    setPitchMode(DEFAULTS.pitchMode);
    setPitch(DEFAULTS.pitch);
    setCoverage(DEFAULTS.coverage);
    setWastage(DEFAULTS.wastage);
    setPrice(DEFAULTS.price);
    setCopied(false);
  };

  const rows = [
    ["Footprint on plan", failed ? DASH : `${num(result.footprintSqft)} sqft`],
    [
      "Plan size including overhang",
      failed ? DASH : `${num(result.planLengthFt)} x ${num(result.planWidthFt)} ft`,
    ],
    ["Plan area covered", failed ? DASH : `${num(result.planAreaSqft)} sqft`],
    ["Pitch as rise in 12", failed ? DASH : `${num(result.riseIn12)} in 12`],
    ["Pitch in degrees", failed ? DASH : `${num(result.pitchAngleDeg)}°`],
    ["Pitch as a percentage", failed ? DASH : `${num(result.pitchPercent)}%`],
    ["Slope factor", failed ? DASH : num(result.slopeFactor)],
    ["Hip and valley factor", failed ? DASH : num(result.hipValleyFactor)],
    ["True roof surface", failed ? DASH : `${num(result.roofAreaSqft)} sqft`],
    ["In square metres", failed ? DASH : `${num(result.roofAreaSqm)} sqm`],
    ["Extra over the footprint", failed ? DASH : `${num(result.extraOverFootprintSqft)} sqft`],
    ["Common rafter run", failed ? DASH : `${num(result.commonRunFt)} ft`],
    ["Common rafter length", failed ? DASH : `${num(result.commonRafterFt)} ft`],
    ["Rise at the ridge", failed ? DASH : `${num(result.rafterRiseFt)} ft`],
    ["Ridge length", failed ? DASH : `${num(result.ridgeLengthFt)} ft`],
    ["Hip rafter length", failed ? DASH : `${num(result.hipRafterFt)} ft`],
    ["Gutter run at the eaves", failed ? DASH : `${num(result.gutterLengthFt)} ft`],
    ["Area to order with wastage", failed ? DASH : `${num(result.areaWithWastageSqft)} sqft`],
    ["Sheets, tiles or bundles", failed ? DASH : `${result.unitsRequired}`],
    ["Material cost", failed ? DASH : money(result.materialCost)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Home className="h-4 w-4" aria-hidden="true" />
          Roofing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Roof Area Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a building footprint and a pitch into the real sloped area you have to buy material for,
          along with rafter lengths, ridge, hip and gutter runs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Building</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ra-type">
              Roof type
            </label>
            <select
              id="ra-type"
              className={FIELD}
              value={roofType}
              onChange={(event) => setRoofType(event.target.value)}
            >
              {ROOF_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ra-length">
              Footprint length (ft)
            </label>
            <input
              id="ra-length"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ra-width">
              Footprint width (ft)
            </label>
            <input
              id="ra-width"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ra-overhang">
              Overhang beyond the wall on every side (ft)
            </label>
            <input
              id="ra-overhang"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={overhang}
              onChange={(event) => setOverhang(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Pitch</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PITCH_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              aria-pressed={pitchMode === mode.id}
              className={pitchMode === mode.id ? CHIP_ON : CHIP}
              onClick={() => setPitchMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="ra-pitch">
            Pitch value
          </label>
          <input
            id="ra-pitch"
            className={FIELD}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={pitch}
            onChange={(event) => setPitch(event.target.value)}
          />
        </div>
        {pitchMode === "ratio" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {COMMON_PITCHES.map((item) => (
              <button
                key={item.label}
                type="button"
                className={CHIP}
                onClick={() => setPitch(String(item.riseIn12))}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <h2 className="mt-6 text-base font-semibold">Material</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {MATERIAL_PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={CHIP}
              onClick={() => {
                setCoverage(String(item.coverageSqft));
                setWastage(String(item.wastage));
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ra-coverage">
              Area one unit covers (sqft)
            </label>
            <input
              id="ra-coverage"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.5"
              value={coverage}
              onChange={(event) => setCoverage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ra-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="ra-wastage"
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
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ra-price">
              Price per unit (INR)
            </label>
            <input
              id="ra-price"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
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
              True roof area
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${num(result.roofAreaSqft)} sqft`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a take-off."
                : `${num(result.extraOverFootprintSqft)} sqft more than the footprint, at a slope factor of ${num(result.slopeFactor)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the roof take-off"
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
        Dormers, valleys and chimneys add cut waste that a rectangular take-off cannot see. On a roof with
        more than one or two of them, push the wastage allowance towards 15% and order the ridge and
        flashing separately.
      </p>
    </main>
  );
}
