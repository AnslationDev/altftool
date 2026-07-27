"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HardDrive, RotateCcw } from "lucide-react";
import { CODECS, RESOLUTION_PRESETS, computeFootageStorage } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DASH = "—";
const num = (value, fmt = NUM) => (Number.isFinite(value) ? fmt.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  codecId: "prores-hq",
  width: "3840",
  height: "2160",
  fps: "25",
  customMbps: "100",
  audioChannels: "2",
  audioBitDepth: "24",
  audioSampleRateHz: "48000",
  hours: "3",
  cardGb: "256",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [codecId, setCodecId] = useState(DEFAULTS.codecId);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [customMbps, setCustomMbps] = useState(DEFAULTS.customMbps);
  const [audioChannels, setAudioChannels] = useState(DEFAULTS.audioChannels);
  const [audioBitDepth, setAudioBitDepth] = useState(DEFAULTS.audioBitDepth);
  const [audioSampleRateHz, setAudioSampleRateHz] = useState(DEFAULTS.audioSampleRateHz);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [cardGb, setCardGb] = useState(DEFAULTS.cardGb);
  const [copied, setCopied] = useState(false);

  const selectedCodec = CODECS.find((codec) => codec.id === codecId);
  const isCustom = selectedCodec?.kind === "custom";
  const scalesWithFrame = selectedCodec?.kind === "perPixel";

  const result = useMemo(
    () =>
      computeFootageStorage({
        codecId,
        width: toNumber(width),
        height: toNumber(height),
        fps: toNumber(fps),
        customMbps: toNumber(customMbps),
        audioChannels: toNumber(audioChannels),
        audioBitDepth: toNumber(audioBitDepth),
        audioSampleRateHz: toNumber(audioSampleRateHz),
        hours: toNumber(hours),
        cardGb: toNumber(cardGb),
      }),
    [
      codecId,
      width,
      height,
      fps,
      customMbps,
      audioChannels,
      audioBitDepth,
      audioSampleRateHz,
      hours,
      cardGb,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Footage storage estimate",
      `Codec: ${result.codecLabel}`,
      `Frame: ${toNumber(width)} x ${toNumber(height)} at ${toNumber(fps)} fps`,
      `Video data rate: ${NUM.format(result.videoMbps)} Mbps`,
      `Audio data rate: ${NUM.format(result.audioMbps)} Mbps`,
      `Storage per hour: ${NUM.format(result.gbPerHour)} GB (${NUM.format(result.gibPerHour)} GiB)`,
      `Total for ${toNumber(hours)} h: ${NUM.format(result.gbTotal)} GB`,
      result.minutesPerCard
        ? `Runtime on a ${toNumber(cardGb)} GB card: ${NUM.format(result.minutesPerCard)} minutes`
        : "",
      result.cardsNeeded ? `Cards needed: ${result.cardsNeeded}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, width, height, fps, hours, cardGb]);

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
    setCodecId(DEFAULTS.codecId);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setFps(DEFAULTS.fps);
    setCustomMbps(DEFAULTS.customMbps);
    setAudioChannels(DEFAULTS.audioChannels);
    setAudioBitDepth(DEFAULTS.audioBitDepth);
    setAudioSampleRateHz(DEFAULTS.audioSampleRateHz);
    setHours(DEFAULTS.hours);
    setCardGb(DEFAULTS.cardGb);
    setCopied(false);
  };

  const rows = [
    ["Video data rate", hasError ? DASH : `${num(result.videoMbps)} Mbps`],
    ["Audio data rate", hasError ? DASH : `${num(result.audioMbps)} Mbps`],
    ["Combined data rate", hasError ? DASH : `${num(result.totalMbps)} Mbps`],
    ["Per minute", hasError ? DASH : `${num(result.mbPerMinute)} MB`],
    ["Per hour (binary, as the OS shows)", hasError ? DASH : `${num(result.gibPerHour)} GiB`],
    ["Total for the shoot", hasError ? DASH : `${num(result.gbTotal)} GB`],
    [
      "Runtime on one card",
      hasError || !result.minutesPerCard ? DASH : `${num(result.minutesPerCard)} minutes`,
    ],
    ["Cards needed", hasError || !result.cardsNeeded ? DASH : NUM0.format(result.cardsNeeded)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HardDrive className="h-4 w-4" aria-hidden="true" />
          Media planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Footage Storage Per Hour Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a codec, resolution and frame rate to see the data rate, gigabytes per hour and how
          many cards or drives a shoot will fill.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fs-codec">
              Codec / recording format
            </label>
            <select
              id="fs-codec"
              className={`mt-2 ${INPUT_CLASS}`}
              value={codecId}
              onChange={(event) => setCodecId(event.target.value)}
            >
              {CODECS.map((codec) => (
                <option key={codec.id} value={codec.id}>
                  {codec.label}
                </option>
              ))}
            </select>
            {selectedCodec ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {selectedCodec.note}
                {selectedCodec.kind === "fixed"
                  ? " · fixed bitrate, resolution and frame rate do not change it"
                  : ""}
                {scalesWithFrame ? " · data rate scales with pixels per second" : ""}
              </p>
            ) : null}
          </div>

          {isCustom ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="fs-custom">
                Custom video bitrate (Mbps)
              </label>
              <input
                id="fs-custom"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={customMbps}
                onChange={(event) => setCustomMbps(event.target.value)}
              />
            </div>
          ) : null}

          <div>
            <label className={LABEL_CLASS} htmlFor="fs-width">
              Frame width (px)
            </label>
            <input
              id="fs-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-height">
              Frame height (px)
            </label>
            <input
              id="fs-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-fps">
              Frame rate (fps)
            </label>
            <input
              id="fs-fps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={fps}
              onChange={(event) => setFps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-hours">
              Hours recorded
            </label>
            <input
              id="fs-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-card">
              Card / drive size (GB)
            </label>
            <input
              id="fs-card"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={cardGb}
              onChange={(event) => setCardGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-channels">
              Audio channels
            </label>
            <input
              id="fs-channels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={audioChannels}
              onChange={(event) => setAudioChannels(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-depth">
              Audio bit depth
            </label>
            <select
              id="fs-depth"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audioBitDepth}
              onChange={(event) => setAudioBitDepth(event.target.value)}
            >
              <option value="16">16-bit</option>
              <option value="24">24-bit</option>
              <option value="32">32-bit float</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-rate">
              Audio sample rate
            </label>
            <select
              id="fs-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audioSampleRateHz}
              onChange={(event) => setAudioSampleRateHz(event.target.value)}
            >
              <option value="44100">44.1 kHz</option>
              <option value="48000">48 kHz</option>
              <option value="96000">96 kHz</option>
              <option value="192000">192 kHz</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {RESOLUTION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setWidth(String(preset.width));
                setHeight(String(preset.height));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
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
              Storage per hour
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${num(result.gbPerHour)} GB`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see an estimate."
                : `${result.codecLabel} · ${num(result.megapixels)} MP per frame`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy footage storage estimate"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Card and drive capacities are decimal (1 GB = 1,000,000,000 bytes), which is why an OS shows
        less space than the label. Long-GOP camera formats vary with scene detail, so add roughly 20%
        headroom before a shoot.
      </p>
    </main>
  );
}
