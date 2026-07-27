"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sofa } from "lucide-react";

import {
  ANTIQUE_AGE_YEARS,
  CONDITIONS,
  MATERIALS,
  MAX_AGE_MONTHS,
  estimateFurnitureValue,
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
  price: "60000",
  ageMonths: "120",
  materialKey: "teak",
  condition: "good",
  restoration: "0",
  buyerCost: "0",
  isModular: false,
  isCompleteSet: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium";
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
  const [materialKey, setMaterialKey] = useState(DEFAULTS.materialKey);
  const [condition, setCondition] = useState(DEFAULTS.condition);
  const [restoration, setRestoration] = useState(DEFAULTS.restoration);
  const [buyerCost, setBuyerCost] = useState(DEFAULTS.buyerCost);
  const [isModular, setIsModular] = useState(DEFAULTS.isModular);
  const [isCompleteSet, setIsCompleteSet] = useState(DEFAULTS.isCompleteSet);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateFurnitureValue({
        purchasePrice: toNumber(price),
        ageMonths: toNumber(ageMonths),
        materialKey,
        condition,
        isModular,
        isCompleteSet,
        restorationCost: toNumber(restoration),
        buyerBorneCost: toNumber(buyerCost),
      }),
    [price, ageMonths, materialKey, condition, isModular, isCompleteSet, restoration, buyerCost],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Furniture Resale Value Estimate",
      `${result.materialLabel}, bought for ${money(result.purchasePrice)}, now ${NUM.format(result.ageYears)} years old`,
      `Estimated private-sale value: ${money(result.estimatedValue)}`,
      `Realistic asking range: ${money(result.rangeLow)} to ${money(result.rangeHigh)}`,
      `Second-hand dealer offer to expect: ${money(result.dealerValue)}`,
      `Value retained: ${pct(result.retainedPct)}`,
      `Usable life: ${result.usableLifeYears} years, about ${NUM.format(result.remainingLifeYears)} left`,
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
    setMaterialKey(DEFAULTS.materialKey);
    setCondition(DEFAULTS.condition);
    setRestoration(DEFAULTS.restoration);
    setBuyerCost(DEFAULTS.buyerCost);
    setIsModular(DEFAULTS.isModular);
    setIsCompleteSet(DEFAULTS.isCompleteSet);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sofa className="h-4 w-4" aria-hidden="true" />
          Furniture resale
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Furniture Resale Value Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price a used wardrobe, bed, dining set or sofa. Solid hardwood keeps most of its value for
          decades; particle board and built-in modular units do not, and this estimator prices that
          difference explicitly.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="furn-material">
              Material
            </label>
            <select
              id="furn-material"
              className={`mt-2 ${INPUT_CLASS}`}
              value={materialKey}
              onChange={(event) => setMaterialKey(event.target.value)}
            >
              {MATERIALS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="furn-price">
              Original purchase price (INR)
            </label>
            <input
              id="furn-price"
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
            <label className={LABEL_CLASS} htmlFor="furn-age">
              Age (months, 0-{MAX_AGE_MONTHS})
            </label>
            <input
              id="furn-age"
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
            <label className={LABEL_CLASS} htmlFor="furn-condition">
              Condition
            </label>
            <select
              id="furn-condition"
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
            <label className={LABEL_CLASS} htmlFor="furn-restore">
              Polishing / reupholstery cost (INR)
            </label>
            <input
              id="furn-restore"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="250"
              value={restoration}
              onChange={(event) => setRestoration(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="furn-buyer">
              Dismantling and transport the buyer pays (INR)
            </label>
            <input
              id="furn-buyer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="250"
              value={buyerCost}
              onChange={(event) => setBuyerCost(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={CHECK_CLASS} htmlFor="furn-modular">
            <input
              id="furn-modular"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={isModular}
              onChange={(event) => setIsModular(event.target.checked)}
            />
            Modular or built into the wall
          </label>
          <label className={CHECK_CLASS} htmlFor="furn-set">
            <input
              id="furn-set"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={isCompleteSet}
              onChange={(event) => setIsCompleteSet(event.target.checked)}
            />
            Complete set with all matching pieces
          </label>
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
              aria-label="Copy furniture resale estimate"
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
              "Usable life for this material",
              hasError
                ? DASH
                : `${result.usableLifeYears} years (${NUM.format(result.remainingLifeYears)} left)`,
            ],
            ["Value retained", hasError ? DASH : pct(result.retainedPct)],
            ["Total depreciation", hasError ? DASH : money(result.totalDepreciation)],
            ["Effective depreciation per year", hasError ? DASH : pct(result.annualDepreciationPct)],
            ["Restoration and moving deducted", hasError ? DASH : money(result.deductions)],
            ["Reclaimed-material floor", hasError ? DASH : money(result.scrapFloor)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.antiqueTerritory ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Solid wood older than {ANTIQUE_AGE_YEARS} years is often worth more as an antique than a
            depreciation model suggests. Get a dealer or auction house to look at it before selling
            on price alone.
          </p>
        ) : null}
        {!hasError && result.atFloor ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            After deductions the piece is worth no more than its reclaimed material, so the estimate
            is held at that floor.
          </p>
        ) : null}
        {!hasError && result.pastUsableLife ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            This piece is past the usable life typical for its material, so expect buyers to price it
            for the timber or the frame rather than the furniture.
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
        Informational estimate of the second-hand market, not an offer or a valuation. Brand, design,
        size relative to the buyer&apos;s room and local demand can move real prices a long way in
        either direction.
      </p>
    </main>
  );
}
