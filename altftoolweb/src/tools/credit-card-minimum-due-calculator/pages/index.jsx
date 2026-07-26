"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CreditCard, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const MAX_MONTHS = 600; // 50 years — beyond this we call it "never cleared".
const GST_RATE = 0.18;

const DEFAULTS = {
  balance: "100000",
  monthlyRate: "3.5",
  minPercent: "5",
  minFloor: "100",
  gst: true,
  fixedPay: "10000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const formatDuration = (months) => {
  if (!Number.isFinite(months) || months <= 0) return "0 months";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (rest) parts.push(`${rest} month${rest === 1 ? "" : "s"}`);
  return parts.join(" ") || "0 months";
};

/**
 * Month-by-month simulation.
 * Interest accrues on the revolved principal and is capitalised, while GST on that
 * interest is tracked as a separate non-interest-bearing charge — RBI's credit card
 * directions bar capitalising unpaid taxes and levies for interest calculation.
 * mode "minimum" pays max(percent of total outstanding, floor); mode "fixed" pays a set amount.
 */
function simulate({ balance, monthlyRate, minPercent, minFloor, withGst, fixedPay, mode }) {
  const rate = monthlyRate / 100;
  let principal = balance;
  let charges = 0;
  let totalInterest = 0;
  let totalGst = 0;
  let totalPaid = 0;
  let months = 0;
  let firstPayment = 0;
  let neverClears = false;
  const milestones = [];
  const MILESTONE_MONTHS = [12, 24, 36, 60, 120, 240];

  while (principal + charges > 0.5 && months < MAX_MONTHS) {
    const interest = principal * rate;
    const gst = withGst ? interest * GST_RATE : 0;
    principal += interest;
    charges += gst;
    totalInterest += interest;
    totalGst += gst;

    const outstanding = principal + charges;
    let payment =
      mode === "fixed" ? fixedPay : Math.max((outstanding * minPercent) / 100, minFloor);
    if (payment > outstanding) payment = outstanding;

    if (payment <= interest + gst && outstanding > payment) {
      // The payment cannot even cover this month's finance charge, so the
      // balance never falls. Flag it but keep simulating — returning here left
      // the totals holding one month of interest and ₹0 paid, which the UI
      // then displayed as lifetime figures.
      neverClears = true;
    }

    // Charges are settled first, the rest reduces the interest-bearing principal.
    const toCharges = Math.min(charges, payment);
    charges -= toCharges;
    principal = Math.max(0, principal - (payment - toCharges));

    totalPaid += payment;
    months += 1;
    if (months === 1) firstPayment = payment;
    if (MILESTONE_MONTHS.includes(months)) {
      milestones.push({ months, outstanding: Math.max(0, principal + charges), totalPaid });
    }
  }

  return {
    cleared: principal + charges <= 0.5,
    neverClears,
    outstanding: Math.max(0, principal + charges),
    months,
    totalInterest,
    totalGst,
    totalPaid,
    firstPayment,
    milestones,
  };
}

