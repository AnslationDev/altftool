"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Moon, RotateCcw, Shuffle } from "lucide-react";
import {
  FORMATS,
  LANGUAGES,
  MAX_COUNT,
  RELATIONSHIPS,
  RITUAL_STEPS,
  TITHI,
  countWords,
  generateMessages,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const DEFAULTS = {
  name: "Neha",
  language: "hi",
  relationship: "wife",
  format: "wish",
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
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [relationship, setRelationship] = useState(DEFAULTS.relationship);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [count, setCount] = useState(String(DEFAULTS.count));
  const [hashtags, setHashtags] = useState(DEFAULTS.hashtags);
  const [seed, setSeed] = useState(1);
  const [copiedKey, setCopiedKey] = useState("");

  const result = useMemo(
    () =>
      generateMessages({
        name,
        language,
        relationship,
        format,
        count: Number(count),
        seed,
        hashtags,
      }),
    [name, language, relationship, format, count, seed, hashtags],
  );

  const hasError = Boolean(result.error);
  const messages = hasError ? [] : result.messages;
  const isCaption = format === "caption";
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
    setLanguage(DEFAULTS.language);
    setRelationship(DEFAULTS.relationship);
    setFormat(DEFAULTS.format);
    setCount(String(DEFAULTS.count));
    setHashtags(DEFAULTS.hashtags);
    setSeed(1);
    setCopiedKey("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Kartik Krishna Chaturthi
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Karwa Chauth Message Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Wishes and captions in Hindi, Punjabi and English for the sargi-to-moonrise fast — written
          for a wife, a husband or anyone else keeping the day.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kc-language">
              Language
            </label>
            <select
              id="kc-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {item.native}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kc-format">
              What do you need
            </label>
            <select
              id="kc-format"
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
            <label className={LABEL_CLASS} htmlFor="kc-relationship">
              Who is it for
            </label>
            <select
              id="kc-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
              disabled={isCaption}
            >
              {RELATIONSHIPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kc-name">
              Recipient name (optional)
            </label>
            <input
              id="kc-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              placeholder="Neha"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kc-count">
              How many (1-{MAX_COUNT})
            </label>
            <input
              id="kc-count"
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
              htmlFor="kc-hashtags"
            >
              <input
                id="kc-hashtags"
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
            aria-label="Shuffle to a different set of Karwa Chauth messages"
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
              Messages ready
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(messages.length)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the options above to generate messages." : TITHI}
            </p>
          </div>
          <button
            type="button"
            className={GHOST_BTN}
            onClick={() => copy(allText, "all")}
            aria-label="Copy all generated Karwa Chauth messages"
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
            ["Language", LANGUAGES.find((l) => l.id === language)?.label ?? DASH],
            ["Format", FORMATS.find((f) => f.id === format)?.label ?? DASH],
            [
              "Written for",
              isCaption
                ? "Anyone"
                : (RELATIONSHIPS.find((r) => r.id === relationship)?.label ?? DASH),
            ],
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
                  aria-label={`Copy Karwa Chauth message ${index + 1}`}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the day runs</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Step
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  When
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What happens
                </th>
              </tr>
            </thead>
            <tbody>
              {RITUAL_STEPS.map((row) => (
                <tr key={row.step} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.step}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.when}</td>
                  <td className="py-2">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Customs vary by family and region, so treat the table as a general guide rather than a rule.
        A long fast without water does not suit everyone — if you are pregnant, unwell, diabetic or
        on medication, speak to a doctor before keeping it.
      </p>
    </main>
  );
}
