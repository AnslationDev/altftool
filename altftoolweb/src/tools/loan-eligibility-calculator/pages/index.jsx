"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UserCheck } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  income: 80000,
  otherIncome: 0,
  otherWeight: 50,
  obligations: 12000,
  foir: 50,
  rate: 9,
  years: 15,
};

const TENURE_OPTIONS = [5, 10, 15, 20, 25, 30];

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

/** Largest loan a given EMI can service — present value of the EMI stream. */
function loanFromEmi(emi, annualRate, months) {
  if (!(emi > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return emi * months;
  return (emi * (1 - Math.pow(1 + r, -months))) / r;
}

export default function ToolHome() {
  const [income, setIncome] = useState(String(DEFAULTS.income));
  const [otherIncome, setOtherIncome] = useState(String(DEFAULTS.otherIncome));
  const [otherWeight, setOtherWeight] = useState(String(DEFAULTS.otherWeight));
  const [obligations, setObligations] = useState(String(DEFAULTS.obligations));
  const [foir, setFoir] = useState(String(DEFAULTS.foir));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const salary = toNumber(income);
    const other = toNumber(otherIncome);
    const weight = toNumber(otherWeight);
    const obl = toNumber(obligations);
    const foirPct = toNumber(foir);
    const r = toNumber(rate);
    const y = toNumber(years);

    const all = [salary, other, weight, obl, foirPct, r, y];
    if (all.some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (all.some((value) => value < 0)) return { error: "Values cannot be negative." };
    if (salary <= 0) return { error: "Monthly net salary must be greater than zero." };
    if (weight > 100) return { error: "Share of other income counted cannot exceed 100%." };
    if (foirPct <= 0 || foirPct > 80) {
      return { error: "FOIR is normally between 30% and 60% of assessed income." };
    }
    if (r > 40) return { error: "Interest rate should be between 0% and 40% per year." };
    if (y <= 0 || y > 35) return { error: "Tenure should be between 1 and 35 years." };

    const months = Math.round(y * 12);
    const countedOther = (other * weight) / 100;
    const assessedIncome = salary + countedOther;
    const foirAllowance = (assessedIncome * foirPct) / 100;
    const eligibleEmi = foirAllowance - obl;

    if (!(eligibleEmi > 0)) {
      return {
        error: `Your existing EMIs of ${money(obl)} already exceed the ${pct(foirPct)} FOIR allowance of ${money(foirAllowance)} — no new loan is possible at these numbers.`,
      };
    }

    const eligibleLoan = loanFromEmi(eligibleEmi, r, months);
    const totalRepayment = eligibleEmi * months;
    const totalInterest = totalRepayment - eligibleLoan;

    const tenureYearsList = Array.from(new Set([...TENURE_OPTIONS, y])).sort((a, b) => a - b);
    const tenureRows = tenureYearsList.map((option) => ({
      years: option,
      isSelected: option === y,
      loan: loanFromEmi(eligibleEmi, r, option * 12),
      interest: eligibleEmi * option * 12 - loanFromEmi(eligibleEmi, r, option * 12),
    }));

    const foirRows = [40, 50, 55, 60].map((band) => {
      const allowance = (assessedIncome * band) / 100;
      const emi = allowance - obl;
      return {
        band,
        emi: Math.max(0, emi),
        loan: emi > 0 ? loanFromEmi(emi, r, months) : 0,
      };
    });

    return {
      months,
      assessedIncome,
      countedOther,
      foirAllowance,
      eligibleEmi,
      eligibleLoan,
      totalRepayment,
      totalInterest,
      obligationRatio: (obl / assessedIncome) * 100,
      emiShare: (eligibleEmi / assessedIncome) * 100,
      tenureRows,
      foirRows,
      rateUsed: r,
      foirUsed: foirPct,
      foirAboveLenderRange: foirPct > 60,
    };
  }, [income, otherIncome, otherWeight, obligations, foir, rate, years]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Loan Eligibility Calculator",
      `Assessed monthly income: ${money(calc.assessedIncome)}`,
      `FOIR applied: ${pct(calc.foirUsed)} → ${money(calc.foirAllowance)} allowance`,
      `EMI you can still take on: ${money(calc.eligibleEmi)}`,
      `Eligible loan amount: ${money(calc.eligibleLoan)}`,
      `At ${NUM.format(calc.rateUsed)}% for ${calc.months} months`,
      `Total repayment: ${money(calc.totalRepayment)}`,
      `Total interest: ${money(calc.totalInterest)}`,
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
    setIncome(String(DEFAULTS.income));
    setOtherIncome(String(DEFAULTS.otherIncome));
    setOtherWeight(String(DEFAULTS.otherWeight));
    setObligations(String(DEFAULTS.obligations));
    setFoir(String(DEFAULTS.foir));
    setRate(String(DEFAULTS.rate));
    setYears(String(DEFAULTS.years));
    setCopied(false);
  };

  const fields = [
    { id: "elig-income", label: "Monthly net salary (INR)", value: income, set: setIncome, step: "1000" },
    {
      id: "elig-other",
      label: "Other monthly income — rent, business (INR)",
      value: otherIncome,
      set: setOtherIncome,
      step: "1000",
    },
    {
      id: "elig-weight",
      label: "Share of other income the lender counts (%)",
      value: otherWeight,
      set: setOtherWeight,
      step: "5",
    },
    {
      id: "elig-obligations",
      label: "Existing EMIs and card dues (INR / month)",
      value: obligations,
      set: setObligations,
      step: "500",
    },
    { id: "elig-foir", label: "FOIR limit applied (%)", value: foir, set: setFoir, step: "1" },
    { id: "elig-rate", label: "Interest rate (% per year)", value: rate, set: setRate, step: "0.05" },
    { id: "elig-years", label: "Tenure (years)", value: years, set: setYears, step: "1" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UserCheck className="h-4 w-4" aria-hidden="true" />
          Eligibility
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Loan Eligibility Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the loan amount a lender would sanction: your assessed income, minus running
          obligations, capped by FOIR and converted into a loan with the reducing-balance formula.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TENURE_OPTIONS.map((option) => {
            const isActive = toNumber(years) === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setYears(String(option))}
                aria-pressed={isActive}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  isActive
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {option}y
              </button>
            );
          })}
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            aria-live="polite"
            role="status"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Loan you are eligible for
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.eligibleLoan)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money(calc.eligibleEmi)} EMI for {calc.months} months at{" "}
                  {NUM.format(calc.rateUsed)}% per year
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy loan eligibility result"
                  className={GHOST_BTN}
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

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Assessed monthly income", money(calc.assessedIncome)],
                ["Other income counted", money(calc.countedOther)],
                [`FOIR allowance at ${pct(calc.foirUsed)}`, money(calc.foirAllowance)],
                ["Existing obligations", `${money(toNumber(obligations))} (${pct(calc.obligationRatio)} of income)`],
                ["EMI available for the new loan", money(calc.eligibleEmi)],
                ["New EMI as share of income", pct(calc.emiShare)],
                ["Total repayment over the tenure", money(calc.totalRepayment)],
                ["Total interest", money(calc.totalInterest)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {calc.foirAboveLenderRange ? (
              <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]">
                A {pct(calc.foirUsed)} FOIR is above the 40%&ndash;60% range most Indian banks and
                NBFCs actually use (see the FAQ below). Treat this figure as a stretch scenario, not
                what a lender is likely to sanction &mdash; lower the FOIR limit toward 60% or below
                for a realistic estimate.
              </p>
            ) : null}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Eligibility by tenure</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Same {money(calc.eligibleEmi)} EMI, different tenures at {NUM.format(calc.rateUsed)}%.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Tenure</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Eligible loan</th>
                    <th scope="col" className="py-2 text-right font-semibold">Total interest</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.tenureRows.map((row) => (
                    <tr
                      key={row.years}
                      className={`border-b border-[var(--border)] last:border-0 ${
                        row.isSelected ? "bg-[var(--primary)]/10" : ""
                      }`}
                    >
                      <td className="py-2 pr-3 font-semibold">
                        {row.years} years
                        {row.isSelected ? (
                          <span className="ml-2 rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--primary-text)]">
                            Your tenure
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 text-right">{money(row.loan)}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {money(row.interest)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">If the lender applies a different FOIR</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">FOIR</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">EMI room</th>
                    <th scope="col" className="py-2 text-right font-semibold">Eligible loan</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.foirRows.map((row) => (
                    <tr key={row.band} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.band}%</td>
                      <td className="py-2 pr-3 text-right">{money(row.emi)}</td>
                      <td className="py-2 text-right">{money(row.loan)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Actual sanction depends on your credit score, employer
        category, age at loan maturity, property or asset value and the lender&apos;s internal
        policy — the FOIR test is only the first filter.
      </p>
    </main>
  );
}
