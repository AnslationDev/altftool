"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  price: 135000,
  downPayment: 20000,
  rate: 11.5,
  months: 36,
  fee: 1500,
  income: 40000,
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
  const [months, setMonths] = useState(String(DEFAULTS.months));
  const [fee, setFee] = useState(String(DEFAULTS.fee));
  const [income, setIncome] = useState(String(DEFAULTS.income));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const p = toNumber(price);
    const dp = toNumber(downPayment);
    const r = toNumber(rate);
    const n = toNumber(months);
    const f = toNumber(fee);
    const inc = toNumber(income);

    if ([p, dp, r, n, f, inc].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (p <= 0) return { error: "On-road price must be greater than zero." };
    if (dp < 0 || f < 0 || inc < 0) return { error: "Amounts cannot be negative." };
    if (dp >= p) return { error: "Down payment must be less than the on-road price." };
    if (r < 0 || r > 40) return { error: "Two wheeler loan rates are usually between 0% and 40% per year." };
    if (n < 6 || n > 60) return { error: "Two wheeler loan tenure is usually 6 to 60 months." };

    const term = Math.round(n);
    const loan = p - dp;
    const emi = computeEmi(loan, r, term);
    const { rows, totalInterest } = buildSchedule(loan, r, term, emi);
    const totalRepayment = loan + totalInterest;
    const totalCost = dp + totalRepayment + f;
    const ltv = (loan / p) * 100;
    const emiToIncome = inc > 0 ? (emi / inc) * 100 : null;

    return {
      price: p,
      downPayment: dp,
      loan,
      emi,
      term,
      totalInterest,
      totalRepayment,
      fee: f,
      totalCost,
      ltv,
      downShare: (dp / p) * 100,
      emiToIncome,
      interestShare: totalRepayment > 0 ? (totalInterest / totalRepayment) * 100 : 0,
      rows,
    };
  }, [price, downPayment, rate, months, fee, income]);

  const affordability = useMemo(() => {
    if (calc.error || calc.emiToIncome === null) return null;
    if (calc.emiToIncome <= 10) {
      return { tone: "success", text: "Comfortable — the EMI is under 10% of your monthly income." };
    }
    if (calc.emiToIncome <= 20) {
      return { tone: "primary", text: "Manageable — keep total EMIs across all loans under 40% of income." };
    }
    return {
      tone: "danger",
      text: "Stretched — over 20% of income on a two wheeler EMI leaves little room for fuel, service and insurance.",
    };
  }, [calc]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Two Wheeler Loan Calculator",
      `On-road price: ${money(calc.price)}`,
      `Down payment: ${money(calc.downPayment)} (${pct(calc.downShare)})`,
      `Loan amount: ${money(calc.loan)} (LTV ${pct(calc.ltv)})`,
      `Interest rate: ${NUM.format(toNumber(rate))}% per year`,
      `Tenure: ${calc.term} months`,
      `Monthly EMI: ${money(calc.emi)}`,
      `Total interest: ${money(calc.totalInterest)}`,
      `Processing fee: ${money(calc.fee)}`,
      `Total cost of the bike: ${money(calc.totalCost)}`,
    ].join("\n");
  }, [calc, rate]);

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
    setPrice(String(DEFAULTS.price));
    setDownPayment(String(DEFAULTS.downPayment));
    setRate(String(DEFAULTS.rate));
    setMonths(String(DEFAULTS.months));
    setFee(String(DEFAULTS.fee));
    setIncome(String(DEFAULTS.income));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Bike &amp; scooter loan
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Two Wheeler Loan Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the on-road price, what you can put down and the tenure to get your bike loan EMI,
          total interest, loan-to-value ratio and whether the EMI fits your monthly income.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-price">
              On-road price (INR)
            </label>
            <input
              id="tw-price"
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
            <label className={LABEL_CLASS} htmlFor="tw-down">
              Down payment (INR)
            </label>
            <input
              id="tw-down"
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
            <label className={LABEL_CLASS} htmlFor="tw-rate">
              Interest rate (% per year)
            </label>
            <input
              id="tw-rate"
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
            <label className={LABEL_CLASS} htmlFor="tw-months">
              Tenure (months)
            </label>
            <input
              id="tw-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="6"
              max="60"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-fee">
              Processing / documentation fee (INR)
            </label>
            <input
              id="tw-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={fee}
              onChange={(event) => setFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-income">
              Your monthly income (INR, optional)
            </label>
            <input
              id="tw-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 10, 20, 30].map((share) => (
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
          {[12, 24, 36, 48].map((preset) => (
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
                  {calc.term} instalments on a {money(calc.loan)} two wheeler loan
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy two wheeler loan result"
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
                ["Loan amount financed", money(calc.loan)],
                ["Down payment", `${money(calc.downPayment)} (${pct(calc.downShare)})`],
                ["Loan-to-value (LTV)", pct(calc.ltv)],
                ["Total interest payable", money(calc.totalInterest)],
                ["Total repayment", money(calc.totalRepayment)],
                ["Processing / documentation fee", money(calc.fee)],
                ["Total cost of the bike", money(calc.totalCost)],
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

            {affordability && (
              <p
                className={
                  affordability.tone === "danger"
                    ? "mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                    : affordability.tone === "success"
                      ? "mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--success)]"
                      : "mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--primary)]"
                }
              >
                EMI is {pct(calc.emiToIncome)} of your monthly income. {affordability.text}
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Year-by-year repayment</h2>
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
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Dealership finance schemes may quote a flat rate rather than reducing balance,
        and running costs such as fuel, servicing and annual insurance renewal sit on top of the EMI.
      </p>
    </main>
  );
}
