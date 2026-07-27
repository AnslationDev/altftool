"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, CircleCheck, CircleX, Copy, RotateCcw, Wallet } from "lucide-react";

import {
  FOIR_COMFORTABLE_PCT,
  RULE_MAX_LOAN_YEARS,
  RULE_MAX_TRANSPORT_PCT,
  RULE_MIN_DOWN_PAYMENT_PCT,
  checkAffordability,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);

const DEFAULTS = {
  income: "150000",
  otherEmi: "40000",
  oldEmi: "0",
  oldRunning: "8000",
  price: "900000",
  down: "200000",
  rate: "9.5",
  years: "5",
  newRunning: "12000",
  savings: "500000",
  expenses: "80000",
  slots: "1",
  vehicles: "2",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const VERDICT_COPY = {
  affordable: "Every test passes — a second vehicle fits your numbers.",
  tight: "No hard failures, but some tests are only borderline.",
  stretched: "Some tests fail. A cheaper vehicle or a bigger down payment would fix most of them.",
  "not-affordable": "Several tests fail. On these numbers a second vehicle is a stretch.",
};

const STATUS_ICON = { pass: CircleCheck, warn: CircleAlert, fail: CircleX };
const STATUS_TONE = {
  pass: "text-[var(--success)]",
  warn: "text-[var(--muted-foreground)]",
  fail: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [otherEmi, setOtherEmi] = useState(DEFAULTS.otherEmi);
  const [oldEmi, setOldEmi] = useState(DEFAULTS.oldEmi);
  const [oldRunning, setOldRunning] = useState(DEFAULTS.oldRunning);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [down, setDown] = useState(DEFAULTS.down);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [newRunning, setNewRunning] = useState(DEFAULTS.newRunning);
  const [savings, setSavings] = useState(DEFAULTS.savings);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [slots, setSlots] = useState(DEFAULTS.slots);
  const [vehicles, setVehicles] = useState(DEFAULTS.vehicles);
  const [copied, setCopied] = useState(false);

  const num = (value) => (value.trim() === "" ? NaN : Number(value));

  const result = useMemo(
    () =>
      checkAffordability({
        grossMonthlyIncome: num(income),
        otherLoanEmi: num(otherEmi),
        existingVehicleEmi: num(oldEmi),
        existingVehicleRunningCost: num(oldRunning),
        onRoadPrice: num(price),
        downPayment: num(down),
        annualRatePct: num(rate),
        loanYears: num(years),
        newVehicleRunningCost: num(newRunning),
        savings: num(savings),
        monthlyHouseholdExpenses: num(expenses),
        parkingSlotsOwned: num(slots),
        vehiclesAfterPurchase: num(vehicles),
      }),
    [income, otherEmi, oldEmi, oldRunning, price, down, rate, years, newRunning, savings, expenses, slots, vehicles],
  );

  const error = result.error || null;

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Second Car Affordability Check",
      `Verdict: ${VERDICT_COPY[result.verdict]}`,
      `Loan amount: ${money(result.loanAmount)} over ${result.months} months`,
      `New EMI: ${money(result.newEmi)}`,
      `Second vehicle costs ${money(result.newVehicleMonthlyTotal)} a month including running costs`,
      `All transport costs: ${money(result.totalTransport)} = ${NUM.format(result.transportPct)}% of gross income (budget ${money(result.transportBudget)})`,
      `All EMIs: ${money(result.totalEmi)} = ${NUM.format(result.foirPct)}% of gross income`,
      `Down payment: ${NUM.format(result.downPct)}% of the on-road price`,
      result.emergencyMonths === null
        ? ""
        : `Emergency fund after purchase: ${NUM.format(result.emergencyMonths)} months of expenses`,
      "Checks:",
      ...result.checks.map((check) => `  ${check.label}: ${check.value} — ${check.status.toUpperCase()}`),
    ]
      .filter(Boolean)
      .join("\n");
  }, [error, result]);

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
    setIncome(DEFAULTS.income);
    setOtherEmi(DEFAULTS.otherEmi);
    setOldEmi(DEFAULTS.oldEmi);
    setOldRunning(DEFAULTS.oldRunning);
    setPrice(DEFAULTS.price);
    setDown(DEFAULTS.down);
    setRate(DEFAULTS.rate);
    setYears(DEFAULTS.years);
    setNewRunning(DEFAULTS.newRunning);
    setSavings(DEFAULTS.savings);
    setExpenses(DEFAULTS.expenses);
    setSlots(DEFAULTS.slots);
    setVehicles(DEFAULTS.vehicles);
    setCopied(false);
  };

  const fields = [
    ["sc-income", "Gross monthly income (INR)", income, setIncome, "1000"],
    ["sc-other-emi", "Other loan EMIs — home, personal (INR)", otherEmi, setOtherEmi, "500"],
    ["sc-old-emi", "Existing vehicle EMI (INR)", oldEmi, setOldEmi, "500"],
    ["sc-old-running", "Existing vehicle running cost per month (INR)", oldRunning, setOldRunning, "500"],
    ["sc-price", "Second vehicle on-road price (INR)", price, setPrice, "5000"],
    ["sc-down", "Down payment (INR)", down, setDown, "5000"],
    ["sc-rate", "Loan interest rate (% a year)", rate, setRate, "0.05"],
    ["sc-years", "Loan tenure (years)", years, setYears, "0.5"],
    ["sc-new-running", "Second vehicle running cost per month (INR)", newRunning, setNewRunning, "500"],
    ["sc-savings", "Liquid savings today (INR)", savings, setSavings, "10000"],
    ["sc-expenses", "Monthly household expenses (INR)", expenses, setExpenses, "1000"],
    ["sc-slots", "Parking slots you own", slots, setSlots, "1"],
    ["sc-vehicles", "Vehicles you will own after this", vehicles, setVehicles, "1"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Wallet className="h-4 w-4" aria-hidden="true" />
          Affordability
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Second Car Affordability Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Runs a second vehicle through six tests: the {RULE_MIN_DOWN_PAYMENT_PCT}/{RULE_MAX_LOAN_YEARS}/
          {RULE_MAX_TRANSPORT_PCT} rule, your total EMI-to-income ratio, what is left of your emergency
          fund, and whether you actually have somewhere to park it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([id, label, value, setter, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Second vehicle costs you
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : `${money(result.newVehicleMonthlyTotal)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? DASH
                : `every month — ${money(result.newEmi)} EMI plus ${money(result.newVehicleRunningCost)} running`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy affordability check result"
              className={GHOST_BTN}
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

        <p
          className={`mt-4 text-sm font-semibold ${error || result.verdict === "affordable" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
        >
          {error ? DASH : VERDICT_COPY[result.verdict]}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Loan amount", error ? DASH : money(result.loanAmount)],
            ["Monthly instalment on the new loan", error ? DASH : money(result.newEmi)],
            ["All loan EMIs together", error ? DASH : `${money(result.totalEmi)} (${pct(result.foirPct)} of income)`],
            [
              "All transport costs together",
              error ? DASH : `${money(result.totalTransport)} (${pct(result.transportPct)} of income)`,
            ],
            [`${RULE_MAX_TRANSPORT_PCT}% transport budget`, error ? DASH : money(result.transportBudget)],
            ["Savings after the down payment", error ? DASH : money(result.savingsAfter)],
            [
              "Emergency fund left",
              error || result.emergencyMonths === null
                ? DASH
                : `${NUM.format(result.emergencyMonths)} months of expenses`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The six tests</h2>
        {error ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {result.checks.map((check) => {
              const Icon = STATUS_ICON[check.status];
              return (
                <li key={check.id} className="flex items-start gap-3 py-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${STATUS_TONE[check.status]}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {check.label}
                      <span className="ml-2 text-xs font-medium uppercase text-[var(--muted-foreground)]">
                        {check.status}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--foreground)]">{check.value}</p>
                    <p className="mt-0.5 text-xs leading-5 text-[var(--muted-foreground)]">
                      Benchmark: {check.benchmark}. {check.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only — this is arithmetic against well-known rules of thumb, not personalised
        financial advice. The {FOIR_COMFORTABLE_PCT}% EMI benchmark and the lender cap around 50% are
        typical rather than universal, and your actual sanction depends on credit history, employment
        and the lender's own policy. Speak to a qualified financial adviser before committing.
      </p>
    </main>
  );
}
