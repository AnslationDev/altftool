"use client";

import { useMemo, useState } from "react";
import { Clock3, Copy, RotateCcw } from "lucide-react";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const money = (value) => currency.format(Number.isFinite(value) ? value : 0);
const num = (value) => {
  const parsed = Number(String(value).trim() === "" ? 0 : value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const DEFAULTS = {
  hourlyRate: "20",
  regularHours: "40",
  overtimeHours: "8",
  multiplier: "1.5",
  bonus: "0",
};

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [hourlyRate, setHourlyRate] = useState(DEFAULTS.hourlyRate);
  const [regularHours, setRegularHours] = useState(DEFAULTS.regularHours);
  const [overtimeHours, setOvertimeHours] = useState(DEFAULTS.overtimeHours);
  const [multiplier, setMultiplier] = useState(DEFAULTS.multiplier);
  const [bonus, setBonus] = useState(DEFAULTS.bonus);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const rate = num(hourlyRate);
    const regular = num(regularHours);
    const overtime = num(overtimeHours);
    const factor = num(multiplier);
    const extra = num(bonus);

    if ([rate, regular, overtime, factor, extra].some((value) => !Number.isFinite(value))) {
      return { error: "Please enter numeric values only." };
    }
    if ([rate, regular, overtime, factor, extra].some((value) => value < 0)) {
      return { error: "Values cannot be negative." };
    }
    if (regular + overtime > 168) {
      return { error: "Weekly hours cannot exceed 168." };
    }

    const regularPay = rate * regular;
    const overtimeRate = rate * factor;
    const overtimePay = overtimeRate * overtime;
    const grossPay = regularPay + overtimePay + extra;
    const blendedRate = regular + overtime > 0 ? grossPay / (regular + overtime) : 0;

    return { regularPay, overtimeRate, overtimePay, grossPay, blendedRate };
  }, [bonus, hourlyRate, multiplier, overtimeHours, regularHours]);

  const report = useMemo(() => {
    if (result.error) return "";
    return [
      "Overtime Pay Estimate",
      `Regular pay: ${money(result.regularPay)}`,
      `Overtime rate: ${money(result.overtimeRate)} / hour`,
      `Overtime pay: ${money(result.overtimePay)}`,
      `Gross weekly pay: ${money(result.grossPay)}`,
      `Blended hourly rate: ${money(result.blendedRate)}`,
      "Gross estimate only — confirm taxes and legal overtime rules separately.",
    ].join("\n");
  }, [result]);

  const copy = async () => {
    if (!report) return;
    await navigator.clipboard?.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const reset = () => {
    setHourlyRate(DEFAULTS.hourlyRate);
    setRegularHours(DEFAULTS.regularHours);
    setOvertimeHours(DEFAULTS.overtimeHours);
    setMultiplier(DEFAULTS.multiplier);
    setBonus(DEFAULTS.bonus);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <Clock3 className="h-4 w-4" /> Payroll quick math
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Overtime Pay Calculator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Calculate regular pay, overtime pay, gross total and blended hourly rate from one simple timesheet.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Hourly rate", hourlyRate, setHourlyRate],
                ["Regular hours", regularHours, setRegularHours],
                ["Overtime hours", overtimeHours, setOvertimeHours],
                ["Overtime multiplier", multiplier, setMultiplier],
                ["Bonus / allowance", bonus, setBonus],
              ].map(([label, value, setter]) => (
                <label key={label} className="block">
                  <span className="mb-1 block text-sm font-medium">{label}</span>
                  <input className={FIELD} inputMode="decimal" value={value} onChange={(event) => setter(event.target.value)} />
                </label>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className={BUTTON} onClick={copy} type="button">
                <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy pay summary"}
              </button>
              <button className={GHOST} onClick={reset} type="button">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">Pay breakdown</h2>
            {result.error ? (
              <p className="mt-4 rounded-lg bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">{result.error}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {[
                  ["Regular pay", money(result.regularPay)],
                  ["Overtime rate", `${money(result.overtimeRate)} / hr`],
                  ["Overtime pay", money(result.overtimePay)],
                  ["Gross pay", money(result.grossPay)],
                  ["Blended hourly rate", money(result.blendedRate)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-lg bg-[var(--muted)]/30 px-3 py-2">
                    <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
                    <strong className="text-right">{value}</strong>
                  </div>
                ))}
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                  This calculator does not replace legal payroll rules. Use your local overtime law or contract for the multiplier and eligibility.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
