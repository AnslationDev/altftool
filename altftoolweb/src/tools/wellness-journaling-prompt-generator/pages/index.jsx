"use client";

import { useMemo, useState } from "react";
import { Check, Copy, NotebookPen, RotateCcw, Shuffle } from "lucide-react";

import {
  DEFAULT_MINUTES_PER_PROMPT,
  EXPRESSIVE_WRITING_MIN_MINUTES,
  MAX_PROMPT_COUNT,
  MIN_PROMPT_COUNT,
  THEMES,
  generateJournalSession,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const DEFAULTS = {
  themeId: "gratitude",
  count: "3",
  minutes: String(DEFAULT_MINUTES_PER_PROMPT),
  seed: 7,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [themeId, setThemeId] = useState(DEFAULTS.themeId);
  const [count, setCount] = useState(DEFAULTS.count);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [copied, setCopied] = useState(false);

  const session = useMemo(
    () =>
      generateJournalSession({
        themeId,
        count: Number(count),
        seed,
        minutesPerPrompt: Number(minutes),
      }),
    [themeId, count, minutes, seed],
  );

  const hasError = Boolean(session.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Journaling session — ${session.themeLabel}`,
      `${session.prompts.length} prompts · about ${session.totalMinutes} minutes`,
      "",
    ];
    session.prompts.forEach((prompt, index) => {
      lines.push(`${index + 1}. ${prompt.text}`);
    });
    return lines.join("\n");
  }, [hasError, session]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setThemeId(DEFAULTS.themeId);
    setCount(DEFAULTS.count);
    setMinutes(DEFAULTS.minutes);
    setSeed(DEFAULTS.seed);
    setCopied(false);
  };

  const redraw = () => {
    setSeed((value) => value + 1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          Mental wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Wellness Journaling Prompt Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a theme, choose how many prompts you want and how long you will write for. Redraw for
          a completely different set whenever a prompt does not land.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wj-theme">
              Theme
            </label>
            <select
              id="wj-theme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={themeId}
              onChange={(event) => {
                setThemeId(event.target.value);
                setCopied(false);
              }}
            >
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
              <option value="mixed">Mixed themes</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wj-count">
              Prompts in this session
            </label>
            <input
              id="wj-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_PROMPT_COUNT}
              max={MAX_PROMPT_COUNT}
              step="1"
              value={count}
              onChange={(event) => {
                setCount(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wj-minutes">
              Minutes per prompt
            </label>
            <input
              id="wj-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              step="1"
              value={minutes}
              onChange={(event) => {
                setMinutes(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={redraw} className={PRIMARY_BTN} aria-label="Draw a new set of prompts">
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            New prompts
          </button>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the generated journaling prompts"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy prompts"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset all options" className={GHOST_BTN}>
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
          {session.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Session length
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {hasError ? DASH : `${NUM.format(session.totalMinutes)} min`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : session.themeBlurb}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Theme", hasError ? DASH : session.themeLabel],
            ["Prompts drawn", hasError ? DASH : `${session.prompts.length} of ${session.poolSize} in the bank`],
            ["Minutes per prompt", hasError ? DASH : `${NUM.format(session.minutesPerPrompt)} min`],
            ["Rough handwritten word target", hasError ? DASH : `${NUM.format(session.wordTarget)} words`],
            [
              `Meets the ${EXPRESSIVE_WRITING_MIN_MINUTES}-minute expressive-writing session`,
              hasError ? DASH : session.meetsExpressiveWritingMinimum ? "Yes" : "Not yet",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompts</h2>
          <ol className="mt-4 space-y-3">
            {session.prompts.map((prompt, index) => (
              <li
                key={prompt.text}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-semibold text-[var(--primary)]">{index + 1}</span>
                  <div>
                    <p className="text-sm leading-6">{prompt.text}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      {prompt.themeLabel}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Journaling is a self-help practice, not treatment. If writing brings up distress that does not
        settle, or if you are dealing with trauma, grief or persistent low mood, please speak to a
        qualified mental health professional.
      </p>
    </main>
  );
}
