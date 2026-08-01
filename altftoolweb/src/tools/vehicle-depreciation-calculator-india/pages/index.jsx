"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingDown } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  BEYOND_FIVE_DEFAULT_PERCENT_PA,
  HALF_YEAR_DAYS,
  INCOME_TAX_BLOCKS,
  MAX_AGE_MONTHS,
  TARIFF_SLABS,
  valueVehicle,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  price: "1000000",
  ageMonths: "30",
  beyondRate: String(BEYOND_FIVE_DEFAULT_PERCENT_PA),
  blockId: "car",
  halfFirstYear: false,
  condition: "0",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [ageMonths, setAgeMonths] = useState(DEFAULTS.ageMonths);
  const [beyondRate, setBeyondRate] = useState(DEFAULTS.beyondRate);
  const [blockId, setBlockId] = useState(DEFAULTS.blockId);
  const [halfFirstYear, setHalfFirstYear] = useState(DEFAULTS.halfFirstYear);
  const [condition, setCondition] = useState(DEFAULTS.condition);
  const { copy: copyToClipboard, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(
    () =>
      valueVehicle({
        price: toNumber(price),
        ageMonths: toNumber(ageMonths),
        beyondRatePa: toNumber(beyondRate),
        blockId,
        halfFirstYear,
        conditionAdjustPercent: toNumber(condition),
      }),
    [price, ageMonths, beyondRate, blockId, halfFirstYear, condition],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Vehicle depreciation estimate",
      `Ex-showroom price: ${money(result.price)}`,
      `Age: ${NUM.format(result.ageYears)} years (${result.months} months) — ${result.slabLabel}`,
      `Depreciation applied: ${pct(result.tariffPercent)}`,
      `Value on the motor tariff schedule: ${money(result.tariffValue)}`,
      `After your condition adjustment: ${money(result.adjustedValue)}`,
      `Income tax written down value (${result.blockRate}% block, ${result.completedYears} years): ${money(result.wdvClosing)}`,
    ].join("\n");
  }, [ok, result]);

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "Vehicle depreciation result" });
  };

  const reset = () => {
    setPrice(DEFAULTS.price);
    setAgeMonths(DEFAULTS.ageMonths);
    setBeyondRate(DEFAULTS.beyondRate);
    setBlockId(DEFAULTS.blockId);
    setHalfFirstYear(DEFAULTS.halfFirstYear);
    setCondition(DEFAULTS.condition);
  };

  const highlightRow = ok
    ? result.yearRows.find((row) => row.tariffPercent >= result.tariffPercent - 1e-9)
    : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingDown className="h-4 w-4" aria-hidden="true" />
          Vehicle value
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Vehicle Depreciation Value Calculator India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two answers from the two schedules that are actually written down: the motor tariff
          depreciation table insurers use to fix value, and the income tax written down value your
          books have to carry.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vd-price">
              Ex-showroom / listed price when new (INR)
            </label>
            <input
              id="vd-price"
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
            <label className={LABEL_CLASS} htmlFor="vd-age">
              Age of the vehicle (months)
            </label>
            <input
              id="vd-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_AGE_MONTHS}
              step="1"
              value={ageMonths}
              onChange={(event) => setAgeMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vd-beyond">
              Further reduction after 5 years (% a year)
            </label>
            <input
              id="vd-beyond"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={beyondRate}
              onChange={(event) => setBeyondRate(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Above 5 years the tariff table stops and the value is mutually agreed
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vd-condition">
              Your condition adjustment (%)
            </label>
            <input
              id="vd-condition"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-50"
              max="50"
              step="1"
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Negative for high mileage or accident history, positive for a low-run example
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vd-block">
              Income tax depreciation block
            </label>
            <select
              id="vd-block"
              className={`mt-2 ${INPUT_CLASS}`}
              value={blockId}
              onChange={(event) => setBlockId(event.target.value)}
            >
              {INCOME_TAX_BLOCKS.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.label} — {block.rate}%
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label
              htmlFor="vd-half"
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"
            >
              <input
                id="vd-half"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={halfFirstYear}
                onChange={(event) => setHalfFirstYear(event.target.checked)}
              />
              Put to use for under {HALF_YEAR_DAYS} days in year one
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div role="status" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Value on the motor tariff schedule
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.tariffValue) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.slabLabel} · ${pct(result.tariffPercent)} depreciation applied`
                : "Correct the inputs above to value the vehicle."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("result") ? "Copied vehicle depreciation result to clipboard" : "Copy vehicle depreciation result"}
              className={GHOST_BTN}
              disabled={!ok}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        {ok && result.beyondFive ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Past 5 years the tariff table stops. This figure applies your chosen reduction for a
            further {NUM.format(result.extraYears)} years on top of the 50% the table ends at.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" role="status" aria-live="polite">
          {[
            ["Age", ok ? `${NUM.format(result.ageYears)} years (${result.months} months)` : DASH],
            ["Depreciation applied", ok ? pct(result.tariffPercent) : DASH],
            ["Value lost since new", ok ? money(result.depreciationAmount) : DASH],
            ["Average depreciation a year", ok ? pct(result.annualisedPercent) : DASH],
            ["After your condition adjustment", ok ? money(result.adjustedValue) : DASH],
            ["Income tax block", ok ? `${result.blockLabel} — ${result.blockRate}%` : DASH],
            ["Complete years of ownership", ok ? String(result.completedYears) : DASH],
            ["Written down value in the books", ok ? money(result.wdvClosing) : DASH],
            ["Depreciation claimed so far", ok ? money(result.wdvTotalDepreciation) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Value by age</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Age</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Depreciation</th>
                    <th scope="col" className="py-2 text-right font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearRows.map((row) => (
                    <tr
                      key={row.year}
                      className={`border-b border-[var(--border)] last:border-0 ${
                        row.year === highlightRow?.year ? "font-semibold text-[var(--primary)]" : ""
                      }`}
                    >
                      <td className="py-2 pr-3">{row.year === 0 ? "New" : `${row.year} year${row.year > 1 ? "s" : ""}`}</td>
                      <td className="py-2 pr-3 text-right">{pct(row.tariffPercent)}</td>
                      <td className="py-2 text-right">{money(row.tariffValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {result.wdvRows.length > 0 ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">
                Income tax written down value, year by year
              </h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[360px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Year</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Opening</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Rate</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Depreciation</th>
                      <th scope="col" className="py-2 text-right font-semibold">Closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.wdvRows.map((row) => (
                      <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{row.year}</td>
                        <td className="py-2 pr-3 text-right">{money(row.opening)}</td>
                        <td className="py-2 pr-3 text-right">{pct(row.ratePercent)}</td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                          {money(row.depreciation)}
                        </td>
                        <td className="py-2 text-right font-semibold">{money(row.closing)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The motor tariff depreciation table</h2>
        <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
          {TARIFF_SLABS.map((slab) => (
            <li key={slab.label} className="flex items-center justify-between gap-4 py-2">
              <span className="text-[var(--muted-foreground)]">{slab.label}</span>
              <span className="font-semibold">{slab.percent}%</span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-4 py-2">
            <span className="text-[var(--muted-foreground)]">Over 5 years</span>
            <span className="font-semibold">Mutually agreed</span>
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate, not a valuation or tax advice. The tariff schedule fixes insured
        value, not the price a buyer will pay — real resale depends on model demand, kilometres,
        service history and accident record. Confirm the depreciation block and rate with your
        chartered accountant before claiming it.
      </p>
    </main>
  );
}
