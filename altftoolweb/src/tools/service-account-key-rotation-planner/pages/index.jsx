"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { planKeyRotation } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

// Local calendar date, not UTC — toISOString() reports the UTC date, which
// has already rolled over to tomorrow (or not yet rolled over to today) for
// part of every day in any non-UTC timezone.
const toLocalIso = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const isoToday = () => toLocalIso(new Date());
const isoDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toLocalIso(date);
};

const DASH = "—";

export default function ToolHome() {
  const [lastRotationDate, setLastRotationDate] = useState(() => isoDaysAgo(60));
  const [today, setToday] = useState(() => isoToday());
  const [rotationPeriodDays, setRotationPeriodDays] = useState("90");
  const [overlapDays, setOverlapDays] = useState("7");
  const [noticeDays, setNoticeDays] = useState("14");
  const [keyCount, setKeyCount] = useState("12");
  const { copy: copyText, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const asNumber = (value) => (value.trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      planKeyRotation({
        lastRotationDate,
        rotationPeriodDays: asNumber(rotationPeriodDays),
        overlapDays: asNumber(overlapDays),
        noticeDays: asNumber(noticeDays),
        keyCount: asNumber(keyCount),
        today,
      }),
    [lastRotationDate, rotationPeriodDays, overlapDays, noticeDays, keyCount, today],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Service account key rotation plan",
      `Key age: ${result.keyAgeDays} days; next rotation due ${result.dueDate} (${
        result.overdue ? `${Math.abs(result.daysUntilDue)} days OVERDUE` : `in ${result.daysUntilDue} days`
      })`,
      `Cadence: every ${rotationPeriodDays} days — ${result.meetsCis ? "meets" : "FAILS"} the CIS 90-day ceiling`,
      "",
      ...result.steps.map((step) => `${step.date}  ${step.title} — ${step.detail}`),
      "",
      `Fleet load: ${keyCount} keys × ${NUM.format(result.rotationsPerYearPerKey)} rotations/yr = ${NUM.format(result.rotationEventsPerYear)} rotation events per year`,
    ].join("\n");
  }, [hasError, result, rotationPeriodDays, keyCount]);

  const copyResult = () => {
    if (!summary) return;
    copyText("plan", summary, { label: "the key rotation plan" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every date and cadence field back to the demo defaults? This cannot be undone.",
      )
    ) {
      return;
    }
    setLastRotationDate(isoDaysAgo(60));
    setToday(isoToday());
    setRotationPeriodDays("90");
    setOverlapDays("7");
    setNoticeDays("14");
    setKeyCount("12");
    resetCopyState();
  };

  const rows = hasError
    ? [
        ["Current key age", DASH],
        ["Next rotation due", DASH],
        ["Rotations per key per year", DASH],
        ["Rotation events across the fleet", DASH],
      ]
    : [
        ["Current key age", `${result.keyAgeDays} days`],
        ["Next rotation due", result.dueDate],
        [
          "CIS 90-day ceiling",
          result.meetsCis ? "Met" : `Not met — cadence exceeds ${result.cisMaxDays} days`,
        ],
        ["Rotations per key per year", NUM.format(result.rotationsPerYearPerKey)],
        ["Rotation events across the fleet / year", NUM.format(result.rotationEventsPerYear)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Cloud IAM
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Service Account Key Rotation Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Plan a zero-downtime key rotation: when the next rotation is due against the CIS 90-day
          ceiling, and the dated cutover steps — notify, create, deploy, disable, delete — with an
          overlap window where both keys stay valid.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-last">
              Current key created / last rotated on
            </label>
            <input
              id="kr-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastRotationDate}
              onChange={(event) => setLastRotationDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-today">
              Plan as of (today)
            </label>
            <input
              id="kr-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-period">
              Rotation period (days)
            </label>
            <input
              id="kr-period"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={rotationPeriodDays}
              onChange={(event) => setRotationPeriodDays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              CIS AWS Benchmark 1.14: 90 days or less.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-overlap">
              Overlap window (days both keys valid)
            </label>
            <input
              id="kr-overlap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={overlapDays}
              onChange={(event) => setOverlapDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-notice">
              Notice to owners before due date (days)
            </label>
            <input
              id="kr-notice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={noticeDays}
              onChange={(event) => setNoticeDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-count">
              Keys managed on this cadence
            </label>
            <input
              id="kr-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={keyCount}
              onChange={(event) => setKeyCount(event.target.value)}
            />
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next rotation due
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--primary)]"
                  : result.overdue
                    ? "text-[var(--danger)]"
                    : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : result.dueDate}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the schedule."
                : result.overdue
                  ? `Overdue by ${Math.abs(result.daysUntilDue)} days — rotate now, then adopt the schedule below.`
                  : `Due in ${result.daysUntilDue} days.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={isCopied("plan") ? "Copied the key rotation plan" : "Copy the key rotation plan"}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("plan") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("plan") ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Cutover schedule</h2>
          <ol className="mt-3 space-y-3">
            {result.steps.map((step, index) => (
              <li key={`${step.date}-${step.title}`} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    {step.title}
                    <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                      {step.date}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid. Where possible, prefer keyless alternatives — IAM roles, GCP
        workload identity federation or Azure managed identities — which remove the rotation burden
        entirely; static keys should be the exception, not the default.
      </p>
    </main>
  );
}
