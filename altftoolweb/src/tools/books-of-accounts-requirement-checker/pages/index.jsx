"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_EXEMPTION_LIMIT,
  MEDICAL_EXTRA_BOOKS,
  RULE_6F_BILL_COPY_LIMIT,
  SPECIFIED_PROFESSIONS,
  checkBooksRequirement,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const DEFAULTS = {
  activityType: "specifiedProfession",
  entityType: "individualHuf",
  isNew: false,
  isMedical: false,
  receipts: ["2400000", "1900000", "1500000"],
  income: ["900000", "700000", "550000"],
  expectedReceipts: "1200000",
  expectedIncome: "500000",
  claimsLower: false,
  totalIncome: "600000",
  exemptionLimit: String(DEFAULT_EXEMPTION_LIMIT),
};

const YEAR_LABELS = ["Preceding year 1 (most recent)", "Preceding year 2", "Preceding year 3"];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [activityType, setActivityType] = useState(DEFAULTS.activityType);
  const [entityType, setEntityType] = useState(DEFAULTS.entityType);
  const [isNew, setIsNew] = useState(DEFAULTS.isNew);
  const [isMedical, setIsMedical] = useState(DEFAULTS.isMedical);
  const [receipts, setReceipts] = useState(DEFAULTS.receipts);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [expectedReceipts, setExpectedReceipts] = useState(DEFAULTS.expectedReceipts);
  const [expectedIncome, setExpectedIncome] = useState(DEFAULTS.expectedIncome);
  const [claimsLower, setClaimsLower] = useState(DEFAULTS.claimsLower);
  const [totalIncome, setTotalIncome] = useState(DEFAULTS.totalIncome);
  const [exemptionLimit, setExemptionLimit] = useState(DEFAULTS.exemptionLimit);
  const [copied, setCopied] = useState(false);

  const setAt = (setter, list) => (index, value) => {
    const next = list.slice();
    next[index] = value;
    setter(next);
  };
  const setReceiptAt = setAt(setReceipts, receipts);
  const setIncomeAt = setAt(setIncome, income);

  const result = useMemo(() => {
    const receiptsHistory = receipts.map(toNumber);
    const incomeHistory = income.map(toNumber);
    const parsedExpectedReceipts = toNumber(expectedReceipts);
    const parsedExpectedIncome = toNumber(expectedIncome);
    const parsedTotalIncome = toNumber(totalIncome);
    const parsedExemption = toNumber(exemptionLimit);

    const relevant = isNew
      ? [parsedExpectedReceipts, parsedExpectedIncome]
      : [...receiptsHistory, ...incomeHistory];

    if (relevant.some((value) => Number.isNaN(value))) {
      return { error: "Fill in every receipts and income box with a number." };
    }
    if (Number.isNaN(parsedTotalIncome) || Number.isNaN(parsedExemption)) {
      return { error: "Total income and the exemption limit must be numbers." };
    }

    return checkBooksRequirement({
      activityType,
      entityType,
      isNew,
      receiptsHistory,
      incomeHistory,
      expectedReceipts: parsedExpectedReceipts,
      expectedIncome: parsedExpectedIncome,
      claimsLowerThanPresumptive: claimsLower,
      totalIncome: parsedTotalIncome,
      exemptionLimit: parsedExemption,
    });
  }, [
    activityType,
    entityType,
    isNew,
    receipts,
    income,
    expectedReceipts,
    expectedIncome,
    claimsLower,
    totalIncome,
    exemptionLimit,
  ]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Books of accounts requirement — section 44AA",
      `Verdict: ${result.headline}`,
      ...result.reasons.map((reason) => `- ${reason}`),
      "",
      "What to keep:",
      ...result.books.map((book) => `- ${book}`),
      "",
      `Retain for ${result.retentionYears} years from the end of the assessment year.`,
      `Penalty under section 271A for failure: ${money(result.penalty)}`,
    ].join("\n");
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
    setActivityType(DEFAULTS.activityType);
    setEntityType(DEFAULTS.entityType);
    setIsNew(DEFAULTS.isNew);
    setIsMedical(DEFAULTS.isMedical);
    setReceipts(DEFAULTS.receipts);
    setIncome(DEFAULTS.income);
    setExpectedReceipts(DEFAULTS.expectedReceipts);
    setExpectedIncome(DEFAULTS.expectedIncome);
    setClaimsLower(DEFAULTS.claimsLower);
    setTotalIncome(DEFAULTS.totalIncome);
    setExemptionLimit(DEFAULTS.exemptionLimit);
    setCopied(false);
  };

  const isSpecified = activityType === "specifiedProfession";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
          Section 44AA and Rule 6F
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Books of Accounts Requirement Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A specified profession falls under the prescribed Rule 6F list once receipts cross
          Rs 1,50,000 in all three preceding years. Every other business is judged on income and
          turnover in any one of those years, at limits that differ for an individual or HUF.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="boa-activity">
              What do you carry on
            </label>
            <select
              id="boa-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activityType}
              onChange={(event) => setActivityType(event.target.value)}
            >
              <option value="specifiedProfession">Specified profession under section 44AA(1)</option>
              <option value="businessOrOtherProfession">Business or any other profession</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="boa-entity">
              Who is the assessee
            </label>
            <select
              id="boa-entity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
            >
              <option value="individualHuf">Individual or HUF</option>
              <option value="other">Firm, LLP, company or other entity</option>
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex min-h-11 items-center gap-3 text-sm font-medium" htmlFor="boa-new">
            <input
              id="boa-new"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={isNew}
              onChange={(event) => setIsNew(event.target.checked)}
            />
            Newly set up this year — judge me on expected figures instead
          </label>
          {isSpecified && (
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium" htmlFor="boa-medical">
              <input
                id="boa-medical"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={isMedical}
                onChange={(event) => setIsMedical(event.target.checked)}
              />
              Medical profession — show the extra Rule 6F(3) registers
            </label>
          )}
        </div>

        {isNew ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="boa-exp-receipts">
                Expected gross receipts this year (INR)
              </label>
              <input
                id="boa-exp-receipts"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10000"
                value={expectedReceipts}
                onChange={(event) => setExpectedReceipts(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="boa-exp-income">
                Expected income this year (INR)
              </label>
              <input
                id="boa-exp-income"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10000"
                value={expectedIncome}
                onChange={(event) => setExpectedIncome(event.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {YEAR_LABELS.map((label, index) => (
              <div key={label} className="contents">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`boa-receipts-${index}`}>
                    {label} — gross receipts (INR)
                  </label>
                  <input
                    id={`boa-receipts-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10000"
                    value={receipts[index]}
                    onChange={(event) => setReceiptAt(index, event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`boa-income-${index}`}>
                    {label} — income (INR)
                  </label>
                  <input
                    id={`boa-income-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10000"
                    value={income[index]}
                    onChange={(event) => setIncomeAt(index, event.target.value)}
                  />
                </div>
              </div>
            ))}
            {isSpecified && (
              <p className="text-xs text-[var(--muted-foreground)] sm:col-span-2">
                For a specified profession only the receipts column matters — Rule 6F ignores the
                income figure.
              </p>
            )}
          </div>
        )}

        <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
          <label className="flex min-h-11 items-start gap-3 text-sm font-medium" htmlFor="boa-lower">
            <input
              id="boa-lower"
              type="checkbox"
              className={`mt-0.5 ${CHECKBOX_CLASS}`}
              checked={claimsLower}
              onChange={(event) => setClaimsLower(event.target.checked)}
            />
            I am declaring income lower than the presumptive figure under section 44AD, 44ADA or 44AE
          </label>
          {claimsLower && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="boa-total">
                  Total income this year (INR)
                </label>
                <input
                  id="boa-total"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10000"
                  value={totalIncome}
                  onChange={(event) => setTotalIncome(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="boa-exempt">
                  Basic exemption limit (INR)
                </label>
                <input
                  id="boa-exempt"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="10000"
                  value={exemptionLimit}
                  onChange={(event) => setExemptionLimit(event.target.value)}
                />
              </div>
            </div>
          )}
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
              Do you have to keep books
            </p>
            <p
              className={`mt-1 text-2xl font-semibold sm:text-3xl ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.required
                    ? "text-[var(--primary)]"
                    : "text-[var(--success)]"
              }`}
            >
              {hasError ? "—" : result.headline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy books of accounts requirement result"
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
            [
              "Receipts threshold that applies",
              hasError
                ? "—"
                : result.isSpecifiedProfession
                  ? `${money(result.thresholds.receipts)} in every one of the three years`
                  : `${money(result.thresholds.turnover)} in any one year`,
            ],
            [
              "Income threshold that applies",
              hasError
                ? "—"
                : result.isSpecifiedProfession
                  ? "Not used for a specified profession"
                  : `${money(result.thresholds.income)} in any one year`,
            ],
            [
              result.isSpecifiedProfession ? "Lowest year of receipts" : "Highest year of receipts",
              hasError
                ? "—"
                : money(
                    result.isSpecifiedProfession
                      ? result.measured.minReceipts
                      : result.measured.maxReceipts,
                  ),
            ],
            ["Highest year of income", hasError ? "—" : money(result.measured.maxIncome)],
            ["Retention period", hasError ? "—" : `${result.retentionYears} years from the end of the assessment year`],
            ["Penalty under section 271A", hasError ? "—" : money(result.penalty)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Why</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              {result.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What to maintain</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.books.map((book) => (
                <li key={book} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                  {book}
                </li>
              ))}
              {isSpecified &&
                isMedical &&
                result.requirement === "rule6F" &&
                MEDICAL_EXTRA_BOOKS.map((book) => (
                  <li key={book} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                    {book}
                  </li>
                ))}
            </ul>
            {result.requirement === "rule6F" && (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Rule 6F(2)(iv) requires carbon copies of bills and receipts issued for any sum above{" "}
                {money(RULE_6F_BILL_COPY_LIMIT)}.
              </p>
            )}
          </section>
        </>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Specified professions under section 44AA(1)</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {SPECIFIED_PROFESSIONS.map((profession) => (
            <li
              key={profession}
              className="rounded-full bg-[var(--muted)] px-3 py-1 text-[var(--muted-foreground)]"
            >
              {profession}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Keeping books is separate from a tax audit under section
        44AB, which has its own turnover tests. GST law and the Companies Act impose their own record
        keeping duties that can be stricter than section 44AA. Check your position with a chartered
        accountant.
      </p>
    </main>
  );
}
