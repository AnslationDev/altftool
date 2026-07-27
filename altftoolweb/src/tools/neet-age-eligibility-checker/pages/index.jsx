"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import { checkNeetAgeEligibility } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { dob: "2008-06-15", admissionYear: "2026" };
const DASH = "—";

const formatAge = (age) =>
  `${age.years} years, ${age.months} months, ${age.days} days`;

export default function ToolHome() {
  const [dob, setDob] = useState(DEFAULTS.dob);
  const [admissionYear, setAdmissionYear] = useState(DEFAULTS.admissionYear);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => checkNeetAgeEligibility({ dob, admissionYear }),
    [dob, admissionYear],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "NEET minimum-age check",
      `Date of birth: ${dob}`,
      `Cutoff (31 December of admission year): ${result.cutoffDate}`,
      `Age on cutoff: ${formatAge(result.age)} (${NUM.format(result.totalDaysOnCutoff)} days)`,
      `Verdict: ${result.eligible ? "Meets" : "Does not meet"} the 17-year minimum`,
      `Margin: ${NUM.format(result.marginDays)} day(s) ${result.marginDirection}`,
      `Latest eligible date of birth: ${result.latestEligibleDob}`,
    ].join("\n");
  }, [hasError, result, dob]);

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
    setDob(DEFAULTS.dob);
    setAdmissionYear(DEFAULTS.admissionYear);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Eligibility Checks
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          NEET Age Eligibility Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          NEET (UG) requires 17 completed years of age on or before 31 December of the year of
          admission. Enter your date of birth and admission year to see your exact age on the
          cutoff and the day margin either way. There is no upper age limit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-age-dob">
              Date of birth
            </label>
            <input
              id="neet-age-dob"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dob}
              onChange={(event) => {
                setCopied(false);
                setDob(event.target.value);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-age-year">
              Year of admission to MBBS/BDS
            </label>
            <input
              id="neet-age-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1990"
              max="2100"
              step="1"
              value={admissionYear}
              onChange={(event) => {
                setCopied(false);
                setAdmissionYear(event.target.value);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Usually the same calendar year as the NEET attempt.
            </p>
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
              Verdict on the 17-year rule
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--primary)]"
                  : result.eligible
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError ? DASH : result.eligible ? "Eligible" : "Not eligible"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.eligible
                  ? `You complete 17 years ${result.marginDays === 0 ? "exactly on the cutoff date" : `with ${NUM.format(result.marginDays)} day${result.marginDays === 1 ? "" : "s"} to spare`}.`
                  : `You fall ${NUM.format(result.marginDays)} day${result.marginDays === 1 ? "" : "s"} short of 17 years on ${result.cutoffDate}; the next admission year may work.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the NEET age eligibility result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Cutoff date", DASH],
                ["Age on the cutoff date", DASH],
                ["Age in days on the cutoff", DASH],
                ["Latest eligible date of birth", DASH],
              ]
            : [
                ["Cutoff date", result.cutoffDate],
                ["Age on the cutoff date", formatAge(result.age)],
                ["Age in days on the cutoff", `${NUM.format(result.totalDaysOnCutoff)} days`],
                ["Latest eligible date of birth", result.latestEligibleDob],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational check based on the Graduate Medical Education Regulations&apos; 17-year rule
        and recent NEET (UG) bulletins, which state no upper age limit. The date of birth NTA uses
        is the one in your Class 10 certificate — confirm the final position in the current
        bulletin before applying.
      </p>
    </main>
  );
}
