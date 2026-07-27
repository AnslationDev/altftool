"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smartphone } from "lucide-react";

import {
  ADJUSTMENTS,
  CONDITION_GRADES,
  DEFAULT_FIRST_YEAR_DROP,
  DEFAULT_LATER_YEAR_DROP,
  DEFAULT_SCRAP_VALUE,
  DEMAND_TIERS,
  STORAGE_TIERS,
  estimateSmartphoneResale,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  launchPrice: "79900",
  ageMonths: "18",
  conditionId: "good",
  storageId: "256",
  demandId: "very-high",
  adjustmentIds: ["box", "bill"],
  firstYearDropPct: String(DEFAULT_FIRST_YEAR_DROP),
  laterYearDropPct: String(DEFAULT_LATER_YEAR_DROP),
  scrapValue: String(DEFAULT_SCRAP_VALUE),
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [launchPrice, setLaunchPrice] = useState(DEFAULTS.launchPrice);
  const [ageMonths, setAgeMonths] = useState(DEFAULTS.ageMonths);
  const [conditionId, setConditionId] = useState(DEFAULTS.conditionId);
  const [storageId, setStorageId] = useState(DEFAULTS.storageId);
  const [demandId, setDemandId] = useState(DEFAULTS.demandId);
  const [adjustmentIds, setAdjustmentIds] = useState(DEFAULTS.adjustmentIds);
  const [firstYearDropPct, setFirstYearDropPct] = useState(DEFAULTS.firstYearDropPct);
  const [laterYearDropPct, setLaterYearDropPct] = useState(DEFAULTS.laterYearDropPct);
  const [scrapValue, setScrapValue] = useState(DEFAULTS.scrapValue);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateSmartphoneResale({
        launchPrice: toNumber(launchPrice),
        ageMonths: toNumber(ageMonths),
        conditionId,
        storageId,
        demandId,
        adjustmentIds,
        firstYearDropPct: toNumber(firstYearDropPct),
        laterYearDropPct: toNumber(laterYearDropPct),
        scrapValue: toNumber(scrapValue),
      }),
    [
      launchPrice,
      ageMonths,
      conditionId,
      storageId,
      demandId,
      adjustmentIds,
      firstYearDropPct,
      laterYearDropPct,
      scrapValue,
    ],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const conditionHint = CONDITION_GRADES.find((item) => item.id === conditionId)?.hint ?? "";

  const toggleAdjustment = (id) => {
    setAdjustmentIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Smartphone Resale Value Estimator",
      `Launch price: ${money(result.launchPrice)} · age ${result.ageMonths} months`,
      `Condition: ${result.condition} (×${result.conditionFactor})`,
      `Storage: ${result.storage} (×${result.storageFactor}) · demand ${result.demand} (×${result.demandFactor})`,
      `Value retained by age alone: ${pct(result.retentionPct)}`,
      `Adjustments: ${pct(result.adjustmentPct)}`,
      `Estimated market value: ${money(result.value)} (${pct(result.retainedPct)} of launch price)`,
      `Instant trade-in quote: about ${money(result.instantQuote)}`,
      `Patient private sale: about ${money(result.patientSale)}`,
      `Value lost so far: ${money(result.valueLost)} — ${money(result.lossPerMonth)} a month`,
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
    setLaunchPrice(DEFAULTS.launchPrice);
    setAgeMonths(DEFAULTS.ageMonths);
    setConditionId(DEFAULTS.conditionId);
    setStorageId(DEFAULTS.storageId);
    setDemandId(DEFAULTS.demandId);
    setAdjustmentIds(DEFAULTS.adjustmentIds);
    setFirstYearDropPct(DEFAULTS.firstYearDropPct);
    setLaterYearDropPct(DEFAULTS.laterYearDropPct);
    setScrapValue(DEFAULTS.scrapValue);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Resale &amp; depreciation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Smartphone Resale Value Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          What your phone is worth now, from its launch price stepped down by age, cosmetic grade,
          storage variant and resale demand — with the spread between an instant trade-in quote and a
          patient private sale.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The phone</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-price">
              Launch price of your variant (INR)
            </label>
            <input
              id="sr-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1000"
              value={launchPrice}
              onChange={(event) => setLaunchPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-age">
              Age (months since you bought it)
            </label>
            <input
              id="sr-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="240"
              step="1"
              value={ageMonths}
              onChange={(event) => setAgeMonths(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sr-condition">
              Condition
            </label>
            <select
              id="sr-condition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={conditionId}
              onChange={(event) => setConditionId(event.target.value)}
            >
              {CONDITION_GRADES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (×{item.factor})
                </option>
              ))}
            </select>
            {conditionHint && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{conditionHint}</p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-storage">
              Storage variant
            </label>
            <select
              id="sr-storage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={storageId}
              onChange={(event) => setStorageId(event.target.value)}
            >
              {STORAGE_TIERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-demand">
              Resale demand for the brand
            </label>
            <select
              id="sr-demand"
              className={`mt-2 ${INPUT_CLASS}`}
              value={demandId}
              onChange={(event) => setDemandId(event.target.value)}
            >
              {DEMAND_TIERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">What else is true of it</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ADJUSTMENTS.map((item) => (
              <label
                key={item.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                htmlFor={`sr-adj-${item.id}`}
              >
                <input
                  id={`sr-adj-${item.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={adjustmentIds.includes(item.id)}
                  onChange={() => toggleAdjustment(item.id)}
                />
                <span className="flex-1">{item.label}</span>
                <span
                  className={`font-semibold ${item.pct >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                >
                  {item.pct > 0 ? "+" : ""}
                  {item.pct}%
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Depreciation assumptions</h2>
          <button
            type="button"
            onClick={() => setShowAssumptions((value) => !value)}
            aria-expanded={showAssumptions}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {showAssumptions ? "Hide" : "Change"}
          </button>
        </div>
        {showAssumptions && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="sr-drop1">
                First-year drop (% of value)
              </label>
              <input
                id="sr-drop1"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="99"
                step="1"
                value={firstYearDropPct}
                onChange={(event) => setFirstYearDropPct(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sr-drop2">
                Each later year (% of what is left)
              </label>
              <input
                id="sr-drop2"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="99"
                step="1"
                value={laterYearDropPct}
                onChange={(event) => setLaterYearDropPct(event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="sr-scrap">
                Recycler&apos;s scrap price (INR)
              </label>
              <input
                id="sr-scrap"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="50"
                value={scrapValue}
                onChange={(event) => setScrapValue(event.target.value)}
              />
            </div>
          </div>
        )}
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
              Estimated value today
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : money(result.value)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${pct(result.retainedPct)} of the ${money(result.launchPrice)} you paid at launch`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the resale value estimate"
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-4">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Instant trade-in
            </p>
            <p className="mt-1 text-2xl font-semibold">{hasError ? dash : money(result.instantQuote)}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Buyback site or exchange offer, paid the same day
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-4">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Patient private sale
            </p>
            <p className="mt-1 text-2xl font-semibold">{hasError ? dash : money(result.patientSale)}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Listed yourself, if you can wait for the right buyer
            </p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Value retained by age alone", hasError ? dash : pct(result.retentionPct)],
            ["Condition factor", hasError ? dash : `${result.condition} (×${result.conditionFactor})`],
            ["Storage factor", hasError ? dash : `${result.storage} (×${result.storageFactor})`],
            ["Demand factor", hasError ? dash : `×${result.demandFactor}`],
            ["Adjustments applied", hasError ? dash : pct(result.adjustmentPct)],
            ["Value lost since launch", hasError ? dash : money(result.valueLost)],
            ["Losing per month", hasError ? dash : money(result.lossPerMonth)],
            ["Losing per day", hasError ? dash : money(result.lossPerDay)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.atFloor && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The model puts this handset below scrap value, so the figure shown is the{" "}
            {money(result.scrapValue)} an organised e-waste recycler would pay. Do not throw it in the
            bin — batteries need proper disposal.
          </p>
        )}
        {!hasError && result.adjustmentClamped && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The adjustments you ticked add up past the model&apos;s limits, so they have been capped at{" "}
            {pct(result.adjustmentPct)}.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A transparent model, not a quote. Used-phone prices have no published schedule; every factor
        here is a stated assumption you can overwrite with numbers from a real offer. Actual buyback
        prices swing with new launches, festival exchange bonuses and local demand — get two or three
        quotes before you sell, and wipe the device and remove the account lock first.
      </p>
    </main>
  );
}
