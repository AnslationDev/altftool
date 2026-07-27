"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  SOLVE_MODES,
  buildComparisonTable,
  marginAfterDiscount,
  solvePricing,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const CURRENCY_LOCALES = {
  USD: "en-US", EUR: "en-IE", GBP: "en-GB", INR: "en-IN",
  AED: "en-AE", SGD: "en-SG", AUD: "en-AU", CAD: "en-CA",
};

const DEFAULTS = {
  mode: "cost-markup",
  cost: "100",
  price: "150",
  percent: "50",
  currency: "USD",
  discount: "20",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const needsCost = (mode) => mode.startsWith("cost");
const needsPrice = (mode) => mode.startsWith("price") || mode === "cost-price";
const needsPercent = (mode) => mode !== "cost-price";
const percentIsMargin = (mode) => mode.endsWith("margin");

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [percent, setPercent] = useState(DEFAULTS.percent);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [discount, setDiscount] = useState(DEFAULTS.discount);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const locale = CURRENCY_LOCALES[currency] ?? "en-US";
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);

  const pct = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }), []);
  const mult = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }), []);

  const result = useMemo(
    () =>
      solvePricing({
        mode,
        cost: toNumber(cost),
        price: toNumber(price),
        percent: toNumber(percent),
      }),
    [mode, cost, price, percent],
  );

  const ok = !result.error;

  const discounted = useMemo(() => {
    if (!ok) return { error: result.error };
    return marginAfterDiscount(result.marginPercent, toNumber(discount));
  }, [ok, result, discount]);

  const table = useMemo(() => buildComparisonTable(), []);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Margin and markup",
      `Cost: ${money(result.cost)}`,
      `Selling price: ${money(result.price)}`,
      `Gross profit: ${money(result.profit)}`,
      `Markup: ${pct.format(result.markupPercent)}%`,
      `Margin: ${pct.format(result.marginPercent)}%`,
      `Price multiplier: ${mult.format(result.multiplier)}x`,
    ].join("\n");
  }, [ok, result, money, pct, mult]);

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
    setMode(DEFAULTS.mode);
    setCost(DEFAULTS.cost);
    setPrice(DEFAULTS.price);
    setPercent(DEFAULTS.percent);
    setCurrency(DEFAULTS.currency);
    setDiscount(DEFAULTS.discount);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Pricing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Profit Margin and Markup Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Markup measures profit against cost; margin measures it against price. Enter any two of
          cost, price, margin or markup and get the rest — including the multiplier you apply to cost.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What do you know?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mm-mode">I know</label>
            <select id="mm-mode" className={`mt-2 ${INPUT_CLASS}`} value={mode} onChange={(e) => setMode(e.target.value)}>
              {Object.values(SOLVE_MODES).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          {needsCost(mode) && (
            <div>
              <label className={LABEL_CLASS} htmlFor="mm-cost">Unit cost</label>
              <input id="mm-cost" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
          )}
          {needsPrice(mode) && (
            <div>
              <label className={LABEL_CLASS} htmlFor="mm-price">Selling price</label>
              <input id="mm-price" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          )}
          {needsPercent(mode) && (
            <div>
              <label className={LABEL_CLASS} htmlFor="mm-percent">
                {percentIsMargin(mode) ? "Gross margin (%)" : "Markup (%)"}
              </label>
              <input id="mm-percent" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" step="1" value={percent} onChange={(e) => setPercent(e.target.value)} />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="mm-currency">Currency</label>
            <select id="mm-currency" className={`mt-2 ${INPUT_CLASS}`} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {Object.keys(CURRENCY_LOCALES).map((code) => (<option key={code} value={code}>{code}</option>))}
            </select>
          </div>
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Gross margin
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${pct.format(result.marginPercent)}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `equals a markup of ${pct.format(result.markupPercent)}% on cost` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the margin and markup result" className={GHOST_BTN} disabled={!summary}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && result.belowCost && (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            This price is below cost — every unit sold loses {money(Math.abs(result.profit))}.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Unit cost", ok ? money(result.cost) : DASH],
            ["Selling price", ok ? money(result.price) : DASH],
            ["Gross profit per unit", ok ? money(result.profit) : DASH],
            ["Markup on cost", ok ? `${pct.format(result.markupPercent)}%` : DASH],
            ["Margin on price", ok ? `${pct.format(result.marginPercent)}%` : DASH],
            ["Price as a multiple of cost", ok ? `${mult.format(result.multiplier)}x` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Cost is ${pct.format(100 - result.marginPercent)} percent of the price and profit is ${pct.format(result.marginPercent)} percent`}
            >
              <span className="block h-full bg-[var(--muted-foreground)]" style={{ width: `${Math.max(0, Math.min(100, 100 - result.marginPercent))}%` }} />
              <span className="block h-full bg-[var(--success)]" style={{ width: `${Math.max(0, Math.min(100, result.marginPercent))}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Of every {money(result.price)} of revenue, {money(result.cost)} is cost and {money(result.profit)} is gross profit.
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What a discount does to this margin</h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="mm-discount">Discount off the selling price (%)</label>
          <input id="mm-discount" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="99" step="1" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
        {discounted.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {discounted.error}
          </p>
        ) : (
          <p className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${discounted.wipesOut ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--muted)] text-[var(--foreground)]"}`}>
            {discounted.wipesOut
              ? `A ${pct.format(toNumber(discount))}% discount wipes out this margin entirely — the sale is at or below cost.`
              : `After a ${pct.format(toNumber(discount))}% discount the margin falls to ${pct.format(discounted.remainingMarginPercent)}%.`}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Markup and margin side by side</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Markup on cost</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Margin on price</th>
                <th scope="col" className="py-2 text-right font-semibold">Multiplier</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.markupPercent} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{pct.format(row.markupPercent)}%</td>
                  <td className="py-2 pr-3 text-right">{pct.format(row.marginPercent)}%</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{mult.format(row.multiplier)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Gross margin here covers direct cost only. Overheads, selling costs, returns and tax all sit
        below it, so a healthy gross margin is not the same as a profitable business.
      </p>
    </main>
  );
}
