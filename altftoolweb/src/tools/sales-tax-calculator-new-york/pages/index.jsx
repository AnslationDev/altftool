"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw } from "lucide-react";

import {
  NY_CLOTHING_EXEMPTION_THRESHOLD,
  NY_LOCATION_PRESETS,
  computeNewYorkSalesTax,
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
  location: "New York City",
  localRate: "4.5",
  inMctd: true,
  localExemptsClothing: true,
  taxableAmount: "1000",
  clothingItemPrice: "0",
  clothingQuantity: "0",
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
  const [inMctd, setInMctd] = useState(DEFAULTS.inMctd);
  const [localExemptsClothing, setLocalExemptsClothing] = useState(DEFAULTS.localExemptsClothing);
  const [taxableAmount, setTaxableAmount] = useState(DEFAULTS.taxableAmount);
  const [clothingItemPrice, setClothingItemPrice] = useState(DEFAULTS.clothingItemPrice);
  const [clothingQuantity, setClothingQuantity] = useState(DEFAULTS.clothingQuantity);
  const [shippingAmount, setShippingAmount] = useState(DEFAULTS.shippingAmount);
  const [shippingTaxable, setShippingTaxable] = useState(DEFAULTS.shippingTaxable);
  const [priceIncludesTax, setPriceIncludesTax] = useState(DEFAULTS.priceIncludesTax);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeNewYorkSalesTax({
        taxableAmount: toNumber(taxableAmount),
        clothingItemPrice: toNumber(clothingItemPrice),
        clothingQuantity: toNumber(clothingQuantity),
        localRatePercent: toNumber(localRate),
        inMctd,
        localExemptsClothing,
        shippingAmount: toNumber(shippingAmount),
        shippingTaxable,
        priceIncludesTax,
      }),
    [
      taxableAmount,
      clothingItemPrice,
      clothingQuantity,
      localRate,
      inMctd,
      localExemptsClothing,
      shippingAmount,
      shippingTaxable,
      priceIncludesTax,
    ],
  );

  const hasError = Boolean(result.error);

  const applyPreset = (name) => {
    setLocation(name);
    const preset = NY_LOCATION_PRESETS.find((item) => item.name === name);
    if (!preset) return;
    setLocalRate(String(preset.localPercent));
    setInMctd(preset.inMctd);
    setLocalExemptsClothing(preset.localExemptsClothing);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "US Sales Tax Calculator New York",
      `Jurisdiction: ${location}`,
      `Combined rate: ${pct(result.combinedRatePercent)} (state 4% + local ${pct(result.localRatePercent)}${result.mctdRatePercent > 0 ? " + MCTD 0.375%" : ""})`,
      `Taxable goods base: ${money(result.generalBase)}`,
      result.clothingBase > 0
        ? `Clothing base: ${money(result.clothingBase)} taxed at ${pct(result.clothingRatePercent)}`
        : null,
      `State tax: ${money(result.stateTax)}`,
      `Local tax: ${money(result.localTax)}`,
      `MCTD surcharge: ${money(result.mctdTax)}`,
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
    setInMctd(DEFAULTS.inMctd);
    setLocalExemptsClothing(DEFAULTS.localExemptsClothing);
    setTaxableAmount(DEFAULTS.taxableAmount);
    setClothingItemPrice(DEFAULTS.clothingItemPrice);
    setClothingQuantity(DEFAULTS.clothingQuantity);
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
          New York
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          US Sales Tax Calculator New York
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stack the 4% New York State rate, the county or city rate and the 0.375% MCTD surcharge,
          with the under-${NY_CLOTHING_EXEMPTION_THRESHOLD} clothing exemption applied per item.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ny-location">
              Where the customer takes delivery
            </label>
            <select
              id="ny-location"
              className={`mt-2 ${INPUT_CLASS}`}
              value={location}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {NY_LOCATION_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name} — {preset.combinedPercent}%
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>New York sources sales to the delivery address.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ny-local">
              Local rate (% on top of 4%)
            </label>
            <input
              id="ny-local"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="6"
              step="0.125"
              value={localRate}
              onChange={(event) => setLocalRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ny-taxable">
              Taxable goods and services (USD)
            </label>
            <input
              id="ny-taxable"
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
            <label className={LABEL_CLASS} htmlFor="ny-shipping">
              Delivery, shipping and handling (USD)
            </label>
            <input
              id="ny-shipping"
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
            <label className={LABEL_CLASS} htmlFor="ny-clothing-price">
              Clothing / footwear price per item (USD)
            </label>
            <input
              id="ny-clothing-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={clothingItemPrice}
              onChange={(event) => setClothingItemPrice(event.target.value)}
            />
            <p className={HINT_CLASS}>
              The exemption is tested per item, not per receipt — a $130 coat is taxable in full.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ny-clothing-qty">
              Number of clothing items
            </label>
            <input
              id="ny-clothing-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={clothingQuantity}
              onChange={(event) => setClothingQuantity(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label className={CHECK_ROW} htmlFor="ny-mctd">
            <input
              id="ny-mctd"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={inMctd}
              onChange={(event) => setInMctd(event.target.checked)}
            />
            <span>
              Inside the MCTD (0.375% surcharge)
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                The five boroughs plus Dutchess, Nassau, Orange, Putnam, Rockland, Suffolk and
                Westchester.
              </span>
            </span>
          </label>
          <label className={CHECK_ROW} htmlFor="ny-local-clothing">
            <input
              id="ny-local-clothing"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={localExemptsClothing}
              onChange={(event) => setLocalExemptsClothing(event.target.checked)}
            />
            <span>
              The locality also exempts clothing under $110
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                New York City and some counties have elected the local exemption; most have not.
              </span>
            </span>
          </label>
          <label className={CHECK_ROW} htmlFor="ny-ship-taxable">
            <input
              id="ny-ship-taxable"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={shippingTaxable}
              onChange={(event) => setShippingTaxable(event.target.checked)}
            />
            <span>
              The goods being shipped are taxable
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                Tax Bulletin ST-838 — delivery charges follow the goods.
              </span>
            </span>
          </label>
          <label className={CHECK_ROW} htmlFor="ny-inclusive">
            <input
              id="ny-inclusive"
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
                : `combined rate ${pct(result.combinedRatePercent)} on ordinary taxable goods`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy New York sales tax result"
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

        {!hasError && result.clothingBase > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            {result.clothingFullyExempt
              ? `Clothing qualifies and this jurisdiction exempts it locally too — ${money(result.clothingBase)} is fully untaxed.`
              : result.clothingQualifies
                ? `Clothing is under $${NY_CLOTHING_EXEMPTION_THRESHOLD} per item, so it escapes the 4% state tax and the MCTD surcharge but still pays the local ${pct(result.localRatePercent)}.`
                : `Each clothing item is $${NY_CLOTHING_EXEMPTION_THRESHOLD} or more, so the full price is taxed at ${pct(result.combinedRatePercent)}.`}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Taxable goods base", hasError ? DASH : money(result.generalBase)],
            ["Clothing base", hasError ? DASH : money(result.clothingBase)],
            ["State tax (4%)", hasError ? DASH : money(result.stateTax)],
            [
              `Local tax (${hasError ? DASH : pct(result.localRatePercent)})`,
              hasError ? DASH : money(result.localTax),
            ],
            ["MCTD surcharge (0.375%)", hasError ? DASH : money(result.mctdTax)],
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
        Informational only, not tax advice. Local rates and clothing-exemption elections change —
        check Publication 718 and 718-C from the New York State Department of Taxation and Finance
        before charging or filing.
      </p>
    </main>
  );
}
