"use client";

import { useMemo, useState } from "react";
import { Car, Check, Copy, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  price: 1200000,
  downPayment: 240000,
  rate: 9.5,
  years: 5,
  processingFee: 5000,
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

/** Standard reducing-balance EMI. Handles the 0% interest case. */
function computeEmi(principal, annualRate, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
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
  const [price, setPrice] = useState(String(DEFAULTS.price));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [processingFee, setProcessingFee] = useState(String(DEFAULTS.processingFee));
  const [insurance, setInsurance] = useState(String(DEFAULTS.insurance));
  const [showSchedule, setShowSchedule] = useState(true);
  const { copy: copyToClipboard, isCopied, announcement } = useCopyToClipboard();

  const calc = useMemo(() => {
    const p = toNumber(price);
    const dp = toNumber(downPayment);
    const r = toNumber(rate);
    const y = toNumber(years);
    const fee = toNumber(processingFee);
    const ins = toNumber(insurance);

    if ([p, dp, r, y, fee, ins].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (p <= 0) return { error: "On-road price must be greater than zero." };
    if (dp < 0 || fee < 0 || ins < 0) return { error: "Amounts cannot be negative." };
    if (dp >= p) return { error: "Down payment must be less than the on-road price." };
    if (r < 0 || r > 60) return { error: "Interest rate should be between 0% and 60% per year." };
    if (y <= 0 || y > 10) return { error: "Car loan tenure is usually between 1 and 10 years." };

    const months = Math.round(y * 12);
    const loan = p - dp;
    const emi = computeEmi(loan, r, months);
    const { rows, totalInterest } = buildSchedule(loan, r, months, emi);
    const totalRepayment = loan + totalInterest;
    const totalCost = dp + totalRepayment + fee + ins;

    return {
      loan,
      emi,
      months,
      totalInterest,
      totalRepayment,
      totalCost,
      downPaymentShare: (dp / p) * 100,
      interestShare: totalRepayment > 0 ? (totalInterest / totalRepayment) * 100 : 0,
      rows,
      fee,
      ins,
      downPayment: dp,
      price: p,
    };
  }, [price, downPayment, rate, years, processingFee, insurance]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Car Loan EMI Calculator",
      `On-road price: ${money(calc.price)}`,
      `Down payment: ${money(calc.downPayment)} (${pct(calc.downPaymentShare)})`,
      `Loan amount: ${money(calc.loan)}`,
      `Interest rate: ${NUM.format(toNumber(rate))}% per year`,
      `Tenure: ${calc.months} months`,
      `Monthly EMI: ${money(calc.emi)}`,
      `Total interest: ${money(calc.totalInterest)}`,
      `Total repayment: ${money(calc.totalRepayment)}`,
      `Total cost of ownership: ${money(calc.totalCost)}`,
    ].join("\n");
  }, [calc, rate]);

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "the car loan EMI result" });
  };

  const reset = () => {
    setPrice(String(DEFAULTS.price));
    setDownPayment(String(DEFAULTS.downPayment));
    setRate(String(DEFAULTS.rate));
    setYears(String(DEFAULTS.years));
    setProcessingFee(String(DEFAULTS.processingFee));
    setInsurance(String(DEFAULTS.insurance));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Car className="h-4 w-4" aria-hidden="true" />
          Car loan
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Car Loan EMI Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out your monthly EMI, total interest and full amortisation after down payment,
          processing fee and insurance — using the same reducing-balance formula banks use.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="car-price">
              On-road price (INR)
            </label>
            <input
              id="car-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="car-down">
              Down payment (INR)
            </label>
            <input
              id="car-down"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={downPayment}
              onChange={(event) => setDownPayment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="car-rate">
              Interest rate (% per year)
            </label>
            <input
              id="car-rate"
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
            <label className={LABEL_CLASS} htmlFor="car-years">
              Tenure (years)
            </label>
            <input
              id="car-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="0.5"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="car-fee">
              Processing fee (INR)
            </label>
            <input
              id="car-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={processingFee}
              onChange={(event) => setProcessingFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="car-insurance">
              Add-ons / insurance paid upfront (INR)
            </label>
            <input
              id="car-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={insurance}
              onChange={(event) => setInsurance(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[10, 15, 20, 25].map((share) => (
            <button
              key={share}
              type="button"
              onClick={() => {
                const p = toNumber(price);
                if (!Number.isFinite(p) || p <= 0) return;
                setDownPayment(String(Math.round((p * share) / 100)));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {share}% down
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
          <section
            aria-live="polite"
            role="status"
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Monthly EMI
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{money(calc.emi)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {calc.months} monthly instalments on a {money(calc.loan)} loan
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label={isCopied("result") ? "Copied the car loan EMI result" : "Copy car loan EMI result"}
                  className={GHOST_BTN}
                >
                  {isCopied("result") ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isCopied("result") ? "Copied!" : "Copy result"}
                </button>
                <span className="sr-only" role="status" aria-live="polite">
                  {announcement}
                </span>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Loan amount (financed)", money(calc.loan)],
                ["Down payment", `${money(calc.downPayment)} (${pct(calc.downPaymentShare)} of price)`],
                ["Total interest payable", money(calc.totalInterest)],
                ["Total repayment (principal + interest)", money(calc.totalRepayment)],
                ["Interest as share of repayment", pct(calc.interestShare)],
                ["Processing fee", money(calc.fee)],
                ["Upfront add-ons / insurance", money(calc.ins)],
                ["Total cash outgo for the car", money(calc.totalCost)],
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
              <h2 className="text-base font-semibold">Year-by-year amortisation</h2>
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
                      <th scope="col" className="py-2 pr-3 font-semibold">Year</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Principal</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Interest</th>
                      <th scope="col" className="py-2 text-right font-semibold">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.rows.map((row) => (
                      <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{row.year}</td>
                        <td className="py-2 pr-3 text-right">{money(row.principal)}</td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{money(row.interest)}</td>
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
        Estimates only. Lenders may quote a flat rate, add GST on the processing fee, or apply
        documentation and hypothecation charges — always confirm the amortisation schedule in your
        sanction letter.
      </p>
    </main>
  );
}
