"use client";

import { useMemo, useState } from "react";
import { Calculator, Copy, RotateCcw, ShieldCheck } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Math.round(Number.isFinite(value) ? value : 0));
const numberValue = (value) => {
  const parsed = Number(String(value).trim() === "" ? 0 : value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const DEFAULTS = {
  monthlyWages: "21000",
  ceiling: "21000",
  employeeRate: "0.75",
  employerRate: "3.25",
  payableDays: "30",
  monthDays: "30",
};

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [monthlyWages, setMonthlyWages] = useState(DEFAULTS.monthlyWages);
  const [ceiling, setCeiling] = useState(DEFAULTS.ceiling);
  const [employeeRate, setEmployeeRate] = useState(DEFAULTS.employeeRate);
  const [employerRate, setEmployerRate] = useState(DEFAULTS.employerRate);
  const [payableDays, setPayableDays] = useState(DEFAULTS.payableDays);
  const [monthDays, setMonthDays] = useState(DEFAULTS.monthDays);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const wages = numberValue(monthlyWages);
    const wageCeiling = numberValue(ceiling);
    const empRate = numberValue(employeeRate);
    const orgRate = numberValue(employerRate);
    const paid = numberValue(payableDays);
    const days = numberValue(monthDays);

    if ([wages, wageCeiling, empRate, orgRate, paid, days].some((value) => !Number.isFinite(value))) {
      return { error: "Please enter valid numeric values only." };
    }
    if ([wages, wageCeiling, empRate, orgRate, paid, days].some((value) => value < 0)) {
      return { error: "Values cannot be negative." };
    }
    if (days <= 0 || paid > days) {
      return { error: "Payable days must be between 0 and total days in the month." };
    }

    const proratedWages = (wages * paid) / days;
    const covered = wages <= wageCeiling;
    const employeeShare = covered ? (proratedWages * empRate) / 100 : 0;
    const employerShare = covered ? (proratedWages * orgRate) / 100 : 0;
    const total = employeeShare + employerShare;

    return {
      covered,
      proratedWages,
      employeeShare,
      employerShare,
      total,
      employeeTakeHomeImpact: employeeShare,
      employerCost: proratedWages + employerShare,
      effectiveRate: covered && proratedWages > 0 ? (total / proratedWages) * 100 : 0,
    };
  }, [ceiling, employeeRate, employerRate, monthDays, monthlyWages, payableDays]);

  const report = useMemo(() => {
    if (result.error) return "";
    return [
      "ESIC Contribution Estimate",
      `Coverage: ${result.covered ? "Within wage ceiling" : "Not covered at entered wage ceiling"}`,
      `Contribution wages: ${money(result.proratedWages)}`,
      `Employee share: ${money(result.employeeShare)}`,
      `Employer share: ${money(result.employerShare)}`,
      `Total monthly contribution: ${money(result.total)}`,
      "Informational estimate only — confirm current ESIC rules before payroll filing.",
    ].join("\n");
  }, [result]);

  const copy = async () => {
    if (!report) return;
    await navigator.clipboard?.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const reset = () => {
    setMonthlyWages(DEFAULTS.monthlyWages);
    setCeiling(DEFAULTS.ceiling);
    setEmployeeRate(DEFAULTS.employeeRate);
    setEmployerRate(DEFAULTS.employerRate);
    setPayableDays(DEFAULTS.payableDays);
    setMonthDays(DEFAULTS.monthDays);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <ShieldCheck className="h-4 w-4" /> Payroll estimator
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">ESIC Contribution Calculator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Calculate employee and employer ESIC contribution from eligible monthly wages, rate inputs and payable days.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Monthly gross wages", monthlyWages, setMonthlyWages],
                ["Wage ceiling", ceiling, setCeiling],
                ["Employee rate (%)", employeeRate, setEmployeeRate],
                ["Employer rate (%)", employerRate, setEmployerRate],
                ["Payable days", payableDays, setPayableDays],
                ["Days in month", monthDays, setMonthDays],
              ].map(([label, value, setter]) => (
                <label key={label} className="block">
                  <span className="mb-1 block text-sm font-medium">{label}</span>
                  <input className={FIELD} inputMode="decimal" value={value} onChange={(event) => setter(event.target.value)} />
                </label>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className={BUTTON} onClick={copy} type="button">
                <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy summary"}
              </button>
              <button className={GHOST} onClick={reset} type="button">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Calculator className="h-5 w-5 text-[var(--primary)]" /> Contribution result
            </h2>
            {result.error ? (
              <p className="mt-4 rounded-lg bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">{result.error}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {[
                  ["Coverage", result.covered ? "Within ceiling" : "Not covered"],
                  ["Contribution wages", money(result.proratedWages)],
                  ["Employee share", money(result.employeeShare)],
                  ["Employer share", money(result.employerShare)],
                  ["Total contribution", money(result.total)],
                  ["Effective statutory load", `${result.effectiveRate.toFixed(2)}%`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-lg bg-[var(--muted)]/30 px-3 py-2">
                    <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
                    <strong className="text-right">{value}</strong>
                  </div>
                ))}
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                  ESIC rules can change and special wage components may be treated differently. Use this as a planning estimate, not statutory advice.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
