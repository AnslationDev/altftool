"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw } from "lucide-react";

import {
  WA_LOCATION_PRESETS,
  WA_STATE_SALES_TAX_RATE,
  computeWashingtonSalesTax,
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

const STATE_RATE_PERCENT = WA_STATE_SALES_TAX_RATE * 100;

const DEFAULTS = {
  location: "Seattle",
  localRate: String(localPartOfCombined(10.35)),
  itemsAmount: "1000",
  shippingAmount: "0",
  shippingTaxable: true,
  tradeInAmount: "0",
  isMotorVehicle: false,
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
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").replace(/\$/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [location, setLocation] = useState(DEFAULTS.location);
  const [localRate, setLocalRate] = useState(DEFAULTS.localRate);
  const [itemsAmount, setItemsAmount] = useState(DEFAULTS.itemsAmount);
  const [shippingAmount, setShippingAmount] = useState(DEFAULTS.shippingAmount);
  const [shippingTaxable, setShippingTaxable] = useState(DEFAULTS.shippingTaxable);
  const [tradeInAmount, setTradeInAmount] = useState(DEFAULTS.tradeInAmount);
  const [isMotorVehicle, setIsMotorVehicle] = useState(DEFAULTS.isMotorVehicle);
  const [priceIncludesTax, setPriceIncludesTax] = useState(DEFAULTS.priceIncludesTax);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeWashingtonSalesTax({
        itemsAmount: toNumber(itemsAmount),
        localRatePercent: toNumber(localRate),
        shippingAmount: toNumber(shippingAmount),
        shippingTaxable,
        tradeInAmount: toNumber(tradeInAmount),
        isMotorVehicle,
        priceIncludesTax,
      }),
    [
      itemsAmount,
      localRate,
      shippingAmount,
      shippingTaxable,
      tradeInAmount,
      isMotorVehicle,
      priceIncludesTax,
    ],
  );

  const hasError = Boolean(result.error);

  const onPresetChange = (name) => {
    setLocation(name);
    const preset = WA_LOCATION_PRESETS.find((item) => item.name === name);
    if (preset) setLocalRate(String(localPartOfCombined(preset.combinedPercent)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Washington sales tax",
      `Destination: ${location}`,
      `Combined rate: ${pct(result.combinedRatePercent)} (state ${pct(result.stateRatePercent)} + local ${pct(result.localRatePercent)}${
        result.vehicleRatePercent ? ` + vehicle ${pct(result.vehicleRatePercent)}` : ""
      })`,
      `Taxable selling price: ${money(result.taxableBase)}`,
      result.tradeInApplied ? `Trade-in deducted: ${money(result.tradeInApplied)}` : null,
      result.exemptShipping ? `Non-taxable shipping: ${money(result.exemptShipping)}` : null,
      `State tax: ${money(result.stateTax)}`,
      `Local tax: ${money(result.localTax)}`,
      result.vehicleTax ? `Motor vehicle tax: ${money(result.vehicleTax)}` : null,
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
    setItemsAmount(DEFAULTS.itemsAmount);
    setShippingAmount(DEFAULTS.shippingAmount);
    setShippingTaxable(DEFAULTS.shippingTaxable);
    setTradeInAmount(DEFAULTS.tradeInAmount);
    setIsMotorVehicle(DEFAULTS.isMotorVehicle);
    setPriceIncludesTax(DEFAULTS.priceIncludesTax);
    setCopied(false);
  };

  const rows = [
    ["Taxable selling price", hasError ? DASH : money(result.taxableBase)],
    [
      `State tax at ${pct(STATE_RATE_PERCENT)}`,
      hasError ? DASH : money(result.stateTax),
    ],
    [
      `Local tax at ${hasError ? DASH : pct(result.localRatePercent)}`,
      hasError ? DASH : money(result.localTax),
    ],
    ...(isMotorVehicle
      ? [["Motor vehicle tax at 0.30%", hasError ? DASH : money(result.vehicleTax)]]
      : []),
    ...(!hasError && result.tradeInApplied
      ? [["Trade-in deducted before tax", `− ${money(result.tradeInApplied)}`]]
      : []),
    ...(!hasError && result.exemptShipping
      ? [["Shipping treated as non-taxable", money(result.exemptShipping)]]
      : []),
    ["Subtotal before tax", hasError ? DASH : money(result.preTaxTotal)],
    ["Total sales tax", hasError ? DASH : money(result.totalTax)],
    ["Total due", hasError ? DASH : money(result.grandTotal)],
    [
      "Effective rate on the whole invoice",
      hasError ? DASH : pct(result.effectiveRatePercent),
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          US taxes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Washington Sales Tax Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Washington charges 6.5% state sales tax plus a local rate set where the buyer receives
          the goods. Pick a destination or type the local rate from the Department of Revenue rate
          lookup, and the calculator splits state, local and motor vehicle tax for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-location">
              Destination (where the buyer receives the goods)
            </label>
            <select
              id="wa-location"
              className={`mt-2 ${INPUT_CLASS}`}
              value={location}
              onChange={(event) => onPresetChange(event.target.value)}
            >
              {WA_LOCATION_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name} ({preset.county}) — {PCT.format(preset.combinedPercent)}%
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Reference rates only. Local rates change quarterly — confirm the exact street address
              rate with the Department of Revenue Tax Rate Lookup.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-local-rate">
              Local rate only (%)
            </label>
            <input
              id="wa-local-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="5"
              step="0.001"
              value={localRate}
              onChange={(event) => setLocalRate(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Do not include the 6.5% state rate here. Combined rate:{" "}
              {hasError ? DASH : pct(result.combinedRatePercent)}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-items">
              Selling price of taxable goods ($)
            </label>
            <input
              id="wa-items"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={itemsAmount}
              onChange={(event) => setItemsAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-shipping">
              Shipping and handling charged ($)
            </label>
            <input
              id="wa-shipping"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={shippingAmount}
              onChange={(event) => setShippingAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-tradein">
              Like-kind trade-in allowance ($)
            </label>
            <input
              id="wa-tradein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={tradeInAmount}
              onChange={(event) => setTradeInAmount(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Washington deducts a like-kind trade-in from the selling price before tax.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label htmlFor="wa-shipping-taxable" className={CHECK_ROW}>
            <input
              id="wa-shipping-taxable"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={shippingTaxable}
              onChange={(event) => setShippingTaxable(event.target.checked)}
            />
            Shipping is taxable (the goods being delivered are taxable)
          </label>
          <label htmlFor="wa-vehicle" className={CHECK_ROW}>
            <input
              id="wa-vehicle"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={isMotorVehicle}
              onChange={(event) => setIsMotorVehicle(event.target.checked)}
            />
            Motor vehicle sale or lease (adds the 0.3% state vehicle tax)
          </label>
          <label htmlFor="wa-inclusive" className={CHECK_ROW}>
            <input
              id="wa-inclusive"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={priceIncludesTax}
              onChange={(event) => setPriceIncludesTax(event.target.checked)}
            />
            The amounts above already include sales tax (back out the tax)
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total sales tax
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the figures."
                : `${money(result.grandTotal)} total due at ${pct(result.combinedRatePercent)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy Washington sales tax breakdown"
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
              aria-label="Reset all inputs to defaults"
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
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Common Washington destination rates</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  City
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  County
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Local
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Combined
                </th>
              </tr>
            </thead>
            <tbody>
              {WA_LOCATION_PRESETS.map((preset) => (
                <tr key={preset.name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{preset.name}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{preset.county}</td>
                  <td className="py-2 pr-3 text-right">
                    {pct(localPartOfCombined(preset.combinedPercent))}
                  </td>
                  <td className="py-2 text-right font-semibold">{pct(preset.combinedPercent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate based on RCW 82.08.020 (6.5% state rate and the 0.3% motor vehicle
        tax), RCW 82.14 (local rates) and RCW 82.32.730 (destination sourcing). Groceries,
        prescription drugs and many services follow separate rules, and vehicle purchases may also
        attract regional transit and use tax. Confirm rates and taxability with the Washington
        Department of Revenue or a tax professional before filing.
      </p>
    </main>
  );
}
