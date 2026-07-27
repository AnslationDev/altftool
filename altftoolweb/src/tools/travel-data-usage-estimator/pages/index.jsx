"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Signal } from "lucide-react";

import {
  AUDIO_QUALITY_MB_PER_HOUR,
  PHOTO_FORMAT_MB,
  VIDEO_CAPTURE_MB_PER_MINUTE,
  VIDEO_QUALITY_MB_PER_HOUR,
  estimateTripData,
  formatData,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  days: "7",
  mapsHoursPerDay: "1",
  videoHoursPerDay: "1",
  videoQuality: "sd",
  audioHoursPerDay: "2",
  audioQuality: "high",
  socialHoursPerDay: "1",
  videoCallMinutesPerDay: "10",
  voiceCallMinutesPerDay: "15",
  photosPerDay: "30",
  photoFormat: "heic",
  captureMinutesPerDay: "2",
  captureQuality: "hd1080",
  baselineMbPerDay: "60",
  overheadPercent: "10",
  backupOnWifiOnly: false,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { type, value, checked } = event.target;
    setForm((prev) => ({ ...prev, [key]: type === "checkbox" ? checked : value }));
  };

  const result = useMemo(() => estimateTripData(form), [form]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Travel data estimate",
      `Trip length: ${result.days} days`,
      `Per day: ${formatData(result.perDayMb)}`,
      `Whole trip: ${formatData(result.tripMb)}`,
      `Suggested pack: ${result.recommendedGb} GB (includes ${result.bufferPercent}% head-room)`,
      "",
      ...result.breakdown
        .filter((line) => line.perDayMb > 0)
        .map((line) => `${line.label}: ${formatData(line.tripMb)} (${line.sharePercent}%)`),
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const numberField = (key, label, hint, extra = {}) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={`tdu-${key}`}>
        {label}
      </label>
      <input
        id={`tdu-${key}`}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={form[key]}
        onChange={setField(key)}
        {...extra}
      />
      {hint ? (
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p>
      ) : null}
    </div>
  );

  const selectField = (key, label, options) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={`tdu-${key}`}>
        {label}
      </label>
      <select
        id={`tdu-${key}`}
        className={`mt-2 ${INPUT_CLASS}`}
        value={form[key]}
        onChange={setField(key)}
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Signal className="h-4 w-4" aria-hidden="true" />
          Travel connectivity
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Travel Data Usage Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what you actually do on your phone each day away. The estimate sums the
          published per-hour and per-minute data rates for each activity, adds protocol
          overhead, and suggests a roaming or eSIM pack size with head-room.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Trip and daily habits
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("days", "Trip length (days)", "1 to 365", { min: "1" })}
          {numberField("mapsHoursPerDay", "Navigation (hours/day)", "5 MB per hour")}
          {numberField("videoHoursPerDay", "Video streaming (hours/day)")}
          {selectField(
            "videoQuality",
            "Video quality",
            Object.entries(VIDEO_QUALITY_MB_PER_HOUR).map(([key, item]) => [
              key,
              `${item.label} — ${item.rate} MB/h`,
            ]),
          )}
          {numberField("audioHoursPerDay", "Music / podcasts (hours/day)")}
          {selectField(
            "audioQuality",
            "Audio quality",
            Object.entries(AUDIO_QUALITY_MB_PER_HOUR).map(([key, item]) => [
              key,
              `${item.label} — ${item.rate} MB/h`,
            ]),
          )}
          {numberField("socialHoursPerDay", "Social feeds (hours/day)", "600 MB per hour with autoplay")}
          {numberField("videoCallMinutesPerDay", "Video calls (minutes/day)", "5 MB per minute")}
          {numberField("voiceCallMinutesPerDay", "Voice / VoIP calls (minutes/day)", "0.5 MB per minute")}
          {numberField("baselineMbPerDay", "Background apps (MB/day)", "Messaging, email, maps search, tickets")}
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Photo and video backup
        </h2>
        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"
          htmlFor="tdu-backupOnWifiOnly"
        >
          <input
            id="tdu-backupOnWifiOnly"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={form.backupOnWifiOnly}
            onChange={setField("backupOnWifiOnly")}
          />
          Back up on Wi-Fi only (excludes backup from the mobile-data estimate)
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("photosPerDay", "Photos taken per day")}
          {selectField(
            "photoFormat",
            "Photo format",
            Object.entries(PHOTO_FORMAT_MB).map(([key, item]) => [
              key,
              `${item.label} — ${item.size} MB each`,
            ]),
          )}
          {numberField("captureMinutesPerDay", "Video recorded per day (minutes)")}
          {selectField(
            "captureQuality",
            "Recording quality",
            Object.entries(VIDEO_CAPTURE_MB_PER_MINUTE).map(([key, item]) => [
              key,
              `${item.label} — ${item.size} MB/min`,
            ]),
          )}
          {numberField("overheadPercent", "Network overhead (%)", "Headers and retries on weak roaming signal")}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated data for the whole trip
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatData(result.tripMb)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Buy at least ${result.recommendedGb} GB — that adds ${result.bufferPercent}% head-room over the estimate.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the travel data estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs text-[var(--muted-foreground)]">Per day</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : formatData(result.perDayMb)}
            </dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs text-[var(--muted-foreground)]">Suggested pack</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : `${NUM.format(result.recommendedGb)} GB`}
            </dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs text-[var(--muted-foreground)]">
              Network overhead ({hasError ? DASH : `${result.overheadPercent}%`})
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : `${formatData(result.overheadMbPerDay)}/day`}
            </dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs text-[var(--muted-foreground)]">Biggest driver</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : (result.biggestDriverLabel ?? "None")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Where the data goes
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Activity
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Per day
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Whole trip
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.breakdown.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-medium">{line.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {line.detail}
                      </span>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatData(line.perDayMb)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatData(line.tripMb)}</td>
                    <td className="py-2 whitespace-nowrap text-[var(--muted-foreground)]">
                      {NUM.format(line.sharePercent)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Data is counted in decimal units, so 1 GB = 1000 MB — the same way operators sell
          roaming packs.
        </p>
      </section>
    </main>
  );
}
