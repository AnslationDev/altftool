"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  amount: 1500000,
  rate: 9.5,
  courseYears: 4,
  graceMonths: 6,
  repayYears: 10,
  mode: "capitalise",
  concession: 1,
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

/** Standard reducing-balance EMI; handles the 0% interest case. */
export function computeEmi(principal, annualRate, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

/**
 * Education loan maths.
 * During the moratorium (course period + grace) banks charge SIMPLE interest on
 * the outstanding loan. If the student does not service it, that interest is
 * capitalised — added to the principal — and the EMI is computed on the larger
 * amount. If it is serviced monthly, the principal stays untouched and most
 * banks give a rate concession.
 */
export function computeEducationLoan({
  amount,
  annualRate,
  moratoriumMonths,
  repayMonths,
  servicing,
  concession,
}) {
  const rate = servicing ? Math.max(0, annualRate - concession) : annualRate;
  const simpleInterest = (amount * rate * (moratoriumMonths / 12)) / 100;
  const capitalised = servicing ? amount : amount + simpleInterest;
  const emi = computeEmi(capitalised, rate, repayMonths);
  const monthlyDuringStudy = servicing ? (amount * rate) / 12 / 100 : 0;
  const paidDuringMoratorium = servicing ? monthlyDuringStudy * moratoriumMonths : 0;
  const repaymentInterest = emi * repayMonths - capitalised;
  const totalInterest = servicing
    ? paidDuringMoratorium + repaymentInterest
    : simpleInterest + repaymentInterest;
  return {
    effectiveRate: rate,
    simpleInterest,
    capitalised,
    emi,
    monthlyDuringStudy,
    paidDuringMoratorium,
    repaymentInterest,
    totalInterest,
    totalOutgo: paidDuringMoratorium + emi * repayMonths,
  };
}

export default function ToolHome() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [courseYears, setCourseYears] = useState(String(DEFAULTS.courseYears));
  const [graceMonths, setGraceMonths] = useState(String(DEFAULTS.graceMonths));
  const [repayYears, setRepayYears] = useState(String(DEFAULTS.repayYears));
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [concession, setConcession] = useState(String(DEFAULTS.concession));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const p = toNumber(amount);
    const r = toNumber(rate);
    const cy = toNumber(courseYears);
    const gm = toNumber(graceMonths);
    const ry = toNumber(repayYears);
    const con = toNumber(concession);

    if ([p, r, cy, gm, ry, con].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (p <= 0) return { error: "Loan amount must be greater than zero." };
    if (r < 0 || r > 30) return { error: "Interest rate should be between 0% and 30% per year." };
    if (cy < 0 || cy > 10) return { error: "Course duration should be between 0 and 10 years." };
    if (gm < 0 || gm > 24) return { error: "Grace period is usually 0 to 24 months after the course." };
    if (ry <= 0 || ry > 20) return { error: "Repayment tenure should be between 1 and 20 years." };
    if (con < 0 || con > 5) return { error: "Rate concession should be between 0 and 5 percentage points." };

    const moratoriumMonths = Math.round(cy * 12 + gm);
    const repayMonths = Math.round(ry * 12);
    const servicing = mode === "servicing";
    const result = computeEducationLoan({
      amount: p,
      annualRate: r,
      moratoriumMonths,
      repayMonths,
      servicing,
      concession: con,
    });

    return {
      ...result,
      principal: p,
      moratoriumMonths,
      repayMonths,
      servicing,
      totalMonths: moratoriumMonths + repayMonths,
    };
  }, [amount, rate, courseYears, graceMonths, repayYears, mode, concession]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Education Loan EMI Calculator",
      `Loan sanctioned: ${money(calc.principal)}`,
      `Rate applied: ${num(calc.effectiveRate)}% per year`,
      `Moratorium: ${calc.moratoriumMonths} months (course + grace)`,
      `Repayment tenure: ${calc.repayMonths} months`,
      calc.servicing
        ? `Interest paid monthly while studying: ${money(calc.monthlyDuringStudy)}`
        : `Simple interest accrued in moratorium: ${money(calc.simpleInterest)}`,
      `Principal at EMI start: ${money(calc.capitalised)}`,
      `Monthly EMI: ${money(calc.emi)}`,
      `Total interest: ${money(calc.totalInterest)}`,
      `Total repayment: ${money(calc.totalOutgo)}`,
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
    setAmount(String(DEFAULTS.amount));
    setRate(String(DEFAULTS.rate));
    setCourseYears(String(DEFAULTS.courseYears));
    setGraceMonths(String(DEFAULTS.graceMonths));
    setRepayYears(String(DEFAULTS.repayYears));
    setMode(DEFAULTS.mode);
    setConcession(String(DEFAULTS.concession));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Education loan
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Education Loan EMI Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Model the full life of a student loan: simple interest through the course moratorium, the
          capitalised principal when EMIs begin, and how much you save by servicing interest while
          studying.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="el-amount">
              Loan amount (INR)
            </label>
            <input
              id="el-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-rate">
              Interest rate (% per year)
            </label>
            <input
              id="el-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-course">
              Course duration (years)
            </label>
            <input
              id="el-course"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.5"
              value={courseYears}
              onChange={(event) => setCourseYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-grace">
              Grace period after course (months)
            </label>
            <input
              id="el-grace"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="24"
              step="1"
              value={graceMonths}
              onChange={(event) => setGraceMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-repay">
              Repayment tenure (years)
            </label>
            <input
              id="el-repay"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="20"
              step="1"
              value={repayYears}
              onChange={(event) => setRepayYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-mode">
              During the moratorium
            </label>
            <select
              id="el-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="capitalise">Pay nothing — interest is capitalised</option>
              <option value="servicing">Pay simple interest every month</option>
            </select>
          </div>
          {mode === "servicing" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="el-concession">
                Rate concession for servicing (% points)
              </label>
              <input
                id="el-concession"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="5"
                step="0.25"
                value={concession}
                onChange={(event) => setConcession(event.target.value)}
              />
            </div>
          )}
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
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  EMI after the moratorium
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.emi)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Starts in month {calc.moratoriumMonths + 1} and runs for {calc.repayMonths} months
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy education loan EMI result"
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
                ["Rate applied", `${num(calc.effectiveRate)}% per year`],
                ["Moratorium length", `${calc.moratoriumMonths} months`],
                calc.servicing
                  ? ["Interest you pay each month while studying", money(calc.monthlyDuringStudy)]
                  : ["Simple interest accrued during moratorium", money(calc.simpleInterest)],
                calc.servicing
                  ? ["Interest paid across the moratorium", money(calc.paidDuringMoratorium)]
                  : ["Interest capitalised into the principal", money(calc.simpleInterest)],
                ["Principal when EMIs begin", money(calc.capitalised)],
                ["Interest during the repayment phase", money(calc.repaymentInterest)],
                ["Total interest over the whole loan", money(calc.totalInterest)],
                ["Total amount you repay", money(calc.totalOutgo)],
                ["Total loan life", `${calc.totalMonths} months`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Repayment timeline</h2>
            <ol className="mt-3 space-y-3 text-sm">
              <li className="rounded-md bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                <p className="font-semibold">
                  Months 1–{calc.moratoriumMonths}: study + grace period
                </p>
                <p className="mt-1 text-[var(--muted-foreground)]">
                  {calc.servicing
                    ? `You pay ${money(calc.monthlyDuringStudy)} a month as simple interest, so the principal stays at ${money(calc.principal)}.`
                    : `Nothing is payable. Simple interest of ${money(calc.simpleInterest)} builds up and is added to the loan.`}
                </p>
              </li>
              <li className="rounded-md bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                <p className="font-semibold">
                  Months {calc.moratoriumMonths + 1}–{calc.totalMonths}: EMI phase
                </p>
                <p className="mt-1 text-[var(--muted-foreground)]">
                  {money(calc.emi)} a month on a balance of {money(calc.capitalised)} at{" "}
                  {num(calc.effectiveRate)}% reducing balance.
                </p>
              </li>
            </ol>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Servicing interest during the course avoids capitalisation and usually earns a rate
              concession — switch the dropdown to compare both routes on the same numbers.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Banks disburse education loans in tranches per semester, so real
        moratorium interest is usually lower than a full-amount calculation, and rules on concessions,
        collateral and subsidy schemes differ by lender.
      </p>
    </main>
  );
}
