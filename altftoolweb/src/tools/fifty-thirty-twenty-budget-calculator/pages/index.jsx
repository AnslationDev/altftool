"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PieChart, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  income: 80000,
  needs: 46000,
  wants: 20000,
  savings: 10000,
};

const SPLITS = [
  { id: "50-30-20", label: "50 / 30 / 20", needs: 50, wants: 30, savings: 20 },
  { id: "60-20-20", label: "60 / 20 / 20", needs: 60, wants: 20, savings: 20 },
  { id: "70-20-10", label: "70 / 20 / 10", needs: 70, wants: 20, savings: 10 },
  { id: "40-30-30", label: "40 / 30 / 30", needs: 40, wants: 30, savings: 30 },
];

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

/**
 * Splits take-home pay by the chosen rule and compares it with actual spending.
 * Returns targets, actuals, variance per bucket and the leftover / shortfall.
 */
export function computeBudgetSplit({ income, split, actualNeeds, actualWants, actualSavings }) {
  const targets = {
    needs: (income * split.needs) / 100,
    wants: (income * split.wants) / 100,
    savings: (income * split.savings) / 100,
  };
  const actuals = { needs: actualNeeds, wants: actualWants, savings: actualSavings };
  const allocated = actuals.needs + actuals.wants + actuals.savings;
  const unallocated = income - allocated;

  const buckets = ["needs", "wants", "savings"].map((key) => {
    const target = targets[key];
    const actual = actuals[key];
    const share = income > 0 ? (actual / income) * 100 : 0;
    const variance = actual - target;
    // Savings is the one bucket where spending "over" the target is good.
    const good = key === "savings" ? variance >= 0 : variance <= 0;
    return { key, target, actual, share, variance, good, targetShare: split[key] };
  });

  return { targets, actuals, allocated, unallocated, buckets };
}

const BUCKET_META = {
  needs: {
    title: "Needs",
    hint: "Rent/EMI, groceries, utilities, transport, school fees, insurance premiums",
  },
  wants: {
    title: "Wants",
    hint: "Eating out, travel, subscriptions, gadgets, hobbies, shopping",
  },
  savings: {
    title: "Savings & debt payoff",
    hint: "SIPs, PPF/EPF top-ups, emergency fund, extra loan prepayment",
  },
};

