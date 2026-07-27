"use client";

import { useMemo, useState } from "react";
import { Bitcoin, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BLOCKED_SET_OFFS,
  HEALTH_EDUCATION_CESS,
  SURCHARGE_OPTIONS,
  TDS_194S_RATE,
  VDA_TAX_RATE,
  computeVdaTax,
  explainLossTreatment,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const DASH = "—";

const DEFAULT_TRADES = [
  { key: 1, asset: "Bitcoin", cost: "100000", sale: "200000", expenses: "1500" },
  { key: 2, asset: "Ethereum", cost: "100000", sale: "40000", expenses: "800" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [trades, setTrades] = useState(DEFAULT_TRADES);
  const [surcharge, setSurcharge] = useState("0");
  const [isSpecifiedPerson, setIsSpecifiedPerson] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeVdaTax({
        trades: trades.map((trade) => ({
          asset: trade.asset,
          costOfAcquisition: toNumber(trade.cost),
          saleConsideration: toNumber(trade.sale),
          otherExpenses: toNumber(trade.expenses),
        })),
        surchargeRatePct: toNumber(surcharge),
        isSpecifiedPerson,
      }),
    [trades, surcharge, isSpecifiedPerson],
  );

  const explanation = useMemo(() => explainLossTreatment(result), [result]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Crypto (virtual digital asset) tax under Section 115BBH",
      `Gains taxed: ${money(result.totalGains)}`,
      `Losses ignored (no set off, no carry forward): ${money(result.totalLosses)}`,
      `Tax at ${VDA_TAX_RATE}%: ${money(result.baseTax)}`,
      `Surcharge: ${money(result.surcharge)}`,
      `Health and education cess at ${HEALTH_EDUCATION_CESS}%: ${money(result.cess)}`,
      `Total tax: ${money(result.totalTax)}`,
      `Tax if gains and losses could be netted: ${money(result.nettedTotalTax)}`,
      `Extra tax caused by the set-off bar: ${money(result.extraTaxFromNoSetOff)}`,
      `Section 194S TDS at ${TDS_194S_RATE}% of consideration: ${money(result.tds194s)}`,
    ].join("\n");
  }, [ok, result]);

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
    setTrades(DEFAULT_TRADES);
    setSurcharge("0");
    setIsSpecifiedPerson(true);
    setCopied(false);
  };

  const updateTrade = (key, field, value) => {
    setTrades((previous) =>
      previous.map((trade) => (trade.key === key ? { ...trade, [field]: value } : trade)),
    );
  };

  const addTrade = () => {
    setTrades((previous) => {
      const nextKey = previous.reduce((max, trade) => Math.max(max, trade.key), 0) + 1;
      return [...previous, { key: nextKey, asset: "", cost: "0", sale: "0", expenses: "0" }];
    });
  };

  const removeTrade = (key) => {
    setTrades((previous) => (previous.length > 1 ? previous.filter((t) => t.key !== key) : previous));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bitcoin className="h-4 w-4" aria-hidden="true" />
          Crypto tax
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Crypto Loss Set Off Rules Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Section 115BBH taxes every gain on a virtual digital asset at {VDA_TAX_RATE}% and lets no
          loss offset anything — not another coin, not other income, not next year. Enter your
          trades to see what that rule actually costs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Trades this financial year</h2>
          <button type="button" onClick={addTrade} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add trade
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {trades.map((trade, index) => (
            <div key={trade.key} className="rounded-md border border-[var(--border)] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <label className={SMALL_LABEL} htmlFor={`vda-asset-${trade.key}`}>
                    Asset
                  </label>
                  <input
                    id={`vda-asset-${trade.key}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="text"
                    placeholder={`Trade ${index + 1}`}
                    value={trade.asset}
                    onChange={(event) => updateTrade(trade.key, "asset", event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTrade(trade.key)}
                  aria-label={`Remove ${trade.asset || `trade ${index + 1}`}`}
                  disabled={trades.length <= 1}
                  className="mt-6 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-40 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`vda-cost-${trade.key}`}>
                    Cost of acquisition (INR)
                  </label>
                  <input
                    id={`vda-cost-${trade.key}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={trade.cost}
                    onChange={(event) => updateTrade(trade.key, "cost", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`vda-sale-${trade.key}`}>
                    Sale consideration (INR)
                  </label>
                  <input
                    id={`vda-sale-${trade.key}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={trade.sale}
                    onChange={(event) => updateTrade(trade.key, "sale", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`vda-exp-${trade.key}`}>
                    Fees and gas paid (INR)
                  </label>
                  <input
                    id={`vda-exp-${trade.key}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    value={trade.expenses}
                    onChange={(event) => updateTrade(trade.key, "expenses", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vda-surcharge">
              Surcharge on your total income
            </label>
            <select
              id="vda-surcharge"
              className={`mt-2 ${INPUT_CLASS}`}
              value={surcharge}
              onChange={(event) => setSurcharge(event.target.value)}
            >
              {SURCHARGE_OPTIONS.map((option) => (
                <option key={option.rate} value={String(option.rate)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className={`mt-4 ${CHECKBOX_ROW}`} htmlFor="vda-specified">
          <input
            id="vda-specified"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={isSpecifiedPerson}
            onChange={(event) => setIsSpecifiedPerson(event.target.checked)}
          />
          I am a specified person for Section 194S (higher TDS threshold)
        </label>
      </section>

      {result.error ? (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total tax on your crypto gains
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.totalTax) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${VDA_TAX_RATE}% on ${money(result.taxableIncome)} of gains, plus ${HEALTH_EDUCATION_CESS}% cess`
                : "Fix the trades above to see the tax"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the crypto tax result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Gains that are taxed", ok ? money(result.totalGains) : DASH],
            ["Losses thrown away", ok ? money(result.totalLosses) : DASH],
            ["Fees and gas disallowed", ok ? money(result.disallowedExpenses) : DASH],
            [`Tax at ${VDA_TAX_RATE}%`, ok ? money(result.baseTax) : DASH],
            [`Surcharge at ${ok ? NUM.format(result.surchargeRatePct) : "0"}%`, ok ? money(result.surcharge) : DASH],
            [`Cess at ${HEALTH_EDUCATION_CESS}%`, ok ? money(result.cess) : DASH],
            ["What you actually made across all trades", ok ? money(result.netEconomicResult) : DASH],
            ["Left after tax", ok ? money(result.afterTaxResult) : DASH],
            [
              "Effective rate on what you really made",
              ok && result.effectiveRateOnEconomicGain !== null
                ? `${NUM.format(result.effectiveRateOnEconomicGain)}%`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What the set-off bar costs you</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <caption className="sr-only">Tax with and without loss set-off</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Line
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  As the law stands
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  If netting were allowed
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="py-2.5 pr-3 text-left font-normal text-[var(--muted-foreground)]">
                  Income charged to tax
                </th>
                <td className="py-2.5 pr-3 text-right font-semibold">
                  {ok ? money(result.taxableIncome) : DASH}
                </td>
                <td className="py-2.5 text-right font-semibold">
                  {ok ? money(result.nettedIncome) : DASH}
                </td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <th scope="row" className="py-2.5 pr-3 text-left font-normal text-[var(--muted-foreground)]">
                  Total tax
                </th>
                <td className="py-2.5 pr-3 text-right font-semibold">
                  {ok ? money(result.totalTax) : DASH}
                </td>
                <td className="py-2.5 text-right font-semibold">
                  {ok ? money(result.nettedTotalTax) : DASH}
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2.5 pr-3 text-left font-normal text-[var(--muted-foreground)]">
                  Difference
                </th>
                <td className="py-2.5 pr-3 text-right font-semibold text-[var(--danger)]" colSpan={2}>
                  {ok ? `${money(result.extraTaxFromNoSetOff)} more tax` : DASH}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {explanation.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {explanation.map((statement) => (
              <li key={statement} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  •
                </span>
                <span>{statement}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">TDS under Section 194S</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total sale consideration", ok ? money(result.totalConsideration) : DASH],
            ["Threshold that applies to you", ok ? money(result.tdsThreshold) : DASH],
            [`TDS at ${TDS_194S_RATE}%`, ok ? money(result.tds194s) : DASH],
            ["Tax still payable after TDS credit", ok ? money(result.taxPayableAfterTds) : DASH],
            ["TDS refundable", ok ? money(result.tdsRefundable) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Set-offs the law does not allow</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {BLOCKED_SET_OFFS.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-[var(--danger)]">
                ✕
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          The Finance Bill 2022 first proposed barring set-off only against income from other
          sources. An official amendment removed the word &ldquo;other&rdquo;, which is why a loss
          on one coin cannot be set against a gain on another.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Trades must be reported line by line in Schedule VDA of
        the return, and how a particular transaction is characterised — sale, swap, airdrop, gift or
        mining reward — changes the treatment. Consult a chartered accountant before filing.
      </p>
    </main>
  );
}
