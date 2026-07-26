"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wallet } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  amount: 500000,
  rate: 13,
  months: 48,
  feePct: 2,
  gstOnFee: true,
  insurance: 0,
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
 * Effective annual cost: the rate at which the EMI stream discounts back to the
 * cash actually received (loan minus fees deducted upfront). Solved by bisection.
 */
export function effectiveAnnualRate(netDisbursed, emi, months) {
  if (!(netDisbursed > 0) || !(emi > 0) || !(months > 0)) return 0;
  if (emi * months <= netDisbursed) return 0;
  const pv = (monthlyRate) => {
    if (monthlyRate <= 0) return emi * months;
    return (emi * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate;
  };
  let low = 0;
  let high = 1; // 100% per month is a safe upper bound
  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2;
    if (pv(mid) > netDisbursed) low = mid;
    else high = mid;
  }
  const monthly = (low + high) / 2;
  return (Math.pow(1 + monthly, 12) - 1) * 100;
}

function buildSchedule(principal, annualRate, months, emi) {
  const r = annualRate / 12 / 100;
  const rows = [];
  let balance = principal;
  let yearInterest = 0;
  let yearPrincipal = 0;
  let totalInterest = 0;

  for (let month = 1; month <= months; month += 1) {
    const interest = balance * r;
    let principalPaid = emi - interest;
    if (principalPaid > balance || month === months) principalPaid = balance;
    balance = Math.max(0, balance - principalPaid);
    yearInterest += interest;
    yearPrincipal += principalPaid;
    totalInterest += interest;

    if (month % 12 === 0 || month === months) {
      rows.push({
        year: Math.ceil(month / 12),
        principal: yearPrincipal,
        interest: yearInterest,
        balance,
      });
      yearInterest = 0;
      yearPrincipal = 0;
    }
  }

  return { rows, totalInterest };
}

