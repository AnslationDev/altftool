"use client";

import { useMemo, useState } from "react";
import { AlignLeft, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_WORDS_PER_MINUTE,
  MAX_WORDS_PER_BLOCK,
  MIN_WORDS_PER_BLOCK,
  formatClock,
  formatScript,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const SAMPLE = `Welcome back to the show. Today we are looking at how a three person team shipped a product in six weeks without a single all-nighter.

[Beat — let the intro music fall away]

It started, as these things usually do, with one spreadsheet and a very tired founder. By the end of week two they had thrown that spreadsheet away and replaced it with something far simpler: a single question asked every morning.`;

const DEFAULTS = {
  text: SAMPLE,
  maxWordsPerBlock: "35",
  wordsPerMinute: String(DEFAULT_WORDS_PER_MINUTE),
  cuePrefix: "CUE",
};

const PACE_PRESETS = [
  ["Slow / audiobook", 130],
  ["Standard narration", 150],
  ["Conversational", 165],
  ["Fast / promo", 185],
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [maxWordsPerBlock, setMaxWordsPerBlock] = useState(DEFAULTS.maxWordsPerBlock);
  const [wordsPerMinute, setWordsPerMinute] = useState(DEFAULTS.wordsPerMinute);
  const [cuePrefix, setCuePrefix] = useState(DEFAULTS.cuePrefix);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      formatScript({
        text,
        maxWordsPerBlock: toNumber(maxWordsPerBlock),
        wordsPerMinute: toNumber(wordsPerMinute),
        cuePrefix: cuePrefix.trim() || "CUE",
      }),
    [text, maxWordsPerBlock, wordsPerMinute, cuePrefix],
  );

  const ok = !result.error;

  const copyResult = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setMaxWordsPerBlock(DEFAULTS.maxWordsPerBlock);
    setWordsPerMinute(DEFAULTS.wordsPerMinute);
    setCuePrefix(DEFAULTS.cuePrefix);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlignLeft className="h-4 w-4" aria-hidden="true" />
          Narration prep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Voiceover Script Formatter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Break a script into numbered cues that never split a sentence, with word counts and a
          running timecode at your reading pace. Anything in [square brackets] is kept as a
          direction and left out of the word count.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="vsf-text">
          Script
        </label>
        <textarea
          id="vsf-text"
          className={`mt-2 ${AREA_CLASS}`}
          rows={10}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste your narration script here…"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vsf-block">
              Words per cue (max)
            </label>
            <input
              id="vsf-block"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_WORDS_PER_BLOCK}
              max={MAX_WORDS_PER_BLOCK}
              step="1"
              value={maxWordsPerBlock}
              onChange={(event) => setMaxWordsPerBlock(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vsf-wpm">
              Reading pace (words per minute)
            </label>
            <input
              id="vsf-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="80"
              max="260"
              step="5"
              value={wordsPerMinute}
              onChange={(event) => setWordsPerMinute(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vsf-prefix">
              Cue label prefix
            </label>
            <input
              id="vsf-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={12}
              value={cuePrefix}
              onChange={(event) => setCuePrefix(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PACE_PRESETS.map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => setWordsPerMinute(String(value))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label} · {value}
            </button>
          ))}
        </div>
      </section>

      {result.error ? (
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
              Estimated read time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? formatClock(result.totalSeconds) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM.format(result.totalWords)} spoken words at ${NUM.format(result.wordsPerMinute)} wpm`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the formatted cue sheet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy cue sheet"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the script and settings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cues generated", ok ? NUM.format(result.blockCount) : DASH],
            ["Spoken cues", ok ? NUM.format(result.spokenBlockCount) : DASH],
            ["Direction cues", ok ? NUM.format(result.directionCount) : DASH],
            ["Average words per spoken cue", ok ? NUM1.format(result.averageWordsPerBlock) : DASH],
            ["Longest cue", ok ? `${NUM.format(result.longestBlockWords)} words` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cue sheet</h2>
        {ok ? (
          <ol className="mt-4 space-y-3">
            {result.blocks.map((block) => (
              <li
                key={block.cue}
                className={`rounded-md border border-[var(--border)] p-3 ${
                  block.direction ? "bg-[var(--muted)]" : "bg-[var(--background)]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  <span className="text-[var(--primary)]">{block.label}</span>
                  <span>
                    {block.direction
                      ? "not spoken"
                      : `${block.start} · ${NUM.format(block.words)} words · ${block.seconds.toFixed(1)}s`}
                  </span>
                </div>
                <p
                  className={`mt-2 text-sm leading-6 ${
                    block.direction ? "italic text-[var(--muted-foreground)]" : ""
                  }`}
                >
                  {block.text}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timings are an estimate from your words-per-minute setting. Real reads run longer once
        pauses, breaths, retakes and music beds are added, so treat the total as a floor.
      </p>
    </main>
  );
}
