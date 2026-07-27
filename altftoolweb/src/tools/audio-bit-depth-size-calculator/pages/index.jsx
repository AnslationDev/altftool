"use client";

import { useMemo, useState } from "react";
import { AudioWaveform, Check, Copy, RotateCcw } from "lucide-react";
import {
  BIT_DEPTH_PRESETS,
  CHANNEL_PRESETS,
  SAMPLE_RATE_PRESETS,
  computeAudioSize,
  computeStorageFit,
  formatBinaryBytes,
  formatDecimalBytes,
  formatDuration,
  toSeconds,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DEFAULTS = {
  sampleRate: "48000",
  bitDepth: "24",
  channels: "2",
  minutes: "3",
  seconds: "30",
  storageGb: "1",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [sampleRate, setSampleRate] = useState(DEFAULTS.sampleRate);
  const [bitDepth, setBitDepth] = useState(DEFAULTS.bitDepth);
  const [channels, setChannels] = useState(DEFAULTS.channels);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [storageGb, setStorageGb] = useState(DEFAULTS.storageGb);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeAudioSize({
        sampleRate: Number(sampleRate),
        bitDepth: Number(bitDepth),
        channels: Number(channels),
        durationSeconds: toSeconds({
          minutes: minutes.trim() === "" ? 0 : Number(minutes),
          seconds: seconds.trim() === "" ? 0 : Number(seconds),
        }),
        includeHeader,
      }),
    [sampleRate, bitDepth, channels, minutes, seconds, includeHeader],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const fit = useMemo(() => {
    if (hasError) return { error: "unavailable" };
    return computeStorageFit({
      bytesPerSecond: result.bytesPerSecond,
      storageGb: storageGb.trim() === "" ? NaN : Number(storageGb),
    });
  }, [hasError, result, storageGb]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Audio Bit Depth Size Calculator",
      `Format: ${INT.format(result.sampleRate)} Hz / ${result.bitDepth}-bit / ${result.channels} ch`,
      `Duration: ${formatDuration(result.durationSeconds)}`,
      `Bitrate: ${NUM.format(result.bitrateKbps)} kbit/s (${NUM.format(result.bitrateMbps)} Mbit/s)`,
      `File size: ${formatBinaryBytes(result.totalBytes)} (${formatDecimalBytes(result.totalBytes)})`,
      `Per minute: ${formatBinaryBytes(result.bytesPerMinute)}`,
      `Per hour: ${formatBinaryBytes(result.bytesPerHour)}`,
      `Longest classic WAV at this format: ${formatDuration(result.maxWavSeconds)}`,
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
    setSampleRate(DEFAULTS.sampleRate);
    setBitDepth(DEFAULTS.bitDepth);
    setChannels(DEFAULTS.channels);
    setMinutes(DEFAULTS.minutes);
    setSeconds(DEFAULTS.seconds);
    setStorageGb(DEFAULTS.storageGb);
    setIncludeHeader(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AudioWaveform className="h-4 w-4" aria-hidden="true" />
          PCM audio
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Audio Bit Depth Size Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sample rate × bit depth × channels gives the exact bitrate of linear PCM, so an
          uncompressed WAV, AIFF or BWF size is fully predictable before you hit record.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="abd-rate">
              Sample rate
            </label>
            <select
              id="abd-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sampleRate}
              onChange={(event) => setSampleRate(event.target.value)}
            >
              {SAMPLE_RATE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="abd-depth">
              Bit depth
            </label>
            <select
              id="abd-depth"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bitDepth}
              onChange={(event) => setBitDepth(event.target.value)}
            >
              {BIT_DEPTH_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="abd-channels">
              Channels
            </label>
            <select
              id="abd-channels"
              className={`mt-2 ${INPUT_CLASS}`}
              value={channels}
              onChange={(event) => setChannels(event.target.value)}
            >
              {CHANNEL_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="abd-minutes">
                Minutes
              </label>
              <input
                id="abd-minutes"
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
              <label className={LABEL_CLASS} htmlFor="abd-seconds">
                Seconds
              </label>
              <input
                id="abd-seconds"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={seconds}
                onChange={(event) => setSeconds(event.target.value)}
              />
            </div>
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]"
          htmlFor="abd-header"
        >
          <input
            id="abd-header"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            type="checkbox"
            checked={includeHeader}
            onChange={(event) => setIncludeHeader(event.target.checked)}
          />
          Include the 44-byte canonical WAV header
        </label>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Uncompressed file size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : formatBinaryBytes(result.totalBytes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${formatDecimalBytes(result.totalBytes)} on disk · ${INT.format(Math.round(result.totalBytes))} bytes`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy audio file size result"
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
              "Bitrate",
              hasError ? dash : `${NUM.format(result.bitrateKbps)} kbit/s (${NUM.format(result.bitrateMbps)} Mbit/s)`,
            ],
            ["Data rate", hasError ? dash : `${formatBinaryBytes(result.bytesPerSecond)} / second`],
            ["Bits per sample frame", hasError ? dash : `${INT.format(result.bitsPerFrame)} bits`],
            ["Total sample frames", hasError ? dash : INT.format(result.totalFrames)],
            ["Audio data only", hasError ? dash : formatBinaryBytes(result.dataBytes)],
            ["Container header", hasError ? dash : `${result.headerBytes} bytes`],
            ["Size per minute", hasError ? dash : formatBinaryBytes(result.bytesPerMinute)],
            ["Size per hour", hasError ? dash : formatBinaryBytes(result.bytesPerHour)],
            [
              "Longest classic .wav (4 GiB RIFF cap)",
              hasError ? dash : formatDuration(result.maxWavSeconds),
            ],
          ].map(([label, text]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{text}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.exceedsWavLimit && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            This exceeds the 4 GiB RIFF limit — save as RF64/BW64 or Wave64 instead of a classic .wav.
          </p>
        )}
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How much fits on a drive or card?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="abd-storage">
              Free space (GB, decimal)
            </label>
            <input
              id="abd-storage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={storageGb}
              onChange={(event) => setStorageGb(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recording time at this format
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {fit.error ? dash : formatDuration(fit.seconds)}
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Figures are for linear PCM only. Lossless codecs such as FLAC or ALAC typically land between
        40% and 70% of these sizes depending on the material, and lossy formats are far smaller
        because they discard data.
      </p>
    </main>
  );
}
