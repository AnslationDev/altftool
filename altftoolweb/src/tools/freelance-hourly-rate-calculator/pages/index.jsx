"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Check, Copy, RotateCcw } from "lucide-react";

const DEFAULTS = {
  takeHome: "1200000",
  expenses: "120000",
  taxRate: "20",
  hoursPerWeek: "40",
  holidayWeeks: "4",
  sickWeeks: "1",
  billableShare: "65",
  buffer: "10",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const intFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function toNumber(value) {
  if (typeof value !== "string") return Number.NaN;
  if (value.trim() === "") return 0;
  return Number(value);
}

export default function ToolHome() {
  const [takeHome, setTakeHome] = useState(DEFAULTS.takeHome);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [taxRate, setTaxRate] = useState(DEFAULTS.taxRate);
  const [hoursPerWeek, setHoursPerWeek] = useState(DEFAULTS.hoursPerWeek);
  const [holidayWeeks, setHolidayWeeks] = useState(DEFAULTS.holidayWeeks);
  const [sickWeeks, setSickWeeks] = useState(DEFAULTS.sickWeeks);
  const [billableShare, setBillableShare] = useState(DEFAULTS.billableShare);
  const [buffer, setBuffer] = useState(DEFAULTS.buffer);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const income = toNumber(takeHome);
    const cost = toNumber(expenses);
    const tax = toNumber(taxRate);
    const weekHours = toNumber(hoursPerWeek);
    const holiday = toNumber(holidayWeeks);
    const sick = toNumber(sickWeeks);
    const billablePct = toNumber(billableShare);
    const bufferPct = toNumber(buffer);

    const values = [income, cost, tax, weekHours, holiday, sick, billablePct, bufferPct];
    if (values.some((value) => !Number.isFinite(value))) {
      return { error: "Every field needs a valid number." };
    }
    if (values.some((value) => value < 0)) {
      return { error: "Values cannot be negative." };
    }
    if (tax >= 100) {
      return { error: "The tax and contributions rate must be below 100%." };
    }
    if (billablePct <= 0 || billablePct > 100) {
      return { error: "Billable share must be greater than 0% and at most 100%." };
    }
    if (weekHours <= 0) {
      return { error: "Enter how many hours a week you plan to work." };
    }

    const weeksWorked = 52 - holiday - sick;
    if (weeksWorked <= 0) {
      return { error: "Holiday and sick weeks together must be less than 52." };
    }

    const profitBeforeTax = income / (1 - tax / 100);
    const revenueBase = profitBeforeTax + cost;
    const revenue = revenueBase * (1 + bufferPct / 100);

    const totalWorkedHours = weeksWorked * weekHours;
    const billableHours = totalWorkedHours * (billablePct / 100);
    if (billableHours <= 0) {
      return { error: "Billable hours work out to zero — increase your hours or billable share." };
    }

    const hourlyRate = revenue / billableHours;
    const hoursPerDay = weekHours / 5;

    return {
      error: null,
      hourlyRate,
      dayRate: hourlyRate * hoursPerDay,
      hoursPerDay,
      weeksWorked,
      totalWorkedHours,
      billableHours,
      billableHoursPerWeek: billableHours / weeksWorked,
      revenue,
      profitBeforeTax,
      taxAmount: profitBeforeTax - income,
      cost,
      monthlyRevenue: revenue / 12,
      effectiveRatePerWorkedHour: revenue / totalWorkedHours,
      bufferAmount: revenue - revenueBase,
    };
  }, [takeHome, expenses, taxRate, hoursPerWeek, holidayWeeks, sickWeeks, billableShare, buffer]);

  const report = useMemo(() => {
    if (result.error) return "";
    return [
      "Freelance Hourly Rate Calculator",
      `Target take-home: ${currencyFormatter.format(toNumber(takeHome))} per year`,
      `Business expenses: ${currencyFormatter.format(result.cost)} per year`,
      `Tax and contributions: ${toNumber(taxRate)}%`,
      `Weeks worked: ${decimalFormatter.format(result.weeksWorked)}`,
      `Billable hours per year: ${intFormatter.format(result.billableHours)}`,
      "",
      `Required hourly rate: ${currencyFormatter.format(result.hourlyRate)}`,
      `Day rate (${decimalFormatter.format(result.hoursPerDay)} h): ${currencyFormatter.format(result.dayRate)}`,
      `Revenue needed: ${currencyFormatter.format(result.revenue)} per year`,
      `Monthly invoicing target: ${currencyFormatter.format(result.monthlyRevenue)}`,
    ].join("\n");
  }, [result, takeHome, taxRate]);

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setTakeHome(DEFAULTS.takeHome);
    setExpenses(DEFAULTS.expenses);
    setTaxRate(DEFAULTS.taxRate);
    setHoursPerWeek(DEFAULTS.hoursPerWeek);
    setHolidayWeeks(DEFAULTS.holidayWeeks);
    setSickWeeks(DEFAULTS.sickWeeks);
    setBillableShare(DEFAULTS.billableShare);
    setBuffer(DEFAULTS.buffer);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "block text-sm font-semibold text-[var(--foreground)]";

  const fields = [
    { id: "fhr-income", label: "Target take-home pay (INR / year)", value: takeHome, set: setTakeHome, step: "10000", min: "0" },
    { id: "fhr-expenses", label: "Business expenses (INR / year)", value: expenses, set: setExpenses, step: "5000", min: "0" },
    { id: "fhr-tax", label: "Tax and contributions (%)", value: taxRate, set: setTaxRate, step: "1", min: "0", max: "99" },
    { id: "fhr-hours", label: "Hours worked per week", value: hoursPerWeek, set: setHoursPerWeek, step: "1", min: "1", max: "100" },
    { id: "fhr-holiday", label: "Holiday weeks off", value: holidayWeeks, set: setHolidayWeeks, step: "1", min: "0", max: "40" },
    { id: "fhr-sick", label: "Sick / admin weeks off", value: sickWeeks, set: setSickWeeks, step: "1", min: "0", max: "40" },
    { id: "fhr-billable", label: "Billable share of your time (%)", value: billableShare, set: setBillableShare, step: "5", min: "1", max: "100" },
    { id: "fhr-buffer", label: "Profit buffer (%)", value: buffer, set: setBuffer, step: "5", min: "0", max: "100" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header>
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
          Freelance pricing
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
          Freelance Hourly Rate Calculator
        </h1>
        <p className="mt-2 text-base leading-7 text-[var(--muted-foreground)]">
          Start from the money you want to keep, add expenses, tax and the hours you can realistically
          bill, and this works backwards to the hourly rate you need to charge.
        </p>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <label className={labelClass} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                type="number"
                inputMode="decimal"
                min={field.min}
                max={field.max}
                step={field.step}
                value={field.value}
                onChange={(event) => {
                  field.set(event.target.value);
                  setCopied(false);
                }}
                className={`mt-2 ${inputClass}`}
              />
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Billable share covers the reality that pitching, invoicing, learning and admin are unpaid. Most
          solo freelancers land between 50% and 70%.
        </p>
      </section>

      {result.error ? (
        <div
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </div>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Charge at least
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                {currencyFormatter.format(result.hourlyRate)}
                <span className="text-lg font-medium text-[var(--muted-foreground)]"> / hour</span>
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Day rate {currencyFormatter.format(result.dayRate)} for a{" "}
                {decimalFormatter.format(result.hoursPerDay)} hour day
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy rate breakdown"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Revenue needed per year", currencyFormatter.format(result.revenue)],
              ["Monthly invoicing target", currencyFormatter.format(result.monthlyRevenue)],
              ["Weeks worked per year", decimalFormatter.format(result.weeksWorked)],
              ["Billable hours per year", `${intFormatter.format(result.billableHours)} h`],
              ["Billable hours per week", `${decimalFormatter.format(result.billableHoursPerWeek)} h`],
              ["Rate per hour actually worked", currencyFormatter.format(result.effectiveRatePerWorkedHour)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-sm font-semibold">Where the money goes</p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--muted-foreground)]">
              <li>
                Take-home for you:{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {currencyFormatter.format(toNumber(takeHome))}
                </span>
              </li>
              <li>
                Tax and contributions:{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {currencyFormatter.format(result.taxAmount)}
                </span>
              </li>
              <li>
                Business expenses:{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {currencyFormatter.format(result.cost)}
                </span>
              </li>
              <li>
                Profit buffer:{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {currencyFormatter.format(result.bufferAmount)}
                </span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Estimates only, based on the figures you enter. Tax treatment depends on your country and
              business structure — check with a qualified accountant before setting prices.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
