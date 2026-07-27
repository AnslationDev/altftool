"use client";

import { useMemo, useState } from "react";
import { Banknote, Check, CircleCheckBig, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import { checkCashReportingThresholds } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FIELDS = [
  {
    key: "savingsCashDeposits",
    id: "cdr-savings",
    label: "Cash deposited into savings accounts (year total)",
  },
  {
    key: "currentAccountCash",
    id: "cdr-current",
    label: "Cash deposited plus withdrawn in current accounts",
  },
  { key: "timeDeposits", id: "cdr-td", label: "New fixed / time deposits opened (any mode)" },
  {
    key: "draftsPurchasedInCash",
    id: "cdr-dd",
    label: "Demand drafts and prepaid instruments bought with cash",
  },
  { key: "creditCardCash", id: "cdr-cc-cash", label: "Credit card bills paid in cash" },
  {
    key: "creditCardOtherMode",
    id: "cdr-cc-other",
    label: "Credit card bills paid by other modes",
  },
  { key: "cashWithdrawals", id: "cdr-wd", label: "Cash withdrawn from all bank accounts" },
  {
    key: "largestSingleDayCashDeposit",
    id: "cdr-day",
    label: "Largest cash deposit made on one day",
  },
  {
    key: "largestSingleCashReceipt",
    id: "cdr-269st",
    label: "Largest cash sum received from one person in a day",
  },
];

const DEFAULTS = {
  savingsCashDeposits: "1200000",
  currentAccountCash: "0",
  timeDeposits: "0",
  draftsPurchasedInCash: "0",
  creditCardCash: "0",
  creditCardOtherMode: "0",
  cashWithdrawals: "600000",
  largestSingleDayCashDeposit: "80000",
  largestSingleCashReceipt: "0",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [filedItr, setFiledItr] = useState(true);
  const [isCoOperative, setIsCoOperative] = useState(false);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(
    () =>
      checkCashReportingThresholds({
        savingsCashDeposits: toNumber(values.savingsCashDeposits),
        currentAccountCash: toNumber(values.currentAccountCash),
        timeDeposits: toNumber(values.timeDeposits),
        draftsPurchasedInCash: toNumber(values.draftsPurchasedInCash),
        creditCardCash: toNumber(values.creditCardCash),
        creditCardOtherMode: toNumber(values.creditCardOtherMode),
        cashWithdrawals: toNumber(values.cashWithdrawals),
        largestSingleDayCashDeposit: toNumber(values.largestSingleDayCashDeposit),
        largestSingleCashReceipt: toNumber(values.largestSingleCashReceipt),
        filedItr,
        isCoOperative,
      }),
    [values, filedItr, isCoOperative],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Cash Deposit Reporting Threshold Checker",
      `Verdict: ${result.headline}`,
      `Thresholds crossed: ${result.crossedCount} of ${result.totalChecks}`,
      `Total cash deposited: ${money(result.totalCashDeposited)}`,
      `Cash withdrawn: ${money(result.cashWithdrawals)}`,
      `Section 194N TDS: ${money(result.tds194n.tds)} (${result.tds194n.rateNote})`,
    ];
    result.checks
      .filter((check) => check.crossed)
      .forEach((check) => lines.push(`• ${check.label} — ${check.rule}`));
    return lines.join("\n");
  }, [hasError, result]);

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
    setValues(DEFAULTS);
    setFiledItr(true);
    setIsCoOperative(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Banknote className="h-4 w-4" aria-hidden="true" />
          Banking India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cash Deposit Reporting Threshold Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter a financial year of cash banking and see which Rule 114E reporting limits, PAN
          quoting rules and section 194N withdrawal thresholds you cross — the entries that show up
          in your Annual Information Statement.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your financial year figures (INR)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={values[field.key]}
                onChange={setField(field.key)}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3">
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            htmlFor="cdr-itr"
          >
            <input
              id="cdr-itr"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={filedItr}
              onChange={(event) => setFiledItr(event.target.checked)}
            />
            <span>I have filed my income tax returns for the last three years</span>
          </label>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            htmlFor="cdr-coop"
          >
            <input
              id="cdr-coop"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={isCoOperative}
              onChange={(event) => setIsCoOperative(event.target.checked)}
            />
            <span>The account holder is a co-operative society (₹3 crore section 194N limit)</span>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Thresholds crossed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.crossedCount} of ${result.totalChecks}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the verdict." : result.headline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cash deposit reporting result"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["Total cash deposited in the year", hasError ? DASH : money(result.totalCashDeposited)],
            ["Total cash withdrawn in the year", hasError ? DASH : money(result.cashWithdrawals)],
            [
              "Section 194N threshold that applies to you",
              hasError ? DASH : money(result.tds194n.threshold),
            ],
            [
              "Withdrawal amount liable to section 194N TDS",
              hasError ? DASH : money(result.tds194n.taxable),
            ],
            ["Section 194N TDS the bank must deduct", hasError ? DASH : money(result.tds194n.tds)],
            [
              "Section 271DA penalty exposure",
              hasError ? DASH : result.breach269st ? money(result.penalty269st) : "None",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Every threshold, checked</h2>
          <ul className="mt-4 grid gap-3">
            {result.checks.map((check) => (
              <li
                key={check.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0" aria-hidden="true">
                    {check.crossed ? (
                      <TriangleAlert className="h-5 w-5 text-[var(--danger)]" />
                    ) : (
                      <CircleCheckBig className="h-5 w-5 text-[var(--success)]" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {check.label}
                      <span className="ml-2 text-xs font-medium text-[var(--muted-foreground)]">
                        {check.crossed ? "Crossed" : "Within limit"}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {money(check.amount)} against a limit of {money(check.threshold)}
                      {check.inclusive ? " or more" : " (exceeding)"} · {check.rule}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                      {check.consequence}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Crossing a Rule 114E limit is not by itself wrongdoing —
        it simply means the transaction is reported and should reconcile with your return. Speak to a
        chartered accountant about your own position.
      </p>
    </main>
  );
}
