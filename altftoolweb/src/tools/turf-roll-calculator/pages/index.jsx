"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sprout } from "lucide-react";
import {
  DEFAULT_ROLLS_PER_PALLET,
  ROLL_PRESETS,
  WASTAGE_PRESETS,
  computeTurfRolls,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");
const int = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const DEFAULTS = {
  shape: "rectangle",
  length: "10",
  width: "8",
  area: "80",
  unit: "m",
  rollCoverage: "1",
  wastagePct: "5",
  pricePerRoll: "60",
  rollsPerPallet: String(DEFAULT_ROLLS_PER_PALLET),
  deliveryCost: "1500",
  labourRate: "25",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [shape, setShape] = useState(DEFAULTS.shape);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [area, setArea] = useState(DEFAULTS.area);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [rollCoverage, setRollCoverage] = useState(DEFAULTS.rollCoverage);
  const [wastagePct, setWastagePct] = useState(DEFAULTS.wastagePct);
  const [pricePerRoll, setPricePerRoll] = useState(DEFAULTS.pricePerRoll);
  const [rollsPerPallet, setRollsPerPallet] = useState(DEFAULTS.rollsPerPallet);
  const [deliveryCost, setDeliveryCost] = useState(DEFAULTS.deliveryCost);
  const [labourRate, setLabourRate] = useState(DEFAULTS.labourRate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTurfRolls({
        shape,
        length: toNumber(length),
        width: toNumber(width),
        area: toNumber(area),
        unit,
        rollCoverage: toNumber(rollCoverage),
        wastagePct: toNumber(wastagePct),
        pricePerRoll: toNumber(pricePerRoll),
        rollsPerPallet: toNumber(rollsPerPallet),
        deliveryCost: toNumber(deliveryCost),
        labourRate: toNumber(labourRate),
      }),
    [shape, length, width, area, unit, rollCoverage, wastagePct, pricePerRoll, rollsPerPallet, deliveryCost, labourRate],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Turf Roll Calculator",
      `Lawn area: ${num(result.netArea)} ${result.areaUnit} (${num(result.altArea)} ${result.altAreaUnit})`,
      `Trim wastage: ${num(toNumber(wastagePct))}% = ${num(result.wastageArea)} ${result.areaUnit}`,
      `Order area: ${num(result.orderArea)} ${result.areaUnit}`,
      `Rolls to order: ${int(result.rolls)} (${int(result.pallets)} pallet(s))`,
      `Turf laid by those rolls: ${num(result.coveredArea)} ${result.areaUnit}`,
      `Spare after laying: ${num(result.surplusArea)} ${result.areaUnit}`,
      `Turf cost: ${money(result.materialCost)}`,
      `Laying labour: ${money(result.labourCost)}`,
      `Delivery: ${money(result.deliveryCost)}`,
      `Total: ${money(result.totalCost)} (${money(result.costPerUnitArea)} per ${result.areaUnit})`,
    ].join("\n");
  }, [hasError, result, wastagePct]);

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
    setShape(DEFAULTS.shape);
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setArea(DEFAULTS.area);
    setUnit(DEFAULTS.unit);
    setRollCoverage(DEFAULTS.rollCoverage);
    setWastagePct(DEFAULTS.wastagePct);
    setPricePerRoll(DEFAULTS.pricePerRoll);
    setRollsPerPallet(DEFAULTS.rollsPerPallet);
    setDeliveryCost(DEFAULTS.deliveryCost);
    setLabourRate(DEFAULTS.labourRate);
    setCopied(false);
  };

  const areaUnit = unit === "m" ? "m²" : "sq ft";
  const lengthUnit = unit === "m" ? "m" : "ft";

  const rows = hasError
    ? [
        ["Lawn area measured", "—"],
        ["Trim wastage added", "—"],
        ["Area to order", "—"],
        ["Turf laid by those rolls", "—"],
        ["Spare turf left over", "—"],
        ["Pallets", "—"],
        ["Turf cost", "—"],
        ["Laying labour", "—"],
        ["Delivery", "—"],
        ["Total cost", "—"],
        ["Cost per unit area", "—"],
      ]
    : [
        ["Lawn area measured", `${num(result.netArea)} ${result.areaUnit} (${num(result.altArea)} ${result.altAreaUnit})`],
        ["Trim wastage added", `${num(result.wastageArea)} ${result.areaUnit}`],
        ["Area to order", `${num(result.orderArea)} ${result.areaUnit}`],
        ["Turf laid by those rolls", `${num(result.coveredArea)} ${result.areaUnit}`],
        ["Spare turf left over", `${num(result.surplusArea)} ${result.areaUnit}`],
        ["Pallets", int(result.pallets)],
        ["Turf cost", money(result.materialCost)],
        ["Laying labour", money(result.labourCost)],
        ["Delivery", money(result.deliveryCost)],
        ["Total cost", money(result.totalCost)],
        ["Cost per unit area", `${money(result.costPerUnitArea)} per ${result.areaUnit}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sprout className="h-4 w-4" aria-hidden="true" />
          Lawn &amp; landscape
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Turf Roll Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Measure the lawn, add a realistic trim allowance and get the exact number of turf rolls,
          pallets and the delivered cost before you place the order.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setUnit("m")} className={unit === "m" ? CHIP_ON : CHIP_BTN} aria-pressed={unit === "m"}>
            Metres
          </button>
          <button type="button" onClick={() => setUnit("ft")} className={unit === "ft" ? CHIP_ON : CHIP_BTN} aria-pressed={unit === "ft"}>
            Feet
          </button>
          <span className="w-full sm:w-auto" />
          <button
            type="button"
            onClick={() => setShape("rectangle")}
            className={shape === "rectangle" ? CHIP_ON : CHIP_BTN}
            aria-pressed={shape === "rectangle"}
          >
            Length × width
          </button>
          <button
            type="button"
            onClick={() => setShape("area")}
            className={shape === "area" ? CHIP_ON : CHIP_BTN}
            aria-pressed={shape === "area"}
          >
            I know the area
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {shape === "rectangle" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="turf-length">
                  Lawn length ({lengthUnit})
                </label>
                <input
                  id="turf-length"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="turf-width">
                  Lawn width ({lengthUnit})
                </label>
                <input
                  id="turf-width"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={width}
                  onChange={(event) => setWidth(event.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="turf-area">
                Lawn area ({areaUnit})
              </label>
              <input
                id="turf-area"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={area}
                onChange={(event) => setArea(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="turf-coverage">
              Coverage of one roll ({areaUnit})
            </label>
            <input
              id="turf-coverage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={rollCoverage}
              onChange={(event) => setRollCoverage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="turf-wastage">
              Trim wastage (%)
            </label>
            <input
              id="turf-wastage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={wastagePct}
              onChange={(event) => setWastagePct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="turf-price">
              Price per roll (₹)
            </label>
            <input
              id="turf-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={pricePerRoll}
              onChange={(event) => setPricePerRoll(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="turf-pallet">
              Rolls per pallet
            </label>
            <input
              id="turf-pallet"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={rollsPerPallet}
              onChange={(event) => setRollsPerPallet(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="turf-delivery">
              Delivery charge (₹)
            </label>
            <input
              id="turf-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={deliveryCost}
              onChange={(event) => setDeliveryCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="turf-labour">
              Laying labour (₹ per {areaUnit})
            </label>
            <input
              id="turf-labour"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={labourRate}
              onChange={(event) => setLabourRate(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Roll size preset</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ROLL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={CHIP_BTN}
                onClick={() => {
                  setUnit(preset.unit);
                  setRollCoverage(String(Number(preset.coverage.toFixed(3))));
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Typical wastage</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {WASTAGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={toNumber(wastagePct) === preset.pct ? CHIP_ON : CHIP_BTN}
                onClick={() => setWastagePct(String(preset.pct))}
              >
                {preset.label} · {preset.pct}%
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Turf rolls to order
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : int(result.rolls)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the order quantity."
                : `Covers ${num(result.coveredArea)} ${result.areaUnit} for a ${num(result.netArea)} ${result.areaUnit} lawn`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy turf roll estimate"
              className={GHOST_BTN}
              disabled={hasError}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Turf is perishable — most growers ask you to lay it within 24 hours of delivery, so order
        once your ground preparation is finished. Prices and roll sizes vary by supplier; confirm
        both before paying.
      </p>
    </main>
  );
}
