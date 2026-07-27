"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Film, RotateCcw } from "lucide-react";

import {
  CODECS,
  QUALITY_BPP,
  RESOLUTION_PRESETS,
  YOUTUBE_RECOMMENDED_KBPS,
  computeFileSize,
  formatDuration,
  recordingTimeSeconds,
  suggestBitrateKbps,
  toSeconds,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

const DEFAULTS = {
  hours: "0",
  minutes: "10",
  seconds: "0",
  videoBitrate: "8000",
  audioBitrate: "384",
  resolutionId: "1080p",
  fps: "30",
  codecId: "h264",
  qualityId: "standard",
  freeSpaceGb: "512",
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
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [videoBitrate, setVideoBitrate] = useState(DEFAULTS.videoBitrate);
  const [audioBitrate, setAudioBitrate] = useState(DEFAULTS.audioBitrate);
  const [resolutionId, setResolutionId] = useState(DEFAULTS.resolutionId);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [codecId, setCodecId] = useState(DEFAULTS.codecId);
  const [qualityId, setQualityId] = useState(DEFAULTS.qualityId);
  const [freeSpaceGb, setFreeSpaceGb] = useState(DEFAULTS.freeSpaceGb);
  const [copied, setCopied] = useState(false);

  const resolution = RESOLUTION_PRESETS.find((item) => item.id === resolutionId) || RESOLUTION_PRESETS[4];
  const quality = QUALITY_BPP.find((item) => item.id === qualityId) || QUALITY_BPP[2];
  const codec = CODECS.find((item) => item.id === codecId) || CODECS[0];

  const durationSeconds = toSeconds({
    hours: toNumber(hours),
    minutes: toNumber(minutes),
    seconds: toNumber(seconds),
  });

  const result = useMemo(
    () =>
      computeFileSize({
        videoBitrateKbps: toNumber(videoBitrate),
        audioBitrateKbps: toNumber(audioBitrate),
        durationSeconds,
      }),
    [videoBitrate, audioBitrate, durationSeconds],
  );

  const suggestion = useMemo(
    () =>
      suggestBitrateKbps({
        width: resolution.width,
        height: resolution.height,
        fps: toNumber(fps),
        codecId,
        bpp: quality.bpp,
      }),
    [resolution, fps, codecId, quality],
  );

  const cardTime = result.error
    ? NaN
    : recordingTimeSeconds({
        freeSpaceGb: toNumber(freeSpaceGb),
        totalBitrateKbps: result.totalBitrateKbps,
      });

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Video File Size Calculator",
      `Duration: ${formatDuration(result.durationSeconds)}`,
      `Video bitrate: ${NUM0.format(result.videoBitrateKbps)} kb/s`,
      `Audio bitrate: ${NUM0.format(result.audioBitrateKbps)} kb/s`,
      `Total data rate: ${NUM2.format(result.totalBitrateMbps)} Mb/s`,
      `File size: ${NUM1.format(result.megabytes)} MB (${NUM1.format(result.mebibytes)} MiB)`,
      `Per minute: ${NUM1.format(result.megabytesPerMinute)} MB`,
      `Per hour: ${NUM2.format(result.gigabytesPerHour)} GB`,
    ].join("\n");
  }, [result]);

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
    setVideoBitrate(DEFAULTS.videoBitrate);
    setAudioBitrate(DEFAULTS.audioBitrate);
    setResolutionId(DEFAULTS.resolutionId);
    setFps(DEFAULTS.fps);
    setCodecId(DEFAULTS.codecId);
    setQualityId(DEFAULTS.qualityId);
    setFreeSpaceGb(DEFAULTS.freeSpaceGb);
    setCopied(false);
  };

  const applySuggestion = () => {
    if (suggestion.error) return;
    setVideoBitrate(String(Math.round(suggestion.bitrateKbps)));
  };

  const sizeHeadline = result.error
    ? DASH
    : result.gigabytes >= 1
      ? `${NUM2.format(result.gigabytes)} GB`
      : `${NUM1.format(result.megabytes)} MB`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Film className="h-4 w-4" aria-hidden="true" />
          Video production
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Video File Size Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          File size is total data rate multiplied by duration. Enter the bitrate you plan to export
          at, or derive one from resolution, frame rate and codec, and see the finished size in both
          SI and binary units.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Duration and bitrate</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="vf-hours">
              Hours
            </label>
            <input
              id="vf-hours"
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
            <label className={LABEL_CLASS} htmlFor="vf-minutes">
              Minutes
            </label>
            <input
              id="vf-minutes"
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
            <label className={LABEL_CLASS} htmlFor="vf-seconds">
              Seconds
            </label>
            <input
              id="vf-seconds"
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vf-video-bitrate">
              Video bitrate (kb/s)
            </label>
            <input
              id="vf-video-bitrate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={videoBitrate}
              onChange={(event) => setVideoBitrate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vf-audio-bitrate">
              Audio bitrate (kb/s)
            </label>
            <input
              id="vf-audio-bitrate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="16"
              value={audioBitrate}
              onChange={(event) => setAudioBitrate(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {YOUTUBE_RECOMMENDED_KBPS.slice(0, 6).map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setVideoBitrate(String(item.kbps))}
              className={CHIP_BTN}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Those chips are YouTube&apos;s published recommended video bitrates for SDR uploads.
        </p>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated file size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{sizeHeadline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? DASH
                : `${formatDuration(result.durationSeconds)} at ${NUM2.format(result.totalBitrateMbps)} Mb/s total`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the file size estimate"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
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
            ["Size in megabytes (SI)", result.error ? DASH : `${NUM1.format(result.megabytes)} MB`],
            ["Size in mebibytes (binary)", result.error ? DASH : `${NUM1.format(result.mebibytes)} MiB`],
            ["Size in gigabytes (SI)", result.error ? DASH : `${NUM3.format(result.gigabytes)} GB`],
            ["Size in gibibytes (binary)", result.error ? DASH : `${NUM3.format(result.gibibytes)} GiB`],
            ["Total data rate", result.error ? DASH : `${NUM2.format(result.totalBitrateMbps)} Mb/s`],
            ["Per minute of footage", result.error ? DASH : `${NUM1.format(result.megabytesPerMinute)} MB`],
            ["Per hour of footage", result.error ? DASH : `${NUM2.format(result.gigabytesPerHour)} GB`],
            ["Audio share of the file", result.error ? DASH : PCT.format(result.audioShareOfSize)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Not sure what bitrate to use?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Derive one from the pixel rate: width × height × fps × bits per pixel, adjusted for codec
          efficiency.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vf-resolution">
              Resolution
            </label>
            <select
              id="vf-resolution"
              className={`mt-2 ${INPUT_CLASS}`}
              value={resolutionId}
              onChange={(event) => setResolutionId(event.target.value)}
            >
              {RESOLUTION_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vf-fps">
              Frame rate (fps)
            </label>
            <input
              id="vf-fps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="1000"
              step="0.01"
              value={fps}
              onChange={(event) => setFps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vf-codec">
              Codec
            </label>
            <select
              id="vf-codec"
              className={`mt-2 ${INPUT_CLASS}`}
              value={codecId}
              onChange={(event) => setCodecId(event.target.value)}
            >
              {CODECS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vf-quality">
              Quality target
            </label>
            <select
              id="vf-quality"
              className={`mt-2 ${INPUT_CLASS}`}
              value={qualityId}
              onChange={(event) => setQualityId(event.target.value)}
              disabled={codec.kind === "fixed"}
            >
              {QUALITY_BPP.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.bpp} bpp
                </option>
              ))}
            </select>
          </div>
        </div>

        {suggestion.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {suggestion.error}
          </p>
        ) : (
          <div className="mt-4 rounded-lg border border-[var(--border)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Suggested video bitrate</p>
                <p className="text-2xl font-semibold">
                  {NUM0.format(suggestion.bitrateKbps)} kb/s
                  <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                    ({NUM2.format(suggestion.bitrateKbps / 1000)} Mb/s)
                  </span>
                </p>
              </div>
              <button type="button" onClick={applySuggestion} className={PRIMARY_BTN}>
                Use this bitrate
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{suggestion.note}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Pixel rate {NUM0.format(suggestion.pixelRate)} px/s · effective{" "}
              {NUM3.format(suggestion.effectiveBpp)} bits per pixel
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How long will a card or drive last?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vf-space">
              Free space (GB)
            </label>
            <input
              id="vf-space"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="16"
              value={freeSpaceGb}
              onChange={(event) => setFreeSpaceGb(event.target.value)}
            />
          </div>
          <div>
            <span className={LABEL_CLASS}>Recording time at this data rate</span>
            <p className="mt-2 flex h-11 items-center text-lg font-semibold tabular-nums">
              {Number.isFinite(cardTime) ? formatDuration(cardTime) : DASH}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">YouTube recommended upload bitrates (SDR)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Format
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Video bitrate
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Size per hour
                </th>
              </tr>
            </thead>
            <tbody>
              {YOUTUBE_RECOMMENDED_KBPS.map((item) => {
                const row = computeFileSize({
                  videoBitrateKbps: item.kbps,
                  audioBitrateKbps: 384,
                  durationSeconds: 3600,
                });
                return (
                  <tr key={item.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.label}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {NUM0.format(item.kbps / 1000)} Mb/s
                    </td>
                    <td className="py-2 text-right tabular-nums text-[var(--muted-foreground)]">
                      {row.error ? DASH : `${NUM1.format(row.gigabytes)} GB`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Constant-bitrate exports land very close to this figure. Variable-bitrate and constant-quality
        modes (CRF, CQ) vary with how much motion and detail the footage carries, so treat the result
        as a ceiling for planning storage rather than an exact file size.
      </p>
    </main>
  );
}
