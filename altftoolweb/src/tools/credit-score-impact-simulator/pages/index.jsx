"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  limit: 300000,
  balance: 90000,
  missed: 0,
  worst: "none",
  historyYears: 6,
  cards: 2,
  loans: 1,
  enquiries: 2,
  newBalance: 30000,
  extraEnquiries: 1,
  extraMissed: 0,
};

const WORST_PENALTY = {
  none: 0,
  dpd30: 25,
  dpd60: 40,
  dpd90: 60,
  settled: 80,
};

const WORST_LABELS = {
  none: "No late payments",
  dpd30: "Up to 30 days late",
  dpd60: "31–60 days late",
  dpd90: "90+ days late",
  settled: "Settled / written off",
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Payment history — the heaviest bureau factor (about 35% of the score). */
export function paymentSubScore(missed, worst) {
  const base = WORST_PENALTY[worst] ?? WORST_PENALTY.dpd30;
  if (missed <= 0) return clamp(100 - base, 0, 100);
  const extra = Math.max(0, missed - 1) * 6;
  return clamp(100 - base - extra, 0, 100);
}

/** Credit utilisation — about 30% of the score, and the fastest to change. */
export function utilisationSubScore(utilisation) {
  const u = Math.max(0, utilisation);
  if (u > 100) return 0;
  if (u <= 10) return 100;
  if (u <= 30) return 100 - (u - 10) * 1.5;
  if (u <= 50) return 70 - (u - 30) * 1.25;
  if (u <= 75) return 45 - (u - 50) * 1.0;
  return 20 - (u - 75) * 0.6;
}

/** Length of credit history — about 15%. Under a year barely counts. */
export function historySubScore(years) {
  if (years < 1) return 20;
  return clamp(20 + (years - 1) * (80 / 9), 0, 100);
}

/** Credit mix — about 10%. A blend of revolving and instalment credit scores best. */
export function mixSubScore(cards, loans) {
  if (cards > 0 && loans > 0) return 100;
  if (cards > 0 || loans > 0) return 60;
  return 30;
}

/** New credit / hard enquiries — about 10%. The first enquiry costs little. */
export function enquirySubScore(enquiries) {
  const e = Math.max(0, enquiries);
  if (e === 0) return 100;
  if (e === 1) return 95;
  return clamp(95 - (e - 1) * 13, 0, 100);
}

export const FACTORS = [
  { key: "payment", label: "Payment history", weight: 35 },
  { key: "utilisation", label: "Credit utilisation", weight: 30 },
  { key: "history", label: "Length of credit history", weight: 15 },
  { key: "mix", label: "Credit mix", weight: 10 },
  { key: "enquiries", label: "New credit / enquiries", weight: 10 },
];

export function bandFor(score) {
  if (score >= 800) return "Excellent";
  if (score >= 750) return "Very good";
  if (score >= 650) return "Good";
  if (score >= 550) return "Fair";
  return "Poor";
}

/** Maps weighted factor scores onto the 300–900 bureau range used in India. */
export function estimateScore(profile) {
  const subs = {
    payment: paymentSubScore(profile.missed, profile.worst),
    utilisation: utilisationSubScore(profile.utilisation),
    history: historySubScore(profile.historyYears),
    mix: mixSubScore(profile.cards, profile.loans),
    enquiries: enquirySubScore(profile.enquiries),
  };
  const weighted = FACTORS.reduce((sum, f) => sum + (subs[f.key] * f.weight) / 100, 0);
  const score = Math.round(300 + 6 * weighted);
  return { score: clamp(score, 300, 900), subs, band: bandFor(score) };
}

export default function ToolHome() {
  const [limit, setLimit] = useState(String(DEFAULTS.limit));
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [missed, setMissed] = useState(String(DEFAULTS.missed));
  const [worst, setWorst] = useState(DEFAULTS.worst);
  const [historyYears, setHistoryYears] = useState(String(DEFAULTS.historyYears));
  const [cards, setCards] = useState(String(DEFAULTS.cards));
  const [loans, setLoans] = useState(String(DEFAULTS.loans));
  const [enquiries, setEnquiries] = useState(String(DEFAULTS.enquiries));
  const [newBalance, setNewBalance] = useState(String(DEFAULTS.newBalance));
  const [extraEnquiries, setExtraEnquiries] = useState(String(DEFAULTS.extraEnquiries));
  const [extraMissed, setExtraMissed] = useState(String(DEFAULTS.extraMissed));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const values = {
      limit: toNumber(limit),
      balance: toNumber(balance),
      missed: toNumber(missed),
      historyYears: toNumber(historyYears),
      cards: toNumber(cards),
      loans: toNumber(loans),
      enquiries: toNumber(enquiries),
      newBalance: toNumber(newBalance),
      extraEnquiries: toNumber(extraEnquiries),
      extraMissed: toNumber(extraMissed),
    };

    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (values.limit <= 0) return { error: "Total credit limit must be greater than zero." };
    if (values.balance < 0 || values.newBalance < 0) {
      return { error: "Card balances cannot be negative." };
    }
    if (values.missed < 0 || values.extraMissed < 0) {
      return { error: "Missed payment counts cannot be negative." };
    }
    if (values.missed > 24 || values.extraMissed > 24) {
      return { error: "Count missed payments over the last 24 months only." };
    }
    if (values.historyYears < 0 || values.historyYears > 50) {
      return { error: "Credit history length should be between 0 and 50 years." };
    }
    if (values.cards < 0 || values.loans < 0 || values.cards > 30 || values.loans > 30) {
      return { error: "Enter between 0 and 30 accounts of each type." };
    }
    if (values.enquiries < 0 || values.extraEnquiries < 0) {
      return { error: "Enquiry counts cannot be negative." };
    }
    if (values.enquiries > 30 || values.extraEnquiries > 30) {
      return { error: "Enter up to 30 hard enquiries." };
    }

    const utilisation = (values.balance / values.limit) * 100;
    const nextUtilisation = (values.newBalance / values.limit) * 100;
    const nextMissed = values.missed + values.extraMissed;
    const worstAfter =
      values.extraMissed > 0 && WORST_PENALTY[worst] < WORST_PENALTY.dpd30 ? "dpd30" : worst;

    const now = estimateScore({
      utilisation,
      missed: values.missed,
      worst,
      historyYears: values.historyYears,
      cards: values.cards,
      loans: values.loans,
      enquiries: values.enquiries,
    });
    const after = estimateScore({
      utilisation: nextUtilisation,
      missed: nextMissed,
      worst: worstAfter,
      historyYears: values.historyYears,
      cards: values.cards,
      loans: values.loans,
      enquiries: values.enquiries + values.extraEnquiries,
    });

    return {
      ...values,
      utilisation,
      nextUtilisation,
      nextMissed,
      worstAfter,
      now,
      after,
      delta: after.score - now.score,
    };
  }, [
    limit,
    balance,
    missed,
    worst,
    historyYears,
    cards,
    loans,
    enquiries,
    newBalance,
    extraEnquiries,
    extraMissed,
  ]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Credit Score Impact Simulator (estimate)",
      `Credit limit: ${money(calc.limit)}`,
      `Utilisation now: ${pct(calc.utilisation)} → after: ${pct(calc.nextUtilisation)}`,
      `Missed payments (24 months): ${calc.missed} → ${calc.nextMissed}`,
      `Hard enquiries (12 months): ${calc.enquiries} → ${calc.enquiries + calc.extraEnquiries}`,
      `Estimated score now: ${calc.now.score} (${calc.now.band})`,
      `Estimated score after: ${calc.after.score} (${calc.after.band})`,
      `Estimated movement: ${calc.delta >= 0 ? "+" : ""}${calc.delta} points`,
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
    setLimit(String(DEFAULTS.limit));
    setBalance(String(DEFAULTS.balance));
    setMissed(String(DEFAULTS.missed));
    setWorst(DEFAULTS.worst);
    setHistoryYears(String(DEFAULTS.historyYears));
    setCards(String(DEFAULTS.cards));
    setLoans(String(DEFAULTS.loans));
    setEnquiries(String(DEFAULTS.enquiries));
    setNewBalance(String(DEFAULTS.newBalance));
    setExtraEnquiries(String(DEFAULTS.extraEnquiries));
    setExtraMissed(String(DEFAULTS.extraMissed));
    setCopied(false);
  };

  const deltaTone =
    !calc.error && calc.delta > 0
      ? "text-[var(--success)]"
      : !calc.error && calc.delta < 0
        ? "text-[var(--danger)]"
        : "text-[var(--muted-foreground)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Credit health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Credit Score Impact Simulator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Model how paying down a card, adding a loan enquiry or missing an EMI could move your score
          on the 300–900 bureau scale. It uses the published factor weights bureaus disclose — payment
          history 35%, utilisation 30%, history length 15%, credit mix 10%, new credit 10%.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your credit profile today</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-limit">
              Total credit card limit (INR)
            </label>
            <input
              id="cs-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-balance">
              Current outstanding balance (INR)
            </label>
            <input
              id="cs-balance"
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
            <label className={LABEL_CLASS} htmlFor="cs-missed">
              Missed payments in the last 24 months
            </label>
            <input
              id="cs-missed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="24"
              step="1"
              value={missed}
              onChange={(event) => setMissed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-worst">
              Worst delinquency on record
            </label>
            <select
              id="cs-worst"
              className={`mt-2 ${INPUT_CLASS}`}
              value={worst}
              onChange={(event) => setWorst(event.target.value)}
            >
              {Object.entries(WORST_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-history">
              Age of your oldest credit account (years)
            </label>
            <input
              id="cs-history"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.5"
              value={historyYears}
              onChange={(event) => setHistoryYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-enquiries">
              Hard enquiries in the last 12 months
            </label>
            <input
              id="cs-enquiries"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={enquiries}
              onChange={(event) => setEnquiries(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-cards">
              Number of credit cards
            </label>
            <input
              id="cs-cards"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={cards}
              onChange={(event) => setCards(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-loans">
              Number of active loans
            </label>
            <input
              id="cs-loans"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={loans}
              onChange={(event) => setLoans(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What you are planning to change</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-new-balance">
              Balance after the change (INR)
            </label>
            <input
              id="cs-new-balance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={newBalance}
              onChange={(event) => setNewBalance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-extra-enq">
              New loan or card applications
            </label>
            <input
              id="cs-extra-enq"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={extraEnquiries}
              onChange={(event) => setExtraEnquiries(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-extra-missed">
              Payments you expect to miss
            </label>
            <input
              id="cs-extra-missed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="24"
              step="1"
              value={extraMissed}
              onChange={(event) => setExtraMissed(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 10, 30, 50].map((target) => (
            <button
              key={target}
              type="button"
              onClick={() => {
                const l = toNumber(limit);
                if (!Number.isFinite(l) || l <= 0) return;
                setNewBalance(String(Math.round((l * target) / 100)));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              Take utilisation to {target}%
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
                  Estimated score movement
                </p>
                <p className={`mt-1 text-4xl font-semibold ${deltaTone}`}>
                  {calc.delta >= 0 ? "+" : ""}
                  {calc.delta} points
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {calc.now.score} ({calc.now.band}) → {calc.after.score} ({calc.after.band})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy credit score simulation result"
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

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Today", calc.now, calc.utilisation, calc.missed, calc.enquiries],
                [
                  "After the change",
                  calc.after,
                  calc.nextUtilisation,
                  calc.nextMissed,
                  calc.enquiries + calc.extraEnquiries,
                ],
              ].map(([title, result, util, miss, enq]) => (
                <div
                  key={title}
                  className="rounded-md bg-[var(--background)] p-4 ring-1 ring-[var(--border)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {title}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">{result.score}</p>
                  <p className="text-sm font-semibold">{result.band}</p>
                  <div
                    className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                    role="img"
                    aria-label={`Score ${result.score} out of 900`}
                  >
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${((result.score - 300) / 600) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Utilisation {pct(util)} · {miss} missed · {enq} enquiries
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Where the points come from</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Factor
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Weight
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Now
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      After
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FACTORS.map((factor) => (
                    <tr key={factor.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{factor.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {factor.weight}%
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {Math.round(calc.now.subs[factor.key])}/100
                      </td>
                      <td className="py-2 text-right">
                        {Math.round(calc.after.subs[factor.key])}/100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Utilisation is the fastest lever — it is recalculated the moment your statement is
              reported, so paying a card down before the statement date can move the score within a
              billing cycle. Missed payments stay on the bureau report for up to 36 months.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is an educational estimate, not your actual CIBIL, Experian, Equifax or CRIF score.
        Bureaus use proprietary models with data this tool cannot see, so treat the movement as a
        direction of travel rather than a prediction. Not financial advice.
      </p>
    </main>
  );
}
