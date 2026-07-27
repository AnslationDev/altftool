"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tag } from "lucide-react";

import { CURRENCIES, assessSouvenirPrice } from "../lib";

const DEFAULTS = {
  item: "Hand-block printed scarf",
  quoted: "1200",
  observed: "400, 450, 500, 600, 900",
  quantity: "2",
  currency: "INR",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const VERDICT_TONE = {
  bargain: "text-[var(--success)]",
  fair: "text-[var(--success)]",
  premium: "text-[var(--primary)]",
  tourist: "text-[var(--danger)]",
  inflated: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [item, setItem] = useState(DEFAULTS.item);
  const [quoted, setQuoted] = useState(DEFAULTS.quoted);
  const [observed, setObserved] = useState(DEFAULTS.observed);
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessSouvenirPrice({
        quotedPrice: Number(String(quoted).replace(/,/g, "").trim()),
        observedPrices: observed,
        quantity: Number(String(quantity).trim()),
      }),
    [quoted, observed, quantity],
  );

  const money = useMemo(() => {
    const entry = CURRENCIES.find((option) => option.code === currency) ?? CURRENCIES[0];
    const formatter = new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.code,
      maximumFractionDigits: 0,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : DASH);
  }, [currency]);

  const pct = useMemo(() => {
    const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
    return (value) => (Number.isFinite(value) ? `${value > 0 ? "+" : ""}${formatter.format(value)}%` : DASH);
  }, []);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Souvenir price check${item.trim() ? ` — ${item.trim()}` : ""}`,
      `Quoted: ${money(result.quoted)} per piece`,
      `Local prices recorded (${result.sampleSize}): low ${money(result.low)}, median ${money(result.median)}, high ${money(result.high)}`,
      `Verdict: ${result.verdict} (${pct(result.markupOverMedian)} vs local median)`,
      `Open the haggle at ${money(result.openingCounter)}, aim for ${money(result.targetPrice)}`,
      `Walk away above ${money(result.walkAwayAbove)}`,
      `For ${result.units} piece(s): quoted ${money(result.quotedTotal)} vs local median total ${money(result.fairTotal)}`,
    ].join("\n");
  }, [ok, item, money, pct, result]);

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
    setItem(DEFAULTS.item);
    setQuoted(DEFAULTS.quoted);
    setObserved(DEFAULTS.observed);
    setQuantity(DEFAULTS.quantity);
    setCurrency(DEFAULTS.currency);
    setCopied(false);
  };

  const rows = [
    ["Quoted price, per piece", ok ? money(result.quoted) : DASH],
    ["Cheapest you recorded", ok ? money(result.low) : DASH],
    ["Local median", ok ? money(result.median) : DASH],
    ["Dearest you recorded", ok ? money(result.high) : DASH],
    ["Markup over the local median", ok ? pct(result.markupOverMedian) : DASH],
    ["Markup over the cheapest seen", ok ? pct(result.markupOverLow) : DASH],
    ["Extra you would pay per piece", ok ? money(result.overpayPerUnit) : DASH],
    [`Extra for ${ok ? result.units : DASH} piece(s)`, ok ? money(result.overpayTotal) : DASH],
    ["Total at the quoted price", ok ? money(result.quotedTotal) : DASH],
    ["Total at the local median", ok ? money(result.fairTotal) : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tag className="h-4 w-4" aria-hidden="true" />
          Market haggling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Souvenir Price Fairness Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Note the prices you saw for the same item at other stalls, then test the price you have just
          been quoted against the median of your own sample.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="souvenir-item">
              What are you buying? (optional)
            </label>
            <input
              id="souvenir-item"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={item}
              onChange={(event) => setItem(event.target.value)}
              placeholder="Hand-block printed scarf"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="souvenir-quoted">
              Price quoted to you, per piece
            </label>
            <input
              id="souvenir-quoted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={quoted}
              onChange={(event) => setQuoted(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="souvenir-currency">
              Currency
            </label>
            <select
              id="souvenir-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.code} — {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="souvenir-observed">
              Prices you saw elsewhere for the same item
            </label>
            <textarea
              id="souvenir-observed"
              className={`mt-2 ${AREA_CLASS}`}
              value={observed}
              onChange={(event) => setObserved(event.target.value)}
              placeholder="400, 450, 500, 600, 900"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Separate with commas, spaces or new lines. Three or more makes the median meaningful.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="souvenir-qty">
              How many pieces
            </label>
            <input
              id="souvenir-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error && (
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
              Verdict on the quote
            </p>
            <p
              className={`mt-1 text-3xl font-semibold sm:text-4xl ${
                ok ? VERDICT_TONE[result.bandKey] : "text-[var(--muted-foreground)]"
              }`}
            >
              {ok ? result.verdict : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money(result.quoted)} against a local median of ${money(result.median)} from ${result.sampleSize} price(s) you recorded`
                : "Fix the inputs above to see a verdict."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the souvenir price check"
              className={GHOST_BTN}
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

        {ok && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.advice}
            {result.thinSample
              ? " You recorded fewer than three prices, so treat this as a rough read rather than a local going rate."
              : ""}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your negotiating numbers</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            ["Open at", ok ? money(result.openingCounter) : DASH, "the cheapest price you actually saw"],
            ["Aim to settle at", ok ? money(result.targetPrice) : DASH, "the median of your recorded prices"],
            ["Walk away above", ok ? money(result.walkAwayAbove) : DASH, "10% over the dearest price you saw"],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
              <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">{value}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This compares a quote against prices you recorded yourself — it has no price database. Genuine
        differences in materials, craftsmanship, size and provenance can justify a higher price, and
        in many places bargaining is expected on some goods and considered rude on others.
      </p>
    </main>
  );
}
