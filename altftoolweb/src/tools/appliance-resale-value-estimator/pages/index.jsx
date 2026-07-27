"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Refrigerator, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  CATEGORY_MAP,
  CONDITIONS,
  MAX_AGE_MONTHS,
  STAR_RATINGS,
  estimateApplianceValue,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);

const DEFAULTS = {
  price: "35000",
  ageMonths: "48",
  categoryKey: "refrigerator",
  condition: "good",
  starRating: "4",
  warranty: "6",
  buyerCost: "0",
  repair: "0",
  usesR22: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [ageMonths, setAgeMonths] = useState(DEFAULTS.ageMonths);
  const [categoryKey, setCategoryKey] = useState(DEFAULTS.categoryKey);
  const [condition, setCondition] = useState(DEFAULTS.condition);
  const [starRating, setStarRating] = useState(DEFAULTS.starRating);
  const [warranty, setWarranty] = useState(DEFAULTS.warranty);
  const [buyerCost, setBuyerCost] = useState(DEFAULTS.buyerCost);
  const [repair, setRepair] = useState(DEFAULTS.repair);
  const [usesR22, setUsesR22] = useState(DEFAULTS.usesR22);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateApplianceValue({
        purchasePrice: toNumber(price),
        ageMonths: toNumber(ageMonths),
        categoryKey,
        condition,
        starRating,
        warrantyYearsLeft: toNumber(warranty),
        usesR22,
        buyerBorneCost: toNumber(buyerCost),
        repairCost: toNumber(repair),
      }),
    [price, ageMonths, categoryKey, condition, starRating, warranty, usesR22, buyerCost, repair],
  );

  const hasError = Boolean(result.error);
  const isAc = Boolean(CATEGORY_MAP[categoryKey]?.isAc);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Appliance Resale Value Estimate",
      `${result.categoryLabel}, bought for ${money(result.purchasePrice)}, now ${NUM.format(result.ageYears)} years old`,
      `Estimated private-sale value: ${money(result.estimatedValue)}`,
      `Realistic asking range: ${money(result.rangeLow)} to ${money(result.rangeHigh)}`,
      `Second-hand dealer offer to expect: ${money(result.dealerValue)}`,
      `Value retained: ${pct(result.retainedPct)}`,
      `Rated service life: ${result.ratedLifeYears} years, about ${NUM.format(result.remainingLifeYears)} left`,
      `Total depreciation: ${money(result.totalDepreciation)}`,
    ].join("\n");
  }, [hasError, result]);

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
    setAgeMonths(DEFAULTS.ageMonths);
    setCategoryKey(DEFAULTS.categoryKey);
    setCondition(DEFAULTS.condition);
    setStarRating(DEFAULTS.starRating);
    setWarranty(DEFAULTS.warranty);
    setBuyerCost(DEFAULTS.buyerCost);
    setRepair(DEFAULTS.repair);
    setUsesR22(DEFAULTS.usesR22);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Refrigerator className="h-4 w-4" aria-hidden="true" />
          Appliance resale
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Appliance Resale Value Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price a used refrigerator, air conditioner or washing machine using a per-category
          depreciation curve, its BEE star rating, remaining warranty and how close it is to the end
          of its rated service life.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="app-category">
              Appliance
            </label>
            <select
              id="app-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={categoryKey}
              onChange={(event) => setCategoryKey(event.target.value)}
            >
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="app-price">
              Original purchase price (INR)
            </label>
            <input
              id="app-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="500"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="app-age">
              Age (months, 0-{MAX_AGE_MONTHS})
            </label>
            <input
              id="app-age"
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
            <label className={LABEL_CLASS} htmlFor="app-condition">
              Condition
            </label>
            <select
              id="app-condition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            >
              {CONDITIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="app-star">
              BEE star rating
            </label>
            <select
              id="app-star"
              className={`mt-2 ${INPUT_CLASS}`}
              value={starRating}
              onChange={(event) => setStarRating(event.target.value)}
            >
              {STAR_RATINGS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="app-warranty">
              Compressor / motor warranty left (years)
            </label>
            <input
              id="app-warranty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="12"
              step="1"
              value={warranty}
              onChange={(event) => setWarranty(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="app-buyer">
              Removal, transport and install the buyer pays (INR)
            </label>
            <input
              id="app-buyer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="250"
              value={buyerCost}
              onChange={(event) => setBuyerCost(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="app-repair">
              Known repair cost to deduct (INR)
            </label>
            <input
              id="app-repair"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="250"
              value={repair}
              onChange={(event) => setRepair(event.target.value)}
            />
          </div>
        </div>

        {isAc ? (
          <label
            className="mt-4 flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
            htmlFor="app-r22"
          >
            <input
              id="app-r22"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={usesR22}
              onChange={(event) => setUsesR22(event.target.checked)}
            />
            Uses R-22 refrigerant (older units, being phased out)
          </label>
        ) : null}
      </section>

      {hasError ? (
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
              Estimated private-sale value
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.estimatedValue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `Ask between ${money(result.rangeLow)} and ${money(result.rangeHigh)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy appliance resale estimate"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["Second-hand dealer offer to expect", hasError ? DASH : money(result.dealerValue)],
            ["Original purchase price", hasError ? DASH : money(result.purchasePrice)],
            ["Age", hasError ? DASH : `${NUM.format(result.ageYears)} years`],
            [
              "Rated service life",
              hasError
                ? DASH
                : `${result.ratedLifeYears} years (${NUM.format(result.remainingLifeYears)} left)`,
            ],
            ["Value retained", hasError ? DASH : pct(result.retainedPct)],
            ["Total depreciation", hasError ? DASH : money(result.totalDepreciation)],
            ["Effective depreciation per year", hasError ? DASH : pct(result.annualDepreciationPct)],
            ["Repair and moving costs deducted", hasError ? DASH : money(result.deductions)],
            ["Scrap-value floor", hasError ? DASH : money(result.scrapFloor)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.atFloor ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            After deductions the appliance is worth no more than its scrap value, so the estimate is
            held at the floor. A registered e-waste or scrap buyer may be the practical option.
          </p>
        ) : null}
        {!hasError && result.pastRatedLife ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            This unit is past its rated service life, so buyers will discount heavily for the risk of
            a compressor or motor failure.
          </p>
        ) : null}
        {!hasError && result.atCeiling ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            A nearly new unit still cannot resell above what it cost, so the estimate is capped at
            the purchase price.
          </p>
        ) : null}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What each factor did to the price</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Factor
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Multiplier applied
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.factors.map(([label, value]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{label}</td>
                    <td className="py-2 text-right font-semibold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate of the used market, not an offer or a valuation. Local demand, brand,
        capacity and whether the unit can be demonstrated working at the time of sale move real
        prices considerably.
      </p>
    </main>
  );
}
