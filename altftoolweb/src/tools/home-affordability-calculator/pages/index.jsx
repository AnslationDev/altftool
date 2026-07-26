"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Home, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  income: 150000,
  obligations: 10000,
  foir: 50,
  rate: 8.5,
  years: 20,
  savings: 2000000,
  ltv: 80,
  costs: 7,
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

/** Present value of an EMI stream — the largest loan those EMIs can service. */
function loanFromEmi(emi, annualRate, months) {
  if (!(emi > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return emi * months;
  return (emi * (1 - Math.pow(1 + r, -months))) / r;
}

/** Standard reducing-balance EMI. */
function emiFromLoan(principal, annualRate, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

export default function ToolHome() {
  const [income, setIncome] = useState(String(DEFAULTS.income));
  const [obligations, setObligations] = useState(String(DEFAULTS.obligations));
  const [foir, setFoir] = useState(String(DEFAULTS.foir));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [savings, setSavings] = useState(String(DEFAULTS.savings));
  const [ltv, setLtv] = useState(String(DEFAULTS.ltv));
  const [costs, setCosts] = useState(String(DEFAULTS.costs));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const inc = toNumber(income);
    const obl = toNumber(obligations);
    const foirPct = toNumber(foir);
    const r = toNumber(rate);
    const y = toNumber(years);
    const cash = toNumber(savings);
    const ltvPct = toNumber(ltv);
    const costPct = toNumber(costs);

    const all = [inc, obl, foirPct, r, y, cash, ltvPct, costPct];
    if (all.some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (all.some((value) => value < 0)) return { error: "Values cannot be negative." };
    if (inc <= 0) return { error: "Monthly net income must be greater than zero." };
    if (foirPct <= 0 || foirPct > 80) {
      return { error: "FOIR is normally between 30% and 60% of net income." };
    }
    if (r > 30) return { error: "Interest rate should be between 0% and 30% per year." };
    if (y <= 0 || y > 35) return { error: "Home loan tenure is usually between 1 and 30 years." };
    if (ltvPct <= 0 || ltvPct > 90) {
      return { error: "Loan-to-value is capped at 90% by RBI norms — enter 1% to 90%." };
    }
    if (costPct > 25) return { error: "Registration and other costs above 25% look unrealistic." };

    const months = Math.round(y * 12);
    const emiCapacity = (inc * foirPct) / 100 - obl;
    if (!(emiCapacity > 0)) {
      return {
        error:
          "Your existing EMIs already use the whole FOIR allowance — no room for a new home loan.",
      };
    }

    const ltvFrac = ltvPct / 100;
    const costFrac = costPct / 100;

    // Income route: price = loan you can service + your cash, net of buying costs.
    const incomeLoan = loanFromEmi(emiCapacity, r, months);
    const priceByIncome = (incomeLoan + cash) / (1 + costFrac);
    // Cash route: at the maximum LTV your cash must cover margin money + buying costs.
    const cashDenominator = 1 - ltvFrac + costFrac;
    const priceByCash = cashDenominator > 0 ? cash / cashDenominator : Infinity;

    const price = Math.min(priceByIncome, priceByCash);
    if (!(price > 0)) {
      return { error: "With this income and down payment the affordable price works out to zero." };
    }

    const loan = Math.min(incomeLoan, ltvFrac * price);
    const downPayment = price - loan;
    const buyingCosts = costFrac * price;
    const cashNeeded = downPayment + buyingCosts;
    const emi = emiFromLoan(loan, r, months);
    const totalInterest = emi * months - loan;

    return {
      months,
      emiCapacity,
      emi,
      incomeLoan,
      price,
      loan,
      downPayment,
      buyingCosts,
      cashNeeded,
      cashLeft: cash - cashNeeded,
      totalInterest,
      totalOutgo: cashNeeded + emi * months,
      limitedBy: priceByCash < priceByIncome ? "down payment / LTV cap" : "income and EMI capacity",
      emiShare: (emi / inc) * 100,
      ltvActual: price > 0 ? (loan / price) * 100 : 0,
      rateUsed: r,
    };
  }, [income, obligations, foir, rate, years, savings, ltv, costs]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Home Affordability Calculator",
      `Affordable property price: ${money(calc.price)}`,
      `Home loan: ${money(calc.loan)} at ${NUM.format(calc.rateUsed)}% for ${calc.months} months`,
      `Monthly EMI: ${money(calc.emi)} (${pct(calc.emiShare)} of net income)`,
      `Down payment: ${money(calc.downPayment)}`,
      `Registration / stamp duty & other costs: ${money(calc.buyingCosts)}`,
      `Cash needed on day one: ${money(calc.cashNeeded)}`,
      `Total interest over the tenure: ${money(calc.totalInterest)}`,
      `Limited by: ${calc.limitedBy}`,
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
    setObligations(String(DEFAULTS.obligations));
    setFoir(String(DEFAULTS.foir));
    setRate(String(DEFAULTS.rate));
    setYears(String(DEFAULTS.years));
    setSavings(String(DEFAULTS.savings));
    setLtv(String(DEFAULTS.ltv));
    setCosts(String(DEFAULTS.costs));
    setCopied(false);
  };

  const fields = [
    {
      id: "afford-income",
      label: "Monthly net income (INR)",
      value: income,
      set: setIncome,
      step: "1000",
    },
    {
      id: "afford-obligations",
      label: "Existing monthly EMIs (INR)",
      value: obligations,
      set: setObligations,
      step: "500",
    },
    {
      id: "afford-foir",
      label: "FOIR — income share lenders allow (%)",
      value: foir,
      set: setFoir,
      step: "1",
    },
    {
      id: "afford-rate",
      label: "Home loan interest rate (% per year)",
      value: rate,
      set: setRate,
      step: "0.05",
    },
    { id: "afford-years", label: "Tenure (years)", value: years, set: setYears, step: "1" },
    {
      id: "afford-savings",
      label: "Cash available for down payment (INR)",
      value: savings,
      set: setSavings,
      step: "10000",
    },
    {
      id: "afford-ltv",
      label: "Maximum loan-to-value the bank allows (%)",
      value: ltv,
      set: setLtv,
      step: "1",
    },
    {
      id: "afford-costs",
      label: "Stamp duty, registration & other costs (% of price)",
      value: costs,
      set: setCosts,
      step: "0.5",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Home className="h-4 w-4" aria-hidden="true" />
          Home loan
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Home Affordability Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See the highest property price your salary and savings actually support — after FOIR
          limits, the bank&apos;s loan-to-value cap and stamp duty paid from your own pocket.
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
          {[40, 50, 55, 60].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFoir(String(value))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              FOIR {value}%
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
                  Property price you can afford
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.price)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money(calc.loan)} loan + {money(calc.downPayment)} down payment · limited by{" "}
                  {calc.limitedBy}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy home affordability result"
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
                ["Monthly EMI on this loan", `${money(calc.emi)} (${pct(calc.emiShare)} of income)`],
                ["EMI capacity after existing obligations", money(calc.emiCapacity)],
                ["Loan your income alone supports", money(calc.incomeLoan)],
                ["Loan-to-value actually used", pct(calc.ltvActual)],
                ["Down payment (margin money)", money(calc.downPayment)],
                ["Stamp duty, registration & other costs", money(calc.buyingCosts)],
                ["Cash needed on day one", money(calc.cashNeeded)],
                ["Cash left over from your savings", money(Math.max(0, calc.cashLeft))],
                ["Total interest over the tenure", money(calc.totalInterest)],
                ["Total outgo (cash + all EMIs)", money(calc.totalOutgo)],
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
                aria-label={`Loan funds ${pct(calc.ltvActual)} of the price and your own money funds ${pct(100 - calc.ltvActual)}`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, calc.ltvActual))}%` }}
                />
                <span
                  className="block h-full bg-[var(--success)]"
                  style={{ width: `${Math.max(0, Math.min(100, 100 - calc.ltvActual))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Bank funds {pct(calc.ltvActual)} · You fund {pct(100 - calc.ltvActual)} of the
                price
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What changes the answer most</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Your budget is capped by whichever runs out first: the EMI your income can carry, or
              the cash you can put down. Right now it is the{" "}
              <span className="font-semibold text-[var(--foreground)]">{calc.limitedBy}</span>. If
              cash is the binding constraint, saving more down payment lifts the price faster than a
              longer tenure does; if income is the constraint, clearing an existing EMI or adding a
              co-applicant&apos;s salary helps most.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Lenders assess CIBIL score, job stability, age at maturity and
        property valuation before sanctioning, and stamp duty differs by state — treat this as a
        planning starting point, not a sanction.
      </p>
    </main>
  );
}
