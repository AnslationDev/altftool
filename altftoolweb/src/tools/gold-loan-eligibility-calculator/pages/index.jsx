"use client";

import { useMemo, useState } from "react";
import { Check, Coins, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

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

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const KARAT_OPTIONS = [
  { karat: 24, label: "24K (99.9% pure)" },
  { karat: 23, label: "23K (95.8%)" },
  { karat: 22, label: "22K (91.6% — most jewellery)" },
  { karat: 21, label: "21K (87.5%)" },
  { karat: 20, label: "20K (83.3%)" },
  { karat: 18, label: "18K (75.0%)" },
  { karat: 14, label: "14K (58.5%)" },
];

const DEFAULT_ITEMS = [
  { id: 1, label: "Bangles", grams: "40", karat: 22, stones: "0" },
  { id: 2, label: "Chain", grams: "18", karat: 18, stones: "1.5" },
];

const DEFAULTS = { rate24k: "9800", ltv: "75", interest: "9.5", months: "12" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

function computeEmi(principal, annualRate, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

export default function ToolHome() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [rate24k, setRate24k] = useState(DEFAULTS.rate24k);
  const [ltv, setLtv] = useState(DEFAULTS.ltv);
  const [interest, setInterest] = useState(DEFAULTS.interest);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [copied, setCopied] = useState(false);

  const updateItem = (id, patch) =>
    setItems((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addItem = () =>
    setItems((rows) => [
      ...rows,
      { id: (rows.at(-1)?.id ?? 0) + 1, label: `Item ${rows.length + 1}`, grams: "10", karat: 22, stones: "0" },
    ]);

  const removeItem = (id) =>
    setItems((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  const calc = useMemo(() => {
    const rate = toNumber(rate24k);
    const ltvPct = toNumber(ltv);
    const rateInterest = toNumber(interest);
    const tenure = toNumber(months);

    if ([rate, ltvPct, rateInterest, tenure].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers for gold rate, LTV, interest and tenure." };
    }
    if (rate <= 0) return { error: "Enter today's 24K gold rate per gram (a positive number)." };
    if (ltvPct <= 0 || ltvPct > 100) return { error: "LTV must be between 1% and 100%." };
    if (rateInterest < 0 || rateInterest > 60) {
      return { error: "Interest rate should be between 0% and 60% per year." };
    }
    if (tenure <= 0 || tenure > 60) return { error: "Gold loan tenure is usually 3 to 36 months." };

    const parsed = [];
    for (const row of items) {
      const grams = toNumber(row.grams);
      const stones = toNumber(row.stones);
      if (Number.isNaN(grams) || Number.isNaN(stones)) {
        return { error: `Check the weights entered for "${row.label || "your item"}".` };
      }
      if (grams < 0 || stones < 0) return { error: "Weights cannot be negative." };
      if (stones > grams) {
        return { error: `Stone weight cannot exceed the gross weight of "${row.label || "your item"}".` };
      }
      const netGrams = grams - stones;
      const purity = row.karat / 24;
      const pureGrams = netGrams * purity;
      parsed.push({
        ...row,
        netGrams,
        pureGrams,
        purity,
        value: pureGrams * rate,
      });
    }

    const grossGrams = parsed.reduce((sum, row) => sum + toNumber(row.grams), 0);
    const netGrams = parsed.reduce((sum, row) => sum + row.netGrams, 0);
    const pureGrams = parsed.reduce((sum, row) => sum + row.pureGrams, 0);
    const goldValue = parsed.reduce((sum, row) => sum + row.value, 0);

    if (!(netGrams > 0)) {
      return { error: "Add at least one item with a net gold weight above zero." };
    }

    const eligible = (goldValue * ltvPct) / 100;
    const perGram = eligible / netGrams;
    const blendedKarat = (pureGrams / netGrams) * 24;
    const tenureMonths = Math.round(tenure);
    const emi = computeEmi(eligible, rateInterest, tenureMonths);
    const emiTotal = emi * tenureMonths;
    const monthlyInterest = (eligible * rateInterest) / 12 / 100;
    const bulletInterest = (eligible * rateInterest * tenureMonths) / 12 / 100;

    return {
      parsed,
      grossGrams,
      netGrams,
      pureGrams,
      goldValue,
      eligible,
      perGram,
      blendedKarat,
      tenureMonths,
      emi,
      emiInterest: emiTotal - eligible,
      monthlyInterest,
      bulletInterest,
      ltvPct,
      overCap: ltvPct > 75,
    };
  }, [items, rate24k, ltv, interest, months]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Gold Loan Eligibility",
      `Gross weight: ${num(calc.grossGrams)} g`,
      `Net gold weight (after stones): ${num(calc.netGrams)} g`,
      `Pure gold equivalent (24K): ${num(calc.pureGrams)} g`,
      `24K rate used: ${money2(toNumber(rate24k))} per gram`,
      `Gold value: ${money(calc.goldValue)}`,
      `LTV applied: ${num(calc.ltvPct)}%`,
      `Eligible loan amount: ${money(calc.eligible)}`,
      `Loan value per net gram: ${money2(calc.perGram)}`,
      `EMI for ${calc.tenureMonths} months: ${money(calc.emi)}`,
      `Interest-only option: ${money(calc.monthlyInterest)} per month`,
    ].join("\n");
  }, [calc, rate24k]);

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
    setItems(DEFAULT_ITEMS);
    setRate24k(DEFAULTS.rate24k);
    setLtv(DEFAULTS.ltv);
    setInterest(DEFAULTS.interest);
    setMonths(DEFAULTS.months);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coins className="h-4 w-4" aria-hidden="true" />
          Gold loan
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gold Loan Eligibility Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter each piece of jewellery with its weight and karat purity. The tool converts it to
          pure-gold equivalent, values it at today&apos;s 24K rate and applies the lender&apos;s
          loan-to-value cap to show what you can actually borrow.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your gold</h2>
        <div className="mt-4 space-y-4">
          {items.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`gold-label-${row.id}`}>
                    Item name
                  </label>
                  <input
                    id={`gold-label-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.label}
                    onChange={(event) => updateItem(row.id, { label: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`gold-grams-${row.id}`}>
                    Gross weight (grams)
                  </label>
                  <input
                    id={`gold-grams-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={row.grams}
                    onChange={(event) => updateItem(row.id, { grams: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`gold-karat-${row.id}`}>
                    Purity
                  </label>
                  <select
                    id={`gold-karat-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.karat}
                    onChange={(event) => updateItem(row.id, { karat: Number(event.target.value) })}
                  >
                    {KARAT_OPTIONS.map((option) => (
                      <option key={option.karat} value={option.karat}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`gold-stones-${row.id}`}>
                    Stones / beads weight (grams)
                  </label>
                  <input
                    id={`gold-stones-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={row.stones}
                    onChange={(event) => updateItem(row.id, { stones: event.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(row.id)}
                    disabled={items.length === 1}
                    aria-label={`Remove ${row.label || `item ${index + 1}`}`}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addItem} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another item
        </button>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gold-rate">
              24K gold rate today (INR per gram)
            </label>
            <input
              id="gold-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={rate24k}
              onChange={(event) => setRate24k(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gold-ltv">
              Loan-to-value cap (%)
            </label>
            <input
              id="gold-ltv"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={ltv}
              onChange={(event) => setLtv(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gold-interest">
              Interest rate (% per year)
            </label>
            <input
              id="gold-interest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gold-months">
              Tenure (months)
            </label>
            <input
              id="gold-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Eligible loan amount
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.eligible)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {num(calc.ltvPct)}% LTV on {num(calc.netGrams)} g of net gold
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy gold loan eligibility result"
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

            {calc.overCap && (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                Most regulated lenders cap gold loan LTV at 75% of the gold value. An LTV above that
                is unlikely to be sanctioned.
              </p>
            )}

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Gross weight submitted", `${num(calc.grossGrams)} g`],
                ["Net gold weight (stones deducted)", `${num(calc.netGrams)} g`],
                ["Pure gold equivalent (24K)", `${num(calc.pureGrams)} g`],
                ["Average purity of the lot", `${num(calc.blendedKarat)} K`],
                ["Market value of your gold", money(calc.goldValue)],
                ["Loan value per net gram", money2(calc.perGram)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Repayment options over {calc.tenureMonths} months</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Regular EMI
                </p>
                <p className="mt-1 text-2xl font-semibold">{money(calc.emi)}<span className="text-sm font-normal text-[var(--muted-foreground)]"> /month</span></p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Total interest {money(calc.emiInterest)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Interest-only, principal at maturity
                </p>
                <p className="mt-1 text-2xl font-semibold">{money(calc.monthlyInterest)}<span className="text-sm font-normal text-[var(--muted-foreground)]"> /month</span></p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Then {money(calc.eligible)} principal at the end · total interest {money(calc.bulletInterest)}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Item-wise valuation</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Net g</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">24K equiv.</th>
                    <th scope="col" className="py-2 text-right font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.parsed.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {row.label || "Item"}
                        <span className="ml-1 font-normal text-[var(--muted-foreground)]">{row.karat}K</span>
                      </td>
                      <td className="py-2 pr-3 text-right">{num(row.netGrams)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{num(row.pureGrams)}</td>
                      <td className="py-2 text-right">{money(row.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Lenders value gold on their own reference rate (often a 30-day
        average of 22K prices), deduct stones and impurities after in-branch testing, and add
        valuation, processing and renewal charges. Your sanctioned amount can differ.
      </p>
    </main>
  );
}
