"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PiggyBank, RotateCcw } from "lucide-react";

import {
  QUARTERS_PER_YEAR,
  SCSS_DEFAULT_RATE,
  SCSS_EXTENSION_YEARS,
  SCSS_MAX_DEPOSIT,
  SCSS_TENURE_YEARS,
  checkScssEligibility,
  computeScssPayout,
  computeScssPrematureClosure,
} from "../lib";

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

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const DASH = "—";

const DEFAULTS = {
  deposit: "3000000",
  rate: String(SCSS_DEFAULT_RATE),
  tenure: String(SCSS_TENURE_YEARS),
  age: "62",
  route: "general",
  heldYears: "3",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const ROUTES = [
  ["general", "Aged 60 or above"],
  ["retiree", "Retired on superannuation / VRS"],
  ["defence", "Retired defence services personnel"],
];

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [tenure, setTenure] = useState(DEFAULTS.tenure);
  const [age, setAge] = useState(DEFAULTS.age);
  const [route, setRoute] = useState(DEFAULTS.route);
  const [heldYears, setHeldYears] = useState(DEFAULTS.heldYears);
  const [copied, setCopied] = useState(false);

  const payout = useMemo(
    () =>
      computeScssPayout({
        deposit: toNumber(deposit),
        annualRate: toNumber(rate),
        tenureYears: toNumber(tenure),
      }),
    [deposit, rate, tenure],
  );

  const eligibility = useMemo(
    () => checkScssEligibility({ ageYears: toNumber(age), route }),
    [age, route],
  );

  const closure = useMemo(
    () =>
      computeScssPrematureClosure({
        deposit: toNumber(deposit),
        annualRate: toNumber(rate),
        heldYears: toNumber(heldYears),
      }),
    [deposit, rate, heldYears],
  );

  const ok = !payout.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Senior Citizen Savings Scheme (SCSS)",
      `Deposit: ${money(payout.deposit)}`,
      `Interest rate: ${NUM.format(payout.annualRate)}% per year`,
      `Quarterly payout: ${money2(payout.quarterlyPayout)}`,
      `Interest per year: ${money(payout.annualInterest)}`,
      `Interest over ${payout.tenureYears} years (${payout.totalQuarters} quarters): ${money(payout.totalInterest)}`,
      `Principal returned at maturity: ${money(payout.maturityAmount)}`,
      `Total received: ${money(payout.totalReceived)}`,
      payout.tdsApplicable
        ? `TDS: annual interest is above the ${money(payout.tdsThreshold)} senior-citizen threshold under Section 194A.`
        : `TDS: annual interest is within the ${money(payout.tdsThreshold)} senior-citizen threshold under Section 194A.`,
    ].join("\n");
  }, [ok, payout]);

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
    setTenure(DEFAULTS.tenure);
    setAge(DEFAULTS.age);
    setRoute(DEFAULTS.route);
    setHeldYears(DEFAULTS.heldYears);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          Small savings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SCSS Quarterly Payout Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          SCSS pays simple interest every quarter and returns the deposit untouched at maturity.
          Work out the quarterly cheque, the five-year interest, the Section 194A TDS position and
          what a premature closure would cost.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
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
              min="1000"
              max={SCSS_MAX_DEPOSIT}
              step="1000"
              value={deposit}
              onChange={(event) => setDeposit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scss-rate">
              Notified rate (% per year)
            </label>
            <input
              id="scss-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scss-tenure">
              Tenure (years)
            </label>
            <select
              id="scss-tenure"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tenure}
              onChange={(event) => setTenure(event.target.value)}
            >
              <option value={String(SCSS_TENURE_YEARS)}>
                {SCSS_TENURE_YEARS} years (original term)
              </option>
              <option value={String(SCSS_TENURE_YEARS + SCSS_EXTENSION_YEARS)}>
                {SCSS_TENURE_YEARS + SCSS_EXTENSION_YEARS} years (with the {SCSS_EXTENSION_YEARS}
                -year extension)
              </option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scss-age">
              Age at account opening (years)
            </label>
            <input
              id="scss-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="scss-route">
              Entry route
            </label>
            <select
              id="scss-route"
              className={`mt-2 ${INPUT_CLASS}`}
              value={route}
              onChange={(event) => setRoute(event.target.value)}
            >
              {ROUTES.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[500000, 1500000, 3000000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setDeposit(String(amount))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {money(amount)}
            </button>
          ))}
        </div>
      </section>

      {payout.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {payout.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Interest paid every quarter
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(payout.quarterlyPayout) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${payout.totalQuarters} payouts over ${payout.tenureYears} years, credited on 31 March, 30 June, 30 September and 31 December`
                : "Fix the input above to see the payout"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the SCSS payout result"
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
            ["Interest per year", ok ? money(payout.annualInterest) : DASH],
            ["Equivalent per month", ok ? money2(payout.monthlyEquivalent) : DASH],
            [
              `Total interest over ${ok ? payout.tenureYears : SCSS_TENURE_YEARS} years`,
              ok ? money(payout.totalInterest) : DASH,
            ],
            ["Principal returned at maturity", ok ? money(payout.maturityAmount) : DASH],
            ["Deposit plus all interest received", ok ? money(payout.totalReceived) : DASH],
            [
              "Section 80C deduction available (old regime)",
              ok ? money(payout.section80cEligible) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              payout.tdsApplicable
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {payout.tdsApplicable
              ? `Annual interest of ${money(payout.annualInterest)} crosses the ${money(payout.tdsThreshold)} senior-citizen threshold in Section 194A, so the bank or post office will deduct TDS unless Form 15H is filed and total income is below the taxable limit.`
              : `Annual interest of ${money(payout.annualInterest)} stays ${money(payout.tdsHeadroom)} below the ${money(payout.tdsThreshold)} senior-citizen threshold in Section 194A, so no TDS is expected on this account alone.`}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Can this applicant open an account?</h2>
        {eligibility.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {eligibility.error}
          </p>
        ) : (
          <>
            <p
              className={`mt-3 rounded-md px-3 py-2 text-sm font-semibold ${
                eligibility.eligible
                  ? "bg-[var(--muted)] text-[var(--success)]"
                  : "bg-[var(--danger-soft)] text-[var(--danger)]"
              }`}
            >
              {eligibility.eligible ? "Meets the age rule" : "Does not meet the age rule"} ·{" "}
              {eligibility.reason}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              {eligibility.conditions.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">If the account is closed early</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="scss-held">
              Held for (years)
            </label>
            <input
              id="scss-held"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="4.99"
              step="0.25"
              value={heldYears}
              onChange={(event) => setHeldYears(event.target.value)}
            />
          </div>
        </div>

        {closure.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {closure.error}
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">{closure.rule}</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <caption className="sr-only">Premature closure breakdown</caption>
                <tbody>
                  {[
                    ["Quarters completed", `${closure.completedQuarters} of ${SCSS_TENURE_YEARS * QUARTERS_PER_YEAR}`],
                    ["Interest already credited", money2(closure.interestCredited)],
                    ["Interest recovered on closure", money2(closure.interestRecovered)],
                    [
                      "Deduction from the deposit",
                      `${money2(closure.penaltyAmount)} (${NUM.format(closure.penaltyRate)}%)`,
                    ],
                    ["Deposit refunded", money2(closure.amountRefunded)],
                    ["Total in hand including interest kept", money2(closure.totalInHand)],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-[var(--border)] last:border-0">
                      <th
                        scope="row"
                        className="py-2.5 pr-3 text-left font-normal text-[var(--muted-foreground)]"
                      >
                        {label}
                      </th>
                      <td className="py-2.5 text-right font-semibold">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. The SCSS rate is re-notified every quarter but stays
        fixed for the life of an account opened in that quarter, and the ceiling of{" "}
        {money(SCSS_MAX_DEPOSIT)} applies across every SCSS account a depositor holds. Confirm the
        current rate and your own tax position with the post office, your bank or a qualified
        adviser.
      </p>
    </main>
  );
}
