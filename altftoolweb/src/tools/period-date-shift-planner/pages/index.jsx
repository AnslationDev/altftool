"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Check, Copy, RotateCcw } from "lucide-react";

import { planPeriodShift } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const days = (value) =>
  Number.isFinite(value) ? `${NUM0.format(value)} day${value === 1 ? "" : "s"}` : DASH;

const DEFAULTS = {
  lastPeriod: "2026-07-01",
  cycleLength: "28",
  periodLength: "5",
  eventStart: "2026-08-25",
  eventEnd: "2026-08-30",
  cyclesAhead: "6",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [lastPeriod, setLastPeriod] = useState(DEFAULTS.lastPeriod);
  const [cycleLength, setCycleLength] = useState(DEFAULTS.cycleLength);
  const [periodLength, setPeriodLength] = useState(DEFAULTS.periodLength);
  const [eventStart, setEventStart] = useState(DEFAULTS.eventStart);
  const [eventEnd, setEventEnd] = useState(DEFAULTS.eventEnd);
  const [cyclesAhead, setCyclesAhead] = useState(DEFAULTS.cyclesAhead);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planPeriodShift({
        lastPeriodStart: lastPeriod,
        cycleLength: toNumber(cycleLength),
        periodLength: toNumber(periodLength),
        eventStart,
        eventEnd,
        cyclesAhead: toNumber(cyclesAhead),
      }),
    [lastPeriod, cycleLength, periodLength, eventStart, eventEnd, cyclesAhead],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Period Date Shift Planner",
      `Last period started: ${result.lastPeriodStart}`,
      `Event: ${result.eventStart} to ${result.eventEnd} (${days(result.eventDays)})`,
      `Predicted next period: ${result.nextPeriodDate}`,
      result.clashCount === 0
        ? "No predicted period overlaps this event."
        : `Overlap: ${days(result.totalOverlap)} across ${result.clashCount} predicted period(s)`,
      result.firstClash
        ? `First clash: ${result.firstClash.startDate} to ${result.firstClash.endDate}`
        : "",
      result.firstClash
        ? `To clear the event it would need to start ${days(result.shiftEarlierDays)} earlier or ${days(result.shiftLaterDays)} later.`
        : "",
      `Cycle day on the first day of the event: ${result.cycleDayAtEvent}`,
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
    setLastPeriod(DEFAULTS.lastPeriod);
    setCycleLength(DEFAULTS.cycleLength);
    setPeriodLength(DEFAULTS.periodLength);
    setEventStart(DEFAULTS.eventStart);
    setEventEnd(DEFAULTS.eventEnd);
    setCyclesAhead(DEFAULTS.cyclesAhead);
    setCopied(false);
  };

  const rows = [
    ["Event length", ok ? days(result.eventDays) : DASH],
    ["Predicted periods that clash", ok ? NUM0.format(result.clashCount) : DASH],
    [
      "First clashing period",
      ok && result.firstClash
        ? `${result.firstClash.startDate} to ${result.firstClash.endDate}`
        : ok
          ? "None"
          : DASH,
    ],
    [
      "Would need to start earlier by",
      ok && result.firstClash ? days(result.shiftEarlierDays) : ok ? "Not needed" : DASH,
    ],
    [
      "Or start later by",
      ok && result.firstClash ? days(result.shiftLaterDays) : ok ? "Not needed" : DASH,
    ],
    ["Cycle day on the first day of the event", ok ? NUM0.format(result.cycleDayAtEvent) : DASH],
    ["Next predicted period", ok ? result.nextPeriodDate : DASH],
    [
      "Cycle length category",
      ok ? (result.regularCycle ? "Inside the usual 21-35 day range" : "Outside the usual 21-35 day range") : DASH,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          Cycle tracking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Period Date Shift Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Line your predicted period dates up against a trip, exam block or event and see exactly
          how many days overlap — and how far the clash would have to move to clear it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your cycle</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-last">
              First day of your last period
            </label>
            <input
              id="shift-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastPeriod}
              onChange={(event) => setLastPeriod(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-cycle">
              Average cycle length (days)
            </label>
            <input
              id="shift-cycle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="20"
              max="45"
              step="1"
              value={cycleLength}
              onChange={(event) => setCycleLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-period">
              Days of bleeding
            </label>
            <input
              id="shift-period"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={periodLength}
              onChange={(event) => setPeriodLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-cycles">
              Cycles to project
            </label>
            <input
              id="shift-cycles"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={cyclesAhead}
              onChange={(event) => setCyclesAhead(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your event</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-event-start">
              Event starts
            </label>
            <input
              id="shift-event-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={eventStart}
              onChange={(event) => setEventStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shift-event-end">
              Event ends
            </label>
            <input
              id="shift-event-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={eventEnd}
              onChange={(event) => setEventEnd(event.target.value)}
            />
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days of the event that overlap a predicted period
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? days(result.totalOverlap) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.totalOverlap === 0
                  ? "No predicted period falls inside this event."
                  : `${result.eventStart} to ${result.eventEnd}, ${days(result.eventDays)} in total`
                : "Fix the highlighted input to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy period shift plan"
              className={GHOST_BTN}
              disabled={!ok}
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Projected periods</h2>
          <table className="mt-3 w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Cycle
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Predicted dates
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Overlap
                </th>
              </tr>
            </thead>
            <tbody>
              {result.periods.map((item) => (
                <tr key={item.cycle} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.cycle}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {item.startDate} to {item.endDate}
                  </td>
                  <td
                    className={`py-2 text-right font-semibold ${
                      item.clashes ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {item.clashes ? days(item.overlapDays) : "clear"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Calendar prediction only, and informational — it assumes your cycle stays the same length,
        which real cycles rarely do. It is not a contraceptive method. Deliberately delaying a
        period requires prescribed medication and should be discussed with a doctor or pharmacist.
      </p>
    </main>
  );
}
