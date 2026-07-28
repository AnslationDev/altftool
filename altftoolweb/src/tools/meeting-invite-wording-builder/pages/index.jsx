"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  DURATION_OPTIONS,
  LARGE_MEETING_THRESHOLD,
  MEETING_TYPES,
  buildInvite,
} from "../lib";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const DASH = "—";

const DEFAULTS = {
  topic: "Pricing change for the Pro plan",
  objective: "Agree the new Pro price and the date we announce it to existing customers",
  typeId: "decision",
  durationMinutes: "50",
  startTime: "10:30",
  dateIso: "2026-08-11",
  required: "Priya, Daniel, Meera",
  optional: "Sam, Ravi",
  agenda:
    "Context and constraints — 5\nOptions on the table — 15\nDiscussion — 15\nDecision and owner — 10",
  preRead: "Read the two-page pricing memo in the shared drive and add comments inline",
  decisionOwner: "Priya",
  location: "Video call — link in the calendar entry",
  hourlyRate: "3000",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildInvite({
        ...form,
        durationMinutes: Number(form.durationMinutes),
        hourlyRate: Number(form.hourlyRate),
      }),
    [form],
  );
  const failed = Boolean(result.error);

  const selectedType = MEETING_TYPES.find((item) => item.id === form.typeId) || MEETING_TYPES[0];

  const applyTemplate = (typeId) => {
    const type = MEETING_TYPES.find((item) => item.id === typeId);
    if (!type) return;
    setForm((prev) => ({
      ...prev,
      typeId,
      agenda: type.agenda.map(([label, minutes]) => `${label} — ${minutes}`).join("\n"),
    }));
  };

  const copy = async (what, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  const fullText = failed ? "" : `Subject: ${result.subject}\n\n${result.body}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Meeting invites
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Meeting Invite Wording Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write an invite people can act on: one objective, a time-boxed agenda that actually fits
          the slot, a pre-read, and a named owner for the decision.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="mi-topic">
              Topic
            </label>
            <input id="mi-topic" className={`mt-2 ${INPUT}`} value={form.topic} onChange={setField("topic")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="mi-objective">
              Objective — what must be true when it ends
            </label>
            <textarea id="mi-objective" rows={2} className={`mt-2 ${AREA}`} value={form.objective} onChange={setField("objective")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mi-type">
              Meeting type
            </label>
            <select
              id="mi-type"
              className={`mt-2 ${INPUT}`}
              value={form.typeId}
              onChange={(event) => setForm((prev) => ({ ...prev, typeId: event.target.value }))}
            >
              {MEETING_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => applyTemplate(form.typeId)}
              className="mt-2 min-h-11 text-sm font-semibold text-[var(--primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              Load the {selectedType.label.toLowerCase()} agenda template
            </button>
          </div>
          <div>
            <label className={LABEL} htmlFor="mi-duration">
              Length (minutes)
            </label>
            <select id="mi-duration" className={`mt-2 ${INPUT}`} value={form.durationMinutes} onChange={setField("durationMinutes")}>
              {DURATION_OPTIONS.map((minutes) => (
                <option key={minutes} value={String(minutes)}>
                  {minutes} min
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="mi-date">
              Date
            </label>
            <input id="mi-date" type="date" className={`mt-2 ${INPUT}`} value={form.dateIso} onChange={setField("dateIso")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mi-start">
              Start time (24-hour)
            </label>
            <input id="mi-start" type="time" className={`mt-2 ${INPUT}`} value={form.startTime} onChange={setField("startTime")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="mi-agenda">
              Agenda — one line each, &quot;Item — minutes&quot;
            </label>
            <textarea id="mi-agenda" rows={5} className={`mt-2 ${AREA}`} value={form.agenda} onChange={setField("agenda")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mi-required">
              Required attendees
            </label>
            <input id="mi-required" className={`mt-2 ${INPUT}`} value={form.required} onChange={setField("required")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mi-optional">
              Optional attendees
            </label>
            <input id="mi-optional" className={`mt-2 ${INPUT}`} value={form.optional} onChange={setField("optional")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="mi-preread">
              Pre-read / preparation ask
            </label>
            <input id="mi-preread" className={`mt-2 ${INPUT}`} value={form.preRead} onChange={setField("preRead")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mi-owner">
              Decision owner
            </label>
            <input id="mi-owner" className={`mt-2 ${INPUT}`} value={form.decisionOwner} onChange={setField("decisionOwner")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mi-location">
              Location or call link text
            </label>
            <input id="mi-location" className={`mt-2 ${INPUT}`} value={form.location} onChange={setField("location")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mi-rate">
              Blended hourly cost per attendee (INR)
            </label>
            <input
              id="mi-rate"
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              className={`mt-2 ${INPUT}`}
              value={form.hourlyRate}
              onChange={setField("hourlyRate")}
            />
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Agenda fit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.agendaTotal} / ${result.duration} min`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to generate the invite."
                : result.overbooked
                  ? `Over-booked — trim ${result.overBy} min to leave wrap-up time`
                  : `${result.unallocated} min spare, including ${result.reserve} min for wrap-up`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("all", fullText)}
              aria-label="Copy the subject line and invite body"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied === "all" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "all" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Subject line", failed ? DASH : result.subject],
            ["Slot", failed ? DASH : `${result.dateLabel}, ${result.startLabel}–${result.endLabel}`],
            ["Attendees", failed ? DASH : `${result.attendeeCount} (${result.requiredCount} required, ${result.optionalCount} optional)`],
            ["Person-minutes booked", failed ? DASH : `${result.personMinutes} min`],
            ["Estimated cost of the slot", failed ? DASH : INR.format(result.costEstimate)],
            ["Invite quality", failed ? DASH : `${result.score}/${result.scoreMax} checks`],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Invite text</h2>
              <button
                type="button"
                onClick={() => copy("body", result.body)}
                aria-label="Copy only the invite body"
                className={GHOST_BTN}
              >
                {copied === "body" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied === "body" ? "Copied!" : "Copy body"}
              </button>
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
              {result.body}
            </pre>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Run sheet</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Time</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                    <th scope="col" className="py-2 text-right font-semibold">Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {result.agenda.map((item, index) => (
                    <tr key={`${item.label}-${index}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="whitespace-nowrap py-2 pr-3 text-[var(--muted-foreground)]">
                        {item.fromLabel}–{item.toLabel}
                      </td>
                      <td className="py-2 pr-3 font-semibold">{item.label}</td>
                      <td className="py-2 text-right">{item.minutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Checks</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.checklist.map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className={
                      item.ok
                        ? "mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full bg-[var(--success)]"
                        : "mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-[var(--border)] bg-[var(--muted)]"
                    }
                  />
                  <span className={item.ok ? "" : "text-[var(--muted-foreground)]"}>
                    {item.label}
                    <span className="sr-only">{item.ok ? " — passed" : " — not met"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The cost figure is a rough estimate from headcount, slot length and the hourly rate you
        type — it is there to make you shorten the list, not to be reported anywhere. Groups above{" "}
        {LARGE_MEETING_THRESHOLD} people usually want a written update instead of a meeting.
      </p>
    </main>
  );
}
