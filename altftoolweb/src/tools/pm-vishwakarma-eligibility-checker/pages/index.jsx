"use client";

import { useMemo, useState } from "react";
import { Check, CircleCheckBig, Copy, Hammer, RotateCcw, TriangleAlert } from "lucide-react";

import {
  ADVANCED_TRAINING_MIN_DAYS,
  BASIC_TRAINING_MAX_DAYS,
  BASIC_TRAINING_MIN_DAYS,
  CONCESSIONAL_INTEREST_RATE,
  DIGITAL_INCENTIVE_MAX_TXN_PER_MONTH,
  INTEREST_SUBVENTION_CAP,
  LOAN_TRANCHES,
  MIN_AGE_YEARS,
  TOOLKIT_INCENTIVE,
  TRAINING_STIPEND_PER_DAY,
  VISHWAKARMA_TRADES,
  checkVishwakarmaEligibility,
  estimateVishwakarmaBenefits,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm";

const DEFAULTS = {
  tradeId: "potter",
  age: "34",
  currentlyPracticing: true,
  availedSimilarLoan: false,
  similarLoanFullyRepaid: false,
  familyMemberEnrolled: false,
  governmentEmployee: false,
  trainingDays: String(BASIC_TRAINING_MIN_DAYS),
  digitalTxns: "60",
  tranche: 1,
};

const toNumberOrNull = (raw) => {
  const text = String(raw).trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

export default function ToolHome() {
  const [tradeId, setTradeId] = useState(DEFAULTS.tradeId);
  const [age, setAge] = useState(DEFAULTS.age);
  const [currentlyPracticing, setCurrentlyPracticing] = useState(DEFAULTS.currentlyPracticing);
  const [availedSimilarLoan, setAvailedSimilarLoan] = useState(DEFAULTS.availedSimilarLoan);
  const [similarLoanFullyRepaid, setSimilarLoanFullyRepaid] = useState(
    DEFAULTS.similarLoanFullyRepaid,
  );
  const [familyMemberEnrolled, setFamilyMemberEnrolled] = useState(DEFAULTS.familyMemberEnrolled);
  const [governmentEmployee, setGovernmentEmployee] = useState(DEFAULTS.governmentEmployee);
  const [trainingDays, setTrainingDays] = useState(DEFAULTS.trainingDays);
  const [digitalTxns, setDigitalTxns] = useState(DEFAULTS.digitalTxns);
  const [tranche, setTranche] = useState(DEFAULTS.tranche);
  const [copied, setCopied] = useState(false);

  const check = useMemo(
    () =>
      checkVishwakarmaEligibility({
        tradeId,
        age: toNumberOrNull(age),
        currentlyPracticing,
        availedSimilarLoanWithinFiveYears: availedSimilarLoan,
        similarLoanFullyRepaid,
        familyMemberAlreadyEnrolled: familyMemberEnrolled,
        governmentEmployee,
      }),
    [
      tradeId,
      age,
      currentlyPracticing,
      availedSimilarLoan,
      similarLoanFullyRepaid,
      familyMemberEnrolled,
      governmentEmployee,
    ],
  );

  const benefits = useMemo(
    () =>
      estimateVishwakarmaBenefits({
        trainingDays: toNumberOrNull(trainingDays),
        digitalTxnsPerMonth: toNumberOrNull(digitalTxns),
        trancheNumber: tranche,
      }),
    [trainingDays, digitalTxns, tranche],
  );

  // The eligibility verdict is an independent computation from the benefit estimate —
  // an unrelated/momentarily-invalid "training days" or "digital transactions" field
  // must not hide an already-determined eligibility verdict. checkError gates the
  // verdict/blockers, benefitsError additionally gates the money figures.
  const checkError = check.error || null;
  const benefitsError = benefits.error || null;
  const error = checkError || benefitsError || null;
  const showEligibility = !checkError;
  const showFigures = !checkError && !benefitsError;

  const summary = useMemo(() => {
    if (checkError || benefitsError) return "";
    return [
      "PM Vishwakarma Scheme Eligibility Checker",
      `Trade: ${check.trade ? check.trade.label : "not in the notified list"}`,
      `Verdict: ${check.eligible ? "Meets the published eligibility conditions" : "Does not meet the conditions"}`,
      ...check.blockers.map((line) => `Blocker: ${line}`),
      `Credit tranche: ${money(benefits.loanAmount)} over ${benefits.loanMonths} months at ${CONCESSIONAL_INTEREST_RATE}%`,
      `Monthly instalment: ${money(benefits.monthlyInstalment)}`,
      `Interest you pay: ${money(benefits.interestPaidByArtisan)}`,
      `Interest avoided via 8% subvention: ${money(benefits.interestSubventionValue)}`,
      `Training stipend: ${money(benefits.stipend)} for ${benefits.trainingDays} days`,
      `Toolkit e-voucher: ${money(benefits.toolkitIncentive)}`,
      `Digital transaction incentive: ${money(benefits.digitalIncentivePerYear)} a year`,
      `Indicative first-year benefit value: ${money(benefits.firstYearBenefit)}`,
    ].join("\n");
  }, [checkError, benefitsError, check, benefits]);

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
    setTradeId(DEFAULTS.tradeId);
    setAge(DEFAULTS.age);
    setCurrentlyPracticing(DEFAULTS.currentlyPracticing);
    setAvailedSimilarLoan(DEFAULTS.availedSimilarLoan);
    setSimilarLoanFullyRepaid(DEFAULTS.similarLoanFullyRepaid);
    setFamilyMemberEnrolled(DEFAULTS.familyMemberEnrolled);
    setGovernmentEmployee(DEFAULTS.governmentEmployee);
    setTrainingDays(DEFAULTS.trainingDays);
    setDigitalTxns(DEFAULTS.digitalTxns);
    setTranche(DEFAULTS.tranche);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Hammer className="h-4 w-4" aria-hidden="true" />
          Scheme eligibility
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          PM Vishwakarma Scheme Eligibility Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check your trade against the 18 notified crafts and the age, family and prior-loan
          conditions, then see what the toolkit voucher, training stipend and 5% collateral-free
          loan are worth.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicant details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pmv-trade">
              Trade practised
            </label>
            <select
              id="pmv-trade"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tradeId}
              onChange={(event) => setTradeId(event.target.value)}
            >
              {VISHWAKARMA_TRADES.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.label}
                </option>
              ))}
              <option value="not-listed">Something else (not in the notified list)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmv-age">
              Age in completed years
            </label>
            <input
              id="pmv-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="110"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmv-tranche">
              Credit tranche to model
            </label>
            <select
              id="pmv-tranche"
              className={`mt-2 ${INPUT_CLASS}`}
              value={String(tranche)}
              onChange={(event) => setTranche(Number(event.target.value))}
            >
              {LOAN_TRANCHES.map((item) => (
                <option key={item.tranche} value={String(item.tranche)}>
                  {`Tranche ${item.tranche} — ${money(item.amount)} over ${item.months} months`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label className={CHECK_ROW} htmlFor="pmv-practising">
            <input
              id="pmv-practising"
              type="checkbox"
              className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
              checked={currentlyPracticing}
              onChange={(event) => setCurrentlyPracticing(event.target.checked)}
            />
            <span>
              Self-employed in this trade right now, working with hands and tools in the
              unorganised sector
            </span>
          </label>
          <label className={CHECK_ROW} htmlFor="pmv-loan">
            <input
              id="pmv-loan"
              type="checkbox"
              className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
              checked={availedSimilarLoan}
              onChange={(event) => setAvailedSimilarLoan(event.target.checked)}
            />
            <span>
              Took a loan under PMEGP, PM SVANidhi, Mudra or a similar self-employment scheme in
              the last 5 years
            </span>
          </label>
          {availedSimilarLoan && (
            <label className={`${CHECK_ROW} sm:ml-8`} htmlFor="pmv-loan-repaid">
              <input
                id="pmv-loan-repaid"
                type="checkbox"
                className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
                checked={similarLoanFullyRepaid}
                onChange={(event) => setSimilarLoanFullyRepaid(event.target.checked)}
              />
              <span>That PM SVANidhi or Mudra loan has been repaid in full</span>
            </label>
          )}
          <label className={CHECK_ROW} htmlFor="pmv-family">
            <input
              id="pmv-family"
              type="checkbox"
              className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
              checked={familyMemberEnrolled}
              onChange={(event) => setFamilyMemberEnrolled(event.target.checked)}
            />
            <span>
              Another member of the family (spouse or unmarried child) is already registered under
              PM Vishwakarma
            </span>
          </label>
          <label className={CHECK_ROW} htmlFor="pmv-govt">
            <input
              id="pmv-govt"
              type="checkbox"
              className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
              checked={governmentEmployee}
              onChange={(event) => setGovernmentEmployee(event.target.checked)}
            />
            <span>Applicant or a family member is in government service</span>
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pmv-training">
              Training days planned
            </label>
            <input
              id="pmv-training"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              value={trainingDays}
              onChange={(event) => setTrainingDays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Basic training runs {BASIC_TRAINING_MIN_DAYS}–{BASIC_TRAINING_MAX_DAYS} days;
              advanced training is {ADVANCED_TRAINING_MIN_DAYS} days or more.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmv-digital">
              Digital transactions a month
            </label>
            <input
              id="pmv-digital"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={digitalTxns}
              onChange={(event) => setDigitalTxns(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Incentive counts up to {DIGITAL_INCENTIVE_MAX_TXN_PER_MONTH} transactions a month.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Indicative first-year benefit value
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {showFigures ? money(benefits.firstYearBenefit) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Toolkit voucher, stipend, digital incentive and the interest saved on the concessional
              loan
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy PM Vishwakarma eligibility result"
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

        {showEligibility && (
          <div
            className={`mt-5 flex items-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
              check.eligible
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            {check.eligible ? (
              <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>
              {check.eligible
                ? "Meets every published eligibility condition — you can register at a Common Service Centre."
                : "One or more conditions are not met. See the list below."}
            </span>
          </div>
        )}

        {showEligibility && check.blockers.length > 0 && (
          <ul className="mt-4 grid gap-2 text-sm">
            {check.blockers.map((line) => (
              <li
                key={line}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
              >
                {line}
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Trade selected", showEligibility && check.trade ? check.trade.label : DASH],
            [
              "Minimum age condition",
              showEligibility ? `${MIN_AGE_YEARS} years on the date of registration` : DASH,
            ],
            [
              "Toolkit e-voucher",
              showFigures ? money(benefits.toolkitIncentive) : DASH,
            ],
            [
              "Training stipend",
              showFigures
                ? `${money(benefits.stipend)} (${benefits.trainingDays} days × ${money(TRAINING_STIPEND_PER_DAY)})`
                : DASH,
            ],
            [
              "Loan tranche modelled",
              showFigures
                ? `${money(benefits.loanAmount)} over ${benefits.loanMonths} months`
                : DASH,
            ],
            [
              "Monthly instalment at 5%",
              showFigures ? money(benefits.monthlyInstalment) : DASH,
            ],
            [
              "Interest you pay over the tenure",
              showFigures ? money(benefits.interestPaidByArtisan) : DASH,
            ],
            [
              `Interest avoided by the ${INTEREST_SUBVENTION_CAP}% subvention`,
              showFigures ? money(benefits.interestSubventionValue) : DASH,
            ],
            [
              "Digital transaction incentive",
              showFigures
                ? `${money(benefits.digitalIncentivePerMonth)} a month · ${money(benefits.digitalIncentivePerYear)} a year`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {showEligibility && check.notes.length > 0 && (
          <ul className="mt-4 grid gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {check.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The 18 notified trades</h2>
        <div className="mt-3 overflow-x-auto">
          <ul className="grid min-w-[280px] gap-1.5 text-sm sm:grid-cols-2">
            {VISHWAKARMA_TRADES.map((trade) => (
              <li
                key={trade.id}
                className={`rounded-md px-3 py-2 ${
                  trade.id === tradeId
                    ? "bg-[var(--primary-soft)] font-semibold text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {trade.label}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The toolkit incentive is capped at {money(TOOLKIT_INCENTIVE)} and is released as an
          e-voucher at the start of basic training, once skill verification is complete — not
          after training finishes.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, based on the published PM Vishwakarma scheme guidelines. Actual
        eligibility is decided by the Gram Panchayat or Urban Local Body, the District
        Implementation Committee and the Screening Committee, and the second loan tranche depends on
        repayment of the first plus a standard ledger and digital-transaction record. Confirm current
        terms on the official scheme portal before applying.
      </p>
    </main>
  );
}
