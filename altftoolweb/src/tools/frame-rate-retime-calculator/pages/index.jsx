"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Film, RotateCcw } from "lucide-react";

import {
  COMMON_FRAME_RATES,
  conformFootage,
  formatDuration,
  requiredCaptureFps,
  retimeToSpeed,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  mode: "conform",
  sourceFps: "60",
  timelineFps: "24",
  duration: "10",
  targetSpeed: "40",
};

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    const shared = {
      sourceFps: Number(form.sourceFps),
      timelineFps: Number(form.timelineFps),
      sourceDurationSeconds: Number(form.duration),
    };
    return form.mode === "conform"
      ? conformFootage(shared)
      : retimeToSpeed({ ...shared, targetSpeedPercent: Number(form.targetSpeed) });
  }, [form]);

  const captureFps = useMemo(
    () => requiredCaptureFps({ timelineFps: Number(form.timelineFps), targetSpeedPercent: Number(form.targetSpeed) }),
    [form.timelineFps, form.targetSpeed],
  );

  const failed = Boolean(result.error);
  const dash = "—";

  const headline = failed
    ? dash
    : form.mode === "conform"
      ? `${NUM.format(result.speedPercent)}%`
      : formatDuration(result.newDuration);

  const copyResult = async () => {
    if (failed) return;
    const lines =
      form.mode === "conform"
        ? [
            "Frame rate conform",
            `Source: ${form.sourceFps} fps, ${formatDuration(result.sourceDuration)}`,
            `Timeline: ${form.timelineFps} fps`,
            `Speed: ${NUM.format(result.speedPercent)}%`,
            `New duration: ${formatDuration(result.newDuration)} (${result.newTimecode})`,
            `Frames: ${INT.format(result.frameCount)} (unchanged)`,
            `Audio pitch shift if conformed: ${NUM.format(result.pitchSemitones)} semitones`,
          ]
        : [
            "Frame rate retime",
            `Source: ${form.sourceFps} fps, ${formatDuration(result.sourceDuration)}`,
            `Timeline: ${form.timelineFps} fps at ${NUM.format(result.speedPercent)}% speed`,
            `New duration: ${formatDuration(result.newDuration)} (${result.newTimecode})`,
            `Frames recorded: ${INT.format(result.sourceFrames)}, frames needed: ${INT.format(result.outputFrames)}`,
            `Frames to create: ${INT.format(result.framesCreated)}`,
            `Unique frames per second on screen: ${NUM.format(result.effectiveUniqueFps)}`,
          ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
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

  const rows = failed
    ? []
    : form.mode === "conform"
      ? [
          ["Speed after conform", `${NUM3.format(result.speedPercent)}%`],
          ["Duration multiplier", `${NUM3.format(result.durationMultiplier)}×`],
          ["New duration", `${formatDuration(result.newDuration)} · ${result.newTimecode}`],
          ["Original duration", `${formatDuration(result.sourceDuration)} · ${result.sourceTimecode}`],
          ["Frames in the clip", `${INT.format(result.frameCount)} (none created or dropped)`],
          ["Audio pitch shift if conformed", `${NUM.format(result.pitchSemitones)} semitones`],
        ]
      : [
          ["New duration", `${formatDuration(result.newDuration)} · ${result.newTimecode}`],
          ["Original duration", `${formatDuration(result.sourceDuration)} · ${result.sourceTimecode}`],
          ["Frames recorded", INT.format(result.sourceFrames)],
          ["Frames the timeline needs", INT.format(result.outputFrames)],
          ["Frames to duplicate or interpolate", INT.format(result.framesCreated)],
          ["Unique frames per second on screen", `${NUM.format(result.effectiveUniqueFps)} fps`],
          ["Audio pitch shift if audio follows", `${NUM.format(result.pitchSemitones)} semitones`],
        ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Film className="h-4 w-4" aria-hidden="true" />
          Video speed
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Frame Rate Retime Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Conform a clip to a different timeline rate and see the exact speed percentage, new
          duration, timecode and frame count — or set a target speed and find out how many frames the
          software will have to invent.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className={LABEL_CLASS}>What are you doing?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["conform", "Conform (interpret footage)"],
              ["retime", "Retime to a target speed"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setField("mode", id)}
                aria-pressed={form.mode === id}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                  form.mode === id
                    ? "border-[var(--primary)] text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-source">
              Source frame rate (fps)
            </label>
            <input
              id="fr-source"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              list="fr-rates"
              value={form.sourceFps}
              onChange={(e) => setField("sourceFps", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-timeline">
              Timeline frame rate (fps)
            </label>
            <input
              id="fr-timeline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              list="fr-rates"
              value={form.timelineFps}
              onChange={(e) => setField("timelineFps", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-duration">
              Clip length (seconds)
            </label>
            <input
              id="fr-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.duration}
              onChange={(e) => setField("duration", e.target.value)}
            />
          </div>
          {form.mode === "retime" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="fr-speed">
                Target speed (%)
              </label>
              <input
                id="fr-speed"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={form.targetSpeed}
                onChange={(e) => setField("targetSpeed", e.target.value)}
              />
            </div>
          ) : null}
        </div>

        <datalist id="fr-rates">
          {COMMON_FRAME_RATES.map((rate) => (
            <option key={rate.fps} value={rate.fps}>
              {rate.label}
            </option>
          ))}
        </datalist>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["60 → 24", { sourceFps: "60", timelineFps: "24" }],
            ["120 → 24", { sourceFps: "120", timelineFps: "24" }],
            ["240 → 30", { sourceFps: "240", timelineFps: "30" }],
            ["24 → 23.976", { sourceFps: "24", timelineFps: "23.976" }],
            ["50 → 25", { sourceFps: "50", timelineFps: "25" }],
          ].map(([label, patch]) => (
            <button
              key={label}
              type="button"
              onClick={() => setForm((current) => ({ ...current, ...patch }))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {failed ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {form.mode === "conform" ? "Playback speed" : "New duration"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? dash : `${form.sourceFps} fps footage on a ${form.timelineFps} fps timeline`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the retime result" className={GHOST_BTN} disabled={failed}>
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
          {(rows.length ? rows : [["Result", dash]]).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.notes.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {form.mode === "retime" && captureFps ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">To get this speed cleanly</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Shooting at <strong className="text-[var(--foreground)]">{NUM.format(captureFps)} fps</strong> and conforming
            to a {form.timelineFps} fps timeline gives {NUM.format(Number(form.targetSpeed))}% speed with no invented
            frames, because timeline rate ÷ speed = required capture rate.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timecode shown is non-drop-frame using the rounded nominal rate, which is what editors display
        for 23.976 and 29.97 material; on those rates the timecode clock drifts from wall clock by
        about 3.6 seconds an hour.
      </p>
    </main>
  );
}
