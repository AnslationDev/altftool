"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, Plus, RotateCcw, Trash2 } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const MAX_MONTHS = 600;

const DEFAULT_DEBTS = [
  { id: 1, name: "Credit card", balance: "85000", rate: "42", minimum: "4250" },
  { id: 2, name: "Personal loan", balance: "220000", rate: "15.5", minimum: "7600" },
  { id: 3, name: "Consumer durable EMI", balance: "38000", rate: "18", minimum: "3400" },
  { id: 4, name: "Two-wheeler loan", balance: "62000", rate: "11", minimum: "2200" },
];

const DEFAULT_BUDGET = "24000";

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

const formatDuration = (months) => {
  if (!Number.isFinite(months) || months <= 0) return "0 months";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years}y`);
  if (rest) parts.push(`${rest}m`);
  return parts.join(" ") || "0 months";
};

/**
 * Runs the payoff month by month.
 * Every active debt accrues interest and receives its minimum; whatever is left of
 * the budget is thrown at one target debt, chosen by the strategy. When a debt clears,
 * its minimum rolls into the pool for the next target (the "snowball" effect).
 */
function simulate(debts, budget, strategy) {
  const state = debts.map((debt) => ({ ...debt, remaining: debt.balance, interest: 0, paidOff: 0 }));
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const order = [];

  while (state.some((debt) => debt.remaining > 0.5) && months < MAX_MONTHS) {
    let available = budget;

    for (const debt of state) {
      if (debt.remaining <= 0.5) continue;
      const interest = (debt.remaining * debt.rate) / 12 / 100;
      debt.remaining += interest;
      debt.interest += interest;
      totalInterest += interest;
    }

    // 1) Minimums first, so nothing goes delinquent.
    for (const debt of state) {
      if (debt.remaining <= 0.5) continue;
      const pay = Math.min(debt.minimum, debt.remaining, available);
      debt.remaining -= pay;
      available -= pay;
      totalPaid += pay;
    }

    // 2) Everything left goes to the target debt, rolling over as debts clear.
    let guard = state.length + 1;
    while (available > 0.5 && guard > 0) {
      guard -= 1;
      const active = state.filter((debt) => debt.remaining > 0.5);
      if (!active.length) break;
      const sorted = [...active].sort((a, b) =>
        strategy === "snowball"
          ? a.remaining - b.remaining || b.rate - a.rate
          : b.rate - a.rate || a.remaining - b.remaining
      );
      const target = sorted[0];
      const pay = Math.min(available, target.remaining);
      target.remaining -= pay;
      available -= pay;
      totalPaid += pay;
    }

    months += 1;

    for (const debt of state) {
      if (debt.remaining <= 0.5 && !debt.paidOff) {
        debt.remaining = 0;
        debt.paidOff = months;
        order.push({ id: debt.id, name: debt.name, month: months, interest: debt.interest });
      }
    }
  }

  const cleared = state.every((debt) => debt.remaining <= 0.5);
  return { cleared, months, totalInterest, totalPaid, order, state };
}

export default function ToolHome() {
  const [debts, setDebts] = useState(DEFAULT_DEBTS);
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [copied, setCopied] = useState(false);

  const updateDebt = (id, patch) =>
    setDebts((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addDebt = () =>
    setDebts((rows) => [
      ...rows,
      {
        id: (rows.at(-1)?.id ?? 0) + 1,
        name: `Debt ${rows.length + 1}`,
        balance: "50000",
        rate: "14",
        minimum: "2000",
      },
    ]);

  const removeDebt = (id) =>
    setDebts((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  const calc = useMemo(() => {
    const monthly = toNumber(budget);
    if (Number.isNaN(monthly)) return { error: "Enter a valid monthly budget." };

    const parsed = [];
    for (const row of debts) {
      const balance = toNumber(row.balance);
      const rate = toNumber(row.rate);
      const minimum = toNumber(row.minimum);
      const label = row.name || "This debt";
      if ([balance, rate, minimum].some((value) => Number.isNaN(value))) {
        return { error: `Check the numbers entered for "${label}".` };
      }
      if (balance < 0 || rate < 0 || minimum < 0) return { error: "Values cannot be negative." };
      if (rate > 100) return { error: `An interest rate above 100% looks wrong for "${label}".` };
      if (balance > 0 && minimum <= 0) {
        return { error: `Enter the minimum monthly payment for "${label}".` };
      }
      if (balance > 0) parsed.push({ id: row.id, name: label, balance, rate, minimum });
    }

    if (!parsed.length) return { error: "Add at least one debt with an outstanding balance." };

    const totalMinimum = parsed.reduce((sum, debt) => sum + debt.minimum, 0);
    const totalBalance = parsed.reduce((sum, debt) => sum + debt.balance, 0);
    const monthlyInterestNow = parsed.reduce(
      (sum, debt) => sum + (debt.balance * debt.rate) / 12 / 100,
      0
    );

    if (monthly < totalMinimum) {
      return {
        error: `Your budget of ${money(monthly)} is below the ${money(totalMinimum)} of minimum payments these debts require.`,
        totalMinimum,
      };
    }
    if (monthly <= monthlyInterestNow) {
      return {
        error: `At ${money(monthly)} a month you are not even covering ${money(monthlyInterestNow)} of interest — the debt would keep growing.`,
        totalMinimum,
      };
    }

    const snowball = simulate(parsed, monthly, "snowball");
    const avalanche = simulate(parsed, monthly, "avalanche");

    const bothCleared = snowball.cleared && avalanche.cleared;
    const interestGap = snowball.totalInterest - avalanche.totalInterest;
    const monthGap = snowball.months - avalanche.months;

    return {
      parsed,
      monthly,
      totalMinimum,
      totalBalance,
      extra: monthly - totalMinimum,
      snowball,
      avalanche,
      bothCleared,
      interestGap,
      monthGap,
    };
  }, [debts, budget]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    const lines = [
      "Debt Snowball vs Avalanche",
      `Total debt: ${money(calc.totalBalance)} across ${calc.parsed.length} accounts`,
      `Monthly budget: ${money(calc.monthly)} (minimums ${money(calc.totalMinimum)}, extra ${money(calc.extra)})`,
      "",
      `Avalanche (highest rate first): ${calc.avalanche.cleared ? formatDuration(calc.avalanche.months) : "not cleared in 50 years"}, interest ${money(calc.avalanche.totalInterest)}`,
      `Snowball (smallest balance first): ${calc.snowball.cleared ? formatDuration(calc.snowball.months) : "not cleared in 50 years"}, interest ${money(calc.snowball.totalInterest)}`,
    ];
    if (calc.bothCleared) {
      lines.push(
        "",
        calc.interestGap > 0
          ? `Avalanche saves ${money(calc.interestGap)} in interest.`
          : calc.interestGap < 0
            ? `Snowball saves ${money(-calc.interestGap)} in interest.`
            : "Both strategies cost the same in interest."
      );
      lines.push(
        "Avalanche payoff order: " +
          calc.avalanche.order.map((item) => `${item.name} (month ${item.month})`).join(" -> ")
      );
    }
    return lines.join("\n");
  }, [calc]);

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
    setDebts(DEFAULT_DEBTS);
    setBudget(DEFAULT_BUDGET);
    setCopied(false);
  };

  const winner =
    calc.error || !calc.bothCleared
      ? null
      : calc.interestGap > 0
        ? "avalanche"
        : calc.interestGap < 0
          ? "snowball"
          : "tie";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Debt payoff
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Debt Snowball vs Avalanche Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List every loan and card, set what you can pay each month, and the planner simulates both
          payoff orders — smallest balance first (snowball) and highest interest rate first
          (avalanche) — rolling each cleared minimum into the next debt.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your debts</h2>
        <div className="mt-4 space-y-4">
          {debts.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`debt-name-${row.id}`}>
                    Debt name
                  </label>
                  <input
                    id={`debt-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateDebt(row.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`debt-balance-${row.id}`}>
                    Outstanding balance (INR)
                  </label>
                  <input
                    id={`debt-balance-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={row.balance}
                    onChange={(event) => updateDebt(row.id, { balance: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`debt-rate-${row.id}`}>
                    Interest rate (% per year)
                  </label>
                  <input
                    id={`debt-rate-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.25"
                    value={row.rate}
                    onChange={(event) => updateDebt(row.id, { rate: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`debt-min-${row.id}`}>
                    Minimum monthly payment (INR)
                  </label>
                  <input
                    id={`debt-min-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    value={row.minimum}
                    onChange={(event) => updateDebt(row.id, { minimum: event.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeDebt(row.id)}
                    disabled={debts.length === 1}
                    aria-label={`Remove ${row.name || `debt ${index + 1}`}`}
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

        <button type="button" onClick={addDebt} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another debt
        </button>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="debt-budget">
            Total you can put towards debt each month (INR)
          </label>
          <input
            id="debt-budget"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="500"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
          {!calc.error && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {money(calc.totalMinimum)} covers the minimums, leaving {money(calc.extra)} of extra
              firepower each month.
            </p>
          )}
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
                  {winner === "avalanche"
                    ? "Avalanche wins"
                    : winner === "snowball"
                      ? "Snowball wins"
                      : "Result"}
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {calc.bothCleared
                    ? money(Math.abs(calc.interestGap))
                    : formatDuration(Math.min(calc.snowball.months, calc.avalanche.months))}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {calc.bothCleared
                    ? winner === "tie"
                      ? "Both orders cost the same here"
                      : `saved in interest by paying ${winner === "avalanche" ? "the highest rate" : "the smallest balance"} first`
                    : "Not every debt clears within 50 years at this budget"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy debt payoff comparison"
                  className={GHOST_BTN}
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all debts" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Avalanche", "Highest interest rate first", calc.avalanche, "avalanche"],
                ["Snowball", "Smallest balance first", calc.snowball, "snowball"],
              ].map(([title, subtitle, run, key]) => (
                <div
                  key={key}
                  className={`rounded-lg border p-4 ${
                    winner === key ? "border-[var(--primary)]" : "border-[var(--border)]"
                  }`}
                >
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{subtitle}</p>
                  <p className="mt-3 text-2xl font-semibold">
                    {run.cleared ? formatDuration(run.months) : "50y+"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Interest {money(run.totalInterest)}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Total paid {money(run.totalPaid)}
                  </p>
                </div>
              ))}
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Total debt today", money(calc.totalBalance)],
                ["Minimum payments required", `${money(calc.totalMinimum)} per month`],
                ["Extra going to the target debt", `${money(calc.extra)} per month`],
                [
                  "Months difference",
                  calc.bothCleared
                    ? calc.monthGap === 0
                      ? "Same finish date"
                      : `${Math.abs(calc.monthGap)} month${Math.abs(calc.monthGap) === 1 ? "" : "s"} ${calc.monthGap > 0 ? "faster with avalanche" : "faster with snowball"}`
                    : "-",
                ],
                [
                  "Interest difference",
                  calc.bothCleared ? `${money(Math.abs(calc.interestGap))} ${calc.interestGap === 0 ? "" : calc.interestGap > 0 ? "cheaper with avalanche" : "cheaper with snowball"}` : "-",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Avalanche payoff order", calc.avalanche],
              ["Snowball payoff order", calc.snowball],
            ].map(([title, run]) => (
              <div key={title} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="text-base font-semibold">{title}</h2>
                {run.order.length ? (
                  <ol className="mt-3 space-y-2 text-sm">
                    {run.order.map((item, index) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] px-3 py-2"
                      >
                        <span className="font-semibold">
                          <span className="mr-2 text-[var(--muted-foreground)]">{index + 1}.</span>
                          {item.name}
                        </span>
                        <span className="text-right text-[var(--muted-foreground)]">
                          month {item.month}
                          <span className="block text-xs">interest {money(item.interest)}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                    No debt clears within 50 years at this budget.
                  </p>
                )}
              </div>
            ))}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Which one should you pick?</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Avalanche always costs the same or less in interest because it kills the most expensive
              rate first — here the gap is {money(Math.abs(calc.interestGap))}. Snowball clears
              individual accounts sooner, which many people find easier to stick with. If the rupee
              difference is small, choose the order you will actually follow for the whole{" "}
              {calc.avalanche.cleared ? formatDuration(calc.avalanche.months) : "payoff period"}.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. It assumes no new borrowing, level minimum payments, monthly
        compounding and no prepayment or foreclosure charges — several Indian lenders levy 2-5% on
        early closure of fixed-rate personal loans, so check before you make a lump-sum payment.
      </p>
    </main>
  );
}