export default function ToolHome() {
  const [income, setIncome] = useState(String(DEFAULTS.income));
  const [splitId, setSplitId] = useState(SPLITS[0].id);
  const [needs, setNeeds] = useState(String(DEFAULTS.needs));
  const [wants, setWants] = useState(String(DEFAULTS.wants));
  const [savings, setSavings] = useState(String(DEFAULTS.savings));
  const [copied, setCopied] = useState(false);

  const split = SPLITS.find((item) => item.id === splitId) ?? SPLITS[0];

  const calc = useMemo(() => {
    const inc = toNumber(income);
    const n = toNumber(needs);
    const w = toNumber(wants);
    const s = toNumber(savings);

    if ([inc, n, w, s].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (inc <= 0) return { error: "Monthly take-home pay must be greater than zero." };
    if (inc > 100000000) return { error: "Monthly take-home pay looks too large — check the amount." };
    if ([n, w, s].some((value) => value < 0)) return { error: "Spending amounts cannot be negative." };

    return {
      income: inc,
      ...computeBudgetSplit({
        income: inc,
        split,
        actualNeeds: n,
        actualWants: w,
        actualSavings: s,
      }),
    };
  }, [income, needs, wants, savings, split]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    const lines = [
      `${split.label} Budget Rule`,
      `Monthly take-home pay: ${money(calc.income)}`,
      "",
      ...calc.buckets.map(
        (bucket) =>
          `${BUCKET_META[bucket.key].title} — target ${money(bucket.target)} (${bucket.targetShare}%), actual ${money(
            bucket.actual,
          )} (${pct(bucket.share)})`,
      ),
      "",
      `Allocated: ${money(calc.allocated)}`,
      calc.unallocated >= 0
        ? `Unallocated surplus: ${money(calc.unallocated)}`
        : `Overspent by: ${money(Math.abs(calc.unallocated))}`,
      `Annual savings at this rate: ${money(calc.actuals.savings * 12)}`,
    ];
    return lines.join("\n");
  }, [calc, split]);

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
    setIncome(String(DEFAULTS.income));
    setSplitId(SPLITS[0].id);
    setNeeds(String(DEFAULTS.needs));
    setWants(String(DEFAULTS.wants));
    setSavings(String(DEFAULTS.savings));
    setCopied(false);
  };

  const applyTargets = () => {
    if (calc.error) return;
    setNeeds(String(Math.round(calc.targets.needs)));
    setWants(String(Math.round(calc.targets.wants)));
    setSavings(String(Math.round(calc.targets.savings)));
    setCopied(false);
  };

  const barWidth = (value) => {
    if (calc.error || !(calc.income > 0)) return 0;
    return Math.max(0, Math.min(100, (value / calc.income) * 100));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PieChart className="h-4 w-4" aria-hidden="true" />
          Budget rule
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          50-30-20 Budget Rule Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split your take-home pay into needs, wants and savings, then enter what you actually spend
          to see exactly which bucket is pulling your budget off track.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="budget-income">
              Monthly take-home pay (INR)
            </label>
            <input
              id="budget-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              Use in-hand salary after tax, PF and professional tax.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="budget-split">
              Split rule
            </label>
            <select
              id="budget-split"
              className={`mt-2 ${INPUT_CLASS}`}
              value={splitId}
              onChange={(event) => setSplitId(event.target.value)}
            >
              {SPLITS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (needs / wants / savings)
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              50-30-20 is the classic rule; pick a tighter split if rent eats more.
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">What you actually spend each month</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="budget-needs">
              Needs (INR)
            </label>
            <input
              id="budget-needs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={needs}
              onChange={(event) => setNeeds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="budget-wants">
              Wants (INR)
            </label>
            <input
              id="budget-wants"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={wants}
              onChange={(event) => setWants(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="budget-savings">
              Savings &amp; extra debt payoff (INR)
            </label>
            <input
              id="budget-savings"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={savings}
              onChange={(event) => setSavings(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={applyTargets} className={`${GHOST_BTN} w-full`}>
              Use the {split.label} targets
            </button>
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
                  Savings target ({split.savings}% of pay)
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.targets.savings)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Needs {money(calc.targets.needs)} · Wants {money(calc.targets.wants)} per month
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy budget split result"
                  className={GHOST_BTN}
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

            <div className="mt-5 space-y-5">
              {calc.buckets.map((bucket) => (
                <div key={bucket.key}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">{BUCKET_META[bucket.key].title}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--foreground)]">
                        {money(bucket.actual)}
                      </span>{" "}
                      of {money(bucket.target)} target
                    </p>
                  </div>
                  <div
                    className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                    role="img"
                    aria-label={`${BUCKET_META[bucket.key].title}: ${pct(bucket.share)} of income against a ${
                      bucket.targetShare
                    }% target`}
                  >
                    <span
                      className={`block h-full ${
                        bucket.good ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                      }`}
                      style={{ width: `${barWidth(bucket.actual)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                    {pct(bucket.share)} of pay (target {bucket.targetShare}%) ·{" "}
                    <span
                      className={
                        bucket.good ? "text-[var(--success)]" : "font-semibold text-[var(--danger)]"
                      }
                    >
                      {bucket.key === "savings"
                        ? bucket.variance >= 0
                          ? `${money(bucket.variance)} above target`
                          : `${money(Math.abs(bucket.variance))} short of target`
                        : bucket.variance <= 0
                          ? `${money(Math.abs(bucket.variance))} under budget`
                          : `${money(bucket.variance)} over budget`}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {BUCKET_META[bucket.key].hint}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Month in numbers</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Take-home pay", money(calc.income)],
                ["Total allocated (needs + wants + savings)", money(calc.allocated)],
                [
                  calc.unallocated >= 0 ? "Unallocated surplus" : "Shortfall (spending exceeds pay)",
                  money(Math.abs(calc.unallocated)),
                ],
                ["Savings rate", pct(calc.buckets[2].share)],
                ["Savings in a year at this rate", money(calc.actuals.savings * 12)],
                ["Savings in a year at the target rate", money(calc.targets.savings * 12)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {calc.unallocated < 0 && (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                You are spending {money(Math.abs(calc.unallocated))} more than you earn each month.
                Trim the wants bucket first — it is the fastest one to cut.
              </p>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The 50-30-20 rule is a starting framework — in high-rent metros needs
        often run past 50%, so treat the savings bucket as the number to protect and adjust the
        other two around it.
      </p>
    </main>
  );
}
