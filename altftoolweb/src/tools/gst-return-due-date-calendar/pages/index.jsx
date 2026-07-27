"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";

import {
  ALL_QRMP_STATES,
  MAX_FY_START,
  MIN_FY_START,
  PROFILES,
  buildReturnCalendar,
  nextDueFilings,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const SEED_TODAY = "2025-07-26";
const SEED_FY = "2025";

const DEFAULTS = {
  profile: "monthly",
  state: "Maharashtra",
};

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const prettyDate = (isoValue) => {
  const [y, m, d] = isoValue.split("-").map(Number);
  return DATE_FMT.format(new Date(Date.UTC(y, m - 1, d)));
};

export default function ToolHome() {
  const [startYear, setStartYear] = useState(SEED_FY);
  const [profile, setProfile] = useState(DEFAULTS.profile);
  const [state, setState] = useState(DEFAULTS.state);
  const [today, setToday] = useState(SEED_TODAY);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const calendar = useMemo(
    () =>
      buildReturnCalendar({
        startYear: startYear.trim() === "" ? Number.NaN : Number(startYear),
        profile,
        state,
      }),
    [startYear, profile, state],
  );

  const hasError = Boolean(calendar.error);

  const upcoming = useMemo(
    () => (hasError ? [] : nextDueFilings(calendar.rows, today, 3)),
    [hasError, calendar, today],
  );

  const nextFiling = upcoming[0] ?? null;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `GST due dates — FY ${calendar.financialYear}`,
      calendar.state ? `Profile: ${profile} (${calendar.state})` : `Profile: ${profile}`,
      "",
      ...calendar.rows.map((row) => `${row.dueDate}  ${row.form}  ${row.period}`),
    ].join("\n");
  }, [hasError, calendar, profile]);

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
    setStartYear(SEED_FY);
    setProfile(DEFAULTS.profile);
    setState(DEFAULTS.state);
    setToday(new Date().toISOString().slice(0, 10));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          GST compliance calendar
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GST Return Due Date Calendar
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a financial year and the kind of registration you hold to get every GSTR-1, GSTR-3B,
          IFF, PMT-06, CMP-08 and annual return date, in order, with a countdown to the next one.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-fy">
              Financial year starting in
            </label>
            <input
              id="cal-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_FY_START}
              max={MAX_FY_START}
              step="1"
              value={startYear}
              onChange={(event) => setStartYear(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Enter 2025 for the year April 2025 to March 2026.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-profile">
              Kind of taxpayer
            </label>
            <select
              id="cal-profile"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profile}
              onChange={(event) => setProfile(event.target.value)}
            >
              {PROFILES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-state">
              State (QRMP filers only)
            </label>
            <select
              id="cal-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state}
              onChange={(event) => setState(event.target.value)}
              disabled={profile !== "qrmp"}
            >
              {ALL_QRMP_STATES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-today">
              Count down from
            </label>
            <input
              id="cal-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calendar.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days to the next filing
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !nextFiling ? DASH : nextFiling.daysAway}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : nextFiling
                  ? `${nextFiling.form} for ${nextFiling.period}, due ${prettyDate(nextFiling.dueDate)}`
                  : "Nothing left in this financial year after the date you chose."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the full due date calendar"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy calendar"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the calendar options"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Financial year", hasError ? DASH : `FY ${calendar.financialYear}`],
            ["Filings in the year", hasError ? DASH : String(calendar.totalFilings)],
            [
              "Second deadline ahead",
              hasError || !upcoming[1]
                ? DASH
                : `${upcoming[1].form} — ${prettyDate(upcoming[1].dueDate)}`,
            ],
            [
              "Third deadline ahead",
              hasError || !upcoming[2]
                ? DASH
                : `${upcoming[2].form} — ${prettyDate(upcoming[2].dueDate)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Every due date, in order</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Due date
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Form
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Period
                  </th>
                </tr>
              </thead>
              <tbody>
                {calendar.rows.map((row) => {
                  const past = row.dueDate < today;
                  return (
                    <tr
                      key={`${row.form}-${row.period}-${row.dueDate}`}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td
                        className={`py-2 pr-3 font-semibold ${past ? "text-[var(--muted-foreground)]" : ""}`}
                      >
                        {prettyDate(row.dueDate)}
                      </td>
                      <td className="py-2 pr-3">{row.form}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">
                        {row.period}
                        <span className="block text-xs">{row.note}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are the ordinary statutory dates. The CBIC extends them by notification in some
        months, and late filing attracts a fee under section 47 of the CGST Act plus interest at 18%
        per annum under section 50 on tax paid late. Check the GST portal before you rely on a date.
      </p>
    </main>
  );
}
