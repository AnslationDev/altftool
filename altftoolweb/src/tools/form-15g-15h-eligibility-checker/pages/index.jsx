"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCheck, RotateCcw, X } from "lucide-react";

import {
  ENTITY_TYPES,
  FY_LABEL,
  SENIOR_AGE,
  checkForm15GH,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const DEFAULTS = {
  age: "68",
  residency: "resident",
  entityType: "individual",
  regime: "new",
  totalIncome: "600000",
  interestIncome: "200000",
  hasPan: true,
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
  const [age, setAge] = useState(DEFAULTS.age);
  const [residency, setResidency] = useState(DEFAULTS.residency);
  const [entityType, setEntityType] = useState(DEFAULTS.entityType);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [totalIncome, setTotalIncome] = useState(DEFAULTS.totalIncome);
  const [interestIncome, setInterestIncome] = useState(DEFAULTS.interestIncome);
  const [hasPan, setHasPan] = useState(DEFAULTS.hasPan);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const parsedAge = toNumber(age);
    const parsedIncome = toNumber(totalIncome);
    const parsedInterest = toNumber(interestIncome);

    if ([parsedAge, parsedIncome, parsedInterest].some((value) => Number.isNaN(value))) {
      return { error: "Fill in age, estimated total income and interest income." };
    }

    return checkForm15GH({
      age: parsedAge,
      isResident: residency === "resident",
      entityType,
      regime,
      estimatedTotalIncome: parsedIncome,
      interestIncome: parsedInterest,
      hasPan,
    });
  }, [age, residency, entityType, regime, totalIncome, interestIncome, hasPan]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Form 15G / 15H eligibility — ${result.financialYear}`,
      `Applicable form: Form ${result.form}`,
      `Verdict: ${result.verdict}`,
      `Estimated total income: ${money(result.estimatedTotalIncome)}`,
      `Tax after section 87A rebate: ${money(result.tax.taxAfterRebate)}`,
      `Basic exemption limit used: ${money(result.exemptionLimit)}`,
      `Interest income: ${money(result.interestIncome)}`,
      `Section 194A threshold: ${money(result.tdsThreshold)}`,
      `TDS at stake: ${money(result.tdsAtStake)}`,
    ].join("\n");
  }, [result]);

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
    setAge(DEFAULTS.age);
    setResidency(DEFAULTS.residency);
    setEntityType(DEFAULTS.entityType);
    setRegime(DEFAULTS.regime);
    setTotalIncome(DEFAULTS.totalIncome);
    setInterestIncome(DEFAULTS.interestIncome);
    setHasPan(DEFAULTS.hasPan);
    setCopied(false);
  };

  const hasError = Boolean(result.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCheck className="h-4 w-4" aria-hidden="true" />
          {FY_LABEL}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Form 15G and 15H Eligibility Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Form 15H is for residents aged {SENIOR_AGE} and above and needs only a nil-tax estimate.
          Form 15G is for everyone else and adds a second test: your interest must stay within the
          basic exemption limit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="f15-age">
              Age during the financial year
            </label>
            <input
              id="f15-age"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="f15-residency">
              Residential status
            </label>
            <select
              id="f15-residency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={residency}
              onChange={(event) => setResidency(event.target.value)}
            >
              <option value="resident">Resident in India</option>
              <option value="nonresident">Non-resident (NRI)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="f15-entity">
              Who is declaring
            </label>
            <select
              id="f15-entity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
            >
              {ENTITY_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="f15-regime">
              Tax regime you will use
            </label>
            <select
              id="f15-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              <option value="new">New regime (default, section 115BAC)</option>
              <option value="old">Old regime</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="f15-income">
              Estimated total income for the year (INR)
            </label>
            <input
              id="f15-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={totalIncome}
              onChange={(event) => setTotalIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="f15-interest">
              Interest expected from this bank (INR)
            </label>
            <input
              id="f15-interest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={interestIncome}
              onChange={(event) => setInterestIncome(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]"
          htmlFor="f15-pan"
        >
          <input
            id="f15-pan"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={hasPan}
            onChange={(event) => setHasPan(event.target.checked)}
          />
          PAN has been given to the bank
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
              TDS at stake this year
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? "—" : money(result.tdsAtStake)}
            </p>
            <p className="mt-2 text-sm font-semibold">
              {hasError ? (
                "—"
              ) : (
                <span className={result.eligible ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                  {result.verdict}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Form 15G or 15H eligibility result"
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
            ["Form that applies to you", hasError ? "—" : `Form ${result.form}`],
            ["Tax after section 87A rebate", hasError ? "—" : money(result.tax.taxAfterRebate)],
            ["Basic exemption limit used", hasError ? "—" : money(result.exemptionLimit)],
            ["Section 194A TDS threshold", hasError ? "—" : money(result.tdsThreshold)],
            [
              "TDS rate applied",
              hasError ? "—" : `${result.tdsRatePercent}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Condition-by-condition</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {result.conditions.map((condition) => (
              <li key={condition.label} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    condition.passed
                      ? "bg-[var(--success)]/15 text-[var(--success)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                  aria-hidden="true"
                >
                  {condition.passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
                <span>
                  <span className="font-semibold">{condition.label}</span>
                  <span className="sr-only">{condition.passed ? " — met" : " — not met"}</span>
                  <span className="block text-[var(--muted-foreground)]">{condition.detail}</span>
                </span>
              </li>
            ))}
          </ul>

          {result.blockers.length > 0 && (
            <ul className="mt-4 space-y-2">
              {result.blockers.map((blocker) => (
                <li
                  key={blocker}
                  className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  {blocker}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. The section 194A threshold is applied per payer across
        all branches of the same bank, so a separate declaration is needed for each bank. A false
        declaration is punishable under section 277 — check your position with a tax professional if
        your income is uncertain.
      </p>
    </main>
  );
}
