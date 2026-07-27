"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";
import {
  SAMPLE_RATE_OPTIONS,
  TIME_SIGNATURE_PRESETS,
  computeDelayTimes,
  matchMsToNote,
} from "../lib";

const MS = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const HZ = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DEFAULTS = { bpm: "120", signature: "4/4", sampleRate: "48000", target: "375" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const VARIANT_LABEL = { straight: "straight", dotted: "dotted", triplet: "triplet" };

export default function ToolHome() {
  const [bpm, setBpm] = useState(DEFAULTS.bpm);
  const [signature, setSignature] = useState(DEFAULTS.signature);
  const [sampleRate, setSampleRate] = useState(DEFAULTS.sampleRate);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [showSamples, setShowSamples] = useState(false);
  const [copied, setCopied] = useState(false);

  const signaturePreset =
    TIME_SIGNATURE_PRESETS.find((preset) => preset.label === signature) ?? TIME_SIGNATURE_PRESETS[0];

  const result = useMemo(
    () =>
      computeDelayTimes({
        bpm: bpm.trim() === "" ? NaN : Number(bpm),
        sampleRate: Number(sampleRate),
        beatsPerBar: signaturePreset.beatsPerBar,
        beatUnit: signaturePreset.beatUnit,
      }),
    [bpm, sampleRate, signaturePreset],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const match = useMemo(
    () =>
      matchMsToNote({
        bpm: bpm.trim() === "" ? NaN : Number(bpm),
        targetMs: target.trim() === "" ? NaN : Number(target),
      }),
    [bpm, target],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `BPM To Delay Milliseconds Calculator — ${result.bpm} BPM, ${signaturePreset.label}`,
      `Quarter note: ${MS.format(result.quarterMs)} ms · Bar: ${MS.format(result.barMs)} ms`,
      "",
      "Note\tStraight\tDotted\tTriplet",
    ];
    for (const row of result.rows) {
      lines.push(
        `${row.label}\t${MS.format(row.straight.ms)} ms\t${MS.format(row.dotted.ms)} ms\t${MS.format(row.triplet.ms)} ms`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, signaturePreset]);

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
    setBpm(DEFAULTS.bpm);
    setSignature(DEFAULTS.signature);
    setSampleRate(DEFAULTS.sampleRate);
    setTarget(DEFAULTS.target);
    setShowSamples(false);
    setCopied(false);
  };

  const cell = (entry) =>
    showSamples ? `${INT.format(entry.samples)} smp` : `${MS.format(entry.ms)} ms`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Tempo sync
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          BPM To Delay Milliseconds Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A quarter note lasts 60000 ÷ BPM milliseconds. From that one figure you get every delay,
          pre-delay and LFO time in the track — straight, dotted and triplet — in ms, hertz and
          samples.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bpm-tempo">
              Tempo (BPM)
            </label>
            <input
              id="bpm-tempo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="1000"
              step="0.1"
              value={bpm}
              onChange={(event) => setBpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bpm-signature">
              Time signature
            </label>
            <select
              id="bpm-signature"
              className={`mt-2 ${INPUT_CLASS}`}
              value={signature}
              onChange={(event) => setSignature(event.target.value)}
            >
              {TIME_SIGNATURE_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bpm-rate">
              Sample rate (for the samples column)
            </label>
            <select
              id="bpm-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sampleRate}
              onChange={(event) => setSampleRate(event.target.value)}
            >
              {SAMPLE_RATE_OPTIONS.map((rate) => (
                <option key={rate} value={rate}>
                  {INT.format(rate)} Hz
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium" htmlFor="bpm-units">
              <input
                id="bpm-units"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={showSamples}
                onChange={(event) => setShowSamples(event.target.checked)}
              />
              Show the table in samples instead of ms
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["70", "90", "120", "128", "140", "174"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setBpm(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} BPM
            </button>
          ))}
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
              Quarter note (one beat)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${MS.format(result.quarterMs)} ms`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${HZ.format(result.quarterHz)} Hz · one ${signaturePreset.label} bar = ${MS.format(result.barMs)} ms`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the delay time table"
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
            ["Bar length", hasError ? dash : `${MS.format(result.barMs)} ms`],
            ["Bars per minute", hasError ? dash : HZ.format(result.barsPerMinute)],
            [
              "Eighth-note LFO rate",
              hasError ? dash : `${HZ.format(result.byId["1-8"].straight.hz)} Hz`,
            ],
            [
              "Dotted eighth delay (classic slapback)",
              hasError ? dash : `${MS.format(result.byId["1-8"].dotted.ms)} ms`,
            ],
            [
              "Sixteenth-note pre-delay",
              hasError ? dash : `${MS.format(result.byId["1-16"].straight.ms)} ms`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">
          Note values {showSamples ? "in samples" : "in milliseconds"}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Note</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Straight</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Dotted</th>
                <th scope="col" className="py-2 text-right font-semibold">Triplet</th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">{dash}</td>
                  <td className="py-2 pr-3 text-right">{dash}</td>
                  <td className="py-2 pr-3 text-right">{dash}</td>
                  <td className="py-2 text-right">{dash}</td>
                </tr>
              ) : (
                result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{cell(row.straight)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {cell(row.dotted)}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {cell(row.triplet)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Which note is my delay set to?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bpm-target">
              Delay time you already have (ms)
            </label>
            <input
              id="bpm-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Closest note value
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {match.error ? dash : `${VARIANT_LABEL[match.variant]} ${match.label}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {match.error
                ? match.error
                : `${MS.format(match.ms)} ms · off by ${MS.format(match.diffMs)} ms`}
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Reverb pre-delay is usually set to a short note value such as a 1/32 or 1/16 so the early
        reflections land on the grid; decay is often trimmed so the tail clears before the next
        downbeat, which is the bar length shown above.
      </p>
    </main>
  );
}
