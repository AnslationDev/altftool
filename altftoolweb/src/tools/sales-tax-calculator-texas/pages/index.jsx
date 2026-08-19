"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw } from "lucide-react";

import {
  TX_LOCAL_RATE_CAP_PERCENT,
  TX_LOCATION_PRESETS,
  TX_MAX_COMBINED_PERCENT,
  TX_SINGLE_LOCAL_USE_TAX_RATE_PERCENT,
  computeTexasMotorVehicleTax,
  computeTexasSalesTax,
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
  location: "Houston",
  localRate: String(localPartOfCombined(8.25)),
  taxableAmount: "1000",
  exemptAmount: "0",
  shippingAmount: "0",
  shippingTaxable: true,
  priceIncludesTax: false,
  vehiclePrice: "30000",
  tradeIn: "10000",
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
  const [taxableAmount, setTaxableAmount] = useState(DEFAULTS.taxableAmount);
  const [exemptAmount, setExemptAmount] = useState(DEFAULTS.exemptAmount);
  const [shippingAmount, setShippingAmount] = useState(DEFAULTS.shippingAmount);
  const [shippingTaxable, setShippingTaxable] = useState(DEFAULTS.shippingTaxable);
  const [priceIncludesTax, setPriceIncludesTax] = useState(DEFAULTS.priceIncludesTax);
  const [vehiclePrice, setVehiclePrice] = useState(DEFAULTS.vehiclePrice);
  const [tradeIn, setTradeIn] = useState(DEFAULTS.tradeIn);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTexasSalesTax({
        taxableAmount: toNumber(taxableAmount),
        exemptAmount: toNumber(exemptAmount),
        localRatePercent: toNumber(localRate),
        shippingAmount: toNumber(shippingAmount),
        shippingTaxable,
        priceIncludesTax,
      }),
    [taxableAmount, exemptAmount, localRate, shippingAmount, shippingTaxable, priceIncludesTax],
  );

  const vehicle = useMemo(
    () =>
      computeTexasMotorVehicleTax({
        salesPrice: toNumber(vehiclePrice),
        tradeInAmount: toNumber(tradeIn),
      }),
    [vehiclePrice, tradeIn],
  );

  const hasError = Boolean(result.error);

  const applyPreset = (name) => {
    setLocation(name);
    const preset = TX_LOCATION_PRESETS.find((item) => item.name === name);
    if (!preset) return;
    if (name.startsWith("Remote seller")) {
      setLocalRate(String(TX_SINGLE_LOCAL_USE_TAX_RATE_PERCENT));
      return;
    }
    setLocalRate(String(localPartOfCombined(preset.combinedPercent)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "US Sales Tax Calculator Texas",
      `Location: ${location}`,
      `Combined rate: ${pct(result.combinedRatePercent)} (state 6.25% + local ${pct(result.localRatePercent)})`,
      `Taxable amount: ${money(result.taxableBase)}`,
      `Non-taxable amount: ${money(result.nonTaxableTotal)}`,
      `State tax: ${money(result.stateTax)}`,
      `Local tax: ${money(result.localTax)}`,
      `Total sales tax: ${money(result.totalTax)}`,
      `Total due: ${money(result.grandTotal)}`,
    ].join("\n");
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
    setTaxableAmount(DEFAULTS.taxableAmount);
    setExemptAmount(DEFAULTS.exemptAmount);
    setShippingAmount(DEFAULTS.shippingAmount);
    setShippingTaxable(DEFAULTS.shippingTaxable);
    setPriceIncludesTax(DEFAULTS.priceIncludesTax);
    setVehiclePrice(DEFAULTS.vehiclePrice);
    setTradeIn(DEFAULTS.tradeIn);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          Texas
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          US Sales Tax Calculator Texas
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Combine the 6.25% Texas state rate with the local rate at your location, which is capped
          at {TX_LOCAL_RATE_CAP_PERCENT}% so no address ever exceeds {TX_MAX_COMBINED_PERCENT}%.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tx-location">
              Location
            </label>
            <select
              id="tx-location"
              className={`mt-2 ${INPUT_CLASS}`}
              value={location}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {TX_LOCATION_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name} — {preset.combinedPercent}%
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Texas sellers source the local tax to their place of business; remote sellers may
              elect the single local use tax rate.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tx-local">
              Local rate (% on top of 6.25%)
            </label>
            <input
              id="tx-local"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="2"
              step="0.125"
              value={localRate}
              onChange={(event) => setLocalRate(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Cities, counties, transit authorities and special districts combined, up to 2%.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tx-taxable">
              Taxable goods and services (USD)
            </label>
            <input
              id="tx-taxable"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={taxableAmount}
              onChange={(event) => setTaxableAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tx-exempt">
              Exempt items, e.g. groceries (USD)
            </label>
            <input
              id="tx-exempt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={exemptAmount}
              onChange={(event) => setExemptAmount(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Food for home consumption and prescription drugs are exempt; prepared food, candy and
              soft drinks are not.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tx-shipping">
              Delivery, shipping and handling (USD)
            </label>
            <input
              id="tx-shipping"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={shippingAmount}
              onChange={(event) => setShippingAmount(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label className={CHECK_ROW} htmlFor="tx-ship-taxable">
            <input
              id="tx-ship-taxable"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={shippingTaxable}
              onChange={(event) => setShippingTaxable(event.target.checked)}
            />
            <span>
              The item being shipped is taxable
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                Rule 3.303 — delivery charges follow the taxability of the goods. Untick when you
                are only shipping exempt items.
              </span>
            </span>
          </label>
          <label className={CHECK_ROW} htmlFor="tx-inclusive">
            <input
              id="tx-inclusive"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={priceIncludesTax}
              onChange={(event) => setPriceIncludesTax(event.target.checked)}
            />
            <span>
              The taxable figures above already include sales tax
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                Backs the tax out instead of adding it on.
              </span>
            </span>
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Total sales tax
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `combined rate ${pct(result.combinedRatePercent)}${result.atLocalCap ? " — at the 2% local ceiling" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy Texas sales tax result"
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
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? "Copied Texas sales tax result to clipboard" : ""}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            ["Taxable amount", hasError ? DASH : money(result.taxableBase)],
            ["Non-taxable amount", hasError ? DASH : money(result.nonTaxableTotal)],
            ["State tax (6.25%)", hasError ? DASH : money(result.stateTax)],
            [
              `Local tax (${hasError ? DASH : pct(result.localRatePercent)})`,
              hasError ? DASH : money(result.localTax),
            ],
            ["Subtotal before tax", hasError ? DASH : money(result.preTaxTotal)],
            ["Total due", hasError ? DASH : money(result.grandTotal)],
            ["Effective rate on the whole invoice", hasError ? DASH : pct(result.effectiveRatePercent)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Buying a vehicle? That is a different tax</h2>
        <p className={HINT_CLASS}>
          Motor vehicles fall under Tax Code chapter 152 — a flat 6.25% on the price less trade-in,
          with no local component.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tx-vehicle-price">
              Vehicle sales price (USD)
            </label>
            <input
              id="tx-vehicle-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={vehiclePrice}
              onChange={(event) => setVehiclePrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tx-trade-in">
              Trade-in allowance (USD)
            </label>
            <input
              id="tx-trade-in"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={tradeIn}
              onChange={(event) => setTradeIn(event.target.value)}
            />
          </div>
        </div>

        {vehicle.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {vehicle.error}
          </p>
        ) : (
          <dl
            className="mt-4 divide-y divide-[var(--border)] text-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            {[
              ["Taxable value after trade-in", money(vehicle.taxableValue)],
              ["Motor vehicle sales tax (6.25%)", money(vehicle.tax)],
              ["Price plus tax", money(vehicle.totalWithTax)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Local rates change quarterly — verify an address with
        the Texas Comptroller&rsquo;s Sales Tax Rate Locator before charging or filing.
      </p>
    </main>
  );
}
