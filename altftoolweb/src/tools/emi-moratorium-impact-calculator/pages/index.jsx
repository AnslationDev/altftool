"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PauseCircle, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  outstanding: 2000000,
  rate: 9,
  remainingMonths: 120,
  pauseMonths: 6,
};

const MODES = [
  { id: "tenure", label: "Keep the EMI, extend the tenure" },
  { id: "emi", label: "Keep the instalment count, raise the EMI" },
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

function emiFor(principal, annualRate, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

function monthsFor(principal, annualRate, emi) {
  if (!(principal > 0) || !(emi > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / emi;
  if (emi <= principal * r) return Infinity;
  return -Math.log(1 - (principal * r) / emi) / Math.log(1 + r);
}

const monthsLabel = (months) => {
  if (!Number.isFinite(months)) return "never repaid";
  const whole = Math.round(months);
  const y = Math.floor(whole / 12);
  const m = whole % 12;
  if (y === 0) return `${m} months`;
  if (m === 0) return `${y} years`;
  return `${y}y ${m}m`;
};

export default function ToolHome() {
  const [outstanding, setOutstanding] = useState(String(DEFAULTS.outstanding));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [remainingMonths, setRemainingMonths] = useState(String(DEFAULTS.remainingMonths));
  const [pauseMonths, setPauseMonths] = useState(String(DEFAULTS.pauseMonths));
  const [mode, setMode] = useState("tenure");
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const principal = toNumber(outstanding);
    const annualRate = toNumber(rate);
    const months = toNumber(remainingMonths);
    const pause = toNumber(pauseMonths);

    const all = [principal, annualRate, months, pause];
    if (all.some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (all.some((value) => value < 0)) return { error: "Values cannot be negative." };
    if (principal <= 0) return { error: "Outstanding balance must be greater than zero." };
    if (annualRate > 60) return { error: "Interest rate should be between 0% and 60% per year." };
    if (months < 1 || months > 480) {
      return { error: "Remaining tenure should be between 1 and 480 months." };
    }
    if (pause < 1 || pause > 24) {
      return { error: "A moratorium is normally 1 to 24 months — enter a value in that range." };
    }

    const n = Math.round(months);
    const m = Math.round(pause);
    const r = annualRate / 12 / 100;

    const baseEmi = emiFor(principal, annualRate, n);
    const baseTotal = baseEmi * n;
    const baseInterest = baseTotal - principal;

    // Interest keeps accruing on the outstanding balance and is capitalised.
    const balanceAfterPause = r > 0 ? principal * Math.pow(1 + r, m) : principal;
    const accruedInterest = balanceAfterPause - principal;
    const emisSkipped = baseEmi * m;

    // Option A — same EMI, longer tenure.
    const extendedMonths = monthsFor(balanceAfterPause, annualRate, baseEmi);
    const extendedTotal = Number.isFinite(extendedMonths) ? baseEmi * extendedMonths : Infinity;
    const extendedExtraCost = Number.isFinite(extendedTotal) ? extendedTotal - baseTotal : Infinity;
    const extraMonths = Number.isFinite(extendedMonths) ? m + extendedMonths - n : Infinity;

    // Option B — same number of instalments left, bigger EMI.
    const raisedEmi = emiFor(balanceAfterPause, annualRate, n);
    const raisedTotal = raisedEmi * n;
    const raisedExtraCost = raisedTotal - baseTotal;

    const chosen =
      mode === "emi"
        ? {
            emi: raisedEmi,
            monthsRemaining: n,
            totalPaid: raisedTotal,
            extraCost: raisedExtraCost,
            endsIn: m + n,
          }
        : {
            emi: baseEmi,
            monthsRemaining: extendedMonths,
            totalPaid: extendedTotal,
            extraCost: extendedExtraCost,
            endsIn: Number.isFinite(extendedMonths) ? m + extendedMonths : Infinity,
          };

    const neverCloses = mode === "tenure" && !Number.isFinite(extendedMonths);

    return {
      principal,
      annualRate,
      n,
      m,
      baseEmi,
      baseTotal,
      baseInterest,
      balanceAfterPause,
      accruedInterest,
      emisSkipped,
      extendedMonths,
      extendedExtraCost,
      extraMonths,
      raisedEmi,
      raisedExtraCost,
      chosen,
      neverCloses,
      costPerRupeeDeferred: emisSkipped > 0 ? chosen.extraCost / emisSkipped : 0,
    };
  }, [outstanding, rate, remainingMonths, pauseMonths, mode]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    const modeLabel =
      mode === "emi" ? "Keep instalment count, raise EMI" : "Keep EMI, extend tenure";
    return [
      "EMI Moratorium Impact Calculator",
      `Outstanding balance: ${money(calc.principal)} at ${num(calc.annualRate)}% for ${calc.n} months`,
      `Current EMI: ${money(calc.baseEmi)}`,
      `Moratorium: ${calc.m} months (${money(calc.emisSkipped)} of EMIs deferred)`,
      `Interest accrued while paused: ${money(calc.accruedInterest)}`,
      `Balance when EMIs restart: ${money(calc.balanceAfterPause)}`,
      `Option: ${modeLabel}`,
      `EMI after restart: ${money(calc.chosen.emi)}`,
      `Instalments left after restart: ${monthsLabel(calc.chosen.monthsRemaining)}`,
      `Extra cost of the pause: ${money(calc.chosen.extraCost)}`,
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
    setRate(String(DEFAULTS.rate));
    setRemainingMonths(String(DEFAULTS.remainingMonths));
    setPauseMonths(String(DEFAULTS.pauseMonths));
    setMode("tenure");
    setCopied(false);
  };

  const fields = [
    {
      id: "mor-outstanding",
      label: "Outstanding loan balance (INR)",
      value: outstanding,
      set: setOutstanding,
      step: "10000",
    },
    { id: "mor-rate", label: "Interest rate (% per year)", value: rate, set: setRate, step: "0.05" },
    {
      id: "mor-months",
      label: "Remaining tenure (months)",
      value: remainingMonths,
      set: setRemainingMonths,
      step: "1",
    },
    {
      id: "mor-pause",
      label: "Moratorium length (months)",
      value: pauseMonths,
      set: setPauseMonths,
      step: "1",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PauseCircle className="h-4 w-4" aria-hidden="true" />
          Moratorium
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          EMI Moratorium Impact Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pausing EMIs does not pause interest. See how much interest piles up during the break, and
          what it costs you as either a longer tenure or a bigger instalment afterwards.
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
          {[3, 6, 9, 12].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPauseMonths(String(option))}
              aria-pressed={toNumber(pauseMonths) === option}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {option} months
            </button>
          ))}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            How the lender recovers the deferred amount
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
      ) : calc.neverCloses ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          At this rate the capitalised balance grows faster than the old EMI can repay it. Choose
          &ldquo;keep the instalment count, raise the EMI&rdquo; or shorten the moratorium.
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Extra cost of pausing for {calc.m} months
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--danger)]">
                  {money(calc.chosen.extraCost)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  You defer {money(calc.emisSkipped)} of EMIs and pay{" "}
                  {money(calc.chosen.extraCost)} more in total — about{" "}
                  {num(calc.costPerRupeeDeferred * 100)} paise of extra cost per rupee deferred.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy moratorium impact result"
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
                ["Current EMI", money(calc.baseEmi)],
                ["EMIs deferred during the break", money(calc.emisSkipped)],
                ["Interest accrued while paused", money(calc.accruedInterest)],
                ["Balance when EMIs restart", money(calc.balanceAfterPause)],
                ["EMI after restart", money(calc.chosen.emi)],
                ["Instalments left after restart", monthsLabel(calc.chosen.monthsRemaining)],
                ["Loan now ends in", monthsLabel(calc.chosen.endsIn)],
                ["Total you would have paid without the pause", money(calc.baseTotal)],
                ["Total you will pay with the pause", money(calc.chosen.totalPaid)],
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
              <h2 className="text-base font-semibold">Keep the EMI</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Instalment stays {money(calc.baseEmi)}; the loan simply runs longer.
              </p>
              <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
                {[
                  [
                    "Extra months added",
                    Number.isFinite(calc.extraMonths) ? num(calc.extraMonths) : "never closes",
                  ],
                  [
                    "Extra cost",
                    Number.isFinite(calc.extendedExtraCost)
                      ? money(calc.extendedExtraCost)
                      : "unaffordable",
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Keep the instalment count</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Still {calc.n} instalments after the break, but each one is bigger.
              </p>
              <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
                {[
                  ["New EMI", money(calc.raisedEmi)],
                  ["EMI increase", money(calc.raisedEmi - calc.baseEmi)],
                  ["Extra cost", money(calc.raisedExtraCost)],
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
              During the moratorium interest is charged on the outstanding balance each month and
              added back to it, so the balance compounds from {money(calc.principal)} to{" "}
              {money(calc.balanceAfterPause)}. That is why a {calc.m} month break costs far more
              than the {money(calc.emisSkipped)} of instalments you skip. If you can still pay the
              interest portion each month, ask the lender for an interest-servicing arrangement
              instead — it avoids the compounding entirely.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Moratorium terms vary by lender and scheme — some capitalise
        interest monthly, some charge it as a lump sum on restart, and a moratorium may be reported
        to credit bureaus. Confirm the treatment in writing before you opt in.
      </p>
    </main>
  );
}
