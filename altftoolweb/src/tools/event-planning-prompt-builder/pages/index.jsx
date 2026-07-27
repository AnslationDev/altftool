"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  CATERING_STYLES,
  EVENT_TYPES,
  SEATING_STYLES,
  buildEventPrompt,
  formatDuration,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  eventName: "Launch Day",
  eventType: "Product launch",
  attendees: "300",
  seating: "theatre",
  catering: "buffet",
  startTime: "09:30",
  agendaText:
    "Doors and registration | 30\nOpening keynote | 45\nBreak | 15\nCustomer panel | 60\nLunch | 45\nDemo stations | 60\nClose | 15",
  venue: "Hotel ballroom, Bengaluru",
  risks: "AV vendor is new to us; two speakers arriving same morning",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildEventPrompt(form), [form]);
  const ok = !result.error;

  const copyPrompt = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = [
    ["Ends at", ok ? `${result.endClock}${result.crossesMidnight ? " (next day)" : ""}` : DASH],
    [
      "Floor area needed",
      ok ? `${NUM.format(result.totalSqm)} sq m (${NUM.format(result.totalSqft)} sq ft)` : DASH,
    ],
    ["Check-in stations", ok ? NUM.format(result.checkInStations) : DASH],
    ["On-site crew", ok ? NUM.format(result.crew) : DASH],
    ["Catering service staff", ok ? (result.servers ? NUM.format(result.servers) : "not catered") : DASH],
    [
      "Buffet lines",
      ok
        ? result.buffetLines
          ? `${result.buffetLines} lines, about ${result.buffetMinutes} min to serve all`
          : "not applicable"
        : DASH,
    ],
    ["Layout", ok ? result.seating.label : DASH],
    ["Prompt size", ok ? `${NUM.format(result.wordCount)} words, ~${NUM.format(result.tokenEstimate)} tokens` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Event logistics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Event Planning Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the agenda as durations and this lays it on a real clock, sizes the room from the
          headcount and layout, and works out crew, check-in desks and buffet lines — then packs all
          of it into one logistics prompt.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-name">
              Event name (optional)
            </label>
            <input id="ev-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.eventName} onChange={set("eventName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-type">
              Event type
            </label>
            <select id="ev-type" className={`mt-2 ${INPUT_CLASS}`} value={form.eventType} onChange={set("eventType")}>
              {EVENT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-attendees">
              Expected attendance
            </label>
            <input
              id="ev-attendees"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100000"
              step="1"
              value={form.attendees}
              onChange={set("attendees")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-start">
              Start time (24-hour HH:MM)
            </label>
            <input
              id="ev-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.startTime}
              onChange={set("startTime")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-seating">
              Seating layout
            </label>
            <select id="ev-seating" className={`mt-2 ${INPUT_CLASS}`} value={form.seating} onChange={set("seating")}>
              {SEATING_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-catering">
              Catering style
            </label>
            <select id="ev-catering" className={`mt-2 ${INPUT_CLASS}`} value={form.catering} onChange={set("catering")}>
              {CATERING_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ev-agenda">
              Agenda — one line each, as &quot;Segment name | minutes&quot;
            </label>
            <textarea
              id="ev-agenda"
              rows={7}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.agendaText}
              onChange={set("agendaText")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-venue">
              Venue (optional)
            </label>
            <input id="ev-venue" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.venue} onChange={set("venue")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ev-risks">
              Known risks (optional)
            </label>
            <input id="ev-risks" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.risks} onChange={set("risks")} />
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
              Total runtime
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? formatDuration(result.totalMinutes) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.startClock} to ${result.endClock} for ${NUM.format(result.attendees)} people`
                : "Fix the input above to build the prompt"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={!ok}
              aria-label="Copy the generated event planning prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Run of show</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Time</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Segment</th>
                <th scope="col" className="py-2 text-right font-semibold">Length</th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.rows.map((row) => (
                  <tr key={`${row.startsAt}-${row.name}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="whitespace-nowrap py-2 pr-3 font-semibold">
                      {row.startsAt}–{row.endsAt}
                    </td>
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="whitespace-nowrap py-2 text-right text-[var(--muted-foreground)]">
                      {formatDuration(row.minutes)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3" colSpan={3}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {ok ? result.prompt : DASH}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Area and staffing figures are planning allowances, not legal capacity. Licensed occupancy,
        exit widths and sanitary provision are set by the venue and by local building and fire codes —
        always take the binding number from the venue and the authority having jurisdiction.
      </p>
    </main>
  );
}
