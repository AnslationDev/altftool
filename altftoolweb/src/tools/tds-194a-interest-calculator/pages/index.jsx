"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PiggyBank, RotateCcw } from "lucide-react";
import {
  DEPOSIT_TYPES,
  EXCLUSIONS,
  NO_PAN_RATE,
  PAYER_TYPES,
  SENIOR_CITIZEN_AGE,
  annualInterestOnDeposit,
  computeTds194A,
  thresholdFor,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money0 = (value) => (Number.isFinite(value) ? INR0.format(value) : DASH);

const FY_OPTIONS = [
  { value: 2025, label: "FY 2025-26 onwards" },
  { value: 2024, label: "FY 2024-25 or earlier" },
];

const DEFAULTS = {
  interest: "72500",
  payerType: "bank",
  depositType: "time",
  seniorCitizen: false,
  fyStartYear: 2025,
  panFurnished: true,
  declarationFiled: false,
  principal: "1000000",
  rate: "7.25",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW = "flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]";
const CHECKBOX = "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [interest, setInterest] = useState(DEFAULTS.interest);
  const [payerType, setPayerType] = useState(DEFAULTS.payerType);
  const [depositType, setDepositType] = useState(DEFAULTS.depositType);
  const [seniorCitizen, setSeniorCitizen] = useState(DEFAULTS.seniorCitizen);
  const [fyStartYear, setFyStartYear] = useState(DEFAULTS.fyStartYear);
  const [panFurnished, setPanFurnished] = useState(DEFAULTS.panFurnished);
  const [declarationFiled, setDeclarationFiled] = useState(DEFAULTS.declarationFiled);
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTds194A({
        interestAmount: toNumber(interest),
        payerType,
        depositType,
        seniorCitizen,
        fyStartYear,
        panFurnished,
        declarationFiled,
      }),
    [interest, payerType, depositType, seniorCitizen, fyStartYear, panFurnished, declarationFiled],
  );

  const derived = useMemo(
    () => annualInterestOnDeposit(toNumber(principal), toNumber(rate)),
    [principal, rate],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Section 194A TDS on interest",
      `Interest for the year: ${money(result.interestAmount)}`,
      `Payer: ${payerType === "bank" ? "Bank or post office" : "Other payer"}`,
      `Senior citizen: ${seniorCitizen ? "Yes" : "No"}`,
      `Threshold: ${money0(result.threshold)}`,
      `Rate applied: ${result.appliedRate}%`,
      `TDS deducted: ${money(result.tds)}`,
      `Interest received after TDS: ${money(result.netInterest)}`,
    ].join("\n");
  }, [hasError, result, payerType, seniorCitizen]);

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
    setInterest(DEFAULTS.interest);
    setPayerType(DEFAULTS.payerType);
    setDepositType(DEFAULTS.depositType);
    setSeniorCitizen(DEFAULTS.seniorCitizen);
    setFyStartYear(DEFAULTS.fyStartYear);
    setPanFurnished(DEFAULTS.panFurnished);
    setDeclarationFiled(DEFAULTS.declarationFiled);
    setPrincipal(DEFAULTS.principal);
    setRate(DEFAULTS.rate);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          Section 194A
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          TDS on Interest (Section 194A)
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See whether your bank will cut TDS on deposit interest this year, at what rate, and what
          lands in your account — using the Rs 1,00,000 senior citizen, Rs 50,000 bank and
          Rs 10,000 non-bank limits in force from 1 April 2025.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="a-payer">
              Who pays the interest
            </label>
            <select
              id="a-payer"
              className={`mt-2 ${INPUT_CLASS}`}
              value={payerType}
              onChange={(event) => setPayerType(event.target.value)}
            >
              {PAYER_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              {PAYER_TYPES.find((item) => item.id === payerType)?.note}
            </p>
          </div>

          {payerType === "bank" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="a-deposit">
                Type of account
              </label>
              <select
                id="a-deposit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={depositType}
                onChange={(event) => setDepositType(event.target.value)}
              >
                {DEPOSIT_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className={LABEL_CLASS} htmlFor="a-interest">
              Interest for the financial year (INR)
            </label>
            <input
              id="a-interest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
            />
            <p className={HINT_CLASS}>Add up every branch and every deposit with the same payer.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="a-fy">
              Financial year
            </label>
            <select
              id="a-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fyStartYear}
              onChange={(event) => setFyStartYear(Number(event.target.value))}
            >
              {FY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="a-senior">
              <input
                id="a-senior"
                type="checkbox"
                className={CHECKBOX}
                checked={seniorCitizen}
                onChange={(event) => setSeniorCitizen(event.target.checked)}
              />
              Depositor is {SENIOR_CITIZEN_AGE} or above
            </label>
            <p className={HINT_CLASS}>Age reached at any time during the year counts.</p>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="a-pan">
              <input
                id="a-pan"
                type="checkbox"
                className={CHECKBOX}
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              PAN is on record with the payer
            </label>
            <p className={HINT_CLASS}>Without PAN, section 206AA forces {NO_PAN_RATE}%.</p>
          </div>

          <div className="sm:col-span-2">
            <label className={CHECK_ROW} htmlFor="a-form15">
              <input
                id="a-form15"
                type="checkbox"
                className={CHECKBOX}
                checked={declarationFiled}
                onChange={(event) => setDeclarationFiled(event.target.checked)}
              />
              Valid Form 15G or 15H filed under section 197A
            </label>
          </div>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              TDS on this year&rsquo;s interest
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.tds)}
            </p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the deduction." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy section 194A interest TDS result"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["Rate applied", hasError ? DASH : `${result.appliedRate}%`],
            ["Standard rate for residents", `${result.statutoryRate ?? 10}%`],
            ["Threshold for this payer and payee", hasError ? DASH : money0(result.threshold)],
            ["Interest for the year", hasError ? DASH : money(result.interestAmount)],
            ["TDS deducted", hasError ? DASH : money(result.tds)],
            ["Interest credited after TDS", hasError ? DASH : money(result.netInterest)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.deductionRequired && result.headroom > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
            Another {money(result.headroom)} of interest this year still stays below the limit.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Estimate the interest from a deposit</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A payout deposit that pays interest out rather than compounding it.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="a-principal">
              Deposit amount (INR)
            </label>
            <input
              id="a-principal"
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
            <label className={LABEL_CLASS} htmlFor="a-rate">
              Interest rate (% per year)
            </label>
            <input
              id="a-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.05"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted-foreground)]">
            Interest for a year:{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {derived.error ? DASH : money(derived.interest)}
            </span>
          </p>
          <button
            type="button"
            className={GHOST_BTN}
            disabled={Boolean(derived.error)}
            onClick={() => {
              if (derived.error) return;
              setInterest(String(derived.interest));
            }}
          >
            Use this amount above
          </button>
        </div>
        {derived.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {derived.error}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Threshold table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Payer and payee
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  FY 2025-26
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Up to FY 2024-25
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Bank or post office, senior citizen", "bank", true],
                ["Bank or post office, others", "bank", false],
                ["Any other payer", "other", false],
              ].map(([label, payer, senior]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">
                    {money0(thresholdFor(payer, senior, 2025))}
                  </td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {money0(thresholdFor(payer, senior, 2024))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Interest outside section 194A</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {EXCLUSIONS.map(([title, note]) => (
            <div key={title} className="py-2.5">
              <dt className="font-semibold">{title}</dt>
              <dd className="text-[var(--muted-foreground)]">{note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. TDS is not the final tax — the interest goes into your
        total income and the deduction is credited against the tax you owe, so a refund arises if
        too much was cut. Form 15G or 15H may be filed only if you genuinely qualify under
        section 197A; a false declaration is an offence. Speak to a tax professional about your case.
      </p>
    </main>
  );
}
