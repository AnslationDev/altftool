"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Flag, RotateCcw, Shuffle } from "lucide-react";
import {
  FORMATS,
  INDEPENDENCE_DAY_DATE,
  LANGUAGES,
  MAX_COUNT,
  MAX_YEAR,
  MIN_YEAR,
  TONES,
  countWords,
  generateMessages,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

/** Static default so the server and the client agree on the first paint. */
const DEFAULT_YEAR = 2026;

const DEFAULTS = {
  name: "Riya",
  language: "en",
  format: "wish",
  tone: "patriotic",
  count: 3,
  hashtags: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [year, setYear] = useState(String(DEFAULT_YEAR));
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [count, setCount] = useState(String(DEFAULTS.count));
  const [hashtags, setHashtags] = useState(DEFAULTS.hashtags);
  const [seed, setSeed] = useState(1);
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  const result = useMemo(
    () =>
      generateMessages({
        name,
        year: Number(year),
        language,
        format,
        tone,
        count: Number(count),
        seed,
        hashtags,
      }),
    [name, year, language, format, tone, count, seed, hashtags],
  );

  const hasError = Boolean(result.error);
  const messages = hasError ? [] : result.messages;
  const isSlogan = format === "slogan";
  const allText = messages.join("\n\n");

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
  };

  const reset = () => {
    setName(DEFAULTS.name);
    setYear(String(new Date().getFullYear()));
    setLanguage(DEFAULTS.language);
    setFormat(DEFAULTS.format);
    setTone(DEFAULTS.tone);
    setCount(String(DEFAULTS.count));
    setHashtags(DEFAULTS.hashtags);
    setSeed(1);
    setCopiedKey("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flag className="h-4 w-4" aria-hidden="true" />
          {INDEPENDENCE_DAY_DATE}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Independence Day Message Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Wishes and captions for 15 August in eleven Indian languages, plus freedom-movement
          slogans with their meaning and source. The Independence Day number is counted from 1947.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="id-format">
              What do you need
            </label>
            <select
              id="id-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-language">
              Language
            </label>
            <select
              id="id-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              disabled={isSlogan}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {item.native}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-name">
              Recipient name
            </label>
            <input
              id="id-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              placeholder="Riya"
              onChange={(event) => setName(event.target.value)}
              disabled={isSlogan}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-tone">
              Tone
            </label>
            <select
              id="id-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              disabled={isSlogan}
            >
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-year">
              Year ({MIN_YEAR}-{MAX_YEAR})
            </label>
            <input
              id="id-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_YEAR}
              max={MAX_YEAR}
              step="1"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="id-count">
              How many (1-{MAX_COUNT})
            </label>
            <input
              id="id-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_COUNT}
              step="1"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <div className="flex items-end sm:col-span-2">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="id-hashtags"
            >
              <input
                id="id-hashtags"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={hashtags}
                onChange={(event) => setHashtags(event.target.checked)}
              />
              Add hashtags
            </label>
          </div>
        </div>

        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          {isSlogan
            ? "Slogan cards give the original phrase, its meaning and who it is attributed to."
            : "The greeting and sign-off use the language you pick; the supporting line stays in English so the message works in mixed groups."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={() => setSeed((value) => value + 1)}
            aria-label="Shuffle to a different set of Independence Day messages"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Shuffle wording
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all options">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Independence Day number
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.ordinalLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the options above to generate messages."
                : `15 August ${result.year} · ${result.yearsCompleted} years of independence completed`}
            </p>
          </div>
          <button
            type="button"
            className={GHOST_BTN}
            onClick={() => copy(allText, "all")}
            aria-label="Copy all generated Independence Day messages"
            disabled={hasError}
          >
            {copiedKey === "all" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedKey === "all" ? "Copied!" : "Copy all"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Format", FORMATS.find((f) => f.id === format)?.label ?? DASH],
            [
              "Language",
              isSlogan ? "English" : (LANGUAGES.find((l) => l.id === language)?.label ?? DASH),
            ],
            ["Tone", isSlogan ? "Historical" : (TONES.find((t) => t.id === tone)?.label ?? DASH)],
            ["Messages generated", hasError ? DASH : NUM.format(messages.length)],
            ["Distinct wordings available", hasError ? DASH : NUM.format(result.available)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.truncated && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            Only {NUM.format(result.available)} distinct wordings exist for this combination, so
            fewer messages were returned than you asked for.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 grid gap-3">
          {messages.map((message, index) => (
            <article
              key={message}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
            >
              <p className="text-sm leading-7">{message}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {countWords(message)} words
                </span>
                <button
                  type="button"
                  className={GHOST_BTN}
                  onClick={() => copy(message, `m${index}`)}
                  aria-label={`Copy Independence Day message ${index + 1}`}
                >
                  {copiedKey === `m${index}` ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedKey === `m${index}` ? "Copied!" : "Copy"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs in your browser. Slogans are quoted with their source. Check how a name
        renders in the chosen script before you send the message.
      </p>
    </main>
  );
}
