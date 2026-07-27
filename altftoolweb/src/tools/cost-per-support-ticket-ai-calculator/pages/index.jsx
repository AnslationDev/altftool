"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ticket } from "lucide-react";
import { computeTicketCost } from "../lib";

const CURRENCIES = [
  { code: "USD", locale: "en-US" },
  { code: "EUR", locale: "de-DE" },
  { code: "GBP", locale: "en-GB" },
  { code: "INR", locale: "en-IN" },
];

const DEFAULTS = {
  ticketsPerMonth: "20000",
  containmentPct: "55",
  reopenPct: "0",
  aiCostPerAttempt: "0.06",
  handoffCost: "0.02",
  ahtMinutes: "8",
  agentHourlyCost: "26",
  occupancyPct: "85",
  platformMonthlyFee: "500",
  currency: "USD",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const VOLUME_FIELDS = [
  { key: "ticketsPerMonth", label: "Tickets per month", min: "1", step: "100" },
  { key: "containmentPct", label: "Resolved by AI alone (%)", min: "0", max: "100", step: "1" },
  { key: "reopenPct", label: "AI-resolved tickets that come back (%)", min: "0", max: "100", step: "1" },
  { key: "ahtMinutes", label: "Agent average handle time (minutes)", min: "0", step: "0.5" },
  { key: "occupancyPct", label: "Agent occupancy (%)", min: "1", max: "100", step: "1" },
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  const currency = CURRENCIES.find((item) => item.code === values.currency) || CURRENCIES[0];
  const money = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 2,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : "—");
  }, [currency]);
  const bigMoney = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 0,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : "—");
  }, [currency]);

  const result = useMemo(
    () =>
      computeTicketCost({
        ticketsPerMonth: toNumber(values.ticketsPerMonth),
        containmentPct: toNumber(values.containmentPct),
        reopenPct: toNumber(values.reopenPct),
        aiCostPerAttempt: toNumber(values.aiCostPerAttempt),
        handoffCost: toNumber(values.handoffCost),
        ahtMinutes: toNumber(values.ahtMinutes),
        agentHourlyCost: toNumber(values.agentHourlyCost),
        occupancyPct: toNumber(values.occupancyPct),
        platformMonthlyFee: toNumber(values.platformMonthlyFee),
      }),
    [values],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = hasError
    ? ""
    : [
        "Cost Per Support Ticket AI Calculator",
        `Blended cost per ticket: ${money(result.blendedPerTicket)}`,
        `Agent-only cost per ticket: ${money(result.baselinePerTicket)}`,
        `Monthly spend with AI: ${bigMoney(result.totalSpend)}`,
        `Monthly spend without AI: ${bigMoney(result.baselineSpend)}`,
        `Monthly saving: ${bigMoney(result.monthlySaving)} (${result.savingPct}%)`,
        `Break-even containment: ${result.breakEvenContainmentPct}%`,
      ].join("\n");

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
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ticket className="h-4 w-4" aria-hidden="true" />
          Support economics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cost Per Support Ticket AI Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prices an AI-assisted queue against an all-human one, using occupancy-adjusted agent cost
          and charging every ticket for the AI attempt — including the ones that escalate anyway.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Queue and agents</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ticket-currency">
              Currency
            </label>
            <select
              id="ticket-currency"
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
          {VOLUME_FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`ticket-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`ticket-${field.key}`}
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
            <label className={LABEL_CLASS} htmlFor="ticket-agentHourlyCost">
              Fully loaded agent cost per hour ({currency.code})
            </label>
            <input
              id="ticket-agentHourlyCost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={values.agentHourlyCost}
              onChange={set("agentHourlyCost")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">AI costs</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {[
            { key: "aiCostPerAttempt", label: `Model cost per attempt (${currency.code})`, step: "0.01" },
            { key: "handoffCost", label: `Extra cost when it escalates (${currency.code})`, step: "0.01" },
            { key: "platformMonthlyFee", label: `Fixed platform fee per month (${currency.code})`, step: "50" },
          ].map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`ticket-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`ticket-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={field.step}
                value={values[field.key]}
                onChange={set(field.key)}
              />
            </div>
          ))}
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
              Blended cost per ticket
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : money(result.blendedPerTicket)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `against ${money(result.baselinePerTicket)} with agents only`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cost per ticket result"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["Agent cost per ticket (occupancy adjusted)", hasError ? dash : money(result.agentCostPerTicket)],
            ["Tickets closed by AI alone", hasError ? dash : NUM.format(result.containedNet)],
            ["Tickets reaching an agent", hasError ? dash : NUM.format(result.escalated)],
            ["Real containment after reopens", hasError ? dash : `${result.effectiveContainmentPct}%`],
            ["Monthly model spend", hasError ? dash : bigMoney(result.aiSpend)],
            ["Monthly agent spend", hasError ? dash : bigMoney(result.agentSpend)],
            ["Monthly total with AI", hasError ? dash : bigMoney(result.totalSpend)],
            ["Monthly total without AI", hasError ? dash : bigMoney(result.baselineSpend)],
            [
              "Monthly saving",
              hasError || result.savingPct === null
                ? dash
                : `${bigMoney(result.monthlySaving)} (${result.savingPct}%)`,
            ],
            ["Annual saving", hasError ? dash : bigMoney(result.annualSaving)],
            ["Agent hours freed per month", hasError ? dash : NUM.format(result.agentHoursSaved)],
            [
              "Break-even containment",
              hasError || result.breakEvenContainmentPct === null
                ? dash
                : `${result.breakEvenContainmentPct}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Freed agent hours become savings only if headcount, overtime or outsourced
        volume actually changes — otherwise they are capacity, not cash. Quality, CSAT and handling
        of the hardest 10% of tickets belong in the decision alongside cost.
      </p>
    </main>
  );
}
