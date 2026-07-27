"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";

import {
  BURN_MULTIPLE_WINDOW_MONTHS,
  FUNDRAISE_TRIGGER_MONTHS,
  HEALTHY_RUNWAY_MONTHS,
  MAX_HORIZON_MONTHS,
  monthsToLabel,
  projectRunway,
  raiseForRunway,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  cash: "5000000",
  revenue: "500000",
  expenses: "1000000",
  revenueGrowth: "10",
  expenseGrowth: "2",
  horizon: "24",
  startIso: "",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [cash, setCash] = useState(DEFAULTS.cash);
  const [revenue, setRevenue] = useState(DEFAULTS.revenue);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [revenueGrowth, setRevenueGrowth] = useState(DEFAULTS.revenueGrowth);
  const [expenseGrowth, setExpenseGrowth] = useState(DEFAULTS.expenseGrowth);
  const [horizon, setHorizon] = useState(DEFAULTS.horizon);
  const [startIso, setStartIso] = useState(DEFAULTS.startIso);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      projectRunway({
        cash: toNumber(cash),
        monthlyRevenue: toNumber(revenue),
        monthlyExpenses: toNumber(expenses),
        revenueGrowthPercent: toNumber(revenueGrowth),
        expenseGrowthPercent: toNumber(expenseGrowth),
        horizonMonths: toNumber(horizon),
        startIso,
      }),
    [cash, revenue, expenses, revenueGrowth, expenseGrowth, horizon, startIso],
  );

  const ok = !result.error;

  const round = useMemo(() => {
    if (!ok) return null;
    return raiseForRunway(
      result.netBurn,
      HEALTHY_RUNWAY_MONTHS,
      result.runwayMonths === null ? HEALTHY_RUNWAY_MONTHS : result.runwayMonths,
    );
  }, [ok, result]);

  const runwayText = ok
    ? result.runwayMonths === null
      ? `Beyond ${result.horizon} months`
      : monthsToLabel(result.runwayMonths)
    : DASH;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Startup runway and burn",
      `Gross burn: ${money(result.grossBurn)} a month`,
      `Net burn: ${money(result.netBurn)} a month`,
      `Runway: ${runwayText}`,
      result.cashOutDate ? `Cash runs out around: ${result.cashOutDate}` : "",
      result.reachesBreakEven
        ? `Break-even in month ${result.breakEvenMonth}`
        : `No break-even inside ${result.horizon} months`,
      result.defaultAlive ? "Default alive on this trajectory" : "Default dead on this trajectory",
      result.burnMultiple !== null
        ? `Burn multiple over ${BURN_MULTIPLE_WINDOW_MONTHS} months: ${num(result.burnMultiple)}x (${result.burnMultipleBandLabel})`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, runwayText]);

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
    setCash(DEFAULTS.cash);
    setRevenue(DEFAULTS.revenue);
    setExpenses(DEFAULTS.expenses);
    setRevenueGrowth(DEFAULTS.revenueGrowth);
    setExpenseGrowth(DEFAULTS.expenseGrowth);
    setHorizon(DEFAULTS.horizon);
    setStartIso(DEFAULTS.startIso);
    setCopied(false);
  };

  const maxCash = ok ? Math.max(...result.rows.map((row) => Math.abs(row.closing)), 1) : 1;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Startup finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Startup Runway and Burn Rate Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Walk your cash balance month by month with revenue and cost growth to find real runway, the
          break-even month, your burn multiple and whether you are default alive.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-cash">
              Cash in the bank (INR)
            </label>
            <input
              id="rw-cash"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100000"
              value={cash}
              onChange={(event) => setCash(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-expenses">
              Monthly cash expenses / gross burn (INR)
            </label>
            <input
              id="rw-expenses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={expenses}
              onChange={(event) => setExpenses(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-revenue">
              Monthly revenue collected (INR)
            </label>
            <input
              id="rw-revenue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={revenue}
              onChange={(event) => setRevenue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-rev-growth">
              Revenue growth (% a month)
            </label>
            <input
              id="rw-rev-growth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.5"
              value={revenueGrowth}
              onChange={(event) => setRevenueGrowth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-exp-growth">
              Expense growth (% a month)
            </label>
            <input
              id="rw-exp-growth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.5"
              value={expenseGrowth}
              onChange={(event) => setExpenseGrowth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-horizon">
              Months to project
            </label>
            <input
              id="rw-horizon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_HORIZON_MONTHS}
              step="1"
              value={horizon}
              onChange={(event) => setHorizon(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-start">
              First month of the projection (optional)
            </label>
            <input
              id="rw-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startIso}
              onChange={(event) => setStartIso(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
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
              Runway
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{runwayText}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.cashOutDate
                  ? `Cash hits zero around ${result.cashOutDate}`
                  : `Net burn ${money(result.netBurn)} a month at today's numbers`
                : "Fix the inputs above to model your runway."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy runway and burn result"
              className={GHOST_BTN}
              disabled={!ok}
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

        {ok ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.defaultAlive
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.defaultAlive
              ? result.reachesBreakEven
                ? `Default alive — on this trajectory you reach break-even in month ${result.breakEvenMonth}, before the cash runs out.`
                : "Default alive — you are already covering costs from revenue."
              : `Default dead — the cash runs out before revenue covers costs. You need to cut burn or raise before month ${Math.max(1, Math.floor(result.runwayMonths || 1))}.`}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Gross burn (all cash out)", ok ? `${money(result.grossBurn)} a month` : DASH],
            ["Net burn (after revenue)", ok ? `${money(result.netBurn)} a month` : DASH],
            [
              "Runway at today's numbers, no growth",
              ok && result.simpleRunway !== null ? monthsToLabel(result.simpleRunway) : ok ? "Cash-flow positive" : DASH,
            ],
            ["Runway with growth applied", runwayText],
            [
              "Break-even month",
              ok ? (result.reachesBreakEven ? `Month ${result.breakEvenMonth}` : `Not inside ${result.horizon} months`) : DASH,
            ],
            [
              `Burn multiple over ${BURN_MULTIPLE_WINDOW_MONTHS} months`,
              ok && result.burnMultiple !== null
                ? `${num(result.burnMultiple)}x — ${result.burnMultipleBandLabel}`
                : ok
                  ? "Not applicable while ARR is flat or you are not burning"
                  : DASH,
            ],
            ["Net new ARR added in that window", ok ? money(result.arrAdded) : DASH],
            ["Lowest cash balance in the projection", ok ? money(result.minCash) : DASH],
            [
              "Cash deficit by the end of the projection",
              ok ? (result.fundingGap > 0 ? money(result.fundingGap) : "None — you stay in credit") : DASH,
            ],
            [
              `Raise needed for ${HEALTHY_RUNWAY_MONTHS} months of runway`,
              ok && round ? (round.amount > 0 ? money(round.amount) : round.note || money(0)) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.needsFundraise ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            Under {FUNDRAISE_TRIGGER_MONTHS} months of runway. Most boards start a raise at this
            point, since a round typically takes three to six months to close.
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Month-by-month cash</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Month</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Revenue</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Expenses</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Net burn</th>
                  <th scope="col" className="py-2 text-right font-semibold">Closing cash</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.month} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.month}</td>
                    <td className="py-2 pr-3 text-right">{money(row.revenue)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.expenses)}</td>
                    <td
                      className={`py-2 pr-3 text-right ${row.profitable ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                    >
                      {money(row.netBurn)}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${row.closing < 0 ? "text-[var(--danger)]" : ""}`}
                    >
                      {money(row.closing)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex h-24 items-end gap-0.5" role="img" aria-label="Closing cash by month">
            {result.rows.map((row) => (
              <span
                key={row.month}
                className={`block flex-1 rounded-t-sm ${row.closing < 0 ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                style={{ height: `${Math.max(2, (Math.abs(row.closing) / maxCash) * 100)}%` }}
              />
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning model, not financial advice. It assumes revenue is collected in the month it is
        booked and that growth compounds smoothly, which real businesses rarely do — stress-test with
        a lower growth rate before you commit to a hiring plan.
      </p>
    </main>
  );
}
