"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const RATE = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const rateText = (value) => `${RATE.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  principal: 500000,
  flatRate: 8,
  reducingRate: 14.13,
  years: 5,
};

const MODES = [
  { id: "flatToReducing", label: "Flat → reducing" },
  { id: "reducingToFlat", label: "Reducing → flat" },
];

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

/** Standard reducing-balance EMI. */
function emiFor(principal, annualRate, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

/**
 * Solve for the reducing-balance annual rate that produces `emi` on this loan.
 * EMI rises monotonically with the rate, so a bisection converges reliably.
 */
function reducingRateForEmi(principal, emi, months) {
  if (!(principal > 0) || !(emi > 0) || !(months > 0)) return 0;
  if (emi <= principal / months) return 0;
  let low = 0;
  let high = 500;
  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2;
    if (emiFor(principal, mid, months) < emi) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export default function ToolHome() {
  const [mode, setMode] = useState("flatToReducing");
  const [principal, setPrincipal] = useState(String(DEFAULTS.principal));
  const [flatRate, setFlatRate] = useState(String(DEFAULTS.flatRate));
  const [reducingRate, setReducingRate] = useState(String(DEFAULTS.reducingRate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const p = toNumber(principal);
    const y = toNumber(years);
    const flat = toNumber(flatRate);
    const reducing = toNumber(reducingRate);
    const inputRate = mode === "flatToReducing" ? flat : reducing;

    if ([p, y, inputRate].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (p <= 0) return { error: "Loan amount must be greater than zero." };
    if (y <= 0 || y > 40) return { error: "Tenure should be between 0.5 and 40 years." };
    if (inputRate < 0) return { error: "Interest rate cannot be negative." };
    if (inputRate > 100) return { error: "Interest rate should be below 100% per year." };

    const months = Math.round(y * 12);
    if (months < 1) return { error: "Tenure must be at least one month." };

    let flatUsed;
    let reducingUsed;
    let emi;
    let totalInterest;

    if (mode === "flatToReducing") {
      flatUsed = flat;
      totalInterest = (p * flat * y) / 100;
      emi = (p + totalInterest) / months;
      reducingUsed = reducingRateForEmi(p, emi, months);
    } else {
      reducingUsed = reducing;
      emi = emiFor(p, reducing, months);
      totalInterest = emi * months - p;
      flatUsed = y > 0 ? (totalInterest / (p * y)) * 100 : 0;
    }

    const totalPayable = p + totalInterest;
    const multiple = flatUsed > 0 ? reducingUsed / flatUsed : 0;
    const simpleEmi = p / months;

    // Same EMI on a genuine reducing loan at the quoted flat rate, for contrast.
    const honestEmi = emiFor(p, flatUsed, months);
    const overpayment = (emi - honestEmi) * months;

    return {
      months,
      principal: p,
      years: y,
      flatUsed,
      reducingUsed,
      emi,
      totalInterest,
      totalPayable,
      multiple,
      simpleEmi,
      honestEmi,
      overpayment,
      interestShare: totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0,
    };
  }, [mode, principal, flatRate, reducingRate, years]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Flat vs Reducing Interest Rate Converter",
      `Loan amount: ${money(calc.principal)} for ${num(calc.years)} years (${calc.months} months)`,
      `Flat rate: ${rateText(calc.flatUsed)} per year`,
      `Equivalent reducing-balance rate: ${rateText(calc.reducingUsed)} per year`,
      `EMI: ${money(calc.emi)}`,
      `Total interest: ${money(calc.totalInterest)}`,
      `Total payable: ${money(calc.totalPayable)}`,
      `The reducing rate is ${num(calc.multiple)}x the quoted flat rate`,
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
    setMode("flatToReducing");
    setPrincipal(String(DEFAULTS.principal));
    setFlatRate(String(DEFAULTS.flatRate));
    setReducingRate(String(DEFAULTS.reducingRate));
    setYears(String(DEFAULTS.years));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          Rate conversion
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Flat vs Reducing Interest Rate Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A flat rate charges interest on the full original amount for the whole tenure, even after
          you have repaid most of it. Convert any flat quote into the reducing-balance rate you are
          really paying — or work backwards from a reducing rate to its flat headline.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Convert</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MODES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                aria-pressed={mode === option.id}
                className={
                  mode === option.id
                    ? `${PRIMARY_BTN} px-3`
                    : "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="frc-principal">
              Loan amount (INR)
            </label>
            <input
              id="frc-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={principal}
              onChange={(event) => setPrincipal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="frc-years">
              Tenure (years)
            </label>
            <input
              id="frc-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          {mode === "flatToReducing" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="frc-flat">
                Flat rate quoted (% per year)
              </label>
              <input
                id="frc-flat"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.05"
                value={flatRate}
                onChange={(event) => setFlatRate(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="frc-reducing">
                Reducing-balance rate (% per year)
              </label>
              <input
                id="frc-reducing"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.05"
                value={reducingRate}
                onChange={(event) => setReducingRate(event.target.value)}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[1, 2, 3, 5, 7].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setYears(String(option))}
              aria-pressed={toNumber(years) === option}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {option} {option === 1 ? "year" : "years"}
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
                  {mode === "flatToReducing"
                    ? "True reducing-balance rate"
                    : "Equivalent flat rate"}
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {mode === "flatToReducing"
                    ? rateText(calc.reducingUsed)
                    : rateText(calc.flatUsed)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {rateText(calc.flatUsed)} flat over {num(calc.years)} years is the same deal as{" "}
                  {rateText(calc.reducingUsed)} reducing — about {num(calc.multiple)}x the headline
                  number.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy flat to reducing rate conversion result"
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
                ["Loan amount", money(calc.principal)],
                ["Tenure", `${calc.months} months`],
                ["Flat rate", rateText(calc.flatUsed)],
                ["Reducing-balance equivalent", rateText(calc.reducingUsed)],
                ["Monthly EMI", money(calc.emi)],
                ["Total interest", money(calc.totalInterest)],
                ["Total payable", money(calc.totalPayable)],
                ["Interest as share of total payable", `${num(calc.interestShare)}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What the flat quote hides</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              A genuine reducing-balance loan at {rateText(calc.flatUsed)} would cost{" "}
              {money(calc.honestEmi)} a month. The flat quote asks for {money(calc.emi)} — about{" "}
              {money(calc.overpayment)} more across the tenure, because interest is charged on the
              full {money(calc.principal)} even in the final month, when you owe almost nothing.
            </p>
            <div
              className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Principal is ${num(100 - calc.interestShare)} percent and interest is ${num(calc.interestShare)} percent of the total payable`}
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
              Principal {num(100 - calc.interestShare)}% · Interest {num(calc.interestShare)}%
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. The conversion assumes monthly instalments and ignores
        processing fees, insurance and GST — the annual percentage rate you actually pay will be
        higher once those are added.
      </p>
    </main>
  );
}
