"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RotateCcw, Warehouse } from "lucide-react";

import { ACCESS_LEVELS, CEILING_OPTIONS, ITEMS, selectStorageUnit } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DEFAULT_COUNTS = {
  doubleBed: 1,
  singleBed: 0,
  wardrobe: 2,
  sofa3: 1,
  sofa2: 0,
  diningSet: 1,
  bookshelf: 1,
  desk: 0,
  mattressExtra: 0,
  fridge: 1,
  washer: 1,
  ac: 0,
  tv: 1,
  bicycle: 0,
  twoWheeler: 0,
  treadmill: 0,
  gardenTools: 0,
  suitcase: 0,
};
const DEFAULTS = {
  cartons: "40",
  extraCuft: "0",
  ceiling: "8",
  access: "occasional",
  ratePerSqFt: "35",
};

const GROUPS = ["Furniture", "Appliances", "Bulky"];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [cartons, setCartons] = useState(DEFAULTS.cartons);
  const [extraCuft, setExtraCuft] = useState(DEFAULTS.extraCuft);
  const [ceiling, setCeiling] = useState(DEFAULTS.ceiling);
  const [access, setAccess] = useState(DEFAULTS.access);
  const [ratePerSqFt, setRatePerSqFt] = useState(DEFAULTS.ratePerSqFt);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  const result = useMemo(
    () =>
      selectStorageUnit({
        counts,
        cartons: cartons === "" ? 0 : Number(cartons),
        extraCuft: extraCuft === "" ? 0 : Number(extraCuft),
        ceiling,
        access,
        ratePerSqFt: ratePerSqFt === "" ? 0 : Number(ratePerSqFt),
      }),
    [counts, cartons, extraCuft, ceiling, access, ratePerSqFt],
  );

  const hasError = Boolean(result.error);

  const setCount = (id) => (event) => {
    const raw = event.target.value;
    setCounts((current) => ({ ...current, [id]: raw === "" ? 0 : Number(raw) }));
  };

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      "Storage unit estimate",
      `Recommended: ${result.recommended.label}${result.fitsInOne ? "" : ` x ${result.unitsNeeded}`}`,
      `Stored volume: ${DEC.format(result.totalCuft)} cu ft (${DEC2.format(result.totalM3)} m3)`,
      `Usable capacity: ${NUM.format(result.recommended.usable)} cu ft per unit at ${DEC.format(result.stackHeightFt)} ft stack height`,
      `Fill: ${NUM.format(result.fillPercent)}% · spare ${NUM.format(result.spareCuft)} cu ft`,
      result.monthlyCost === null ? "" : `Estimated rent: ${INR.format(result.monthlyCost)} per month`,
      "",
      "Largest contributors:",
      ...result.lines.slice(0, 8).map((line) => `${line.qty} x ${line.label} — ${DEC.format(line.cuft)} cu ft`),
      `Cartons — ${DEC.format(result.cartonCuft)} cu ft`,
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCounts(DEFAULT_COUNTS);
    setCartons(DEFAULTS.cartons);
    setExtraCuft(DEFAULTS.extraCuft);
    setCeiling(DEFAULTS.ceiling);
    setAccess(DEFAULTS.access);
    setRatePerSqFt(DEFAULTS.ratePerSqFt);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Warehouse className="h-4 w-4" aria-hidden="true" />
          Moving &amp; relocation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Storage Unit Size Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A unit&apos;s advertised size is floor area; what you buy is volume. This adds up the packed
          cube of what you are storing and finds the smallest unit that holds it after 18 inches of
          sprinkler clearance and the access you need.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What are you storing?</h2>
        {GROUPS.map((group) => (
          <div key={group} className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {group}
            </p>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              {ITEMS.filter((item) => item.group === group).map((item) => (
                <div key={item.id}>
                  <label className={LABEL_CLASS} htmlFor={`su-${item.id}`}>
                    {item.label}
                    <span className="ml-1 font-normal text-[var(--muted-foreground)]">
                      ({item.cuft} cu ft)
                    </span>
                  </label>
                  <input
                    id={`su-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="99"
                    step="1"
                    value={counts[item.id] ?? 0}
                    onChange={setCount(item.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="su-cartons">
              Cartons (any size)
            </label>
            <input
              id="su-cartons"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="999"
              step="1"
              value={cartons}
              onChange={(event) => setCartons(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="su-extra">
              Anything else (cu ft)
            </label>
            <input
              id="su-extra"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="5000"
              step="5"
              value={extraCuft}
              onChange={(event) => setExtraCuft(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="su-ceiling">
              Ceiling height
            </label>
            <select
              id="su-ceiling"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ceiling}
              onChange={(event) => setCeiling(event.target.value)}
            >
              {CEILING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="su-rate">
              Quoted rent (₹ per sq ft per month)
            </label>
            <input
              id="su-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="1000"
              step="1"
              value={ratePerSqFt}
              onChange={(event) => setRatePerSqFt(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="su-access">
              How much access do you need?
            </label>
            <select
              id="su-access"
              className={`mt-2 ${INPUT_CLASS}`}
              value={access}
              onChange={(event) => setAccess(event.target.value)}
            >
              {ACCESS_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended unit
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError
                ? DASH
                : result.fitsInOne
                  ? result.recommended.label
                  : `${result.recommended.label} × ${result.unitsNeeded}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a recommendation." : result.recommended.holds}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the storage unit recommendation"
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
            ["Volume to store", hasError ? DASH : `${DEC.format(result.totalCuft)} cu ft`],
            ["Volume to store (metric)", hasError ? DASH : `${DEC2.format(result.totalM3)} m³`],
            ["Usable capacity per unit", hasError ? DASH : `${NUM.format(result.recommended.usable)} cu ft`],
            ["Stackable height", hasError ? DASH : `${DEC.format(result.stackHeightFt)} ft`],
            ["Fill", hasError ? DASH : `${NUM.format(result.fillPercent)}%`],
            ["Spare capacity", hasError ? DASH : `${NUM.format(result.spareCuft)} cu ft`],
            ["Floor area", hasError ? DASH : `${NUM.format(result.floorAreaSqft)} sq ft (${DEC.format(result.floorAreaM2)} m²)`],
            [
              "Estimated monthly rent",
              hasError ? DASH : result.monthlyCost === null ? "Enter a rate above" : INR.format(result.monthlyCost),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.smaller && result.shedCuft > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Store {NUM.format(result.shedCuft)} cu ft less and a {result.smaller.label} would do —
            {result.smaller.monthlyCost === null
              ? " a smaller footprint every month."
              : ` ${INR.format(result.smaller.monthlyCost)} a month instead.`}
          </p>
        ) : null}
      </section>

      {!hasError && result.lines.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the volume goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Item
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Qty
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Cu ft
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{line.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(line.qty)}
                    </td>
                    <td className="py-2 text-right font-semibold">{DEC.format(line.cuft)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Unit sizes compared</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Usable capacity shown for your ceiling height and access choice.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Unit
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Floor
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Usable
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Rent / month
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.units).map((unit) => {
                const isPick = unit.id === result.recommended.id;
                return (
                  <tr
                    key={unit.id}
                    className={`border-b border-[var(--border)] last:border-0 align-top ${
                      isPick ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">
                      <span className={isPick ? "font-semibold text-[var(--primary)]" : "font-semibold"}>
                        {unit.label}
                      </span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{unit.holds}</span>
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {NUM.format(unit.sqft)} sq ft
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {NUM.format(unit.usable)} cu ft
                    </td>
                    <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {unit.monthlyCost === null ? DASH : INR.format(unit.monthlyCost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning estimate. Confirm the actual internal dimensions, door opening and ceiling height
        before signing — a wardrobe that will not go through the door is worth more than the cubic
        feet it occupies. Check what the operator prohibits (fuel, batteries, perishables) and whether
        your contents insurance covers goods held off-site.
      </p>
    </main>
  );
}
