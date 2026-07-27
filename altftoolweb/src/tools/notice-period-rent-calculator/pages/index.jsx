"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  DAILY_RENT_BASES,
  MAX_LOCK_IN_MONTHS,
  MAX_NOTICE_MONTHS,
  OVERSTAY_MULTIPLIERS,
  computeNoticeLiability,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const DEFAULTS = {
  monthlyRent: "30000",
  noticeMonths: "2",
  noticeGivenDate: "2026-08-01",
  vacateDate: "2026-08-31",
  agreementStartDate: "2026-04-01",
  lockInMonths: "0",
  dailyRentBasis: "thirty",
  deposit: "60000",
  adjustAgainstDeposit: true,
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
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [monthlyRent, setMonthlyRent] = useState(DEFAULTS.monthlyRent);
  const [noticeMonths, setNoticeMonths] = useState(DEFAULTS.noticeMonths);
  const [noticeGivenDate, setNoticeGivenDate] = useState(DEFAULTS.noticeGivenDate);
  const [vacateDate, setVacateDate] = useState(DEFAULTS.vacateDate);
  const [agreementStartDate, setAgreementStartDate] = useState(DEFAULTS.agreementStartDate);
  const [lockInMonths, setLockInMonths] = useState(DEFAULTS.lockInMonths);
  const [dailyRentBasis, setDailyRentBasis] = useState(DEFAULTS.dailyRentBasis);
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [adjustAgainstDeposit, setAdjustAgainstDeposit] = useState(DEFAULTS.adjustAgainstDeposit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const rent = toNumber(monthlyRent);
    const notice = toNumber(noticeMonths);
    const lockIn = toNumber(lockInMonths);
    const depositValue = toNumber(deposit);

    if ([rent, notice, lockIn, depositValue].some((value) => Number.isNaN(value))) {
      return { error: "Enter rent, notice months, lock-in months and deposit as numbers." };
    }

    return computeNoticeLiability({
      monthlyRent: rent,
      noticeMonths: Math.round(notice),
      noticeGivenDate,
      vacateDate,
      agreementStartDate,
      lockInMonths: Math.round(lockIn),
      dailyRentBasis,
      deposit: depositValue,
      adjustAgainstDeposit,
    });
  }, [
    monthlyRent,
    noticeMonths,
    noticeGivenDate,
    vacateDate,
    agreementStartDate,
    lockInMonths,
    dailyRentBasis,
    deposit,
    adjustAgainstDeposit,
  ]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Notice period rent liability",
      `Monthly rent: ${money(result.monthlyRent)} (${money(result.dailyRent)} a day, ${result.dailyRentBasisLabel})`,
      `Notice served: ${result.noticeGivenDate}`,
      `Notice period ends: ${result.noticeEndDate}`,
      result.lockInEndDate ? `Lock-in ends: ${result.lockInEndDate}` : "",
      `Rent runs to: ${result.liabilityEndDate} (${result.bindingClause} binds)`,
      `Keys handed over: ${result.vacateDate}`,
      `Days short: ${result.shortfallDays}`,
      `Rent still owed: ${money(result.liability)}`,
      `Adjusted against deposit: ${money(result.depositApplied)}`,
      `Deposit coming back: ${money(result.depositReturned)}`,
      `Balance to pay: ${money(result.balancePayable)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result]);

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
    setMonthlyRent(DEFAULTS.monthlyRent);
    setNoticeMonths(DEFAULTS.noticeMonths);
    setNoticeGivenDate(DEFAULTS.noticeGivenDate);
    setVacateDate(DEFAULTS.vacateDate);
    setAgreementStartDate(DEFAULTS.agreementStartDate);
    setLockInMonths(DEFAULTS.lockInMonths);
    setDailyRentBasis(DEFAULTS.dailyRentBasis);
    setDeposit(DEFAULTS.deposit);
    setAdjustAgainstDeposit(DEFAULTS.adjustAgainstDeposit);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Leaving early
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Notice Period Rent Liability Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Handing back the keys does not end the rent — the unserved part of the notice period stays
          payable, and where a lock-in is still running, rent runs to whichever of the two ends later.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="np-rent">
              Monthly rent (INR)
            </label>
            <input
              id="np-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="500"
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-notice-months">
              Notice period in the agreement (months)
            </label>
            <input
              id="np-notice-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_NOTICE_MONTHS}
              step="1"
              value={noticeMonths}
              onChange={(event) => setNoticeMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-notice-date">
              Date you served written notice
            </label>
            <input
              id="np-notice-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={noticeGivenDate}
              onChange={(event) => setNoticeGivenDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-vacate">
              Date you hand over the keys
            </label>
            <input
              id="np-vacate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={vacateDate}
              onChange={(event) => setVacateDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-lockin">
              Lock-in period (months)
            </label>
            <input
              id="np-lockin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_LOCK_IN_MONTHS}
              step="1"
              value={lockInMonths}
              onChange={(event) => setLockInMonths(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Leave at 0 if the agreement has no lock-in.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-start">
              Date the agreement started
            </label>
            <input
              id="np-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={agreementStartDate}
              onChange={(event) => setAgreementStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-basis">
              Daily rent basis
            </label>
            <select
              id="np-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dailyRentBasis}
              onChange={(event) => setDailyRentBasis(event.target.value)}
            >
              {Object.entries(DAILY_RENT_BASES).map(([key, basis]) => (
                <option key={key} value={key}>
                  {basis.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-deposit">
              Security deposit held (INR)
            </label>
            <input
              id="np-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={deposit}
              onChange={(event) => setDeposit(event.target.value)}
            />
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium" htmlFor="np-adjust">
          <input
            id="np-adjust"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={adjustAgainstDeposit}
            onChange={(event) => setAdjustAgainstDeposit(event.target.checked)}
          />
          The agreement lets the landlord adjust this against the deposit
        </label>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Rent still owed
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? "—" : money(result.liability)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs to see the liability"
                : result.clean
                  ? `You leave on or after ${result.liabilityEndDate}, so nothing extra is due`
                  : `${result.shortfallDays} days short — rent runs to ${result.liabilityEndDate} because the ${result.bindingClause} binds`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the notice period liability"
              className={GHOST_BTN}
              disabled={hasError}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Notice period ends", hasError ? "—" : result.noticeEndDate],
            ["Lock-in ends", hasError ? "—" : result.lockInEndDate || "No lock-in"],
            ["Rent runs to", hasError ? "—" : result.liabilityEndDate],
            ["Days short of that date", hasError ? "—" : String(result.shortfallDays)],
            [
              "That is roughly",
              hasError ? "—" : `${NUM.format(result.shortfallMonthsEquivalent)} months of rent`,
            ],
            [
              "Daily rent used",
              hasError ? "—" : `${money(result.dailyRent)} (${result.dailyRentBasisLabel})`,
            ],
            ["Adjusted against the deposit", hasError ? "—" : money(result.depositApplied)],
            ["Deposit coming back", hasError ? "—" : money(result.depositReturned)],
            ["Balance still to pay", hasError ? "—" : money(result.balancePayable)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the two clauses interact</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>
            Notice runs from the day written notice is served, not from the day you decide to leave.
            Serving it late simply pushes the end date out.
          </li>
          <li>
            A lock-in is a floor, not a ceiling. Where the lock-in ends after the notice period, rent
            is due to the end of the lock-in even though the notice was properly served.
          </li>
          <li>
            Leaving early is a breach of the notice clause, not a criminal matter — the landlord&apos;s
            remedy is the unpaid rent, normally adjusted against the deposit.
          </li>
          <li>
            The reverse case is overstaying. Section 21(3) of the Model Tenancy Act, 2021 lets a
            landlord claim {OVERSTAY_MULTIPLIERS.firstTwoMonths} times the monthly rent for the first
            two months and {OVERSTAY_MULTIPLIERS.afterwards} times after that, where that Act applies.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. What you owe is ultimately what the agreement says, and
        many landlords waive part of it where a replacement tenant is found quickly — put any waiver
        in writing. For a disputed claim, or where the deposit is being withheld beyond the amount
        due, speak to a lawyer or the rent authority in your state.
      </p>
    </main>
  );
}
