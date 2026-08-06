"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

/** Statutory EPS wage ceiling since 01-Sep-2014. */
const WAGE_CEILING = 15000;
/** Minimum EPS-95 pension announced by the Government of India. */
const MIN_PENSION = 1000;
/** Reduction / increase factor per year away from the normal age of 58. */
const YEARLY_FACTOR = 0.04;

/**
 * EPS Table D — withdrawal benefit as a multiple of the last drawn wage,
 * paid when contributory service is under 10 years.
 */
const TABLE_D = {
  1: 1.02,
  2: 1.99,
  3: 2.98,
  4: 3.99,
  5: 5.02,
  6: 6.07,
  7: 7.13,
  8: 8.22,
  9: 9.33,
};

const DEFAULTS = {
  salary: "15000",
  service: "30",
  age: "58",
  capped: true,
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

/**
 * EPS-95 monthly pension.
 * Pension = pensionable salary x pensionable service / 70,
 * where 2 bonus years are added once service reaches 20 years.
 * Pension is reduced 4% for each year drawn before 58 and raised 4%
 * for each year deferred after 58 (up to 60).
 */
export function computeEpsPension({ salary, service, age, capped }) {
  const pensionableSalary = capped ? Math.min(salary, WAGE_CEILING) : salary;
  const bonus = service >= 20 ? 2 : 0;
  const pensionableService = service + bonus;
  const base = (pensionableSalary * pensionableService) / 70;

  const yearsEarly = Math.max(0, 58 - age);
  const yearsDeferred = Math.max(0, age - 58);
  const adjustment = 1 - YEARLY_FACTOR * yearsEarly + YEARLY_FACTOR * yearsDeferred;

  const adjusted = base * adjustment;
  const monthly = Math.max(adjusted, MIN_PENSION);

  return {
    pensionableSalary,
    pensionableService,
    bonus,
    base,
    yearsEarly,
    yearsDeferred,
    adjustment,
    adjusted,
    monthly,
    flooredToMinimum: adjusted < MIN_PENSION,
    yearly: monthly * 12,
    widow: monthly * 0.5,
    // Child pension is 25% of the WIDOW's pension (i.e. 12.5% of the member's own
    // pension), not 25% of the member's pension — per EPS-95 family-pension rules.
    child: monthly * 0.5 * 0.25,
  };
}

/** Table D withdrawal benefit for service under 10 years. */
export function computeWithdrawalBenefit(salary, service, capped) {
  const wage = capped ? Math.min(salary, WAGE_CEILING) : salary;
  const wholeYears = Math.max(0, Math.min(9, Math.floor(service)));
  const factor = TABLE_D[wholeYears] || 0;
  return { wage, wholeYears, factor, amount: wage * factor };
}

export default function ToolHome() {
  const [salary, setSalary] = useState(DEFAULTS.salary);
  const [service, setService] = useState(DEFAULTS.service);
  const [age, setAge] = useState(DEFAULTS.age);
  const [capped, setCapped] = useState(DEFAULTS.capped);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const s = toNumber(salary);
    const y = toNumber(service);
    const a = toNumber(age);

    if ([s, y, a].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (s <= 0) return { error: "Pensionable salary must be greater than zero." };
    if (s > 500000) return { error: "Pensionable salary looks too high — enter monthly basic + DA." };
    if (y < 0) return { error: "Years of service cannot be negative." };
    if (y > 45) return { error: "EPS service beyond 45 years is not possible — check the value." };

    // The withdrawal-benefit path (service under 10 years) never uses age, so it must
    // not be blocked by the age-range check below — that check only applies once a
    // monthly pension is actually being calculated.
    if (y < 10) {
      return { eligible: false, ...computeWithdrawalBenefit(s, y, capped), service: y };
    }

    if (a < 50 || a > 60) {
      return { error: "EPS pension can start between age 50 (early) and 60 (deferred)." };
    }

    return { eligible: true, service: y, age: a, ...computeEpsPension({ salary: s, service: y, age: a, capped }) };
  }, [salary, service, age, capped]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    if (!calc.eligible) {
      return [
        "EPS Pension Calculator",
        `Service: ${num(calc.service)} years (under 10 — no monthly pension)`,
        `Wage used: ${money(calc.wage)}`,
        `Table D factor: ${num(calc.factor)}x`,
        `One-time withdrawal benefit: ${money(calc.amount)}`,
      ].join("\n");
    }
    return [
      "EPS Pension Calculator",
      `Pensionable salary: ${money(calc.pensionableSalary)}`,
      `Pensionable service: ${num(calc.pensionableService)} years${calc.bonus ? " (incl. 2 bonus years)" : ""}`,
      `Pension at 58: ${money2(calc.base)} per month`,
      `Age at commencement: ${num(calc.age)}`,
      `Monthly pension: ${money2(calc.monthly)}`,
      `Annual pension: ${money(calc.yearly)}`,
      `Widow / widower pension: ${money2(calc.widow)} per month`,
      `Child pension (each): ${money2(calc.child)} per month`,
    ].join("\n");
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
    setSalary(DEFAULTS.salary);
    setService(DEFAULTS.service);
    setAge(DEFAULTS.age);
    setCapped(DEFAULTS.capped);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          EPS-95
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">EPS Pension Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate the monthly pension payable under the Employees&apos; Pension Scheme, 1995 using
          the statutory formula — pensionable salary × pensionable service ÷ 70 — including the
          two-year service bonus, early-pension reduction and family pension.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eps-salary">
              Pensionable salary — monthly basic + DA (INR)
            </label>
            <input
              id="eps-salary"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={salary}
              onChange={(event) => setSalary(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Average of the last 60 months of contributory wages.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eps-service">
              Years of EPS service
            </label>
            <input
              id="eps-service"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="45"
              step="1"
              value={service}
              onChange={(event) => setService(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eps-age">
              Age when pension starts (50–60)
            </label>
            <input
              id="eps-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="50"
              max="60"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="eps-cap"
            >
              <input
                id="eps-cap"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={capped}
                onChange={(event) => setCapped(event.target.checked)}
              />
              Apply {money(WAGE_CEILING)} wage ceiling
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[50, 55, 58, 60].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setAge(String(option))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              Start at {option}
            </button>
          ))}
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : calc.eligible ? (
        <>
          <section
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Monthly EPS pension
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{money2(calc.monthly)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money(calc.yearly)} a year, payable for life from age {num(calc.age)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy EPS pension result"
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
                ["Pensionable salary used", money(calc.pensionableSalary)],
                [
                  "Pensionable service",
                  `${num(calc.pensionableService)} years${
                    calc.bonus ? ` (${num(calc.service)} actual + 2 bonus)` : ""
                  }`,
                ],
                ["Formula", `${money(calc.pensionableSalary)} × ${num(calc.pensionableService)} ÷ 70`],
                ["Full pension at age 58", `${money2(calc.base)} / month`],
                calc.yearsEarly > 0
                  ? [
                      `Early-pension reduction (${num(calc.yearsEarly)} yr × 4%)`,
                      `− ${money2(calc.base - calc.adjusted)}`,
                    ]
                  : null,
                calc.yearsDeferred > 0
                  ? [
                      `Deferred-pension increase (${num(calc.yearsDeferred)} yr × 4%)`,
                      `+ ${money2(calc.adjusted - calc.base)}`,
                    ]
                  : null,
                calc.flooredToMinimum
                  ? ["Minimum pension floor applied", `${money(MIN_PENSION)} / month`]
                  : null,
                ["Widow / widower pension (50%)", `${money2(calc.widow)} / month`],
                ["Child pension, each (25% of widow's pension, up to 2)", `${money2(calc.child)} / month`],
              ]
                .filter(Boolean)
                .map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
            </dl>
          </section>

          <section
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            aria-live="polite"
          >
            <h2 className="text-base font-semibold">Pension if you start at a different age</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Start age
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Monthly pension
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Vs. age 58
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[50, 52, 54, 56, 58, 59, 60].map((startAge) => {
                    const row = computeEpsPension({
                      salary: toNumber(salary),
                      service: toNumber(service),
                      age: startAge,
                      capped,
                    });
                    const diff = row.monthly - calc.base;
                    return (
                      <tr key={startAge} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{startAge}</td>
                        <td className="py-2 pr-3 text-right">{money2(row.monthly)}</td>
                        <td
                          className={`py-2 text-right ${
                            diff < 0 ? "text-[var(--danger)]" : diff > 0 ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          {diff === 0 ? "—" : `${diff > 0 ? "+" : "−"}${money2(Math.abs(diff))}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                One-time withdrawal benefit
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{money(calc.amount)}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                With under 10 years of service there is no monthly pension — EPS Table D pays a
                lump sum instead.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy EPS withdrawal benefit result"
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
              ["Wage used", money(calc.wage)],
              ["Completed years of service", num(calc.wholeYears)],
              ["Table D multiple", `${num(calc.factor)}× monthly wage`],
              ["Withdrawal benefit", money(calc.amount)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            10 years of eligible service is the minimum for a lifelong EPS pension. You can also
            keep the membership alive with a Scheme Certificate instead of withdrawing.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Actual EPS pension is settled by EPFO and may differ if you
        have service before 16 November 1995 (past-service benefit tables), broken service, or an
        approved higher-pension option on actual wages. Confirm with your EPFO office.
      </p>
    </main>
  );
}
