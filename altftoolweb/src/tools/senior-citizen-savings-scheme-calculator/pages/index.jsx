"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PiggyBank, RotateCcw } from "lucide-react";

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

/** Statutory SCSS limits. */
const MAX_DEPOSIT = 3000000;
const MIN_DEPOSIT = 1000;
/** Deduction ceiling under section 80C of the Income-tax Act, 1961. */
const SECTION_80C_CAP = 150000;
/** TDS threshold on interest for senior citizens under section 194A. */
const TDS_THRESHOLD = 100000;

const DEFAULTS = {
  deposit: "1500000",
  rate: "8.2",
  years: "5",
  slab: "20",
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
 * SCSS pays simple interest every quarter — nothing is reinvested, so the
 * principal is returned untouched at maturity.
 * Quarterly payout = deposit x annual rate / 400.
 */
export function computeScss({ deposit, rate, years, slab }) {
  const quarterly = (deposit * rate) / 400;
  const quarters = Math.round(years * 4);
  const annual = quarterly * 4;
  const totalInterest = quarterly * quarters;
  const maturity = deposit + quarterly; // principal plus the final quarter's payout
  const deduction = Math.min(deposit, SECTION_80C_CAP);
  const taxSaved = (deduction * slab) / 100;
  const taxOnInterest = (annual * slab) / 100;

  const schedule = [];
  for (let q = 1; q <= quarters; q += 1) {
    schedule.push({
      quarter: q,
      year: Math.ceil(q / 4),
      payout: quarterly,
      cumulative: quarterly * q,
    });
  }

  return {
    quarterly,
    monthlyEquivalent: annual / 12,
    annual,
    quarters,
    totalInterest,
    maturity,
    totalReceived: deposit + totalInterest,
    deduction,
    taxSaved,
    taxOnInterest,
    tdsApplies: annual > TDS_THRESHOLD,
    effectiveAfterTax: annual - taxOnInterest,
    schedule,
  };
}

export default function ToolHome() {
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [showSchedule, setShowSchedule] = useState(false);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const d = toNumber(deposit);
    const r = toNumber(rate);
    const y = toNumber(years);
    const s = toNumber(slab);

    if ([d, r, y, s].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (d < MIN_DEPOSIT) {
      return { error: `The minimum SCSS deposit is ${money(MIN_DEPOSIT)}.` };
    }
    if (d > MAX_DEPOSIT) {
      return { error: `SCSS deposits are capped at ${money(MAX_DEPOSIT)} per individual.` };
    }
    if (r <= 0 || r > 20) {
      return { error: "Enter an interest rate between 0% and 20% per year." };
    }
    if (y <= 0 || y > 8) {
      return { error: "SCSS runs for 5 years and can be extended by 3 more — use 1 to 8 years." };
    }
    if (s < 0 || s > 45) {
      return { error: "Enter a tax slab between 0% and 45%." };
    }

    return { deposit: d, rate: r, years: y, slab: s, ...computeScss({ deposit: d, rate: r, years: y, slab: s }) };
  }, [deposit, rate, years, slab]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Senior Citizen Savings Scheme Calculator",
      `Deposit: ${money(calc.deposit)}`,
      `Interest rate: ${num(calc.rate)}% per year, paid quarterly`,
      `Tenure: ${num(calc.years)} years (${calc.quarters} quarterly payouts)`,
      `Quarterly interest payout: ${money2(calc.quarterly)}`,
      `Annual interest income: ${money2(calc.annual)}`,
      `Total interest over the term: ${money2(calc.totalInterest)}`,
      `Maturity amount (principal returned): ${money(calc.deposit)}`,
      `Total received (principal + interest): ${money2(calc.totalReceived)}`,
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
    setDeposit(DEFAULTS.deposit);
    setRate(DEFAULTS.rate);
    setYears(DEFAULTS.years);
    setSlab(DEFAULTS.slab);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          SCSS
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Senior Citizen Savings Scheme Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See exactly what a Senior Citizen Savings Scheme deposit pays out each quarter, what it
          adds up to over the full term, and how the 80C deduction and TDS threshold affect the
          money that actually reaches your bank account.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="scss-deposit">
              Deposit amount (INR)
            </label>
            <input
              id="scss-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_DEPOSIT}
              max={MAX_DEPOSIT}
              step="1000"
              value={deposit}
              onChange={(event) => setDeposit(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              In multiples of ₹1,000, up to {money(MAX_DEPOSIT)} per person.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scss-rate">
              Interest rate (% per year)
            </label>
            <input
              id="scss-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.1"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The Ministry of Finance notifies this rate every quarter.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scss-years">
              Tenure (years)
            </label>
            <input
              id="scss-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="8"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scss-slab">
              Your income-tax slab (%)
            </label>
            <select
              id="scss-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slab}
              onChange={(event) => setSlab(event.target.value)}
            >
              {["0", "5", "10", "15", "20", "30"].map((value) => (
                <option key={value} value={value}>
                  {value}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["5 years", "5"],
            ["8 years (with extension)", "8"],
          ].map(([label, value]) => (
            <button
              key={value}
              type="button"
              onClick={() => setYears(value)}
              aria-pressed={years === value}
              className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                years === value
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDeposit(String(MAX_DEPOSIT))}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            Max deposit
          </button>
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
                  Quarterly interest payout
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money2(calc.quarterly)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Credited on 31 March, 30 June, 30 September and 31 December —{" "}
                  {money2(calc.monthlyEquivalent)} a month on average
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy SCSS interest result"
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
                ["Deposit", money(calc.deposit)],
                ["Annual interest income", money2(calc.annual)],
                ["Number of quarterly payouts", `${calc.quarters}`],
                ["Total interest over the term", money2(calc.totalInterest)],
                ["Principal returned at maturity", money(calc.deposit)],
                ["Total received (principal + interest)", money2(calc.totalReceived)],
                ["80C deduction available on deposit", money(calc.deduction)],
                [`Tax saved at ${num(calc.slab)}% (old regime)`, money2(calc.taxSaved)],
                [`Tax on interest at ${num(calc.slab)}%, per year`, money2(calc.taxOnInterest)],
                ["Net annual income after tax", money2(calc.effectiveAfterTax)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {calc.tdsApplies && (
              <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                Interest of {money2(calc.annual)} a year crosses the {money(TDS_THRESHOLD)} TDS
                threshold for senior citizens, so tax will be deducted at source unless you file
                Form 15H.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Quarterly payout schedule</h2>
              <button
                type="button"
                onClick={() => setShowSchedule((value) => !value)}
                aria-expanded={showSchedule}
                className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
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
                        Quarter
                      </th>
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Year
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Payout
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Cumulative
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.schedule.map((row) => (
                      <tr key={row.quarter} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">Q{row.quarter}</td>
                        <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.year}</td>
                        <td className="py-2 pr-3 text-right">{money2(row.payout)}</td>
                        <td className="py-2 text-right">{money2(row.cumulative)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Premature closure penalty</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Closed before 1 year", "No interest — any interest already paid is recovered"],
                ["Between 1 and 2 years", `1.5% of deposit = ${money2(calc.deposit * 0.015)}`],
                ["Between 2 and 5 years", `1% of deposit = ${money2(calc.deposit * 0.01)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. SCSS interest is fully taxable and the 80C deduction is
        available only under the old tax regime. The rate is fixed for your account at the rate
        notified in the quarter you open it — confirm the current rate with your bank or post office.
      </p>
    </main>
  );
}
