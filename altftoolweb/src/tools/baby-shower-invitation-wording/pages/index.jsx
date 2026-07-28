"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw, Shuffle } from "lucide-react";

import {
  buildInvitations,
  CEREMONIES,
  LANGUAGES,
  MAX_VARIANTS,
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
  honoree: "Ananya",
  hosts: "The Sharma Family",
  ceremony: "godh-bharai",
  tone: "warm",
  language: "en",
  dateISO: "2026-10-11",
  time: "11:30",
  venue: "12 Sunrise Apartments, Baner, Pune",
  rsvp: "Meera - 98200 11223",
  note: "No gifts please, only blessings.",
  count: 3,
};

const DASH = "—";

export default function ToolHome() {
  const [honoree, setHonoree] = useState(DEFAULTS.honoree);
  const [hosts, setHosts] = useState(DEFAULTS.hosts);
  const [ceremony, setCeremony] = useState(DEFAULTS.ceremony);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [dateISO, setDateISO] = useState(DEFAULTS.dateISO);
  const [time, setTime] = useState(DEFAULTS.time);
  const [venue, setVenue] = useState(DEFAULTS.venue);
  const [rsvp, setRsvp] = useState(DEFAULTS.rsvp);
  const [note, setNote] = useState(DEFAULTS.note);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(1);
  const [copiedId, setCopiedId] = useState(0);

  const result = useMemo(
    () =>
      buildInvitations({
        honoree,
        hosts,
        ceremony,
        tone,
        language,
        dateISO,
        time,
        venue,
        rsvp,
        note,
        seed,
        count,
      }),
    [honoree, hosts, ceremony, tone, language, dateISO, time, venue, rsvp, note, seed, count],
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
    setHonoree(DEFAULTS.honoree);
    setHosts(DEFAULTS.hosts);
    setCeremony(DEFAULTS.ceremony);
    setTone(DEFAULTS.tone);
    setLanguage(DEFAULTS.language);
    setDateISO(DEFAULTS.dateISO);
    setTime(DEFAULTS.time);
    setVenue(DEFAULTS.venue);
    setRsvp(DEFAULTS.rsvp);
    setNote(DEFAULTS.note);
    setCount(DEFAULTS.count);
    setSeed(1);
    setCopiedId(0);
  };

  const ceremonyNote = CEREMONIES.find((item) => item.id === ceremony)?.note ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Invitation wording
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Baby Shower Invitation Wording
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in the names, date and venue and get ready-to-send godh bharai, valaikappu, seemantham
          or baby shower wording in seven languages, with the date written out in full.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bsw-honoree">
              Mother-to-be / couple
            </label>
            <input
              id="bsw-honoree"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={honoree}
              onChange={(event) => setHonoree(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bsw-hosts">
              Hosted by (optional)
            </label>
            <input
              id="bsw-hosts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={hosts}
              onChange={(event) => setHosts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bsw-ceremony">
              Ceremony
            </label>
            <select
              id="bsw-ceremony"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ceremony}
              onChange={(event) => setCeremony(event.target.value)}
            >
              {CEREMONIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {ceremonyNote ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{ceremonyNote}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bsw-language">
              Language
            </label>
            <select
              id="bsw-language"
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
            <label className={LABEL_CLASS} htmlFor="bsw-date">
              Date
            </label>
            <input
              id="bsw-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dateISO}
              onChange={(event) => setDateISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bsw-time">
              Start time
            </label>
            <input
              id="bsw-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bsw-venue">
              Venue / address
            </label>
            <input
              id="bsw-venue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={venue}
              onChange={(event) => setVenue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bsw-rsvp">
              RSVP contact (optional)
            </label>
            <input
              id="bsw-rsvp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={rsvp}
              onChange={(event) => setRsvp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bsw-note">
              Extra line (optional)
            </label>
            <input
              id="bsw-note"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bsw-count">
              Wording options
            </label>
            <input
              id="bsw-count"
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
              Characters in option 1
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(lead.stats.chars)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted field to see the wording."
                : `${result.ceremony} · ${result.dateText} · ${result.timeText}`}
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
            ["Words in option 1", hasError ? DASH : NUM.format(lead.stats.words)],
            ["Lines in option 1", hasError ? DASH : NUM.format(lead.stats.lines)],
            ["SMS encoding", hasError ? DASH : lead.stats.encoding],
            ["SMS parts if sent as a text", hasError ? DASH : NUM.format(lead.stats.smsParts)],
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
                {NUM.format(variant.stats.chars)} characters · {NUM.format(variant.stats.words)} words
              </p>
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Ritual names and customs vary by community and region — check the ceremony name and the
        honorifics with an elder in the family before printing the cards.
      </p>
    </main>
  );
}
