"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mic, RotateCcw } from "lucide-react";
import {
  PACE_PRESETS,
  SLOT_PRESETS,
  computeWordBudget,
  countWords,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  slot: "30",
  wpm: "150",
  pause: "1.5",
  tag: "0",
  script: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" ? NaN : value;
};

export default function ToolHome() {
  const [slot, setSlot] = useState(DEFAULTS.slot);
  const [wpm, setWpm] = useState(DEFAULTS.wpm);
  const [pause, setPause] = useState(DEFAULTS.pause);
  const [tag, setTag] = useState(DEFAULTS.tag);
  const [script, setScript] = useState(DEFAULTS.script);
  const [copied, setCopied] = useState(false);

  const scriptWords = useMemo(() => countWords(script), [script]);

  const result = useMemo(
    () =>
      computeWordBudget({
        slotSeconds: toNumber(slot),
        wordsPerMinute: toNumber(wpm),
        pauseSeconds: toNumber(pause),
        tagSeconds: toNumber(tag),
        scriptWords,
      }),
    [slot, wpm, pause, tag, scriptWords],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Voiceover word budget",
      `Slot: ${NUM1.format(result.slotSeconds)}s (speaking time ${NUM1.format(result.speakingSeconds)}s)`,
      `Pace: ${NUM.format(result.wordsPerMinute)} wpm (${NUM2.format(result.secondsPerWord)}s per word)`,
      `Word budget: ${NUM.format(result.wordBudget)} words`,
      result.scriptWords > 0
        ? `Script: ${NUM.format(result.scriptWords)} words = ${NUM1.format(result.scriptSeconds)}s (${result.fits ? "fits" : "over"} by ${NUM.format(Math.abs(result.deltaWords))} words)`
        : "Script: not pasted",
    ].join("\n");
  }, [hasError, result]);

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
    setSlot(DEFAULTS.slot);
    setWpm(DEFAULTS.wpm);
    setPause(DEFAULTS.pause);
    setTag(DEFAULTS.tag);
    setScript(DEFAULTS.script);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mic className="h-4 w-4" aria-hidden="true" />
          Speech pacing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Voiceover Word Budget Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how many words actually fit a 15, 30 or 60 second read once breaths and an end
          tag are taken out of the slot, then check your draft against the budget.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-slot">
              Slot length (seconds)
            </label>
            <input
              id="vo-slot"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={slot}
              onChange={(event) => setSlot(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-wpm">
              Reading pace (words per minute)
            </label>
            <input
              id="vo-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="40"
              max="400"
              step="5"
              value={wpm}
              onChange={(event) => setWpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-pause">
              Breath and beat pauses (seconds)
            </label>
            <input
              id="vo-pause"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={pause}
              onChange={(event) => setPause(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vo-tag">
              End tag / sting (seconds)
            </label>
            <input
              id="vo-tag"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Slot presets
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SLOT_PRESETS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                className={CHIP_BTN}
                onClick={() => setSlot(String(seconds))}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="vo-pace-preset">
            Pace preset
          </label>
          <select
            id="vo-pace-preset"
            className={`mt-2 ${INPUT_CLASS}`}
            value={wpm}
            onChange={(event) => setWpm(event.target.value)}
          >
            {PACE_PRESETS.every((preset) => String(preset.wpm) !== wpm) && (
              <option value={wpm}>Custom — {wpm || "?"} wpm</option>
            )}
            {PACE_PRESETS.map((preset) => (
              <option key={preset.id} value={String(preset.wpm)}>
                {preset.label} — {preset.wpm} wpm
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="vo-script">
            Paste your script (optional)
          </label>
          <textarea
            id="vo-script"
            className="mt-2 min-h-[7rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            value={script}
            placeholder="Paste the copy here to see whether it fits the slot."
            onChange={(event) => setScript(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {NUM.format(scriptWords)} words counted.
          </p>
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
              Words that fit this slot
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.wordBudget)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a budget."
                : `${NUM1.format(result.speakingSeconds)}s of speaking time at ${NUM.format(result.wordsPerMinute)} wpm`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy voiceover word budget result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Reserved for pauses and tag", hasError ? DASH : `${NUM1.format(result.reservedSeconds)}s`],
            ["Speaking time available", hasError ? DASH : `${NUM1.format(result.speakingSeconds)}s`],
            ["Seconds per word at this pace", hasError ? DASH : `${NUM2.format(result.secondsPerWord)}s`],
            [
              "Your script length",
              hasError || result.scriptWords === 0
                ? DASH
                : `${NUM.format(result.scriptWords)} words = ${NUM1.format(result.scriptSeconds)}s`,
            ],
            [
              "Over / under budget",
              hasError || result.scriptWords === 0
                ? DASH
                : `${result.deltaWords >= 0 ? "+" : "−"}${NUM.format(Math.abs(result.deltaWords))} words (${result.deltaSeconds >= 0 ? "+" : "−"}${NUM1.format(Math.abs(result.deltaSeconds))}s)`,
            ],
            [
              "Pace needed to fit the script",
              hasError || result.scriptWords === 0
                ? DASH
                : `${NUM.format(result.requiredWpm)} wpm`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.scriptWords > 0 && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.fits
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.fits
              ? `Fits with ${NUM.format(result.deltaWords)} words to spare.`
              : `Trim about ${NUM.format(Math.abs(result.deltaWords))} words, or read at ${NUM.format(result.requiredWpm)} wpm.`}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Budget for every standard slot</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Same pace and same {NUM1.format(result.reservedSeconds)}s reserved for pauses and tag.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Slot</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Speaking time</th>
                  <th scope="col" className="py-2 text-right font-semibold">Word budget</th>
                </tr>
              </thead>
              <tbody>
                {result.perSlot.map((row) => (
                  <tr key={row.seconds} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.seconds}s</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(Math.max(0, row.seconds - result.reservedSeconds))}s
                    </td>
                    <td className="py-2 text-right font-semibold">{NUM.format(row.words)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Word counts are a planning guide. Long product names, numbers and legal phrasing read slower
        than ordinary copy, so always time a rehearsal read before locking the script.
      </p>
    </main>
  );
}
