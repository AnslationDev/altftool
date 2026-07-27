"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wallet } from "lucide-react";

import { FOIR_BANDS, computeLoanEligibility } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DASH = "—";

const DEFAULTS = {
  netMonthlyIncome: "80000",
  otherMonthlyIncome: "0",
  existingEmi: "10000",
  annualRatePercent: "8.5",
  tenureMonths: "240",
  foirMode: "band",
  foirPercent: "50",
  loanType: "home",
  propertyValue: "5000000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [netMonthlyIncome, setNetMonthlyIncome] = useState(DEFAULTS.netMonthlyIncome);
  const [otherMonthlyIncome, setOtherMonthlyIncome] = useState(DEFAULTS.otherMonthlyIncome);
  const [existingEmi, setExistingEmi] = useState(DEFAULTS.existingEmi);
  const [annualRatePercent, setAnnualRatePercent] = useState(DEFAULTS.annualRatePercent);
  const [tenureMonths, setTenureMonths] = useState(DEFAULTS.tenureMonths);
  const [foirMode, setFoirMode] = useState(DEFAULTS.foirMode);
  const [foirPercent, setFoirPercent] = useState(DEFAULTS.foirPercent);
  const [loanType, setLoanType] = useState(DEFAULTS.loanType);
  const [propertyValue, setPropertyValue] = useState(DEFAULTS.propertyValue);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeLoanEligibility({
        netMonthlyIncome: toNumber(netMonthlyIncome),
        otherMonthlyIncome: toNumber(otherMonthlyIncome),
        existingEmi: toNumber(existingEmi),
        annualRatePercent: toNumber(annualRatePercent),
        tenureMonths: toNumber(tenureMonths),
        foirPercent: foirMode === "manual" ? toNumber(foirPercent) : undefined,
        loanType,
        propertyValue: toNumber(propertyValue),
      }),
    [
      netMonthlyIncome,
      otherMonthlyIncome,
      existingEmi,
      annualRatePercent,
      tenureMonths,
      foirMode,
      foirPercent,
      loanType,
      propertyValue,
    ],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : money(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Loan eligibility from salary",
      `Income considered: ${money(result.totalIncome)} a month`,
      `Existing EMIs: ${money(result.existingEmi)}`,
      `FOIR applied: ${pct(result.foirPercent)} — EMI ceiling ${money(result.emiCeiling)}`,
      `Maximum new EMI: ${money(result.maxEmi)}`,
      `Loan on FOIR at ${pct(result.annualRatePercent)} for ${result.tenureMonths} months: ${money(result.loanByFoir)}`,
      result.loanByLtv !== null
        ? `Loan-to-value ceiling at ${pct(result.ltvPercent)}: ${money(result.loanByLtv)}`
        : "",
      `Eligible loan: ${money(result.eligibleLoan)}`,
      result.downPayment > 0 ? `Own contribution needed: ${money(result.downPayment)}` : "",
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
    setNetMonthlyIncome(DEFAULTS.netMonthlyIncome);
    setOtherMonthlyIncome(DEFAULTS.otherMonthlyIncome);
    setExistingEmi(DEFAULTS.existingEmi);
    setAnnualRatePercent(DEFAULTS.annualRatePercent);
    setTenureMonths(DEFAULTS.tenureMonths);
    setFoirMode(DEFAULTS.foirMode);
    setFoirPercent(DEFAULTS.foirPercent);
    setLoanType(DEFAULTS.loanType);
    setPropertyValue(DEFAULTS.propertyValue);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wallet className="h-4 w-4" aria-hidden="true" />
          FOIR and LTV
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Loan Eligibility from Salary Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lenders cap the share of your take-home pay that can go to EMIs. This works out that
          ceiling, converts it into a loan amount, and applies the RBI loan-to-value limit if you are
          buying a home.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="le-income">
              Net take-home salary (INR a month)
            </label>
            <input
              id="le-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={netMonthlyIncome}
              onChange={(event) => setNetMonthlyIncome(event.target.value)}
            />
            <p className={HINT_CLASS}>Salary credited to your account, after PF and tax.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="le-other-income">
              Other steady monthly income (INR)
            </label>
            <input
              id="le-other-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={otherMonthlyIncome}
              onChange={(event) => setOtherMonthlyIncome(event.target.value)}
            />
            <p className={HINT_CLASS}>Rent or pension that the lender is willing to count.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="le-existing-emi">
              EMIs already running (INR a month)
            </label>
            <input
              id="le-existing-emi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={existingEmi}
              onChange={(event) => setExistingEmi(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="le-loan-type">
              Loan type
            </label>
            <select
              id="le-loan-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={loanType}
              onChange={(event) => setLoanType(event.target.value)}
            >
              <option value="home">Home loan</option>
              <option value="other">Personal, car or other loan</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="le-rate">
              Interest rate (% a year)
            </label>
            <input
              id="le-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.05"
              value={annualRatePercent}
              onChange={(event) => setAnnualRatePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="le-tenure">
              Tenure (months)
            </label>
            <input
              id="le-tenure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="360"
              step="12"
              value={tenureMonths}
              onChange={(event) => setTenureMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="le-foir-mode">
              FOIR
            </label>
            <select
              id="le-foir-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={foirMode}
              onChange={(event) => setFoirMode(event.target.value)}
            >
              <option value="band">Use the typical band for my income</option>
              <option value="manual">Enter my lender&apos;s FOIR</option>
            </select>
          </div>
          {foirMode === "manual" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="le-foir">
                FOIR allowed (%)
              </label>
              <input
                id="le-foir"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                max="100"
                step="1"
                value={foirPercent}
                onChange={(event) => setFoirPercent(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <p className={LABEL_CLASS}>Band applied</p>
              <p className="mt-2 flex h-11 items-center rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold">
                {hasError ? DASH : pct(result.bandedFoirPercent)}
              </p>
              <p className={HINT_CLASS}>Lender credit policy, not a regulation.</p>
            </div>
          )}
          {loanType === "home" && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="le-property">
                Property value (INR)
              </label>
              <input
                id="le-property"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100000"
                value={propertyValue}
                onChange={(event) => setPropertyValue(event.target.value)}
              />
              <p className={HINT_CLASS}>
                Excluding stamp duty and registration, which the LTV ceiling does not cover. Set to 0
                to skip the LTV check.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[120, 180, 240, 300, 360].map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setTenureMonths(String(months))}
              className={CHIP_BTN}
            >
              {months / 12} years
            </button>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Loan you are eligible for
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.eligibleLoan)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your figures."
                : result.bindingConstraint === "ltv"
                  ? `Capped by the ${pct(result.ltvPercent)} loan-to-value limit, not by your income`
                  : `Capped by a ${pct(result.foirPercent)} FOIR on ${money(result.totalIncome)} of monthly income`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the loan eligibility result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
            ["Income considered", show(result.totalIncome)],
            [
              "EMI ceiling at this FOIR",
              hasError ? DASH : `${money(result.emiCeiling)} (${pct(result.foirPercent)})`,
            ],
            ["Existing EMIs", show(result.existingEmi)],
            ["Maximum new EMI", show(result.maxEmi)],
            ["Loan supported by that EMI", show(result.loanByFoir)],
            [
              "Loan-to-value ceiling",
              hasError || result.loanByLtv === null
                ? "Not applicable"
                : `${money(result.loanByLtv)} at ${pct(result.ltvPercent)}`,
            ],
            ["EMI on the eligible loan", show(result.emiAtEligibleLoan)],
            ["Total repayment over the tenure", show(result.totalRepayment)],
            ["Total interest", show(result.totalInterest)],
            ["Own contribution needed", show(result.downPayment)],
            ["Income left after all EMIs", show(result.residualIncome)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Typical FOIR bands</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Indicative lender norms. Each bank sets its own, and a strong credit score or a co-applicant
          can move it.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Net monthly income</th>
                <th scope="col" className="py-2 text-right font-semibold">FOIR allowed</th>
              </tr>
            </thead>
            <tbody>
              {FOIR_BANDS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-right font-semibold">{pct(band.foirPercent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Indicative only. Actual sanction depends on credit score, employer category, job stability,
        age at maturity and the lender's own policy. Processing fees, insurance and stamp duty are
        not included.
      </p>
    </main>
  );
}
