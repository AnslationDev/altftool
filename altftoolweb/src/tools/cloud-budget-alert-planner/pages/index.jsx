"use client";

import { useMemo, useState } from "react";
import { BellRing, Check, Copy, RotateCcw } from "lucide-react";

import { planBudgetAlerts } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  budget: "1000",
  spend: "400",
  day: "10",
  days: "30",
};

const DASH = "—";

export default function ToolHome() {
  const [budget, setBudget] = useState(DEFAULTS.budget);
  const [spend, setSpend] = useState(DEFAULTS.spend);
  const [day, setDay] = useState(DEFAULTS.day);
  const [days, setDays] = useState(DEFAULTS.days);
  const [copied, setCopied] = useState(false);

  const asNumber = (value) => (value.trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      planBudgetAlerts({
        monthlyBudget: asNumber(budget),
        monthToDateSpend: asNumber(spend),
        dayOfMonth: asNumber(day),
        daysInMonth: asNumber(days),
      }),
    [budget, spend, day, days],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const alerts = result.actualAlerts
      .map(
        (alert) =>
          `Actual ${alert.percent}% (${money(alert.amount)}): ${
            alert.alreadyPassed
              ? "already passed"
              : alert.projectedDay
                ? `projected day ${alert.projectedDay}`
                : "not reached this month at current run rate"
          }`,
      )
      .join("\n");
    return [
      "Cloud budget alert plan",
      `Budget: ${money(result.budget)}, spent ${money(result.spend)} by day ${result.dayOfMonth}/${result.daysInMonth}`,
      `Run rate: ${money(result.dailyRunRate)}/day, forecast ${money(result.forecast)} (${NUM.format(result.forecastPercent)}% of budget)`,
      alerts,
      `Forecast trigger (100% of budget): ${result.forecastAlert.firing ? "FIRING now" : "not firing"}`,
      `Safe spend for the rest of the month: ${money(result.safeDailySpend)}/day`,
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
    setBudget(DEFAULTS.budget);
    setSpend(DEFAULTS.spend);
    setDay(DEFAULTS.day);
    setDays(DEFAULTS.days);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Daily run rate", DASH],
        ["Budget used so far", DASH],
        ["Projected overspend", DASH],
        ["Safe daily spend from tomorrow", DASH],
      ]
    : [
        ["Daily run rate", `${money(result.dailyRunRate)}/day`],
        [
          "Budget used so far",
          `${NUM.format(result.percentUsed)}% (even pace would be ${NUM.format(result.expectedPercentToday)}%)`,
        ],
        ["Remaining budget", money(result.remainingBudget)],
        [
          "Projected overspend",
          result.projectedOverspend > 0 ? money(result.projectedOverspend) : money(0),
        ],
        [
          "Budget exhausted on",
          result.exhaustionDay ? `Day ${result.exhaustionDay}` : "Not this month at current rate",
        ],
        ["Safe daily spend from tomorrow", `${money(result.safeDailySpend)}/day`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BellRing className="h-4 w-4" aria-hidden="true" />
          FinOps
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cloud Budget Alert Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your monthly budget and month-to-date spend to get a run-rate forecast, the alert
          ladder providers recommend (50% / 85% / 100% actual plus a forecast trigger), and the day
          each alert would fire at the current pace.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ba-budget">
              Monthly budget (USD)
            </label>
            <input
              id="ba-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ba-spend">
              Spend so far this month (USD)
            </label>
            <input
              id="ba-spend"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={spend}
              onChange={(event) => setSpend(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ba-day">
              Day of the month today (days elapsed)
            </label>
            <input
              id="ba-day"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              value={day}
              onChange={(event) => setDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ba-days">
              Days in this month
            </label>
            <input
              id="ba-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="28"
              max="31"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
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
              Forecast month-end spend
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--primary)]"
                  : result.onTrack
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError ? DASH : money(result.forecast)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.onTrack
                  ? `${NUM.format(result.forecastPercent)}% of budget — on track at the current run rate.`
                  : `${NUM.format(result.forecastPercent)}% of budget — the forecast trigger should be firing now.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the budget alert plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
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
        <h2 className="text-base font-semibold">Recommended alert ladder</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Alert
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Amount
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Status at current pace
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.actualAlerts).map((alert) => (
                <tr key={alert.percent} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-3">Actual spend reaches {alert.percent}%</td>
                  <td className="py-2 pr-3 text-right font-semibold">{money(alert.amount)}</td>
                  <td className="py-2 text-right">
                    {alert.alreadyPassed
                      ? "Already passed"
                      : alert.projectedDay
                        ? `Projected day ${alert.projectedDay}`
                        : "Not reached this month"}
                  </td>
                </tr>
              ))}
              {hasError ? null : (
                <tr>
                  <td className="py-2 pr-3">Forecasted month-end spend reaches 100%</td>
                  <td className="py-2 pr-3 text-right font-semibold">
                    {money(result.forecastAlert.amount)}
                  </td>
                  <td
                    className={`py-2 text-right font-semibold ${result.forecastAlert.firing ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
                  >
                    {result.forecastAlert.firing ? "Firing now" : "Not firing"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The 50% / 85% / 100% ladder matches GCP Billing budget defaults and the AWS Budgets
        recommended template; the forecast trigger uses the same linear run-rate model consoles
        show early in the month. Seasonal or spiky workloads deserve an anomaly-detection alert on
        top.
      </p>
    </main>
  );
}
