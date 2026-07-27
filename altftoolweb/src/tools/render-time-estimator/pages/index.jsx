"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import {
  EFFECT_TYPES,
  MACHINE_TIERS,
  OUTPUT_ENCODERS,
  RESOLUTION_PRESETS,
  addSecondsToClock,
  estimateRenderTime,
  formatDuration,
  toSeconds,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

const DEFAULT_COVERAGE = {
  titles: 20,
  transitions: 15,
  "basic-grade": 100,
  "speed-ramp": 0,
  "motion-blur": 0,
  stabiliser: 0,
  "noise-reduction": 0,
  composite: 0,
  "optical-flow": 0,
};

const DEFAULTS = {
  hours: "0",
  minutes: "10",
  seconds: "0",
  resolutionId: "1080p",
  fps: "30",
  encoderId: "h264-hw",
  machineId: "desktop-gpu",
  startTime: "18:00",
  coverage: DEFAULT_COVERAGE,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

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
  const [resolutionId, setResolutionId] = useState(DEFAULTS.resolutionId);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [encoderId, setEncoderId] = useState(DEFAULTS.encoderId);
  const [machineId, setMachineId] = useState(DEFAULTS.machineId);
  const [coverage, setCoverage] = useState(DEFAULTS.coverage);
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [copied, setCopied] = useState(false);

  const resolution =
    RESOLUTION_PRESETS.find((item) => item.id === resolutionId) || RESOLUTION_PRESETS[3];

  const timelineSeconds = toSeconds({
    hours: toNumber(hours),
    minutes: toNumber(minutes),
    seconds: toNumber(seconds),
  });

  const effects = useMemo(
    () =>
      EFFECT_TYPES.map((item) => ({
        id: item.id,
        coverage: (toNumber(coverage[item.id]) || 0) / 100,
      })),
    [coverage],
  );

  const result = useMemo(
    () =>
      estimateRenderTime({
        timelineSeconds,
        width: resolution.width,
        height: resolution.height,
        fps: toNumber(fps),
        encoderId,
        machineId,
        effects,
      }),
    [timelineSeconds, resolution, fps, encoderId, machineId, effects],
  );

  const finish = result.error ? null : addSecondsToClock(startTime, result.renderSeconds);

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      "Render Time Estimator",
      `Timeline: ${formatDuration(result.timelineSeconds)}`,
      `Output: ${resolution.label} at ${NUM2.format(toNumber(fps))} fps, ${result.encoder.label}`,
      `Hardware: ${result.machine.label}`,
      `Estimated export time: ${formatDuration(result.renderSeconds)}`,
      `Likely range: ${formatDuration(result.lowSeconds)} to ${formatDuration(result.highSeconds)}`,
      `Speed: ${NUM2.format(result.realtimeRatio)}x the timeline length`,
    ];
    if (finish) {
      lines.push(
        `Starting at ${startTime}, finishes about ${finish.time}${finish.dayOffset > 0 ? ` (+${finish.dayOffset} day)` : ""}`,
      );
    }
    return lines.join("\n");
  }, [result, resolution, fps, finish, startTime]);

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
    setResolutionId(DEFAULTS.resolutionId);
    setFps(DEFAULTS.fps);
    setEncoderId(DEFAULTS.encoderId);
    setMachineId(DEFAULTS.machineId);
    setCoverage(DEFAULTS.coverage);
    setStartTime(DEFAULTS.startTime);
    setCopied(false);
  };

  const setEffectCoverage = (id, value) => {
    setCoverage((current) => ({ ...current, [id]: value }));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Video production
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Render Time Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Export time scales with timeline length and pixel rate, then multiplies by encoder cost,
          effects load and machine speed. Set those five things and see how long to leave the render
          running — and what time it lands.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Timeline and output</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-hours">
              Hours
            </label>
            <input
              id="rt-hours"
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
            <label className={LABEL_CLASS} htmlFor="rt-minutes">
              Minutes
            </label>
            <input
              id="rt-minutes"
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
            <label className={LABEL_CLASS} htmlFor="rt-seconds">
              Seconds
            </label>
            <input
              id="rt-seconds"
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
            <label className={LABEL_CLASS} htmlFor="rt-resolution">
              Export resolution
            </label>
            <select
              id="rt-resolution"
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
            <label className={LABEL_CLASS} htmlFor="rt-fps">
              Frame rate (fps)
            </label>
            <input
              id="rt-fps"
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
            <label className={LABEL_CLASS} htmlFor="rt-encoder">
              Output codec
            </label>
            <select
              id="rt-encoder"
              className={`mt-2 ${INPUT_CLASS}`}
              value={encoderId}
              onChange={(event) => setEncoderId(event.target.value)}
            >
              {OUTPUT_ENCODERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-machine">
              Hardware class
            </label>
            <select
              id="rt-machine"
              className={`mt-2 ${INPUT_CLASS}`}
              value={machineId}
              onChange={(event) => setMachineId(event.target.value)}
            >
              {MACHINE_TIERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rt-start">
              Start the render at (24 h clock)
            </label>
            <input
              id="rt-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Effects load</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Set what fraction of the timeline each effect actually runs on. A grade on every clip costs
          far more than a stabiliser on two shots.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {EFFECT_TYPES.map((item) => (
            <div key={item.id}>
              <label className={LABEL_CLASS} htmlFor={`rt-fx-${item.id}`}>
                {item.label}
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id={`rt-fx-${item.id}`}
                  className="h-11 w-full accent-[var(--primary)]"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={coverage[item.id]}
                  onChange={(event) => setEffectCoverage(item.id, event.target.value)}
                />
                <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">
                  {coverage[item.id]}%
                </span>
              </div>
            </div>
          ))}
        </div>
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
              Estimated export time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : formatDuration(result.renderSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? DASH
                : `Likely ${formatDuration(result.lowSeconds)} to ${formatDuration(result.highSeconds)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the render time estimate"
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
            [
              "Finishes at",
              result.error || !finish
                ? DASH
                : `${finish.time}${finish.dayOffset > 0 ? ` (+${finish.dayOffset} day)` : ""}`,
            ],
            [
              "Speed versus realtime",
              result.error
                ? DASH
                : result.fasterThanRealtime
                  ? `${NUM2.format(1 / result.realtimeRatio)}x faster than realtime`
                  : `${NUM2.format(result.realtimeRatio)}x slower than realtime`,
            ],
            [
              "Timeline rendered per minute",
              result.error ? DASH : formatDuration(result.secondsOfTimelinePerMinute),
            ],
            ["Pixel rate versus 1080p30", result.error ? DASH : `${NUM2.format(result.pixelRateFactor)}x`],
            ["Encoder cost", result.error ? DASH : `${NUM2.format(result.encoder.cost)}x`],
            ["Effects multiplier", result.error ? DASH : `${NUM2.format(result.effectsFactor)}x`],
            ["Machine speed index", result.error ? DASH : `${NUM2.format(result.machine.index)}x`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && result.effectsBreakdown.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What the effects are costing</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Effect
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Coverage
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Added time
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.effectsBreakdown.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                      {PCT.format(row.coverage)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      +{NUM1.format((row.contribution / result.effectsFactor) * 100)}% of the render
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These multipliers are calibration figures, not a benchmark of your machine, which is why the
        answer is given as a range. Time a short export from your own project once and you will know
        how far your setup sits from the model — after that the estimate scales reliably.
      </p>
    </main>
  );
}
