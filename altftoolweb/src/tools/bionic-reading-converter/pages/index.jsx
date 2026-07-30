"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw } from "lucide-react";

import {
  FIXATION_LEVELS,
  OPACITY_PRESETS,
  SAMPLE_TEXT,
  WORDS_PER_MINUTE,
  convertToBionic,
} from "../lib";

const DASH = "—";
const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DEFAULTS = {
  text: SAMPLE_TEXT,
  level: 3,
  skipCommon: false,
  minWordLength: "1",
  opacity: 1,
  fontSize: "18",
};

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [level, setLevel] = useState(DEFAULTS.level);
  const [skipCommon, setSkipCommon] = useState(DEFAULTS.skipCommon);
  const [minWordLength, setMinWordLength] = useState(DEFAULTS.minWordLength);
  const [opacity, setOpacity] = useState(DEFAULTS.opacity);
  const [fontSize, setFontSize] = useState(DEFAULTS.fontSize);
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () =>
      convertToBionic({
        text,
        level,
        skipCommonWords: skipCommon,
        minWordLength: Number(minWordLength),
        opacity,
      }),
    [text, level, skipCommon, minWordLength, opacity],
  );

  const hasError = Boolean(result.error);

  const copy = async (what, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setLevel(DEFAULTS.level);
    setSkipCommon(DEFAULTS.skipCommon);
    setMinWordLength(DEFAULTS.minWordLength);
    setOpacity(DEFAULTS.opacity);
    setFontSize(DEFAULTS.fontSize);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Reading aid
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bionic Reading Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Emboldens the opening letters of each word to create artificial fixation points. Set the
          fixation strength, see exactly what proportion of the text gets emphasised, and copy the
          result as HTML or Markdown.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="bionic-text">
          Text to convert
        </label>
        <textarea
          id="bionic-text"
          rows={6}
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bionic-level">
              Fixation strength
            </label>
            <select
              id="bionic-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={String(level)}
              onChange={(e) => setLevel(Number(e.target.value))}
            >
              {FIXATION_LEVELS.map((f) => (
                <option key={f.level} value={String(f.level)}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bionic-opacity">
              Contrast of the rest of the word
            </label>
            <select
              id="bionic-opacity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={String(opacity)}
              onChange={(e) => setOpacity(Number(e.target.value))}
            >
              {OPACITY_PRESETS.map((o) => (
                <option key={o} value={String(o)}>
                  {o === 1 ? "Full strength" : `${Math.round(o * 100)}% opacity`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bionic-min">
              Leave words shorter than (letters) plain
            </label>
            <input
              id="bionic-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={minWordLength}
              onChange={(e) => setMinWordLength(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bionic-size">
              Preview text size (px)
            </label>
            <input
              id="bionic-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="12"
              max="48"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm"
              htmlFor="bionic-skip"
            >
              <input
                id="bionic-skip"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25"
                checked={skipCommon}
                onChange={(e) => setSkipCommon(e.target.checked)}
              />
              Leave common function words (the, and, of…) unemphasised
            </label>
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Letters emphasised
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.boldedPercent)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Add some text to see the conversion."
                : `${NUM0.format(result.wordCount)} words · about ${result.readingLabel} to read at ${WORDS_PER_MINUTE} wpm`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("html", result.html)}
              disabled={hasError}
              aria-label="Copy the converted text as HTML"
              className={GHOST_BTN}
            >
              {copied === "html" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "html" ? "Copied!" : "Copy HTML"}
            </button>
            <button
              type="button"
              onClick={() => copy("md", result.markdown)}
              disabled={hasError}
              aria-label="Copy the converted text as Markdown"
              className={GHOST_BTN}
            >
              {copied === "md" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "md" ? "Copied!" : "Copy Markdown"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Words</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : NUM0.format(result.wordCount)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Letters</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : NUM0.format(result.letterCount)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Letters in bold</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : NUM0.format(result.boldedLetters)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Words left plain</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : NUM0.format(result.skippedWords)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Average word length</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${NUM1.format(result.averageWordLength)} letters`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Fixation ratio</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${NUM0.format(result.ratio * 100)}% of each word`}
            </dd>
          </div>
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Preview</h2>
          <div
            className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-4 leading-relaxed text-[var(--foreground)]"
            style={{ fontSize: `${Math.min(Math.max(Number(fontSize) || 18, 12), 48)}px` }}
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            The preview is rendered from the same escaped HTML the copy button gives you, so what
            you see is what you paste.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Controlled studies of this technique — including Hughes and colleagues in 2023 — have not
        found a reading-speed or comprehension advantage over plain text. Plenty of readers still
        prefer it for keeping their place on a line, which is a matter of preference rather than a
        demonstrated effect. Everything is converted in your browser; no text is uploaded.
      </p>
    </main>
  );
}
