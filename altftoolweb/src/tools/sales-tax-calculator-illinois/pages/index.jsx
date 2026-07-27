"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw } from "lucide-react";

import {
  IL_LOCATION_PRESETS,
  IL_LOW_RATE_PERCENT,
  computeIllinoisSalesTax,
  localPartOfCombined,
} from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const PCT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  location: "Chicago",
  localRate: String(localPartOfCombined(10.25)),
  generalAmount: "1000",
  lowRateAmount: "0",
  lowRatePercent: String(IL_LOW_RATE_PERCENT),
  exemptAmount: "0",
  shippingAmount: "0",
  shippingTaxable: true,
  priceIncludesTax: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").replace(/\$/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [location, setLocation] = useState(DEFAULTS.location);
  const [localRate, setLocalRate] = useState(DEFAULTS.localRate);
  const [generalAmount, setGeneralAmount] = useState(DEFAULTS.generalAmount);
  const [lowRateAmount, setLowRateAmount] = useState(DEFAULTS.lowRateAmount);
  const [lowRatePercent, setLowRatePercent] = useState(DEFAULTS.lowRatePercent);
  const [exemptAmount, setExemptAmount] = useState(DEFAULTS.exemptAmount);
  const [shippingAmount, setShippingAmount] = useState(DEFAULTS.shippingAmount);
  const [shippingTaxable, setShippingTaxable] = useState(DEFAULTS.shippingTaxable);
  const [priceIncludesTax, setPriceIncludesTax] = useState(DEFAULTS.priceIncludesTax);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeIllinoisSalesTax({
        generalAmount: toNumber(generalAmount),
        lowRateAmount: toNumber(lowRateAmount),
        lowRatePercent: toNumber(lowRatePercent),
        localRatePercent: toNumber(localRate),
        exemptAmount: toNumber(exemptAmount),
        shippingAmount: toNumber(shippingAmount),
        shippingTaxable,
        priceIncludesTax,
      }),
    [
      generalAmount,
      lowRateAmount,
      lowRatePercent,
      localRate,
      exemptAmount,
      shippingAmount,
      shippingTaxable,
      priceIncludesTax,
    ],
  );

  const hasError = Boolean(result.error);

  const applyPreset = (name) => {
    setLocation(name);
    const preset = IL_LOCATION_PRESETS.find((item) => item.name === name);
    if (preset) setLocalRate(String(localPartOfCombined(preset.combinedPercent)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "US Sales Tax Calculator Illinois",
      `Location: ${location}`,
      `General merchandise rate: ${pct(result.combinedRatePercent)} (6.25% state + ${pct(result.localRatePercent)} local)`,
      `General merchandise base: ${money(result.generalBase)}`,
      result.lowRateBase > 0
        ? `Low-rate items: ${money(result.lowRateBase)} at ${pct(result.lowRatePercent)}`
        : null,
      `State-rate tax (6.25%): ${money(result.stateRateTax)}`,
      `Local tax: ${money(result.localTax)}`,
      result.lowRateTax > 0 ? `Low-rate tax: ${money(result.lowRateTax)}` : null,
      `Total sales tax: ${money(result.totalTax)}`,
      `Total due: ${money(result.grandTotal)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, location, result]);

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
    setLocation(DEFAULTS.location);
    setLocalRate(DEFAULTS.localRate);
    setGeneralAmount(DEFAULTS.generalAmount);
    setLowRateAmount(DEFAULTS.lowRateAmount);
    setLowRatePercent(DEFAULTS.lowRatePercent);
    setExemptAmount(DEFAULTS.exemptAmount);
    setShippingAmount(DEFAULTS.shippingAmount);
    setShippingTaxable(DEFAULTS.shippingTaxable);
    setPriceIncludesTax(DEFAULTS.priceIncludesTax);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          Illinois
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          US Sales Tax Calculator Illinois
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Combine the 6.25% Illinois general merchandise rate with your local tax, and price
          qualifying drugs, medical appliances and food at the reduced rate on the same receipt.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="il-location">
              Location
            </label>
            <select
              id="il-location"
              className={`mt-2 ${INPUT_CLASS}`}
              value={location}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {IL_LOCATION_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name} — {preset.combinedPercent}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="il-local">
              Local rate (% on top of 6.25%)
            </label>
            <input
              id="il-local"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="6"
              step="0.25"
              value={localRate}
              onChange={(event) => setLocalRate(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Home rule municipal, county, RTA and business district taxes combined.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="il-general">
              General merchandise (USD)
            </label>
            <input
              id="il-general"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={generalAmount}
              onChange={(event) => setGeneralAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="il-shipping">
              Delivery charge (USD)
            </label>
            <input
              id="il-shipping"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={shippingAmount}
              onChange={(event) => setShippingAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="il-low-amount">
              Food, drugs and medical appliances (USD)
            </label>
            <input
              id="il-low-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={lowRateAmount}
              onChange={(event) => setLowRateAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="il-low-rate">
              Rate on those items (%)
            </label>
            <input
              id="il-low-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="6.25"
              step="0.25"
              value={lowRatePercent}
              onChange={(event) => setLowRatePercent(event.target.value)}
            />
            <p className={HINT_CLASS}>
              1% is the classic Illinois low rate. Since the state grocery tax was repealed on 1
              January 2026, the rate on food depends on whether your municipality imposes its own
              1% grocery tax.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="il-exempt">
              Fully exempt items (USD)
            </label>
            <input
              id="il-exempt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={exemptAmount}
              onChange={(event) => setExemptAmount(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label className={CHECK_ROW} htmlFor="il-ship-taxable">
            <input
              id="il-ship-taxable"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={shippingTaxable}
              onChange={(event) => setShippingTaxable(event.target.checked)}
            />
            <span>
              The delivery charge is taxable
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                86 Ill. Adm. Code 130.415 — untick when delivery was separately contracted for and
                the buyer could have collected the goods instead.
              </span>
            </span>
          </label>
          <label className={CHECK_ROW} htmlFor="il-inclusive">
            <input
              id="il-inclusive"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={priceIncludesTax}
              onChange={(event) => setPriceIncludesTax(event.target.checked)}
            />
            <span>The figures above already include sales tax</span>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Total sales tax
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${pct(result.combinedRatePercent)} on general merchandise`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy Illinois sales tax result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {[
            ["General merchandise base", hasError ? DASH : money(result.generalBase)],
            ["Low-rate items base", hasError ? DASH : money(result.lowRateBase)],
            ["State share of the 6.25% (5.00%)", hasError ? DASH : money(result.stateShareTax)],
            ["Municipal share (1.00%)", hasError ? DASH : money(result.municipalShareTax)],
            ["County share (0.25%)", hasError ? DASH : money(result.countyShareTax)],
            [
              `Local tax (${hasError ? DASH : pct(result.localRatePercent)})`,
              hasError ? DASH : money(result.localTax),
            ],
            [
              `Low-rate tax (${hasError ? DASH : pct(result.lowRatePercent)})`,
              hasError ? DASH : money(result.lowRateTax),
            ],
            ["Exempt / non-taxable amount", hasError ? DASH : money(result.nonTaxableTotal)],
            ["Subtotal before tax", hasError ? DASH : money(result.preTaxTotal)],
            ["Total due", hasError ? DASH : money(result.grandTotal)],
            ["Effective rate on the whole receipt", hasError ? DASH : pct(result.effectiveRatePercent)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Illinois local rates change on 1 January and 1 July —
        verify an address with the MyTax Illinois Tax Rate Finder before charging or filing.
      </p>
    </main>
  );
}
