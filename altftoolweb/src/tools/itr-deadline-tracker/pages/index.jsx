"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  getReturnDeadlines,
  listAssessmentYears,
  TAXPAYER_CATEGORIES,
} from "../lib";

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const NUM = new Intl.NumberFormat("en-IN");

const AY_OPTIONS = listAssessmentYears(2019, 2027);
const DEFAULT_AY = "2025-26";
const DEFAULT_CATEGORY = "non-audit";
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Today's calendar date in the viewer's own zone, as YYYY-MM-DD. */
function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const formatDate = (iso) => (iso ? DATE_FMT.format(new Date(`${iso}T00:00:00Z`)) : DASH);

export default function ToolHome() {
  const [assessmentYear, setAssessmentYear] = useState(DEFAULT_AY);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [asOfDate, setAsOfDate] = useState(todayIso);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => getReturnDeadlines({ assessmentYear, category, asOfDate }),
    [assessmentYear, category, asOfDate],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `ITR deadlines — assessment year ${result.assessmentYear} (income of FY ${result.financialYear})`,
      `Status on ${formatDate(result.asOfDate)}: ${result.phaseHeadline}`,
      `Due date u/s 139(1): ${formatDate(result.originalDueDate)}`,
      `Belated / revised return u/s 139(4)-(5): ${formatDate(result.belatedDeadline)}`,
      result.itrU.available
        ? `Updated return u/s 139(8A): ${formatDate(result.itrU.deadline)}`
        : "Updated return u/s 139(8A): not available for this assessment year",
      result.itrU.activePercent
        ? `Additional tax u/s 140B if filed today: ${result.itrU.activePercent}%`
        : "",
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
    setAssessmentYear(DEFAULT_AY);
    setCategory(DEFAULT_CATEGORY);
    setAsOfDate(todayIso());
    setCopied(false);
  };

  const daysLabel = hasError
    ? DASH
    : result.primaryDaysLeft >= 0
      ? NUM.format(result.primaryDaysLeft)
      : NUM.format(Math.abs(result.primaryDaysLeft));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          ITR filing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Belated and Updated Return Deadline Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick an assessment year to see the section 139(1) due date, how long the belated and
          revised window stays open, and the 48-month ITR-U timeline with the section 140B
          additional tax that applies in each slab.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="itr-ay">
              Assessment year
            </label>
            <select
              id="itr-ay"
              className={`mt-2 ${INPUT_CLASS}`}
              value={assessmentYear}
              onChange={(event) => setAssessmentYear(event.target.value)}
            >
              {AY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  AY {option.value} (income of FY {option.financialYear})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="itr-asof">
              Reference date
            </label>
            <input
              id="itr-asof"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOfDate}
              onChange={(event) => setAsOfDate(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Which due date applies to you?
          </legend>
          <div className="mt-2 grid gap-2">
            {TAXPAYER_CATEGORIES.map((item) => (
              <label
                key={item.id}
                htmlFor={`itr-cat-${item.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm has-checked:border-[var(--primary)]"
              >
                <input
                  id={`itr-cat-${item.id}`}
                  type="radio"
                  name="itr-category"
                  value={item.id}
                  checked={category === item.id}
                  onChange={() => setCategory(item.id)}
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                />
                <span>
                  <span className="block font-semibold">{item.label}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">{item.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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
              {hasError
                ? "Next deadline"
                : result.primaryDaysLeft >= 0
                  ? "Days left on the next deadline"
                  : "Days since the last deadline lapsed"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{daysLabel}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the timeline."
                : `${result.phaseHeadline} · ${formatDate(result.primaryDeadline)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the filing deadline summary"
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
              aria-label="Reset the assessment year and dates"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.phaseDetail}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Assessment year", hasError ? DASH : `AY ${result.assessmentYear}`],
            ["Income earned in", hasError ? DASH : `FY ${result.financialYear}`],
            ["Due date under section 139(1)", hasError ? DASH : formatDate(result.originalDueDate)],
            [
              "Belated return under section 139(4)",
              hasError ? DASH : formatDate(result.belatedDeadline),
            ],
            [
              "Revised return under section 139(5)",
              hasError ? DASH : formatDate(result.revisedDeadline),
            ],
            [
              "Updated return under section 139(8A)",
              hasError
                ? DASH
                : result.itrU.available
                  ? formatDate(result.itrU.deadline)
                  : "Not available before AY 2020-21",
            ],
            [
              "Additional tax under section 140B if you file today",
              hasError
                ? DASH
                : result.itrU.activePercent
                  ? `${result.itrU.activePercent}% of tax plus interest due`
                  : "Not applicable right now",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Full timeline for AY {result.assessmentYear}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Milestone
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Section
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.timeline.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="block font-semibold">{row.milestone}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {row.basis}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {row.section}
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{formatDate(row.date)}</td>
                    <td
                      className={`py-2.5 text-right whitespace-nowrap font-semibold ${
                        row.past ? "text-[var(--muted-foreground)]" : "text-[var(--success)]"
                      }`}
                    >
                      {row.past
                        ? `Passed ${NUM.format(Math.abs(row.daysFromToday))}d ago`
                        : `${NUM.format(row.daysFromToday)}d left`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && result.itrU.available && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What an updated return cannot do</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.itrU.restrictions.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are the statutory dates written into the Income-tax Act. The CBDT extends particular
        due dates by circular from time to time, so check the latest notification before you rely on
        a date. Informational only — speak to a chartered accountant about your own filing position.
      </p>
    </main>
  );
}
