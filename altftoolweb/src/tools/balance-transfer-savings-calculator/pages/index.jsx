"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  outstanding: 3000000,
  currentRate: 9.5,
  remainingMonths: 180,
  newRate: 8.6,
  feePercent: 0.5,
  flatCharges: 5000,
};

const MODES = [
  { id: "tenure", label: "Keep tenure, lower EMI" },
  { id: "emi", label: "Keep EMI, finish sooner" },
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

/** Months needed to clear `principal` at `annualRate` paying `emi` each month. */
function monthsFor(principal, annualRate, emi) {
  if (!(principal > 0) || !(emi > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / emi;
  if (emi <= principal * r) return Infinity;
  return -Math.log(1 - (principal * r) / emi) / Math.log(1 + r);
}

const monthsLabel = (months) => {
  if (!Number.isFinite(months)) return "never";
  const whole = Math.round(months);
  const y = Math.floor(whole / 12);
  const m = whole % 12;
  if (y === 0) return `${m} months`;
  if (m === 0) return `${y} years`;
  return `${y}y ${m}m`;
};

export default function ToolHome() {
  const [outstanding, setOutstanding] = useState(String(DEFAULTS.outstanding));
  const [currentRate, setCurrentRate] = useState(String(DEFAULTS.currentRate));
  const [remainingMonths, setRemainingMonths] = useState(String(DEFAULTS.remainingMonths));
  const [newRate, setNewRate] = useState(String(DEFAULTS.newRate));
  const [feePercent, setFeePercent] = useState(String(DEFAULTS.feePercent));
  const [flatCharges, setFlatCharges] = useState(String(DEFAULTS.flatCharges));
  const [mode, setMode] = useState("tenure");
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const principal = toNumber(outstanding);
    const oldRate = toNumber(currentRate);
    const months = toNumber(remainingMonths);
    const nextRate = toNumber(newRate);
    const feePct = toNumber(feePercent);
    const flat = toNumber(flatCharges);

    const all = [principal, oldRate, months, nextRate, feePct, flat];
    if (all.some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (all.some((value) => value < 0)) return { error: "Values cannot be negative." };
    if (principal <= 0) return { error: "Outstanding loan balance must be greater than zero." };
    if (months < 1 || months > 480) {
      return { error: "Remaining tenure should be between 1 and 480 months." };
    }
    if (oldRate > 60 || nextRate > 60) {
      return { error: "Interest rates should be between 0% and 60% per year." };
    }
    if (feePct > 10) return { error: "Processing fee above 10% of the balance looks unrealistic." };

    const wholeMonths = Math.round(months);
    const fees = (principal * feePct) / 100 + flat;

    const oldEmi = emiFor(principal, oldRate, wholeMonths);
    const oldInterest = oldEmi * wholeMonths - principal;

    // Scenario A — same tenure at the new rate, smaller EMI.
    const sameTenureEmi = emiFor(principal, nextRate, wholeMonths);
    const sameTenureInterest = sameTenureEmi * wholeMonths - principal;
    const sameTenureSaving = oldInterest - sameTenureInterest - fees;
    const monthlyRelief = oldEmi - sameTenureEmi;
    const breakEven = monthlyRelief > 0 ? fees / monthlyRelief : Infinity;

    // Scenario B — keep paying the old EMI at the new rate, finish earlier.
    const sameEmiMonths = monthsFor(principal, nextRate, oldEmi);
    const sameEmiInterest = Number.isFinite(sameEmiMonths)
      ? oldEmi * sameEmiMonths - principal
      : Infinity;
    const sameEmiSaving = Number.isFinite(sameEmiInterest)
      ? oldInterest - sameEmiInterest - fees
      : -Infinity;
    const monthsSaved = Number.isFinite(sameEmiMonths) ? wholeMonths - sameEmiMonths : 0;

    const chosen =
      mode === "emi"
        ? {
            emi: oldEmi,
            months: sameEmiMonths,
            interest: sameEmiInterest,
            saving: sameEmiSaving,
          }
        : {
            emi: sameTenureEmi,
            months: wholeMonths,
            interest: sameTenureInterest,
            saving: sameTenureSaving,
          };

    return {
      principal,
      wholeMonths,
      fees,
      feeFromPercent: (principal * feePct) / 100,
      flat,
      oldEmi,
      oldInterest,
      oldRate,
      nextRate,
      rateDrop: oldRate - nextRate,
      sameTenureEmi,
      sameTenureInterest,
      sameTenureSaving,
      monthlyRelief,
      breakEven,
      sameEmiMonths,
      sameEmiInterest,
      sameEmiSaving,
      monthsSaved,
      chosen,
      worthIt: chosen.saving > 0,
    };
  }, [outstanding, currentRate, remainingMonths, newRate, feePercent, flatCharges, mode]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    const modeLabel = mode === "emi" ? "Keep EMI, finish sooner" : "Keep tenure, lower EMI";
    return [
      "Balance Transfer Savings Calculator",
      `Outstanding balance: ${money(calc.principal)}`,
      `Rate: ${num(calc.oldRate)}% → ${num(calc.nextRate)}% (drop of ${num(calc.rateDrop)} pp)`,
      `Remaining tenure: ${calc.wholeMonths} months`,
      `Transfer cost (fee + charges): ${money(calc.fees)}`,
      `Option: ${modeLabel}`,
      `New EMI: ${money(calc.chosen.emi)}`,
      `New tenure: ${monthsLabel(calc.chosen.months)}`,
      `Interest if you stay: ${money(calc.oldInterest)}`,
      `Interest after transfer: ${money(calc.chosen.interest)}`,
      `Net saving after costs: ${money(calc.chosen.saving)}`,
      `Break-even: ${Number.isFinite(calc.breakEven) ? `${Math.ceil(calc.breakEven)} months` : "not reached"}`,
    ].join("\n");
  }, [calc, mode]);

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
    setOutstanding(String(DEFAULTS.outstanding));
    setCurrentRate(String(DEFAULTS.currentRate));
    setRemainingMonths(String(DEFAULTS.remainingMonths));
    setNewRate(String(DEFAULTS.newRate));
    setFeePercent(String(DEFAULTS.feePercent));
    setFlatCharges(String(DEFAULTS.flatCharges));
    setMode("tenure");
    setCopied(false);
  };

  const fields = [
    {
      id: "bt-outstanding",
      label: "Outstanding loan balance (INR)",
      value: outstanding,
      set: setOutstanding,
      step: "10000",
    },
    {
      id: "bt-current-rate",
      label: "Current interest rate (% per year)",
      value: currentRate,
      set: setCurrentRate,
      step: "0.05",
    },
    {
      id: "bt-months",
      label: "Remaining tenure (months)",
      value: remainingMonths,
      set: setRemainingMonths,
      step: "1",
    },
    {
      id: "bt-new-rate",
      label: "New lender's rate (% per year)",
      value: newRate,
      set: setNewRate,
      step: "0.05",
    },
    {
      id: "bt-fee",
      label: "Processing fee (% of balance)",
      value: feePercent,
      set: setFeePercent,
      step: "0.05",
    },
    {
      id: "bt-charges",
      label: "Legal, valuation & stamping charges (INR)",
      value: flatCharges,
      set: setFlatCharges,
      step: "500",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Balance transfer
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Balance Transfer Savings Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compare staying put against moving your loan to a cheaper lender — interest saved, the
          processing fee and other charges netted off, and the month the switch pays for itself.
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

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            After the transfer I want to
          </legend>
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
                  {calc.worthIt ? "Net saving after all costs" : "Net extra cost after all costs"}
                </p>
                <p
                  className={`mt-1 text-4xl font-semibold ${calc.worthIt ? "text-[var(--primary)]" : "text-[var(--danger)]"}`}
                >
                  {money(Math.abs(calc.chosen.saving))}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  New EMI {money(calc.chosen.emi)} · tenure {monthsLabel(calc.chosen.months)} ·
                  transfer cost {money(calc.fees)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy balance transfer savings result"
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
                ["Current EMI", money(calc.oldEmi)],
                ["Interest left if you do nothing", money(calc.oldInterest)],
                ["Interest after the transfer", money(calc.chosen.interest)],
                ["Gross interest saved", money(calc.oldInterest - calc.chosen.interest)],
                ["Processing fee", money(calc.feeFromPercent)],
                ["Legal, valuation & stamping", money(calc.flat)],
                ["Total cost of switching", money(calc.fees)],
                [
                  "Break-even on the fee",
                  Number.isFinite(calc.breakEven)
                    ? `${Math.ceil(calc.breakEven)} months of lower EMI`
                    : "not reached at this rate",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Keep the tenure</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Same {calc.wholeMonths} months, smaller instalment.
              </p>
              <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
                {[
                  ["New EMI", money(calc.sameTenureEmi)],
                  ["Monthly relief", money(calc.monthlyRelief)],
                  ["Net saving", money(calc.sameTenureSaving)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Keep the EMI</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Same {money(calc.oldEmi)} instalment, loan closes earlier.
              </p>
              <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
                {[
                  ["New tenure", monthsLabel(calc.sameEmiMonths)],
                  [
                    "Months saved",
                    Number.isFinite(calc.sameEmiMonths) ? `${Math.round(calc.monthsSaved)}` : "—",
                  ],
                  [
                    "Net saving",
                    Number.isFinite(calc.sameEmiSaving) ? money(calc.sameEmiSaving) : "—",
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              {calc.rateDrop <= 0
                ? "The new rate is not lower than your current one, so a transfer only adds cost. Ask your existing lender for a rate reset first."
                : calc.worthIt
                  ? `A ${num(calc.rateDrop)} percentage point drop on ${money(calc.principal)} with ${monthsLabel(calc.wholeMonths)} left is worth it here — the switch pays for itself in about ${Number.isFinite(calc.breakEven) ? Math.ceil(calc.breakEven) : 0} months and keeping the old EMI saves the most.`
                  : "At this balance and remaining tenure the fees eat the entire interest saving. Transfers work best early in the loan, when most of each EMI is still interest."}
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Floating-rate home loans to individuals carry no foreclosure
        penalty under RBI rules, but fixed-rate and business loans may; GST also applies on the
        processing fee. Confirm the exact charges in the new lender&apos;s sanction letter.
      </p>
    </main>
  );
}
