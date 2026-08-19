"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PiggyBank, RotateCcw } from "lucide-react";

import { DAILY_RENT_BASES, computeDepositRefund } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");

const DEFAULTS = {
  deposit: "200000",
  monthlyRent: "25000",
  unpaidRentMonths: "1",
  noticeShortfallDays: "15",
  unpaidUtilities: "3500",
  damageCost: "8000",
  cleaningCost: "6000",
  otherDeductions: "0",
  dailyRentBasis: "thirty",
  premisesType: "residential",
  interestRatePercent: "0",
  monthsHeld: "24",
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
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [monthlyRent, setMonthlyRent] = useState(DEFAULTS.monthlyRent);
  const [unpaidRentMonths, setUnpaidRentMonths] = useState(DEFAULTS.unpaidRentMonths);
  const [noticeShortfallDays, setNoticeShortfallDays] = useState(DEFAULTS.noticeShortfallDays);
  const [unpaidUtilities, setUnpaidUtilities] = useState(DEFAULTS.unpaidUtilities);
  const [damageCost, setDamageCost] = useState(DEFAULTS.damageCost);
  const [cleaningCost, setCleaningCost] = useState(DEFAULTS.cleaningCost);
  const [otherDeductions, setOtherDeductions] = useState(DEFAULTS.otherDeductions);
  const [dailyRentBasis, setDailyRentBasis] = useState(DEFAULTS.dailyRentBasis);
  const [premisesType, setPremisesType] = useState(DEFAULTS.premisesType);
  const [interestRatePercent, setInterestRatePercent] = useState(DEFAULTS.interestRatePercent);
  const [monthsHeld, setMonthsHeld] = useState(DEFAULTS.monthsHeld);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const values = {
      deposit: toNumber(deposit),
      monthlyRent: toNumber(monthlyRent),
      unpaidRentMonths: toNumber(unpaidRentMonths),
      noticeShortfallDays: toNumber(noticeShortfallDays),
      unpaidUtilities: toNumber(unpaidUtilities),
      damageCost: toNumber(damageCost),
      cleaningCost: toNumber(cleaningCost),
      otherDeductions: toNumber(otherDeductions),
      interestRatePercent: toNumber(interestRatePercent),
      monthsHeld: toNumber(monthsHeld),
    };

    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Every box needs a number — use 0 where nothing is owed." };
    }

    return computeDepositRefund({ ...values, dailyRentBasis, premisesType });
  }, [
    deposit,
    monthlyRent,
    unpaidRentMonths,
    noticeShortfallDays,
    unpaidUtilities,
    damageCost,
    cleaningCost,
    otherDeductions,
    dailyRentBasis,
    premisesType,
    interestRatePercent,
    monthsHeld,
  ]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Security deposit refund",
      `Deposit paid: ${money(result.deposit)}`,
      `Interest added: ${money(result.interest)}`,
      ...result.lines.map((line) => `Less ${line.label}: ${money(line.amount)}`),
      `Total deductions: ${money(result.totalDeductions)}`,
      `Refund due: ${money(result.refund)}`,
      result.shortfall > 0 ? `Still owed by the tenant: ${money(result.shortfall)}` : "",
      `Deposit equals ${NUM.format(result.depositInMonths)} months of rent (Model Tenancy Act guide: ${result.capMonths})`,
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
    setDeposit(DEFAULTS.deposit);
    setMonthlyRent(DEFAULTS.monthlyRent);
    setUnpaidRentMonths(DEFAULTS.unpaidRentMonths);
    setNoticeShortfallDays(DEFAULTS.noticeShortfallDays);
    setUnpaidUtilities(DEFAULTS.unpaidUtilities);
    setDamageCost(DEFAULTS.damageCost);
    setCleaningCost(DEFAULTS.cleaningCost);
    setOtherDeductions(DEFAULTS.otherDeductions);
    setDailyRentBasis(DEFAULTS.dailyRentBasis);
    setPremisesType(DEFAULTS.premisesType);
    setInterestRatePercent(DEFAULTS.interestRatePercent);
    setMonthsHeld(DEFAULTS.monthsHeld);
    setCopied(false);
  };

  const numberField = (id, label, value, setter, extra = {}) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min="0"
        step={extra.step || "500"}
        value={value}
        onChange={(event) => setter(event.target.value)}
      />
      {extra.hint ? (
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{extra.hint}</p>
      ) : null}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          Moving out
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Security Deposit Refund Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Adds up what a landlord can lawfully hold back — unpaid rent, notice shortfall, utilities
          and damage beyond normal wear and tear — and shows the balance due back, or what the tenant
          still owes when deductions run past the deposit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberField("sd-deposit", "Deposit paid (INR)", deposit, setDeposit, { step: "5000" })}
          {numberField("sd-rent", "Monthly rent (INR)", monthlyRent, setMonthlyRent)}
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-premises">
              Type of premises
            </label>
            <select
              id="sd-premises"
              className={`mt-2 ${INPUT_CLASS}`}
              value={premisesType}
              onChange={(event) => setPremisesType(event.target.value)}
            >
              <option value="residential">Residential</option>
              <option value="nonResidential">Non-residential (shop or office)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-basis">
              Daily rent basis for part months
            </label>
            <select
              id="sd-basis"
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
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Deductions
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {numberField(
            "sd-unpaid-months",
            "Unpaid rent (months)",
            unpaidRentMonths,
            setUnpaidRentMonths,
            { step: "0.5" },
          )}
          {numberField(
            "sd-notice",
            "Notice period shortfall (days)",
            noticeShortfallDays,
            setNoticeShortfallDays,
            { step: "1", hint: "Days you left short of the notice the agreement required." },
          )}
          {numberField("sd-utilities", "Unpaid utilities and society dues (INR)", unpaidUtilities, setUnpaidUtilities)}
          {numberField("sd-damage", "Damage beyond normal wear and tear (INR)", damageCost, setDamageCost)}
          {numberField("sd-cleaning", "Painting or deep cleaning (INR)", cleaningCost, setCleaningCost)}
          {numberField("sd-other", "Other agreed deductions (INR)", otherDeductions, setOtherDeductions)}
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Interest, if the agreement promises any
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {numberField(
            "sd-interest",
            "Simple interest on the deposit (% a year)",
            interestRatePercent,
            setInterestRatePercent,
            { step: "0.5" },
          )}
          {numberField("sd-held", "Months the landlord held the deposit", monthsHeld, setMonthsHeld, {
            step: "1",
          })}
        </div>
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
          <div aria-live="polite" aria-atomic="true">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Refund due to the tenant
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? "—" : money(result.refund)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fill every box with a number to see the balance"
                : result.shortfall > 0
                  ? `Deductions exceed the deposit — the tenant still owes ${money(result.shortfall)}`
                  : `${pct(result.refundPercent)} of the refundable amount comes back`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the deposit refund breakdown"
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
            ["Deposit paid", hasError ? "—" : money(result.deposit)],
            ["Interest added", hasError ? "—" : money(result.interest)],
            ["Refundable before deductions", hasError ? "—" : money(result.refundable)],
            ["Total deductions", hasError ? "—" : money(result.totalDeductions)],
            [
              "Daily rent used",
              hasError ? "—" : `${money(result.dailyRent)} (${result.dailyRentBasisLabel})`,
            ],
            [
              "Deposit in months of rent",
              hasError ? "—" : `${NUM.format(result.depositInMonths)} months`,
            ],
            [
              "Model Tenancy Act guide cap",
              hasError ? "—" : `${result.capMonths} months (${money(result.capAmount)})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.exceedsCap && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The deposit is {money(result.excessOverCap)} above the {result.capMonths}-month figure in
            section 11(1) of the Model Tenancy Act, 2021. That Act binds a tenancy only where the
            state has enacted or notified it, so this is a benchmark rather than an automatic breach.
          </p>
        )}
      </section>

      {!hasError && result.lines.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Deduction breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                  <th scope="col" className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.label} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{line.label}</span>
                      {line.detail ? (
                        <span className="block text-[var(--muted-foreground)]">{line.detail}</span>
                      ) : null}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(line.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-semibold">Total</td>
                  <td className="py-2 text-right font-semibold">{money(result.totalDeductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Normal wear and tear — faded paint, minor scuffs, aged
        fittings — is not a deductible damage, and a landlord who deducts for repairs should produce
        bills. Section 11(2) of the Model Tenancy Act puts the refund at the point of handing over
        vacant possession, less the tenant&apos;s lawful liabilities. Where a state has not adopted
        that Act, the agreement and local rent law govern, and a disputed deduction is a matter for
        the rent authority or a lawyer.
      </p>
    </main>
  );
}
