"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingDown } from "lucide-react";

import {
  BENCHMARK_KM_PER_YEAR,
  DEFAULT_FLOOR_PCT,
  FUEL_TYPES,
  computeCarDepreciation,
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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const DEFAULTS = {
  price: "1200000",
  age: "4",
  km: "48000",
  firstYearRate: "20",
  subsequentRate: "15",
  fuelType: "petrol",
  floorPct: String(DEFAULT_FLOOR_PCT),
  applyKm: true,
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [age, setAge] = useState(DEFAULTS.age);
  const [km, setKm] = useState(DEFAULTS.km);
  const [firstYearRate, setFirstYearRate] = useState(DEFAULTS.firstYearRate);
  const [subsequentRate, setSubsequentRate] = useState(DEFAULTS.subsequentRate);
  const [fuelType, setFuelType] = useState(DEFAULTS.fuelType);
  const [floorPct, setFloorPct] = useState(DEFAULTS.floorPct);
  const [applyKm, setApplyKm] = useState(DEFAULTS.applyKm);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCarDepreciation({
        exShowroomPrice: toNumber(price),
        ageYears: toNumber(age),
        kmDriven: toNumber(km),
        firstYearRate: toNumber(firstYearRate),
        subsequentRate: toNumber(subsequentRate),
        fuelType,
        floorPct: toNumber(floorPct),
        applyKmAdjustment: applyKm,
        horizonYears: 10,
      }),
    [price, age, km, firstYearRate, subsequentRate, fuelType, floorPct, applyKm],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Car Depreciation Calculator",
      `Ex-showroom price: ${INR.format(result.exShowroomPrice)}`,
      `Age: ${result.ageYears} years, ${NUM.format(result.kmDriven)} km run`,
      `Estimated value now: ${INR.format(result.currentValue)} (${NUM1.format(result.retainedPct)}% retained)`,
      `Total depreciation: ${INR.format(result.totalLoss)}`,
      `Average loss: ${INR.format(result.perYearLoss)} per year, ${INR2.format(result.perKmLoss)} per km`,
      `Effective compound rate: ${NUM1.format(result.effectiveAnnualPct)}% per year`,
      result.idv.beyondSchedule
        ? "Insurance IDV: over 5 years, mutually agreed with the insurer"
        : `Insurance IDV (IRDAI schedule, ${result.idv.depreciationPct}% off listed price): ${INR.format(result.idv.idv)}`,
    ].join("\n");
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
    setPrice(DEFAULTS.price);
    setAge(DEFAULTS.age);
    setKm(DEFAULTS.km);
    setFirstYearRate(DEFAULTS.firstYearRate);
    setSubsequentRate(DEFAULTS.subsequentRate);
    setFuelType(DEFAULTS.fuelType);
    setFloorPct(DEFAULTS.floorPct);
    setApplyKm(DEFAULTS.applyKm);
    setCopied(false);
  };

  const maxRowValue = ok ? Math.max(...result.rows.map((row) => row.value), 1) : 1;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingDown className="h-4 w-4" aria-hidden="true" />
          Resale &amp; depreciation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Car Depreciation Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See the declining-balance curve your car is following, what it is worth today after
          adjusting for kilometres run, and the separate IDV figure your insurer will use.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-price">
              Ex-showroom price when new (INR)
            </label>
            <input
              id="dep-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-age">
              Age today (years)
            </label>
            <input
              id="dep-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-km">
              Kilometres on the odometer
            </label>
            <input
              id="dep-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={km}
              onChange={(event) => setKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-fuel">
              Fuel type
            </label>
            <select
              id="dep-fuel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fuelType}
              onChange={(event) => setFuelType(event.target.value)}
            >
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel.id} value={fuel.id}>
                  {fuel.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-r1">
              First-year depreciation (%)
            </label>
            <input
              id="dep-r1"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="99"
              step="1"
              value={firstYearRate}
              onChange={(event) => setFirstYearRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-r2">
              Each later year (%)
            </label>
            <input
              id="dep-r2"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="99"
              step="1"
              value={subsequentRate}
              onChange={(event) => setSubsequentRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-floor">
              Residual floor (% of ex-showroom)
            </label>
            <input
              id="dep-floor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={floorPct}
              onChange={(event) => setFloorPct(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="dep-kmadj"
            >
              <input
                id="dep-kmadj"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={applyKm}
                onChange={(event) => setApplyKm(event.target.checked)}
              />
              Adjust for kilometres run
            </label>
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated value today
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? INR.format(result.currentValue) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM1.format(result.retainedPct)}% of the ${INR.format(result.exShowroomPrice)} paid, after ${result.ageYears} years`
                : "Fix the inputs above to see a value"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy depreciation result"
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

        <dl
          className="mt-5 divide-y divide-[var(--border)] text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {[
            ["Total depreciation so far", ok ? INR.format(result.totalLoss) : DASH],
            ["Average loss per year", ok ? INR.format(result.perYearLoss) : DASH],
            ["Depreciation cost per kilometre", ok ? INR2.format(result.perKmLoss) : DASH],
            ["Effective compound rate", ok ? `${NUM1.format(result.effectiveAnnualPct)}% per year` : DASH],
            [
              "Value on the curve before km adjustment",
              ok ? INR.format(result.curveValue) : DASH,
            ],
            [
              `Kilometres vs ${NUM.format(BENCHMARK_KM_PER_YEAR)} km/year benchmark`,
              ok ? `${NUM.format(result.kmDriven)} run vs ${NUM.format(result.expectedKm)} expected` : DASH,
            ],
            [
              "Adjustment applied for usage",
              ok ? `${result.kmAdjustPct > 0 ? "−" : result.kmAdjustPct < 0 ? "+" : ""}${NUM1.format(Math.abs(result.kmAdjustPct))}%` : DASH,
            ],
            ["Residual floor used", ok ? INR.format(result.floorValue) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Insurance IDV (IRDAI schedule)</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok ? result.idv.note : "Enter a valid price and age."}
        </p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Age band", ok ? result.idv.label : DASH],
            [
              "Tariff depreciation",
              ok && !result.idv.beyondSchedule ? `${result.idv.depreciationPct}%` : DASH,
            ],
            [
              "Insured Declared Value",
              ok && !result.idv.beyondSchedule ? INR.format(result.idv.idv) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Year-by-year curve</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Age</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Value</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Lost that year</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Retained</th>
                <th scope="col" className="py-2 font-semibold">Curve</th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.rows.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">{row.year} yr</td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">{INR.format(row.value)}</td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {INR.format(row.lossThisYear)}
                    </td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">{NUM1.format(row.retainedPct)}%</td>
                    <td className="py-2.5">
                      <span
                        className="block h-2 rounded-full bg-[var(--primary)]"
                        style={{ width: `${Math.max(2, (row.value / maxRowValue) * 100)}%` }}
                        aria-hidden="true"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2.5 pr-3">{DASH}</td>
                  <td className="py-2.5 pr-3 text-right">{DASH}</td>
                  <td className="py-2.5 pr-3 text-right">{DASH}</td>
                  <td className="py-2.5 pr-3 text-right">{DASH}</td>
                  <td className="py-2.5">{DASH}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {ok ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Registration certificate runs out in {NUM1.format(result.yearsToRcExpiry)} years
            ({result.rcLimit}-year RC life). In Delhi-NCR this fuel type is off the road after{" "}
            {result.ncrLimit} years — {NUM1.format(result.yearsToNcrLimit)} years left.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimates. Real resale depends on the variant, service history, accident
        record, colour and how strong that specific model is in your city. The IDV figure follows
        the Indian Motor Tariff schedule; your insurer&apos;s quote is the binding one.
      </p>
    </main>
  );
}
