"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileSignature, RotateCcw } from "lucide-react";

import { RECOVERY_TYPES, REFERENCE_NOTES, computeBondLiability } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  amount: "200000",
  months: "36",
  served: "12",
  recovery: "pro-rata",
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [served, setServed] = useState(DEFAULTS.served);
  const [recovery, setRecovery] = useState(DEFAULTS.recovery);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBondLiability({
        bondAmount: amount.trim() === "" ? Number.NaN : Number(amount),
        bondMonths: months.trim() === "" ? Number.NaN : Number(months),
        servedMonths: served.trim() === "" ? 0 : Number(served),
        recoveryType: recovery,
      }),
    [amount, months, served, recovery],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Service bond liability estimate",
      `Bond: ${INR.format(result.bondAmount)} over ${NUM.format(result.bondMonths)} months`,
      `Served: ${NUM.format(result.servedMonths)} months (${result.percentServed}%)`,
      `Recovery model: ${recovery === "full" ? "full amount" : "pro-rata"}`,
      `Payable on leaving now: ${INR.format(result.payable)}`,
    ].join("\n");
  }, [hasError, result, recovery]);

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
    setAmount(DEFAULTS.amount);
    setMonths(DEFAULTS.months);
    setServed(DEFAULTS.served);
    setRecovery(DEFAULTS.recovery);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Bond period", DASH],
        ["Months served", DASH],
        ["Months remaining", DASH],
        ["Payable now", DASH],
      ]
    : [
        ["Bond amount", INR.format(result.bondAmount)],
        ["Bond period", `${NUM.format(result.bondMonths)} months`],
        ["Months served", `${NUM.format(result.servedMonths)} (${result.percentServed}%)`],
        ["Months remaining", NUM.format(result.remainingMonths)],
        [
          "Status",
          result.completed ? "Bond period completed — nothing payable" : "Bond still running",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileSignature className="h-4 w-4" aria-hidden="true" />
          Job preference
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Probation And Bond Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Know what probation and a service bond actually commit you to before accepting a post —
          and estimate what leaving early would cost under your bond clause.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Bond liability calculator</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pb-amount">
              Bond amount (INR)
            </label>
            <input
              id="pb-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pb-months">
              Bond period (months)
            </label>
            <input
              id="pb-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pb-served">
              Months already served
            </label>
            <input
              id="pb-served"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={served}
              onChange={(event) => setServed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pb-recovery">
              Recovery model in your bond clause
            </label>
            <select
              id="pb-recovery"
              className={`mt-2 ${INPUT_CLASS}`}
              value={recovery}
              onChange={(event) => setRecovery(event.target.value)}
            >
              {RECOVERY_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Payable if you leave now
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : INR.format(result.payable)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the estimate."
                : recovery === "pro-rata"
                  ? "Pro-rata clause: bond amount × months remaining ÷ bond period."
                  : "Full-recovery clause: the whole bond amount is payable while any part of the period is unserved."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the bond liability estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

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
        <h2 className="text-base font-semibold">What probation and bonds actually mean</h2>
        <div className="mt-3 space-y-3">
          {REFERENCE_NOTES.map((note) => (
            <details
              key={note.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <summary className="min-h-11 cursor-pointer list-none py-1 text-sm font-semibold marker:hidden">
                {note.title}
              </summary>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{note.body}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Bond amounts, periods and recovery models are set by
        each employer&apos;s appointment terms — read your own appointment letter and bond text, and
        consult a lawyer before acting on an exit decision.
      </p>
    </main>
  );
}
