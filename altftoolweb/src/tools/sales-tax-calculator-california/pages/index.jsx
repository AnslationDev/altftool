"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw } from "lucide-react";

import {
  CA_BASE_RATE,
  CA_LOCATION_PRESETS,
  computeCaliforniaSalesTax,
  districtPartOfCombined,
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

const BASE_RATE_PERCENT = CA_BASE_RATE * 100;

const DEFAULTS = {
  location: "Los Angeles",
  districtRate: String(districtPartOfCombined(9.5)),
  taxableAmount: "1000",
  exemptAmount: "0",
  shippingAmount: "0",
  shippingExempt: true,
  handlingAmount: "0",
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
  const [districtRate, setDistrictRate] = useState(DEFAULTS.districtRate);
  const [taxableAmount, setTaxableAmount] = useState(DEFAULTS.taxableAmount);
  const [exemptAmount, setExemptAmount] = useState(DEFAULTS.exemptAmount);
  const [shippingAmount, setShippingAmount] = useState(DEFAULTS.shippingAmount);
  const [shippingExempt, setShippingExempt] = useState(DEFAULTS.shippingExempt);
  const [handlingAmount, setHandlingAmount] = useState(DEFAULTS.handlingAmount);
  const [priceIncludesTax, setPriceIncludesTax] = useState(DEFAULTS.priceIncludesTax);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCaliforniaSalesTax({
        taxableAmount: toNumber(taxableAmount),
        exemptAmount: toNumber(exemptAmount),
        districtRatePercent: toNumber(districtRate),
        shippingAmount: toNumber(shippingAmount),
        shippingExempt,
        handlingAmount: toNumber(handlingAmount),
        priceIncludesTax,
      }),
    [
      taxableAmount,
      exemptAmount,
      districtRate,
      shippingAmount,
      shippingExempt,
      handlingAmount,
      priceIncludesTax,
    ],
  );

  const hasError = Boolean(result.error);

  const applyPreset = (name) => {
    setLocation(name);
    const preset = CA_LOCATION_PRESETS.find((item) => item.name === name);
    if (preset) setDistrictRate(String(districtPartOfCombined(preset.combinedPercent)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "US Sales Tax Calculator California",
      `Destination: ${location}`,
      `Combined rate: ${pct(result.combinedRatePercent)} (state 6.00% + local 1.25% + district ${pct(result.districtRatePercent)})`,
      `Taxable amount: ${money(result.taxableBase)}`,
      `Non-taxable amount: ${money(result.nonTaxableTotal)}`,
      `State tax (6.00%): ${money(result.stateTax)}`,
      `Local tax (1.25%): ${money(result.localTax)}`,
      `District tax: ${money(result.districtTax)}`,
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
    setDistrictRate(DEFAULTS.districtRate);
    setTaxableAmount(DEFAULTS.taxableAmount);
    setExemptAmount(DEFAULTS.exemptAmount);
    setShippingAmount(DEFAULTS.shippingAmount);
    setShippingExempt(DEFAULTS.shippingExempt);
    setHandlingAmount(DEFAULTS.handlingAmount);
    setPriceIncludesTax(DEFAULTS.priceIncludesTax);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          California
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          US Sales Tax Calculator California
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out California sales tax from the 7.25% statewide base plus the district tax at the
          delivery address, with exempt grocery items and separately stated delivery handled
          correctly.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-location">
              Destination
            </label>
            <select
              id="ca-location"
              className={`mt-2 ${INPUT_CLASS}`}
              value={location}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {CA_LOCATION_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name} — {preset.combinedPercent}%
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              District tax follows where the buyer takes delivery, not where you are.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-district">
              District rate (% on top of {BASE_RATE_PERCENT}%)
            </label>
            <input
              id="ca-district"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="4"
              step="0.005"
              value={districtRate}
              onChange={(event) => setDistrictRate(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Enter the district part only. Confirm the exact rate with the CDTFA rate lookup.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-taxable">
              Taxable goods (USD)
            </label>
            <input
              id="ca-taxable"
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
            <label className={LABEL_CLASS} htmlFor="ca-exempt">
              Exempt items, e.g. grocery food (USD)
            </label>
            <input
              id="ca-exempt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={exemptAmount}
              onChange={(event) => setExemptAmount(event.target.value)}
            />
            <p className={HINT_CLASS}>Cold food to take away is exempt; hot prepared food is not.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-shipping">
              Delivery / shipping charge (USD)
            </label>
            <input
              id="ca-shipping"
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
            <label className={LABEL_CLASS} htmlFor="ca-handling">
              Handling charge (USD)
            </label>
            <input
              id="ca-handling"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={handlingAmount}
              onChange={(event) => setHandlingAmount(event.target.value)}
            />
            <p className={HINT_CLASS}>Handling is always taxable in California.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label className={CHECK_ROW} htmlFor="ca-ship-exempt">
            <input
              id="ca-ship-exempt"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={shippingExempt}
              onChange={(event) => setShippingExempt(event.target.checked)}
            />
            <span>
              Delivery is by common carrier, separately stated and at actual cost
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                Regulation 1628 — untick if you charge a marked-up or combined shipping and
                handling line.
              </span>
            </span>
          </label>
          <label className={CHECK_ROW} htmlFor="ca-inclusive">
            <input
              id="ca-inclusive"
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
                : `combined rate ${pct(result.combinedRatePercent)} on ${money(result.taxableBase)} of taxable sales`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy California sales tax result"
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
            ["Taxable amount", hasError ? DASH : money(result.taxableBase)],
            ["Non-taxable amount (exempt items + exempt delivery)", hasError ? DASH : money(result.nonTaxableTotal)],
            ["State tax (6.00%)", hasError ? DASH : money(result.stateTax)],
            ["Uniform local tax (1.25%)", hasError ? DASH : money(result.localTax)],
            [
              `District tax (${hasError ? DASH : pct(result.districtRatePercent)})`,
              hasError ? DASH : money(result.districtTax),
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Preset rates are indicative and district taxes change as
        local measures pass or expire — verify the address with the CDTFA rate lookup, and note that
        California does not allow a trade-in to reduce the taxable price of a vehicle.
      </p>
    </main>
  );
}
