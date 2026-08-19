"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RotateCcw, Scissors } from "lucide-react";

import {
  INVITE_STYLES,
  RITUAL_STEPS,
  assessCeremony,
  buildInvitation,
  formatDuration,
  formatLongDate,
  formatMinutes,
} from "../lib";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_DURATIONS = RITUAL_STEPS.reduce(
  (acc, step) => ({ ...acc, [step.id]: String(step.minutes) }),
  {},
);

const DEFAULTS = {
  childName: "Aarav",
  parentNames: "Rohit and Priya Menon",
  grandparentNames: "Shri Mohan Menon and Smt. Lata Menon",
  dob: "2023-08-15",
  ceremonyDate: "2026-08-19",
  muhuratTime: "10:45",
  venueName: "Shri Ram Mandir Sabhagriha",
  venueAddress: "Baner Road, Pune, Maharashtra 411045",
  inviteDate: "2026-07-29",
  rsvpLeadDays: "7",
  rsvpName: "Priya Menon",
  rsvpPhone: "98xxxxxx21",
  style: "english-formal",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [copied, setCopied] = useState("");
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const setDuration = (id) => (event) =>
    setDurations((prev) => ({ ...prev, [id]: event.target.value }));

  const assessment = useMemo(
    () =>
      assessCeremony({
        dobISO: form.dob,
        ceremonyISO: form.ceremonyDate,
        inviteDateISO: form.inviteDate,
        muhuratTime: form.muhuratTime,
        rsvpLeadDays: form.rsvpLeadDays,
        durations,
      }),
    [form.dob, form.ceremonyDate, form.inviteDate, form.muhuratTime, form.rsvpLeadDays, durations],
  );

  const invitation = useMemo(
    () =>
      buildInvitation({
        style: form.style,
        childName: form.childName,
        parentNames: form.parentNames,
        grandparentNames: form.grandparentNames,
        venueName: form.venueName,
        venueAddress: form.venueAddress,
        ceremonyISO: form.ceremonyDate,
        rsvpName: form.rsvpName,
        rsvpPhone: form.rsvpPhone,
        assessment,
      }),
    [form, assessment],
  );

  const error = assessment.error || invitation.error || "";
  const programme = assessment.error ? null : assessment.programme;

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    if (!window.confirm("Reset all fields? This will clear the child's name, dates, venue, RSVP details and any custom durations you've entered.")) {
      return;
    }
    setForm(DEFAULTS);
    setDurations(DEFAULT_DURATIONS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scissors className="h-4 w-4" aria-hidden="true" />
          Invitation wording
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Mundan Ceremony Invitation Wording
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type in the muhurat your priest gave you and the tool works the whole programme backwards
          from it — the arrival time is the muhurat minus every step that comes before the first
          lock of hair. It also gives the child&apos;s exact age on the ceremony day, and writes the
          invitation in four styles.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The child and the day</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="mn-child">
              Child&apos;s name
            </label>
            <input id="mn-child" className={INPUT} value={form.childName} onChange={set("childName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mn-dob">
              Child&apos;s date of birth
            </label>
            <input id="mn-dob" className={INPUT} type="date" value={form.dob} onChange={set("dob")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mn-ceremony">
              Ceremony date
            </label>
            <input
              id="mn-ceremony"
              className={INPUT}
              type="date"
              value={form.ceremonyDate}
              onChange={set("ceremonyDate")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="mn-muhurat">
              Mundan muhurat (24-hour time)
            </label>
            <input
              id="mn-muhurat"
              className={INPUT}
              type="time"
              value={form.muhuratTime}
              onChange={set("muhuratTime")}
            />
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Age on the ceremony day
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {error ? DASH : assessment.ageText}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the fields above."
                : `${assessment.age.totalDays.toLocaleString("en-IN")} days old on ${assessment.weekday}, ${assessment.ceremonyLong}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Ceremony falls on", error ? DASH : `${assessment.weekday}, ${assessment.ceremonyLong}`],
            ["Please be seated by", error ? DASH : formatMinutes(programme.arrivalMinutes)],
            ["Mundan muhurat", error ? DASH : formatMinutes(programme.muhuratMinutes)],
            ["Gathering ends about", error ? DASH : formatMinutes(programme.endMinutes)],
            ["Total length of the function", error ? DASH : formatDuration(programme.totalMinutes)],
            [
              "Days between the invite date and the ceremony",
              error || assessment.daysUntil === null
                ? DASH
                : assessment.daysUntil >= 0
                  ? `${assessment.daysUntil} days`
                  : `${Math.abs(assessment.daysUntil)} days ago`,
            ],
            [
              "Ask guests to confirm by",
              error || !assessment.rsvpByISO ? DASH : formatLongDate(assessment.rsvpByISO),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && assessment.notes.length ? (
          <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-xs leading-5 text-[var(--muted-foreground)]">
            <p className="font-semibold text-[var(--foreground)]">On the timing</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {assessment.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Programme, worked back from the muhurat</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Change any length in minutes and every other time moves with it. The mundan step is
              pinned to the muhurat.
            </p>
          </div>
          <button
            type="button"
            className={GHOST_BTN}
            aria-label="Copy the ceremony programme"
            onClick={() =>
              copy(
                error ? "" : programme.rows.map((row) => `${row.start} — ${row.label}`).join("\n"),
                "programme",
              )
            }
          >
            {copied === "programme" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "programme" ? "Copied!" : "Copy programme"}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Time
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Step
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Minutes
                </th>
              </tr>
            </thead>
            <tbody>
              {RITUAL_STEPS.map((step, index) => {
                const row = programme ? programme.rows[index] : null;
                return (
                  <tr key={step.id} className="border-b border-[var(--border)] align-middle">
                    <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                      {row ? `${row.start} – ${row.end}` : DASH}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={step.anchor ? "font-semibold text-[var(--primary)]" : ""}>
                        {step.label}
                      </span>
                      {step.anchor ? (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-[var(--primary)]">
                          muhurat
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2">
                      <label className="sr-only" htmlFor={`mn-dur-${step.id}`}>
                        Minutes for {step.label}
                      </label>
                      <input
                        id={`mn-dur-${step.id}`}
                        className="h-11 w-20 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                        type="number"
                        min="0"
                        max="480"
                        step="5"
                        value={durations[step.id]}
                        onChange={setDuration(step.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Family, venue and RSVP</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="mn-parents">
              Parents&apos; names
            </label>
            <input id="mn-parents" className={INPUT} value={form.parentNames} onChange={set("parentNames")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mn-grandparents">
              Grandparents (optional)
            </label>
            <input
              id="mn-grandparents"
              className={INPUT}
              value={form.grandparentNames}
              onChange={set("grandparentNames")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="mn-venue">
              Venue name
            </label>
            <input id="mn-venue" className={INPUT} value={form.venueName} onChange={set("venueName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mn-invite-date">
              Date you are sending the invitation
            </label>
            <input
              id="mn-invite-date"
              className={INPUT}
              type="date"
              value={form.inviteDate}
              onChange={set("inviteDate")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="mn-rsvp-name">
              RSVP contact name
            </label>
            <input id="mn-rsvp-name" className={INPUT} value={form.rsvpName} onChange={set("rsvpName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mn-rsvp-phone">
              RSVP phone
            </label>
            <input id="mn-rsvp-phone" className={INPUT} value={form.rsvpPhone} onChange={set("rsvpPhone")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="mn-rsvp-lead">
              Ask guests to confirm this many days before
            </label>
            <input
              id="mn-rsvp-lead"
              className={INPUT}
              type="number"
              min="0"
              max="90"
              value={form.rsvpLeadDays}
              onChange={set("rsvpLeadDays")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="mn-style">
              Invitation style
            </label>
            <select id="mn-style" className={INPUT} value={form.style} onChange={set("style")}>
              {INVITE_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="mn-venue-address">
              Venue address
            </label>
            <textarea
              id="mn-venue-address"
              rows={2}
              className={AREA}
              value={form.venueAddress}
              onChange={set("venueAddress")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your invitation wording</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the mundan ceremony invitation"
            onClick={() => copy(invitation.error ? "" : invitation.body, "invite")}
          >
            {copied === "invite" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "invite" ? "Copied!" : "Copy invitation"}
          </button>
        </div>
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              {invitation.wordCount} words · {invitation.characterCount} characters
              {form.style === "whatsapp" ? " · sized for a message, not a card" : ""}
            </p>
            <pre className="mt-3 max-h-[30rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {invitation.body}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This tool does not calculate a muhurat and does not read a panchang — it takes the time your
        family priest gave you and builds the day around it. The notes about odd running years and
        the birth month are family customs, not rules, and they differ from community to community.
        Everything runs in your browser; nothing you type is sent anywhere.
      </p>
    </main>
  );
}
