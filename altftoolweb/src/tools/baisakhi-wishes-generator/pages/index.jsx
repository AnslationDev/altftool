"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wheat } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  KHALSA_FOUNDING_YEAR,
  MESSAGES,
  TONES,
  VAISAKHI_POSSIBLE_DAYS,
  buildBaisakhiWish,
  buildBaisakhiWishSet,
  computeVaisakhiDetails,
} from "../lib";

const CURRENT_YEAR = new Date().getFullYear();

const DEFAULTS = {
  tone: "khalsa",
  includeGurmukhi: true,
  includeRoman: true,
  includeEnglish: false,
  includeEmoji: false,
  recipient: "",
  sender: "",
  year: String(CURRENT_YEAR),
  vaisakhiDay: 14,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS = "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]";

export default function BaisakhiWishesGeneratorPage() {
  const [form, setForm] = useState(DEFAULTS);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const wish = useMemo(
    () =>
      buildBaisakhiWish({
        tone: form.tone,
        includeGurmukhi: form.includeGurmukhi,
        includeRoman: form.includeRoman,
        includeEnglish: form.includeEnglish,
        includeEmoji: form.includeEmoji,
        recipient: form.recipient,
        sender: form.sender,
      }),
    [form],
  );

  const details = useMemo(
    () => computeVaisakhiDetails({ year: form.year, vaisakhiDay: form.vaisakhiDay }),
    [form.year, form.vaisakhiDay],
  );

  const allStyles = useMemo(
    () =>
      buildBaisakhiWishSet({
        includeGurmukhi: form.includeGurmukhi,
        includeRoman: form.includeRoman,
        includeEnglish: form.includeEnglish,
        includeEmoji: form.includeEmoji,
        recipient: form.recipient,
        sender: form.sender,
      }),
    [form.includeGurmukhi, form.includeRoman, form.includeEnglish, form.includeEmoji, form.recipient, form.sender],
  );

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const reset = () => setForm(DEFAULTS);

  const wishFailed = Boolean(wish.error);
  const detailsFailed = Boolean(details.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Wheat className="h-4 w-4" aria-hidden="true" />
          Vaisakhi greetings
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Baisakhi Wishes Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compose a Vaisakhi greeting in Gurmukhi, Roman transliteration and English, check how many SMS
          segments it costs to send, and work out this year&apos;s Khalsa Sajna Diwas anniversary.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Greeting details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="baisakhi-tone">
              Greeting style
            </label>
            <select id="baisakhi-tone" className={`mt-2 ${INPUT_CLASS}`} value={form.tone} onChange={set("tone")}>
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="baisakhi-recipient">
              Recipient (optional)
            </label>
            <input
              id="baisakhi-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.recipient}
              onChange={set("recipient")}
              placeholder="e.g. Simran"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="baisakhi-sender">
              From (optional)
            </label>
            <input
              id="baisakhi-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sender}
              onChange={set("sender")}
              placeholder="e.g. Aman"
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-x-6 gap-y-3">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="baisakhi-gurmukhi">
              <input
                id="baisakhi-gurmukhi"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={form.includeGurmukhi}
                onChange={set("includeGurmukhi")}
              />
              Gurmukhi
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="baisakhi-roman">
              <input
                id="baisakhi-roman"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={form.includeRoman}
                onChange={set("includeRoman")}
              />
              Roman transliteration
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="baisakhi-english">
              <input
                id="baisakhi-english"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={form.includeEnglish}
                onChange={set("includeEnglish")}
              />
              English
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="baisakhi-emoji">
              <input
                id="baisakhi-emoji"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={form.includeEmoji}
                onChange={set("includeEmoji")}
              />
              Add wheat &amp; drum emoji
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Greeting
            </p>
            {wishFailed ? (
              <p role="alert" className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                {wish.error}
              </p>
            ) : (
              <p className="mt-2 max-w-prose whitespace-pre-line text-lg leading-7 font-medium text-[var(--foreground)]">
                {wish.text}
              </p>
            )}
          </div>
          {!wishFailed && (
            <button
              type="button"
              onClick={() => copy("wish", wish.text, { label: "Greeting" })}
              aria-label="Copy greeting text"
              className={GHOST_BTN}
            >
              {isCopied("wish") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {isCopied("wish") ? "Copied!" : "Copy text"}
            </button>
          )}
        </div>

        {!wishFailed && (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Characters</dt>
              <dd className="text-right font-semibold">{wish.characters}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Words</dt>
              <dd className="text-right font-semibold">{wish.words}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">SMS encoding</dt>
              <dd className="text-right font-semibold">{wish.sms.encoding}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">SMS segments</dt>
              <dd className="text-right font-semibold">
                {wish.sms.segments} × {wish.sms.perSegment} chars
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Characters left in segment</dt>
              <dd className="text-right font-semibold">{wish.sms.remaining}</dd>
            </div>
          </dl>
        )}

        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Khalsa Sajna Diwas anniversary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="baisakhi-year">
              Year
            </label>
            <input
              id="baisakhi-year"
              type="number"
              min={KHALSA_FOUNDING_YEAR}
              max={2200}
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.year}
              onChange={set("year")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="baisakhi-day">
              Vaisakhi falls on
            </label>
            <select
              id="baisakhi-day"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.vaisakhiDay}
              onChange={set("vaisakhiDay")}
            >
              {VAISAKHI_POSSIBLE_DAYS.map((day) => (
                <option key={day} value={day}>
                  {day} April
                </option>
              ))}
            </select>
          </div>
        </div>

        {detailsFailed ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {details.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Date</dt>
              <dd className="text-right font-semibold">
                {details.weekday}, {form.vaisakhiDay} April {details.year}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Khalsa anniversary</dt>
              <dd className="text-right font-semibold">{details.khalsaAnniversary} years</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Panj Pyare</dt>
              <dd className="text-right font-semibold">{details.panjPyare}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">All four styles</h2>
          <button type="button" onClick={reset} aria-label="Reset greeting details" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
        <ul className="mt-4 space-y-4">
          {allStyles.map((style) => (
            <li key={style.tone} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                {style.toneLabel}
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-6">{style.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Traditional greeting: {MESSAGES.harvest.roman} Sikh salutation: {MESSAGES.khalsa.roman}
      </p>
    </main>
  );
}
