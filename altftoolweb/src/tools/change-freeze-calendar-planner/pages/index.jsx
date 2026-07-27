"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Snowflake, Trash2 } from "lucide-react";

import {
  MOVEABLE_EVENT_TEMPLATES,
  computeFreezeCalendar,
  fixedEventsForYear,
  freezeCalendarMarkdown,
  weekdayName,
} from "../lib";

const DEFAULT_YEAR = 2026;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function seedRows(year) {
  const fixed = fixedEventsForYear(year).map((event) => ({
    key: event.id,
    label: event.label,
    group: event.group,
    date: event.date,
    leadDays: String(event.leadDays),
    trailDays: String(event.trailDays),
    enabled: event.group !== "Holiday" || event.id === "christmas",
  }));
  const moveable = MOVEABLE_EVENT_TEMPLATES.map((event) => ({
    key: event.id,
    label: event.label,
    group: event.group,
    date: "",
    leadDays: String(event.lead),
    trailDays: String(event.trail),
    enabled: false,
  }));
  return [...fixed, ...moveable];
}

export default function ToolHome() {
  const [year, setYear] = useState(String(DEFAULT_YEAR));
  const [rows, setRows] = useState(() => seedRows(DEFAULT_YEAR));
  const [copied, setCopied] = useState(false);

  const yearNumber = Number(year);

  const updateRow = (key, patch) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeRow = (key) => {
    setRows((prev) => prev.filter((row) => row.key !== key));
  };

  const addCustomRow = () => {
    setRows((prev) => {
      // Key is derived from the existing rows, never from a ref.
      const used = new Set(prev.map((row) => row.key));
      let index = 1;
      while (used.has(`custom-${index}`)) index += 1;
      return [
        ...prev,
        {
          key: `custom-${index}`,
          label: `Custom event ${index}`,
          group: "Custom",
          date: Number.isFinite(yearNumber) ? `${yearNumber}-06-01` : "",
          leadDays: "2",
          trailDays: "1",
          enabled: true,
          custom: true,
        },
      ];
    });
  };

  const applyYear = (nextYear) => {
    setYear(nextYear);
    const parsed = Number(nextYear);
    if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) return;
    setRows((prev) =>
      prev.map((row) => {
        if (!row.date) return row;
        const rest = row.date.slice(4);
        return { ...row, date: `${parsed}${rest}` };
      }),
    );
  };

  const result = useMemo(() => {
    const events = rows
      .filter((row) => row.enabled)
      .map((row) => ({
        id: row.key,
        label: row.label,
        group: row.group,
        date: row.date,
        leadDays: Number(row.leadDays),
        trailDays: Number(row.trailDays),
      }));
    return computeFreezeCalendar({
      events,
      year: Number.isInteger(yearNumber) ? yearNumber : undefined,
    });
  }, [rows, yearNumber]);

  const hasError = Boolean(result.error);

  const markdown = useMemo(
    () => (hasError ? "" : freezeCalendarMarkdown(result, yearNumber)),
    [hasError, result, yearNumber],
  );

  const copyResult = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setYear(String(DEFAULT_YEAR));
    setRows(seedRows(DEFAULT_YEAR));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Snowflake className="h-4 w-4" aria-hidden="true" />
          Release management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Change Freeze Calendar Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the sale days, holidays and fiscal closes you protect, set how many days you freeze on
          each side, and see the merged freeze blocks, the total frozen days, and the release windows
          that survive in between.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="freeze-year">
              Planning year
            </label>
            <input
              id="freeze-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2000"
              max="2100"
              step="1"
              value={year}
              onChange={(event) => applyYear(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={addCustomRow} className={GHOST_BTN}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add custom event
            </button>
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {rows.map((row) => (
            <li key={row.key} className="rounded-lg border border-[var(--border)] p-3">
              <div className="flex items-start gap-3">
                <input
                  id={`enable-${row.key}`}
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(event) => updateRow(row.key, { enabled: event.target.checked })}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={row.custom ? `label-${row.key}` : `enable-${row.key}`}
                    className="block text-sm font-semibold"
                  >
                    {row.custom ? "Event name" : row.label}
                  </label>
                  {row.custom ? (
                    <input
                      id={`label-${row.key}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      value={row.label}
                      onChange={(event) => updateRow(row.key, { label: event.target.value })}
                    />
                  ) : (
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      {row.group}
                      {row.date ? ` · ${weekdayName(row.date) || "date not set"}` : " · enter the date for this year"}
                    </p>
                  )}
                </div>
                {row.custom ? (
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    aria-label={`Remove ${row.label}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`date-${row.key}`}>
                    Event date
                  </label>
                  <input
                    id={`date-${row.key}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="date"
                    value={row.date}
                    onChange={(event) => updateRow(row.key, { date: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`lead-${row.key}`}>
                    Freeze days before
                  </label>
                  <input
                    id={`lead-${row.key}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="120"
                    step="1"
                    value={row.leadDays}
                    onChange={(event) => updateRow(row.key, { leadDays: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`trail-${row.key}`}>
                    Freeze days after
                  </label>
                  <input
                    id={`trail-${row.key}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="120"
                    step="1"
                    value={row.trailDays}
                    onChange={(event) => updateRow(row.key, { trailDays: event.target.value })}
                  />
                </div>
              </div>
            </li>
          ))}
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
              Days frozen this year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.frozenDays}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above." : `${result.frozenPct}% of ${result.yearDays} days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the freeze calendar as markdown"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy calendar"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the calendar" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Frozen working days (Mon–Fri)", hasError ? DASH : String(result.frozenWeekdays)],
            ["Separate freeze blocks", hasError ? DASH : String(result.merged.length)],
            [
              "Longest single block",
              hasError || !result.longest ? DASH : `${result.longest.days} days`,
            ],
            ["Release windows between freezes", hasError ? DASH : String(result.shipWindows.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Freeze blocks</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">From</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">To</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Days</th>
                    <th scope="col" className="py-2 font-semibold">Covers</th>
                  </tr>
                </thead>
                <tbody>
                  {result.merged.map((block) => (
                    <tr key={`${block.start}-${block.end}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{block.start}</td>
                      <td className="py-2 pr-3">{block.end}</td>
                      <td className="py-2 pr-3 text-right">{block.days}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{block.labels.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {result.shipWindows.length ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Release windows between freezes</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[360px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">From</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">To</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Days</th>
                      <th scope="col" className="py-2 text-right font-semibold">Weekdays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.shipWindows.map((gap) => (
                      <tr key={`${gap.start}-${gap.end}`} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{gap.start}</td>
                        <td className="py-2 pr-3">{gap.end}</td>
                        <td className="py-2 pr-3 text-right">{gap.days}</td>
                        <td className="py-2 text-right text-[var(--muted-foreground)]">{gap.weekdays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Diwali, Eid and Black Friday move every year, so those dates are asked for rather than assumed.
        A freeze should always have a documented exception path for security fixes and Sev-1 incidents.
      </p>
    </main>
  );
}
