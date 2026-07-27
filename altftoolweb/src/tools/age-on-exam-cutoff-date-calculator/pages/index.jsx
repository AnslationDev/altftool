"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import { computeAgeOnCutoff } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  dob: "2002-03-10",
  cutoffDate: "2026-08-01",
  minYears: "21",
  maxYears: "32",
};
const DASH = "—";

export default function ToolHome() {
  const [dob, setDob] = useState(DEFAULTS.dob);
  const [cutoffDate, setCutoffDate] = useState(DEFAULTS.cutoffDate);
  const [minYears, setMinYears] = useState(DEFAULTS.minYears);
  const [maxYears, setMaxYears] = useState(DEFAULTS.maxYears);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => computeAgeOnCutoff({ dob, cutoffDate, minYears, maxYears }),
    [dob, cutoffDate, minYears, maxYears],
  );
  const hasError = Boolean(result.error);

  const ageText = hasError
    ? DASH
    : `${result.age.years}y ${result.age.months}m ${result.age.days}d`;

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Age on cutoff date",
      `Date of birth: ${dob}`,
      `Cutoff date: ${cutoffDate}`,
      `Age: ${result.age.years} years, ${result.age.months} months, ${result.age.days} days`,
      `Total: ${NUM.format(result.totalDays)} days (${NUM.format(result.totalMonths)} completed months)`,
    ];
    if (result.minCheck) {
      lines.push(
        `Minimum ${result.minCheck.limit} years: ${result.minCheck.meets ? "attained" : "NOT attained"}`,
      );
    }
    if (result.maxCheck) {
      lines.push(
        `Maximum ${result.maxCheck.limit} years: ${result.maxCheck.meets ? "not yet attained (within limit)" : "attained (over the limit)"}`,
      );
    }
    if (result.hasChecks) {
      lines.push(`Verdict: ${result.eligible ? "Within the age window" : "Outside the age window"}`);
    }
    return lines.join("\n");
  }, [hasError, result, dob, cutoffDate]);

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
    setCutoffDate(DEFAULTS.cutoffDate);
    setMinYears(DEFAULTS.minYears);
    setMaxYears(DEFAULTS.maxYears);
    setCopied(false);
  };

  const checkRow = (check, kind) => {
    if (!check) return null;
    const label =
      kind === "min"
        ? `Minimum age (${check.limit} years attained)`
        : `Maximum age (below ${check.limit} years)`;
    const value = check.meets
      ? kind === "min"
        ? check.marginDays === 0
          ? "Attained exactly on the cutoff"
          : `Yes — attained ${NUM.format(check.marginDays)} day${check.marginDays === 1 ? "" : "s"} before the cutoff`
        : `Yes — ${NUM.format(check.marginDays)} day${check.marginDays === 1 ? "" : "s"} of headroom`
      : kind === "min"
        ? `No — short by ${NUM.format(Math.abs(check.marginDays))} day${Math.abs(check.marginDays) === 1 ? "" : "s"}`
        : check.marginDays === 0
          ? "No — the limit is attained exactly on the cutoff"
          : `No — over by ${NUM.format(Math.abs(check.marginDays))} day${Math.abs(check.marginDays) === 1 ? "" : "s"}`;
    return [label, value, check.meets];
  };

  const checkRows = hasError
    ? []
    : [checkRow(result.minCheck, "min"), checkRow(result.maxCheck, "max")].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Eligibility Checks
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Age On Cutoff Date Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Notifications fix eligibility on a &quot;crucial date&quot;. Enter your date of birth and
          that cutoff to get your exact completed age — and optionally test it against the
          notification&apos;s minimum and maximum age limits.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cutoff-dob">
              Date of birth
            </label>
            <input
              id="cutoff-dob"
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
            <label className={LABEL_CLASS} htmlFor="cutoff-date">
              Cutoff (&quot;as on&quot;) date
            </label>
            <input
              id="cutoff-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={cutoffDate}
              onChange={(event) => {
                setCopied(false);
                setCutoffDate(event.target.value);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cutoff-min">
              Minimum age in years (optional)
            </label>
            <input
              id="cutoff-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              placeholder="e.g. 21"
              value={minYears}
              onChange={(event) => {
                setCopied(false);
                setMinYears(event.target.value);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cutoff-max">
              Maximum age in years (optional)
            </label>
            <input
              id="cutoff-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              placeholder="e.g. 32"
              value={maxYears}
              onChange={(event) => {
                setCopied(false);
                setMaxYears(event.target.value);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Read as &quot;must not have attained&quot; this age on the cutoff — include any age
              relaxation yourself.
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
              Age on the cutoff date
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{ageText}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.hasChecks
                  ? result.eligible
                    ? "Within the age window you entered."
                    : "Outside the age window you entered."
                  : "Add a minimum or maximum limit to test an eligibility clause."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the age on cutoff date result"
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
                ["Completed age", DASH],
                ["Total days lived", DASH],
                ["Completed months", DASH],
                ["Completed weeks", DASH],
              ]
            : [
                [
                  "Completed age",
                  `${result.age.years} years, ${result.age.months} months, ${result.age.days} days`,
                ],
                ["Total days lived", `${NUM.format(result.totalDays)} days`],
                ["Completed months", `${NUM.format(result.totalMonths)} months`],
                ["Completed weeks", `${NUM.format(result.totalWeeks)} weeks`],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
          {checkRows.map(([label, value, meets]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd
                className={`text-right font-semibold ${meets ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational calculation using the calendar convention notifications use: a year of age
        completes on the birthday anniversary, and a maximum limit of &quot;not attained Y
        years&quot; fails on the day the Yth birthday falls on the cutoff. Category and service age
        relaxations differ by notification — apply them to the limits you enter here.
      </p>
    </main>
  );
}
