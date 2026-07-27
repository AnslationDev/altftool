"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  DELIVERABLE_CATALOGUE,
  MAX_HOURS_PER_DAY,
  MIN_HOURS_PER_DAY,
  TURNAROUND_MODES,
  formatLocalIso,
  planDelivery,
} from "../lib";

/** Stable first-paint date so the server and client render the same markup. */
const FALLBACK_EVENT_DATE = "2026-06-12";

const buildDefaultRows = () =>
  DELIVERABLE_CATALOGUE.map((item) => ({
    id: item.id,
    enabled: ["social-teaser", "highlight", "keynote", "archive"].includes(item.id),
    runtimeMinutes: String(item.runtimeMinutes),
    turnaround: String(item.turnaround),
    hoursPerMinute: item.hoursPerMinute,
    fixedHours: item.fixedHours,
  }));

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

export default function ToolHome() {
  const [eventDate, setEventDate] = useState(FALLBACK_EVENT_DATE);
  const [hoursPerDay, setHoursPerDay] = useState("6");
  const [turnaroundMode, setTurnaroundMode] = useState("business");
  const [rows, setRows] = useState(buildDefaultRows);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const today = formatLocalIso(new Date());
    if (today) setEventDate(today);
  }, []);

  const result = useMemo(
    () =>
      planDelivery({
        eventDate,
        hoursPerDay: Number(hoursPerDay),
        turnaroundMode,
        deliverables: rows.map((row) => ({
          id: row.id,
          enabled: row.enabled,
          runtimeMinutes: Number(row.runtimeMinutes),
          turnaround: Number(row.turnaround),
          hoursPerMinute: row.hoursPerMinute,
          fixedHours: row.fixedHours,
        })),
      }),
    [eventDate, hoursPerDay, turnaroundMode, rows],
  );

  const hasError = Boolean(result.error);

  const updateRow = (id, patch) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    setCopied(false);
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    const today = formatLocalIso(new Date());
    setEventDate(today || FALLBACK_EVENT_DATE);
    setHoursPerDay("6");
    setTurnaroundMode("business");
    setRows(buildDefaultRows());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Event video
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Event Video Delivery Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put in the last day of the event and pick your deliverables. You get dated deadlines, an
          edit-hours estimate for each item, a start-by date, and a check on whether one editor can
          actually absorb the schedule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="evd-date">
              Last day of the event
            </label>
            <input
              id="evd-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="evd-hours">
              Editing hours per working day
            </label>
            <input
              id="evd-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_HOURS_PER_DAY}
              max={MAX_HOURS_PER_DAY}
              step="0.5"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="evd-mode">
              Turnaround counted in
            </label>
            <select
              id="evd-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={turnaroundMode}
              onChange={(event) => setTurnaroundMode(event.target.value)}
            >
              {TURNAROUND_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Deliverables</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          Runtime is the finished duration. Turnaround is days after the event.
        </p>
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const preset = DELIVERABLE_CATALOGUE.find((entry) => entry.id === row.id);
            return (
              <li key={row.id} className="rounded-lg border border-[var(--border)] p-3">
                <label
                  htmlFor={`evd-on-${row.id}`}
                  className="flex min-h-11 cursor-pointer items-start gap-3"
                >
                  <input
                    id={`evd-on-${row.id}`}
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(event) => updateRow(row.id, { enabled: event.target.checked })}
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{preset?.name}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {preset?.note} · {preset?.hoursPerMinute} h per finished minute plus{" "}
                      {preset?.fixedHours} h fixed
                    </span>
                  </span>
                </label>

                {row.enabled && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold" htmlFor={`evd-run-${row.id}`}>
                        Finished runtime (minutes)
                      </label>
                      <input
                        id={`evd-run-${row.id}`}
                        className={`mt-1 ${INPUT_CLASS}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.5"
                        value={row.runtimeMinutes}
                        onChange={(event) => updateRow(row.id, { runtimeMinutes: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold" htmlFor={`evd-turn-${row.id}`}>
                        Turnaround (days after event)
                      </label>
                      <input
                        id={`evd-turn-${row.id}`}
                        className={`mt-1 ${INPUT_CLASS}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="365"
                        step="1"
                        value={row.turnaround}
                        onChange={(event) => updateRow(row.id, { turnaround: event.target.value })}
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
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
              Total post-production effort
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.totalHours} h`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to build the schedule."
                : `${result.totalDays} working days at ${result.hoursPerDay} h/day · final delivery ${result.lastDueLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the delivery schedule"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Event ends", hasError ? DASH : result.eventLabel],
            ["First deliverable due", hasError ? DASH : result.firstDueLabel],
            ["Final deliverable due", hasError ? DASH : result.lastDueLabel],
            [
              "Working days available",
              hasError ? DASH : `${result.availableWorkingDays} (${result.availableHours} h capacity)`,
            ],
            ["Editor utilisation", hasError || result.utilisation === null ? DASH : `${result.utilisation}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasError ? null : (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-xs leading-5 ${
              result.overCapacity
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {result.overCapacity
              ? `About ${result.capacityGapHours} h more work than one editor can absorb before final delivery. Add an editor, push a deadline, or trim a runtime.`
              : "One editor can absorb this schedule at the stated hours per day."}
          </p>
        )}
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Deliverable</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Edit hours</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Start by</th>
                  <th scope="col" className="py-2 font-semibold">Due</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="block font-semibold">{row.name}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {row.runtimeMinutes} min finished · {row.turnaround} day turnaround
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{row.editHours}</td>
                    <td
                      className={`py-2 pr-3 ${row.startsBeforeEvent ? "font-semibold text-[var(--danger)]" : ""}`}
                    >
                      {row.startLabel}
                      {row.startsBeforeEvent ? " (before the event ends)" : ""}
                    </td>
                    <td className="py-2 font-semibold">{row.dueLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Effort rates are planning defaults, not quotes. Put the agreed turnaround and revision-round
        count in the contract, and remember client review time sits on top of every date shown here.
      </p>
    </main>
  );
}