export default function ToolHome() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [months, setMonths] = useState(String(DEFAULTS.months));
  const [feePct, setFeePct] = useState(String(DEFAULTS.feePct));
  const [gstOnFee, setGstOnFee] = useState(DEFAULTS.gstOnFee);
  const [insurance, setInsurance] = useState(String(DEFAULTS.insurance));
  const [showSchedule, setShowSchedule] = useState(true);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const p = toNumber(amount);
    const r = toNumber(rate);
    const n = toNumber(months);
    const fp = toNumber(feePct);
    const ins = toNumber(insurance);

    if ([p, r, n, fp, ins].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (p <= 0) return { error: "Loan amount must be greater than zero." };
    if (r < 0 || r > 60) return { error: "Interest rate should be between 0% and 60% per year." };
    if (n < 1 || n > 120) return { error: "Personal loan tenure is usually 1 to 120 months." };
    if (fp < 0 || fp > 10) return { error: "Processing fee is normally between 0% and 10% of the loan." };
    if (ins < 0) return { error: "Insurance premium cannot be negative." };

    const term = Math.round(n);
    const emi = computeEmi(p, r, term);
    const { rows, totalInterest } = buildSchedule(p, r, term, emi);
    const feeBase = (p * fp) / 100;
    const fee = gstOnFee ? feeBase * 1.18 : feeBase;
    const upfront = fee + ins;
    const netDisbursed = p - upfront;
    const totalRepayment = emi * term;
    const totalCost = totalInterest + upfront;
    const apr = effectiveAnnualRate(netDisbursed, emi, term);

    return {
      principal: p,
      emi,
      term,
      totalInterest,
      totalRepayment,
      feeBase,
      fee,
      insurance: ins,
      upfront,
      netDisbursed,
      totalCost,
      apr,
      interestShare: totalRepayment > 0 ? (totalInterest / totalRepayment) * 100 : 0,
      rows,
    };
  }, [amount, rate, months, feePct, gstOnFee, insurance]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Personal Loan EMI Calculator",
      `Loan amount: ${money(calc.principal)}`,
      `Interest rate: ${NUM.format(toNumber(rate))}% per year (reducing balance)`,
      `Tenure: ${calc.term} months`,
      `Monthly EMI: ${money(calc.emi)}`,
      `Total interest: ${money(calc.totalInterest)}`,
      `Total repayment: ${money(calc.totalRepayment)}`,
      `Processing fee${gstOnFee ? " (incl. 18% GST)" : ""}: ${money(calc.fee)}`,
      `Amount credited to your account: ${money(calc.netDisbursed)}`,
      `Total cost of the loan: ${money(calc.totalCost)}`,
      `Effective annual cost: ${pct(calc.apr)}`,
    ].join("\n");
  }, [calc, rate, gstOnFee]);

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
    setMonths(String(DEFAULTS.months));
    setFeePct(String(DEFAULTS.feePct));
    setGstOnFee(DEFAULTS.gstOnFee);
    setInsurance(String(DEFAULTS.insurance));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wallet className="h-4 w-4" aria-hidden="true" />
          Personal loan
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Personal Loan EMI Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See your monthly EMI, the total interest you will pay, and the real cost once the
          processing fee, GST and insurance are deducted from the disbursal.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-amount">
              Loan amount (INR)
            </label>
            <input
              id="pl-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-rate">
              Interest rate (% per year)
            </label>
            <input
              id="pl-rate"
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
            <label className={LABEL_CLASS} htmlFor="pl-months">
              Tenure (months)
            </label>
            <input
              id="pl-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-fee">
              Processing fee (% of loan)
            </label>
            <input
              id="pl-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.1"
              value={feePct}
              onChange={(event) => setFeePct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-insurance">
              Loan insurance / other upfront charges (INR)
            </label>
            <input
              id="pl-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={insurance}
              onChange={(event) => setInsurance(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="pl-gst"
            >
              <input
                id="pl-gst"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={gstOnFee}
                onChange={(event) => setGstOnFee(event.target.checked)}
              />
              Add 18% GST on the processing fee
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[12, 24, 36, 48, 60].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setMonths(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} mo
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
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Monthly EMI
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.emi)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {calc.term} instalments on a {money(calc.principal)} personal loan
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy personal loan EMI result"
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
                ["Total interest payable", money(calc.totalInterest)],
                ["Total repayment (EMI x tenure)", money(calc.totalRepayment)],
                ["Processing fee", money(calc.feeBase)],
                ["GST on processing fee", money(calc.fee - calc.feeBase)],
                ["Insurance / other upfront charges", money(calc.insurance)],
                ["Net amount credited to you", money(calc.netDisbursed)],
                ["Total cost of borrowing (interest + charges)", money(calc.totalCost)],
                ["Effective annual cost of the loan", pct(calc.apr)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5">
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Principal is ${pct(100 - calc.interestShare)} and interest is ${pct(calc.interestShare)} of total repayment`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, 100 - calc.interestShare))}%` }}
                />
                <span
                  className="block h-full bg-[var(--danger)]"
                  style={{ width: `${Math.max(0, Math.min(100, calc.interestShare))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Principal {pct(100 - calc.interestShare)} · Interest {pct(calc.interestShare)}
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Year-by-year repayment</h2>
              <button
                type="button"
                onClick={() => setShowSchedule((value) => !value)}
                className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                aria-expanded={showSchedule}
              >
                {showSchedule ? "Hide" : "Show"}
              </button>
            </div>
            {showSchedule && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Year
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Principal
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Interest
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.rows.map((row) => (
                      <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{row.year}</td>
                        <td className="py-2 pr-3 text-right">{money(row.principal)}</td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                          {money(row.interest)}
                        </td>
                        <td className="py-2 text-right">{money(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates for information only. Lenders differ on how fees are collected, when the first EMI
        falls due and whether broken-period interest is charged — confirm the figures in your sanction
        letter and key fact statement.
      </p>
    </main>
  );
}
