"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HandCoins, RotateCcw, X } from "lucide-react";

import {
  ANNAPURNA_KG_PER_MONTH,
  ENHANCED_PENSION_AGE,
  NSAP_SCHEMES,
  assessNfbs,
  assessNsapPension,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const DASH = "—";

const DEFAULTS = {
  scheme: "ignoaps",
  age: "65",
  isBpl: true,
  isWidow: false,
  disability: "0",
  stateTopUp: "800",
  breadwinnerAge: "45",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [scheme, setScheme] = useState(DEFAULTS.scheme);
  const [age, setAge] = useState(DEFAULTS.age);
  const [isBpl, setIsBpl] = useState(DEFAULTS.isBpl);
  const [isWidow, setIsWidow] = useState(DEFAULTS.isWidow);
  const [disability, setDisability] = useState(DEFAULTS.disability);
  const [stateTopUp, setStateTopUp] = useState(DEFAULTS.stateTopUp);
  const [breadwinnerAge, setBreadwinnerAge] = useState(DEFAULTS.breadwinnerAge);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessNsapPension({
        scheme,
        ageYears: toNumber(age),
        isBpl,
        isWidow,
        disabilityPct: toNumber(disability),
        stateTopUp: toNumber(stateTopUp),
      }),
    [scheme, age, isBpl, isWidow, disability, stateTopUp],
  );

  const nfbs = useMemo(
    () => assessNfbs({ isBpl, breadwinnerAgeAtDeath: toNumber(breadwinnerAge) }),
    [isBpl, breadwinnerAge],
  );

  const ok = !result.error;
  const showAmounts = ok && result.eligible;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `NSAP pension check — ${result.schemeLabel}`,
      result.eligible
        ? "Result: meets every criterion for this scheme."
        : `Result: ${result.failedCount} criterion/criteria not met.`,
      result.eligible ? `Central assistance: ${money(result.amounts.centralShare)} a month` : "",
      result.eligible ? `State top-up entered: ${money(result.amounts.stateTopUp)} a month` : "",
      result.eligible ? `Total: ${money(result.amounts.monthlyTotal)} a month, ${money(result.amounts.annualTotal)} a year` : "",
      "",
      ...result.checks.map(
        (check) => `${check.passed ? "PASS" : "CHECK"} — ${check.label}: ${check.detail}`,
      ),
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result]);

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
    setScheme(DEFAULTS.scheme);
    setAge(DEFAULTS.age);
    setIsBpl(DEFAULTS.isBpl);
    setIsWidow(DEFAULTS.isWidow);
    setDisability(DEFAULTS.disability);
    setStateTopUp(DEFAULTS.stateTopUp);
    setBreadwinnerAge(DEFAULTS.breadwinnerAge);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HandCoins className="h-4 w-4" aria-hidden="true" />
          Social security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Old Age Pension Scheme Eligibility Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The National Social Assistance Programme runs three pensions for households below the
          poverty line: old age, widow and disability. Check the criteria and see the central share,
          your state's top-up and what the two add up to each month.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nsap-scheme">
              Scheme
            </label>
            <select
              id="nsap-scheme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scheme}
              onChange={(event) => setScheme(event.target.value)}
            >
              {NSAP_SCHEMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {ok ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{result.schemeSummary}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nsap-age">
              Applicant's age (completed years)
            </label>
            <input
              id="nsap-age"
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
            <label className={LABEL_CLASS} htmlFor="nsap-topup">
              State top-up (INR per month)
            </label>
            <input
              id="nsap-topup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={stateTopUp}
              onChange={(event) => setStateTopUp(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              States add their own share on top of the central assistance and the amount differs
              widely. Enter what your state pays, or zero if you do not know it.
            </p>
          </div>
          {scheme === "igndps" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="nsap-disability">
                Certified disability (%)
              </label>
              <input
                id="nsap-disability"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="1"
                value={disability}
                onChange={(event) => setDisability(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={CHECKBOX_ROW} htmlFor="nsap-bpl">
            <input
              id="nsap-bpl"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={isBpl}
              onChange={(event) => setIsBpl(event.target.checked)}
            />
            Household is on the state BPL list
          </label>
          {scheme === "ignwps" ? (
            <label className={CHECKBOX_ROW} htmlFor="nsap-widow">
              <input
                id="nsap-widow"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={isWidow}
                onChange={(event) => setIsWidow(event.target.checked)}
              />
              Applicant is a widow
            </label>
          ) : null}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Monthly pension
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {showAmounts ? money(result.amounts.monthlyTotal) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {!ok
                ? "Fix the inputs above to run the check"
                : result.eligible
                  ? `${money(result.amounts.centralShare)} central assistance plus ${money(result.amounts.stateTopUp)} from the state`
                  : `${result.failedCount} criterion${result.failedCount === 1 ? "" : "a"} not met, so no pension is payable under this scheme`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the pension eligibility result"
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
            ["Central assistance", showAmounts ? money(result.amounts.centralShare) : DASH],
            ["State top-up", showAmounts ? money(result.amounts.stateTopUp) : DASH],
            ["Total each month", showAmounts ? money(result.amounts.monthlyTotal) : DASH],
            ["Total across the year", showAmounts ? money(result.amounts.annualTotal) : DASH],
            [
              `From age ${ENHANCED_PENSION_AGE}`,
              showAmounts
                ? result.amounts.atEnhancedRate
                  ? "Already on the enhanced central rate"
                  : `${money(result.amounts.monthlyTotalAt80)} a month, in ${NUM.format(result.amounts.yearsToEnhancedRate)} years`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Criterion by criterion</h2>
          <ul className="mt-3 space-y-3">
            {result.checks.map((check) => (
              <li key={check.id} className="flex gap-3 rounded-md border border-[var(--border)] p-3 text-sm">
                <span
                  className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    check.passed
                      ? "bg-[var(--muted)] text-[var(--success)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                  aria-hidden="true"
                >
                  {check.passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
                <span>
                  <span className="block font-semibold">
                    {check.label}
                    <span className="sr-only">{check.passed ? " — met" : " — not met"}</span>
                  </span>
                  <span className="mt-0.5 block text-[var(--muted-foreground)]">{check.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">National Family Benefit Scheme</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A separate one-time grant to a BPL household when the primary breadwinner dies.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nsap-breadwinner">
              Breadwinner's age at death
            </label>
            <input
              id="nsap-breadwinner"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={breadwinnerAge}
              onChange={(event) => setBreadwinnerAge(event.target.value)}
            />
          </div>
        </div>

        {nfbs.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {nfbs.error}
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm">
              One-time grant:{" "}
              <span className="text-lg font-semibold text-[var(--primary)]">
                {nfbs.eligible ? money(nfbs.grant) : DASH}
              </span>
            </p>
            <ul className="mt-3 space-y-3">
              {nfbs.checks.map((check) => (
                <li key={check.id} className="flex gap-3 rounded-md border border-[var(--border)] p-3 text-sm">
                  <span
                    className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      check.passed
                        ? "bg-[var(--muted)] text-[var(--success)]"
                        : "bg-[var(--danger-soft)] text-[var(--danger)]"
                    }`}
                    aria-hidden="true"
                  >
                    {check.passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </span>
                  <span>
                    <span className="block font-semibold">
                      {check.label}
                      <span className="sr-only">{check.passed ? " — met" : " — not met"}</span>
                    </span>
                    <span className="mt-0.5 block text-[var(--muted-foreground)]">
                      {check.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. A senior citizen who is eligible for but not receiving IGNOAPS may
        instead get {ANNAPURNA_KG_PER_MONTH} kg of foodgrain a month free under the Annapurna
        scheme. Apply through your gram panchayat, block office or municipal ward, and confirm the
        current state top-up with the social welfare department.
      </p>
    </main>
  );
}
