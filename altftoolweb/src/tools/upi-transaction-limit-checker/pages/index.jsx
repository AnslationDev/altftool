"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smartphone } from "lucide-react";

import {
  COMMON_BANK_CAPS,
  DAILY_TRANSACTION_COUNT,
  PAYMENT_CATEGORIES,
  checkUpiLimit,
  limitTable,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  amount: "60000",
  category: "p2p",
  bankPerTransactionCap: "100000",
  bankDailyCap: "100000",
  spentToday: "50000",
  transactionsToday: "3",
  newAccount: false,
};

const NUMBER_FIELDS = [
  ["amount", "Amount you want to pay", "100"],
  ["bankPerTransactionCap", "Your bank's per-payment cap (0 if unknown)", "1000"],
  ["bankDailyCap", "Your bank's daily cap (0 if unknown)", "1000"],
  ["spentToday", "Already sent through UPI today", "500"],
  ["transactionsToday", "UPI payments already made today", "1"],
];

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const TABLE = limitTable();

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setState((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    const parsed = {};
    for (const [key] of NUMBER_FIELDS) {
      const value = toNumber(state[key]);
      if (Number.isNaN(value)) return { error: "Fill every amount with a valid number." };
      parsed[key] = value;
    }
    return checkUpiLimit({ ...parsed, category: state.category, newAccount: state.newAccount });
  }, [state]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "UPI Transaction Limit Check",
      `Category: ${result.categoryLabel}`,
      `Amount: ${money(result.amount)}`,
      `Verdict: ${result.willGoThrough ? "Should go through" : "Will be declined"}`,
      `Binding per-payment limit: ${money(result.perTransactionLimit)} (${result.perTransactionSource})`,
      `Binding daily limit: ${money(result.dailyLimit)} (${result.dailySource})`,
      `Left of today's quota: ${money(result.dailyRemaining)}`,
      result.countRemaining === null
        ? "Transaction count: not counted on this rail"
        : `Transactions left today: ${result.countRemaining} of ${result.countLimit}`,
      ...(result.willGoThrough ? [] : result.blockers.map((item) => `- ${item}`)),
      ...(result.willGoThrough || !result.splitFits
        ? []
        : [`Workaround: split into ${result.splitsNeeded} payments of about ${money(result.splitAmount)}`]),
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
    setState(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          NPCI and bank caps
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          UPI Transaction Limit Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Three ceilings apply to every UPI payment — the NPCI category cap, your bank's own cap and
          what is left of today's quota. This tells you which one binds, whether the payment will go
          through, and how much room you have left.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="upi-category">
              What is the payment for?
            </label>
            <select
              id="upi-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.category}
              onChange={(event) => setField("category", event.target.value)}
            >
              {PAYMENT_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          {NUMBER_FIELDS.map(([key, label, step]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`upi-${key}`}>
                {label}
              </label>
              <input
                id={`upi-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={state[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
              {key === "bankDailyCap" && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {COMMON_BANK_CAPS.map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => {
                        setField("bankDailyCap", String(cap));
                        setField("bankPerTransactionCap", String(cap));
                      }}
                      className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {money(cap)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="upi-new"
            >
              <input
                id="upi-new"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.newAccount}
                onChange={(event) => setField("newAccount", event.target.checked)}
              />
              Account linked in the last 24 hours
            </label>
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
              Binding limit for this payment
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.perTransactionLimit) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.perTransactionSource} · ${result.willGoThrough ? "this payment should go through" : "this payment will be declined"}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy UPI limit check result"
              className={`${GHOST_BTN} disabled:opacity-40`}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["NPCI cap for this category", ok ? `${money(result.npciPerTransaction)} per payment` : "—"],
            ["Binding daily limit", ok ? `${money(result.dailyLimit)} (${result.dailySource})` : "—"],
            ["Already sent today", ok ? money(result.spentToday) : "—"],
            ["Left of today's quota", ok ? money(result.dailyRemaining) : "—"],
            [
              "Transactions left today",
              ok
                ? result.countRemaining === null
                  ? "Not counted on this rail"
                  : `${result.countRemaining} of ${result.countLimit}`
                : "—",
            ],
            [
              "Quota left if this payment succeeds",
              ok && result.willGoThrough ? money(result.dailyRemainingAfter) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && !result.willGoThrough && (
          <ul className="mt-4 grid gap-2 text-sm leading-6">
            {result.blockers.map((item) => (
              <li key={item} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {item}
              </li>
            ))}
            {result.splitFits && result.splitsNeeded > 1 && (
              <li className="rounded-md bg-[var(--muted)] px-3 py-2">
                You could split it into {result.splitsNeeded} payments of about{" "}
                {money(result.splitAmount)}, which fits inside today's remaining quota.
              </li>
            )}
          </ul>
        )}

        {ok && (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">{result.categoryNote}</p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Published ceilings by payment type</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Your bank may set a lower figure inside any of these. Bank-account payments also share the
          NPCI count of {DAILY_TRANSACTION_COUNT} transactions per account per day.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Payment type</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Per payment</th>
                <th scope="col" className="py-2 text-right font-semibold">Per day</th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((row) => (
                <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{money(row.perTransaction)}</td>
                  <td className="py-2 text-right font-semibold">{money(row.perDay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        NPCI and the RBI revise these ceilings from time to time, and banks change their own caps
        without notice. Check the limit shown inside your bank's app or net banking before relying on
        a large payment going through.
      </p>
    </main>
  );
}
