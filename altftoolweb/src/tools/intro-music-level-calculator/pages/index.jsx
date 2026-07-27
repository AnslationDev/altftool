"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SlidersHorizontal } from "lucide-react";
import {
  ENVELOPE_GUIDE,
  LOUDNESS_TARGETS,
  SEPARATION_PRESETS,
  computeDuck,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  voice: "-16",
  music: "-18",
  separation: "18",
  ceiling: "-1",
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
  const text = String(raw).trim();
  if (text === "" || text === "-") return NaN;
  return Number(text);
};

const db = (value) => `${value > 0 ? "+" : ""}${NUM1.format(value)} dB`;

export default function ToolHome() {
  const [voice, setVoice] = useState(DEFAULTS.voice);
  const [music, setMusic] = useState(DEFAULTS.music);
  const [separation, setSeparation] = useState(DEFAULTS.separation);
  const [ceiling, setCeiling] = useState(DEFAULTS.ceiling);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeDuck({
        voiceLevelDb: toNumber(voice),
        musicFullLevelDb: toNumber(music),
        separationDb: toNumber(separation),
        ceilingDb: toNumber(ceiling),
      }),
    [voice, music, separation, ceiling],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Intro music ducking",
      `Voice: ${NUM1.format(result.voiceLevelDb)} dB`,
      `Music bed (open): ${NUM1.format(result.musicFullLevelDb)} dB`,
      `Separation wanted: ${NUM1.format(result.separationDb)} dB`,
      `Duck the bed to: ${NUM1.format(result.duckedMusicDb)} dB`,
      `Gain change on the bed: ${db(-result.duckAmountDb)}`,
      `Fader multiplier while ducked: ${NUM1.format(result.faderPercent)}%`,
      `Mix level with speech: ${NUM1.format(result.mixDuringSpeechDb)} dB`,
      `Headroom to ${NUM1.format(result.ceilingDb)} dB ceiling: ${NUM1.format(result.headroomDb)} dB`,
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
    setVoice(DEFAULTS.voice);
    setMusic(DEFAULTS.music);
    setSeparation(DEFAULTS.separation);
    setCeiling(DEFAULTS.ceiling);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Mixing helpers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Intro Music Level Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the separation you want between voice and music, and get the exact level to duck the
          bed to, the gain change to dial in, and where the combined mix lands against your ceiling.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="duck-voice">
              Voiceover level (dBFS or LUFS)
            </label>
            <input
              id="duck-voice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-80"
              max="0"
              step="0.5"
              value={voice}
              onChange={(event) => setVoice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="duck-music">
              Music bed level when open (dB)
            </label>
            <input
              id="duck-music"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-80"
              max="0"
              step="0.5"
              value={music}
              onChange={(event) => setMusic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="duck-separation">
              Separation wanted (dB)
            </label>
            <input
              id="duck-separation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="1"
              value={separation}
              onChange={(event) => setSeparation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="duck-ceiling">
              Peak ceiling (dB)
            </label>
            <input
              id="duck-ceiling"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-80"
              max="0"
              step="0.5"
              value={ceiling}
              onChange={(event) => setCeiling(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Separation presets
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SEPARATION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={CHIP_BTN}
                onClick={() => setSeparation(String(preset.db))}
              >
                {preset.label} · {preset.db} dB
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="duck-target">
            Delivery target (sets voice level and ceiling)
          </label>
          <select
            id="duck-target"
            className={`mt-2 ${INPUT_CLASS}`}
            value=""
            onChange={(event) => {
              const target = LOUDNESS_TARGETS.find((t) => t.id === event.target.value);
              if (!target) return;
              setVoice(String(target.lufs));
              setCeiling(String(target.ceiling));
            }}
          >
            <option value="">Choose a delivery standard…</option>
            {LOUDNESS_TARGETS.map((target) => (
              <option key={target.id} value={target.id}>
                {target.label} — {target.lufs} LUFS, {target.ceiling} dBTP
              </option>
            ))}
          </select>
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
              Duck the music bed to
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM1.format(result.duckedMusicDb)} dB`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the duck."
                : `Change the bed by ${db(-result.duckAmountDb)} while the voice is speaking`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy ducking result"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Gain change on the bed",
              hasError ? DASH : db(-result.duckAmountDb),
            ],
            [
              "Fader multiplier while ducked",
              hasError ? DASH : `${NUM1.format(result.faderPercent)}% of the open level`,
            ],
            [
              "Amplitude ratio",
              hasError ? DASH : `${NUM2.format(result.faderAmplitude)}×`,
            ],
            [
              "Mix level while speaking",
              hasError ? DASH : `${NUM1.format(result.mixDuringSpeechDb)} dB`,
            ],
            [
              "Music adds to the voice",
              hasError ? DASH : db(result.speechAddedDb),
            ],
            [
              "Mix level with music alone",
              hasError ? DASH : `${NUM1.format(result.mixNoSpeechDb)} dB`,
            ],
            [
              "Headroom to the ceiling",
              hasError ? DASH : `${NUM1.format(result.headroomDb)} dB`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError &&
          result.warnings.map((warning) => (
            <p
              key={warning}
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </p>
          ))}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Duck envelope starting points</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Fast values feel tight and modern; slow values feel gentle and cinematic.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Stage</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Fast</th>
                <th scope="col" className="py-2 text-right font-semibold">Slow</th>
              </tr>
            </thead>
            <tbody>
              {ENVELOPE_GUIDE.map((stage) => (
                <tr key={stage.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{stage.label}</td>
                  <td className="py-2 pr-3 text-right">{stage.fastMs} ms</td>
                  <td className="py-2 text-right">{stage.slowMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Levels are treated as loudness, not peaks. Two uncorrelated sources of equal level sum to
        +3 dB, which is why a ducked bed barely moves the mix while an open one does.
      </p>
    </main>
  );
}
