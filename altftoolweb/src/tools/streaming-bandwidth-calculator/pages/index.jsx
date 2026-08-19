"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wifi } from "lucide-react";
import {
  AUDIO_PRESETS,
  DEFAULT_HEADROOM,
  DEFAULT_OVERHEAD_PERCENT,
  QUALITY_LEVELS,
  QUALITY_PRESETS,
  TWITCH_INGEST_LIMIT_KBPS,
  computeStreamBandwidth,
  findQuality,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  qualityId: "1080p60",
  level: "typical",
  videoKbps: "6000",
  audioKbps: "128",
  overheadPercent: String(DEFAULT_OVERHEAD_PERCENT),
  headroom: String(DEFAULT_HEADROOM),
  uploadMbps: "20",
  hours: "2",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [qualityId, setQualityId] = useState(DEFAULTS.qualityId);
  const [level, setLevel] = useState(DEFAULTS.level);
  const [videoKbps, setVideoKbps] = useState(DEFAULTS.videoKbps);
  const [audioKbps, setAudioKbps] = useState(DEFAULTS.audioKbps);
  const [overheadPercent, setOverheadPercent] = useState(DEFAULTS.overheadPercent);
  const [headroom, setHeadroom] = useState(DEFAULTS.headroom);
  const [uploadMbps, setUploadMbps] = useState(DEFAULTS.uploadMbps);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [copied, setCopied] = useState(false);

  const quality = findQuality(qualityId);

  const applyPreset = (nextQualityId, nextLevel) => {
    const preset = findQuality(nextQualityId);
    setQualityId(nextQualityId);
    setLevel(nextLevel);
    if (preset) setVideoKbps(String(preset[nextLevel]));
  };

  const result = useMemo(
    () =>
      computeStreamBandwidth({
        videoKbps: toNumber(videoKbps),
        audioKbps: toNumber(audioKbps),
        overheadPercent: toNumber(overheadPercent),
        headroom: toNumber(headroom),
        uploadMbps: toNumber(uploadMbps),
        hours: toNumber(hours),
      }),
    [videoKbps, audioKbps, overheadPercent, headroom, uploadMbps, hours],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Streaming bandwidth estimate",
      `Video: ${NUM0.format(result.videoKbps)} kbps · Audio: ${NUM0.format(result.audioKbps)} kbps`,
      `Stream bitrate: ${NUM0.format(result.streamKbps)} kbps`,
      `With ${toNumber(overheadPercent)}% protocol overhead: ${NUM.format(result.wireMbps)} Mbps upload`,
      `Recommended line speed (${toNumber(headroom)}x headroom): ${NUM.format(result.recommendedMbps)} Mbps`,
      `Data used: ${NUM.format(result.gbPerHour)} GB per hour, ${NUM.format(result.gbForSession)} GB for the session`,
      result.status === "unknown" ? "" : `Verdict: ${result.statusText}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, overheadPercent, headroom]);

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
    setQualityId(DEFAULTS.qualityId);
    setLevel(DEFAULTS.level);
    setVideoKbps(DEFAULTS.videoKbps);
    setAudioKbps(DEFAULTS.audioKbps);
    setOverheadPercent(DEFAULTS.overheadPercent);
    setHeadroom(DEFAULTS.headroom);
    setUploadMbps(DEFAULTS.uploadMbps);
    setHours(DEFAULTS.hours);
    setCopied(false);
  };

  const rows = [
    ["Stream bitrate (video + audio)", hasError ? DASH : `${NUM0.format(result.streamKbps)} kbps`],
    ["Actual upload with overhead", hasError ? DASH : `${NUM.format(result.wireMbps)} Mbps`],
    [
      "Recommended line speed",
      hasError ? DASH : `${NUM.format(result.recommendedMbps)} Mbps`,
    ],
    ["Data per hour", hasError ? DASH : `${NUM.format(result.gbPerHour)} GB`],
    ["Data for the whole session", hasError ? DASH : `${NUM.format(result.gbForSession)} GB`],
    [
      "Your upload speed",
      hasError || !result.uploadMbps ? DASH : `${NUM.format(result.uploadMbps)} Mbps`,
    ],
  ];

  const statusTone =
    result.status === "insufficient"
      ? "bg-[var(--danger-soft)] text-[var(--danger)]"
      : result.status === "tight"
        ? "bg-[var(--muted)] text-[var(--foreground)]"
        : "bg-[var(--muted)] text-[var(--success)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wifi className="h-4 w-4" aria-hidden="true" />
          Live streaming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Streaming Bandwidth Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the upload speed a stream really needs once audio, protocol overhead and safety
          headroom are added to the video bitrate.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-quality">
              Stream quality
            </label>
            <select
              id="sb-quality"
              className={`mt-2 ${INPUT_CLASS}`}
              value={qualityId}
              onChange={(event) => applyPreset(event.target.value, level)}
            >
              {QUALITY_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {quality ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Recommended range {NUM0.format(quality.low)}–{NUM0.format(quality.high)} kbps
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-level">
              Position in the range
            </label>
            <select
              id="sb-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={level}
              onChange={(event) => applyPreset(qualityId, event.target.value)}
            >
              {QUALITY_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-video">
              Video bitrate (kbps)
            </label>
            <input
              id="sb-video"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={videoKbps}
              onChange={(event) => setVideoKbps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-audio">
              Audio bitrate (kbps)
            </label>
            <select
              id="sb-audio"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audioKbps}
              onChange={(event) => setAudioKbps(event.target.value)}
            >
              {AUDIO_PRESETS.map((item) => (
                <option key={item.id} value={String(item.kbps)}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-overhead">
              Protocol overhead (%)
            </label>
            <input
              id="sb-overhead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={overheadPercent}
              onChange={(event) => setOverheadPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-headroom">
              Headroom multiplier
            </label>
            <input
              id="sb-headroom"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="0.1"
              value={headroom}
              onChange={(event) => setHeadroom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-upload">
              Your measured upload speed (Mbps)
            </label>
            <input
              id="sb-upload"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={uploadMbps}
              onChange={(event) => setUploadMbps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-hours">
              Stream length (hours)
            </label>
            <input
              id="sb-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended upload speed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.recommendedMbps)} Mbps`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see an estimate."
                : `Stream itself uses ${NUM.format(result.wireMbps)} Mbps on the wire`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy streaming bandwidth estimate"
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

        {!hasError ? (
          <p className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${statusTone}`}>
            {result.statusText}
          </p>
        ) : null}

        {!hasError && result.overThirdPartyLimit ? (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Note: {NUM0.format(result.videoKbps)} kbps is above the ~
            {NUM0.format(TWITCH_INGEST_LIMIT_KBPS)} kbps ingest ceiling most Twitch channels are
            given, although YouTube and custom RTMP servers accept more.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Speed-test figures are peak values; sustained upload over Wi-Fi or a shared connection is
        usually lower. Test on the same network and at the same time of day you plan to stream.
      </p>
    </main>
  );
}
