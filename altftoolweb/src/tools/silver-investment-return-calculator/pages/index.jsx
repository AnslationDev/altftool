"use client";

import { useMemo, useState } from "react";
import { Check, Coins, Copy, RotateCcw } from "lucide-react";

import { GST_ON_SILVER_PCT, computeSilverReturn, parseIsoDate } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${num(value)}%`;
const showDate = (iso) => {
  const stamp = parseIsoDate(iso);
  return stamp === null ? "—" : DATE_FMT.format(new Date(stamp));
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  buyPrice: "95000",
  sellPrice: "130000",
  kg: "2",
  buyDate: "2023-07-26",
  sellDate: "2026-07-26",
  making: "0",
  gst: String(GST_ON_SILVER_PCT),
  otherBuy: "500",
  deduction: "2",
  sellCosts: "0",
  tax: "12.5",
};

export default function ToolHome() {
  const [buyPrice, setBuyPrice] = useState(DEFAULTS.buyPrice);
  const [sellPrice, setSellPrice] = useState(DEFAULTS.sellPrice);
  const [kg, setKg] = useState(DEFAULTS.kg);
  const [buyDate, setBuyDate] = useState(DEFAULTS.buyDate);
  const [sellDate, setSellDate] = useState(DEFAULTS.sellDate);
  const [making, setMaking] = useState(DEFAULTS.making);
  const [gst, setGst] = useState(DEFAULTS.gst);
  const [otherBuy, setOtherBuy] = useState(DEFAULTS.otherBuy);
  const [deduction, setDeduction] = useState(DEFAULTS.deduction);
  const [sellCosts, setSellCosts] = useState(DEFAULTS.sellCosts);
  const [tax, setTax] = useState(DEFAULTS.tax);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSilverReturn({
        buyPricePerKg: buyPrice,
        sellPricePerKg: sellPrice,
        quantityKg: kg,
        buyDate,
        sellDate,
        makingChargePct: making,
        gstPct: gst,
        otherBuyCosts: otherBuy,
        buybackDeductionPct: deduction,
        sellCosts,
        taxPct: tax,
      }),
    [buyPrice, sellPrice, kg, buyDate, sellDate, making, gst, otherBuy, deduction, sellCosts, tax],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Silver Investment Return",
      `Bought ${num(result.quantityKg)} kg at ${money2(result.buyPricePerKg)}/kg on ${showDate(buyDate)}`,
      `Total invested: ${money(result.investment)} (GST ${money(result.gst)}, effective ${money2(result.effectiveBuyPerKg)}/kg)`,
      `Sold at ${money2(result.sellPricePerKg)}/kg on ${showDate(sellDate)} for ${money(result.proceeds)}`,
      `Gain before tax: ${money(result.gain)} · tax ${money(result.taxPayable)}`,
      `Net proceeds: ${money(result.net)} · profit ${money(result.netProfit)}`,
      `Return: ${pct(result.absoluteReturnPct)} absolute${result.cagrPct === null ? "" : `, ${pct(result.cagrPct)} a year`}`,
      `Silver price itself moved ${pct(result.priceChangePct)} — costs and tax took ${pct(result.frictionGapPct)}`,
      result.breakEvenSellPerKg === null
        ? null
        : `Break-even sale price: ${money2(result.breakEvenSellPerKg)}/kg`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, buyDate, sellDate]);

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
    setBuyPrice(DEFAULTS.buyPrice);
    setSellPrice(DEFAULTS.sellPrice);
    setKg(DEFAULTS.kg);
    setBuyDate(DEFAULTS.buyDate);
    setSellDate(DEFAULTS.sellDate);
    setMaking(DEFAULTS.making);
    setGst(DEFAULTS.gst);
    setOtherBuy(DEFAULTS.otherBuy);
    setDeduction(DEFAULTS.deduction);
    setSellCosts(DEFAULTS.sellCosts);
    setTax(DEFAULTS.tax);
    setCopied(false);
  };

  const numberFields = [
    { id: "sv-buy", label: "Buying price (₹ per kg)", value: buyPrice, set: setBuyPrice, step: "500" },
    { id: "sv-sell", label: "Selling price (₹ per kg)", value: sellPrice, set: setSellPrice, step: "500" },
    { id: "sv-kg", label: "Quantity (kg)", value: kg, set: setKg, step: "0.1" },
    { id: "sv-making", label: "Making charge or premium (%)", value: making, set: setMaking, step: "0.5" },
    { id: "sv-gst", label: "GST on the purchase (%)", value: gst, set: setGst, step: "0.5" },
    { id: "sv-otherbuy", label: "Other buying costs (₹)", value: otherBuy, set: setOtherBuy, step: "100" },
    { id: "sv-deduction", label: "Buyback deduction on sale (%)", value: deduction, set: setDeduction, step: "0.5" },
    { id: "sv-sellcosts", label: "Selling costs (₹)", value: sellCosts, set: setSellCosts, step: "100" },
    { id: "sv-tax", label: "Tax on the gain (%)", value: tax, set: setTax, step: "0.5" },
  ];

  const rows = hasError
    ? [
        ["Metal value at the buying quote", DASH],
        ["Making charge or premium", DASH],
        ["GST paid", DASH],
        ["Total invested", DASH],
        ["Effective buying price", DASH],
        ["Sale value at the selling quote", DASH],
        ["Buyback deduction and selling costs", DASH],
        ["Gain before tax", DASH],
        ["Tax on the gain", DASH],
        ["Net proceeds", DASH],
        ["Annualised return", DASH],
        ["Break-even selling price", DASH],
      ]
    : [
        ["Metal value at the buying quote", money(result.metalValue)],
        ["Making charge or premium", money(result.makingCharge)],
        ["GST paid", money(result.gst)],
        ["Total invested", money(result.investment)],
        [
          "Effective buying price",
          `${money2(result.effectiveBuyPerKg)} / kg (${money2(result.effectiveBuyPerGram)} / g)`,
        ],
        ["Sale value at the selling quote", money(result.saleValue)],
        ["Buyback deduction and selling costs", money(result.exitCosts)],
        ["Gain before tax", money(result.gain)],
        ["Tax on the gain", money(result.taxPayable)],
        ["Net proceeds", money(result.net)],
        [
          "Annualised return",
          result.cagrPct === null ? "Needs a holding period" : pct(result.cagrPct),
        ],
        [
          "Break-even selling price",
          result.breakEvenSellPerKg === null ? DASH : `${money2(result.breakEvenSellPerKg)} / kg`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coins className="h-4 w-4" aria-hidden="true" />
          Silver
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Silver Investment Return Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Silver is bought above the quote and sold below it. Add {GST_ON_SILVER_PCT}% GST, any
          premium and the buyback discount to see the return you actually kept, not the price move.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-buydate">
              Purchase date
            </label>
            <input
              id="sv-buydate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={buyDate}
              onChange={(event) => setBuyDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sv-selldate">
              Sale date
            </label>
            <input
              id="sv-selldate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={sellDate}
              onChange={(event) => setSellDate(event.target.value)}
            />
          </div>
          {numberFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
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
              Profit after costs and tax
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.netProfit)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your return."
                : `${pct(result.absoluteReturnPct)} on ${money(result.investment)} invested over ${num(result.years)} year(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy silver return result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <p
          className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
            hasError
              ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
              : result.profitable
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
          }`}
        >
          {hasError
            ? DASH
            : `The silver quote moved ${pct(result.priceChangePct)}, but you kept ${pct(result.absoluteReturnPct)} — costs and tax took ${pct(result.frictionGapPct)}.`}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            Held for {result.days} days ({num(result.years)} years). Total charges came to{" "}
            {money(result.totalCosts)}, or {pct(result.costsSharePct)} of the metal value.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        GST on silver is 3% by rule; making charges, premiums and buyback discounts are set by the
        seller and vary widely. Capital gains rules and holding periods for precious metals have been
        revised recently, so enter the rate that applies to you and confirm it with a chartered
        accountant. Informational only, not investment advice.
      </p>
    </main>
  );
}
