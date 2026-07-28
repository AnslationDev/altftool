"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, RotateCcw } from "lucide-react";

import {
  BLOOD_LOSS_REFERENCE,
  PRODUCT_TYPES,
  TAMPON_MAX_WEAR_HOURS,
  estimateProductUsage,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const count = (value) => (Number.isFinite(value) ? NUM0.format(value) : DASH);

const DEFAULTS = {
  cycleLength: "28",
  heavyDays: "2",
  moderateDays: "2",
  lightDays: "2",
  productType: "pad",
  unitCost: "8",
  cupCost: "500",
  cupYears: "2",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [cycleLength, setCycleLength] = useState(DEFAULTS.cycleLength);
  const [heavyDays, setHeavyDays] = useState(DEFAULTS.heavyDays);
  const [moderateDays, setModerateDays] = useState(DEFAULTS.moderateDays);
  const [lightDays, setLightDays] = useState(DEFAULTS.lightDays);
  const [productType, setProductType] = useState(DEFAULTS.productType);
  const [unitCost, setUnitCost] = useState(DEFAULTS.unitCost);
  const [cupCost, setCupCost] = useState(DEFAULTS.cupCost);
  const [cupYears, setCupYears] = useState(DEFAULTS.cupYears);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateProductUsage({
        cycleLength: toNumber(cycleLength),
        heavyDays: toNumber(heavyDays),
        moderateDays: toNumber(moderateDays),
        lightDays: toNumber(lightDays),
        productType,
        unitCost: toNumber(unitCost),
        cupCost: toNumber(cupCost),
        cupYears: toNumber(cupYears),
      }),
    [cycleLength, heavyDays, moderateDays, lightDays, productType, unitCost, cupCost, cupYears],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Period Product Usage Estimator",
      `Product: ${result.productLabel}`,
      `Period: ${count(result.totalDays)} days per cycle, ${NUM1.format(result.cyclesPerYear)} cycles a year`,
      result.reusable
        ? `Cup empties per period: ${count(result.emptiesPerCycle)}`
        : `Per cycle: ${count(result.perCycle)} | Per year: ${count(result.perYear)}`,
      result.reusable ? "" : `Cost per year: ${money(result.yearlyCost)}`,
      result.reusable
        ? ""
        : `Cost over ${result.comparisonYears} years: ${money(result.multiYearCost)} versus ${money(result.cupMultiYearCost)} for cups`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result]);

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
    setCycleLength(DEFAULTS.cycleLength);
    setHeavyDays(DEFAULTS.heavyDays);
    setModerateDays(DEFAULTS.moderateDays);
    setLightDays(DEFAULTS.lightDays);
    setProductType(DEFAULTS.productType);
    setUnitCost(DEFAULTS.unitCost);
    setCupCost(DEFAULTS.cupCost);
    setCupYears(DEFAULTS.cupYears);
    setCopied(false);
  };

  const rows = [
    ["Days of bleeding per cycle", ok ? count(result.totalDays) : DASH],
    ["Cycles per year", ok ? NUM1.format(result.cyclesPerYear) : DASH],
    [
      ok && result.reusable ? "Cup empties per period" : "Products per year",
      ok ? count(result.reusable ? result.emptiesPerCycle : result.perYear) : DASH,
    ],
    ["Cost per cycle", ok ? money(result.disposablePerCycleCost) : DASH],
    ["Cost per year", ok ? money(result.yearlyCost) : DASH],
    [`Cost over ${ok ? result.comparisonYears : 5} years`, ok ? money(result.multiYearCost) : DASH],
    ["Maximum safe wear time", ok ? `${result.maxWearHours} hours` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          Cycle tracking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Period Product Usage Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Counts are driven by safe wear time, not guesswork: heavy days at a 4-hour change, moderate
          days at 6 hours and light days at the 8-hour maximum. Enter your flow days to get the
          number per cycle, per year and what it costs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your period</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="prod-cycle">
              Average cycle length (days)
            </label>
            <input
              id="prod-cycle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="20"
              max="45"
              step="1"
              value={cycleLength}
              onChange={(event) => setCycleLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prod-product">
              Product you use
            </label>
            <select
              id="prod-product"
              className={`mt-2 ${INPUT_CLASS}`}
              value={productType}
              onChange={(event) => setProductType(event.target.value)}
            >
              {PRODUCT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prod-heavy">
              Heavy days
            </label>
            <input
              id="prod-heavy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={heavyDays}
              onChange={(event) => setHeavyDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prod-moderate">
              Moderate days
            </label>
            <input
              id="prod-moderate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={moderateDays}
              onChange={(event) => setModerateDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prod-light">
              Light or spotting days
            </label>
            <input
              id="prod-light"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={lightDays}
              onChange={(event) => setLightDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prod-cost">
              Cost per product (INR)
            </label>
            <input
              id="prod-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="1000"
              step="0.5"
              value={unitCost}
              onChange={(event) => setUnitCost(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Menstrual cup comparison</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="prod-cup-cost">
              Price of one cup (INR)
            </label>
            <input
              id="prod-cup-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20000"
              step="50"
              value={cupCost}
              onChange={(event) => setCupCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prod-cup-years">
              Years before you replace it
            </label>
            <input
              id="prod-cup-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="10"
              step="0.5"
              value={cupYears}
              onChange={(event) => setCupYears(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {ok && result.reusable ? "Cup empties per period" : "Products per cycle"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? count(result.reusable ? result.emptiesPerCycle : result.perCycle) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.productLabel}, ${count(result.totalDays)} days of bleeding per cycle`
                : "Fix the highlighted input to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy period product estimate"
              className={GHOST_BTN}
              disabled={!ok}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && !result.reusable ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Over {result.comparisonYears} years you would spend {money(result.multiYearCost)} on{" "}
            {result.productLabel.toLowerCase()} against {money(result.cupMultiYearCost)} for{" "}
            {count(result.cupsNeeded)} cup{result.cupsNeeded === 1 ? "" : "s"} —{" "}
            {result.cupSavesMoney
              ? `a saving of ${money(result.savingsVsCup)}`
              : `the cup would cost ${money(Math.abs(result.savingsVsCup))} more`}
            .
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Breakdown by flow level</h2>
          <table className="mt-3 w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Flow level
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Days
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Change every
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Per cycle
                </th>
              </tr>
            </thead>
            <tbody>
              {result.byLevel.map((level) => (
                <tr key={level.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{level.label}</td>
                  <td className="py-2 pr-3 text-right">{count(level.days)}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {level.intervalHours} h
                  </td>
                  <td className="py-2 text-right font-semibold">{NUM1.format(level.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Never leave a single tampon in for more than {TAMPON_MAX_WEAR_HOURS}{" "}
        hours. Typical total blood loss across a period is about{" "}
        {BLOOD_LOSS_REFERENCE.typicalMinMl}-{BLOOD_LOSS_REFERENCE.typicalMaxMl} mL, and{" "}
        {BLOOD_LOSS_REFERENCE.heavyThresholdMl} mL or more is the clinical definition of heavy
        menstrual bleeding — if you are soaking through a product every hour or two, or bleeding for
        more than seven days, see a clinician.
      </p>
    </main>
  );
}
