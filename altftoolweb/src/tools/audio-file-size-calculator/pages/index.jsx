"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileAudio, RotateCcw } from "lucide-react";

import {
  BIT_DEPTHS,
  CHANNEL_PRESETS,
  DEFAULT_FLAC_RATIO,
  SAMPLE_RATES,
  WAV_HEADER_BYTES,
  computeAudioSize,
  formatBytes,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const DEFAULTS = {
  hours: "0",
  minutes: "3",
  seconds: "0",
  sampleRate: "44100",
  bitDepth: "16",
  channels: "2",
  flacRatio: String(DEFAULT_FLAC_RATIO),
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
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [sampleRate, setSampleRate] = useState(DEFAULTS.sampleRate);
  const [bitDepth, setBitDepth] = useState(DEFAULTS.bitDepth);
  const [channels, setChannels] = useState(DEFAULTS.channels);
  const [flacRatio, setFlacRatio] = useState(DEFAULTS.flacRatio);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeAudioSize({
        hours: Number(hours),
        minutes: Number(minutes),
        seconds: Number(seconds),
        sampleRate: Number(sampleRate),
        bitDepth: Number(bitDepth),
        channels: Number(channels),
        flacRatio: Number(flacRatio),
      }),
    [hours, minutes, seconds, sampleRate, bitDepth, channels, flacRatio],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Audio file size",
      `Duration: ${result.durationLabel}`,
      `Format: ${result.bitDepth}-bit / ${NUM.format(result.sampleRate)} Hz / ${result.channels} ch`,
      `Data rate: ${result.kbps} kbps (${formatBytes(result.bytesPerSecond)} per second)`,
      `Uncompressed WAV: ${formatBytes(result.pcmBytes)} (${NUM.format(result.pcmBytes)} bytes, ${result.pcmMiB} MiB)`,
      `Per minute: ${result.mbPerMinute} MB · per hour: ${result.mbPerHour} MB`,
      "",
      ...result.formats.map((format) => `${format.label}: ${formatBytes(format.bytes)}`),
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
    setHours(DEFAULTS.hours);
    setMinutes(DEFAULTS.minutes);
    setSeconds(DEFAULTS.seconds);
    setSampleRate(DEFAULTS.sampleRate);
    setBitDepth(DEFAULTS.bitDepth);
    setChannels(DEFAULTS.channels);
    setFlacRatio(DEFAULTS.flacRatio);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileAudio className="h-4 w-4" aria-hidden="true" />
          Format guides
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Audio File Size Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sample rate × bit depth × channels gives the data rate; multiply by duration and you have
          the file. Compare the uncompressed result against FLAC, MP3, AAC and Opus.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-sm font-semibold">Duration</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="afs-hours">
              Hours
            </label>
            <input
              id="afs-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="afs-minutes">
              Minutes
            </label>
            <input
              id="afs-minutes"
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
            <label className={LABEL_CLASS} htmlFor="afs-seconds">
              Seconds
            </label>
            <input
              id="afs-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={seconds}
              onChange={(event) => setSeconds(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="afs-rate">
              Sample rate
            </label>
            <select
              id="afs-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sampleRate}
              onChange={(event) => setSampleRate(event.target.value)}
            >
              {SAMPLE_RATES.map((rate) => (
                <option key={rate.hz} value={String(rate.hz)}>
                  {rate.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="afs-depth">
              Bit depth
            </label>
            <select
              id="afs-depth"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bitDepth}
              onChange={(event) => setBitDepth(event.target.value)}
            >
              {BIT_DEPTHS.map((depth) => (
                <option key={depth} value={String(depth)}>
                  {depth}-bit
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="afs-channels">
              Channels
            </label>
            <select
              id="afs-channels"
              className={`mt-2 ${INPUT_CLASS}`}
              value={channels}
              onChange={(event) => setChannels(event.target.value)}
            >
              {CHANNEL_PRESETS.map((preset) => (
                <option key={preset.count} value={String(preset.count)}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="afs-flac">
              FLAC size as a share of PCM
            </label>
            <input
              id="afs-flac"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.2"
              max="1"
              step="0.05"
              value={flacRatio}
              onChange={(event) => setFlacRatio(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              Uncompressed WAV size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatBytes(result.pcmBytes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs to see the file size."
                : `${result.durationLabel} at ${result.kbps} kbps`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the audio file size result"
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
            ["Data rate", hasError ? DASH : `${result.kbps} kbps`],
            [
              "Bytes per second",
              hasError ? DASH : `${NUM.format(result.bytesPerSecond)} B/s`,
            ],
            ["Per minute", hasError ? DASH : `${result.mbPerMinute} MB`],
            ["Per hour", hasError ? DASH : `${result.mbPerHour} MB`],
            ["Exact size in bytes", hasError ? DASH : `${NUM.format(result.pcmBytes)} B`],
            ["Same size in MiB (1024-based)", hasError ? DASH : `${result.pcmMiB} MiB`],
            ["WAV header included", hasError ? DASH : `${WAV_HEADER_BYTES} B`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.exceedsWavLimit && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]"
          >
            This exceeds the 4 GB limit of the RIFF/WAVE container. Record to RF64, Wave64 (.w64) or
            CAF, or split the take into multiple files.
          </p>
        )}
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Same {result.durationLabel} in other formats</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Data rate</th>
                  <th scope="col" className="py-2 text-right font-semibold">File size</th>
                </tr>
              </thead>
              <tbody>
                {result.formats.map((format) => (
                  <tr key={format.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="block font-semibold">{format.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{format.note}</span>
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {format.kbps} kbps
                    </td>
                    <td className="py-2 text-right font-semibold">{formatBytes(format.bytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes use decimal units (1 MB = 1,000,000 bytes), the same convention drive manufacturers and
        cloud storage use. Variable-bitrate encodes and lossless FLAC vary with the material, so treat
        those two rows as estimates rather than exact figures.
      </p>
    </main>
  );
}
