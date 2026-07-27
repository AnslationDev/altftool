"use client";

import { useMemo, useState } from "react";
import { CarTaxiFront, Check, Copy, RotateCcw } from "lucide-react";
import {
  ESI_WAGE_CEILING,
  EPF_WAGE_CEILING,
  NORMAL_HOURS_PER_WEEK,
  STATUTORY_OVERTIME_MULTIPLIER,
  computeDriverPay,
} from "../lib";

const DEFAULTS = {
  wage: "18000",
  days: "26",
  hours: "8",
  otHours: "20",
  otMultiplier: String(STATUTORY_OVERTIME_MULTIPLIER),
  nights: "4",
  nightRate: "300",
  outstation: "2",
  outstationRate: "500",
  restDays: "1",
  allowances: "0",
  advance: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const fmt = (value, decimals = 1) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimals }).format(value);

export default function ToolHome() {
  const [wage, setWage] = useState(DEFAULTS.wage);
  const [days, setDays] = useState(DEFAULTS.days);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [otHours, setOtHours] = useState(DEFAULTS.otHours);
  const [otMultiplier, setOtMultiplier] = useState(DEFAULTS.otMultiplier);
  const [nights, setNights] = useState(DEFAULTS.nights);
  const [nightRate, setNightRate] = useState(DEFAULTS.nightRate);
  const [outstation, setOutstation] = useState(DEFAULTS.outstation);
  const [outstationRate, setOutstationRate] = useState(DEFAULTS.outstationRate);
  const [restDays, setRestDays] = useState(DEFAULTS.restDays);
  const [allowances, setAllowances] = useState(DEFAULTS.allowances);
  const [advance, setAdvance] = useState(DEFAULTS.advance);
  const [applyEpf, setApplyEpf] = useState(true);
  const [applyEsi, setApplyEsi] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeDriverPay({
        monthlyWage: toNumber(wage),
        dutyDaysPerMonth: toNumber(days),
        dutyHoursPerDay: toNumber(hours),
        overtimeHours: toNumber(otHours),
        overtimeMultiplier: toNumber(otMultiplier),
        nightDuties: toNumber(nights),
        nightAllowancePerDuty: toNumber(nightRate),
        outstationDays: toNumber(outstation),
        outstationRatePerDay: toNumber(outstationRate),
        restDaysWorked: toNumber(restDays),
        otherAllowances: toNumber(allowances),
        advanceDeducted: toNumber(advance),
        applyEpf,
        applyEsi,
      }),
    [
      wage,
      days,
      hours,
      otHours,
      otMultiplier,
      nights,
      nightRate,
      outstation,
      outstationRate,
      restDays,
      allowances,
      advance,
      applyEpf,
      applyEsi,
    ],
  );

  const error = result.error || "";

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Driver monthly pay",
      `Base wage: ${money(toNumber(wage))} for ${fmt(toNumber(days), 0)} duty days x ${fmt(toNumber(hours), 1)} h`,
      `Ordinary rate: ${money(result.hourlyRate)}/hour, ${money(result.dailyRate)}/day`,
      `Overtime: ${money(result.overtimePay)}`,
      `Night duty: ${money(result.nightPay)}`,
      `Outstation: ${money(result.outstationPay)}`,
      `Rest days worked: ${money(result.restDayPay)}`,
      `Gross: ${money(result.gross)}`,
      `Deductions: ${money(result.totalDeductions)}`,
      `Net in hand: ${money(result.netPay)}`,
      `Total cost to employer: ${money(result.employerCost)}`,
    ].join("\n");
  }, [error, wage, days, hours, result]);

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
    setWage(DEFAULTS.wage);
    setDays(DEFAULTS.days);
    setHours(DEFAULTS.hours);
    setOtHours(DEFAULTS.otHours);
    setOtMultiplier(DEFAULTS.otMultiplier);
    setNights(DEFAULTS.nights);
    setNightRate(DEFAULTS.nightRate);
    setOutstation(DEFAULTS.outstation);
    setOutstationRate(DEFAULTS.outstationRate);
    setRestDays(DEFAULTS.restDays);
    setAllowances(DEFAULTS.allowances);
    setAdvance(DEFAULTS.advance);
    setApplyEpf(true);
    setApplyEsi(true);
    setCopied(false);
  };

  const fields = [
    ["driver-wage", "Monthly wage (INR)", wage, setWage, { min: "0", step: "500" }],
    ["driver-days", "Duty days in the month", days, setDays, { min: "1", max: "31", step: "1" }],
    ["driver-hours", "Duty hours per day", hours, setHours, { min: "1", max: "16", step: "0.5" }],
    ["driver-ot", "Overtime hours in the month", otHours, setOtHours, { min: "0", max: "300", step: "1" }],
    [
      "driver-ot-mult",
      "Overtime multiplier (statutory floor 2)",
      otMultiplier,
      setOtMultiplier,
      { min: "1", max: "4", step: "0.25" },
    ],
    ["driver-nights", "Night duties", nights, setNights, { min: "0", max: "31", step: "1" }],
    ["driver-night-rate", "Night duty allowance each (INR)", nightRate, setNightRate, { min: "0", step: "50" }],
    ["driver-outstation", "Outstation / halt days", outstation, setOutstation, { min: "0", max: "31", step: "1" }],
    [
      "driver-outstation-rate",
      "Outstation rate per day (INR)",
      outstationRate,
      setOutstationRate,
      { min: "0", step: "50" },
    ],
    ["driver-rest", "Weekly-off days worked", restDays, setRestDays, { min: "0", max: "10", step: "1" }],
    ["driver-allow", "Other allowances (INR)", allowances, setAllowances, { min: "0", step: "100" }],
    ["driver-advance", "Advance / loan recovered (INR)", advance, setAdvance, { min: "0", step: "100" }],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarTaxiFront className="h-4 w-4" aria-hidden="true" />
          Payroll
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Driver Salary Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a driver's monthly payslip: base wage, overtime at twice the ordinary rate, night and
          outstation allowances, rest-day working, and the PF and ESI shares on both sides.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([id, label, value, setter, attrs]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(event) => setter(event.target.value)}
                {...attrs}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            htmlFor="driver-epf"
          >
            <input
              id="driver-epf"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={applyEpf}
              onChange={(event) => setApplyEpf(event.target.checked)}
            />
            Deduct EPF (12% on up to {money(EPF_WAGE_CEILING)})
          </label>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            htmlFor="driver-esi"
          >
            <input
              id="driver-esi"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={applyEsi}
              onChange={(event) => setApplyEsi(event.target.checked)}
            />
            Apply ESI (gross up to {money(ESI_WAGE_CEILING)})
          </label>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Net pay in hand
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : money(result.netPay)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the highlighted input to see a result."
                : `Gross ${money(result.gross)} · costs the employer ${money(result.employerCost)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy driver salary breakdown"
              className={GHOST_BTN}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Ordinary rate per hour", error ? DASH : money(result.hourlyRate)],
            ["Ordinary rate per day", error ? DASH : money(result.dailyRate)],
            ["Overtime pay", error ? DASH : money(result.overtimePay)],
            ["Night duty allowance", error ? DASH : money(result.nightPay)],
            ["Outstation allowance", error ? DASH : money(result.outstationPay)],
            ["Weekly-off days worked", error ? DASH : money(result.restDayPay)],
            ["Other allowances", error ? DASH : money(result.otherAllowances)],
            ["Gross earnings", error ? DASH : money(result.gross)],
            ["EPF — employee share", error ? DASH : money(result.epfEmployee)],
            ["ESI — employee share", error ? DASH : money(result.esiEmployee)],
            ["Advance recovered", error ? DASH : money(result.advanceDeducted)],
            ["Total deductions", error ? DASH : money(result.totalDeductions)],
            ["EPF — employer share plus admin", error ? DASH : money(result.epfEmployerTotal)],
            ["ESI — employer share", error ? DASH : money(result.esiEmployer)],
            ["Hours worked in the month", error ? DASH : `${fmt(result.totalHours)} h`],
            ["Average hours per week", error ? DASH : `${fmt(result.weeklyHours)} h`],
            ["Cost to employer per hour", error ? DASH : money(result.effectiveCostPerHour)],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>

        {!error && result.overWeeklyLimit ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {fmt(result.weeklyHours)} hours a week is above the {NORMAL_HOURS_PER_WEEK}-hour normal
            working week set by the Motor Transport Workers Act, 1961 — check the overtime and rest-day
            entries against the roster.
          </p>
        ) : null}

        {!error && result.esiOverCeiling ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Gross this month exceeds the {money(ESI_WAGE_CEILING)} ESI wage ceiling, so no ESI has
            been applied. Coverage continues to the end of the running contribution period once an
            employee is already insured.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How overtime is worked out</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The ordinary rate is the monthly wage divided by the contracted hours — duty days times
          duty hours. Section 26 of the Motor Transport Workers Act, 1961 requires overtime at twice
          that ordinary rate, so 20 extra hours on a {money(18000)} monthly wage over 208 contracted
          hours is 20 × {money(86.54)} × 2. This is a pay worksheet, not legal advice: state minimum
          wage notifications set the floor rates for drivers and should be checked for the driver's
          own state and skill category.
        </p>
      </section>
    </main>
  );
}
