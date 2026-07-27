"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Laptop, RotateCcw } from "lucide-react";

import { CONDITIONS, MAX_AGE_MONTHS, estimateLaptopValue } from "../lib";

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
  price: "80000",
  ageMonths: "24",
  condition: "good",
  battery: "85",
  warranty: "0",
  repair: "0",
  hasCharger: true,
  hasInvoice: true,
  receivesUpdates: true,
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
  const [condition, setCondition] = useState(DEFAULTS.condition);
  const [battery, setBattery] = useState(DEFAULTS.battery);
  const [warranty, setWarranty] = useState(DEFAULTS.warranty);
  const [repair, setRepair] = useState(DEFAULTS.repair);
  const [hasCharger, setHasCharger] = useState(DEFAULTS.hasCharger);
  const [hasInvoice, setHasInvoice] = useState(DEFAULTS.hasInvoice);
  const [receivesUpdates, setReceivesUpdates] = useState(DEFAULTS.receivesUpdates);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateLaptopValue({
        purchasePrice: toNumber(price),
        ageMonths: toNumber(ageMonths),
        condition,
        batteryHealthPct: toNumber(battery),
        hasCharger,
        hasInvoice,
        warrantyMonthsLeft: toNumber(warranty),
        receivesUpdates,
        repairCost: toNumber(repair),
      }),
    [price, ageMonths, condition, battery, warranty, repair, hasCharger, hasInvoice, receivesUpdates],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Laptop Resale Value Estimate",
      `Bought for ${money(result.purchasePrice)}, now ${NUM.format(result.ageYears)} years old`,
      `Estimated private-sale value: ${money(result.estimatedValue)}`,
      `Realistic asking range: ${money(result.rangeLow)} to ${money(result.rangeHigh)}`,
      `Typical trade-in / buy-back offer: ${money(result.tradeInValue)}`,
      `Value retained: ${pct(result.retainedPct)}`,
      `Total depreciation: ${money(result.totalDepreciation)}`,
      `Effective depreciation: ${pct(result.annualDepreciationPct)} a year`,
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
    setCondition(DEFAULTS.condition);
    setBattery(DEFAULTS.battery);
    setWarranty(DEFAULTS.warranty);
    setRepair(DEFAULTS.repair);
    setHasCharger(DEFAULTS.hasCharger);
    setHasInvoice(DEFAULTS.hasInvoice);
    setReceivesUpdates(DEFAULTS.receivesUpdates);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Laptop className="h-4 w-4" aria-hidden="true" />
          Resale value
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Laptop Resale Value Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out what a used laptop is realistically worth today using declining-balance
          depreciation, then adjust for condition, battery health, accessories and warranty.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="laptop-price">
              Original purchase price (INR)
            </label>
            <input
              id="laptop-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1000"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="laptop-age">
              Age (months, 0-{MAX_AGE_MONTHS})
            </label>
            <input
              id="laptop-age"
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
            <label className={LABEL_CLASS} htmlFor="laptop-condition">
              Condition
            </label>
            <select
              id="laptop-condition"
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
            <label className={LABEL_CLASS} htmlFor="laptop-battery">
              Battery health (%)
            </label>
            <input
              id="laptop-battery"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="1"
              value={battery}
              onChange={(event) => setBattery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="laptop-warranty">
              Transferable warranty left (months)
            </label>
            <input
              id="laptop-warranty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={warranty}
              onChange={(event) => setWarranty(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="laptop-repair">
              Known repair cost to deduct (INR)
            </label>
            <input
              id="laptop-repair"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={repair}
              onChange={(event) => setRepair(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={CHECK_CLASS} htmlFor="laptop-charger">
            <input
              id="laptop-charger"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={hasCharger}
              onChange={(event) => setHasCharger(event.target.checked)}
            />
            Original charger included
          </label>
          <label className={CHECK_CLASS} htmlFor="laptop-invoice">
            <input
              id="laptop-invoice"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={hasInvoice}
              onChange={(event) => setHasInvoice(event.target.checked)}
            />
            Original invoice and box available
          </label>
          <label className={`${CHECK_CLASS} sm:col-span-2`} htmlFor="laptop-updates">
            <input
              id="laptop-updates"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={receivesUpdates}
              onChange={(event) => setReceivesUpdates(event.target.checked)}
            />
            Still receives operating-system and security updates
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
              aria-label="Copy laptop resale estimate"
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
            ["Trade-in / buy-back offer to expect", hasError ? DASH : money(result.tradeInValue)],
            ["Original purchase price", hasError ? DASH : money(result.purchasePrice)],
            ["Age", hasError ? DASH : `${NUM.format(result.ageYears)} years`],
            ["Value retained", hasError ? DASH : pct(result.retainedPct)],
            ["Total depreciation", hasError ? DASH : money(result.totalDepreciation)],
            ["Effective depreciation per year", hasError ? DASH : pct(result.annualDepreciationPct)],
            ["Repair cost deducted", hasError ? DASH : money(result.repairCost)],
            ["Spares-only floor", hasError ? DASH : money(result.scrapFloor)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.atFloor ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The adjustments push this machine below its spares-only value, so the estimate is held at
            the parts floor. Selling the RAM, SSD and screen separately may fetch more than the whole
            unit.
          </p>
        ) : null}
        {!hasError && result.atCeiling ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            A nearly new machine with full paperwork still cannot resell above what it cost, so the
            estimate is capped at the purchase price.
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
        This is an informational estimate of the used market, not an offer or a valuation.
        Model-specific demand, storage and RAM configuration, GPU and regional supply move real
        prices a long way in both directions.
      </p>
    </main>
  );
}
