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
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  amount: 500000,
  bookedRate: 7.25,
  bookedMonths: 36,
  cardRate: 6.75,
  heldMonths: 18,
  heldDays: 0,
  penalty: 1,
  mode: "cumulative",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Interest on a deposit for `months` + `days`.
 * Cumulative FDs compound quarterly for every completed quarter; the leftover
 * broken period earns simple interest on the accumulated balance — the same
 * convention Indian banks use on their deposit statements.
 */
function depositInterest(principal, annualRatePct, months, days, mode) {
  if (!(principal > 0) || annualRatePct <= 0) return 0;
  const r = annualRatePct / 100;
  const yearFraction = months / 12 + days / 365;
  if (yearFraction <= 0) return 0;

  if (mode !== "cumulative") return principal * r * yearFraction;

  const quarters = Math.floor(months / 3);
  const balance = principal * Math.pow(1 + r / 4, quarters);
  const brokenYears = (months - quarters * 3) / 12 + days / 365;
  return balance + balance * r * brokenYears - principal;
}

export default function ToolHome() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [bookedRate, setBookedRate] = useState(String(DEFAULTS.bookedRate));
  const [bookedMonths, setBookedMonths] = useState(String(DEFAULTS.bookedMonths));
  const [cardRate, setCardRate] = useState(String(DEFAULTS.cardRate));
  const [heldMonths, setHeldMonths] = useState(String(DEFAULTS.heldMonths));
  const [heldDays, setHeldDays] = useState(String(DEFAULTS.heldDays));
  const [penalty, setPenalty] = useState(String(DEFAULTS.penalty));
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const p = toNumber(amount);
    const br = toNumber(bookedRate);
    const bm = toNumber(bookedMonths);
    const cr = toNumber(cardRate);
    const hm = toNumber(heldMonths);
    const hd = toNumber(heldDays);
    const pen = toNumber(penalty);

    if ([p, br, bm, cr, hm, hd, pen].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (p <= 0) return { error: "Deposit amount must be greater than zero." };
    if (br <= 0 || br > 20) return { error: "Booked FD rate should be between 0% and 20% per year." };
    if (cr < 0 || cr > 20) return { error: "Card rate for the run period should be between 0% and 20% per year." };
    if (pen < 0 || pen > 5) return { error: "Premature penalty is normally between 0% and 5% per year." };
    if (bm <= 0 || bm > 120) return { error: "Original tenure should be between 1 and 120 months." };
    if (hm < 0 || hm > 120) return { error: "Completed months should be between 0 and 120." };
    if (hd < 0 || hd > 30) return { error: "Extra days should be between 0 and 30 (use months for longer periods)." };
    if (hm === 0 && hd === 0) return { error: "Enter how long the deposit actually stayed with the bank." };
    if (hm * 30 + hd >= bm * 30) {
      return { error: "The holding period must be shorter than the original tenure — otherwise the FD matured normally." };
    }

    const totalDays = hm * 30 + hd;
    const lockedIn = totalDays < 7;

    // Banks pay the card rate for the period actually completed, capped at the
    // contracted rate, and then deduct the premature-withdrawal penalty.
    const baseRate = Math.min(cr, br);
    const payoutRate = lockedIn ? 0 : Math.max(0, baseRate - pen);

    const actualInterest = depositInterest(p, payoutRate, hm, hd, mode);
    const atBookedRate = depositInterest(p, br, hm, hd, mode);
    const atCardRate = depositInterest(p, baseRate, hm, hd, mode);

    const resetLoss = Math.max(0, atBookedRate - atCardRate);
    const penaltyLoss = Math.max(0, atCardRate - actualInterest);
    const totalLossVsBooked = resetLoss + penaltyLoss;

    const maturityInterest = depositInterest(p, br, bm, 0, mode);
    const maturityValue = p + maturityInterest;
    const netPayout = p + actualInterest;

    return {
      principal: p,
      lockedIn,
      baseRate,
      payoutRate,
      actualInterest,
      atBookedRate,
      resetLoss,
      penaltyLoss,
      totalLossVsBooked,
      maturityInterest,
      maturityValue,
      netPayout,
      effectiveYield:
        totalDays > 0 ? (actualInterest / p) * (365 / (hm * (365 / 12) + hd)) * 100 : 0,
      heldLabel: `${hm} month${hm === 1 ? "" : "s"}${hd > 0 ? ` ${hd} day${hd === 1 ? "" : "s"}` : ""}`,
      bookedMonthsValue: bm,
    };
  }, [amount, bookedRate, bookedMonths, cardRate, heldMonths, heldDays, penalty, mode]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "FD Premature Withdrawal Penalty Calculator",
      `Deposit amount: ${money(calc.principal)}`,
      `Booked rate / tenure: ${pct(toNumber(bookedRate))} for ${calc.bookedMonthsValue} months`,
      `Actually held: ${calc.heldLabel}`,
      `Rate applied on closure: ${pct(calc.payoutRate)} per year`,
      `Interest paid: ${money2(calc.actualInterest)}`,
      `Net payout today: ${money2(calc.netPayout)}`,
      `Loss from rate reset: ${money2(calc.resetLoss)}`,
      `Loss from penalty: ${money2(calc.penaltyLoss)}`,
      `Value had you held to maturity: ${money2(calc.maturityValue)}`,
    ].join("\n");
  }, [calc, bookedRate]);

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
    setBookedRate(String(DEFAULTS.bookedRate));
    setBookedMonths(String(DEFAULTS.bookedMonths));
    setCardRate(String(DEFAULTS.cardRate));
    setHeldMonths(String(DEFAULTS.heldMonths));
    setHeldDays(String(DEFAULTS.heldDays));
    setPenalty(String(DEFAULTS.penalty));
    setMode(DEFAULTS.mode);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          Fixed deposits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          FD Premature Withdrawal Penalty Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Breaking an FD costs you twice — the rate is reset to the card rate for the period the
          deposit actually ran, and a penalty is deducted from that rate. See both, plus the exact
          amount that lands in your account.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-amount">
              Deposit amount (INR)
            </label>
            <input
              id="fd-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-booked-rate">
              Booked rate (% per year)
            </label>
            <input
              id="fd-booked-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={bookedRate}
              onChange={(event) => setBookedRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-booked-months">
              Original tenure (months)
            </label>
            <input
              id="fd-booked-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={bookedMonths}
              onChange={(event) => setBookedMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-card-rate">
              Card rate for the completed period (% per year)
            </label>
            <input
              id="fd-card-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={cardRate}
              onChange={(event) => setCardRate(event.target.value)}
            />
            <p className={HINT_CLASS}>
              The rate the bank offered, on your booking date, for the shorter tenure you actually
              ran.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-held-months">
              Completed months held
            </label>
            <input
              id="fd-held-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={heldMonths}
              onChange={(event) => setHeldMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-held-days">
              Extra days held (0-30)
            </label>
            <input
              id="fd-held-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={heldDays}
              onChange={(event) => setHeldDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-penalty">
              Premature penalty (% per year)
            </label>
            <input
              id="fd-penalty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="5"
              step="0.05"
              value={penalty}
              onChange={(event) => setPenalty(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-mode">
              Interest type
            </label>
            <select
              id="fd-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="cumulative">Cumulative (quarterly compounding)</option>
              <option value="simple">Non-cumulative / simple interest</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 0.5, 1].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPenalty(String(value))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value}% penalty
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
                  Net payout on premature closure
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money2(calc.netPayout)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money(calc.principal)} principal + {money2(calc.actualInterest)} interest at{" "}
                  {pct(calc.payoutRate)} for {calc.heldLabel}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy premature FD withdrawal result"
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

            {calc.lockedIn && (
              <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                Deposits closed within 7 days of booking earn no interest at most banks, so only the
                principal is returned.
              </p>
            )}

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Applicable card rate for the run period", pct(calc.baseRate)],
                ["Less premature-withdrawal penalty", `− ${pct(toNumber(penalty))}`],
                ["Rate actually paid", pct(calc.payoutRate)],
                ["Interest paid to you", money2(calc.actualInterest)],
                ["Interest at your booked rate for the same period", money2(calc.atBookedRate)],
                ["Loss from the rate reset", money2(calc.resetLoss)],
                ["Loss from the penalty", money2(calc.penaltyLoss)],
                ["Total interest given up vs booked rate", money2(calc.totalLossVsBooked)],
                ["Effective annualised yield realised", pct(calc.effectiveYield)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Break now or wait for maturity?</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Take the money out today", money2(calc.netPayout)],
                [
                  `Hold the full ${calc.bookedMonthsValue} months at ${pct(toNumber(bookedRate))}`,
                  money2(calc.maturityValue),
                ],
                ["Difference", money2(calc.maturityValue - calc.netPayout)],
                ["Interest still to be earned by waiting", money2(calc.maturityInterest - calc.actualInterest)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              The maturity figure assumes the deposit runs untouched to the end of its original
              tenure at the booked rate.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Banks differ on penalty waivers, minimum lock-in, day-count
        conventions and whether penalty applies when funds are reinvested — confirm the closure
        figure with your branch before you act.
      </p>
    </main>
  );
}
