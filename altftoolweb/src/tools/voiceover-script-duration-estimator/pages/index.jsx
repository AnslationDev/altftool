"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mic, RotateCcw } from "lucide-react";

import {
  PACE_PRESETS,
  SPOT_LENGTHS,
  estimateDuration,
  fitToTarget,
  formatDuration,
  targetToSeconds,
  wordsForDuration,
} from "../lib";

const SAMPLE = `Some mornings the studio is quiet enough to hear the room itself.
You settle in, level the gain, and read the first line again.

The script does the rest, one sentence at a time, until the timer agrees with you.`;

const DEFAULTS = {
  mode: "script",
  text: SAMPLE,
  wordCount: "450",
  paceId: "explainer",
  wpm: "145",
  includePauses: true,
  targetMinutes: "0",
  targetSeconds: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [text, setText] = useState(DEFAULTS.text);
  const [wordCount, setWordCount] = useState(DEFAULTS.wordCount);
  const [wpm, setWpm] = useState(DEFAULTS.wpm);
  const [paceId, setPaceId] = useState(DEFAULTS.paceId);
  const [includePauses, setIncludePauses] = useState(DEFAULTS.includePauses);
  const [targetMinutes, setTargetMinutes] = useState(DEFAULTS.targetMinutes);
  const [targetSecondsValue, setTargetSecondsValue] = useState(DEFAULTS.targetSeconds);
  const [copied, setCopied] = useState(false);

  const estimate = useMemo(
    () =>
      estimateDuration(
        mode === "script"
          ? { text, wpm, includePauses }
          : { wordCount, wpm, includePauses: false },
      ),
    [mode, text, wordCount, wpm, includePauses],
  );

  const target = useMemo(
    () => targetToSeconds(targetMinutes, targetSecondsValue),
    [targetMinutes, targetSecondsValue],
  );

  const fit = useMemo(() => {
    if (estimate.error || target.error) return { error: estimate.error || target.error };
    return fitToTarget(estimate, target.seconds);
  }, [estimate, target]);

  const spotTable = useMemo(
    () => SPOT_LENGTHS.map((seconds) => ({ seconds, result: wordsForDuration(seconds, wpm) })),
    [wpm],
  );

  const ok = !estimate.error;
  const dash = "—";

  const applyPreset = (id) => {
    const preset = PACE_PRESETS.find((item) => item.id === id);
    setPaceId(id);
    if (preset) setWpm(String(preset.wpm));
    setCopied(false);
  };

  const copyResult = async () => {
    if (!ok) return;
    const lines = [
      "Voiceover duration estimate",
      `Words: ${estimate.words}`,
      `Pace: ${estimate.wpm} wpm`,
      `Reading time: ${formatDuration(estimate.readSeconds)}`,
      `Pause time: ${estimate.pauseSeconds}s`,
      `Estimated runtime: ${estimate.formatted} (${estimate.totalSeconds}s)`,
    ];
    if (!fit.error) {
      lines.push(
        `Target: ${fit.targetFormatted}`,
        `Difference: ${fit.differenceSeconds}s ${fit.over ? "over" : "under"}`,
      );
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setText(DEFAULTS.text);
    setWordCount(DEFAULTS.wordCount);
    setWpm(DEFAULTS.wpm);
    setPaceId(DEFAULTS.paceId);
    setIncludePauses(DEFAULTS.includePauses);
    setTargetMinutes(DEFAULTS.targetMinutes);
    setTargetSecondsValue(DEFAULTS.targetSeconds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mic className="h-4 w-4" aria-hidden="true" />
          Voiceover timing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Voiceover Script Duration Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Runtime is reading time plus pause time. Paste a script or enter a word count, pick a
          delivery pace, and see how far you are from the length you need.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("script")}
            aria-pressed={mode === "script"}
            className={mode === "script" ? PRIMARY_BTN : CHIP_BTN}
          >
            Paste a script
          </button>
          <button
            type="button"
            onClick={() => setMode("count")}
            aria-pressed={mode === "count"}
            className={mode === "count" ? PRIMARY_BTN : CHIP_BTN}
          >
            Enter a word count
          </button>
        </div>

        {mode === "script" ? (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="vo-text">
              Script
            </label>
            <textarea
              id="vo-text"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={8}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <label
              htmlFor="vo-pauses"
              className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            >
              <input
                id="vo-pauses"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={includePauses}
                onChange={() => setIncludePauses((value) => !value)}
              />
              <span>Add pause time for punctuation and paragraph breaks</span>
            </label>
          </div>
        ) : (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="vo-words">
              Word count
            </label>
            <input
              id="vo-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={wordCount}
              onChange={(event) => setWordCount(event.target.value)}
            />
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-preset">
              Delivery style
            </label>
            <select
              id="vo-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paceId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {PACE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} — {preset.wpm} wpm
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-wpm">
              Pace (words per minute)
            </label>
            <input
              id="vo-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="60"
              max="260"
              step="5"
              value={wpm}
              onChange={(event) => setWpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-target-min">
              Target minutes
            </label>
            <input
              id="vo-target-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={targetMinutes}
              onChange={(event) => setTargetMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-target-sec">
              Target seconds
            </label>
            <input
              id="vo-target-sec"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={targetSecondsValue}
              onChange={(event) => setTargetSecondsValue(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SPOT_LENGTHS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              className={CHIP_BTN}
              onClick={() => {
                setTargetMinutes("0");
                setTargetSecondsValue(String(seconds));
              }}
            >
              {seconds}s spot
            </button>
          ))}
        </div>
      </section>

      {estimate.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {estimate.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated runtime
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? estimate.formatted : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM.format(estimate.words)} words at ${estimate.wpm} wpm`
                : "Fix the input above to see a runtime"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the duration estimate"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy estimate"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the estimator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total seconds", ok ? `${estimate.totalSeconds}s` : dash],
            ["Reading time", ok ? `${estimate.readSeconds}s` : dash],
            ["Pause time", ok ? `${estimate.pauseSeconds}s` : dash],
            [
              "Sentences / commas / paragraphs",
              ok
                ? `${estimate.pauses.sentences} / ${estimate.pauses.commas} / ${estimate.pauses.paragraphs}`
                : dash,
            ],
            ["Effective pace with pauses", ok ? `${estimate.effectiveWpm} wpm` : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Fit to a target length</h2>
        {fit.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {fit.error}
          </p>
        ) : (
          <>
            <p
              className={`mt-3 text-lg font-semibold ${
                fit.withinHalfSecond
                  ? "text-[var(--success)]"
                  : fit.over
                    ? "text-[var(--danger)]"
                    : "text-[var(--foreground)]"
              }`}
            >
              {fit.withinHalfSecond
                ? `On target at ${fit.targetFormatted}`
                : fit.over
                  ? `${fit.differenceSeconds}s over ${fit.targetFormatted}`
                  : `${fit.absDifferenceSeconds}s under ${fit.targetFormatted}`}
            </p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Words that fit at this pace", NUM.format(fit.wordBudget)],
                [
                  fit.wordDelta > 0 ? "Words to cut" : "Words you could add",
                  NUM.format(fit.absWordDelta),
                ],
                [
                  "Pace needed to hit the target",
                  fit.requiredWpm === null
                    ? dash
                    : `${fit.requiredWpm} wpm${fit.paceAchievable ? "" : " (outside a natural range)"}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            {fit.note ? (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {fit.note}
              </p>
            ) : null}
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Word budget for standard spot lengths</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Spot length
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Words at {wpm} wpm
                </th>
              </tr>
            </thead>
            <tbody>
              {spotTable.map(({ seconds, result }) => (
                <tr key={seconds} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{seconds}s</td>
                  <td className="py-2 text-right">
                    {result.error ? dash : NUM.format(result.words)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates assume steady delivery. Retakes, music beds, breaths and directed pauses all move
        the real runtime — record a timed read before locking a mix to a fixed slot.
      </p>
    </main>
  );
}
