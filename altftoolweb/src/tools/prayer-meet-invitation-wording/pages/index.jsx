"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flower2, RotateCcw, Shuffle } from "lucide-react";

import {
  buildPrayerMeetInvitations,
  HONORIFICS,
  LANGUAGES,
  MAX_VARIANTS,
  OCCASIONS,
  observanceDate,
  TONES,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  deceasedName: "Mohan Lal Sharma",
  honorific: "shri",
  occasion: "tehravin",
  tone: "solemn",
  language: "en",
  passingISO: "2026-03-01",
  eventISO: "2026-03-13",
  time: "11:00",
  venue: "Community Hall, Sector 21, Noida",
  familyName: "The Sharma Family",
  contact: "Rakesh 98100 22334",
  count: 3,
};

const DASH = "—";

export default function ToolHome() {
  const [deceasedName, setDeceasedName] = useState(DEFAULTS.deceasedName);
  const [honorific, setHonorific] = useState(DEFAULTS.honorific);
  const [occasion, setOccasion] = useState(DEFAULTS.occasion);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [passingISO, setPassingISO] = useState(DEFAULTS.passingISO);
  const [eventISO, setEventISO] = useState(DEFAULTS.eventISO);
  const [time, setTime] = useState(DEFAULTS.time);
  const [venue, setVenue] = useState(DEFAULTS.venue);
  const [familyName, setFamilyName] = useState(DEFAULTS.familyName);
  const [contact, setContact] = useState(DEFAULTS.contact);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(1);
  const [copiedId, setCopiedId] = useState(0);

  const suggestion = useMemo(
    () => observanceDate(passingISO, occasion),
    [passingISO, occasion],
  );

  const result = useMemo(
    () =>
      buildPrayerMeetInvitations({
        deceasedName,
        honorific,
        occasion,
        tone,
        language,
        passingISO,
        eventISO,
        time,
        venue,
        familyName,
        contact,
        seed,
        count,
      }),
    [
      deceasedName,
      honorific,
      occasion,
      tone,
      language,
      passingISO,
      eventISO,
      time,
      venue,
      familyName,
      contact,
      seed,
      count,
    ],
  );

  const hasError = Boolean(result.error);
  const variants = hasError ? [] : result.variants;
  const lead = variants[0];

  const copyText = async (text, id) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(0), 1500);
    } catch {
      setCopiedId(0);
    }
  };

  const reset = () => {
    setDeceasedName(DEFAULTS.deceasedName);
    setHonorific(DEFAULTS.honorific);
    setOccasion(DEFAULTS.occasion);
    setTone(DEFAULTS.tone);
    setLanguage(DEFAULTS.language);
    setPassingISO(DEFAULTS.passingISO);
    setEventISO(DEFAULTS.eventISO);
    setTime(DEFAULTS.time);
    setVenue(DEFAULTS.venue);
    setFamilyName(DEFAULTS.familyName);
    setContact(DEFAULTS.contact);
    setCount(DEFAULTS.count);
    setSeed(1);
    setCopiedId(0);
  };

  const occasionNote = OCCASIONS.find((item) => item.id === occasion)?.note ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flower2 className="h-4 w-4" aria-hidden="true" />
          Memorial notice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Prayer Meet Invitation Wording
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the date of passing and the observance, and the correct calendar day is worked out
          for you — counting the day of passing as day one, the way most Indian families count.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pmi-name">
              Name of the departed
            </label>
            <input
              id="pmi-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={deceasedName}
              onChange={(event) => setDeceasedName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmi-honorific">
              Honorific
            </label>
            <select
              id="pmi-honorific"
              className={`mt-2 ${INPUT_CLASS}`}
              value={honorific}
              onChange={(event) => setHonorific(event.target.value)}
            >
              {HONORIFICS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmi-occasion">
              Observance
            </label>
            <select
              id="pmi-occasion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
            >
              {OCCASIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {occasionNote ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{occasionNote}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmi-language">
              Language
            </label>
            <select
              id="pmi-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmi-passing">
              Date of passing
            </label>
            <input
              id="pmi-passing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={passingISO}
              onChange={(event) => setPassingISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmi-event">
              Date of the gathering
            </label>
            <input
              id="pmi-event"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={eventISO}
              onChange={(event) => setEventISO(event.target.value)}
            />
            {suggestion.iso ? (
              <button
                type="button"
                onClick={() => setEventISO(suggestion.iso)}
                className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--primary)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                Use suggested date {suggestion.iso}
              </button>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmi-time">
              Start time
            </label>
            <input
              id="pmi-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmi-contact">
              Contact (optional)
            </label>
            <input
              id="pmi-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pmi-venue">
              Venue / address
            </label>
            <input
              id="pmi-venue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={venue}
              onChange={(event) => setVenue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmi-family">
              Family name (optional)
            </label>
            <input
              id="pmi-family"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={familyName}
              onChange={(event) => setFamilyName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmi-count">
              Wording options
            </label>
            <input
              id="pmi-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_VARIANTS}
              step="1"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className={LABEL_CLASS}>Tone</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TONES.map((item) => {
              const active = item.id === tone;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTone(item.id)}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
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
              Days after the passing
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || result.daysFromPassing == null
                ? DASH
                : NUM.format(result.daysFromPassing)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fill in the highlighted field to see the wording."
                : `${result.occasion} · ${result.eventDateText} · ${result.eventTimeText}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSeed((value) => value + 1)}
              aria-label="Shuffle to different wording"
              className={GHOST_BTN}
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Shuffle
            </button>
            <button
              type="button"
              onClick={() => copyText(lead?.text, 1)}
              aria-label="Copy the first invitation wording"
              className={PRIMARY_BTN}
              disabled={hasError}
            >
              {copiedId === 1 ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === 1 ? "Copied!" : "Copy"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Observance day number",
              hasError || result.dayNumber == null ? DASH : `Day ${NUM.format(result.dayNumber)}`,
            ],
            ["Suggested date for this observance", suggestion.iso ?? DASH],
            ["Date on the invitation", hasError ? DASH : result.eventDateText],
            ["Name as printed", hasError ? DASH : result.fullName],
            ["Characters in option 1", hasError ? DASH : NUM.format(lead.chars)],
            ["Wording options generated", hasError ? DASH : NUM.format(variants.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          {variants.map((variant) => (
            <article
              key={variant.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">
                  Option {variant.id}
                </h2>
                <button
                  type="button"
                  onClick={() => copyText(variant.text, 100 + variant.id)}
                  aria-label={`Copy invitation option ${variant.id}`}
                  className={GHOST_BTN}
                >
                  {copiedId === 100 + variant.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === 100 + variant.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-7">
                {variant.text}
              </p>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                {NUM.format(variant.chars)} characters · {NUM.format(variant.words)} words
              </p>
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The suggested date follows the common counting rule. Communities differ, and many families
        fix the day with their priest or granthi — treat the suggestion as a starting point.
      </p>
    </main>
  );
}