export default function ToolHome() {
  const [balance, setBalance] = useState(DEFAULTS.balance);
  const [monthlyRate, setMonthlyRate] = useState(DEFAULTS.monthlyRate);
  const [minPercent, setMinPercent] = useState(DEFAULTS.minPercent);
  const [minFloor, setMinFloor] = useState(DEFAULTS.minFloor);
  const [gst, setGst] = useState(DEFAULTS.gst);
  const [fixedPay, setFixedPay] = useState(DEFAULTS.fixedPay);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const bal = toNumber(balance);
    const rate = toNumber(monthlyRate);
    const pct = toNumber(minPercent);
    const floor = toNumber(minFloor);
    const fixed = toNumber(fixedPay);

    if ([bal, rate, pct, floor, fixed].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (bal <= 0) return { error: "Enter the outstanding balance on your card." };
    if (rate < 0 || rate > 10) {
      return { error: "Monthly interest rate on a credit card is usually 1% to 4%." };
    }
    if (pct <= 0 || pct > 100) return { error: "Minimum due is a percentage between 1 and 100." };
    if (floor < 0) return { error: "The minimum due floor cannot be negative." };
    if (fixed < 0) return { error: "The fixed monthly payment cannot be negative." };

    const shared = {
      balance: bal,
      monthlyRate: rate,
      minPercent: pct,
      minFloor: floor,
      withGst: gst,
    };
    const minimum = simulate({ ...shared, mode: "minimum" });
    const fixedRun =
      fixed > 0 ? simulate({ ...shared, fixedPay: fixed, mode: "fixed" }) : null;

    const annualSimple = rate * 12;
    const annualEffective = (Math.pow(1 + rate / 100, 12) - 1) * 100;

    return {
      bal,
      rate,
      pct,
      minimum,
      fixedRun,
      fixed,
      annualSimple,
      annualEffective,
      minimumCost: minimum.totalInterest + minimum.totalGst,
      fixedCost: fixedRun ? fixedRun.totalInterest + fixedRun.totalGst : 0,
    };
  }, [balance, monthlyRate, minPercent, minFloor, gst, fixedPay]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    const lines = [
      "Credit Card Minimum Due",
      `Outstanding balance: ${money(calc.bal)}`,
      `Interest: ${num(calc.rate)}% per month (${num(calc.annualSimple)}% p.a. nominal, ${num(calc.annualEffective)}% effective)`,
      `First minimum due: ${money(calc.minimum.firstPayment)}`,
      calc.minimum.cleared
        ? `Time to clear paying only the minimum: ${formatDuration(calc.minimum.months)}`
        : "Paying only the minimum never clears this balance.",
      `Interest + GST paid: ${money(calc.minimumCost)}`,
      `Total paid: ${money(calc.minimum.totalPaid)}`,
    ];
    if (calc.fixedRun && calc.fixed > 0) {
      lines.push(
        calc.fixedRun.cleared
          ? `Paying ${money(calc.fixed)} every month: cleared in ${formatDuration(calc.fixedRun.months)}, interest + GST ${money(calc.fixedCost)}`
          : `Paying ${money(calc.fixed)} every month is not enough to clear this balance.`
      );
    }
    return lines.join("\n");
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
    setBalance(DEFAULTS.balance);
    setMonthlyRate(DEFAULTS.monthlyRate);
    setMinPercent(DEFAULTS.minPercent);
    setMinFloor(DEFAULTS.minFloor);
    setGst(DEFAULTS.gst);
    setFixedPay(DEFAULTS.fixedPay);
    setCopied(false);
  };

  const savedMonths =
    calc.error || !calc.fixedRun || !calc.fixedRun.cleared || !calc.minimum.cleared
      ? 0
      : calc.minimum.months - calc.fixedRun.months;
  const savedMoney =
    calc.error || !calc.fixedRun || !calc.fixedRun.cleared ? 0 : calc.minimumCost - calc.fixedCost;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Credit card debt
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Credit Card Minimum Due Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paying only the minimum due keeps the account current but barely dents the principal. This
          tool simulates the balance month by month — interest, GST on that interest and the shrinking
          minimum — to show how long the debt really lasts and what it costs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-balance">
              Outstanding balance (INR)
            </label>
            <input
              id="cc-balance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={balance}
              onChange={(event) => setBalance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-rate">
              Interest rate (% per month)
            </label>
            <input
              id="cc-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.05"
              value={monthlyRate}
              onChange={(event) => setMonthlyRate(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Indian cards typically charge 3.0%-3.75% per month on revolved balances.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-min-percent">
              Minimum due (% of balance)
            </label>
            <input
              id="cc-min-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="0.5"
              value={minPercent}
              onChange={(event) => setMinPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-min-floor">
              Minimum due floor (INR)
            </label>
            <input
              id="cc-min-floor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={minFloor}
              onChange={(event) => setMinFloor(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cc-fixed">
              Compare with a fixed monthly payment (INR)
            </label>
            <input
              id="cc-fixed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={fixedPay}
              onChange={(event) => setFixedPay(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 text-sm font-semibold" htmlFor="cc-gst">
              <input
                id="cc-gst"
                type="checkbox"
                checked={gst}
                onChange={(event) => setGst(event.target.checked)}
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
              Add 18% GST on the interest charged
            </label>
          </div>
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
                  Paying only the minimum due
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {calc.minimum.cleared ? formatDuration(calc.minimum.months) : "Never cleared"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {calc.minimum.cleared
                    ? `${money(calc.minimumCost)} paid in interest and GST on a ${money(calc.bal)} balance`
                    : "The minimum payment does not even cover the monthly finance charge."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy minimum due calculation result"
                  className={GHOST_BTN}
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            {!calc.minimum.cleared && (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {calc.minimum.neverClears
                  ? `At these settings the balance never reduces — the minimum due is smaller than the interest plus GST added each month. After ${formatDuration(
                      calc.minimum.months,
                    )} you would still owe ${money(calc.minimum.outstanding)}. Raise the minimum percentage or pay a fixed amount instead.`
                  : `The balance is shrinking, but not fast enough to clear within ${formatDuration(
                      calc.minimum.months,
                    )} — you would still owe ${money(
                      calc.minimum.outstanding,
                    )}. Pay a fixed amount instead of the minimum due.`}
              </p>
            )}

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Starting balance", money(calc.bal)],
                ["First month's minimum due", money(calc.minimum.firstPayment)],
                ["Interest charged (total)", money(calc.minimum.totalInterest)],
                ["GST on interest (total)", money(calc.minimum.totalGst)],
                ["Total paid to the bank", money(calc.minimum.totalPaid)],
                [
                  "Cost per rupee borrowed",
                  calc.bal > 0
                    ? `${num(calc.minimumCost / calc.bal)}x the balance in charges`
                    : "-",
                ],
                ["Nominal annual rate", `${num(calc.annualSimple)}%`],
                ["Effective annual rate (compounded)", `${num(calc.annualEffective)}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {calc.fixed > 0 && calc.fixedRun && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">
                Instead, paying {money(calc.fixed)} every month
              </h2>
              {calc.fixedRun.cleared ? (
                <>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-[var(--border)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        Debt-free in
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--success)]">
                        {formatDuration(calc.fixedRun.months)}
                      </p>
                      {savedMonths > 0 && (
                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          {formatDuration(savedMonths)} sooner
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg border border-[var(--border)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        Interest + GST
                      </p>
                      <p className="mt-1 text-2xl font-semibold">{money(calc.fixedCost)}</p>
                      {savedMoney > 0 && (
                        <p className="mt-1 text-sm text-[var(--success)]">
                          {money(savedMoney)} saved
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                    Total paid {money(calc.fixedRun.totalPaid)} against{" "}
                    {money(calc.minimum.totalPaid)} on the minimum-due route.
                  </p>
                </>
              ) : (
                <p
                  role="alert"
                  className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  {money(calc.fixed)} a month does not cover the monthly finance charge on this
                  balance, so the debt would keep growing. Pay more than{" "}
                  {money(calc.bal * (calc.rate / 100) * (gst ? 1.18 : 1))} each month.
                </p>
              )}
            </section>
          )}

          {calc.minimum.milestones.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Where the minimum-due route leaves you</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">After</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Paid so far</th>
                      <th scope="col" className="py-2 text-right font-semibold">Balance left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.minimum.milestones.map((row) => (
                      <tr key={row.months} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{formatDuration(row.months)}</td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                          {money(row.totalPaid)}
                        </td>
                        <td className="py-2 text-right">{money(row.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only, and deliberately optimistic: it assumes no new spends, no late
        fees and no cash withdrawals. Real statements compute the minimum due from your issuer&apos;s
        own formula and charge interest from the transaction date once you revolve a balance.
      </p>
    </main>
  );
}
