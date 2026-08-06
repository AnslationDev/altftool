"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  AVAILABLE_YEARS,
  CONTRIBUTION_SOURCE_URL,
  CONTRIBUTION_YEARS,
  CPP_BASIC_EXEMPTION,
  PAY_PERIOD_OPTIONS,
  computeCppEi,
} from "../lib";

const CAD = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const CAD0 = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-CA", { maximumFractionDigits: 2 });

const money = (value) => CAD.format(Number.isFinite(value) ? value : 0);
const money0 = (value) => CAD0.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const LATEST = AVAILABLE_YEARS[0];
const LATEST_PARAMS = CONTRIBUTION_YEARS[LATEST];
const CUSTOM = "custom";

const DEFAULTS = {
  earnings: "75000",
  yearChoice: String(LATEST),
  inQuebec: false,
  selfEmployed: false,
  eiOptIn: false,
  payPeriods: "26",
  ympe: String(LATEST_PARAMS.ympe),
  yampe: String(LATEST_PARAMS.yampe),
  eiMie: String(LATEST_PARAMS.eiMaxInsurableEarnings),
  pensionRate: String(LATEST_PARAMS.cppEmployeeRate * 100),
  eiRate: String(LATEST_PARAMS.eiRateOutsideQuebec * 100),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").replace(/\$/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [earnings, setEarnings] = useState(DEFAULTS.earnings);
  const [yearChoice, setYearChoice] = useState(DEFAULTS.yearChoice);
  const [inQuebec, setInQuebec] = useState(DEFAULTS.inQuebec);
  const [selfEmployed, setSelfEmployed] = useState(DEFAULTS.selfEmployed);
  const [eiOptIn, setEiOptIn] = useState(DEFAULTS.eiOptIn);
  const [payPeriods, setPayPeriods] = useState(DEFAULTS.payPeriods);
  const [ympe, setYmpe] = useState(DEFAULTS.ympe);
  const [yampe, setYampe] = useState(DEFAULTS.yampe);
  const [eiMie, setEiMie] = useState(DEFAULTS.eiMie);
  const [pensionRate, setPensionRate] = useState(DEFAULTS.pensionRate);
  const [eiRate, setEiRate] = useState(DEFAULTS.eiRate);
  const [copied, setCopied] = useState(false);

  const isCustom = yearChoice === CUSTOM;

  const result = useMemo(() => {
    const customParameters = isCustom
      ? {
          year: "custom",
          ympe: toNumber(ympe),
          yampe: toNumber(yampe),
          cppEmployeeRate: toNumber(pensionRate) / 100,
          qppEmployeeRate: toNumber(pensionRate) / 100,
          cpp2Rate: 0.04,
          qpp2Rate: 0.04,
          eiMaxInsurableEarnings: toNumber(eiMie),
          eiRateOutsideQuebec: toNumber(eiRate) / 100,
          eiRateQuebec: toNumber(eiRate) / 100,
        }
      : null;

    return computeCppEi({
      annualEarnings: toNumber(earnings),
      year: isCustom ? LATEST : Number(yearChoice),
      customParameters,
      inQuebec,
      selfEmployed,
      eiOptIn,
      payPeriods: toNumber(payPeriods),
    });
  }, [
    earnings,
    yearChoice,
    isCustom,
    inQuebec,
    selfEmployed,
    eiOptIn,
    payPeriods,
    ympe,
    yampe,
    eiMie,
    pensionRate,
    eiRate,
  ]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Canada CPP and EI Deduction Calculator",
      `Year: ${result.year}${result.inQuebec ? " (Quebec — QPP)" : ""}`,
      `Earnings: ${money(result.annualEarnings)}`,
      `${result.planName} contributory earnings: ${money(result.contributoryEarnings)}`,
      `${result.planName} (employee): ${money(result.employeePension)}`,
      `${result.planName}2 (employee): ${money(result.employeeSecond)}`,
      `EI (employee): ${money(result.employeeEi)}`,
      `Employee total: ${money(result.employeeTotal)}`,
      `Employer total: ${money(result.employerTotal)}`,
      `Combined cost: ${money(result.combinedTotal)}`,
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
    setEarnings(DEFAULTS.earnings);
    setYearChoice(DEFAULTS.yearChoice);
    setInQuebec(DEFAULTS.inQuebec);
    setSelfEmployed(DEFAULTS.selfEmployed);
    setEiOptIn(DEFAULTS.eiOptIn);
    setPayPeriods(DEFAULTS.payPeriods);
    setYmpe(DEFAULTS.ympe);
    setYampe(DEFAULTS.yampe);
    setEiMie(DEFAULTS.eiMie);
    setPensionRate(DEFAULTS.pensionRate);
    setEiRate(DEFAULTS.eiRate);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Canada payroll
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Canada CPP and EI Deduction Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out employee and employer CPP (or QPP in Quebec), the second additional CPP2 tier
          and EI premiums, with the {money0(CPP_BASIC_EXEMPTION)} basic exemption and every annual
          ceiling applied.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cpp-earnings">
              Annual pensionable earnings (CAD)
            </label>
            <input
              id="cpp-earnings"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={earnings}
              onChange={(event) => setEarnings(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpp-year">
              Contribution year
            </label>
            <select
              id="cpp-year"
              className={`mt-2 ${INPUT_CLASS}`}
              value={yearChoice}
              onChange={(event) => setYearChoice(event.target.value)}
            >
              {AVAILABLE_YEARS.map((value) => (
                <option key={value} value={String(value)}>
                  {value}
                </option>
              ))}
              <option value={CUSTOM}>Custom — enter this year&rsquo;s figures</option>
            </select>
            <p className={HINT_CLASS}>
              The CRA publishes new maximums every November. Use Custom for a year not listed.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpp-periods">
              Pay periods per year
            </label>
            <select
              id="cpp-periods"
              className={`mt-2 ${INPUT_CLASS}`}
              value={payPeriods}
              onChange={(event) => setPayPeriods(event.target.value)}
            >
              {PAY_PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isCustom ? (
          <div className="mt-4 grid gap-4 rounded-md border border-[var(--border)] p-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="cpp-ympe">
                YMPE (CAD)
              </label>
              <input
                id="cpp-ympe"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={ympe}
                onChange={(event) => setYmpe(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cpp-yampe">
                YAMPE (CAD)
              </label>
              <input
                id="cpp-yampe"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={yampe}
                onChange={(event) => setYampe(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cpp-mie">
                EI maximum insurable earnings (CAD)
              </label>
              <input
                id="cpp-mie"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={eiMie}
                onChange={(event) => setEiMie(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cpp-rate">
                Employee CPP/QPP rate (%)
              </label>
              <input
                id="cpp-rate"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={pensionRate}
                onChange={(event) => setPensionRate(event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="cpp-ei-rate">
                Employee EI rate (%)
              </label>
              <input
                id="cpp-ei-rate"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={eiRate}
                onChange={(event) => setEiRate(event.target.value)}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-2">
          <label className={CHECK_ROW} htmlFor="cpp-quebec">
            <input
              id="cpp-quebec"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={inQuebec}
              onChange={(event) => setInQuebec(event.target.checked)}
            />
            <span>
              Working in Quebec
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                QPP replaces CPP at a higher rate, and the federal EI rate is lower because QPIP
                covers parental benefits.
              </span>
            </span>
          </label>
          <label className={CHECK_ROW} htmlFor="cpp-self">
            <input
              id="cpp-self"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              checked={selfEmployed}
              onChange={(event) => setSelfEmployed(event.target.checked)}
            />
            <span>
              Self-employed
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                You pay both the employee and employer halves of CPP/QPP.
              </span>
            </span>
          </label>
          {selfEmployed ? (
            <label className={CHECK_ROW} htmlFor="cpp-ei-optin">
              <input
                id="cpp-ei-optin"
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                checked={eiOptIn}
                onChange={(event) => setEiOptIn(event.target.checked)}
              />
              <span>
                Registered for EI special benefits
                <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                  Optional for self-employed people; employee premium only, no employer share.
                </span>
              </span>
            </label>
          ) : null}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Employee deductions for the year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.employeeTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${money(result.perPeriodEmployee)} per pay on ${money(result.perPeriodEarnings)} of earnings`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy CPP and EI deduction result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (result.atPensionMaximum || result.atEiMaximum) ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            {result.atSecondMaximum && result.atEiMaximum
              ? `Earnings are above the YAMPE of ${money0(result.yampe)}, so both ${result.planName} tiers and EI are at their annual maximums.`
              : result.atSecondMaximum
                ? `Earnings are above the YAMPE of ${money0(result.yampe)}, so both ${result.planName} tiers are at their annual maximums. EI premiums continue until the maximum insurable earnings of ${money0(result.eiMaxInsurableEarnings)}.`
                : result.atPensionMaximum && result.atEiMaximum
                  ? `Earnings are above the YMPE of ${money0(result.ympe)}, so the first ${result.planName} tier is maxed out, the 4% second tier has started, and EI premiums have stopped at the maximum insurable earnings of ${money0(result.eiMaxInsurableEarnings)}.`
                  : result.atPensionMaximum
                    ? `Earnings are above the YMPE of ${money0(result.ympe)}, so the first ${result.planName} tier is maxed out and the 4% second tier has started.`
                    : `Earnings are above the EI ceiling of ${money0(result.eiMaxInsurableEarnings)}, so EI premiums stop for the year.`}
          </p>
        ) : null}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Contribution
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Employee
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Employer
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  `${hasError ? "CPP" : result.planName} — first tier`,
                  hasError ? DASH : money(result.employeePension),
                  hasError ? DASH : money(result.employerPension),
                ],
                [
                  `${hasError ? "CPP" : result.planName}2 — second tier`,
                  hasError ? DASH : money(result.employeeSecond),
                  hasError ? DASH : money(result.employerSecond),
                ],
                [
                  "Employment Insurance",
                  hasError ? DASH : money(result.employeeEi),
                  hasError ? DASH : money(result.employerEi),
                ],
                [
                  "Total for the year",
                  hasError ? DASH : money(result.employeeTotal),
                  hasError ? DASH : money(result.employerTotal),
                ],
              ].map(([label, employee, employer]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{label}</td>
                  <td className="py-2.5 pr-3 text-right font-semibold">{employee}</td>
                  <td className="py-2.5 text-right font-semibold">{employer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              `${hasError ? "CPP" : result.planName} contributory earnings (after the ${money0(CPP_BASIC_EXEMPTION)} exemption)`,
              hasError ? DASH : money(result.contributoryEarnings),
            ],
            ["Earnings in the second tier", hasError ? DASH : money(result.secondTierEarnings)],
            ["Insurable earnings for EI", hasError ? DASH : money(result.insurableEarnings)],
            [
              `Rates applied`,
              hasError
                ? DASH
                : `${pct(result.pensionRatePercent)} pension · ${pct(result.secondRatePercent)} second tier · ${pct(result.eiRatePercent)} EI`,
            ],
            ["Combined employee + employer cost", hasError ? DASH : money(result.combinedTotal)],
            ["Employee deductions as a share of pay", hasError ? DASH : pct(result.employeeCostPercent)],
            ["Earnings after these deductions, before income tax", hasError ? DASH : money(result.takeHomeBeforeTax)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax or payroll advice. Income tax is not included. Employers with
        an approved EI premium reduction pay less than 1.4 times the employee premium — check the
        <a
          href={CONTRIBUTION_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2 hover:text-[var(--foreground)]"
        >
          CRA T4127 payroll deductions formulas
        </a>{" "}
        or speak to a payroll professional before remitting.
      </p>
    </main>
  );
}
