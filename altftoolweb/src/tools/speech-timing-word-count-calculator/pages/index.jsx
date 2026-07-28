"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mic, RotateCcw } from "lucide-react";

import {
  DEFAULT_SECONDS_PER_SLIDE,
  PACE_PRESETS,
  countCharacters,
  countWords,
  estimateSpeech,
  formatClock,
  formatDuration,
  paceComparison,
} from "../lib";

const SAMPLE =
  "Welcome everyone. Today I want to explain the idea clearly, show the practical steps, and leave enough room for a short pause after each slide.";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25";
const TEXTAREA_CLASS =
  "min-h-36 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [script, setScript] = useState(SAMPLE);
  const [presetId, setPresetId] = useState("conversational");
  const [customWpm, setCustomWpm] = useState("130");
  const [slides, setSlides] = useState("8");
  const [secondsPerSlide, setSecondsPerSlide] = useState(String(DEFAULT_SECONDS_PER_SLIDE));
  const [extraPauseSeconds, setExtraPauseSeconds] = useState("45");
  const [targetMinutes, setTargetMinutes] = useState("5");
  const [copied, setCopied] = useState(false);

  const words = useMemo(() => countWords(script), [script]);
  const chars = useMemo(() => countCharacters(script), [script]);
  const chosenPreset = PACE_PRESETS.find((preset) => preset.id === presetId) || PACE_PRESETS[2];
  const wpm = presetId === "custom" ? Number(customWpm) : chosenPreset.wpm;
  const result = useMemo(
    () =>
      estimateSpeech({
        words,
        wpm,
        slides,
        secondsPerSlide,
        extraPauseSeconds,
        targetMinutes,
      }),
    [words, wpm, slides, secondsPerSlide, extraPauseSeconds, targetMinutes],
  );
  const comparison = useMemo(
    () => paceComparison({ words, slides, secondsPerSlide, extraPauseSeconds }),
    [words, slides, secondsPerSlide, extraPauseSeconds],
  );

  const reset = () => {
    setScript(SAMPLE);
    setPresetId("conversational");
    setCustomWpm("130");
    setSlides("8");
    setSecondsPerSlide(String(DEFAULT_SECONDS_PER_SLIDE));
    setExtraPauseSeconds("45");
    setTargetMinutes("5");
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Speech timing estimate",
      `Words: ${words}`,
      `Pace: ${wpm} wpm`,
      `Total time: ${formatDuration(result.totalMinutes)} (${formatClock(result.totalMinutes)})`,
      `Speaking only: ${formatDuration(result.speakingMinutes)}`,
      `Slide/pause overhead: ${formatDuration(result.overheadMinutes)}`,
      result.wordBudget !== null ? `Target word budget: ${result.wordBudget}` : "",
      result.wordsToCut ? `Cut about ${result.wordsToCut} words to fit.` : "",
      result.wordsToAdd ? `You can add about ${result.wordsToAdd} words.` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [result, words, wpm]);

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mic className="h-4 w-4" aria-hidden="true" />
          Speech timing
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Speech Timing Calculator
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
          Paste a script or enter a word count estimate, choose a delivery pace, add
          slide and pause overhead, and see whether the talk fits your target time.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className={CARD}>
          <label>
            <span className={LABEL_CLASS}>Script text</span>
            <textarea className={`${TEXTAREA_CLASS} mt-2`} value={script} onChange={(event) => setScript(event.target.value)} />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className={LABEL_CLASS}>Delivery pace</span>
              <select className={`${INPUT_CLASS} mt-2`} value={presetId} onChange={(event) => setPresetId(event.target.value)}>
                {PACE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.label} · {preset.wpm} wpm</option>
                ))}
                <option value="custom">Custom pace</option>
              </select>
            </label>
            <label>
              <span className={LABEL_CLASS}>Custom WPM</span>
              <input className={`${INPUT_CLASS} mt-2`} inputMode="decimal" value={customWpm} onChange={(event) => setCustomWpm(event.target.value)} disabled={presetId !== "custom"} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Slides</span>
              <input className={`${INPUT_CLASS} mt-2`} inputMode="numeric" value={slides} onChange={(event) => setSlides(event.target.value)} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Seconds per slide</span>
              <input className={`${INPUT_CLASS} mt-2`} inputMode="decimal" value={secondsPerSlide} onChange={(event) => setSecondsPerSlide(event.target.value)} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Extra pause seconds</span>
              <input className={`${INPUT_CLASS} mt-2`} inputMode="decimal" value={extraPauseSeconds} onChange={(event) => setExtraPauseSeconds(event.target.value)} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Target minutes</span>
              <input className={`${INPUT_CLASS} mt-2`} inputMode="decimal" value={targetMinutes} onChange={(event) => setTargetMinutes(event.target.value)} />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={BTN} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <aside className={`${CARD} self-start`} data-testid="tool-output">
          {result.error ? (
            <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {result.error}
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Estimated total time
              </p>
              <p className="mt-2 text-5xl font-bold text-[var(--primary)]">
                {formatClock(result.totalMinutes)}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {formatDuration(result.totalMinutes)} at {wpm} words/minute.
              </p>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                  <strong className="text-[var(--foreground)]">{words}</strong> words · {chars} characters
                </div>
                <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                  Speaking {formatDuration(result.speakingMinutes)} · overhead{" "}
                  {formatDuration(result.overheadMinutes)}
                </div>
                {result.wordBudget !== null ? (
                  <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                    Target budget: <strong className="text-[var(--foreground)]">{result.wordBudget}</strong>{" "}
                    words. {result.wordsToCut ? `Cut about ${result.wordsToCut}.` : result.wordsToAdd ? `You can add about ${result.wordsToAdd}.` : "You are on target."}
                  </div>
                ) : null}
              </div>

              {!comparison.error ? (
                <div className="mt-5 overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
                  {comparison.rows.slice(1, 7).map((row) => (
                    <div key={row.id} className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-2 text-xs last:border-b-0">
                      <span className="font-semibold text-[var(--foreground)]">{row.label}</span>
                      <span className="text-[var(--muted-foreground)]">{formatClock(row.totalMinutes)}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <button type="button" className={`${PRIMARY_BTN} mt-5 w-full`} onClick={copySummary}>
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied" : "Copy summary"}
              </button>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
