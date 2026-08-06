"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scissors } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  DEFAULT_LINE_LIMIT,
  DEFAULT_LINES_PER_SCREEN,
  MAX_LINE_LIMIT,
  MIN_LINE_LIMIT,
  formatLyrics,
  splitLyrics,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const SAMPLE_LYRICS = `Amazing grace, how sweet the sound
That saved a wretch like me
I once was lost, but now am found
Was blind, but now I see

'Twas grace that taught my heart to fear
And grace my fears relieved
How precious did that grace appear
The hour I first believed`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  text: SAMPLE_LYRICS,
  limit: String(DEFAULT_LINE_LIMIT),
  mergeShort: true,
  keepStanzas: true,
  linesPerScreen: String(DEFAULT_LINES_PER_SCREEN),
};

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [limit, setLimit] = useState(DEFAULTS.limit);
  const [mergeShort, setMergeShort] = useState(DEFAULTS.mergeShort);
  const [keepStanzas, setKeepStanzas] = useState(DEFAULTS.keepStanzas);
  const [linesPerScreen, setLinesPerScreen] = useState(DEFAULTS.linesPerScreen);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const result = useMemo(
    () =>
      splitLyrics({
        text,
        limit: limit.trim() === "" ? Number.NaN : Number(limit),
        mergeShort,
        keepStanzas,
        linesPerScreen: linesPerScreen.trim() === "" ? Number.NaN : Number(linesPerScreen),
      }),
    [text, limit, mergeShort, keepStanzas, linesPerScreen],
  );

  const failed = Boolean(result.error);
  const output = failed ? "" : formatLyrics(result);

  const copyResult = () => {
    if (failed || !output) return;
    copy("lyrics", output, { label: "the split lyrics" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the pasted lyrics and all options back to the example? This cannot be undone.",
      )
    ) {
      return;
    }
    setText(DEFAULTS.text);
    setLimit(DEFAULTS.limit);
    setMergeShort(DEFAULTS.mergeShort);
    setKeepStanzas(DEFAULTS.keepStanzas);
    setLinesPerScreen(DEFAULTS.linesPerScreen);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scissors className="h-4 w-4" aria-hidden="true" />
          Karaoke & subtitles
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Lyric Line Splitter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split pasted lyrics into karaoke-friendly lines with a character-per-line limit, stanza
          breaks and minimum on-screen time.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="lls-text">
          Paste lyrics
        </label>
        <textarea
          id="lls-text"
          className={`mt-2 ${AREA_CLASS}`}
          rows={10}
          spellCheck={false}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste your lyrics here. Leave a blank line between verses or the chorus to mark a stanza break."
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lls-limit">
              Characters per line ({MIN_LINE_LIMIT}-{MAX_LINE_LIMIT})
            </label>
            <input
              id="lls-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_LINE_LIMIT}
              max={MAX_LINE_LIMIT}
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              32 is a typical karaoke width; 42 matches the Netflix subtitle ceiling.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lls-per-screen">
              Lines per screen (1-4)
            </label>
            <input
              id="lls-per-screen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="4"
              value={linesPerScreen}
              onChange={(event) => setLinesPerScreen(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Options</legend>
          <div className="mt-2 grid gap-2">
            <label className="flex min-h-11 items-center gap-3 text-sm" htmlFor="lls-merge">
              <input
                id="lls-merge"
                type="checkbox"
                className={CHECK_CLASS}
                checked={mergeShort}
                onChange={(event) => setMergeShort(event.target.checked)}
              />
              <span>Merge orphan fragments into their neighbour</span>
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm" htmlFor="lls-stanzas">
              <input
                id="lls-stanzas"
                type="checkbox"
                className={CHECK_CLASS}
                checked={keepStanzas}
                onChange={(event) => setKeepStanzas(event.target.checked)}
              />
              <span>Keep verse/chorus stanza breaks</span>
            </label>
          </div>
        </fieldset>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Split lines
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : NUM.format(result.lineCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Paste lyrics above to split them."
                : `${NUM.format(result.stanzaCount)} stanza${result.stanzaCount === 1 ? "" : "s"}, ${NUM.format(result.screens)} screen${result.screens === 1 ? "" : "s"} at ${linesPerScreen || DEFAULT_LINES_PER_SCREEN} line(s) per screen`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the split lyrics"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("lyrics") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("lyrics") ? "Copied!" : "Copy split lyrics"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the splitter to the example lyrics"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl aria-live="polite" aria-atomic="true" className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Longest line", failed ? "—" : `${NUM.format(result.longestLine)} chars`],
            ["Average line length", failed ? "—" : `${DEC.format(result.averageChars)} chars`],
            ["Lines over the limit", failed ? "—" : NUM.format(result.overLimit)],
            ["Total minimum display time", failed ? "—" : `${DEC.format(result.totalSeconds)}s`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed ? (
          <div className="mt-5 space-y-4" aria-live="polite">
            {result.stanzas.map((stanza, stanzaIndex) => (
              <div key={stanzaIndex} className="rounded-lg bg-[var(--surface-soft)] p-3">
                <ol className="space-y-1.5">
                  {stanza.lines.map((line, lineIndex) => (
                    <li
                      key={lineIndex}
                      className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm"
                    >
                      <span
                        className={
                          line.chars > result.limit
                            ? "font-medium text-[var(--danger-text)]"
                            : "font-medium"
                        }
                      >
                        {line.text}
                      </span>
                      <span className="whitespace-nowrap text-xs text-[var(--muted-foreground)]">
                        {line.chars} chars &middot; {DEC.format(line.seconds)}s
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs locally in your browser -- lyrics are never uploaded. Character-per-line and
        timing figures follow the Netflix Timed Text Style Guide and BBC Subtitle Guidelines
        conventions; treat them as a starting point and adjust to taste for your track.
      </p>
    </main>
  );
}
