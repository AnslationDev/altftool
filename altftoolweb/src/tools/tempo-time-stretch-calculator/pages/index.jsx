"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";
import { BPM_PRESETS, computeTimeStretch, formatDuration, toSeconds } from "../lib";

const PCT = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
const ST = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DEFAULTS = {
  sourceBpm: "120",
  targetBpm: "128",
  minutes: "3",
  seconds: "30",
  sampleRate: "48000",
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

const signed = (value, formatter) =>
  `${value > 0 ? "+" : ""}${formatter.format(value)}`;

export default function ToolHome() {
  const [sourceBpm, setSourceBpm] = useState(DEFAULTS.sourceBpm);
  const [targetBpm, setTargetBpm] = useState(DEFAULTS.targetBpm);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [sampleRate, setSampleRate] = useState(DEFAULTS.sampleRate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTimeStretch({
        sourceBpm: sourceBpm.trim() === "" ? NaN : Number(sourceBpm),
        targetBpm: targetBpm.trim() === "" ? NaN : Number(targetBpm),
        clipSeconds: toSeconds({
          minutes: minutes.trim() === "" ? 0 : Number(minutes),
          seconds: seconds.trim() === "" ? 0 : Number(seconds),
        }),
        sampleRate: Number(sampleRate),
      }),
    [sourceBpm, targetBpm, minutes, seconds, sampleRate],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Tempo Time Stretch Calculator",
      `${result.sourceBpm} BPM -> ${result.targetBpm} BPM`,
      `Stretch: ${PCT.format(result.stretchPercent)}% of original length`,
      `Playback speed: ${PCT.format(result.speedPercent)}% (${signed(result.tempoChangePercent, PCT)}% tempo)`,
      `Resampled pitch shift: ${signed(result.semitones, ST)} semitones (${signed(result.cents, INT)} cents, ${result.intervalName})`,
      `New clip length: ${formatDuration(result.newDurationSeconds)}`,
      `Varispeed sample rate: ${INT.format(result.varispeedSampleRate)} Hz`,
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
    setSourceBpm(DEFAULTS.sourceBpm);
    setTargetBpm(DEFAULTS.targetBpm);
    setMinutes(DEFAULTS.minutes);
    setSeconds(DEFAULTS.seconds);
    setSampleRate(DEFAULTS.sampleRate);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Time stretch
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tempo Time Stretch Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Moving a loop from one tempo to another changes its length by the ratio of the two BPMs —
          and, if you resample rather than elastic-stretch, its pitch by 12·log2 of the same ratio.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-source">
              Original tempo (BPM)
            </label>
            <input
              id="ts-source"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="1000"
              step="0.1"
              value={sourceBpm}
              onChange={(event) => setSourceBpm(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {BPM_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={CHIP_BTN}
                  onClick={() => setSourceBpm(String(preset))}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-target">
              Target tempo (BPM)
            </label>
            <input
              id="ts-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="1000"
              step="0.1"
              value={targetBpm}
              onChange={(event) => setTargetBpm(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {BPM_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={CHIP_BTN}
                  onClick={() => setTargetBpm(String(preset))}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm font-semibold text-[var(--foreground)]">Clip length</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-minutes">
              Minutes
            </label>
            <input
              id="ts-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-seconds">
              Seconds
            </label>
            <input
              id="ts-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={seconds}
              onChange={(event) => setSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-rate">
              Sample rate (Hz)
            </label>
            <select
              id="ts-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sampleRate}
              onChange={(event) => setSampleRate(event.target.value)}
            >
              {[44100, 48000, 88200, 96000, 192000].map((rate) => (
                <option key={rate} value={rate}>
                  {INT.format(rate)}
                </option>
              ))}
            </select>
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
              Stretch to
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${PCT.format(result.stretchPercent)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `of the original length · plays ${result.faster ? "faster" : result.speedRatio === 1 ? "at the same speed" : "slower"} at ${PCT.format(result.speedPercent)}% speed`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy time stretch result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Tempo change", hasError ? dash : `${signed(result.tempoChangePercent, PCT)}%`],
            ["Playback speed ratio", hasError ? dash : `${PCT.format(result.speedRatio)}×`],
            ["New clip length", hasError ? dash : formatDuration(result.newDurationSeconds)],
            [
              "Length difference",
              hasError ? dash : `${signed(result.durationChangeSeconds, PCT)} s`,
            ],
            [
              "Pitch shift if resampled",
              hasError ? dash : `${signed(result.semitones, ST)} semitones`,
            ],
            ["In cents", hasError ? dash : `${signed(result.cents, INT)} cents`],
            ["Nearest interval", hasError ? dash : result.intervalName],
            [
              "Varispeed sample rate",
              hasError ? dash : `${INT.format(result.varispeedSampleRate)} Hz`,
            ],
            [
              "Pitch correction to restore key",
              hasError ? dash : `${signed(result.pitchCorrectionSemitones, ST)} semitones`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.withinComfortZone
                ? "bg-[var(--surface-soft)] text-[var(--muted-foreground)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.withinComfortZone
              ? "Within about three semitones — most stretch algorithms hold up well here."
              : "More than three semitones of shift — expect audible artefacts unless you use a formant-aware algorithm or re-record."}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Elastic time-stretch modes (Ableton Warp, Logic Flex, Pro Tools Elastic Audio) keep pitch
        fixed while changing length; varispeed and plain resampling change both together, which is
        what the semitone figures above describe.
      </p>
    </main>
  );
}
