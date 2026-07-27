"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Moon, RotateCcw } from "lucide-react";
import {
  CURFEW_PRESETS,
  DEFAULT_NIGHT_MODE_LEAD_MINUTES,
  DEFAULT_ONSET_MINUTES,
  SLEEP_CYCLE_MINUTES,
  buildCurfewSchedule,
  formatClock12,
  formatDuration,
} from "../lib";

const DEFAULTS = {
  wakeTime: "06:30",
  sleepHours: "8",
  onsetMinutes: String(DEFAULT_ONSET_MINUTES),
  curfewMinutes: "60",
  nightModeLead: String(DEFAULT_NIGHT_MODE_LEAD_MINUTES),
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
  const [wakeTime, setWakeTime] = useState(DEFAULTS.wakeTime);
  const [sleepHours, setSleepHours] = useState(DEFAULTS.sleepHours);
  const [onsetMinutes, setOnsetMinutes] = useState(DEFAULTS.onsetMinutes);
  const [curfewMinutes, setCurfewMinutes] = useState(DEFAULTS.curfewMinutes);
  const [nightModeLead, setNightModeLead] = useState(DEFAULTS.nightModeLead);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCurfewSchedule({
        wakeTime,
        sleepHours,
        onsetMinutes,
        curfewMinutes,
        nightModeLeadMinutes: nightModeLead,
      }),
    [wakeTime, sleepHours, onsetMinutes, curfewMinutes, nightModeLead],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Blue Light Curfew Calculator",
      `Alarm: ${formatClock12(result.wake)}`,
      `Warm / night mode from: ${formatClock12(result.nightModeAt)}`,
      `Screens down: ${formatClock12(result.screenCurfew)}`,
      `Lights out: ${formatClock12(result.lightsOut)}`,
      `Asleep by: ${formatClock12(result.asleepBy)}`,
      `Target sleep: ${formatDuration(result.sleepMinutes)} (${result.wholeCycles} full 90-minute cycles)`,
      `Screen-free stretch before sleep: ${formatDuration(result.screenFreeWindow)}`,
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
    setWakeTime(DEFAULTS.wakeTime);
    setSleepHours(DEFAULTS.sleepHours);
    setOnsetMinutes(DEFAULTS.onsetMinutes);
    setCurfewMinutes(DEFAULTS.curfewMinutes);
    setNightModeLead(DEFAULTS.nightModeLead);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Sleep scheduling
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Blue Light Curfew Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set your alarm and how much sleep you want. This works backwards through sleep-onset time
          and your chosen screen curfew to tell you when to dim, when to put the phone down and when
          the lights go out.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="blc-wake">
              Wake-up time
            </label>
            <input
              id="blc-wake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={wakeTime}
              onChange={(event) => setWakeTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="blc-sleep">
              Target sleep (hours)
            </label>
            <input
              id="blc-sleep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="3"
              max="14"
              step="0.25"
              value={sleepHours}
              onChange={(event) => setSleepHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="blc-onset">
              Time you take to fall asleep (minutes)
            </label>
            <input
              id="blc-onset"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="5"
              value={onsetMinutes}
              onChange={(event) => setOnsetMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="blc-curfew">
              Screen curfew before lights out (minutes)
            </label>
            <input
              id="blc-curfew"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="15"
              value={curfewMinutes}
              onChange={(event) => setCurfewMinutes(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="blc-nightmode">
              Extra warm / night-mode lead time (minutes)
            </label>
            <input
              id="blc-nightmode"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="15"
              value={nightModeLead}
              onChange={(event) => setNightModeLead(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CURFEW_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setCurfewMinutes(String(preset.minutes))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Screens down at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatClock12(result.screenCurfew)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see tonight's schedule."
                : `${formatDuration(result.screenFreeWindow)} of screen-free time before you fall asleep`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy tonight's blue light curfew schedule"
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
          {[
            ["Warm / night mode from", hasError ? DASH : formatClock12(result.nightModeAt)],
            ["Screens down (curfew starts)", hasError ? DASH : formatClock12(result.screenCurfew)],
            ["Lights out, in bed", hasError ? DASH : formatClock12(result.lightsOut)],
            ["Asleep by", hasError ? DASH : formatClock12(result.asleepBy)],
            ["Alarm", hasError ? DASH : formatClock12(result.wake)],
            ["Time in bed", hasError ? DASH : formatDuration(result.timeInBed)],
            [
              "Full 90-minute sleep cycles",
              hasError ? DASH : `${result.wholeCycles} (${result.cycles.toFixed(1)} in total)`,
            ],
            ["Cycle-aligned lights out", hasError ? DASH : formatClock12(result.cycleAlignedLightsOut)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Tonight, step by step</h2>
          <ol className="mt-3 space-y-3">
            {result.steps.map((step) => (
              <li key={step.id} className="flex gap-3">
                <span className="mt-0.5 w-20 shrink-0 text-sm font-semibold text-[var(--primary)]">
                  {formatClock12(step.at)}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{step.label}</span>
                  <span className="block text-sm text-[var(--muted-foreground)]">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Sleep need varies between people and a {SLEEP_CYCLE_MINUTES}-minute cycle
        is an average, not a rule. Persistent trouble falling or staying asleep is worth discussing
        with a doctor or sleep specialist.
      </p>
    </main>
  );
}
