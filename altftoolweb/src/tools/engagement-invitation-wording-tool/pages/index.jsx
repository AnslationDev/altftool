"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MailOpen, RotateCcw } from "lucide-react";

import { CEREMONIES, HOST_SIDES, LANGUAGES, STYLES, buildInvitation } from "../lib";

const DEFAULTS = {
  ceremony: "roka",
  hostSide: "bride",
  hostNames: "Mr. & Mrs. Sharma",
  brideName: "Ananya",
  groomName: "Kabir",
  date: "2026-12-14",
  time: "19:00",
  venue: "Hotel Taj Palace",
  city: "New Delhi",
  rsvp: "",
  language: "en",
  style: "traditional",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EM_DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(() => buildInvitation(values), [values]);

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MailOpen className="h-4 w-4" aria-hidden="true" />
          Invitation wording
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Engagement Invitation Wording Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in the family names, the date and the venue and get complete roka, sagai, tilak or
          engagement invitation wording — in English, Hindi or Hinglish, ready for a printed card or
          a WhatsApp forward.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-ceremony">
              Ceremony
            </label>
            <select
              id="eg-ceremony"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.ceremony}
              onChange={update("ceremony")}
            >
              {CEREMONIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-side">
              Who is inviting
            </label>
            <select
              id="eg-side"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.hostSide}
              onChange={update("hostSide")}
            >
              {HOST_SIDES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="eg-hosts">
              Inviting family name
            </label>
            <input
              id="eg-hosts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={values.hostNames}
              onChange={update("hostNames")}
              placeholder="Mr. & Mrs. Sharma"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-bride">
              Bride&apos;s name
            </label>
            <input
              id="eg-bride"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={values.brideName}
              onChange={update("brideName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-groom">
              Groom&apos;s name
            </label>
            <input
              id="eg-groom"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={values.groomName}
              onChange={update("groomName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-date">
              Date
            </label>
            <input
              id="eg-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={values.date}
              onChange={update("date")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-time">
              Start time
            </label>
            <input
              id="eg-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={values.time}
              onChange={update("time")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-venue">
              Venue
            </label>
            <input
              id="eg-venue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={values.venue}
              onChange={update("venue")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-city">
              City (optional)
            </label>
            <input
              id="eg-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={values.city}
              onChange={update("city")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-language">
              Language
            </label>
            <select
              id="eg-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.language}
              onChange={update("language")}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-style">
              Wording style
            </label>
            <select
              id="eg-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.style}
              onChange={update("style")}
            >
              {STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="eg-rsvp">
              RSVP contact (optional)
            </label>
            <input
              id="eg-rsvp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={values.rsvp}
              onChange={update("rsvp")}
              placeholder="+91 98100 00000"
            />
          </div>
        </div>

        <div className="mt-4">
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset all inputs">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Ceremony day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? EM_DASH : result.weekdayName}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? "Fix the input to see the invitation" : result.dateText}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the invitation wording"
            className={PRIMARY_BTN}
            disabled={Boolean(result.error)}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy wording"}
          </button>
        </div>

        {result.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : (
          <>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Ceremony", result.ceremonyName],
                ["Date on the card", result.dateText],
                ["Time on the card", result.timeText],
                ["Lines of wording", NUM.format(result.lineCount)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p lang={result.lang} className="whitespace-pre-line text-base leading-8">
                {result.text}
              </p>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The date shown is the Gregorian calendar date and weekday. If your family follows a panchang
        muhurat, confirm the tithi and the auspicious window with your priest before printing.
      </p>
    </main>
  );
}
