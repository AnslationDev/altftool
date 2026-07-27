"use client";

import { useMemo, useState } from "react";
import { BellRing, Check, Copy, RotateCcw } from "lucide-react";
import { DEFAULT_THRESHOLDS, planSpendAlerts } from "../lib";

const CURRENCIES = [
  { code: "USD", locale: "en-US" },
  { code: "EUR", locale: "de-DE" },
  { code: "GBP", locale: "en-GB" },
  { code: "INR", locale: "en-IN" },
];

const DEFAULTS = {
  monthlyBudget: "5000",
  spendToDate: "2200",
  dayOfMonth: "12",
  daysInMonth: "30",
  largestDaySpend: "400",
  thresholds: DEFAULT_THRESHOLDS.join(", "),
  owners: "Ana (FinOps), Ben (Platform lead), Chris (CTO)",
  currency: "USD",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const toList = (raw) =>
  String(raw)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const currency = CURRENCIES.find((item) => item.code === values.currency) || CURRENCIES[0];
  const money = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 2,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : "—");
  }, [currency]);

  const result = useMemo(
    () =>
      planSpendAlerts({
        monthlyBudget: toNumber(values.monthlyBudget),
        spendToDate: toNumber(values.spendToDate),
        dayOfMonth: toNumber(values.dayOfMonth),
        daysInMonth: toNumber(values.daysInMonth),
        largestDaySpend: toNumber(values.largestDaySpend),
        thresholds: toList(values.thresholds).map(Number),
        owners: toList(values.owners),
      }),
    [values],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.planText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setValues(DEFAULTS);
    setCopied(false);
  };

  const numberFields = [
    { key: "monthlyBudget", label: `Monthly AI budget (${currency.code})`, min: "0", step: "50" },
    { key: "spendToDate", label: `Spend so far this month (${currency.code})`, min: "0", step: "10" },
    { key: "dayOfMonth", label: "Day of the month today", min: "1", max: "31", step: "1" },
    { key: "daysInMonth", label: "Days in this month", min: "28", max: "31", step: "1" },
    { key: "largestDaySpend", label: `Biggest single day so far (${currency.code})`, min: "0", step: "10" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BellRing className="h-4 w-4" aria-hidden="true" />
          Budget guardrails
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AI Spend Alert Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your budget and month-to-date spend to see the run rate, the projected month-end
          figure and the day each alert threshold is due to trip — with a named owner and a specific
          action against every one.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="spend-currency">
              Currency
            </label>
            <select
              id="spend-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.currency}
              onChange={set("currency")}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}
                </option>
              ))}
            </select>
          </div>
          {numberFields.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`spend-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`spend-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.key]}
                onChange={set(field.key)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="spend-thresholds">
              Alert thresholds (% of budget)
            </label>
            <input
              id="spend-thresholds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={values.thresholds}
              onChange={set("thresholds")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="spend-owners">
              Owners, in escalation order (comma separated)
            </label>
            <input
              id="spend-owners"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={values.owners}
              onChange={set("owners")}
            />
          </div>
        </div>
      </section>

      {hasError && (
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
              Projected month-end spend
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : money(result.projectedMonth)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : `${result.projectedPct}% of budget — ${result.severity.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the alert plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Run rate", hasError ? dash : `${money(result.dailyBurn)} per day`],
            ["Budget used so far", hasError ? dash : `${result.usedPct}%`],
            ["Budget remaining", hasError ? dash : money(result.budgetRemaining)],
            [
              "Safe daily spend for the rest of the month",
              hasError || result.safeDailyRemaining === null ? dash : money(result.safeDailyRemaining),
            ],
            [
              "Projected overrun",
              hasError ? dash : result.projectedOverrun > 0 ? money(result.projectedOverrun) : "None projected",
            ],
            ["Days left in the month", hasError ? dash : String(result.daysRemaining)],
            [
              "Daily spike alert level",
              hasError || !result.spikeDetected ? dash : money(result.spikeThreshold),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
              <span className="font-semibold">{result.severity.label}. </span>
              {result.severity.action}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Alert thresholds</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Level</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Amount</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Trips on</th>
                  <th scope="col" className="py-2 font-semibold">Owner</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.threshold} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3 font-semibold">{row.threshold}%</td>
                    <td className="py-2 pr-3">{money(row.amount)}</td>
                    <td className="py-2 pr-3">
                      {row.crossed
                        ? "Already crossed"
                        : row.withinMonth
                          ? `Day ${row.projectedDay}`
                          : "Not this month"}
                    </td>
                    <td className="py-2">{row.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.rows.map((row) => (
              <li key={`action-${row.threshold}`}>
                <span className="font-semibold text-[var(--foreground)]">{row.threshold}%: </span>
                {row.action}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The projection assumes today&apos;s run rate continues, which is how most billing consoles
        forecast. A launch, a batch backfill or a new agent will break that assumption — pair the
        monthly thresholds with a daily spike alert and hard per-key limits.
      </p>
    </main>
  );
}
