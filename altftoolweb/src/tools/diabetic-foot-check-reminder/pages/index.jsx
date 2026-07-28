"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw, TriangleAlert } from "lucide-react";
import {
  CHECK_ITEMS,
  FOOT_ZONES,
  RISK_FACTORS,
  STATUS,
  assessFootCheck,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TEXTAREA_CLASS =
  "min-h-[5.5rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULT_DATE = "2026-01-15";

const emptyStatuses = () =>
  Object.fromEntries(CHECK_ITEMS.map((item) => [item.id, STATUS.UNCHECKED]));
const emptyFactors = () =>
  Object.fromEntries(RISK_FACTORS.map((factor) => [factor.id, false]));
const emptyNotes = () => Object.fromEntries(FOOT_ZONES.map((zone) => [zone.id, ""]));

const prettyDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function ToolHome() {
  const [checkDate, setCheckDate] = useState(DEFAULT_DATE);
  const [statuses, setStatuses] = useState(() => {
    const base = emptyStatuses();
    for (const item of CHECK_ITEMS) base[item.id] = STATUS.OK;
    base["dry-cracks"] = STATUS.PROBLEM;
    return base;
  });
  const [factors, setFactors] = useState(() => ({ ...emptyFactors(), neuropathy: true }));
  const [notes, setNotes] = useState(emptyNotes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessFootCheck({ statuses, riskFactors: factors, checkDate }),
    [statuses, factors, checkDate],
  );

  const hasError = Boolean(result.error);

  const setStatus = (id, value) => {
    setStatuses((prev) => ({ ...prev, [id]: prev[id] === value ? STATUS.UNCHECKED : value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Diabetic foot check",
      `Date: ${prettyDate(result.checkDate)}`,
      `Areas inspected: ${result.inspected} of ${result.totalItems} (${result.completion}%)`,
      `Risk category: ${result.riskLabel}`,
      `Recommended professional review: ${result.reviewLabel}`,
      `Next review due: ${prettyDate(result.nextReviewDate)}`,
      `Next daily check: ${prettyDate(result.nextDailyCheckDate)}`,
    ];
    if (result.urgentFindings.length > 0) {
      lines.push("", "Needs same-day attention:");
      for (const item of result.urgentFindings) lines.push(`- ${item.label}`);
    }
    if (result.routineFindings.length > 0) {
      lines.push("", "Mention at your next appointment:");
      for (const item of result.routineFindings) lines.push(`- ${item.label}`);
    }
    const written = FOOT_ZONES.filter((zone) => notes[zone.id].trim().length > 0);
    if (written.length > 0) {
      lines.push("", "Zone notes:");
      for (const zone of written) lines.push(`- ${zone.label}: ${notes[zone.id].trim()}`);
    }
    return lines.join("\n");
  }, [hasError, result, notes]);

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
    setCheckDate(DEFAULT_DATE);
    const base = emptyStatuses();
    for (const item of CHECK_ITEMS) base[item.id] = STATUS.OK;
    base["dry-cracks"] = STATUS.PROBLEM;
    setStatuses(base);
    setFactors({ ...emptyFactors(), neuropathy: true });
    setNotes(emptyNotes());
    setCopied(false);
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Diabetes foot care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Diabetic Foot Check Reminder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work through the twelve-point daily inspection, flag anything you find, and get the
          professional review interval that matches your risk category under the NICE NG19 foot
          risk stratification.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="foot-date">
              Date of this check
            </label>
            <input
              id="foot-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={checkDate}
              onChange={(event) => setCheckDate(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setCheckDate(todayIso())}
              className={`${GHOST_BTN} w-full`}
            >
              Use today
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Daily inspection</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Mark each area <strong>Fine</strong> or <strong>Problem</strong>. Tap a selected answer
          again to clear it.
        </p>
        <ul className="mt-4 space-y-3">
          {CHECK_ITEMS.map((item) => {
            const value = statuses[item.id];
            return (
              <li
                key={item.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{item.hint}</p>
                <div
                  className="mt-3 flex flex-wrap gap-2"
                  role="group"
                  aria-label={`Result for: ${item.label}`}
                >
                  <button
                    type="button"
                    aria-pressed={value === STATUS.OK}
                    onClick={() => setStatus(item.id, STATUS.OK)}
                    className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      value === STATUS.OK
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    Fine
                  </button>
                  <button
                    type="button"
                    aria-pressed={value === STATUS.PROBLEM}
                    onClick={() => setStatus(item.id, STATUS.PROBLEM)}
                    className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      value === STATUS.PROBLEM
                        ? "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    Problem
                  </button>
                </div>
                {value === STATUS.PROBLEM && (
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.action}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your standing risk factors</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick anything your clinician has already recorded. These set the review interval even on
          a day when nothing new is found.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {RISK_FACTORS.map((factor) => (
            <label
              key={factor.id}
              htmlFor={`factor-${factor.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <input
                id={`factor-${factor.id}`}
                type="checkbox"
                checked={factors[factor.id]}
                onChange={(event) =>
                  setFactors((prev) => ({ ...prev, [factor.id]: event.target.checked }))
                }
                className="h-5 w-5 accent-[var(--primary)]"
              />
              <span>{factor.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Foot map notes</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Record where exactly you saw something, so you can describe it accurately at your
          appointment.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FOOT_ZONES.map((zone) => (
            <div key={zone.id}>
              <label className={LABEL_CLASS} htmlFor={`zone-${zone.id}`}>
                {zone.label}
              </label>
              <textarea
                id={`zone-${zone.id}`}
                className={`mt-2 ${TEXTAREA_CLASS}`}
                value={notes[zone.id]}
                placeholder="e.g. small crack on the heel rim, no bleeding"
                onChange={(event) =>
                  setNotes((prev) => ({ ...prev, [zone.id]: event.target.value }))
                }
              />
            </div>
          ))}
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
              Check completed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${result.completion}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the date to see your result."
                : `${result.inspected} of ${result.totalItems} areas inspected on ${prettyDate(result.checkDate)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy foot check summary"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the whole checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.urgentFindings.length > 0 && (
          <div
            role="alert"
            className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
          >
            <p className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              Contact your diabetes or podiatry team today
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {result.urgentFindings.map((item) => (
                <li key={item.id}>{item.label}</li>
              ))}
            </ul>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Risk category today", hasError ? dash : result.riskLabel],
            ["Standing risk category", hasError ? dash : result.baseRiskLabel],
            ["Recommended review frequency", hasError ? dash : result.reviewLabel],
            ["Next professional review due", hasError ? dash : prettyDate(result.nextReviewDate)],
            ["Next daily self-check", hasError ? dash : prettyDate(result.nextDailyCheckDate)],
            ["Same-day findings", hasError ? dash : String(result.urgentFindings.length)],
            ["Findings for your next appointment", hasError ? dash : String(result.routineFindings.length)],
            ["Areas not yet inspected", hasError ? dash : String(result.skipped)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.riskNote}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not a substitute for a foot examination. Review intervals follow the
        NICE NG19 risk categories; your own team may check you more often. If you find a wound,
        spreading redness, discoloured skin or a hot swollen foot, seek medical advice the same
        day rather than waiting for a scheduled review.
      </p>
    </main>
  );
}
