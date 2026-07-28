"use client";

import { useMemo, useState } from "react";
import { BatteryMedium, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  DAYS,
  DISPOSITION_LEVELS,
  ENJOYMENT_LEVELS,
  EVENT_TYPES,
  MAX_HOURS,
  MIN_HOURS,
  eventCost,
  planWeek,
} from "../lib";

const DASH = "—";

const DEFAULT_DISPOSITION = "2";
const DEFAULT_EVENTS = [
  { id: "seed-1", day: "Mon", type: "workMeeting", hours: 2, enjoyment: 3, label: "Team meetings" },
  { id: "seed-2", day: "Wed", type: "videoCall", hours: 1, enjoyment: 4, label: "Client call" },
  { id: "seed-3", day: "Fri", type: "largeGroup", hours: 4, enjoyment: 2, label: "Office party" },
  { id: "seed-4", day: "Sat", type: "oneToOne", hours: 2, enjoyment: 5, label: "Coffee with a friend" },
  { id: "seed-5", day: "Sun", type: "aloneQuiet", hours: 3, enjoyment: 3, label: "Reading afternoon" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const BAND_TONE = {
  full: "text-[var(--success)]",
  steady: "text-[var(--success)]",
  stretched: "text-[var(--primary)]",
  depleted: "text-[var(--danger)]",
  overdrawn: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [disposition, setDisposition] = useState(DEFAULT_DISPOSITION);
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [draft, setDraft] = useState({
    day: "Tue",
    type: "smallGroup",
    hours: "2",
    enjoyment: "3",
    label: "",
  });
  const [addError, setAddError] = useState("");
  const [copied, setCopied] = useState(false);

  const week = useMemo(
    () => planWeek({ events, disposition: Number(disposition) }),
    [events, disposition],
  );
  const ok = !week.error;

  const addEvent = () => {
    const candidate = {
      day: draft.day,
      type: draft.type,
      hours: Number(draft.hours),
      enjoyment: Number(draft.enjoyment),
    };
    const priced = eventCost(candidate, Number(disposition));
    if (priced.error) {
      setAddError(priced.error);
      return;
    }
    setAddError("");
    setEvents((prev) => [
      ...prev,
      {
        ...candidate,
        id: `e-${prev.length}-${candidate.day}-${candidate.type}-${candidate.hours}`,
        label: draft.label.trim() || EVENT_TYPES[candidate.type].label,
      },
    ]);
    setDraft((prev) => ({ ...prev, label: "" }));
    setCopied(false);
  };

  const removeEvent = (id) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
    setCopied(false);
  };

  const reset = () => {
    setEvents(DEFAULT_EVENTS);
    setDisposition(DEFAULT_DISPOSITION);
    setAddError("");
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Social Battery Tracker - week plan",
      `Battery left: ${week.remaining} of ${week.capacity} (${week.bandLabel})`,
      `Drain ${week.totalDrain} · recovery ${week.totalRecovery} · net ${week.netLoad}`,
      `Social hours ${week.socialHours} · alone hours ${week.recoveryHours}`,
      `Recovery still owed: ${week.recoveryDebtHours} hours of quiet time`,
      week.heaviestDay ? `Heaviest day: ${week.heaviestDay} (${week.heaviestDayNet})` : "",
      "",
      ...week.perDay.map((day) => `${day.day}: net ${day.net}${day.overSafeLoad ? " (over the even daily share)" : ""}`),
      "",
      week.bandAdvice,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, week]);

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

  const maxDayMagnitude = ok
    ? Math.max(1, ...week.perDay.map((day) => Math.abs(day.net)))
    : 1;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BatteryMedium className="h-4 w-4" aria-hidden="true" />
          Social energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Social Battery Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log the week&apos;s social commitments and alone time. Each entry is costed by type,
          length, how much you want to be there and where you sit on the introversion-extraversion
          scale, against a 100-unit weekly budget — a planning heuristic, not a measurement.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="sb-disposition">
            Where you sit on the introversion-extraversion scale
          </label>
          <select
            id="sb-disposition"
            className={`mt-2 ${INPUT_CLASS}`}
            value={disposition}
            onChange={(event) => setDisposition(event.target.value)}
          >
            {DISPOSITION_LEVELS.map((level) => (
              <option key={level.value} value={String(level.value)}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <h2 className="mt-5 text-base font-semibold">Add an entry</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sb-type">
              What kind of time is it?
            </label>
            <select
              id="sb-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.type}
              onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value }))}
            >
              {Object.values(EVENT_TYPES).map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-day">
              Day
            </label>
            <select
              id="sb-day"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.day}
              onChange={(event) => setDraft((prev) => ({ ...prev, day: event.target.value }))}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-hours">
              Hours
            </label>
            <input
              id="sb-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_HOURS}
              max={MAX_HOURS}
              step="0.25"
              value={draft.hours}
              onChange={(event) => setDraft((prev) => ({ ...prev, hours: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-enjoyment">
              How do you feel about it?
            </label>
            <select
              id="sb-enjoyment"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.enjoyment}
              onChange={(event) => setDraft((prev) => ({ ...prev, enjoyment: event.target.value }))}
              disabled={EVENT_TYPES[draft.type] && EVENT_TYPES[draft.type].kind === "recovery"}
            >
              {ENJOYMENT_LEVELS.map((level) => (
                <option key={level.value} value={String(level.value)}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-label">
              Label (optional)
            </label>
            <input
              id="sb-label"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Dinner with the in-laws"
              value={draft.label}
              onChange={(event) => setDraft((prev) => ({ ...prev, label: event.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={addEvent} aria-label="Add this entry to the week" className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add to week
          </button>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the week summary"
            className={GHOST_BTN}
            disabled={!ok}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy week"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset the week" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        {addError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {addError}
          </p>
        ) : null}
      </section>

      {week.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {week.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Battery left at the end of the week
        </p>
        <p className={`mt-1 text-4xl font-semibold ${ok ? BAND_TONE[week.bandKey] : "text-[var(--muted-foreground)]"}`}>
          {ok ? `${week.remaining}%` : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok ? week.bandLabel : "Fix the entries above to see a reading"}
        </p>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className={`block h-full ${ok && week.remaining < 20 ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
            style={{ width: `${ok ? Math.max(1, week.remaining) : 0}%` }}
            aria-hidden="true"
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Drain from social time", ok ? `${week.totalDrain} units` : DASH],
            ["Restored by alone time", ok ? `${week.totalRecovery} units` : DASH],
            ["Net load", ok ? `${week.netLoad} of ${week.capacity}` : DASH],
            ["Social hours booked", ok ? `${week.socialHours} h` : DASH],
            ["Alone hours booked", ok ? `${week.recoveryHours} h` : DASH],
            [
              "Quiet hours still owed",
              ok ? `${week.recoveryDebtHours} h (of ${week.recoveryNeededHours} h needed)` : DASH,
            ],
            ["Heaviest day", ok && week.heaviestDay ? `${week.heaviestDay} (${week.heaviestDayNet})` : DASH],
            [
              "Days over the even daily share",
              ok ? `${week.heavyDayCount} (share is ${week.dailySafeLoad})` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? <p className="mt-4 text-sm leading-6">{week.bandAdvice}</p> : null}

        {ok && week.skippedCount > 0 ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {week.skippedCount} entr{week.skippedCount === 1 ? "y was" : "ies were"} left out of the
            total: {week.skippedReason}
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Day by day</h2>
          <ul className="mt-3 grid gap-2">
            {week.perDay.map((day) => (
              <li key={day.day} className="grid grid-cols-[3rem_1fr_4.5rem] items-center gap-3 text-sm">
                <span className="font-semibold">{day.day}</span>
                <span className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className={`block h-full ${day.overSafeLoad ? "bg-[var(--danger)]" : day.net < 0 ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                    style={{ width: `${Math.min(100, (Math.abs(day.net) / maxDayMagnitude) * 100)}%` }}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-right font-semibold tabular-nums">{day.net}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Red bars are days above the even daily share of {week.dailySafeLoad} units. Green bars
            are days that put energy back.
          </p>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">This week&apos;s entries</h2>
        {events.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Nothing logged. Add the commitments you already have before adding anything new.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Day</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">What</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Hours</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Cost</th>
                  <th scope="col" className="py-2 text-right font-semibold">Remove</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const priced = eventCost(event, Number(disposition));
                  return (
                    <tr key={event.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{event.day}</td>
                      <td className="py-2 pr-3">
                        {event.label}
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {EVENT_TYPES[event.type] ? EVENT_TYPES[event.type].label : "Unknown type"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">{event.hours}</td>
                      <td
                        className={`py-2 pr-3 text-right font-semibold tabular-nums ${
                          priced.error ? "text-[var(--danger)]" : priced.cost < 0 ? "text-[var(--success)]" : ""
                        }`}
                      >
                        {priced.error ? DASH : priced.cost}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeEvent(event.id)}
                          aria-label={`Remove ${event.label} on ${event.day}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The battery is a planning metaphor, not a measurement — the unit values are a consistent
        scoring scheme so weeks can be compared, nothing more. Persistent exhaustion after ordinary
        social contact, or avoidance that is shrinking your life, is worth discussing with a doctor
        rather than budgeting around.
      </p>
    </main>
  );
}
