"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Flag, RotateCcw, Shuffle } from "lucide-react";
import {
  FORMATS,
  MAX_COUNT,
  MAX_YEAR,
  MIN_YEAR,
  REPUBLIC_DAY_DATE,
  TONES,
  countWords,
  generateMessages,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

/** Static default so server and client render the same first paint. */
const DEFAULT_YEAR = 2026;

const DEFAULTS = {
  name: "Arjun",
  format: "greeting",
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
        format,
        tone,
        count: Number(count),
        seed,
        hashtags,
      }),
    [name, year, format, tone, count, seed, hashtags],
  );

  const hasError = Boolean(result.error);
  const messages = hasError ? [] : result.messages;
  const avgWords = messages.length
    ? Math.round(messages.reduce((sum, m) => sum + countWords(m), 0) / messages.length)
    : 0;
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
          {REPUBLIC_DAY_DATE}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Republic Day Message Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Greetings, social captions and school speech openers for 26 January — with the correct
          Republic Day number worked out from 1950.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-format">
              What do you need
            </label>
            <select
              id="rd-format"
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
            <label className={LABEL_CLASS} htmlFor="rd-tone">
              Tone
            </label>
            <select
              id="rd-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-name">
              Recipient name (greetings)
            </label>
            <input
              id="rd-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              placeholder="Arjun"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-year">
              Year ({MIN_YEAR}-{MAX_YEAR})
            </label>
            <input
              id="rd-year"
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
            <label className={LABEL_CLASS} htmlFor="rd-count">
              How many (1-{MAX_COUNT})
            </label>
            <input
              id="rd-count"
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
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="rd-hashtags"
            >
              <input
                id="rd-hashtags"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={hashtags}
                onChange={(event) => setHashtags(event.target.checked)}
              />
              Add hashtags
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={() => setSeed((value) => value + 1)}
            aria-label="Shuffle to a different set of Republic Day messages"
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
              Republic Day number
            </p>
            <div aria-live="polite">
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {hasError ? DASH : result.ordinalLabel}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {hasError
                  ? "Fix the options above to generate messages."
                  : `26 January ${result.year} · ${messages.length} message${messages.length === 1 ? "" : "s"} ready`}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={GHOST_BTN}
            onClick={() => copy(allText, "all")}
            aria-label="Copy all generated Republic Day messages"
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
            ["Tone", TONES.find((t) => t.id === tone)?.label ?? DASH],
            ["Messages generated", hasError ? DASH : NUM.format(messages.length)],
            ["Average words per message", hasError ? DASH : NUM.format(avgWords)],
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
            Only {NUM.format(result.available)} distinct wordings exist for this format and tone, so
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
              <p className="text-sm leading-6">{message}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {countWords(message)} words
                </span>
                <button
                  type="button"
                  className={GHOST_BTN}
                  onClick={() => copy(message, `m${index}`)}
                  aria-label={`Copy Republic Day message ${index + 1}`}
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
        Everything runs in your browser from a fixed library of lines. Speech openers are starting
        points — add your own examples before you deliver them.
      </p>
    </main>
  );
}
