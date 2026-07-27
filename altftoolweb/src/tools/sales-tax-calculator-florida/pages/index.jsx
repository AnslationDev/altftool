"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw } from "lucide-react";

import { FL_COUNTY_PRESETS, FL_SURTAX_ITEM_CAP, computeFloridaSalesTax } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const USD0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);
const money0 = (value) => USD0.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  county: "Miami-Dade",
  surtaxRate: "1",
  itemPrice: "8000",
  quantity: "1",
  otherTaxableAmount: "0",
  exemptAmount: "0",
  shippingAmount: "0",
  shippingTaxable: true,
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
  const [county, setCounty] = useState(DEFAULTS.county);
  const [surtaxRate, setSurtaxRate] = useState(DEFAULTS.surtaxRate);
  const [itemPrice, setItemPrice] = useState(DEFAULTS.itemPrice);
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [otherTaxableAmount, setOtherTaxableAmount] = useState(DEFAULTS.otherTaxableAmount);
  const [exemptAmount, setExemptAmount] = useState(DEFAULTS.exemptAmount);
  const [shippingAmount, setShippingAmount] = useState(DEFAULTS.shippingAmount);
  const [shippingTaxable, setShippingTaxable] = useState(DEFAULTS.shippingTaxable);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFloridaSalesTax({
        itemPrice: toNumber(itemPrice),
        quantity: toNumber(quantity),
        surtaxRatePercent: toNumber(surtaxRate),
        otherTaxableAmount: toNumber(otherTaxableAmount),
        exemptAmount: toNumber(exemptAmount),
        shippingAmount: toNumber(shippingAmount),
        shippingTaxable,
      }),
    [
      itemPrice,
      quantity,
      surtaxRate,
      otherTaxableAmount,
      exemptAmount,
      shippingAmount,
      shippingTaxable,
    ],
  );

  const hasError = Boolean(result.error);

  const applyPreset = (name) => {
    setCounty(name);
    const preset = FL_COUNTY_PRESETS.find((item) => item.name === name);
    if (preset) setSurtaxRate(String(preset.surtaxPercent));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "US Sales Tax Calculator Florida",
      `County: ${county}`,
      `Rates: 6.00% state + ${pct(result.surtaxRatePercent)} discretionary surtax`,
      `Taxable base (state): ${money(result.stateBase)}`,
      `Taxable base (surtax, after the $5,000 per-item cap): ${money(result.surtaxBase)}`,
      `State tax: ${money(result.stateTax)}`,
      `County surtax: ${money(result.surtax)}`,
      result.surtaxSavedByCap > 0 ? `Surtax avoided by the cap: ${money(result.surtaxSavedByCap)}` : null,
      `Total sales tax: ${money(result.totalTax)}`,
      `Total due: ${money(result.grandTotal)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [county, hasError, result]);

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
    setCounty(DEFAULTS.county);
    setSurtaxRate(DEFAULTS.surtaxRate);
    setItemPrice(DEFAULTS.itemPrice);
    setQuantity(DEFAULTS.quantity);
    setOtherTaxableAmount(DEFAULTS.otherTaxableAmount);
    setExemptAmount(DEFAULTS.exemptAmount);
    setShippingAmount(DEFAULTS.shippingAmount);
    setShippingTaxable(DEFAULTS.shippingTaxable);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          Florida
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          US Sales Tax Calculator Florida
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Florida charges 6% state tax on the whole sales price, but the county discretionary
          surtax stops at the first {money0(FL_SURTAX_ITEM_CAP)} of each item. This calculator
          applies that cap item by item.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-county">
              County of delivery
            </label>
            <select
              id="fl-county"
              className={`mt-2 ${INPUT_CLASS}`}
              value={county}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {FL_COUNTY_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name} — {(6 + preset.surtaxPercent).toFixed(2)}% total
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>Surtax follows the county where the item is delivered.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-surtax">
              County surtax (% on top of 6%)
            </label>
            <input
              id="fl-surtax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="3"
              step="0.25"
              value={surtaxRate}
              onChange={(event) => setSurtaxRate(event.target.value)}
            />
            <p className={HINT_CLASS}>Check form DR-15DSS for the current year&rsquo;s rate.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-item-price">
              Price of one item (USD)
            </label>
            <input
              id="fl-item-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={itemPrice}
              onChange={(event) => setItemPrice(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Tangible personal property. The cap is tested per item, so enter the single-unit
              price.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-quantity">
              Quantity
            </label>
            <input
              id="fl-quantity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-other">
              Other taxable amount — services, admissions (USD)
            </label>
            <input
              id="fl-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={otherTaxableAmount}
              onChange={(event) => setOtherTaxableAmount(event.target.value)}
            />
            <p className={HINT_CLASS}>The $5,000 cap does not apply to these.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-exempt">
              Exempt items, e.g. groceries (USD)
            </label>
            <input
              id="fl-exempt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={exemptAmount}
              onChange={(event) => setExemptAmount(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fl-shipping">
              Delivery / freight (USD)
            </label>
            <input
              id="fl-shipping"
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

        <div className="mt-4">
          <label className={CHECK_ROW} htmlFor="fl-ship-taxable">
            <input
              id="fl-ship-taxable"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={shippingTaxable}
              onChange={(event) => setShippingTaxable(event.target.checked)}
            />
            <span>
              Freight is taxable
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                Rule 12A-1.045 — untick only when the charge is separately stated and the buyer
                could have avoided it by collecting the goods.
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
                : `6.00% state on ${money(result.stateBase)} plus ${pct(result.surtaxRatePercent)} surtax on ${money(result.surtaxBase)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy Florida sales tax result"
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

        {!hasError && result.capApplies ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Each item is priced at {money(result.salesPricePerItem)}, above the{" "}
            {money0(FL_SURTAX_ITEM_CAP)} ceiling, so {money(result.surtaxExcludedByCap)} of the
            sales price carries no surtax — saving {money(result.surtaxSavedByCap)}.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sales price per item", hasError ? DASH : money(result.salesPricePerItem)],
            ["Taxable base for the 6% state tax", hasError ? DASH : money(result.stateBase)],
            ["Taxable base for the county surtax", hasError ? DASH : money(result.surtaxBase)],
            ["State tax (6.00%)", hasError ? DASH : money(result.stateTax)],
            [
              `County surtax (${hasError ? DASH : pct(result.surtaxRatePercent)})`,
              hasError ? DASH : money(result.surtax),
            ],
            ["Exempt / non-taxable amount", hasError ? DASH : money(result.nonTaxableTotal)],
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
        Informational only, not tax advice. County surtax rates are republished every January in
        form DR-15DSS and some expire mid-year — confirm the current rate with the Florida
        Department of Revenue before charging or filing.
      </p>
    </main>
  );
}
