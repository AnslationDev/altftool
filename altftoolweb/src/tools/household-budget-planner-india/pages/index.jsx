"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wallet } from "lucide-react";

import {
  BUDGET_LINES,
  computeHouseholdBudget,
  NEEDS_TARGET_SHARE,
  SAVINGS_TARGET_SHARE,
  suggestBudget,
  WANTS_TARGET_SHARE,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_INCOME = "95000";
const DEFAULT_OTHER = "0";
const DEFAULT_LINES = {
  rent: "24000",
  otherEmi: "8000",
  groceries: "11000",
  utilities: "4500",
  transport: "4000",
  education: "6000",
  healthcare: "1500",
  insurance: "3000",
  helpAndMaintenance: "2500",
  diningOut: "4000",
  shopping: "3500",
  entertainment: "1200",
  travel: "2500",
  giftsAndFestivals: "1500",
  savings: "14000",
  emergencyFund: "4000",
};

const BUCKET_META = {
  needs: { title: "Needs", hint: `50/30/20 target: ${NEEDS_TARGET_SHARE}% of income` },
  wants: { title: "Wants", hint: `50/30/20 target: ${WANTS_TARGET_SHARE}% of income` },
  savings: { title: "Savings and investing", hint: `50/30/20 target: at least ${SAVINGS_TARGET_SHARE}%` },
};

const STATUS_CLASS = {
  good: "text-[var(--success)]",
  watch: "text-[var(--warning)]",
  over: "text-[var(--danger)]",
};

const STATUS_LABEL = { good: "On track", watch: "Watch", over: "Off track" };

const emptyLines = () =>
  BUDGET_LINES.reduce((accumulator, line) => {
    accumulator[line.key] = "0";
    return accumulator;
  }, {});

export default function ToolHome() {
  const [income, setIncome] = useState(DEFAULT_INCOME);
  const [otherIncome, setOtherIncome] = useState(DEFAULT_OTHER);
  const [lines, setLines] = useState(DEFAULT_LINES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeHouseholdBudget({
        netMonthlyIncome: income,
        otherMonthlyIncome: otherIncome,
        lines,
      }),
    [income, otherIncome, lines],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Household Budget Planner India",
      `Total monthly income: ${money(result.totalIncome)}`,
      `Needs: ${money(result.needs)} (${pct(result.needsShare)})`,
      `Wants: ${money(result.wants)} (${pct(result.wantsShare)})`,
      `Savings and investing: ${money(result.savings)} (${pct(result.savingsShare)})`,
      `Housing cost: ${money(result.housing)} (${pct(result.housingShare)})`,
      `All EMIs (FOIR): ${money(result.emiTotal)} (${pct(result.foir)})`,
      `Unallocated left over: ${money(result.unallocated)}`,
    ].join("\n");
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
    setIncome(DEFAULT_INCOME);
    setOtherIncome(DEFAULT_OTHER);
    setLines(DEFAULT_LINES);
    setCopied(false);
  };

  const clearAll = () => {
    setLines(emptyLines());
    setCopied(false);
  };

  const applySuggestion = () => {
    const totalIncome = Number(income || 0) + Number(otherIncome || 0);
    const suggestion = suggestBudget(totalIncome);
    if (suggestion.error) return;
    const next = emptyLines();
    // Spread the 50/30/20 targets across representative lines in each bucket.
    next.rent = String(Math.round(suggestion.needs * 0.5));
    next.groceries = String(Math.round(suggestion.needs * 0.25));
    next.utilities = String(Math.round(suggestion.needs * 0.15));
    next.transport = String(Math.round(suggestion.needs * 0.1));
    next.diningOut = String(Math.round(suggestion.wants * 0.4));
    next.shopping = String(Math.round(suggestion.wants * 0.3));
    next.travel = String(Math.round(suggestion.wants * 0.3));
    next.savings = String(Math.round(suggestion.savings * 0.75));
    next.emergencyFund = String(Math.round(suggestion.savings * 0.25));
    setLines(next);
    setCopied(false);
  };

  const setLine = (key, value) => {
    setLines((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Wallet className="h-4 w-4" aria-hidden="true" />
          Monthly budget
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Household Budget Planner India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your take-home pay and every rupee that goes out each month. The planner splits it
          into needs, wants and savings, then checks it against the 50/30/20 rule, the 30% housing
          guideline and the 40% FOIR limit lenders use.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Monthly income</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hb-income">
              Net take-home pay (INR)
            </label>
            <input
              id="hb-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={income}
              onChange={(event) => {
                setIncome(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hb-other">
              Other monthly income (INR)
            </label>
            <input
              id="hb-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={otherIncome}
              onChange={(event) => {
                setOtherIncome(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={applySuggestion} className={GHOST_BTN}>
            Fill a 50/30/20 starting plan
          </button>
          <button type="button" onClick={clearAll} className={GHOST_BTN}>
            Clear all expenses
          </button>
        </div>
      </section>

      {["needs", "wants", "savings"].map((bucket) => (
        <section
          key={bucket}
          className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        >
          <h2 className="text-base font-semibold">{BUCKET_META[bucket].title}</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{BUCKET_META[bucket].hint}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {BUDGET_LINES.filter((line) => line.bucket === bucket).map((line) => (
              <div key={line.key}>
                <label className={LABEL_CLASS} htmlFor={`hb-${line.key}`}>
                  {line.label}
                </label>
                <input
                  id={`hb-${line.key}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="500"
                  value={lines[line.key] ?? "0"}
                  onChange={(event) => setLine(line.key, event.target.value)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Left unallocated each month
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.unallocated < 0
                    ? "text-[var(--danger)]"
                    : "text-[var(--primary)]"
              }`}
            >
              {hasError ? dash : money(result.unallocated)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your budget."
                : result.unallocated < 0
                  ? "You have planned more than you earn — trim a line or raise income."
                  : "Money not yet given a job. Assign it to savings so it does not drift away."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy household budget summary"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the budget to the sample plan"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total monthly income", hasError ? dash : money(result.totalIncome)],
            [
              "Needs",
              hasError ? dash : `${money(result.needs)} (${pct(result.needsShare)})`,
            ],
            ["Wants", hasError ? dash : `${money(result.wants)} (${pct(result.wantsShare)})`],
            [
              "Savings and investing",
              hasError ? dash : `${money(result.savings)} (${pct(result.savingsShare)})`,
            ],
            ["Total spending (needs + wants)", hasError ? dash : money(result.totalSpending)],
            ["Housing cost", hasError ? dash : `${money(result.housing)} (${pct(result.housingShare)})`],
            ["All EMIs (FOIR)", hasError ? dash : `${money(result.emiTotal)} (${pct(result.foir)})`],
            [
              "Surplus before savings",
              hasError ? dash : money(result.surplus),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div
            className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`Needs ${pct(result.needsShare)}, wants ${pct(result.wantsShare)}, savings ${pct(result.savingsShare)} of income`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(0, Math.min(100, result.needsShare))}%` }}
            />
            <span
              className="block h-full bg-[var(--warning)]"
              style={{ width: `${Math.max(0, Math.min(100, result.wantsShare))}%` }}
            />
            <span
              className="block h-full bg-[var(--success)]"
              style={{ width: `${Math.max(0, Math.min(100, result.savingsShare))}%` }}
            />
          </div>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Ratio health check</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Ratio
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Yours
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Target
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ratios.map((ratio) => (
                  <tr key={ratio.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{ratio.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{pct(ratio.value)}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{ratio.target}</td>
                    <td className={`py-2 text-right font-semibold ${STATUS_CLASS[ratio.status]}`}>
                      {STATUS_LABEL[ratio.status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-sm font-semibold">Where the money goes</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Line
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Amount
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    % of income
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.detail.map((line) => (
                  <tr key={line.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{line.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(line.amount)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {pct(line.shareOfIncome)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning tool only. The 50/30/20 split and the 40% FOIR line are widely used
        rules of thumb, not rules of law — a family paying for elder care or living in Mumbai will
        legitimately run higher needs. Speak to a SEBI-registered investment adviser before making
        large financial commitments.
      </p>
    </main>
  );
}
